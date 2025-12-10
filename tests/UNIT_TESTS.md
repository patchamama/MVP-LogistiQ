# Unit Tests for OCR Engines

Documentación completa de tests unitarios para validar Tesseract y EasyOCR.

## 📋 Descripción

Suite de tests unitarios que valida que ambos motores OCR (Tesseract y EasyOCR) reconocen correctamente los códigos de productos en todas las imágenes de prueba.

## 🎯 Objetivos

✓ Validar que Tesseract reconoce códigos correctamente
✓ Validar que EasyOCR reconoce códigos correctamente
✓ Comparar precisión entre ambos motores
✓ Identificar tipografías problemáticas
✓ Validar integridad de imágenes de prueba
✓ Documentar resultados OCR

## 📦 Dependencias

```bash
# Instalar pytest
pip3 install pytest

# Para Tesseract OCR
./scripts/setup-tesseract.sh

# Para EasyOCR (opcional)
./scripts/setup-easyocr.sh
```

## 🧪 Cobertura de Tests

### Categoría 1: Validación de Imágenes
- ✓ test_basic_image_exists - Verifica 5 imágenes básicas
- ✓ test_advanced_image_exists - Verifica 20 imágenes avanzadas
- ✓ test_real_world_image_exists - Verifica imagen real cliente
- ✓ test_basic_images_count - Confirma 5 imágenes básicas
- ✓ test_advanced_images_count - Confirma 20 imágenes avanzadas
- ✓ test_real_world_images_count - Confirma imagen real

**Total:** 6 tests de validación

### Categoría 2: Tests Tesseract
- ✓ test_basic_images_tesseract (5 tests) - OCR en básicas
- ✓ test_advanced_images_tesseract (5 tests) - OCR en avanzadas (sample)
- ✓ test_real_world_images_tesseract (1 test) - OCR en imagen real

**Total:** 11 tests Tesseract

### Categoría 3: Tests EasyOCR
- ✓ test_basic_images_easyocr (5 tests) - OCR en básicas
- ✓ test_advanced_images_easyocr (5 tests) - OCR en avanzadas (sample)
- ✓ test_real_world_images_easyocr (1 test) - OCR en imagen real

**Total:** 11 tests EasyOCR

### Categoría 4: Tests de Comparación
- ✓ test_at_least_one_engine_available
- ✓ test_tesseract_installed
- ✓ test_easyocr_installed

**Total:** 3 tests de comparación

**Total General:** 31 tests

## 🚀 Cómo Ejecutar

### Opción 1: Todos los tests
```bash
cd tests
pytest test_ocr_engines.py -v
```

### Opción 2: Solo tests de validación
```bash
cd tests
pytest test_ocr_engines.py::TestImageValidation -v
```

### Opción 3: Solo tests Tesseract
```bash
cd tests
pytest test_ocr_engines.py::TestTesseractOCR -v
```

### Opción 4: Solo tests EasyOCR
```bash
cd tests
pytest test_ocr_engines.py::TestEasyOCROCR -v
```

### Opción 5: Solo tests de comparación
```bash
cd tests
pytest test_ocr_engines.py::TestOCRComparison -v
```

### Opción 6: Tests específicos de imagen
```bash
# Solo imágenes básicas
pytest test_ocr_engines.py -k "basic_images" -v

# Solo imágenes avanzadas
pytest test_ocr_engines.py -k "advanced_images" -v

# Solo imágenes reales
pytest test_ocr_engines.py -k "real_world" -v
```

## 📊 Estructura de Tests

### TestImageValidation
Valida que todas las imágenes existen y son accesibles.

```python
✓ test_basic_image_exists(filename, _)
✓ test_advanced_image_exists(filename, _)
✓ test_real_world_image_exists(filename)
✓ test_basic_images_count()
✓ test_advanced_images_count()
✓ test_real_world_images_count()
```

### TestTesseractOCR
Valida reconocimiento con Tesseract.

```python
✓ test_basic_images_tesseract(filename, expected_code)
  - Procesa 5 imágenes básicas
  - Verifica que reconoce código esperado

✓ test_advanced_images_tesseract(filename, expected_code)
  - Procesa 5 imágenes avanzadas (sample)
  - Valida múltiples tipografías

✓ test_real_world_images_tesseract(filename, expected_code, variations)
  - Procesa imagen real del cliente
  - Acepta variaciones de código (ej: con/sin espacios)
```

### TestEasyOCROCR
Valida reconocimiento con EasyOCR.

```python
✓ test_basic_images_easyocr(filename, expected_code)
  - Procesa 5 imágenes básicas
  - Verifica que reconoce código esperado

✓ test_advanced_images_easyocr(filename, expected_code)
  - Procesa 5 imágenes avanzadas (sample)
  - Valida múltiples tipografías

✓ test_real_world_images_easyocr(filename, expected_code, variations)
  - Procesa imagen real del cliente
  - Acepta variaciones de código
```

### TestOCRComparison
Valida disponibilidad de motores.

```python
✓ test_at_least_one_engine_available()
  - Verifica que al menos un motor está disponible

✓ test_tesseract_installed()
  - Verifica Tesseract está instalado

✓ test_easyocr_installed()
  - Verifica EasyOCR está instalado
```

## 📈 Flujo de Ejecución

```
┌─────────────────────────────────────┐
│ Validar Imágenes Existen            │
│ (6 tests - rápido)                  │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Verificar Motores Disponibles       │
│ (3 tests)                           │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Procesar con Tesseract              │
│ (11 tests - si disponible)          │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Procesar con EasyOCR                │
│ (11 tests - si disponible)          │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Reportar Resultados                 │
└─────────────────────────────────────┘
```

## ✅ Resultados Esperados

### Imágenes Básicas
```
TESSERACT:
✓ product_12345.png → "12345" ✓
✓ product_54321.png → "54321" ✓
✓ product_67890.png → "67890" ✓
✓ product_11111.png → "11111" ✓
✓ product_22222.png → "22222" ✓

EASYOCR:
✓ product_12345.png → "12345" ✓
✓ product_54321.png → "54321" ✓
✓ product_67890.png → "67890" ✓
✓ product_11111.png → "11111" ✓
✓ product_22222.png → "22222" ✓
```

### Imágenes Avanzadas (Sample)
```
TESSERACT (Helvetica Bold):
✓ 12345_white_modern.png → "12345" ✓
✓ 54321_white_modern.png → "54321" ✓
✓ 67890_white_modern.png → "67890" ✓
✓ 11111_white_modern.png → "11111" ✓
✓ 22222_white_modern.png → "22222" ✓

EASYOCR (Helvetica Bold):
✓ 12345_white_modern.png → "12345" ✓
✓ 54321_white_modern.png → "54321" ✓
✓ 67890_white_modern.png → "67890" ✓
✓ 11111_white_modern.png → "11111" ✓
✓ 22222_white_modern.png → "22222" ✓
```

### Imagen Real Cliente
```
TESSERACT:
✓ danowind.jpeg → "100002" o "100 002 10566" ✓

EASYOCR:
✓ danowind.jpeg → "100002" o "100 002 10566" ✓
```

## 🔍 Interpretación de Resultados

### Test Passou ✓
- Imagen encontrada
- OCR procesó correctamente
- Código reconocido correctamente
- Motor funcionando bien

### Test Falló ✗
- Imagen no encontrada → Verificar carpeta tests/
- OCR falló → Verificar instalación del motor
- Código incorrecto → Tipografía problemática

### Test Skipped ⊘
- Motor no disponible
- Ejecución con pytest -v muestra "SKIPPED"

## 🛠️ Solución de Problemas

### Error: "Tesseract not found"
```bash
./scripts/setup-tesseract.sh
```

### Error: "EasyOCR not installed"
```bash
./scripts/setup-easyocr.sh
```

### Error: "Image not found"
```bash
# Verificar que estás en carpeta tests/
cd tests
pytest test_ocr_engines.py -v
```

### Error: "No OCR engines available"
```bash
# Necesitas instalar al menos uno:
./scripts/setup-ocr.sh
```

## 📊 Métricas Registradas

### Por Test Exitoso:
- ✓ Nombre del archivo
- ✓ Código esperado
- ✓ Código reconocido
- ✓ Motor utilizado
- ✓ Tiempo de ejecución

### Por Test Fallido:
- ✗ Código esperado
- ✗ Código obtenido
- ✗ Razón del fallo
- ✗ Sugerencias de solución

## 🎯 Uso en CI/CD

Los tests pueden integrarse en pipeline CI/CD:

```bash
# En pipeline (ej: GitHub Actions)
- name: Run OCR Tests
  run: |
    cd tests
    pytest test_ocr_engines.py -v --tb=short
```

## 📝 Extensiones Futuras

Posibles mejoras:

1. **Tests de Rendimiento**
   - Medir tiempo de procesamiento
   - Validar que OCR completa < 5s

2. **Tests de Confianza**
   - Validar score de confianza OCR
   - Threshold mínimo de confianza

3. **Tests de Robustez**
   - Agregar ruido a imágenes
   - Validar tolerancia a variaciones

4. **Tests de Comparación Detallada**
   - Matriz de aciertos/fallos
   - Análisis por tipografía
   - Análisis por motor

## 💾 Archivo de Configuración (pytest.ini)

El archivo `pytest.ini` configura:
- Patrones de descubrimiento de tests
- Nivel de verbosidad
- Markers personalizados
- Timeout (120 segundos para EasyOCR)
- Log file (`test_results.log`)

## 🚀 Recomendaciones

1. **Ejecutar primero validación:**
   ```bash
   pytest test_ocr_engines.py::TestImageValidation -v
   ```

2. **Instalar motores según necesidad:**
   - Para Tesseract: `./scripts/setup-tesseract.sh`
   - Para ambos: `./scripts/setup-ocr.sh`

3. **Revisar logs:**
   ```bash
   cat test_results.log
   ```

4. **Ejecutar antes de commit:**
   ```bash
   pytest tests/test_ocr_engines.py -v
   ```

## 📋 Checklist Pre-Testing

- [ ] Pytest instalado: `pip3 install pytest`
- [ ] Tests descargados: `tests/test_ocr_engines.py`
- [ ] Imágenes presentes: `tests/product_*.png` + `tests/variants/`
- [ ] Al menos un motor OCR instalado
- [ ] Tesseract o EasyOCR disponible
- [ ] Espacio en disco: ~2 GB (para EasyOCR)
- [ ] Conexión a internet (para descargar modelos EasyOCR)

## ✨ Conclusión

Esta suite de tests proporciona:
- ✓ Validación automática de OCR
- ✓ Cobertura completa de imágenes
- ✓ Comparación entre motores
- ✓ Documentación de resultados
- ✓ Integración CI/CD lista

¡Los tests están listos para validar que tu OCR funciona correctamente!

---

**Archivo:** `tests/test_ocr_engines.py`
**Configuración:** `tests/pytest.ini`
**Total de tests:** 31
**Tiempo estimado:** 30-60 segundos (Tesseract) o 5-10 minutos (EasyOCR con primer uso)
