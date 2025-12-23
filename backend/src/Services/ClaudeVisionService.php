<?php

namespace LogistiQ\Services;

/**
 * Claude Vision Service
 * Uses Anthropic Claude 3 Vision API to extract product codes from images
 */
class ClaudeVisionService
{
    private string $apiEndpoint = 'https://api.anthropic.com/v1/messages';
    private string $model = 'claude-3-sonnet-20240229';
    private string $apiVersion = '2024-06-01';

    /**
     * Process image with Claude 3 Vision
     *
     * @param string $imageBase64 Base64 encoded image
     * @param string $apiKey Anthropic API key
     * @return array Result array with success, raw_text, filtered_code, engine_used
     */
    public function processImage(string $imageBase64, string $apiKey): array
    {
        try {
            $prompt = "Analyze this product label image and extract ONLY the product code or number. "
                . "Return only the alphanumeric code, nothing else. "
                . "If you cannot find a code, return 'NO_CODE_FOUND'.";

            $payload = [
                'model' => $this->model,
                'max_tokens' => 100,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'image',
                                'source' => [
                                    'type' => 'base64',
                                    'media_type' => 'image/jpeg',
                                    'data' => $imageBase64
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

            $response = $this->makeApiRequest($payload, $apiKey);

            if (!$response['success']) {
                return [
                    'success' => false,
                    'raw_text' => '',
                    'filtered_code' => '',
                    'engine_used' => 'claude-3-vision',
                    'error' => $response['error'] ?? 'Unknown error'
                ];
            }

            $rawText = $response['data']['content'][0]['text'] ?? '';
            $filteredCode = $this->filterCode($rawText);

            return [
                'success' => true,
                'raw_text' => $rawText,
                'filtered_code' => $filteredCode,
                'engine_used' => 'claude-3-vision'
            ];
        } catch (\Exception $e) {
            error_log('Claude Vision error: ' . $e->getMessage());
            return [
                'success' => false,
                'raw_text' => '',
                'filtered_code' => '',
                'engine_used' => 'claude-3-vision',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Make API request to Anthropic
     */
    private function makeApiRequest(array $payload, string $apiKey): array
    {
        $curl = curl_init($this->apiEndpoint);

        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_2_0,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'x-api-key: ' . $apiKey,
                'anthropic-version: ' . $this->apiVersion
            ],
            CURLOPT_POSTFIELDS => json_encode($payload)
        ]);

        $response = curl_exec($curl);
        $statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $error = curl_error($curl);
        curl_close($curl);

        if ($error) {
            return [
                'success' => false,
                'error' => 'cURL error: ' . $error
            ];
        }

        if ($statusCode !== 200) {
            $decoded = json_decode($response, true);
            $errorMessage = $decoded['error']['message'] ?? 'HTTP ' . $statusCode;
            return [
                'success' => false,
                'error' => $errorMessage
            ];
        }

        $decoded = json_decode($response, true);
        if (!$decoded) {
            return [
                'success' => false,
                'error' => 'Invalid JSON response from Anthropic'
            ];
        }

        return [
            'success' => true,
            'data' => $decoded
        ];
    }

    /**
     * Filter and clean extracted code
     */
    private function filterCode(string $rawText): string
    {
        if (stripos($rawText, 'NO_CODE_FOUND') !== false) {
            return '';
        }

        // Extract only alphanumeric characters and common separators
        $filtered = preg_replace('/[^a-zA-Z0-9\-_]/', '', $rawText);
        $filtered = trim($filtered);

        return $filtered ?: '';
    }
}
