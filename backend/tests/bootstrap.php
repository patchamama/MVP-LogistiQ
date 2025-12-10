<?php

// Autoload composer packages
require_once dirname(__DIR__) . '/vendor/autoload.php';

// Define test environment
define('TEST_ENV', true);

// Create test data directory
$testDataDir = dirname(__DIR__) . '/tests/data';
if (!is_dir($testDataDir)) {
    mkdir($testDataDir, 0755, true);
}
