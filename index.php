<?php
// Reverse Proxy Fallback for Next.js (PM2 process on port 3000 / PORT)
$target_port = getenv('PORT') ?: '3000';
$ch = curl_init();
$url = 'http://127.0.0.1:' . $target_port . $_SERVER['REQUEST_URI'];
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);

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

$response = curl_exec($ch);
if ($response === false) {
    http_response_code(502);
    header('Content-Type: text/html; charset=utf-8');
    echo '<h2>502 Bad Gateway - Servidor da Aplicação Offline</h2>';
    echo '<p>O serviço Node.js / Next.js não está a responder na porta ' . htmlspecialchars($target_port) . '. Por favor verifique o PM2.</p>';
    curl_close($ch);
    exit;
}

$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$header_text = substr($response, 0, $header_size);
$body = substr($response, $header_size);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

http_response_code($http_code);
$header_lines = explode("\r\n", $header_text);
foreach ($header_lines as $i => $header) {
    if ($i === 0) continue;
    if (!empty($header)) {
        header($header);
    }
}
echo $body;
