#!/bin/bash

# Script de prueba para MiniBACKEND
# Uso: ./test_minibackend.sh

set -e

echo "=========================================="
echo "🧪 Tests del MiniBACKEND"
echo "=========================================="

MINI_API="http://localhost:9000/api"
TEST_RESULTS=()

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Función para imprimir resultados
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local expected_code=$5

  echo ""
  echo -e "${YELLOW}Test: $name${NC}"
  echo "Endpoint: $method $endpoint"

  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$MINI_API$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$MINI_API$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  echo "HTTP Status: $http_code"
  echo "Response: $(echo "$body" | jq '.' 2>/dev/null || echo "$body")"

  if [ "$http_code" == "$expected_code" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    TEST_RESULTS+=("PASS: $name")
  else
    echo -e "${RED}✗ FAIL (esperado $expected_code, recibido $http_code)${NC}"
    TEST_RESULTS+=("FAIL: $name")
  fi
}

# 1. Health Check
test_endpoint "Health Check" "GET" "/health" "" "200"

# 2. Obtener Fabricantes (vacío)
test_endpoint "Get Manufacturers (empty)" "GET" "/manufacturers" "" "200"

# 3. Check Reference (no existe)
test_endpoint "Check Reference (not found)" "GET" "/check-reference?ref=TEST-REF" "" "200"

# 4. Create Entry
entry_json='{
  "referencia": "M8x20-INOX",
  "fabricante": "Tornillos S.A.",
  "cantidad": 500,
  "operario": "Test User",
  "observaciones": "Test entry",
  "imagenes": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="]
}'

test_endpoint "Create Entry" "POST" "/entry" "$entry_json" "201"

# 5. Check Reference (ahora existe)
test_endpoint "Check Reference (found)" "GET" "/check-reference?ref=M8x20-INOX" "" "200"

# 6. Get Manufacturers (ahora tiene datos)
test_endpoint "Get Manufacturers (with data)" "GET" "/manufacturers" "" "200"

# 7. Get Entries
test_endpoint "Get Entries" "GET" "/entries?limit=50&offset=0" "" "200"

# 8. Test Invalid Data
invalid_json='{
  "referencia": "TEST",
  "fabricante": "Test"
}'

test_endpoint "Create Entry (invalid)" "POST" "/entry" "$invalid_json" "400"

# 9. Test Missing Reference
test_endpoint "Check Reference (missing param)" "GET" "/check-reference" "" "400"

# 10. Test 404
test_endpoint "Invalid Endpoint (404)" "GET" "/nonexistent" "" "404"

echo ""
echo "=========================================="
echo "📊 Resumen de Tests"
echo "=========================================="

passed=0
failed=0

for result in "${TEST_RESULTS[@]}"; do
  if [[ $result == "PASS"* ]]; then
    echo -e "${GREEN}✓ $result${NC}"
    ((passed++))
  else
    echo -e "${RED}✗ $result${NC}"
    ((failed++))
  fi
done

echo ""
echo "Total: ${#TEST_RESULTS[@]} tests"
echo -e "Pasados: ${GREEN}$passed${NC}"
echo -e "Fallidos: ${RED}$failed${NC}"

if [ $failed -eq 0 ]; then
  echo -e "${GREEN}🎉 Todos los tests pasaron!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Algunos tests fallaron${NC}"
  exit 1
fi
