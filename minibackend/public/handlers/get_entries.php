<?php
// Obtener parámetros de paginación
$limit = (int)($_GET['limit'] ?? 50);
$offset = (int)($_GET['offset'] ?? 0);

// Validar parámetros
if ($limit < 1 || $limit > 500) {
    $limit = 50;
}
if ($offset < 0) {
    $offset = 0;
}

// Cargar entries.json
$entriesFile = DATA_PATH . '/entries.json';
if (!file_exists($entriesFile)) {
    respond([
        'total' => 0,
        'limit' => $limit,
        'offset' => $offset,
        'entries' => []
    ], 200);
}

$entriesData = json_decode(file_get_contents($entriesFile), true);
$allEntries = $entriesData['entries'] ?? [];

// Invertir para mostrar más recientes primero
$allEntries = array_reverse($allEntries);

// Contar total
$total = count($allEntries);

// Aplicar paginación
$paginatedEntries = array_slice($allEntries, $offset, $limit);

// Preparar respuesta
$entries = [];
foreach ($paginatedEntries as $entry) {
    $entries[] = [
        'id' => $entry['id'],
        'referencia' => $entry['referencia'],
        'fabricante' => $entry['fabricante'],
        'cantidad' => $entry['cantidad'],
        'operario' => $entry['operario'],
        'timestamp' => $entry['timestamp'],
        'image_count' => count($entry['imagenes'] ?? [])
    ];
}

respond([
    'total' => $total,
    'limit' => $limit,
    'offset' => $offset,
    'entries' => $entries
], 200);
