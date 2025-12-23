<?php
// Cargar manufacturers.json
$manufacturersFile = DATA_PATH . '/manufacturers.json';

if (!file_exists($manufacturersFile)) {
    respond(['manufacturers' => []], 200);
}

$mfgData = json_decode(file_get_contents($manufacturersFile), true);

respond([
    'manufacturers' => $mfgData['manufacturers'] ?? []
], 200);
