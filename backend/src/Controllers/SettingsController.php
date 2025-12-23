<?php

namespace LogistiQ\Controllers;

use LogistiQ\Services\APIKeyService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

/**
 * Settings Controller
 * Handles API key configuration endpoints
 */
class SettingsController
{
    private APIKeyService $apiKeyService;

    public function __construct()
    {
        $this->apiKeyService = new APIKeyService();
    }

    /**
     * Save user API keys
     * POST /api/settings/api-keys
     */
    public function saveAPIKeys(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();

            // Validate input
            if (!isset($data['userId']) || empty($data['userId'])) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'User ID is required'
                ], 400);
            }

            $userId = $data['userId'];
            $keysToSave = [];

            // Validate and prepare OpenAI key
            if (isset($data['openai_key']) && !empty($data['openai_key'])) {
                if (!$this->isValidOpenAIKey($data['openai_key'])) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'message' => 'Invalid OpenAI API key format'
                    ], 400);
                }
                $keysToSave['openai_key'] = $data['openai_key'];
            }

            // Validate and prepare Anthropic key
            if (isset($data['anthropic_key']) && !empty($data['anthropic_key'])) {
                if (!$this->isValidAnthropicKey($data['anthropic_key'])) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'message' => 'Invalid Anthropic API key format'
                    ], 400);
                }
                $keysToSave['anthropic_key'] = $data['anthropic_key'];
            }

            // At least one key must be provided
            if (empty($keysToSave)) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'At least one API key must be provided'
                ], 400);
            }

            // Save keys
            if (!$this->apiKeyService->saveUserKeys($userId, $keysToSave)) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Failed to save API keys'
                ], 500);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'API keys saved successfully'
            ], 200);
        } catch (\Exception $e) {
            error_log('Error in saveAPIKeys: ' . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get API key status for user (without exposing the keys)
     * GET /api/settings/api-keys/status
     */
    public function getAPIKeyStatus(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $userId = $queryParams['userId'] ?? null;

            if (!$userId) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'User ID is required'
                ], 400);
            }

            $status = $this->apiKeyService->getKeyStatus($userId);

            return $this->jsonResponse($response, [
                'success' => true,
                'openai_configured' => $status['openai'],
                'anthropic_configured' => $status['anthropic']
            ], 200);
        } catch (\Exception $e) {
            error_log('Error in getAPIKeyStatus: ' . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Delete user API keys
     * DELETE /api/settings/api-keys
     */
    public function deleteAPIKeys(Request $request, Response $response): Response
    {
        try {
            $data = $request->getParsedBody();

            if (!isset($data['userId']) || empty($data['userId'])) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'User ID is required'
                ], 400);
            }

            $userId = $data['userId'];

            if (!$this->apiKeyService->deleteUserKeys($userId)) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'API keys not found or failed to delete'
                ], 404);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'API keys deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            error_log('Error in deleteAPIKeys: ' . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Validate OpenAI API key format
     * OpenAI keys start with 'sk-' or 'sk-proj-'
     */
    private function isValidOpenAIKey(string $key): bool
    {
        // Basic validation - should start with sk- or sk-proj-
        return preg_match('/^sk-[\w\-]+$/', $key) === 1;
    }

    /**
     * Validate Anthropic API key format
     * Anthropic keys start with 'sk-ant-'
     */
    private function isValidAnthropicKey(string $key): bool
    {
        // Basic validation - should start with sk-ant-
        return preg_match('/^sk-ant-[\w\-]+$/', $key) === 1;
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
