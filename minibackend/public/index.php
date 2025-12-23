<?php
// Configuración de headers CORS - Permitir múltiples orígenes
$allowedOrigins = [
    'http://localhost:5173',        // Desarrollo local Vite
    'http://localhost:3000',        // Desarrollo local alternativo
    'http://localhost:9000',        // MiniBACKEND desarrollo
    'https://backend.patchamama.com', // Producción
    'http://backend.patchamama.com',  // Producción (HTTP)
    'https://logistiq.patchamama.com', // Frontend producción
    'http://logistiq.patchamama.com',  // Frontend producción (HTTP)
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    // Por defecto, permitir localhost para desarrollo
    if (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false) {
        header('Access-Control-Allow-Origin: ' . $origin);
    } else {
        // Para otros orígenes, permitir HTTPS backends
        header('Access-Control-Allow-Origin: https://backend.patchamama.com');
    }
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');
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
$method = $_SERVER['REQUEST_METHOD'];

// Detectar la ruta base considerando subdirectorios
// En Plesk: /MVP-LogistiQ/minibackend/public/api/...
// En local: /api/...
// En desarrollo: /api/...
$scriptName = $_SERVER['SCRIPT_NAME']; // /MVP-LogistiQ/minibackend/public/index.php
$scriptDir = dirname($scriptName); // /MVP-LogistiQ/minibackend/public

// Obtener la ruta relativa desde el directorio público
$route = substr($requestUri, strlen($scriptDir));

// Si la ruta no comienza con /, agregar
if (empty($route) || $route[0] !== '/') {
    $route = '/' . $route;
}

// Remover /api si está incluido (para compatibilidad con ambos formatos)
if (strpos($route, '/api/') === 0) {
    $route = substr($route, 4); // Remover '/api'
} else if ($route === '/api') {
    $route = '';
}

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
    case $method === 'POST' && $route === '/ocr/process':
        require HANDLERS_PATH . '/ocr_process.php';
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
