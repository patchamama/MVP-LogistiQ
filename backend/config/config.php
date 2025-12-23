<?php

/**
 * Application Configuration
 * Load environment variables and provide configuration constants
 */

// Load .env file if it exists
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        // Parse KEY=VALUE format
        if (strpos($line, '=') !== false) {
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            // Remove quotes if present
            if ((strpos($value, '"') === 0 && strrpos($value, '"') === strlen($value) - 1) ||
                (strpos($value, "'") === 0 && strrpos($value, "'") === strlen($value) - 1)) {
                $value = substr($value, 1, -1);
            }

            // Set environment variable if not already set
            if (!getenv($key)) {
                putenv("$key=$value");
            }
        }
    }
}

// Configuration array
return [
    // Encryption
    'encryption_key' => getenv('ENCRYPTION_KEY') ?: 'dev_key_CHANGE_IN_PRODUCTION_12345678',

    // Data storage path
    'data_path' => getenv('DATA_PATH') ?: __DIR__ . '/../data',

    // API Configuration
    'openai_api_url' => 'https://api.openai.com/v1/chat/completions',
    'anthropic_api_url' => 'https://api.anthropic.com/v1/messages',

    // Environment
    'environment' => getenv('APP_ENV') ?: 'development',
    'debug' => getenv('DEBUG') === 'true' || getenv('APP_ENV') === 'development'
];
