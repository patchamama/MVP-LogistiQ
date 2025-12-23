<?php
// Leer y decodificar JSON del request
$input = json_decode(file_get_contents('php://input'), true);

// Validar datos requeridos
if (!isset($input['referencia']) || !isset($input['fabricante']) ||
    !isset($input['cantidad']) || !isset($input['operario']) ||
    !isset($input['imagenes']) || !is_array($input['imagenes'])) {
    respond(['success' => false, 'message' => 'Datos incompletos'], 400);
}

$referencia = trim($input['referencia']);
$fabricante = trim($input['fabricante']);
$cantidad = (int)$input['cantidad'];
$operario = trim($input['operario']);
$observaciones = trim($input['observaciones'] ?? '');
$referenciaScanned = trim($input['referenciaScanned'] ?? '');
$imagenes = $input['imagenes'];

// Validar que los datos no estén vacíos
if (empty($referencia) || empty($fabricante) || empty($operario)) {
    respond(['success' => false, 'message' => 'La referencia, fabricante y operario son requeridos'], 400);
}

if ($cantidad <= 0) {
    respond(['success' => false, 'message' => 'La cantidad debe ser mayor a 0'], 400);
}

if (empty($imagenes)) {
    respond(['success' => false, 'message' => 'Se requiere al menos una imagen'], 400);
}

if (count($imagenes) > 10) {
    respond(['success' => false, 'message' => 'Máximo 10 imágenes permitidas'], 400);
}

// Generar ID único
$entryId = 'entry_' . time() . '_' . bin2hex(random_bytes(4));
$timestamp = date('c');

// Sanitizar nombres para crear directorios
$fabricanteDir = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $fabricante);
$referenciaDir = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $referencia);

// Crear estructura de carpetas
$fabricanteFullPath = STORAGE_PATH . '/' . $fabricanteDir;
$referenciaFullPath = $fabricanteFullPath . '/' . $referenciaDir;

if (!is_dir($referenciaFullPath)) {
    if (!mkdir($referenciaFullPath, 0755, true)) {
        respond(['success' => false, 'message' => 'Error al crear directorio de almacenamiento'], 500);
    }
}

// Guardar imágenes
$imagePaths = [];
$savedImageCount = 0;

foreach ($imagenes as $index => $imageBase64) {
    // Remover prefijo data:image/...;base64,
    if (strpos($imageBase64, 'base64,') !== false) {
        $imageBase64 = explode('base64,', $imageBase64)[1];
    }

    // Decodificar base64
    $imageData = base64_decode($imageBase64, true);
    if ($imageData === false) {
        continue;
    }

    // Validar tamaño (máximo 5MB)
    if (strlen($imageData) > 5 * 1024 * 1024) {
        continue;
    }

    // Crear nombre de archivo
    $imageName = time() . '_' . ($index + 1) . '.jpg';
    $imagePath = $referenciaFullPath . '/' . $imageName;

    // Guardar archivo
    if (file_put_contents($imagePath, $imageData) !== false) {
        chmod($imagePath, 0644);
        $imagePaths[] = $fabricanteDir . '/' . $referenciaDir . '/' . $imageName;
        $savedImageCount++;
    }
}

if ($savedImageCount === 0) {
    respond(['success' => false, 'message' => 'Error al guardar las imágenes'], 500);
}

// Cargar entries.json
$entriesFile = DATA_PATH . '/entries.json';
$entriesData = json_decode(file_get_contents($entriesFile), true);

// Crear nueva entrada
$newEntry = [
    'id' => $entryId,
    'referencia' => $referencia,
    'fabricante' => $fabricante,
    'cantidad' => $cantidad,
    'operario' => $operario,
    'observaciones' => $observaciones,
    'referenciaScanned' => $referenciaScanned,
    'timestamp' => $timestamp,
    'imagenes' => $imagePaths
];

$entriesData['entries'][] = $newEntry;

// Guardar entries.json
if (file_put_contents($entriesFile, json_encode($entriesData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)) === false) {
    respond(['success' => false, 'message' => 'Error al guardar la entrada'], 500);
}

// Agregar fabricante si es nuevo
$manufacturersFile = DATA_PATH . '/manufacturers.json';
$mfgData = json_decode(file_get_contents($manufacturersFile), true);

if (!in_array($fabricante, $mfgData['manufacturers'])) {
    $mfgData['manufacturers'][] = $fabricante;
    sort($mfgData['manufacturers']);
    file_put_contents($manufacturersFile, json_encode($mfgData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

// Respuesta exitosa
respond([
    'success' => true,
    'entry_id' => $entryId,
    'message' => 'Entrada registrada correctamente',
    'images_saved' => $savedImageCount,
    'storage_path' => $fabricanteDir . '/' . $referenciaDir,
    'timestamp' => $timestamp
], 201);
