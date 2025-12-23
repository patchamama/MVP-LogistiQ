# 🚀 MiniBACKEND Setup en Plesk

**Versión:** 0.7.1
**Plataforma:** Plesk con PHP preinstalado
**URL:** https://backend.patchamama.com/MVP-LogistiQ/minibackend/public/
**Puerto:** 80 (estándar HTTP)

---

## 📋 Requisitos Previos

- ✅ Plesk instalado y funcionando
- ✅ PHP 7.4+ habilitado
- ✅ Módulo `mod_rewrite` habilitado en Apache (para .htaccess)
- ✅ Acceso HTTPS configurado (Let's Encrypt)
- ✅ Proyecto `MVP-LogistiQ` clonado o descargado en el servidor

---

## 🔧 Configuración en Plesk

### Paso 1: Subir Archivos a Plesk

```bash
# Opción A: Via Git (recomendado)
cd /var/www/vhosts/patchamama.com/httpdocs
git clone https://github.com/patchamama/MVP-LogistiQ.git

# Opción B: Via SFTP/FTP
# Conectar a tu servidor Plesk via SFTP
# Navegar a /var/www/vhosts/patchamama.com/httpdocs/
# Subir carpeta MVP-LogistiQ
```

### Paso 2: Verificar Permisos

```bash
# Conectar por SSH a tu servidor Plesk
ssh usuario@backend.patchamama.com

# Ir al directorio del proyecto
cd /var/www/vhosts/patchamama.com/httpdocs/MVP-LogistiQ

# Establecer permisos correctos
chmod 755 minibackend/public
chmod 755 minibackend/public/.htaccess
chmod 755 minibackend/data
chmod 755 minibackend/storage
chmod 755 minibackend/storage/almacen_imagenes

# Dar propiedad al usuario web
sudo chown -R nobody:nobody minibackend/
# O si Apache corre como www-data:
sudo chown -R www-data:www-data minibackend/
```

### Paso 3: Verificar Configuración Apache

1. **En Plesk Panel:**
   - Ir a: **Dominios** → **patchamama.com** → **Configuración de Apache y nginx**
   - Verificar que `.htaccess` está permitido
   - Asegurar que `mod_rewrite` está habilitado

2. **Crear documento raíz para el minibackend (opcional):**
   - Si quieres una subdomain `miniapi.patchamama.com`:
     - Ir a **Dominios** → **Agregar dominio/subdomain**
     - Crear `miniapi.patchamama.com`
     - Apuntar raíz a `/MVP-LogistiQ/minibackend/public`

---

## 🌐 URLs de Acceso

### Endpoint del MiniBACKEND

```
https://backend.patchamama.com/MVP-LogistiQ/minibackend/public/api/health
```

### Endpoints Disponibles

```
POST   /api/entry                  → Crear entrada
GET    /api/check-reference        → Verificar referencia
GET    /api/manufacturers          → Listar fabricantes
GET    /api/entries                → Listar entradas (paginado)
GET    /api/health                 → Estado del servidor
```

---

## 🧪 Verificar que Funciona

### 1. Health Check Básico

```bash
# Desde la terminal
curl -i https://backend.patchamama.com/MVP-LogistiQ/minibackend/public/api/health

# Debería retornar:
# HTTP/1.1 200 OK
# Content-Type: application/json
# {
#   "status": "ok",
#   "timestamp": "2025-12-23T...",
#   "storage_path": "/var/www/vhosts/...",
#   "entries_count": 0,
#   "manufacturers_count": 0,
#   "php_version": "8.x.x"
# }
```

### 2. Desde el Navegador

```
https://backend.patchamama.com/MVP-LogistiQ/minibackend/public/api/health
```

### 3. Test de Creación de Entrada

```bash
curl -X POST https://backend.patchamama.com/MVP-LogistiQ/minibackend/public/api/entry \
  -H "Content-Type: application/json" \
  -d '{
    "referencia": "TEST",
    "fabricante": "Test Manufacturer",
    "cantidad": 1,
    "operario": "Tester",
    "observaciones": "Test entry",
    "imagenes": []
  }'
```

---

## 🔌 Configuración del Frontend

El frontend detecta automáticamente la URL correcta:

### Desarrollo Local
```
http://localhost:9000/api/...
```

### Producción en Plesk
```
https://backend.patchamama.com/MVP-LogistiQ/minibackend/public/api/...
```

### Forzar URL Específica (opcional)

En `frontend/.env`:
```env
VITE_MINI_API_URL=https://backend.patchamama.com/MVP-LogistiQ/minibackend/public
```

---

## 📁 Estructura de Archivos en Plesk

```
/var/www/vhosts/patchamama.com/httpdocs/
├── MVP-LogistiQ/
│   ├── frontend/
│   │   ├── dist/                 # Frontend compilado
│   │   └── src/
│   │
│   ├── minibackend/              # ← El backend que estamos configurando
│   │   ├── public/
│   │   │   ├── index.php        # ← Punto de entrada (solicitamos)
│   │   │   ├── .htaccess        # ← Reescritura de URLs
│   │   │   └── handlers/        # ← Endpoints específicos
│   │   ├── data/
│   │   │   ├── entries.json
│   │   │   └── manufacturers.json
│   │   └── storage/
│   │       └── almacen_imagenes/ # ← Imágenes almacenadas
│   │
│   └── [otros archivos]
```

---

## ✅ Checklist de Instalación

- [ ] Archivos subidos a `/var/www/vhosts/patchamama.com/httpdocs/MVP-LogistiQ/`
- [ ] Permisos establecidos correctamente (755 para directorios, 644 para archivos)
- [ ] `mod_rewrite` habilitado en Apache (en Plesk)
- [ ] `.htaccess` no está siendo bloqueado
- [ ] HTTPS está habilitado (Let's Encrypt)
- [ ] Health check responde correctamente
- [ ] CORS permite origen del frontend
- [ ] Directorios `data/` y `storage/` son escribibles

---

## 🔍 Troubleshooting

### Error 404 - Endpoint no encontrado

**Causa:** `.htaccess` no está siendo procesado

**Solución:**
1. En Plesk: **Dominios** → **patchamama.com** → **Apache & nginx**
2. Marcar: "✓ Allow custom .htaccess"
3. Restart Apache: `sudo systemctl restart httpd`

### Error 403 - Permiso denegado

**Causa:** Permisos de archivo incorrectos

**Solución:**
```bash
chmod 755 minibackend/
chmod 644 minibackend/data/*.json
chmod 755 minibackend/storage/almacen_imagenes/
```

### Error 500 - Server error

**Causa:** Error en PHP o creación de directorios

**Solución:**
1. Revisar logs de Plesk: `/var/log/httpd/error_log`
2. Verificar que `data/` y `storage/` existen:
   ```bash
   mkdir -p /var/www/vhosts/patchamama.com/httpdocs/MVP-LogistiQ/minibackend/data
   mkdir -p /var/www/vhosts/patchamama.com/httpdocs/MVP-LogistiQ/minibackend/storage/almacen_imagenes
   ```

### CORS errors en navegador

**Causa:** Origen no permitido

**Solución:**
1. Actualizar `minibackend/public/index.php` líneas 3-11 con tus dominios
2. Si es frontend diferente, agregar a `$allowedOrigins`

### Imágenes no se guardan

**Causa:** Permisos de escritura insuficientes

**Solución:**
```bash
sudo chown -R www-data:www-data /var/www/vhosts/patchamama.com/httpdocs/MVP-LogistiQ/minibackend/storage/
chmod 755 /var/www/vhosts/patchamama.com/httpdocs/MVP-LogistiQ/minibackend/storage/almacen_imagenes/
```

---

## 📊 Logs en Plesk

### Ver logs de Apache
```bash
tail -f /var/log/httpd/error_log
tail -f /var/log/httpd/domains/patchamama.com.error.log
```

### Ver logs de PHP
```bash
tail -f /var/log/php-fpm/error.log
```

---

## 🔐 Consideraciones de Seguridad

✅ **HTTPS Obligatorio** - Usar `https://` siempre
✅ **CORS Restringido** - Solo permitir dominios conocidos
✅ **Validación de Entrada** - El backend valida todos los datos
✅ **Permisos de Archivo** - Restrictivos (755 dirs, 644 files)
✅ **Sin Exposición de Rutas** - Las rutas PHP no se exponen

---

## 📝 Variables de Entorno Importantes

### En Plesk no necesitas .env explícito porque:
- PHP está preinstalado y configurado
- Rutas se detectan automáticamente
- CORS se configura en `index.php`

### Si necesitas personalizar:
1. Editar `minibackend/public/index.php` líneas 3-11
2. Agregar/remover dominios en `$allowedOrigins`

---

## 🚀 Próximos Pasos Después de Instalación

1. **Verificar health endpoint:**
   ```bash
   curl https://backend.patchamama.com/MVP-LogistiQ/minibackend/public/api/health
   ```

2. **Actualizar frontend URL (si es necesario):**
   ```bash
   # En frontend/.env
   VITE_MINI_API_URL=https://backend.patchamama.com/MVP-LogistiQ/minibackend/public
   ```

3. **Compilar y desplegar frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   # Copiar dist/ a frontend/dist/
   ```

4. **Monitorear logs:**
   ```bash
   tail -f /var/log/httpd/domains/patchamama.com.error.log
   ```

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisar logs:** `/var/log/httpd/error_log`
2. **Verificar CORS:** Ver headers en DevTools (F12)
3. **Test con curl:** Ver si el endpoint responde
4. **Permissions:** Asegurar que `storage/` es escribible

---

## 📚 Documentación Relacionada

- `minibackend/README.md` - Documentación de API endpoints
- `DEPLOY_FRONTEND_ONLY.md` - Deploy del frontend
- `FIX_DEPLOY_CONFLICTS.md` - Solución de conflictos de merge

---

**Versión:** 0.7.1
**Fecha:** Diciembre 23, 2025
**Estado:** ✅ Production Ready para Plesk
