<?php
// Reverse Proxy Fallback for Next.js (PM2 process on port 3000 / 3020)
$ports = array('3000', '3020', '3001');
$target_port = getenv('PORT') ?: '3000';
$response = false;
$http_code = 502;
$header_text = '';
$body = '';

foreach (array_unique(array_merge(array($target_port), $ports)) as $port) {
    $ch = curl_init();
    $url = 'http://127.0.0.1:' . $port . $_SERVER['REQUEST_URI'];
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);

    $headers = array();
    if (function_exists('getallheaders')) {
        foreach (getallheaders() as $name => $value) {
            if (strtolower($name) !== 'host') {
                $headers[] = "$name: $value";
            }
        }
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if (in_array($_SERVER['REQUEST_METHOD'], array('POST', 'PUT', 'PATCH', 'DELETE'))) {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
    }

    $res = curl_exec($ch);
    if ($res !== false) {
        $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $header_text = substr($res, 0, $header_size);
        $body = substr($res, $header_size);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $response = true;
        break;
    }
    curl_close($ch);
}

if (!$response) {
    http_response_code(502);
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mesclar Logística</title></head>';
    echo '<body style="font-family:sans-serif;text-align:center;padding:50px;background:#f9f9f9;">';
    echo '<h2>502 Bad Gateway - Servidor da Aplicação Offline</h2>';
    echo '<p>O serviço Node.js / Next.js não está a responder nas portas locais (3000, 3020). Por favor verifique o PM2 no servidor.</p>';
    echo '</body></html>';
    exit;
}

http_response_code($http_code);
$header_lines = explode("\r\n", $header_text);
foreach ($header_lines as $i => $header) {
    if ($i === 0) continue;
    if (!empty($header)) {
        header($header);
    }
}
echo $body;
