# Advanced Test Images Documentation

Documentación sobre las imágenes avanzadas de prueba para validar OCR con múltiples tipografías y estilos.

## 📸 Tipos de Imágenes

### 1. Imágenes Básicas (Original)
Ubicación: `tests/product_*.png`

- **Fondo:** Colores sólidos diferentes para cada producto
- **Fuente:** Helvetica simple
- **Tamaño:** 400x300px
- **Total:** 5 imágenes (una por producto)

Uso: Pruebas rápidas y básicas

### 2. Imágenes Avanzadas (Nuevas)
Ubicación: `tests/variants/`

- **Fondo:** Blanco con textura metalizada sutil
- **Múltiples fuentes:** Helvetica, Times, Courier
- **Tamaño:** 500x400px (más grande para mejor OCR)
- **Total:** 20 imágenes (4 variantes × 5 productos)

## 🎨 Variantes Disponibles

Cada producto tiene 4 variantes:

### Variante 1: `white_modern` (Helvetica Bold)
- **Tipografía:** Helvetica Bold
- **Estilo:** Moderno y limpio
- **Caso de uso:** Etiquetas de almacén contemporáneas
- **Desafío OCR:** Fuente estándar moderna

**Archivos:**
- `12345_white_modern.png` - Tornillo M8x20
- `54321_white_modern.png` - Arandela de nylon
- `67890_white_modern.png` - Tuerca M10
- `11111_white_modern.png` - Rodamiento 6203
- `22222_white_modern.png` - Cable acero

### Variante 2: `white_classic` (Times Regular)
- **Tipografía:** Times Roman
- **Estilo:** Clásico y formal
- **Caso de uso:** Etiquetas impresas tradicionales
- **Desafío OCR:** Serifs (pueden ser difíciles para OCR)

**Archivos:**
- `12345_white_classic.png`
- `54321_white_classic.png`
- `67890_white_classic.png`
- `11111_white_classic.png`
- `22222_white_classic.png`

### Variante 3: `white_monospace` (Courier Regular)
- **Tipografía:** Courier (monoespaciada)
- **Estilo:** Máquina de escribir / código
- **Caso de uso:** Impresoras de código de barras antiguas
- **Desafío OCR:** Monoespaciada (típica de sistemas industriales)

**Archivos:**
- `12345_white_monospace.png`
- `54321_white_monospace.png`
- `67890_white_monospace.png`
- `11111_white_monospace.png`
- `22222_white_monospace.png`

### Variante 4: `white_mono_bold` (Courier Bold)
- **Tipografía:** Courier Bold
- **Estilo:** Robusto y legible
- **Caso de uso:** Etiquetas de almacén antiguas
- **Desafío OCR:** Bold monoespaciada

**Archivos:**
- `12345_white_mono_bold.png`
- `54321_white_mono_bold.png`
- `67890_white_mono_bold.png`
- `11111_white_mono_bold.png`
- `22222_white_mono_bold.png`

## 🔧 Características Especiales

### Fondo Blanco con Textura Metálica
Simula la apariencia de una pieza o etiqueta real:
- Fondo blanco principal (250, 250, 250)
- Variaciones sutiles de gris para profundidad
- Patrón diagonal tipo máquina fresada
- Blur suave para un acabado profesional

### Patrones de Piezas
Cada imagen incluye un patrón visual que representa el tipo de pieza:

#### Tornillo (Screw)
```
Patrón: Espiral simple
Ubicación: Parte inferior central
Representa: Rosca helicoidal
```

#### Arandela (Washer)
```
Patrón: Círculos concéntricos
Ubicación: Parte inferior central
Representa: Vista superior de arandela
```

#### Tuerca (Nut)
```
Patrón: Hexágono
Ubicación: Parte inferior central
Representa: Vista frontal de tuerca métrica
```

#### Rodamiento (Bearing)
```
Patrón: Círculo con bolillas interiores
Ubicación: Parte inferior central
Representa: Vista transversal de rodamiento
```

#### Cable (Cable)
```
Patrón: Patrón ondulado
Ubicación: Parte inferior central
Representa: Torsión del cable
```

### Bordes y Separadores
- **Borde externo:** Línea gris de 2px simulando etiqueta delimitada
- **Separador horizontal:** Entre nombre y código
- **Caja de código:** Fondo ligeramente diferente para destacar

### Código de Barras
Incluye patrón de barras simulado:
- 25 barras alternadas
- Alturas variables para simular código real
- Código impreso debajo de las barras

## 📏 Especificaciones Técnicas

### Tamaño de Imagen
- **Ancho:** 500px
- **Altura:** 400px
- **Resolución:** 96 DPI (estándar web)

### Colores Base
```
Fondo blanco: RGB(250, 250, 250)
Texto principal: RGB(40, 40, 40) - Casi negro
Precio: RGB(60, 120, 200) - Azul
Bordes: RGB(180, 180, 180) - Gris medio
Barras: RGB(100, 100, 100) - Gris oscuro
```

### Tamaños de Fuente
- **Nombre producto:** 22-24px
- **Código:** 60px (lo más importante)
- **Precio:** 16px
- **Código en barras:** 16px

## 🧪 Plan de Pruebas Detallado

### Test A: Compatibilidad de Fuentes
1. Procesa `12345_white_modern.png` con Tesseract
2. Procesa `12345_white_classic.png` con Tesseract
3. Procesa `12345_white_monospace.png` con Tesseract
4. Procesa `12345_white_mono_bold.png` con Tesseract
5. Compara resultados

**Esperado:** Todos reconocen correctamente el código `12345`

### Test B: Comparación de Motores
Para cada variante:
1. Procesa con Tesseract
2. Procesa con EasyOCR
3. Compara velocidad y precisión

**Métrica:** ¿Cuál motor reconoce mejor cada tipografía?

### Test C: Robustez del OCR
1. Procesa todas las 20 imágenes
2. Registra tasa de éxito por variante
3. Identifica cual tipografía es más problemática

**Esperado:** >95% de tasa de éxito en todas las variantes

### Test D: Rendimiento
1. Procesa una variante 10 veces
2. Mide tiempo promedio
3. Compara con imágenes básicas

**Métrica:** ¿Hay diferencia significativa de rendimiento?

## 📊 Matriz de Pruebas

```
Producto      | Variante 1 | Variante 2 | Variante 3 | Variante 4
              | (Helvetica | (Times)    | (Courier)  | (Courier
              |  Bold)     |            |            |  Bold)
______________|___________|___________|___________|___________
12345         |     ✓      |     ✓      |     ✓      |     ✓
(Tornillo)    |            |            |            |
______________|___________|___________|___________|___________
54321         |     ✓      |     ✓      |     ✓      |     ✓
(Arandela)    |            |            |            |
______________|___________|___________|___________|___________
67890         |     ✓      |     ✓      |     ✓      |     ✓
(Tuerca)      |            |            |            |
______________|___________|___________|___________|___________
11111         |     ✓      |     ✓      |     ✓      |     ✓
(Rodamiento)  |            |            |            |
______________|___________|___________|___________|___________
22222         |     ✓      |     ✓      |     ✓      |     ✓
(Cable)       |            |            |            |
______________|___________|___________|___________|___________
```

## 🎯 Recomendaciones de Uso

### Para Validación Rápida
Usa imágenes **básicas** (`tests/product_*.png`):
- Más pequeñas (carga rápida)
- Fáciles de procesar
- Buen para pruebas iniciales

### Para Validación Completa
Usa imágenes **avanzadas** (`tests/variants/`):
- Múltiples tipografías
- Fondos realistas
- Simula casos reales de uso

### Para Comparación de Motores
Usa **todas** las variantes:
- Identifica fortalezas de cada motor
- Ayuda a elegir mejor motor para tu caso

### Para Benchmarking
Usa **imágenes monoespaciadas** (Courier):
- Representan sistemas industriales reales
- Mayor desafío para OCR
- Mejor indicador de rendimiento en campo

## 🔍 Características de Calidad OCR

### Factores que Facilitan OCR
✅ Fondo blanco limpio
✅ Contraste alto (texto oscuro en fondo claro)
✅ Fuentes comunes (Helvetica, Courier)
✅ Tamaño de fuente grande (60px para código)
✅ Espaciado uniforme

### Factores que Dificultan OCR
⚠️ Serifs (Times Roman)
⚠️ Fuentes monoespaciadas
⚠️ Texturas de fondo
⚠️ Bordes y líneas adicionales
⚠️ Patrones decorativos

## 💡 Consejos para Mejorar

Si necesitas ajustar los tamaños:

```bash
# Editar generate_advanced_test_images.py
# Cambiar: width = 500, height = 400
# A: width = 800, height = 600 (para mejor OCR)
```

Si necesitas agregar más variantes:

1. Abre `generate_advanced_test_images.py`
2. Agregavarante a `FONT_VARIANTS`
3. Ejecuta el script de nuevo

## 🚀 Próximos Pasos

1. ✅ Ejecutar validación de imágenes
2. ✅ Procesar imágenes básicas (5 imágenes)
3. ✅ Procesar imágenes avanzadas (20 imágenes)
4. ✅ Comparar resultados
5. ✅ Documentar conclusiones

## 📈 Métricas a Registrar

Para cada prueba, registra:
- ✓ Imagen utilizada
- ✓ Motor OCR utilizado (Tesseract/EasyOCR)
- ✓ Código reconocido (¿correcto?)
- ✓ Tiempo de procesamiento (ms)
- ✓ Confianza del reconocimiento
- ✓ Notas adicionales

---

**Total de imágenes:** 25 (5 básicas + 20 avanzadas)
**Cobertura de tipografías:** 4 estilos diferentes
**Productos:** 5 tipos de piezas industriales
**Última actualización:** 2025-12-10
