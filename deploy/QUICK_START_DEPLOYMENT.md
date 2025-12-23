# 🚀 LogistiQ v0.7.1 - Quick Start Deployment

## Extrae el Paquete

```bash
tar -xzf logistiq-v0.7.1-deployment.tar.gz
cd deploy
```

## Para Desarrollo Local

### Terminal 1: Frontend
```bash
cd frontend/dist
python3 -m http.server 5173
# Acceder a: http://localhost:5173
```

### Terminal 2: MiniBACKEND
```bash
cd minibackend/public
php -S localhost:9000
# API disponible en: http://localhost:9000/api
```

## Para Producción

### 1. Copiar Archivos

```bash
# Frontend
sudo cp -r frontend/dist /var/www/html/logistiq

# MiniBACKEND
sudo cp -r minibackend /var/www/logistiq
```

### 2. Establecer Permisos

```bash
sudo chown -R www-data:www-data /var/www/logistiq
sudo chmod 755 /var/www/logistiq/minibackend/storage/almacen_imagenes
sudo chmod 755 /var/www/logistiq/minibackend/data
```

### 3. Configurar Virtual Hosts

Ver `README_DEPLOY.md` para ejemplos de Apache/Nginx

### 4. SSL/TLS

```bash
sudo certbot certonly --standalone -d logistiq.ejemplo.com
```

### 5. Verificar Instalación

```bash
curl http://localhost:9000/api/health
# Debería retornar: {"status":"ok",...}
```

## 📊 Qué Hay en Cada Carpeta

| Carpeta | Descripción |
|---------|-------------|
| `frontend/dist/` | Frontend compilado (listo para servir) |
| `minibackend/public/` | PHP API (endpoint principal) |
| `minibackend/data/` | Datos JSON (entries, manufacturers) |
| `minibackend/storage/` | Almacenamiento de imágenes |

## 🔗 Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/entry` | Crear entrada |
| GET | `/api/check-reference` | Verificar referencia |
| GET | `/api/manufacturers` | Listar fabricantes |
| GET | `/api/entries` | Listar entradas |
| GET | `/api/health` | Verificar estado |

## 📝 Variables de Entorno

### Frontend (si necesitas cambiar APIs)

Editar `frontend/dist/` → buscar config en HTML o crear `.env`:

```
VITE_API_URL=https://api.ejemplo.com/api
VITE_MINI_API_URL=https://miniapi.ejemplo.com/api
```

## ⚡ Características Incluidas

✅ Frontend React 19 compilado y optimizado
✅ MiniBACKEND PHP con 5 endpoints REST
✅ Almacenamiento de imágenes por fabricante/referencia
✅ PWA (funciona offline)
✅ Multiidioma (ES/EN)
✅ Respuesta HTTP completa y validaciones

## 📞 Soporte

Consultar:
- `README_DEPLOY.md` - Guía de producción
- `MINIBACKEND_SETUP.md` - Instalación detallada
- `minibackend/README.md` - Documentación API

## 🎉 ¡Listo!

Una vez desplegado, accede a:
- Frontend: https://logistiq.ejemplo.com
- MiniBACKEND: https://miniapi.ejemplo.com/api/health

---

**Versión:** 0.7.1
**Tamaño:** 135 KB (comprimido)
**Listp para:** Producción
