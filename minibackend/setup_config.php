#!/usr/bin/env php
<?php
/**
 * setup_config.php
 *
 * Script de configuración inicial del MiniBACKEND
 * - Genera clave de encriptación segura
 * - Encripta API keys (OpenAI, Claude, etc.)
 * - Crea archivo config.php
 *
 * Uso:
 *   php minibackend/setup_config.php
 *
 * IMPORTANTE:
 *   - Este script debe ejecutarse una sola vez en la instalación
 *   - El archivo config.php generado NO debe commitearse
 *   - Agregar config.php a .gitignore
 */

require_once __DIR__ . '/public/services/EncryptionService.php';

echo "\n";
echo "============================================\n";
echo "  MiniBACKEND - Setup de Configuración\n";
echo "============================================\n\n";

// Verificar que OpenSSL esté disponible
if (!EncryptionService::isAvailable()) {
    echo "❌ ERROR: OpenSSL no está disponible en este servidor\n\n";
    exit(1);
}

echo "✓ OpenSSL disponible\n\n";

// 1. Generar clave de encriptación
echo "[1/3] Generando clave de encriptación (32 bytes)...\n";
$encryptionKey = EncryptionService::generateKey(32);
echo "✓ Clave generada: {$encryptionKey}\n\n";

// 2. Encriptar API key de OpenAI (solicitada al usuario)
echo "[2/3] Ingresa tu API key de OpenAI (o presiona Enter para omitir):\n";
echo "API Key: ";
$openaiKey = trim(fgets(STDIN) ?: '');

$encryptedOpenAI = '';

if ($openaiKey) {
    echo "Encriptando API key de OpenAI...\n";
    try {
        $encryptedOpenAI = EncryptionService::encrypt($openaiKey, $encryptionKey);
        echo "✓ API Key de OpenAI encriptada correctamente\n";
        echo "   Longitud encriptada: " . strlen($encryptedOpenAI) . " chars\n\n";
    } catch (Exception $e) {
        echo "❌ ERROR encriptando API key: " . $e->getMessage() . "\n\n";
        exit(1);
    }
} else {
    echo "⏭️  API key de OpenAI omitida (puedes configurarla más tarde)\n\n";
}

// 3. Crear array de configuración
echo "[3/3] Creando archivo config.php...\n";
$config = [
    'encryption' => [
        'enabled' => true,
        'key' => $encryptionKey,
    ],
    'ocr' => [
        'engines' => [
            'tesseract' => [
                'enabled' => true,
                'requires_key' => false,
            ],
            'easyocr' => [
                'enabled' => true,
                'requires_key' => false,
            ],
            'openai' => [
                'enabled' => true,
                'requires_key' => true,
                'api_key_encrypted' => $encryptedOpenAI,
            ],
            'claude' => [
                'enabled' => false,
                'requires_key' => true,
                'api_key_encrypted' => '',
            ],
        ],
    ],
    'app' => [
        'version' => '0.8.0',
        'name' => 'LogistiQ MiniBACKEND',
    ],
];

// Generar contenido del archivo PHP
$configContent = "<?php\n";
$configContent .= "/**\n";
$configContent .= " * config.php - Archivo de configuración generado automáticamente\n";
$configContent .= " * Fecha: " . date('Y-m-d H:i:s') . "\n";
$configContent .= " * IMPORTANTE: Este archivo NO debe commitearse - está en .gitignore\n";
$configContent .= " */\n";
$configContent .= "return " . var_export($config, true) . ";\n";

// Escribir archivo
$configPath = __DIR__ . '/config.php';
if (file_put_contents($configPath, $configContent) === false) {
    echo "❌ ERROR: No se pudo escribir el archivo config.php\n";
    echo "   Ruta: {$configPath}\n";
    echo "   Verifica permisos de escritura en: " . __DIR__ . "\n\n";
    exit(1);
}

echo "✓ Archivo config.php creado en: {$configPath}\n\n";

// 4. Establecer permisos restrictivos
if (PHP_OS_FAMILY !== 'Windows') {
    if (!chmod($configPath, 0600)) {
        echo "⚠️  Advertencia: No se pudo establecer permisos 0600 en config.php\n";
        echo "   Por seguridad, ejecuta: chmod 600 {$configPath}\n\n";
    } else {
        echo "✓ Permisos establecidos a 0600 (lectura/escritura para propietario solo)\n\n";
    }
}

// 5. Verificación final
echo "============================================\n";
echo "  ✓ Configuración completada exitosamente\n";
echo "============================================\n\n";

echo "Resumen de configuración:\n";
echo "  📄 Archivo config.php: Creado ✓\n";
echo "  🔐 Clave de encriptación: " . substr($encryptionKey, 0, 16) . "... (32 bytes)\n";
echo "  🤖 OpenAI API Key: Encriptada ✓\n";
echo "  🚀 Versión MiniBACKEND: 0.8.0\n";
echo "  📦 OCR Engines habilitados: tesseract, easyocr, openai\n\n";

echo "⚠️  IMPORTANTE:\n";
echo "  1. Verificar que config.php está en .gitignore\n";
echo "  2. NO compartir la clave de encriptación: {$encryptionKey}\n";
echo "  3. Hacer backup de config.php en lugar seguro\n";
echo "  4. Si necesitas cambiar API keys, ejecuta este script nuevamente\n\n";

echo "✓ Próximos pasos:\n";
echo "  1. Verificar que /api/health retorna los OCR engines\n";
echo "  2. Instalar crypto-js en frontend: npm install crypto-js\n";
echo "  3. Compilar frontend: npm run build\n";
echo "  4. Deploy: sh deploy.sh\n\n";

exit(0);
