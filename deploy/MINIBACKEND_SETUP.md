# Guía de Instalación del MiniBACKEND

## Descripción General

El **MiniBACKEND** es un sistema paralelo al backend principal (OCR) que gestiona exclusivamente la **entrada de piezas al almacén**. Opera de forma independiente sin afectar la funcionalidad OCR existente.

---

## Paso 1: Estructura de Carpetas

La estructura se crea automáticamente al iniciar. Verifica que exista:

```
MVP-LogistiQ/
├── minibackend/
│   ├── public/                    # Entry point
│   │   ├── index.php
│   │   ├── handlers/             # Manejadores de API
│   │   └── .htaccess
│   ├── data/                     # Datos persistentes
│   │   ├── entries.json
│   │   └── manufacturers.json
│   └── storage/                  # Almacenamiento de imágenes
│       └── almacen_imagenes/
```

---

## Paso 2: Iniciar el Servidor de Desarrollo

### Terminal 1: Backend Principal (OCR)
```bash
cd backend
php -S localhost:8000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

### Terminal 3: MiniBACKEND (Almacén)
```bash
cd minibackend/public
php -S localhost:9000
```

**Resultado esperado:**
```
[Wed Dec 23 14:30:00 2025] PHP 8.1.0 Development Server started
Listening on http://localhost:9000
Document root is /path/to/minibackend/public
```

---

## Paso 3: Verificar Configuración del Frontend

### Archivo: `frontend/.env`

```env
VITE_API_URL=http://localhost:8000/api
VITE_MINI_API_URL=http://localhost:9000/api
```

Si no existe `.env`, copiar desde `.env.example`:

```bash
cd frontend
cp .env.example .env
```

---

## Paso 4: Verificar Health Checks

### Backend Principal (OCR)
```bash
curl http://localhost:8000/api/health
```

### MiniBACKEND (Almacén)
```bash
curl http://localhost:9000/api/health
```

**Respuesta esperada del MiniBACKEND:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-23T14:30:45+00:00",
  "storage_path": "/path/to/storage/almacen_imagenes",
  "entries_count": 0,
  "manufacturers_count": 0,
  "php_version": "8.1.0"
}
```

---

## Paso 5: Acceder a la Aplicación

1. Abrir navegador: **http://localhost:5173**
2. Verás dos tabs: **📷 OCR** y **📦 Almacén**
3. Tab **OCR**: Funcionalidad original de escaneo de productos
4. Tab **Almacén**: Nueva funcionalidad de entrada al almacén

---

## Flujo de Uso: Entrada de Almacén

### 1. Paso 1: Capturar Etiqueta
- Click en tab **📦 Almacén**
- Ingresa o captura foto de la etiqueta (referencia)
- Sistema intenta extraer referencia con OCR
- Click en **"Confirmar Referencia"**
  - Si existe: muestra aviso ⚠️
  - Permite continuar de todos modos

### 2. Paso 2: Capturar Fotos
- Captura 1-10 fotos de la pieza
- Click en **"Capturar Foto"** o **"Seleccionar Foto"**
- Click en **"Continuar"**

### 3. Paso 3: Detalles de Entrada
- **Referencia**: Editable si necesitas corregir
- **Fabricante**: Selecciona de lista o agrega nuevo
- **Cantidad**: Número de unidades
- **Operario**: Tu nombre
- **Observaciones**: Opcional
- Click en **"Guardar Entrada"**

### 4. Confirmación
- Muestra ✅ Entrada Guardada
- Resumen de la entrada
- Click **"Nueva Entrada"** para repetir

---

## Pruebas Manuales

### Test 1: Crear Entrada Completa

```bash
curl -X POST http://localhost:9000/api/entry \
  -H "Content-Type: application/json" \
  -d '{
    "referencia": "M8x20-INOX",
    "fabricante": "Tornillos S.A.",
    "cantidad": 500,
    "operario": "Juan Pérez",
    "observaciones": "Llegaron en buen estado",
    "imagenes": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."]
  }'
```

### Test 2: Verificar Referencia

```bash
curl "http://localhost:9000/api/check-reference?ref=M8x20-INOX"
```

### Test 3: Obtener Fabricantes

```bash
curl "http://localhost:9000/api/manufacturers"
```

### Test 4: Listar Entradas

```bash
curl "http://localhost:9000/api/entries?limit=10&offset=0"
```

---

## Troubleshooting

### Error: "conexión rechazada" en puerto 9000

**Solución:**
```bash
# Verificar si el puerto está en uso
lsof -i :9000

# Terminar proceso en ese puerto
kill -9 <PID>

# Reiniciar minibackend
cd minibackend/public
php -S localhost:9000
```

### Error: "Permiso denegado" en storage/

**Solución:**
```bash
# Dar permisos correctos
chmod 755 minibackend/storage/almacen_imagenes
chmod 755 minibackend/data
chmod 644 minibackend/data/*.json
```

### Error: "datos incompletos"

**Solución:**
- Asegurar que `imagenes` sea un array con al menos 1 imagen
- Verificar que todos los campos requeridos estén en el JSON

### El frontend no puede conectar al minibackend

**Solución:**
1. Verificar que `.env` tiene `VITE_MINI_API_URL=http://localhost:9000/api`
2. Verificar que el minibackend está corriendo en puerto 9000
3. En DevTools (F12) → Console, buscar errores de red
4. Usar `curl` para verificar conectividad:
   ```bash
   curl http://localhost:9000/api/health
   ```

---

## Despliegue en Producción

### 1. Actualizar URLs en Frontend

**Archivo:** `frontend/.env.production`
```env
VITE_API_URL=https://api.logistiq.com/api
VITE_MINI_API_URL=https://miniapi.logistiq.com/api
```

### 2. Configurar Virtual Hosts

**Apache - Archivo:** `/etc/apache2/sites-available/miniapi.conf`
```apache
<VirtualHost *:443>
    ServerName miniapi.logistiq.com
    DocumentRoot /var/www/minibackend/public

    <Directory /var/www/minibackend/public>
        Options FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/miniapi.logistiq.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/miniapi.logistiq.com/privkey.pem
</VirtualHost>
```

**Nginx - Archivo:** `/etc/nginx/sites-available/miniapi`
```nginx
server {
    listen 443 ssl;
    server_name miniapi.logistiq.com;
    root /var/www/minibackend/public;

    ssl_certificate /etc/letsencrypt/live/miniapi.logistiq.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/miniapi.logistiq.com/privkey.pem;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 3. Permisos en Producción

```bash
# Dar permisos al servidor web
sudo chown -R www-data:www-data /var/www/minibackend
sudo chmod 755 /var/www/minibackend/storage/almacen_imagenes
sudo chmod 755 /var/www/minibackend/data
sudo chmod 644 /var/www/minibackend/data/*.json
```

### 4. Habilitar HTTPS

```bash
sudo certbot --nginx -d miniapi.logistiq.com
```

---

## Monitoreo en Producción

### Health Check Periódico

```bash
# Cada 5 minutos
*/5 * * * * curl -s http://localhost:9000/api/health | grep "ok" || echo "MiniBACKEND caído" | mail -s "Alerta" admin@logistiq.com
```

### Logs

```bash
# Monitorear errores PHP
tail -f /var/log/php-fpm.log

# Monitorear accesos HTTP
tail -f /var/log/nginx/access.log
```

---

## Documentación Completa

Ver [minibackend/README.md](./minibackend/README.md) para:
- Estructura detallada de endpoints
- Ejemplos de requests/responses
- Estructura de datos JSON
- Códigos de error
- Troubleshooting avanzado

---

## Próximas Características Planeadas

- [ ] Dashboard de entradas
- [ ] Reportes en CSV/Excel
- [ ] Búsqueda avanzada con filtros
- [ ] Sistema de usuarios/operarios
- [ ] Notificaciones en tiempo real
- [ ] Integración con API de inventario
- [ ] Backup automático de imágenes

---

**Última actualización:** Diciembre 23, 2025
**Versión:** v1.0
**Estado:** ✅ Listo para uso
