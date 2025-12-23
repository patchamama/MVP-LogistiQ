# 🚀 Deploy Frontend Solo - Usando deploy.sh

**Versión:** 0.7.1
**Método:** Usando `deploy.sh` mejorado
**Frontend incluido en GitHub:** ✅ Sí (frontend/dist/)

---

## 📋 Resumen

Ahora puedes desplegar solo el frontend directamente desde GitHub usando el script `deploy.sh` mejorado:

```bash
./deploy.sh
```

El script automáticamente:
1. ✅ Hace `git pull` desde GitHub
2. ✅ Verifica si `frontend/dist` existe
3. ✅ Reconstruye el frontend si es necesario (npm install + npm run build)
4. ✅ Copia archivos al directorio de deploy
5. ✅ Actualiza version.json

---

## 🚀 Pasos para Desplegar

### Opción 1: Deploy Rápido (Usando frontend/dist de GitHub)

```bash
# 1. Ir al directorio del proyecto
cd /ruta/a/MVP-LogistiQ

# 2. Ejecutar el script de deploy
chmod +x deploy.sh
./deploy.sh
```

**Ventaja:** Rápido, usa el build ya compilado en GitHub

**Tiempo:** ~10 segundos

### Opción 2: Deploy con Reconstrucción

Si necesitas cambios recientes en el frontend:

```bash
# 1. Clonar/actualizar desde GitHub
git clone https://github.com/patchamama/MVP-LogistiQ.git
cd MVP-LogistiQ

# 2. Si no hay frontend/dist, el script lo construirá automáticamente
./deploy.sh
```

**Ventaja:** Garantiza que tienes el build más reciente

**Tiempo:** ~30-60 segundos (incluye npm install)

---

## 📊 Cómo Funciona el Script

### Paso 1: Git Pull
```bash
git pull origin main
```
Descarga los últimos cambios incluyendo `frontend/dist/`

### Paso 2: Verificar/Construir Frontend
```bash
# Si frontend/dist está vacío, reconstruir:
cd frontend
npm install
npm run build
cd ..
```

### Paso 3: Copiar Archivos
```bash
cp -r frontend/dist/* .
```
Copia archivos compilados a la raíz del proyecto para servir

### Paso 4: Actualizar Version
```bash
cat > version.json << EOF
{
  "version": "0.7.1",
  "timestamp": "2025-12-23T12:09:00.000Z"
}
EOF
```

---

## ✨ Qué Está Incluido en GitHub

```
MVP-LogistiQ/
├── frontend/dist/              ✅ INCLUIDO EN GITHUB (Build completo)
│   ├── index.html
│   ├── assets/
│   │   ├── index-XXX.js        (Bundle React compilado)
│   │   └── index-XXX.css       (Estilos compilados)
│   ├── sw.js                   (Service Worker)
│   ├── manifest.webmanifest    (PWA metadata)
│   └── workbox-*.js            (Precaching)
│
├── frontend/src/               (Código fuente TypeScript/React)
├── minibackend/                (API REST)
└── deploy.sh                   (Script mejorado)
```

**IMPORTANTE:** `frontend/dist/` ahora está **incluido en GitHub** para permitir deploy rápido.

---

## 🔄 Workflow de Deploy

### Escenario 1: Deploy Rápido (Producción)

```bash
# En tu servidor de producción:
cd /var/www/logistiq
./deploy.sh

# Resultado: Archivos actualizados en ~10 segundos
```

### Escenario 2: Cambios en Frontend

```bash
# En tu máquina local:
cd frontend
# Hacer cambios al código...
npm run build

# Commit y push:
git add frontend/dist frontend/src
git commit -m "feat: update frontend"
git push origin main

# En servidor de producción:
cd /var/www/logistiq
./deploy.sh

# El script detecta que frontend/dist existe y lo usa directamente
```

### Escenario 3: Construcción Limpia

```bash
# Si necesitas reconstruir desde cero:
rm -rf frontend/dist
./deploy.sh

# El script detecta que falta frontend/dist y reconstruye
```

---

## 📝 Variables de Entorno

El script usa estas rutas:

```bash
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT="$SCRIPT_DIR"
FRONTEND_DIST="$PROJECT_ROOT/frontend/dist"
DEPLOY_DIR="$PROJECT_ROOT"
```

Personaliza si necesitas desplegar a otra ubicación editando el script.

---

## 🔍 Verificar Estado del Deploy

Después de ejecutar `./deploy.sh`:

```bash
# Verificar versión
cat version.json

# Verificar archivos copiados
ls -la index.html assets/ sw.js

# Verificar timestamps
stat index.html | grep -i modify
```

---

## 📋 Checklist de Deploy

- [ ] Script tiene permisos de ejecución: `chmod +x deploy.sh`
- [ ] Git está configurado correctamente
- [ ] Tienes acceso a GitHub (clone/pull)
- [ ] `frontend/dist` existe en GitHub (✅ Ya está)
- [ ] `npm` está instalado (si necesitas reconstruir)
- [ ] Directorio de deploy tiene permisos de escritura

---

## 🆘 Troubleshooting

### Error: "Dist folder not found"

**Solución 1:** Hacer git pull para descargar frontend/dist

```bash
git pull origin main
./deploy.sh
```

**Solución 2:** Construir manualmente

```bash
cd frontend
npm install
npm run build
cd ..
./deploy.sh
```

### Error: "Git pull failed"

**Causa:** No hay acceso a GitHub o token expirado

**Solución:**

```bash
# Verificar remoto
git remote -v

# Hacer pull manualmente
git fetch origin main
git reset --hard origin/main

# Luego ejecutar deploy
./deploy.sh
```

### Error: "Copy operation failed"

**Causa:** Permisos de carpeta

**Solución:**

```bash
# Dar permisos
chmod -R 755 .

# Luego ejecutar deploy
./deploy.sh
```

### Frontend no se actualiza

**Solución:** Limpiar cache del navegador (Ctrl+Shift+R en Firefox/Chrome)

---

## 📊 Estadísticas de Deploy

| Metrica | Valor |
|---------|-------|
| Frontend Size | 365 KB |
| Gzipped | 115 KB |
| Build Time | 1.1s |
| Deploy Time | ~10s (sin build) |
| Deploy Time | ~60s (con build) |
| GitHub Package | 136 KB (tar.gz) |

---

## 🔒 Consideraciones

✅ **frontend/dist está versionado en GitHub**
✅ **No necesitas npm en producción si usas deploy rápido**
✅ **Script es idempotente (seguro ejecutar múltiples veces)**
✅ **version.json se actualiza automáticamente**
✅ **Backward compatible con deploy.sh anterior**

---

## 📝 Comandos Útiles

```bash
# Deploy (modo rápido si dist existe)
./deploy.sh

# Force rebuild antes de deploy
rm -rf frontend/dist && ./deploy.sh

# Deploy con salida detallada
bash -x ./deploy.sh

# Deploy solo si hay cambios
git pull && [ ! -z "$(git diff --cached)" ] && ./deploy.sh

# Cron job para deploy automático cada hora
0 * * * * cd /ruta/a/MVP-LogistiQ && ./deploy.sh >> /tmp/deploy.log 2>&1
```

---

## 🎯 Resumen

**Antes (sin frontend/dist en GitHub):**
- Necesitabas npm en el servidor
- Deploy lento (~60s siempre)
- Riesgo de inconsistencias de build

**Ahora (con frontend/dist en GitHub):**
- ✅ Deploy rápido (~10s)
- ✅ No necesitas npm en producción
- ✅ Build consistente (controlado en CI/CD)
- ✅ `./deploy.sh` es suficiente

---

**Versión:** 0.7.1
**Fecha:** Diciembre 23, 2025
**Estado:** ✅ Production Ready
