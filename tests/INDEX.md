# Tests Directory Index

Carpeta completa de pruebas para LogistiQ MVP con imágenes básicas y avanzadas, scripts de generación y guías de testing.

## 📁 Contenido

### Imágenes Básicas (5 imágenes)
Ubicación: `tests/`
- `product_12345.png` - Tornillo M8x20 (€0.50)
- `product_54321.png` - Arandela de nylon (€2.50)
- `product_67890.png` - Tuerca M10 (€0.75)
- `product_11111.png` - Rodamiento 6203 (€15.99)
- `product_22222.png` - Cable acero (€1.20)

**Características:**
- Fondos de colores sólidos diferentes
- Tipografía simple (Helvetica)
- Tamaño: 400x300px
- Ideales para pruebas rápidas

### Imágenes Avanzadas (20 imágenes)
Ubicación: `tests/variants/`
- 4 variantes por producto × 5 productos = 20 imágenes
- Fondos blancos con textura metalizada
- 4 tipografías diferentes (Helvetica, Times, Courier, Courier Bold)
- Tamaño: 500x400px
- Patrones de piezas específicos para cada tipo
- Código de barras simulado

**Variantes:**
- `*_white_modern.png` - Helvetica Bold (moderno)
- `*_white_classic.png` - Times Roman (formal)
- `*_white_monospace.png` - Courier Regular (industrial)
- `*_white_mono_bold.png` - Courier Bold (robusto)

### Scripts
- `generate_test_images.py` - Genera 5 imágenes básicas de productos
- `generate_advanced_test_images.py` - Genera 20 imágenes avanzadas con múltiples tipografías
- `validate_images.py` - Valida que todas las imágenes PNG son válidas

### Documentación
- `README.md` - Guía rápida de uso
- `TESTING_GUIDE.md` - Plan de pruebas completo (10 tests)
- `ADVANCED_IMAGES.md` - Documentación detallada de imágenes avanzadas
- `INDEX.md` - Este archivo

## 🚀 Quick Start

```bash
# 1. Validar imágenes
python3 tests/validate_images.py

# 2. Leer la guía de pruebas
cat tests/TESTING_GUIDE.md

# 3. Ejecutar la aplicación y probar
cd frontend && npm run dev
cd backend && composer start
```

## 📸 Usar las Imágenes

1. Abre http://localhost:5173
2. Haz clic en "Seleccionar Imagen"
3. Navega a la carpeta `tests/`
4. Selecciona una imagen de producto
5. Procesa con OCR (Tesseract, EasyOCR o Ambos)
6. Verifica que el producto se encuentra correctamente

## 🧪 Plan de Pruebas

Total de 10 tests (del cuales 2 son opcionales):

1. Interfaz Básica
2. Cambio de Idioma
3. Carga de Imagen (Tesseract)
4. Múltiples Productos (5 variantes)
5. Comparación de Motores (Opcional)
6. Botón Reset
7. Manejo de Errores (2 variantes)
8. Responsividad
9. Rendimiento
10. Búsqueda de Productos (Opcional)

Ver `TESTING_GUIDE.md` para instrucciones detalladas.

## 🔄 Regenerar Imágenes

Si necesitas cambiar los productos de prueba:

```bash
# Editar generate_test_images.py
nano generate_test_images.py

# Regenerar imágenes
python3 tests/generate_test_images.py

# Validar
python3 tests/validate_images.py
```

## ✅ Validación

Ejecuta el validador para asegurar que todas las imágenes son válidas:

```bash
python3 tests/validate_images.py
```

Salida esperada:
```
✓ OK (400x300px, 6.9KB)
✓ OK (400x300px, 8.3KB)
...
✓ All images validated successfully!
```

## 📊 Productos Disponibles

| Código | Producto | Precio | Stock | Archivo |
|--------|----------|--------|-------|---------|
| 12345 | Tornillo M8x20 | €0.50 | 150 | product_12345.png |
| 54321 | Arandela de nylon | €2.50 | 450 | product_54321.png |
| 67890 | Tuerca M10 | €0.75 | 320 | product_67890.png |
| 11111 | Rodamiento 6203 | €15.99 | 25 | product_11111.png |
| 22222 | Cable acero | €1.20 | 500 | product_22222.png |

## 🎯 Próximos Pasos

- [ ] Ejecutar `python3 tests/validate_images.py`
- [ ] Leer `TESTING_GUIDE.md`
- [ ] Ejecutar los 10 tests
- [ ] Completar la matriz de resultados
- [ ] Registrar cualquier issue encontrado

## 🆕 Características Nuevas: Imágenes Avanzadas

### Fondos Blancos Texturizados
- ✓ Simulan la apariencia de piezas metálicas reales
- ✓ Textura sutil metalizada para realismo
- ✓ Mejor contraste para precisión OCR

### Múltiples Tipografías por Producto
Cada producto disponible en 4 estilos:
1. **Helvetica Bold** - Moderno y limpio
2. **Times Roman** - Formal y clásico
3. **Courier** - Industrial y monoespaciado
4. **Courier Bold** - Robusto y legible

### Patrones de Piezas Realistas
Cada imagen incluye un patrón visual representando:
- 🔩 **Tornillo:** Espiral helicoidal
- ⭕ **Arandela:** Círculos concéntricos
- 🔷 **Tuerca:** Hexágono
- ⚡ **Rodamiento:** Bolillas interiores
- 🧵 **Cable:** Patrón ondulado

### Elementos Adicionales
- ✓ Código de barras simulado (25 barras alternadas)
- ✓ Caja destacada para código principal
- ✓ Separadores visuales
- ✓ Información de precio y código

## 🎯 Comparativa: Básicas vs Avanzadas

| Aspecto | Básicas | Avanzadas |
|---------|---------|-----------|
| **Cantidad** | 5 | 20 |
| **Tamaño** | 400×300px | 500×400px |
| **Tipografías** | 1 (Helvetica) | 4 (Helvetica, Times, Courier, Courier Bold) |
| **Fondos** | Colores sólidos | Blanco + textura metalizada |
| **Patrones** | Simples | Patrones de piezas específicos |
| **Código de barras** | Básico | Realista (25 barras) |
| **Uso ideal** | Pruebas rápidas | Validación OCR completa |

## 🧪 Plan de Pruebas Expandido

### Validación Básica (5 minutos)
```bash
# Procesa solo imágenes básicas con Tesseract
python3 tests/validate_images.py
```

### Validación Intermedia (15 minutos)
```bash
# Procesa variantes Helvetica (white_modern)
# Compara Tesseract vs EasyOCR
```

### Validación Completa (30+ minutos)
```bash
# Procesa todas las 20 imágenes avanzadas
# Prueba ambos motores OCR
# Registra métricas detalladas
# Identifica tipografías problemáticas
```

## 📈 Métricas Recomendadas

Para cada prueba, registra:
- ✓ Imagen utilizada (código + variante)
- ✓ Motor OCR utilizado
- ✓ Código reconocido (¿correcto?)
- ✓ Tiempo de procesamiento (ms)
- ✓ Confianza OCR
- ✓ Notas especiales

## 🐛 Troubleshooting

Ver `TESTING_GUIDE.md` sección "Troubleshooting" para solucionar problemas comunes.

---

**Total de imágenes:** 25 (5 básicas + 20 avanzadas)
**Cobertura de tipografías:** 4 estilos diferentes
**Rango de validación:** Extenso (múltiples fonts)
**Productos:** 5 tipos diferentes
**Última actualización:** 2025-12-10
**Versión:** 2.0
