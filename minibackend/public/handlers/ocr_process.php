<?php
/**
 * POST /api/ocr/process
 *
 * Procesa una imagen para extraer código/referencia usando Claude u OpenAI
 *
 * Request:
 * {
 *   "image_base64": "...",
 *   "claude_api_key": "..." (opcional),
 *   "openai_api_key": "..." (opcional),
 *   "language": "es" (opcional, default: es)
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "code": "ABC123",
 *   "engine": "claude",
 *   "raw_response": "...",
 *   "error": null
 * }
 */

require_once __DIR__ . '/../services/OCRService.php';
require_once __DIR__ . '/../services/EncryptionService.php';

// Leer config
$config = require BASE_PATH . '/config.php';

try {
    // Validar método
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        respond(['error' => 'Método no permitido']);
    }

    // Leer body JSON
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        respond(['error' => 'Body JSON inválido']);
    }

    // Validar imagen base64
    if (empty($input['image_base64'])) {
        http_response_code(400);
        respond(['error' => 'image_base64 es requerido']);
    }

    $imageBase64 = $input['image_base64'];

    // Verificar que es base64 válido
    if (!preg_match('/^[A-Za-z0-9+\/=]+$/', $imageBase64)) {
        http_response_code(400);
        respond(['error' => 'image_base64 no es base64 válido']);
    }

    // Obtener idioma (default: es)
    $language = $input['language'] ?? 'es';

    // Obtener API keys del input o del config
    $claudeKey = $input['claude_api_key'] ?? null;
    $openaiKey = $input['openai_api_key'] ?? null;

    // Si no se proporcionan, intentar obtener del config encriptado
    if (!$claudeKey && isset($config['ocr']['engines']['claude'])) {
        $claudeEngine = $config['ocr']['engines']['claude'];
        if ($claudeEngine['enabled'] && !empty($claudeEngine['api_key_encrypted'])) {
            try {
                $claudeKey = EncryptionService::decrypt(
                    $claudeEngine['api_key_encrypted'],
                    $config['encryption']['key']
                );
            } catch (Exception $e) {
                error_log('Error desencriptando Claude key: ' . $e->getMessage());
            }
        }
    }

    if (!$openaiKey && isset($config['ocr']['engines']['openai'])) {
        $openaiEngine = $config['ocr']['engines']['openai'];
        if ($openaiEngine['enabled'] && !empty($openaiEngine['api_key_encrypted'])) {
            try {
                $openaiKey = EncryptionService::decrypt(
                    $openaiEngine['api_key_encrypted'],
                    $config['encryption']['key']
                );
            } catch (Exception $e) {
                error_log('Error desencriptando OpenAI key: ' . $e->getMessage());
            }
        }
    }

    // Validar que hay al menos una API key
    if (!$claudeKey && !$openaiKey) {
        http_response_code(400);
        respond([
            'error' => 'No API keys provided and none configured in config.php'
        ]);
    }

    // Procesar imagen
    $result = OCRService::processImage(
        $imageBase64,
        $claudeKey,
        $openaiKey,
        $language
    );

    // Responder
    if ($result['success']) {
        respond([
            'success' => true,
            'code' => $result['code'],
            'engine' => $result['engine'],
            'raw_response' => $result['raw_response'] ?? null,
            'error' => null
        ]);
    } else {
        http_response_code(500);
        respond([
            'success' => false,
            'code' => null,
            'engine' => $result['engine'] ?? null,
            'error' => $result['error'] ?? 'Unknown error'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    respond([
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
