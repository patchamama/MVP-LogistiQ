<?php

namespace LogistiQ\Services;

class ProductService
{
    private string $dataPath;

    public function __construct(string $dataPath = __DIR__ . '/../../data/products.json')
    {
        $this->dataPath = $dataPath;
    }

    /**
     * Get product by code
     */
    public function getProductByCode(string $code): ?array
    {
        $products = $this->getAllProducts();

        foreach ($products as $product) {
            if ($product['code'] === $code) {
                return $product;
            }
        }

        return null;
    }

    /**
     * Get all products
     */
    public function getAllProducts(): array
    {
        if (!file_exists($this->dataPath)) {
            return [];
        }

        $json = file_get_contents($this->dataPath);
        $data = json_decode($json, true);

        return $data['products'] ?? [];
    }

    /**
     * Search products by query (searches in name and description)
     */
    public function searchProducts(string $query): array
    {
        $products = $this->getAllProducts();
        $query = strtolower($query);
        $results = [];

        foreach ($products as $product) {
            if (
                strpos(strtolower($product['code']), $query) !== false ||
                strpos(strtolower($product['name']), $query) !== false ||
                strpos(strtolower($product['description']), $query) !== false
            ) {
                $results[] = $product;
            }
        }

        return $results;
    }
}
