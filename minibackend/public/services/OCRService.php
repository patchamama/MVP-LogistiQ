<?php
/**
 * OCRService - Servicio para procesar imágenes con Claude y OpenAI
 *
 * Características:
 * - Envía imagen a Claude Vision o OpenAI Vision
 * - Implementa fallback: Claude → OpenAI
 * - Extrae referencia/código de la imagen
 */

class OCRService
{
    private const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
    private const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

    /**
     * Procesar imagen con OCR (Claude → OpenAI con fallback)
     *
     * @param string $imageBase64 Imagen en base64
     * @param string|null $claudeKey API key de Claude (opcional)
     * @param string|null $openaiKey API key de OpenAI (opcional)
     * @param string $language Idioma de extracción (es, en, etc)
     * @return array ['success' => bool, 'code' => string, 'engine' => string, 'error' => string]
     */
    public static function processImage(
        string $imageBase64,
        ?string $claudeKey = null,
        ?string $openaiKey = null,
        string $language = 'es'
    ): array {
        // Intentar con Claude primero
        if ($claudeKey) {
            $result = self::processWithClaude($imageBase64, $claudeKey, $language);
            if ($result['success']) {
                return $result;
            }
            error_log('Claude OCR falló: ' . ($result['error'] ?? 'Unknown error'));
        }

        // Fallback a OpenAI
        if ($openaiKey) {
            $result = self::processWithOpenAI($imageBase64, $openaiKey, $language);
            if ($result['success']) {
                return $result;
            }
            error_log('OpenAI OCR falló: ' . ($result['error'] ?? 'Unknown error'));
        }

        // Si ambas fallan
        return [
            'success' => false,
            'code' => null,
            'engine' => null,
            'error' => 'No se pudo procesar la imagen con Claude ni OpenAI'
        ];
    }

    /**
     * Procesar imagen con Claude Vision
     *
     * @param string $imageBase64 Imagen en base64
     * @param string $apiKey API key de Claude
     * @param string $language Idioma
     * @return array Resultado del procesamiento
     */
    private static function processWithClaude(
        string $imageBase64,
        string $apiKey,
        string $language = 'es'
    ): array {
        try {
            $prompt = self::getExtractionPrompt($language);

            $payload = [
                'model' => 'claude-3-5-sonnet-20241022',
                'max_tokens' => 1024,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'image',
                                'source' => [
                                    'type' => 'base64',
                                    'media_type' => 'image/jpeg',
                                    'data' => $imageBase64,
                                ]
                            ],
                            [
                                'type' => 'text',
                                'text' => $prompt
                            ]
                        ]
                    ]
                ]
            ];

            $response = self::makeRequest(
                self::CLAUDE_API_URL,
                $payload,
                [
                    'Authorization: Bearer ' . $apiKey,
                    'anthropic-version: 2023-06-01',
                    'Content-Type: application/json'
                ]
            );

            if ($response['error']) {
                return [
                    'success' => false,
                    'code' => null,
                    'engine' => 'claude',
                    'error' => $response['error']
                ];
            }

            $data = json_decode($response['body'], true);

            if (!isset($data['content'][0]['text'])) {
                return [
                    'success' => false,
                    'code' => null,
                    'engine' => 'claude',
                    'error' => 'Respuesta inesperada de Claude'
                ];
            }

            $responseText = $data['content'][0]['text'];
            $code = self::extractCode($responseText);

            return [
                'success' => true,
                'code' => $code,
                'engine' => 'claude',
                'raw_response' => $responseText,
                'error' => null
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'code' => null,
                'engine' => 'claude',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Procesar imagen con OpenAI Vision
     *
     * @param string $imageBase64 Imagen en base64
     * @param string $apiKey API key de OpenAI
     * @param string $language Idioma
     * @return array Resultado del procesamiento
     */
    private static function processWithOpenAI(
        string $imageBase64,
        string $apiKey,
        string $language = 'es'
    ): array {
        try {
            $prompt = self::getExtractionPrompt($language);

            $payload = [
                'model' => 'gpt-4o',
                'max_tokens' => 1024,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'image_url',
                                'image_url' => [
                                    'url' => 'data:image/jpeg;base64,' . $imageBase64,
                                    'detail' => 'auto'
                                ]
                            ],
                            [
                                'type' => 'text',
                                'text' => $prompt
                            ]
                        ]
                    ]
                ]
            ];

            $response = self::makeRequest(
                self::OPENAI_API_URL,
                $payload,
                [
                    'Authorization: Bearer ' . $apiKey,
                    'Content-Type: application/json'
                ]
            );

            if ($response['error']) {
                return [
                    'success' => false,
                    'code' => null,
                    'engine' => 'openai',
                    'error' => $response['error']
                ];
            }

            $data = json_decode($response['body'], true);

            if (!isset($data['choices'][0]['message']['content'])) {
                return [
                    'success' => false,
                    'code' => null,
                    'engine' => 'openai',
                    'error' => 'Respuesta inesperada de OpenAI'
                ];
            }

            $responseText = $data['choices'][0]['message']['content'];
            $code = self::extractCode($responseText);

            return [
                'success' => true,
                'code' => $code,
                'engine' => 'openai',
                'raw_response' => $responseText,
                'error' => null
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'code' => null,
                'engine' => 'openai',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Hacer petición HTTP a la API
     *
     * @param string $url URL de la API
     * @param array $payload Datos a enviar
     * @param array $headers Headers HTTP
     * @return array ['error' => string|null, 'body' => string]
     */
    private static function makeRequest(string $url, array $payload, array $headers): array
    {
        $ch = curl_init($url);

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);

        $body = curl_exec($ch);
        $errno = curl_errno($ch);
        $error = null;

        if ($errno !== 0) {
            $error = 'cURL Error: ' . curl_error($ch);
        }

        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if ($httpCode >= 400) {
            $error = 'HTTP ' . $httpCode . ': ' . $body;
        }

        curl_close($ch);

        return [
            'error' => $error,
            'body' => $body ?? ''
        ];
    }

    /**
     * Obtener prompt de extracción según idioma
     *
     * @param string $language Idioma (es, en, etc)
     * @return string Prompt
     */
    private static function getExtractionPrompt(string $language = 'es'): string
    {
        if ($language === 'en') {
            return <<<'PROMPT'
Analyze this image and extract any visible reference codes, product codes, QR codes, or identifying numbers.

Your response MUST be in this exact JSON format:
{
  "code": "THE_EXTRACTED_CODE_OR_REFERENCE",
  "confidence": "high/medium/low",
  "type": "qr_code/reference_number/product_code/barcode/other",
  "details": "Brief description of what was found"
}

If no code is found, return:
{
  "code": null,
  "confidence": "low",
  "type": "none",
  "details": "No identifiable code found in the image"
}

IMPORTANT: Always respond with valid JSON only, no additional text.
PROMPT;
        }

        // Default Spanish prompt
        return <<<'PROMPT'
Analiza esta imagen y extrae cualquier código de referencia, número de producto, código QR o número de identificación visible.

Tu respuesta DEBE estar en este formato JSON exacto:
{
  "code": "EL_CÓDIGO_O_REFERENCIA_EXTRAÍDA",
  "confidence": "alta/media/baja",
  "type": "codigo_qr/numero_referencia/codigo_producto/codigo_barras/otro",
  "details": "Descripción breve de lo encontrado"
}

Si no se encuentra ningún código, retorna:
{
  "code": null,
  "confidence": "baja",
  "type": "ninguno",
  "details": "No se encontró ningún código identificable en la imagen"
}

IMPORTANTE: Siempre responde solo con JSON válido, sin texto adicional.
PROMPT;
    }

    /**
     * Extraer código de la respuesta (intenta parsear JSON o buscar patrones)
     *
     * @param string $response Respuesta de la IA
     * @return string|null Código extraído
     */
    private static function extractCode(string $response): ?string
    {
        // Intentar parsear como JSON primero
        try {
            // Buscar JSON en la respuesta
            if (preg_match('/\{[^}]*"code"[^}]*\}/', $response, $matches)) {
                $json = json_decode($matches[0], true);
                if (isset($json['code']) && !empty($json['code']) && $json['code'] !== 'null') {
                    return $json['code'];
                }
            }
        } catch (Exception $e) {
            // Continuar con búsqueda de patrones
        }

        // Si no hay JSON válido, buscar patrones comunes
        // Código QR/barras típicamente son alfanuméricos largos
        if (preg_match('/[A-Z0-9]{5,}/', $response, $matches)) {
            return $matches[0];
        }

        return null;
    }
}
