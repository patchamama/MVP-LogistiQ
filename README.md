# LogistiQ MVP - Gestión de Inventario con OCR

Sistema MVP para gestión de inventario y automatización de almacén con captura de fotos y reconocimiento OCR.

## 🎯 Características

- **Captura de Fotos**: Usar la cámara del dispositivo para fotografiar etiquetas de productos
- **Reconocimiento OCR**: Extrae códigos de productos de las imágenes
- **Busca en Inventario**: Busca automáticamente el producto en la base de datos
- **Información Completa**: Muestra precio, stock, ubicación y otros datos del producto
- **Progressive Web App**: Funciona en navegadores web, sin necesidad de app nativa
- **Dual OCR Engines**: Tesseract y EasyOCR para máxima precisión

## 🏗️ Arquitectura

### Frontend
- **React 19** + TypeScript
- **Vite** para build rápido
- **Tailwind CSS** para estilos
- **PWA** para acceso a cámara
- **Axios** para API calls

### Backend
- **PHP 8.x** con Slim Framework
- **OCR Engines**: Tesseract + EasyOCR
- **Base de Datos**: JSON (mockeada para MVP)
- **API REST** con CORS habilitado

## 📋 Requisitos

### Para el Frontend
- Node.js 18+
- npm o yarn

### Para el Backend
- PHP 8.0+
- Composer
- Tesseract OCR (opcional)
- Python 3.8+ (para EasyOCR)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd MVP-LogistiQ
```

### 2. Instalar el Frontend

```bash
cd frontend
npm install
```

### 3. Instalar el Backend

```bash
cd backend
composer install
```

### 4. Instalar OCR Engines

LogistiQ incluye scripts de instalación cross-platform para macOS, Linux y otros sistemas.

#### Opción 1: Instalar ambos (recomendado)
```bash
cd ../scripts
./setup-ocr.sh
```

#### Opción 2: Instalar solo Tesseract
```bash
cd ../scripts
./setup-tesseract.sh
```

#### Opción 3: Instalar solo EasyOCR (Python)
```bash
cd ../scripts
./setup-easyocr.sh
```

**Soportado en:** macOS (Homebrew), Ubuntu/Debian, CentOS/RHEL, Fedora, Alpine Linux

## 📝 Configuración

### Frontend
1. Copiar `.env.example` a `.env.local`
2. Ajustar `VITE_API_URL` si es necesario

### Backend
1. Crear carpeta `uploads` en `backend/`:
```bash
mkdir -p backend/uploads
chmod 755 backend/uploads
```

## 🏃 Ejecución

### Ejecutar el Frontend

```bash
cd frontend
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### Ejecutar el Backend

```bash
cd backend
composer start
```

O usando PHP directamente:
```bash
php -S localhost:8000 -t public
```

El backend estará disponible en `http://localhost:8000/api`

## 🔌 Endpoints de la API

### POST `/api/ocr/process`
Procesa una imagen y reconoce el código del producto.

**Request:**
```json
{
  "image": "base64_encoded_image",
  "engine": "tesseract|easyocr|both"
}
```

**Response:**
```json
{
  "success": true,
  "ocr_result": {
    "raw_text": "12345ABC",
    "filtered_code": "12345",
    "engine_used": "tesseract"
  },
  "product": {
    "code": "12345",
    "name": "Tornillo M8x20",
    "price": 0.50,
    "stock": 150,
    "locations": ["Estantería A-3"]
  }
}
```

### GET `/api/products/{code}`
Obtiene información de un producto por código.

### GET `/api/products/search?q=query`
Busca productos por nombre, descripción o código.

### GET `/api/health`
Verifica el estado del servidor.

## 📦 Base de Datos (Mock)

Los productos se almacenan en `backend/data/products.json`. Puedes agregar más productos siguiendo este formato:

```json
{
  "code": "12345",
  "name": "Tornillo M8x20",
  "description": "Tornillo métrico 8mm x 20mm",
  "price": 0.50,
  "stock": 150,
  "locations": ["Estantería A-3"],
  "supplier": "Proveedor A",
  "category": "Tornillería"
}
```

## 🧪 Prueba del MVP

1. Abre el frontend en `http://localhost:5173`
2. Haz clic en "Abrir Cámara" o "Seleccionar Imagen"
3. Captura/Selecciona una foto de una etiqueta con el código `12345` (u otro código existente)
4. El sistema debería:
   - Reconocer el código con OCR
   - Buscar el producto en la base de datos
   - Mostrar toda la información del producto

## 🔧 Troubleshooting

### Error: "Tesseract no está instalado"
Ejecutar el script de instalación correspondiente al SO:
```bash
# macOS
./scripts/setup-tesseract.sh

# O usar el script master que detecta el SO automáticamente
./scripts/setup-ocr.sh
```

### Error: "Python no está instalado"
El script de instalación de EasyOCR instala Python si es necesario:
```bash
./scripts/setup-easyocr.sh
```

### Error: "EasyOCR no está instalado"
Ejecutar el script de instalación con el script master:
```bash
./scripts/setup-ocr.sh
```
Seleccionar opción 1 (ambos) u opción 3 (solo EasyOCR)

### Error: "Script de EasyOCR no encontrado"
Asegurar que el script Python existe en `scripts/easyocr_process.py`. Si no existe, restaurar desde el repositorio.

### CORS Error desde el Frontend
Verificar que el backend tiene CORS habilitado y la URL correcta en `.env`

### Error: "producto no encontrado"
Los códigos de prueba en la base de datos son: `12345`, `54321`, `67890`, etc.
Cambiar el motor OCR a "EasyOCR" o "Ambos" para mejor precisión.

### Verificar instalación de OCR Engines
```bash
# Verificar Tesseract
tesseract --version

# Verificar EasyOCR
python3 -c "import easyocr; print(easyocr.__version__)"
```

## 📊 Próximos Pasos

Después de validar este MVP, el proyecto final incluirá:

1. **Backend en Ruby on Rails**
   - Aplicación web completa para gestión de inventario
   - Base de datos PostgreSQL
   - Autenticación de usuarios
   - Reportes y analytics

2. **Frontend mejorado en React**
   - Versión final como PWA completa
   - Sincronización offline
   - Más funcionalidades de búsqueda

3. **Infraestructura**
   - Despliegue en DigitalOcean
   - Dominio propio
   - SSL/TLS
   - CDN para imágenes

## 📄 Licencia

Este proyecto es propiedad de LogistiQ.

## 👥 Contacto

Para preguntas o problemas, contactar al equipo de desarrollo.
