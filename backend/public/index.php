<?php

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', true);

// Include autoloader
require __DIR__ . '/../vendor/autoload.php';

use Slim\Factory\AppFactory;
use LogistiQ\Middleware\CorsMiddleware;
use LogistiQ\Controllers\OCRController;

// Create app
$app = AppFactory::create();

// Add middleware for CORS
$app->add(new CorsMiddleware());

// Add body parsing middleware
$app->addBodyParsingMiddleware();

// Add routing middleware
$app->addRoutingMiddleware();

// Add error handling middleware
$errorMiddleware = $app->addErrorMiddleware(true, true, true);

// Routes
$app->post('/api/ocr/process', function ($request, $response) {
    $controller = new OCRController();
    return $controller->processImage($request, $response);
});

$app->get('/api/products/{code}', function ($request, $response, $args) {
    $controller = new OCRController();
    return $controller->getProduct($request, $response, $args);
});

$app->get('/api/products/search', function ($request, $response) {
    $controller = new OCRController();
    return $controller->searchProducts($request, $response);
});

// Health check
$app->get('/api/health', function ($request, $response) {
    $response->getBody()->write(json_encode(['status' => 'ok']));
    return $response->withHeader('Content-Type', 'application/json');
});

// Run
$app->run();
