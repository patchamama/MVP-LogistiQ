<?php
// Obtener parámetro de referencia
$referencia = $_GET['ref'] ?? '';

if (empty($referencia)) {
    respond(['success' => false, 'message' => 'Referencia requerida'], 400);
}

// Cargar entries.json
$entriesFile = DATA_PATH . '/entries.json';
if (!file_exists($entriesFile)) {
    respond(['exists' => false], 200);
}

$entriesData = json_decode(file_get_contents($entriesFile), true);

// Buscar entradas con esta referencia
$matches = array_filter($entriesData['entries'], function($entry) use ($referencia) {
    return $entry['referencia'] === $referencia;
});

if (empty($matches)) {
    respond(['exists' => false], 200);
}

// Obtener la última entrada
$lastEntry = end($matches);

// Calcular cantidad total
$totalQuantity = 0;
foreach ($matches as $entry) {
    $totalQuantity += $entry['cantidad'];
}

respond([
    'exists' => true,
    'count' => count($matches),
    'total_quantity' => $totalQuantity,
    'last_entry' => [
        'fabricante' => $lastEntry['fabricante'],
        'cantidad' => $lastEntry['cantidad'],
        'timestamp' => $lastEntry['timestamp'],
        'operario' => $lastEntry['operario'],
        'observaciones' => $lastEntry['observaciones'] ?? ''
    ]
], 200);
