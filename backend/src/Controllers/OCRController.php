<?php

namespace LogistiQ\Controllers;

use LogistiQ\Services\TesseractService;
use LogistiQ\Services\EasyOCRService;
use LogistiQ\Services\ProductService;
use LogistiQ\Services\OpenAIVisionService;
use LogistiQ\Services\ClaudeVisionService;
use LogistiQ\Services\APIKeyService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class OCRController
{
    private TesseractService $tesseractService;
    private EasyOCRService $easyOCRService;
    private ProductService $productService;
    private OpenAIVisionService $openAIVisionService;
    private ClaudeVisionService $claudeVisionService;
    private APIKeyService $apiKeyService;

    public function __construct()
    {
        $this->tesseractService = new TesseractService();
        $this->easyOCRService = new EasyOCRService();
        $this->productService = new ProductService();
        $this->openAIVisionService = new OpenAIVisionService();
        $this->claudeVisionService = new ClaudeVisionService();
        $this->apiKeyService = new APIKeyService();
    }

    /**
     * Process image with OCR
     * POST /api/ocr/process
     */
    public function processImage(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();

            // Validate input
            if (!isset($data['image']) || empty($data['image'])) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'No image provided'
                ], 400);
            }

            $imageBase64 = $data['image'];
            $engine = $data['engine'] ?? 'tesseract';
            $userId = $data['userId'] ?? null;

            // Validate engine
            $validEngines = ['tesseract', 'easyocr', 'both', 'openai-vision', 'claude-vision'];
            if (!in_array($engine, $validEngines)) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Invalid OCR engine'
                ], 400);
            }

            $results = [];

            // Process with OpenAI Vision
            if ($engine === 'openai-vision') {
                if (!$userId) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'message' => 'User ID is required for AI vision engines'
                    ], 400);
                }

                $userKeys = $this->apiKeyService->getUserKeys($userId);
                if (!$userKeys || empty($userKeys['openai_key'])) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'message' => 'OpenAI API key not configured. Please configure it in settings.'
                    ], 400);
                }

                $openaiResult = $this->openAIVisionService->processImage($imageBase64, $userKeys['openai_key']);
                if ($openaiResult['success']) {
                    $results['openai-vision'] = $openaiResult;
                }
            }

            // Process with Claude Vision
            if ($engine === 'claude-vision') {
                if (!$userId) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'message' => 'User ID is required for AI vision engines'
                    ], 400);
                }

                $userKeys = $this->apiKeyService->getUserKeys($userId);
                if (!$userKeys || empty($userKeys['anthropic_key'])) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'message' => 'Anthropic (Claude) API key not configured. Please configure it in settings.'
                    ], 400);
                }

                $claudeResult = $this->claudeVisionService->processImage($imageBase64, $userKeys['anthropic_key']);
                if ($claudeResult['success']) {
                    $results['claude-vision'] = $claudeResult;
                }
            }

            // Process with Tesseract
            if ($engine === 'tesseract' || $engine === 'both') {
                $tesseractResult = $this->tesseractService->processImage($imageBase64);
                if ($tesseractResult['success']) {
                    $results['tesseract'] = $tesseractResult;
                }
            }

            // Process with EasyOCR
            if ($engine === 'easyocr' || $engine === 'both') {
                $easyOCRResult = $this->easyOCRService->processImage($imageBase64);
                if ($easyOCRResult['success']) {
                    $results['easyocr'] = $easyOCRResult;
                }
            }

            // Use first successful result (prioritize Vision APIs)
            $ocrResult = null;
            if (isset($results['openai-vision'])) {
                $ocrResult = $results['openai-vision'];
            } elseif (isset($results['claude-vision'])) {
                $ocrResult = $results['claude-vision'];
            } elseif (isset($results['tesseract'])) {
                $ocrResult = $results['tesseract'];
            } elseif (isset($results['easyocr'])) {
                $ocrResult = $results['easyocr'];
            } else {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'OCR processing failed'
                ], 500);
            }

            // Search for product
            $product = $this->productService->getProductByCode($ocrResult['filtered_code']);

            if (!$product) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'ocr_result' => $ocrResult,
                    'message' => 'Product not found with code: ' . $ocrResult['filtered_code']
                ], 404);
            }

            // Return success with product data
            return $this->jsonResponse($response, [
                'success' => true,
                'ocr_result' => $ocrResult,
                'product' => $product
            ], 200);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Internal server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product by code
     * GET /api/products/{code}
     */
    public function getProduct(Request $request, Response $response, array $args): Response
    {
        try {
            $code = $args['code'] ?? null;

            if (!$code) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Product code is required'
                ], 400);
            }

            $product = $this->productService->getProductByCode($code);

            if (!$product) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            return $this->jsonResponse($response, $product, 200);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Search products
     * GET /api/products/search?q=query
     */
    public function searchProducts(Request $request, Response $response): Response
    {
        try {
            $query = $request->getQueryParams()['q'] ?? null;

            if (!$query) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Search query is required'
                ], 400);
            }

            $products = $this->productService->searchProducts($query);

            return $this->jsonResponse($response, [
                'success' => true,
                'products' => $products,
                'count' => count($products)
            ], 200);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Return JSON response
     */
    private function jsonResponse(Response $response, array $data, int $statusCode = 200): Response
    {
        $response->getBody()->write(json_encode($data));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($statusCode);
    }
}
