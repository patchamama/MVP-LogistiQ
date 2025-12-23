# 📦 LogistiQ v0.7.1 - Deployment Package

**Versión:** 0.7.1
**Fecha:** Diciembre 23, 2025
**Estado:** ✅ Production Ready

---

## 📋 Contenido del Paquete

```
deploy/
├── frontend/dist/                    # Frontend compilado (listo para servir)
├── minibackend/                      # MiniBACKEND PHP (gestión de almacén)
│   ├── public/                       # Entry point
│   ├── data/                         # Datos persistentes (JSON)
│   ├── storage/                      # Almacenamiento de imágenes
│   └── README.md                     # Documentación MiniBACKEND
├── MINIBACKEND_SETUP.md              # Guía de instalación
├── MINIBACKEND_IMPLEMENTATION_COMPLETE.md  # Detalles técnicos
└── README_DEPLOY.md                  # Este archivo
```

---

## 🚀 Instalación Rápida

### 1. Servir Frontend

```bash
# Opción A: Apache (copiar a htdocs)
cp -r deploy/frontend/dist /var/www/html/logistiq

# Opción B: Nginx
# Configurar raíz a deploy/frontend/dist

# Opción C: Desarrollo con Live Server
cd deploy/frontend/dist
python3 -m http.server 5173
```

### 2. Iniciar MiniBACKEND

```bash
cd deploy/minibackend/public
php -S localhost:9000

# O en producción con PHP-FPM
# Configurar Nginx/Apache para servir desde deploy/minibackend/public
```

### 3. Acceder a la Aplicación

- **Frontend:** http://localhost:5173 (o tu dominio configurado)
- **MiniBACKEND API:** http://localhost:9000/api
- **Health Check:** curl http://localhost:9000/api/health

---

## 📝 Configuración

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api      # Backend OCR
VITE_MINI_API_URL=http://localhost:9000/api # MiniBACKEND
```

### Backend Principal (.env)

```env
APP_ENV=production
DEBUG=false
ENCRYPTION_KEY=<generar-con-openssl>
DATA_PATH=/var/www/data
```

---

## 📊 Estructura de Archivos Importantes

### Frontend Build
- `frontend/dist/index.html` - Punto de entrada
- `frontend/dist/assets/` - CSS, JS compilado
- `frontend/dist/sw.js` - Service Worker (PWA)
- `frontend/dist/manifest.webmanifest` - Metadata PWA

### MiniBACKEND
- `minibackend/public/index.php` - Router principal
- `minibackend/public/handlers/` - Endpoints (5 archivos)
- `minibackend/data/entries.json` - Registro de entradas
- `minibackend/data/manufacturers.json` - Lista de fabricantes
- `minibackend/storage/almacen_imagenes/` - Almacenamiento de fotos

---

## ✅ Verificación de Instalación

### 1. Frontend Funcionando
```bash
curl -s http://localhost:5173 | grep "<title>" | head -1
# Debería mostrar: LogistiQ
```

### 2. MiniBACKEND Funcionando
```bash
curl -s http://localhost:9000/api/health | jq .
# Debería mostrar status: "ok"
```

### 3. Conexión Frontend-Backend
- Abrir http://localhost:5173
- Ir a tab "📦 Almacén"
- Intentar crear una entrada
- Si funciona, todo está configurado correctamente

---

## 🔧 Configuración en Producción

### Apache Virtual Host

```apache
<VirtualHost *:443>
    ServerName logistiq.ejemplo.com
    DocumentRoot /var/www/logistiq/frontend/dist

    <Directory /var/www/logistiq/frontend/dist>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/logistiq.ejemplo.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/logistiq.ejemplo.com/privkey.pem
</VirtualHost>

<VirtualHost *:443>
    ServerName miniapi.ejemplo.com
    DocumentRoot /var/www/logistiq/minibackend/public

    <Directory /var/www/logistiq/minibackend/public>
        Options FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/miniapi.ejemplo.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/miniapi.ejemplo.com/privkey.pem
</VirtualHost>
```

### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name logistiq.ejemplo.com;
    root /var/www/logistiq/frontend/dist;

    ssl_certificate /etc/letsencrypt/live/logistiq.ejemplo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/logistiq.ejemplo.com/privkey.pem;

    location / {
        try_files $uri /index.html;
    }
}

server {
    listen 443 ssl http2;
    server_name miniapi.ejemplo.com;
    root /var/www/logistiq/minibackend/public;

    ssl_certificate /etc/letsencrypt/live/miniapi.ejemplo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/miniapi.ejemplo.com/privkey.pem;

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

### Permisos de Archivos

```bash
sudo chown -R www-data:www-data /var/www/logistiq
sudo chmod 755 /var/www/logistiq/minibackend/storage/almacen_imagenes
sudo chmod 755 /var/www/logistiq/minibackend/data
sudo chmod 644 /var/www/logistiq/minibackend/data/*.json
```

### HTTPS con Let's Encrypt

```bash
sudo certbot certonly --standalone -d logistiq.ejemplo.com -d miniapi.ejemplo.com
sudo certbot renew --dry-run  # Verificar renovación automática
```

---

## 📊 Tamaños de Archivos

```
Frontend Build:      ~365 KB
MiniBACKEND Code:    ~30 KB
Total (sin imágenes): ~395 KB

Comprimido (gzip):   ~115 KB
```

---

## 🔒 Consideraciones de Seguridad

### 1. HTTPS/TLS Obligatorio
- Frontend y MiniBACKEND DEBEN usar HTTPS en producción
- Usar Let's Encrypt para certificados gratuitos

### 2. Variables de Entorno
- NUNCA comprometer `.env` con credenciales
- Usar variables de sistema en servidor

### 3. Permisos de Archivos
- MiniBACKEND `storage/` debe ser writeable por servidor web
- `api_keys.json` debe tener permisos 644
- `data/` debe ser 755

### 4. CORS
- Restringir CORS a dominios permitidos en producción
- Configurar en `minibackend/public/index.php`

### 5. Backup
- Hacer backup regular de `minibackend/data/` y `storage/`
- Considerar backup automático diario

---

## 📈 Monitoreo

### Health Checks

```bash
# Script de monitoreo
*/5 * * * * curl -s http://miniapi.ejemplo.com/api/health | grep "ok" || alert
```

### Logs

```bash
# Frontend (Nginx/Apache access logs)
tail -f /var/log/nginx/access.log

# MiniBACKEND (PHP-FPM)
tail -f /var/log/php-fpm.log
```

### Alertas

Configurar alertas para:
- MiniBACKEND caído (health check fallido)
- Errores HTTP 5xx
- Uso de disco alto (imágenes)

---

## 🆘 Troubleshooting

### Frontend No Carga
1. Verificar servidor web está corriendo
2. Verificar `frontend/dist/index.html` existe
3. Revisar logs del servidor web
4. Verificar CORS si es un issue de API

### MiniBACKEND No Responde
1. Verificar proceso PHP: `ps aux | grep php`
2. Verificar puerto: `lsof -i :9000`
3. Revisar logs de PHP
4. Verificar permisos de `storage/` y `data/`

### Imágenes No Se Guardan
1. Verificar permisos: `chmod 755 minibackend/storage/almacen_imagenes`
2. Verificar espacio en disco: `df -h`
3. Revisar logs de PHP

### Conexión Entre Frontend y MiniBACKEND Fallida
1. Verificar VITE_MINI_API_URL está correcta
2. Verificar CORS en minibackend
3. Verificar firewall permite conexión
4. Usar DevTools (F12) para ver errores

---

## 📚 Documentación Adicional

1. **MINIBACKEND_SETUP.md** - Guía detallada de instalación
2. **MINIBACKEND_IMPLEMENTATION_COMPLETE.md** - Detalles técnicos completos
3. **minibackend/README.md** - Documentación de API endpoints

---

## 🚀 Siguientes Pasos

1. ✅ Desplegar frontend en servidor web
2. ✅ Desplegar minibackend en servidor PHP
3. ✅ Configurar dominios y SSL
4. ✅ Configura variables de entorno
5. ✅ Establece backups automatizados
6. ✅ Configura monitoreo
7. ✅ Prueba flujo completo en producción

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisar MINIBACKEND_SETUP.md
2. Revisar logs del servidor
3. Ejecutar health checks
4. Crear issue en GitHub con detalles

---

**Versión:** 0.7.1
**Fecha:** Diciembre 23, 2025
**Licencia:** MIT

¡Listo para producción! 🚀
