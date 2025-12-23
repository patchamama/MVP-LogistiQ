<?php
// Configuración de headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Manejar peticiones OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de rutas y directorios
define('BASE_PATH', __DIR__ . '/..');
define('DATA_PATH', BASE_PATH . '/data');
define('STORAGE_PATH', BASE_PATH . '/storage/almacen_imagenes');
define('HANDLERS_PATH', __DIR__ . '/handlers');

// Asegurar que existen los directorios
if (!is_dir(DATA_PATH)) {
    mkdir(DATA_PATH, 0755, true);
}
if (!is_dir(STORAGE_PATH)) {
    mkdir(STORAGE_PATH, 0755, true);
}

// Inicializar archivos JSON si no existen
initializeJsonFiles();

// Parsear URL y método
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$basePath = '/api';
$route = str_replace($basePath, '', $requestUri);
$method = $_SERVER['REQUEST_METHOD'];

// Router simple
switch (true) {
    case $method === 'POST' && $route === '/entry':
        require HANDLERS_PATH . '/create_entry.php';
        break;
    case $method === 'GET' && $route === '/check-reference':
        require HANDLERS_PATH . '/check_reference.php';
        break;
    case $method === 'GET' && $route === '/manufacturers':
        require HANDLERS_PATH . '/get_manufacturers.php';
        break;
    case $method === 'GET' && $route === '/entries':
        require HANDLERS_PATH . '/get_entries.php';
        break;
    case $method === 'GET' && $route === '/health':
        require HANDLERS_PATH . '/health.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint no encontrado']);
        break;
}

/**
 * Inicializar archivos JSON si no existen
 */
function initializeJsonFiles() {
    $entriesFile = DATA_PATH . '/entries.json';
    $manufacturersFile = DATA_PATH . '/manufacturers.json';

    if (!file_exists($entriesFile)) {
        file_put_contents($entriesFile, json_encode(['entries' => []], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }

    if (!file_exists($manufacturersFile)) {
        file_put_contents($manufacturersFile, json_encode(['manufacturers' => []], JSON_PRETTY_PRINT));
    }
}

/**
 * Responder con JSON
 */
function respond($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit();
}
