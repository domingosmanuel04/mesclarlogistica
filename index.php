<?php
// Bulletproof Socket Proxy for Next.js / PM2 on Shared Hosting
ini_set('display_errors', 0);
error_reporting(E_ALL);

$target_ports = array(3000, 3020, 3001, 8080);
$content = false;
$status_code = 503;

foreach ($target_ports as $port) {
    $fp = @fsockopen("127.0.0.1", $port, $errno, $errstr, 2);
    if ($fp) {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        
        $out = "$method $uri HTTP/1.1\r\n";
        $out .= "Host: " . ($_SERVER['HTTP_HOST'] ?? 'localhost') . "\r\n";
        $out .= "Connection: Close\r\n";
        $out .= "X-Forwarded-For: " . ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1') . "\r\n";
        $out .= "X-Forwarded-Proto: " . ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http') . "\r\n";
        
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $out .= "Authorization: " . $_SERVER['HTTP_AUTHORIZATION'] . "\r\n";
        }
        if (isset($_SERVER['HTTP_USER_AGENT'])) {
            $out .= "User-Agent: " . $_SERVER['HTTP_USER_AGENT'] . "\r\n";
        }
        if (isset($_SERVER['HTTP_ACCEPT'])) {
            $out .= "Accept: " . $_SERVER['HTTP_ACCEPT'] . "\r\n";
        }
        if (isset($_SERVER['HTTP_COOKIE'])) {
            $out .= "Cookie: " . $_SERVER['HTTP_COOKIE'] . "\r\n";
        }
        
        $body = @file_get_contents('php://input');
        if (!empty($body)) {
            $out .= "Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'application/json') . "\r\n";
            $out .= "Content-Length: " . strlen($body) . "\r\n\r\n";
            $out .= $body;
        } else {
            $out .= "\r\n";
        }
        
        fwrite($fp, $out);
        $raw_response = '';
        while (!feof($fp)) {
            $raw_response .= fgets($fp, 8192);
        }
        fclose($fp);

        if (!empty($raw_response)) {
            $parts = explode("\r\n\r\n", $raw_response, 2);
            $raw_headers = $parts[0] ?? '';
            $content = $parts[1] ?? '';

            if (preg_match('#HTTP/1\.[01]\s+(\d+)#', $raw_headers, $matches)) {
                $status_code = (int)$matches[1];
            } else {
                $status_code = 200;
            }

            http_response_code($status_code);
            foreach (explode("\r\n", $raw_headers) as $h) {
                if (preg_match('/^(Content-Type|Set-Cookie|Location|Cache-Control|X-):/i', $h)) {
                    header($h, false);
                }
            }
            echo $content;
            exit;
        }
    }
}

http_response_code(503);
header("Content-Type: text/html; charset=UTF-8");
header("Retry-After: 5");
?>
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content="4">
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
