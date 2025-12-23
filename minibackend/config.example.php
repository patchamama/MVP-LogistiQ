<?php
/**
 * config.example.php
 *
 * Template de configuración para MiniBACKEND
 * Copiar a config.php y ejecutar setup_config.php para generar valores
 *
 * NOTA: config.php está en .gitignore y NO debe commitearse
 */
return [
    'encryption' => [
        'enabled' => true,
        // Generar con: EncryptionService::generateKey()
        'key' => 'GENERAR_CON_setup_config.php',
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
                // Se genera automáticamente con setup_config.php
                'api_key_encrypted' => 'SE_GENERA_CON_setup_config.php',
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
