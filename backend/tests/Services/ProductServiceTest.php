<?php

namespace LogistiQ\Tests\Services;

use PHPUnit\Framework\TestCase;
use LogistiQ\Services\ProductService;

class ProductServiceTest extends TestCase
{
    private ProductService $productService;
    private string $testDataPath;

    protected function setUp(): void
    {
        $this->testDataPath = __DIR__ . '/../data/products.json';
        $this->productService = new ProductService($this->testDataPath);
    }

    public function testGetProductByCodeFound(): void
    {
        $product = $this->productService->getProductByCode('12345');

        $this->assertNotNull($product);
        $this->assertEquals('12345', $product['code']);
        $this->assertEquals('Tornillo M8x20', $product['name']);
        $this->assertEquals(0.50, $product['price']);
        $this->assertEquals(150, $product['stock']);
    }

    public function testGetProductByCodeNotFound(): void
    {
        $product = $this->productService->getProductByCode('INVALID');

        $this->assertNull($product);
    }

    public function testGetAllProducts(): void
    {
        $products = $this->productService->getAllProducts();

        $this->assertIsArray($products);
        $this->assertCount(2, $products);
        $this->assertEquals('12345', $products[0]['code']);
        $this->assertEquals('54321', $products[1]['code']);
    }

    public function testSearchProductsByCode(): void
    {
        $results = $this->productService->searchProducts('12345');

        $this->assertCount(1, $results);
        $this->assertEquals('12345', $results[0]['code']);
    }

    public function testSearchProductsByName(): void
    {
        $results = $this->productService->searchProducts('Tornillo');

        $this->assertCount(1, $results);
        $this->assertEquals('Tornillo M8x20', $results[0]['name']);
    }

    public function testSearchProductsByDescription(): void
    {
        $results = $this->productService->searchProducts('métrico');

        $this->assertCount(1, $results);
        $this->assertEquals('12345', $results[0]['code']);
    }

    public function testSearchProductsNoResults(): void
    {
        $results = $this->productService->searchProducts('NONEXISTENT');

        $this->assertIsArray($results);
        $this->assertEmpty($results);
    }

    public function testSearchProductsCaseInsensitive(): void
    {
        $results = $this->productService->searchProducts('ARANDELA');

        $this->assertCount(1, $results);
        $this->assertEquals('54321', $results[0]['code']);
    }

    public function testGetProductHasAllFields(): void
    {
        $product = $this->productService->getProductByCode('12345');

        $this->assertArrayHasKey('code', $product);
        $this->assertArrayHasKey('name', $product);
        $this->assertArrayHasKey('description', $product);
        $this->assertArrayHasKey('price', $product);
        $this->assertArrayHasKey('stock', $product);
        $this->assertArrayHasKey('locations', $product);
        $this->assertArrayHasKey('supplier', $product);
        $this->assertArrayHasKey('category', $product);
    }

    public function testGetProductLocationsIsArray(): void
    {
        $product = $this->productService->getProductByCode('12345');

        $this->assertIsArray($product['locations']);
        $this->assertContains('Estantería A-3', $product['locations']);
    }
}
