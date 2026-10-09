<?php
// Bulletproof Socket Proxy for Next.js / PM2 on Shared Hosting
ini_set('display_errors', 0);
error_reporting(E_ALL);

$target_ports = array(3000, 3020, 3001, 8080, 3002, 3003);
$content = false;

function unchunk_http_body($body) {
    if (function_exists('http_chunked_decode')) {
        $decoded = @http_chunked_decode($body);
        if ($decoded !== false) return $decoded;
    }
    $parts = [];
    $offset = 0;
    while ($offset < strlen($body)) {
        $pos = strpos($body, "\r\n", $offset);
        if ($pos === false) break;
        $hex = trim(substr($body, $offset, $pos - $offset));
        $len = hexdec($hex);
        if ($len === 0) break;
        $offset = $pos + 2;
        $parts[] = substr($body, $offset, $len);
        $offset += $len + 2;
    }
    return !empty($parts) ? implode('', $parts) : $body;
}

$is_https = (
    (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off' && $_SERVER['HTTPS'] !== '0') ||
    (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') ||
    (!empty($_SERVER['HTTP_X_FORWARDED_SSL']) && strtolower($_SERVER['HTTP_X_FORWARDED_SSL']) === 'on') ||
    (!empty($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443) ||
    (!empty($_SERVER['REQUEST_SCHEME']) && strtolower($_SERVER['REQUEST_SCHEME']) === 'https') ||
    (!empty($_SERVER['HTTP_CF_VISITOR']) && strpos($_SERVER['HTTP_CF_VISITOR'], 'https') !== false)
);
$proto = $is_https ? 'https' : 'http';

// ---- Locate app dir (for tmp/active-port and the watchdog) ----
$app_dir = null;
foreach (array('/mnt/home103/mesclarl/mesclar', '/home/mesclarl/mesclar', dirname(__DIR__) . '/mesclar', __DIR__ . '/mesclar', __DIR__) as $d) {
    if (@is_file($d . '/scripts/start-server.sh')) { $app_dir = $d; break; }
}

// ---- Upstream list: active port first (blue/green), then fallbacks ----
$active_port = $app_dir ? (int)@trim(@file_get_contents($app_dir . '/tmp/active-port')) : 0;
if ($active_port > 0) {
    $target_ports = array_values(array_unique(array_merge(array($active_port), $target_ports)));
}

// Build the upstream request once (php://input can only be read once)
$uri = $_SERVER['REQUEST_URI'] ?? '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$out = "$method $uri HTTP/1.1\r\n";
$out .= "Host: " . ($_SERVER['HTTP_HOST'] ?? 'mesclarlogistica.com') . "\r\n";
$out .= "Connection: Close\r\n";
$out .= "X-Forwarded-For: " . ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1') . "\r\n";
$out .= "X-Forwarded-Host: " . ($_SERVER['HTTP_HOST'] ?? 'mesclarlogistica.com') . "\r\n";
$out .= "X-Forwarded-Proto: $proto\r\n";
$out .= "X-Forwarded-Ssl: " . ($is_https ? 'on' : 'off') . "\r\n";
$out .= "X-Url-Scheme: $proto\r\n";
foreach (array('HTTP_AUTHORIZATION' => 'Authorization', 'HTTP_USER_AGENT' => 'User-Agent', 'HTTP_ACCEPT' => 'Accept', 'HTTP_COOKIE' => 'Cookie', 'HTTP_ACCEPT_LANGUAGE' => 'Accept-Language', 'HTTP_REFERER' => 'Referer', 'HTTP_ORIGIN' => 'Origin') as $k => $name) {
    if (isset($_SERVER[$k])) { $out .= "$name: " . $_SERVER[$k] . "\r\n"; }
}
$body = @file_get_contents('php://input');
if ($body !== false && $body !== '') {
    $out .= "Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'application/json') . "\r\n";
    $out .= "Content-Length: " . strlen($body) . "\r\n\r\n" . $body;
} else {
    $out .= "\r\n";
}
$is_idempotent = in_array($method, array('GET', 'HEAD', 'OPTIONS'), true);

// Returns array(status, headers, body) or null if the port is unreachable
function proxy_try_port($port, $out) {
    $fp = @fsockopen('127.0.0.1', $port, $errno, $errstr, 1);
    if (!$fp) return null;
    stream_set_timeout($fp, 60);
    fwrite($fp, $out);
    $raw = '';
    while (!feof($fp)) {
        $chunk = fread($fp, 65536);
        if ($chunk === false) break;
        $raw .= $chunk;
        $meta = stream_get_meta_data($fp);
        if (!empty($meta['timed_out'])) break;
    }
    fclose($fp);
    if ($raw === '') return null;
    $parts = explode("\r\n\r\n", $raw, 2);
    $headers = $parts[0];
    $content = $parts[1] ?? '';
    $status = preg_match('#HTTP/1\.[01]\s+(\d+)#', $headers, $m) ? (int)$m[1] : 200;
    if (preg_match('/Transfer-Encoding:\s*chunked/i', $headers)) {
        $content = unchunk_http_body($content);
    }
    return array($status, $headers, $content);
}

function proxy_emit($resp) {
    http_response_code($resp[0]);
    foreach (explode("\r\n", $resp[1]) as $h) {
        if (preg_match('/^(Content-Type|Set-Cookie|Location|Cache-Control|Content-Disposition|ETag|Last-Modified|Vary|X-[A-Za-z-]+):/i', $h)) {
            header($h, false);
        }
    }
    echo $resp[2];
    exit;
}

// ---- proxy_next_upstream error timeout http_502 http_503 + retry with backoff ----
// Total wait ~8s so quick restarts/switches are invisible to visitors.
$backoff = array(0, 250000, 500000, 1000000, 2000000, 4000000);
$last_error_resp = null;
$watchdog_kicked = false;
foreach ($backoff as $attempt => $sleep_us) {
    if ($sleep_us) usleep($sleep_us);
    foreach ($target_ports as $port) {
        $resp = proxy_try_port($port, $out);
        if ($resp === null) continue;                       // error/timeout -> next upstream
        if (in_array($resp[0], array(502, 504), true) || ($resp[0] === 503 && $is_idempotent && strpos($uri, '/api/health') !== 0)) {
            $last_error_resp = $resp;                       // http_502/503/504 -> next upstream
            continue;
        }
        proxy_emit($resp);
    }
    if (!$is_idempotent && $attempt >= 3) break;            // don't hold POSTs too long
    // Node unreachable: kick the watchdog once (max once per 60s globally)
    if (!$watchdog_kicked && $attempt === 1 && $app_dir) {
        $watchdog_kicked = true;
        $stamp = $app_dir . '/tmp/php-autostart.stamp';
        if (!@is_file($stamp) || (time() - @filemtime($stamp)) > 60) {
            @touch($stamp);
            $cmd = '/bin/bash ' . escapeshellarg($app_dir . '/scripts/start-server.sh') . ' > /dev/null 2>&1 &';
            if (function_exists('exec')) { @exec($cmd); }
            elseif (function_exists('shell_exec')) { @shell_exec($cmd); }
            elseif (function_exists('proc_open')) { $p = @proc_open($cmd, array(), $pipes); if (is_resource($p)) { @proc_close($p); } }
        }
    }
}
if ($last_error_resp !== null) {
    proxy_emit($last_error_resp);                           // app is up but erroring: show the real response
}

// API clients get a proper 503 + Retry-After instead of HTML
if (strpos($uri, '/api/') === 0) {
    http_response_code(503);
    header('Retry-After: 5');
    header('Content-Type: application/json');
    echo '{"error":"service_restarting","retryAfter":5}';
    exit;
}
// Set status to 200 to prevent LiteSpeed/cPanel WebServer from hijacking with black 503 error document
http_response_code(200);
header("Content-Type: text/html; charset=UTF-8");
header("Cache-Control: no-cache, no-store, must-revalidate");
?>
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="3">
    <title>Mesclar Logística | Servidor em Inicialização</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #071324; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
        .card { background: #0e223f; padding: 40px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); max-width: 480px; border: 1px solid #1e3a5f; }
        .logo { font-size: 13px; font-weight: 800; letter-spacing: 0.2em; color: #d97706; text-transform: uppercase; margin-bottom: 16px; }
        h1 { color: #ffffff; font-size: 22px; margin-bottom: 12px; font-weight: 700; }
        p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
        .btn { display: inline-block; margin-top: 24px; padding: 12px 24px; background: linear-gradient(135deg, #d97706, #b45309); color: #fff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo">Mesclar Logística</div>
        <h1>Servidor em Inicialização</h1>
        <p>A aplicação está a ser atualizada ou iniciada no servidor. Esta página será recarregada automaticamente dentro de instantes.</p>
        <a href="/" class="btn" onclick="location.reload(); return false;">Recarregar Agora</a>
    </div>
</body>
</html>
