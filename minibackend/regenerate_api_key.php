<?php
/**
 * regenerate_api_key.php
 *
 * Script para regenerar el api_key_encrypted con la clave actual
 * Uso: php regenerate_api_key.php
 */

// Cargar servicios
require_once __DIR__ . '/public/services/EncryptionService.php';

// Cargar config actual
$config = require __DIR__ . '/config.php';

echo "\n================================================\n";
echo "  REGENERAR API KEY ENCRIPTADA\n";
echo "================================================\n\n";

// Mostrar config actual
echo "Config Actual:\n";
echo "  Encryption key: " . $config['encryption']['key'] . "\n";
echo "  API key encrypted: " . substr($config['ocr']['engines']['openai']['api_key_encrypted'], 0, 50) . "...\n\n";

// Pedir la API key
echo "Ingresa la API key de OpenAI (o presiona Enter para omitir):\n";
$apiKey = trim(fgets(STDIN));

if (empty($apiKey)) {
    echo "Omitido.\n";
    exit(0);
}

// Validar que parece una API key válida
if (!preg_match('/^sk-/', $apiKey)) {
    echo "⚠️  Advertencia: La API key no parece válida (no comienza con 'sk-')\n";
}

// Generar nuevo valor encriptado
echo "\nGenerando nuevo valor encriptado...\n";
try {
    $encryptedNewValue = EncryptionService::encrypt($apiKey, $config['encryption']['key']);
    echo "✓ Valor encriptado generado:\n";
    echo "  " . $encryptedNewValue . "\n\n";

    // Intentar desencriptarlo para verificar
    echo "Verificando que se desencripta correctamente...\n";
    $decrypted = EncryptionService::decrypt($encryptedNewValue, $config['encryption']['key']);
    if ($decrypted === $apiKey) {
        echo "✓ Desencriptación verificada: " . substr($decrypted, 0, 20) . "...\n\n";
    } else {
        echo "✗ Error: La desencriptación no coincide!\n";
        echo "  Esperado: " . substr($apiKey, 0, 20) . "...\n";
        echo "  Obtenido: " . substr($decrypted, 0, 20) . "...\n";
        exit(1);
    }

    // Mostrar instrucciones
    echo "================================================\n";
    echo "Para actualizar config.php:\n";
    echo "================================================\n\n";
    echo "1. Abre minibackend/config.php\n";
    echo "2. Busca la línea con 'api_key_encrypted' en la sección 'openai'\n";
    echo "3. Reemplaza el valor con:\n\n";
    echo "'" . $encryptedNewValue . "'\n\n";
    echo "4. Guarda el archivo\n";
    echo "5. Ejecuta: git pull && sh deploy.sh\n\n";

    echo "O ejecuta este script con --update para actualizar automáticamente:\n";
    echo "php regenerate_api_key.php --update\n\n";

} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
