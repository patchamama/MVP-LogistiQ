# MiniBACKEND - Gestión de Entrada de Almacén

Sistema minimalista para gestionar la entrada de piezas al almacén con almacenamiento permanente de imágenes y registro de metadatos.

## Características

- ✅ Registro de entrada de piezas al almacén
- ✅ Almacenamiento permanente de imágenes organizadas por fabricante y referencia
- ✅ Registro de metadatos (timestamp, cantidad, operario, observaciones)
- ✅ API REST simple
- ✅ Verificación de referencias existentes
- ✅ Gestión de lista de fabricantes

## Estructura del Proyecto

```
minibackend/
├── public/
│   ├── index.php              # Entry point principal
│   ├── handlers/              # Manejadores de rutas
│   │   ├── create_entry.php
│   │   ├── check_reference.php
│   │   ├── get_manufacturers.php
│   │   ├── get_entries.php
│   │   └── health.php
│   └── .htaccess             # Reescritura de URLs
├── data/
│   ├── entries.json          # Registro de entradas
│   └── manufacturers.json    # Lista de fabricantes
├── storage/
│   └── almacen_imagenes/    # Almacenamiento de imágenes
│       └── {FABRICANTE}/
│           └── {REFERENCIA}/
└── README.md
```

## Instalación

### Requisitos

- PHP 7.4+
- Apache/Nginx con mod_rewrite habilitado
- Permisos de escritura en directorios `data/` y `storage/`

### Desarrollo Local

```bash
# Navegar al directorio del minibackend
cd minibackend/public

# Iniciar servidor de desarrollo
php -S localhost:9000

# El servidor estará disponible en http://localhost:9000/api
```

### Verificar Health Check

```bash
curl http://localhost:9000/api/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-12-23T14:30:45+00:00",
  "storage_path": "/ruta/a/almacen_imagenes",
  "entries_count": 0,
  "manufacturers_count": 0,
  "php_version": "8.1.0"
}
```

## API Endpoints

### 1. Crear Entrada - POST /api/entry

Registra una nueva entrada en el almacén.

**Request:**
```bash
curl -X POST http://localhost:9000/api/entry \
  -H "Content-Type: application/json" \
  -d '{
    "referencia": "M8x20-INOX",
    "fabricante": "Tornillos S.A.",
    "cantidad": 500,
    "operario": "Juan Pérez",
    "observaciones": "Llegaron en buen estado",
    "imagenes": [
      "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    ]
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "entry_id": "entry_1703350845_abc123",
  "message": "Entrada registrada correctamente",
  "images_saved": 2,
  "storage_path": "Tornillos_S.A./M8x20-INOX",
  "timestamp": "2025-12-23T14:30:45Z"
}
```

### 2. Verificar Referencia - GET /api/check-reference

Verifica si una referencia ya existe en el almacén.

**Request:**
```bash
curl "http://localhost:9000/api/check-reference?ref=M8x20-INOX"
```

**Response (No existe):**
```json
{
  "exists": false
}
```

**Response (Existe):**
```json
{
  "exists": true,
  "count": 3,
  "total_quantity": 1500,
  "last_entry": {
    "fabricante": "Tornillos S.A.",
    "cantidad": 500,
    "timestamp": "2025-12-23T14:30:45Z",
    "operario": "Juan Pérez",
    "observaciones": "Llegaron en buen estado"
  }
}
```

### 3. Obtener Fabricantes - GET /api/manufacturers

Obtiene la lista de fabricantes registrados.

**Request:**
```bash
curl "http://localhost:9000/api/manufacturers"
```

**Response:**
```json
{
  "manufacturers": [
    "Tornillos S.A.",
    "Metales Industriales",
    "Proveedor XYZ"
  ]
}
```

### 4. Obtener Entradas - GET /api/entries

Obtiene lista de entradas con paginación.

**Request:**
```bash
curl "http://localhost:9000/api/entries?limit=50&offset=0"
```

**Response:**
```json
{
  "total": 245,
  "limit": 50,
  "offset": 0,
  "entries": [
    {
      "id": "entry_1703350845_abc123",
      "referencia": "M8x20-INOX",
      "fabricante": "Tornillos S.A.",
      "cantidad": 500,
      "operario": "Juan Pérez",
      "timestamp": "2025-12-23T14:30:45Z",
      "image_count": 2
    }
  ]
}
```

### 5. Health Check - GET /api/health

Verifica el estado del servidor.

**Request:**
```bash
curl "http://localhost:9000/api/health"
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-23T14:30:45+00:00",
  "storage_path": "/ruta/a/almacen_imagenes",
  "entries_count": 245,
  "manufacturers_count": 12,
  "php_version": "8.1.0"
}
```

## Estructura de Datos

### entries.json

```json
{
  "entries": [
    {
      "id": "entry_1703350845_abc123",
      "referencia": "M8x20-INOX",
      "fabricante": "Tornillos S.A.",
      "cantidad": 500,
      "operario": "Juan Pérez",
      "observaciones": "Llegaron en buen estado",
      "timestamp": "2025-12-23T14:30:45Z",
      "imagenes": [
        "Tornillos_S.A./M8x20-INOX/1703350845_1.jpg",
        "Tornillos_S.A./M8x20-INOX/1703350845_2.jpg"
      ]
    }
  ]
}
```

### manufacturers.json

```json
{
  "manufacturers": [
    "Metales Industriales",
    "Proveedor XYZ",
    "Tornillos S.A."
  ]
}
```

## Estructura de Almacenamiento

Las imágenes se organizan automáticamente en:

```
storage/almacen_imagenes/
├── Tornillos_S.A./
│   ├── M8x20-INOX/
│   │   ├── 1703350845_1.jpg
│   │   ├── 1703350845_2.jpg
│   │   └── 1703350846_1.jpg
│   └── M10x30-ACERO/
│       └── 1703350847_1.jpg
└── Metales_Industriales/
    └── BARRA-ALUMINIO/
        └── 1703350848_1.jpg
```

## Validaciones

### Datos Requeridos
- `referencia` (string): No puede estar vacía
- `fabricante` (string): No puede estar vacía
- `cantidad` (int): Debe ser mayor a 0
- `operario` (string): No puede estar vacío
- `imagenes` (array): Al menos 1, máximo 10

### Límites
- **Tamaño de imagen**: Máximo 5MB por imagen
- **Cantidad de imágenes**: Máximo 10 por entrada
- **Paginación**: Máximo 500 registros por página

## Códigos HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Entrada creada |
| 400 | Bad Request - Datos inválidos |
| 404 | Not Found - Endpoint no encontrado |
| 500 | Server Error - Error interno |

## Códigos de Error

### 400 Bad Request

```json
{
  "success": false,
  "message": "Datos incompletos"
}
```

### 500 Server Error

```json
{
  "success": false,
  "message": "Error al crear directorio de almacenamiento"
}
```

## Despliegue en Producción

### 1. Preparar Servidor

```bash
# Copiar minibackend al servidor
scp -r minibackend/ usuario@servidor:/var/www/

# Establecer permisos
chmod 755 /var/www/minibackend/storage/almacen_imagenes
chmod 755 /var/www/minibackend/data
chmod 644 /var/www/minibackend/data/*.json
```

### 2. Configurar Virtual Host (Apache)

```apache
<VirtualHost *:80>
    ServerName miniapi.logistiq.local
    DocumentRoot /var/www/minibackend/public

    <Directory /var/www/minibackend/public>
        Options FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    <Directory /var/www/minibackend/storage>
        Require all granted
    </Directory>
</VirtualHost>
```

### 3. Configurar Nginx

```nginx
server {
    listen 80;
    server_name miniapi.logistiq.local;
    root /var/www/minibackend/public;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 4. Habilitar HTTPS

```bash
# Usar Let's Encrypt
certbot --nginx -d miniapi.logistiq.local
```

## Seguridad

### CORS
- Configurado para permitir solicitudes de cualquier origen (desarrollo)
- En producción, restringir a dominio específico

### Validación
- Validación de tipos de datos
- Límites de tamaño para imágenes
- Sanitización de nombres de archivo

### Permisos
- `data/` debe tener permiso `755` (lectura/escritura/ejecución)
- Archivos JSON deben tener permiso `644`
- `storage/` debe tener permiso `755`

## Monitoreo

### Logs
Configurar rotación de logs del servidor web:

```bash
# Para Apache
tail -f /var/log/apache2/error.log

# Para Nginx
tail -f /var/log/nginx/error.log
```

### Health Endpoint
Usar para monitoreo continuo:

```bash
# Verificar cada 60 segundos
while true; do
  curl -s http://localhost:9000/api/health | jq .
  sleep 60
done
```

## Troubleshooting

### "Datos incompletos"
Asegurar que todas las keys requeridas estén en el JSON:
- referencia
- fabricante
- cantidad
- operario
- imagenes (array)

### "Error al crear directorio"
Verificar permisos de `storage/`:
```bash
chmod 755 minibackend/storage/almacen_imagenes
ls -la minibackend/storage/
```

### "Permiso denegado" en archivos JSON
Verificar permisos:
```bash
chmod 644 minibackend/data/*.json
chmod 755 minibackend/data/
```

## Próximas Mejoras

- [ ] Autenticación de operarios
- [ ] Búsqueda avanzada de entradas
- [ ] Reportes/exportación a CSV
- [ ] Integración con sistema de inventario
- [ ] Notificaciones en tiempo real
- [ ] Dashboard de estadísticas
- [ ] Respaldo automático de imágenes

---

**Versión:** 1.0
**Fecha:** Diciembre 23, 2025
**Licencia:** MIT
