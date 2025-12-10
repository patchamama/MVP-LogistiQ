# LogistiQ MVP - Testing Guide

Guía completa para probar la funcionalidad OCR de LogistiQ MVP usando imágenes de ejemplo.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de que:

- [ ] Backend está corriendo en `http://localhost:8000`
- [ ] Frontend está corriendo en `http://localhost:5173`
- [ ] Tesseract OCR está instalado (ejecutar `./scripts/setup-ocr.sh` si no)
- [ ] Estás en la carpeta raíz del proyecto

## 🚀 Guía Rápida de Inicio

### 1. Terminal 1: Ejecutar Backend
```bash
cd backend
composer install  # Si no está instalado
composer start
```

Esperado:
```
LogistiQ Backend API listening on http://localhost:8000
```

### 2. Terminal 2: Ejecutar Frontend
```bash
cd frontend
npm install  # Si no está instalado
npm run dev
```

Esperado:
```
VITE v... ready in ... ms
➜  Local:   http://localhost:5173/
```

### 3. Abrir aplicación
Abre tu navegador en: **http://localhost:5173**

## 🧪 Plan de Pruebas Completo

### Test 1: Interfaz Básica
**Objetivo:** Verificar que la interfaz carga correctamente

1. Abre http://localhost:5173
2. Verifica que ves:
   - [ ] Título "LogistiQ"
   - [ ] Selector de motor OCR (Tesseract, EasyOCR, Ambos)
   - [ ] Botón "Abrir Cámara"
   - [ ] Botón "Seleccionar Imagen"
   - [ ] Selector de idioma (EN/ES)

**Éxito:** Todos los elementos están visibles

### Test 2: Cambio de Idioma
**Objetivo:** Verificar que multilenguaje funciona

1. Verifica que el idioma inicial es español
2. Haz clic en el selector de idioma (EN/ES)
3. Selecciona inglés
4. Verifica que:
   - [ ] Los textos cambian a inglés
   - [ ] "Abrir Cámara" → "Open Camera"
   - [ ] "Seleccionar Imagen" → "Select Image"
5. Cambia de vuelta a español
6. Verifica que los textos vuelven al español

**Éxito:** El cambio de idioma funciona en ambas direcciones

### Test 3: Carga de Imagen (Tesseract)
**Objetivo:** Verificar reconocimiento OCR con Tesseract

1. Selecciona "Tesseract" en el selector de motor
2. Haz clic en "Seleccionar Imagen"
3. Navega a `tests/`
4. Selecciona `product_12345.png`
5. Verifica que:
   - [ ] La imagen se muestra en la vista previa
   - [ ] El botón "Procesar OCR" está habilitado
6. Haz clic en "Procesar OCR"
7. Espera a que se procese (debería ser rápido)
8. Verifica los resultados:
   - [ ] Se muestra el texto reconocido (debe incluir "12345")
   - [ ] Se muestra la información del producto:
     - Código: 12345
     - Nombre: Tornillo M8x20
     - Descripción: Tornillo métrico 8mm x 20mm
     - Precio: €0.50
     - Stock: 150 unidades
     - Ubicación: Estantería A-3
     - Proveedor: Proveedor A
     - Categoría: Tornillería

**Éxito:** El código se reconoce y el producto se encuentra en la BD

### Test 4: Múltiples Productos
**Objetivo:** Verificar que todos los productos de prueba funcionan

Repite el Test 3 con cada imagen:

#### 4a. Producto 54321 (Arandela de nylon)
```
Código: 54321
Nombre: Arandela de nylon
Precio: €2.50
Stock: 450 unidades
```

#### 4b. Producto 67890 (Tuerca M10)
```
Código: 67890
Nombre: Tuerca M10
Precio: €0.75
Stock: 320 unidades
```

#### 4c. Producto 11111 (Rodamiento 6203)
```
Código: 11111
Nombre: Rodamiento 6203
Precio: €15.99
Stock: 25 unidades
```

#### 4d. Producto 22222 (Cable acero)
```
Código: 22222
Nombre: Cable acero
Precio: €1.20
Stock: 500 unidades
```

**Éxito:** Todos los productos se encuentran correctamente

### Test 5: Comparación de Motores (Opcional)
**Objetivo:** Comparar OCR Tesseract vs EasyOCR

⚠️ Requiere que EasyOCR esté instalado (`./scripts/setup-easyocr.sh`)

1. Carga `product_12345.png`
2. Selecciona "Ambos" en el selector de motor
3. Haz clic en "Procesar OCR"
4. Verifica que:
   - [ ] Se muestra resultado de Tesseract
   - [ ] Se muestra resultado de EasyOCR
   - [ ] Ambos reconocen correctamente el código
   - [ ] Puedes comparar velocidad y precisión

**Éxito:** Ambos motores funcionan y se pueden comparar

### Test 6: Botón Reset/Escanear Nuevo
**Objetivo:** Verificar que puedes escanear múltiples productos

1. Completa el Test 3 (escanea product_12345.png)
2. Verifica que hay un botón "Escanear otro producto" o similar
3. Haz clic en ese botón
4. Selecciona una imagen diferente (ej: product_54321.png)
5. Repite el proceso OCR
6. Verifica que:
   - [ ] La información anterior se borra
   - [ ] Se muestra la información del nuevo producto

**Éxito:** Puedes escanear múltiples productos sin recargar

### Test 7: Manejo de Errores
**Objetivo:** Verificar mensajes de error apropiados

#### 7a. Código inexistente
1. Crea una imagen de prueba con código "99999"
2. Intenta procesarla con OCR
3. Verifica que se muestra:
   - [ ] Mensaje de error claro
   - [ ] "Producto no encontrado"
   - [ ] Opción para intentar de nuevo

#### 7b. Tesseract no instalado (si lo desinstalaste)
1. Selecciona "Tesseract"
2. Intenta procesar una imagen
3. Verifica que se muestra:
   - [ ] Mensaje indicando que Tesseract no está instalado
   - [ ] Instrucciones para instalarlo

**Éxito:** Los errores se manejan correctamente

### Test 8: Responsividad
**Objetivo:** Verificar que funciona en diferentes tamaños de pantalla

1. Abre DevTools (F12)
2. Activa el modo dispositivo (Ctrl+Shift+M)
3. Prueba con diferentes tamaños:
   - [ ] Mobile (375x667)
   - [ ] Tablet (768x1024)
   - [ ] Desktop (1920x1080)
4. Verifica que:
   - [ ] Los elementos se ajustan correctamente
   - [ ] El texto es legible
   - [ ] Los botones son accesibles
   - [ ] La imagen se muestra bien

**Éxito:** La interfaz es responsive

### Test 9: Rendimiento
**Objetivo:** Verificar que el OCR es rápido

1. Abre DevTools (F12) → Pestaña Network
2. Carga `product_12345.png`
3. Selecciona "Tesseract"
4. Procesa la imagen
5. Verifica que:
   - [ ] El procesamiento tarda < 5 segundos
   - [ ] No hay errores en la consola
   - [ ] El endpoint `/api/ocr/process` responde correctamente

**Éxito:** El rendimiento es aceptable

### Test 10: Búsqueda por Nombre (Bonus)
**Objetivo:** Verificar búsqueda de productos (si existe)

Si la aplicación tiene campo de búsqueda:

1. Haz clic en el campo de búsqueda
2. Escribe "Tornillo"
3. Verifica que aparecen productos que coinciden:
   - [ ] Tornillo M8x20

**Éxito:** La búsqueda funciona

## 📊 Matriz de Resultados

Completa esta matriz mientras haces las pruebas:

| Test | Resultado | Notas |
|------|-----------|-------|
| 1. Interfaz | ✓/✗ | |
| 2. Multilenguaje | ✓/✗ | |
| 3. OCR Tesseract | ✓/✗ | |
| 4a. Producto 54321 | ✓/✗ | |
| 4b. Producto 67890 | ✓/✗ | |
| 4c. Producto 11111 | ✓/✗ | |
| 4d. Producto 22222 | ✓/✗ | |
| 5. Comparación OCR | ✓/✗ | Opcional |
| 6. Reset | ✓/✗ | |
| 7. Errores | ✓/✗ | |
| 8. Responsividad | ✓/✗ | |
| 9. Rendimiento | ✓/✗ | |
| 10. Búsqueda | ✓/✗ | Opcional |

## 🐛 Troubleshooting

### Error: CORS
**Síntoma:** Error CORS en la consola
**Solución:**
1. Verifica que el backend está en `http://localhost:8000`
2. Verifica que el CORS está habilitado en `backend/src/Middleware/CorsMiddleware.php`
3. Reinicia el backend

### Error: Tesseract not found
**Síntoma:** "Tesseract no está instalado"
**Solución:**
```bash
./scripts/setup-tesseract.sh
```

### Error: EasyOCR not found
**Síntoma:** "EasyOCR no está instalado"
**Solución:**
```bash
./scripts/setup-easyocr.sh
```

### Producto no encontrado
**Síntoma:** Código se reconoce pero no encuentra el producto
**Solución:**
1. Verifica que el código existe en `backend/data/products.json`
2. Verifica que el código se reconoce correctamente (revisa el texto reconocido)
3. Intenta con otro motor OCR

### Puerto ya en uso
**Síntoma:** "Port 8000 already in use" o similar
**Solución:**
```bash
# Encuentra el proceso usando el puerto
lsof -i :8000

# Mata el proceso
kill -9 <PID>
```

## ✅ Checklist Final

Antes de considerar el MVP completamente probado:

- [ ] Test 1: Interfaz ✓
- [ ] Test 2: Multilenguaje ✓
- [ ] Test 3: OCR Tesseract ✓
- [ ] Test 4: Todos los productos ✓
- [ ] Test 6: Reset ✓
- [ ] Test 8: Responsividad ✓
- [ ] Test 9: Rendimiento ✓
- [ ] No hay errores en la consola ✓
- [ ] No hay errores en el backend ✓

## 📸 Tips para Mejores Resultados

1. **Iluminación:** Asegúrate de una buena iluminación en las imágenes
2. **Contraste:** Los códigos deben tener buen contraste con el fondo
3. **Orientación:** La imagen debe estar derecha (no rotada)
4. **Tamaño:** El código debe ocupar un tamaño decente en la imagen
5. **Claridad:** Evita imágenes borrosas o de baja resolución

## 🎯 Conclusión

Si todos los tests pasan, ¡el MVP está listo para usar!

Para agregar nuevos productos:
1. Añade el producto a `backend/data/products.json`
2. Crea una nueva imagen de prueba (edita `tests/generate_test_images.py`)
3. Ejecuta `python3 tests/generate_test_images.py`
4. Prueba con la nueva imagen

¡Felicidades! Tu LogistiQ MVP está funcional.
