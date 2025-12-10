# Tests Directory Index

Carpeta de pruebas para LogistiQ MVP con imágenes, scripts y guías de testing.

## 📁 Contenido

### Imágenes de Prueba
- `product_12345.png` - Tornillo M8x20 (€0.50)
- `product_54321.png` - Arandela de nylon (€2.50)
- `product_67890.png` - Tuerca M10 (€0.75)
- `product_11111.png` - Rodamiento 6203 (€15.99)
- `product_22222.png` - Cable acero (€1.20)

### Scripts
- `generate_test_images.py` - Genera imágenes de productos de prueba
- `validate_images.py` - Valida que todas las imágenes son válidas

### Documentación
- `README.md` - Guía rápida de uso
- `TESTING_GUIDE.md` - Plan de pruebas completo (10 tests)
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

## 🐛 Troubleshooting

Ver `TESTING_GUIDE.md` sección "Troubleshooting" para solucionar problemas comunes.

---

**Última actualización:** 2025-12-10
**Versión:** 1.0
