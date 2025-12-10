# LogistiQ MVP - Guía Rápida de Inicio

## ⚡ Instalación Rápida (5 minutos)

### Requisitos previos
- Node.js 18+ y npm
- PHP 8.0+
- Composer
- Git

### Paso 1: Clonar y navegar
```bash
git clone <repo-url>
cd MVP-LogistiQ
```

### Paso 2: Instalar dependencias
```bash
# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend && composer install && cd ..
```

### Paso 3: Crear carpeta uploads
```bash
mkdir -p backend/uploads
chmod 755 backend/uploads
```

### Paso 4: Instalar OCR Engines (recomendado)

**Opción A: Instalar ambos (recomendado)** - Detecta automáticamente tu SO
```bash
./scripts/setup-ocr.sh
```

**Opción B: Instalar solo Tesseract**
```bash
./scripts/setup-tesseract.sh
```

**Opción C: Instalar solo EasyOCR**
```bash
./scripts/setup-easyocr.sh
```

Soportado en: macOS, Ubuntu/Debian, CentOS/RHEL, Fedora, Alpine

## 🚀 Ejecutar el MVP

### Terminal 1: Backend (PHP API)
```bash
cd backend
composer start
# O manualmente: php -S localhost:8000 -t public
```
✓ API disponible en: **http://localhost:8000/api**

### Terminal 2: Frontend (React)
```bash
cd frontend
npm run dev
```
✓ App disponible en: **http://localhost:5173**

## 🧪 Probar el MVP

1. Abre **http://localhost:5173** en tu navegador
2. Haz clic en "Abrir Cámara" o "Seleccionar Imagen"
3. Toma foto de un código o sube una imagen con números
4. Prueba con códigos en la BD: `12345`, `54321`, `67890`

## 📱 Códigos de Prueba Disponibles

| Código | Producto | Precio | Stock |
|--------|----------|--------|-------|
| 12345 | Tornillo M8x20 | €0.50 | 150 |
| 54321 | Arandela de nylon | €2.50 | 450 |
| 67890 | Tuerca M10 | €0.75 | 320 |
| 11111 | Rodamiento 6203 | €15.99 | 25 |
| 22222 | Cable acero | €1.20 | 500 |

## 🔍 Cambiar Motor OCR

En la app, selecciona:
- **Tesseract**: Rápido y maduro (recomendado para MVP)
- **EasyOCR**: Más preciso pero requiere Python
- **Ambos**: Compara ambos (requiere ambos instalados)

## ⚙️ Instalar EasyOCR (Opcional)

```bash
# Instalar Python si no lo tienes
sudo apt-get install python3 python3-pip

# Instalar EasyOCR
pip3 install easyocr opencv-python-headless

# O usar el script
./scripts/setup-easyocr.sh
```

## 🐛 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| CORS error | Verificar que backend corre en `localhost:8000` |
| Tesseract not found | Ejecutar `./scripts/setup-ocr.sh` o `./scripts/setup-tesseract.sh` |
| Python/EasyOCR not found | Ejecutar `./scripts/setup-ocr.sh` (seleccionar opción 1 o 3) |
| API returns 500 | Ver logs del backend en terminal |
| No reconoce código | Intentar con "EasyOCR" o "Ambos" engines |
| Puerto ya en uso | Cambiar en vite.config.ts o composer.json |

## ✅ Verificar Instalación

```bash
# Verificar Tesseract
tesseract --version

# Verificar EasyOCR
python3 -c "import easyocr; print('OK')"
```

## 📚 Documentación

- **README.md**: Documentación completa
- **docs/ARCHITECTURE.md**: Análisis arquitectónico detallado
- **Plan**: Ver `.claude/plans/` para el plan de implementación

## 🎯 Próximos Pasos

1. Validar que OCR funciona correctamente
2. Ajustar filtrado de códigos si es necesario
3. Agregar más productos a `backend/data/products.json`
4. Comenzar desarrollo de la solución final en Rails

---

**¿Necesitas ayuda?** Ver README.md para más detalles o docs/ARCHITECTURE.md para entender la arquitectura.
