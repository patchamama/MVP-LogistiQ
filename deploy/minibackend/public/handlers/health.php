<?php
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

respond([
    'status' => 'ok',
    'timestamp' => date('c'),
    'storage_path' => STORAGE_PATH,
    'entries_count' => $entriesCount,
    'manufacturers_count' => $manufacturersCount,
    'php_version' => phpversion()
], 200);
