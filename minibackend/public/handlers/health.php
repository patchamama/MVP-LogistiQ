<?php
// Cargar configuración del MiniBACKEND
$config = null;
$configPath = BASE_PATH . '/config.php';
if (file_exists($configPath)) {
    $config = require $configPath;
} else {
    // Si config.php no existe, usar configuración por defecto
    $config = [
        'encryption' => ['enabled' => false, 'key' => ''],
        'ocr' => [
            'engines' => [
                'tesseract' => ['enabled' => true, 'requires_key' => false],
                'easyocr' => ['enabled' => true, 'requires_key' => false],
            ]
        ],
        'app' => ['version' => '0.8.0', 'name' => 'LogistiQ MiniBACKEND']
    ];
}

// Cargar datos para contar entradas y fabricantes
$entriesFile = DATA_PATH . '/entries.json';
$manufacturersFile = DATA_PATH . '/manufacturers.json';

$entriesCount = 0;
$manufacturersCount = 0;

if (file_exists($entriesFile)) {
    $entriesData = json_decode(file_get_contents($entriesFile), true);
    $entriesCount = count($entriesData['entries'] ?? []);
}

if (file_exists($manufacturersFile)) {
    $mfgData = json_decode(file_get_contents($manufacturersFile), true);
    $manufacturersCount = count($mfgData['manufacturers'] ?? []);
}

// Construir lista de OCR engines disponibles
$ocrEngines = [];
if (isset($config['ocr']['engines'])) {
    foreach ($config['ocr']['engines'] as $engineName => $engineConfig) {
        if ($engineConfig['enabled']) {
            $engineData = [
                'name' => $engineName,
                'requires_key' => $engineConfig['requires_key'],
            ];

            // Si requiere key Y está configurada, incluir key encriptada
            if ($engineConfig['requires_key'] && !empty($engineConfig['api_key_encrypted'])) {
                $engineData['api_key_encrypted'] = $engineConfig['api_key_encrypted'];
            }

            $ocrEngines[] = $engineData;
        }
    }
}

$response = [
    'status' => 'ok',
    'timestamp' => date('c'),
    'version' => $config['app']['version'] ?? '0.8.0',
    'storage_path' => STORAGE_PATH,
    'entries_count' => $entriesCount,
    'manufacturers_count' => $manufacturersCount,
    'php_version' => phpversion(),
    'ocr_engines' => $ocrEngines,
];

respond($response, 200);
