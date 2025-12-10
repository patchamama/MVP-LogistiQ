# LogistiQ MVP - Test Images

Esta carpeta contiene imágenes de prueba para validar la funcionalidad OCR de LogistiQ MVP.

## 📸 Imágenes Disponibles

### Productos de Prueba

| Código | Archivo | Producto | Precio | Color |
|--------|---------|----------|--------|-------|
| 12345 | product_12345.png | Tornillo M8x20 | €0.50 | Rojo |
| 54321 | product_54321.png | Arandela de nylon | €2.50 | Azul oscuro |
| 67890 | product_67890.png | Tuerca M10 | €0.75 | Azul claro |
| 11111 | product_11111.png | Rodamiento 6203 | €15.99 | Amarillo |
| 22222 | product_22222.png | Cable acero | €1.20 | Verde agua |

## 🚀 Cómo Usar

### Paso 1: Ejecutar la aplicación

Asegúrate de que tanto el frontend como el backend están corriendo:

```bash
# Terminal 1: Backend
cd backend
composer start

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Paso 2: Acceder a la aplicación

Abre tu navegador en: **http://localhost:5173**

### Paso 3: Cargar una imagen de prueba

1. Haz clic en el botón **"Seleccionar Imagen"**
2. Navega a la carpeta `tests/`
3. Selecciona una de las imágenes de producto (ej: `product_12345.png`)
4. La imagen se cargará en la vista previa

### Paso 4: Procesar con OCR

1. Selecciona el motor OCR a usar:
   - **Tesseract**: Rápido y maduro (recomendado para empezar)
   - **EasyOCR**: Más preciso pero requiere Python
   - **Ambos**: Compara ambos motores

2. Haz clic en el botón **"Procesar OCR"**

### Paso 5: Verificar resultados

La aplicación debería:
- ✅ Reconocer el código del producto (ej: `12345`)
- ✅ Buscar el producto en la base de datos
- ✅ Mostrar información del producto:
  - Nombre completo
  - Descripción
  - Precio
  - Stock disponible
  - Ubicaciones
  - Proveedor

## 🔧 Regenerar Imágenes

Si necesitas regenerar las imágenes de prueba (ej: con cambios en los datos):

```bash
# En la carpeta tests/
python3 generate_test_images.py
```

### Personalizar imágenes

Puedes editar el script `generate_test_images.py` para:
- Cambiar los colores de las etiquetas
- Agregar más productos
- Modificar el diseño de las etiquetas
- Cambiar tamaños y fuentes

## 📊 Casos de Prueba

### Test 1: OCR Básico (Tesseract)
1. Carga `product_12345.png`
2. Selecciona "Tesseract"
3. Verifica que reconoce el código `12345`

### Test 2: Búsqueda de Producto
1. Carga cualquier imagen
2. Verifica que encuentra el producto correcto
3. Comprueba que muestra todos los datos

### Test 3: Multilenguaje (si está activado)
1. Carga una imagen
2. Cambia el idioma (inglés/español)
3. Verifica que los textos se actualizan

### Test 4: Comparación de Motores
1. Carga `product_22222.png` (código más pequeño)
2. Procesa con Tesseract
3. Procesa con EasyOCR
4. Compara precisión y velocidad

### Test 5: Manejo de Errores
1. Intenta cargar una imagen sin código
2. Intenta cargar una imagen con código inexistente
3. Verifica mensajes de error apropiados

## 🎯 Checklist de Validación

- [ ] Las imágenes cargan correctamente
- [ ] Tesseract reconoce los códigos
- [ ] EasyOCR reconoce los códigos
- [ ] Los productos se encuentran en la BD
- [ ] Se muestran todos los datos del producto
- [ ] El diseño responsive funciona bien
- [ ] Los idiomas se cambian correctamente
- [ ] Los mensajes de error son claros

## 📝 Notas

- Las imágenes son sintéticas pero realistas
- Están optimizadas para OCR
- Contienen información de todos los campos de prueba
- Se pueden usar para entrenar modelos OCR si es necesario

## 🐛 Troubleshooting

### Error: "Producto no encontrado"
- Verifica que el código sea reconocido correctamente
- Intenta con otro motor OCR
- Comprueba que el producto existe en `backend/data/products.json`

### Error: "No se pudo guardar la imagen"
- Verifica permisos en la carpeta `backend/uploads`
- Comprueba que la imagen es un formato válido (PNG, JPG)

### Código reconocido incorrectamente
- Intenta usar "EasyOCR" o "Ambos"
- Ajusta la iluminación o el ángulo de la cámara
- Verifica la calidad de la imagen
