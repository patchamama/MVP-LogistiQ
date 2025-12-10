# Real World Test Images

Documentación sobre imágenes reales del cliente para testing en condiciones de producción.

## 📸 Imágenes Reales Disponibles

### 1. Relé Danowind (100 002 10566)
**Archivo:** `variants/danowind.jpeg`

#### Información del Componente
- **Marca:** Danowind
- **Código:** 100 002 10566
- **Tipo:** Relé electromecánico
- **Envase:** Empaque de plástico transparente

#### Características de la Imagen

**Calidad Fotográfica:**
- ✓ Foto real del cliente
- ✓ Luz natural/ambiental
- ✓ Múltiples objetos en la foto (relé, empaque, etiqueta)
- ✓ Ángulo: Vista superior frontal
- ✓ Enfoque: Parcialmente enfocado en etiqueta

**Desafíos OCR:**

| Desafío | Descripción | Dificultad |
|---------|-------------|-----------|
| **Reflexión de plástico** | Brillo del empaque transparente | Alta |
| **Múltiples elementos** | Relé, plástico, metal visibles | Media |
| **Código con espacios** | "100 002 10566" (números separados) | Media |
| **Tipografía monoespaciada** | Fuente monospace (típica industrial) | Baja |
| **Fondo variable** | Mezcla de plástico, metal, papel | Alta |
| **Perspectiva** | Imagen ligeramente inclinada | Baja |

**Factores Positivos:**
✓ Etiqueta clara (fondo blanco)
✓ Contraste alto (texto oscuro)
✓ Código bien definido
✓ Tamaño legible

#### Especificaciones Técnicas

```
Resolución: 3024 × 4032 px (12 megapíxeles)
Formato: JPEG
Tamaño de archivo: ~2.5 MB
Proporción: 3:4 (vertical)
DPI: Variable (típico de smartphone)
Tipo de cámara: Smartphone (probablemente iPhone o Android)
```

#### Códigos a Extraer

**Código Principal:**
```
100 002 10566
```

**Ubicación:** Etiqueta blanca en parte superior central

**Formato:** `XXX XXX XXXXX` (números separados por espacios)

**Estructura:**
- Prefijo: `100`
- Código intermedio: `002`
- Sufijo: `10566`

#### Contexto de Negocio

Este relé es un componente real del inventario del cliente, lo que hace que esta imagen sea:
- **Representativa** de casos de uso reales
- **Desafiante** para OCR (foto no profesional)
- **Valiosa** para validar en condiciones reales

## 🧪 Plan de Testing con Imagen Real

### Test: OCR en Condiciones Reales

**Objetivo:** Validar OCR con imagen real del cliente

**Procedimiento:**
1. Carga la imagen: `variants/danowind.jpeg`
2. Procesa con **Tesseract**
3. Registra:
   - ¿Se reconoce el código `100 002 10566`?
   - ¿O reconoce `10000210566` (sin espacios)?
   - ¿O reconoce parcialmente?
4. Procesa con **EasyOCR**
5. Compara resultados
6. Anota observaciones

**Resultado Esperado:**
- Tesseract: Podría reconocer como `100 002 10566` o `10000210566`
- EasyOCR: Mejor manejo de espacios y contexto

**Notas Importantes:**
- ⚠️ La imagen real es más desafiante que imágenes sintéticas
- ⚠️ Es un buen indicador de rendimiento en campo
- ⚠️ Reflejo del plástico puede afectar OCR
- ⚠️ Ideal para detectar limitaciones del sistema

## 📋 Matriz de Comparación: Sintéticas vs Reales

| Aspecto | Imágenes Sintéticas | Imagen Real |
|---------|-------------------|-------------|
| **Control** | Total | Ninguno |
| **Realismo** | Medio | Alto |
| **Tipografía** | Clara | Clara pero con reflexión |
| **Fondo** | Puro | Natural/mixto |
| **Ángulo** | Perfecto | Ligeramente inclinado |
| **Iluminación** | Uniforme | Ambiental |
| **Contraste** | Alto | Medio-Alto |
| **Enfoque** | Perfecto | Parcialmente desenfocado |
| **Desafío OCR** | Bajo-Medio | Medio-Alto |

## 💡 Recomendaciones para Más Imágenes Reales

Si el cliente proporciona más imágenes:

1. **Organización:**
   ```
   tests/real-world/
   ├── danowind.jpeg
   ├── [otros-clientes]/
   └── [otros-productos]/
   ```

2. **Documentación:**
   - Crear archivo de metadatos
   - Registrar código esperado
   - Anotar desafíos específicos

3. **Testing:**
   - Siempre probar con imagen real
   - Comparar con sintéticas
   - Registrar diferencias

## 🎯 Ventajas de Imágenes Reales

✓ **Realismo:** Reproducen casos reales de uso
✓ **Validación:** Prueban limitaciones del sistema
✓ **Mejora:** Identifican áreas de optimización
✓ **Confianza:** Demuestran capacidad en campo
✓ **Feedback:** Ayudan a mejorar el OCR

## ⚠️ Limitaciones de Imágenes Reales

⚠️ No son reproducibles (ángulo, luz, etc.)
⚠️ Pueden contener ruido visual
⚠️ Requieren documentación detallada
⚠️ Cada foto es única
⚠️ Difíciles de generar automáticamente

## 🔍 Análisis Detallado: Imagen Danowind

### Descomposición Visual

**Zona Superior:**
- Etiqueta blanca con código
- Código: `100 002 10566`
- Tipografía: Monospace regular
- Contraste: Muy alto

**Zona Media:**
- Relé electromecánico (componente principal)
- Color: Negro/gris oscuro
- Elementos: Bobina, contactos, estructura
- Reflexión: Moderada

**Zona Inferior:**
- Empaque de plástico transparente
- Reflejo considerable de luz
- Marca: `DANOWIND` en rojo
- Información adicional: Especificaciones técnicas

### Factores que Facilitan OCR
✓ Etiqueta limpia
✓ Contraste alto en etiqueta
✓ Fuente clara
✓ Código principal visible

### Factores que Dificultan OCR
⚠️ Reflexiones de plástico alrededor
⚠️ Fondo variable (mixto)
⚠️ Foto de smartphone (no profesional)
⚠️ Espacios en código pueden confundir

## 📊 Casos de Prueba Específicos

### Test 1: Reconocimiento Exacto
```
Código Esperado: 100 002 10566
Código Reconocido: ?
Resultado: ✓ Si coincide exactamente
```

### Test 2: Tolerancia de Espacios
```
¿El sistema acepta "100 002 10566"?
¿El sistema acepta "10000210566" (sin espacios)?
¿El sistema busca productos correctamente?
```

### Test 3: Búsqueda de Producto
```
Si OCR reconoce "100 002 10566":
¿Encuentra el producto en la BD?
¿Muestra información correcta?
¿Precio, stock, ubicación?
```

### Test 4: Fallback y Corrección
```
Si OCR reconoce "100 002 10586" (dígito erróneo):
¿Sugerencias alternativas?
¿Búsqueda fuzzy?
¿Mensaje de error apropiado?
```

## 🚀 Uso en Testing

### Opción 1: Testing Manual
1. Abre http://localhost:5173
2. "Seleccionar Imagen" → `variants/danowind.jpeg`
3. Procesa con Tesseract/EasyOCR
4. Anota resultados

### Opción 2: Comparación
1. Procesa danowind.jpeg con Tesseract
2. Procesa `12345_white_modern.png` con Tesseract
3. Compara precisión y tiempo
4. Evalúa diferencia sintético vs real

### Opción 3: Benchmark
1. Procesa danowind.jpeg 5 veces
2. Mide tiempo promedio
3. Nota consistencia
4. Evalúa confiabilidad

## 📈 Métricas Recomendadas

Para la imagen real, registra:

```json
{
  "imagen": "danowind.jpeg",
  "codigo_esperado": "100 002 10566",
  "fecha_test": "2025-12-10",
  "tesseract": {
    "codigo_reconocido": "?",
    "tiempo_ms": "?",
    "confianza": "?",
    "exitoso": true/false
  },
  "easyocr": {
    "codigo_reconocido": "?",
    "tiempo_ms": "?",
    "confianza": "?",
    "exitoso": true/false
  },
  "notas": "..."
}
```

## 💾 Archivos Relacionados

- `ADVANCED_IMAGES.md` - Imágenes sintéticas generadas
- `TESTING_GUIDE.md` - Plan completo de testing
- `INDEX.md` - Índice general

---

**Tipo de Imagen:** Real (cliente)
**Componente:** Relé Danowind
**Código:** 100 002 10566
**Desafío OCR:** Medio-Alto
**Valor de Testing:** Alto
**Última actualización:** 2025-12-10
