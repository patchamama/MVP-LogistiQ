<?php

namespace LogistiQ\Services;

/**
 * API Key Service for managing encrypted API keys
 * Handles storage, retrieval, and deletion of user API keys
 */
class APIKeyService
{
    private EncryptionService $encryptionService;
    private string $dataPath;

    public function __construct()
    {
        $this->encryptionService = new EncryptionService();
        $this->dataPath = getenv('DATA_PATH') ?: __DIR__ . '/../../data';

        // Ensure data directory exists
        if (!is_dir($this->dataPath)) {
            mkdir($this->dataPath, 0755, true);
        }
    }

    /**
     * Get path to API keys storage file
     */
    private function getStoragePath(): string
    {
        return $this->dataPath . '/api_keys.json';
    }

    /**
     * Load all API keys from storage
     */
    private function loadKeys(): array
    {
        $filePath = $this->getStoragePath();

        if (!file_exists($filePath)) {
            return ['user_keys' => []];
        }

        try {
            $content = file_get_contents($filePath);
            return json_decode($content, true) ?: ['user_keys' => []];
        } catch (\Exception $e) {
            error_log('Error loading API keys: ' . $e->getMessage());
            return ['user_keys' => []];
        }
    }

    /**
     * Save all API keys to storage
     */
    private function saveKeys(array $data): bool
    {
        try {
            $filePath = $this->getStoragePath();
            $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

            if (file_put_contents($filePath, $json) === false) {
                throw new \Exception('Failed to write to storage file');
            }

            // Restrict file permissions for security
            chmod($filePath, 0600);
            return true;
        } catch (\Exception $e) {
            error_log('Error saving API keys: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Save user API keys (encrypted)
     *
     * @param string $userId The user ID
     * @param array $keys Array with 'openai_key' and/or 'anthropic_key'
     * @return bool Success status
     */
    public function saveUserKeys(string $userId, array $keys): bool
    {
        if (!$userId) {
            error_log('APIKeyService: Invalid userId');
            return false;
        }

        $data = $this->loadKeys();

        // Find existing user entry or create new one
        $userIndex = null;
        foreach ($data['user_keys'] as $index => $entry) {
            if ($entry['id'] === $userId) {
                $userIndex = $index;
                break;
            }
        }

        // Prepare encrypted keys
        $encryptedEntry = [
            'id' => $userId,
            'created_at' => isset($data['user_keys'][$userIndex]['created_at'])
                ? $data['user_keys'][$userIndex]['created_at']
                : date('c'),
            'updated_at' => date('c'),
            'last_used' => isset($data['user_keys'][$userIndex]['last_used'])
                ? $data['user_keys'][$userIndex]['last_used']
                : null
        ];

        // Encrypt and store provided keys
        if (!empty($keys['openai_key'])) {
            $encryptedEntry['openai_key_encrypted'] = $this->encryptionService->encrypt($keys['openai_key']);
        } elseif ($userIndex !== null && isset($data['user_keys'][$userIndex]['openai_key_encrypted'])) {
            // Keep existing key if not provided
            $encryptedEntry['openai_key_encrypted'] = $data['user_keys'][$userIndex]['openai_key_encrypted'];
        }

        if (!empty($keys['anthropic_key'])) {
            $encryptedEntry['anthropic_key_encrypted'] = $this->encryptionService->encrypt($keys['anthropic_key']);
        } elseif ($userIndex !== null && isset($data['user_keys'][$userIndex]['anthropic_key_encrypted'])) {
            // Keep existing key if not provided
            $encryptedEntry['anthropic_key_encrypted'] = $data['user_keys'][$userIndex]['anthropic_key_encrypted'];
        }

        // Update or add user entry
        if ($userIndex !== null) {
            $data['user_keys'][$userIndex] = $encryptedEntry;
        } else {
            $data['user_keys'][] = $encryptedEntry;
        }

        return $this->saveKeys($data);
    }

    /**
     * Get user API keys (decrypted)
     *
     * @param string $userId The user ID
     * @return array|null Array with decrypted keys or null if not found
     */
    public function getUserKeys(string $userId): ?array
    {
        if (!$userId) {
            return null;
        }

        $data = $this->loadKeys();

        foreach ($data['user_keys'] as $entry) {
            if ($entry['id'] === $userId) {
                $result = [];

                // Decrypt keys if they exist
                if (isset($entry['openai_key_encrypted'])) {
                    $decrypted = $this->encryptionService->decrypt($entry['openai_key_encrypted']);
                    if ($decrypted) {
                        $result['openai_key'] = $decrypted;
                    }
                }

                if (isset($entry['anthropic_key_encrypted'])) {
                    $decrypted = $this->encryptionService->decrypt($entry['anthropic_key_encrypted']);
                    if ($decrypted) {
                        $result['anthropic_key'] = $decrypted;
                    }
                }

                // Update last_used timestamp
                $this->updateLastUsed($userId);

                return $result;
            }
        }

        return null;
    }

    /**
     * Check if user has API keys configured
     *
     * @param string $userId The user ID
     * @return array Status with 'openai' and 'anthropic' booleans
     */
    public function getKeyStatus(string $userId): array
    {
        if (!$userId) {
            return ['openai' => false, 'anthropic' => false];
        }

        $data = $this->loadKeys();

        foreach ($data['user_keys'] as $entry) {
            if ($entry['id'] === $userId) {
                return [
                    'openai' => isset($entry['openai_key_encrypted']),
                    'anthropic' => isset($entry['anthropic_key_encrypted'])
                ];
            }
        }

        return ['openai' => false, 'anthropic' => false];
    }

    /**
     * Delete user API keys
     *
     * @param string $userId The user ID
     * @return bool Success status
     */
    public function deleteUserKeys(string $userId): bool
    {
        if (!$userId) {
            return false;
        }

        $data = $this->loadKeys();

        // Find and remove user entry
        foreach ($data['user_keys'] as $index => $entry) {
            if ($entry['id'] === $userId) {
                unset($data['user_keys'][$index]);
                // Reindex array
                $data['user_keys'] = array_values($data['user_keys']);
                return $this->saveKeys($data);
            }
        }

        return false;
    }

    /**
     * Update last_used timestamp for a user
     */
    private function updateLastUsed(string $userId): bool
    {
        $data = $this->loadKeys();

        foreach ($data['user_keys'] as $index => $entry) {
            if ($entry['id'] === $userId) {
                $data['user_keys'][$index]['last_used'] = date('c');
                return $this->saveKeys($data);
            }
        }

        return false;
    }
}
