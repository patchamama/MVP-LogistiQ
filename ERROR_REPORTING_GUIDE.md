# Guía de Reporte de Errores - LogistiQ v0.7.0

## 🎯 Introducción

Cuando ocurre un error en LogistiQ, el sistema captura automáticamente información detallada que ayuda a los desarrolladores a diagnosticar y resolver el problema rápidamente.

---

## 📊 Información Capturada en Cada Error

### 1. **Error Principal** 🔴
- **Mensaje**: Descripción legible del error
- **Ejemplo**: "OpenAI API key not configured"

### 2. **Detalles de la Solicitud HTTP** 🌐

```
URL:           http://localhost:8000/api/ocr/process
Método:        POST
Código HTTP:   400, 401, 403, 404, 500, etc.
Error Code:    UNKNOWN_ERROR, INVALID_KEY, etc.
```

**Códigos HTTP comunes:**
| Código | Significado |
|--------|------------|
| 400 | Bad Request - Datos inválidos enviados |
| 401 | Unauthorized - Credenciales faltantes |
| 403 | Forbidden - Permiso denegado |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error en el servidor |
| 503 | Service Unavailable - Servicio no disponible |

### 3. **Respuesta del Backend** ⚙️

Información específica devuelta por el servidor:
- **Mensaje**: Descripción del error del backend
- **Detalles**: Información técnica adicional (si está disponible)
- **Ejemplos**:
  - `"OpenAI API key not configured. Please configure it in settings."`
  - `"Invalid API key format"`
  - `"API request timeout"`

### 4. **Información del Cliente** 💻

- **Timestamp**: Hora exacta del error (ISO 8601)
- **User-Agent**: Información del navegador y sistema operativo
- **Axios Error**: Mensaje de error de la librería HTTP

**Ejemplo de User-Agent:**
```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
```

### 5. **Detalles Técnicos** 📋

Información estructurada en JSON con:
- Códigos de error específicos
- Paths de archivos (si aplica)
- Stack traces (si están disponibles)
- Información de la conexión API

---

## 🔍 Ejemplos de Errores Reales

### Ejemplo 1: API Key no Configurada

```
════════════════════════════════════════
REPORTE DE ERROR - PARA DESARROLLADORES
════════════════════════════════════════

📌 ERROR PRINCIPAL:
OpenAI API key not configured

🌐 SOLICITUD HTTP:
   URL: http://localhost:8000/api/ocr/process
   Método: POST
   Código HTTP: 400
   Error Code: INVALID_REQUEST

⚙️  RESPUESTA DEL BACKEND:
   Mensaje: OpenAI API key not configured. Please configure it in settings.
   Detalles: {"engine":"openai-vision","userId":"user_1234"}

💻 INFORMACIÓN DEL CLIENTE:
   Hora: 2025-12-23T15:30:45.123Z
   User-Agent: Mozilla/5.0...
   Axios Error: Request failed with status code 400
```

**Diagnóstico:**
- El usuario seleccionó "OpenAI GPT-4 Vision" pero no ha configurado su API key
- **Acción**: Usuario debe ir a Configuración > API Keys y agregar su OpenAI API key

---

### Ejemplo 2: API Key Inválida

```
════════════════════════════════════════
REPORTE DE ERROR - PARA DESARROLLADORES
════════════════════════════════════════

📌 ERROR PRINCIPAL:
Invalid API key format

🌐 SOLICITUD HTTP:
   URL: http://localhost:8000/api/ocr/process
   Método: POST
   Código HTTP: 400
   Error Code: INVALID_KEY

⚙️  RESPUESTA DEL BACKEND:
   Mensaje: Invalid OpenAI API key format
   Detalles: {"expected":"sk-*","received":"invalid-key"}

💻 INFORMACIÓN DEL CLIENTE:
   Hora: 2025-12-23T15:35:22.456Z
   User-Agent: Mozilla/5.0...
```

**Diagnóstico:**
- La API key guardada tiene un formato inválido
- OpenAI keys deben empezar con `sk-` o `sk-proj-`
- **Acción**: Usuario debe verificar y corregir su OpenAI API key

---

### Ejemplo 3: Error de Conexión a Backend

```
════════════════════════════════════════
REPORTE DE ERROR - PARA DESARROLLADORES
════════════════════════════════════════

📌 ERROR PRINCIPAL:
Network Error

🌐 SOLICITUD HTTP:
   URL: http://localhost:8000/api/ocr/process
   Método: POST
   Código HTTP: Network Error
   Error Code: NETWORK_ERROR

💻 INFORMACIÓN DEL CLIENTE:
   Hora: 2025-12-23T15:40:10.789Z
   User-Agent: Mozilla/5.0...
   Axios Error: ERR_NETWORK
```

**Diagnóstico:**
- El frontend no puede conectar con el backend
- Posibles causas:
  - Backend no está corriendo
  - URL incorrecta en configuración
  - Problema de red/firewall
  - CORS bloqueado
- **Acción**: Verificar que el backend está corriendo en la URL correcta

---

### Ejemplo 4: Límite de Llamadas API (Rate Limit)

```
════════════════════════════════════════
REPORTE DE ERROR - PARA DESARROLLADORES
════════════════════════════════════════

📌 ERROR PRINCIPAL:
API rate limit exceeded

🌐 SOLICITUD HTTP:
   URL: https://api.openai.com/v1/chat/completions
   Método: POST
   Código HTTP: 429
   Error Code: RATE_LIMIT_ERROR

⚙️  RESPUESTA DEL BACKEND:
   Mensaje: OpenAI API rate limit exceeded
   Detalles: {
     "retry_after": 60,
     "limit_type": "requests_per_minute"
   }

💻 INFORMACIÓN DEL CLIENTE:
   Hora: 2025-12-23T15:45:33.012Z
   User-Agent: Mozilla/5.0...
```

**Diagnóstico:**
- Usuario ha alcanzado el límite de llamadas a la API de OpenAI
- El servidor sugiere esperar 60 segundos antes de reintentar
- **Acción**: Esperar antes de intentar de nuevo, o verificar límites de la cuenta OpenAI

---

### Ejemplo 5: Error de Encriptación del Servidor

```
════════════════════════════════════════
REPORTE DE ERROR - PARA DESARROLLADORES
════════════════════════════════════════

📌 ERROR PRINCIPAL:
Decryption failed

🌐 SOLICITUD HTTP:
   URL: http://localhost:8000/api/ocr/process
   Método: POST
   Código HTTP: 500
   Error Code: ENCRYPTION_ERROR

⚙️  RESPUESTA DEL BACKEND:
   Mensaje: Internal server error
   Detalles: {
     "error": "Decryption failed",
     "context": "APIKeyService.getUserKeys()"
   }

💻 INFORMACIÓN DEL CLIENTE:
   Hora: 2025-12-23T15:50:45.234Z
   User-Agent: Mozilla/5.0...
```

**Diagnóstico:**
- Problema con la encriptación/desencriptación de API keys
- Posibles causas:
  - ENCRYPTION_KEY cambió en el servidor
  - Datos corruptos en api_keys.json
  - Versión de PHP/OpenSSL incompatible
- **Acción**: Contactar con administrador del servidor

---

## 📋 Cómo Reportar Errores a Desarrolladores

### 1. **Captura el Error**
   - Espera a que aparezca el mensaje de error en rojo
   - Verás el código HTTP y error code en primer plano

### 2. **Haz Click en "Haz click aquí para ver detalles"**
   - Se abre un modal con información completa
   - Desplázate para ver toda la información

### 3. **Copia la Información**
   - Haz click en el botón `📋 Copiar Información Completa`
   - Se copia al portapapeles automáticamente

### 4. **Crea un Issue en GitHub**
   - Ve a: https://github.com/patchamama/MVP-LogistiQ/issues
   - Click en "New Issue"
   - Pega la información copiada
   - Agrega descripción de qué estabas haciendo

### 5. **Incluye Contexto Adicional**
   - ¿Qué estabas intentando hacer?
   - ¿Cuál era el motor OCR seleccionado?
   - ¿Puedes reproducir el error?
   - ¿En qué navegador ocurre?

---

## 🔒 Privacidad y Seguridad

### Información Que Se Recopila
- ✅ URL de solicitud (sin parámetros sensibles)
- ✅ Método HTTP
- ✅ Código de estado HTTP
- ✅ Mensajes de error
- ✅ Timestamp
- ✅ User-Agent del navegador

### Información Que NO Se Recopila
- ❌ Contenido de las imágenes procesadas
- ❌ API keys (nunca se envían de vuelta)
- ❌ Datos personales del usuario
- ❌ Historial de búsquedas
- ❌ Contraseñas

---

## 🛠️ Para Desarrolladores

### Estructura de ErrorDetails en TypeScript

```typescript
interface ErrorDetails {
  url?: string                    // URL del endpoint
  method?: string                 // GET, POST, DELETE
  statusCode?: number | string    // 400, 500, 'Network Error'
  errorCode?: string              // UNKNOWN_ERROR, INVALID_KEY
  timestamp?: string              // ISO 8601 format
  userAgent?: string              // Browser info
  backendMessage?: string         // Error message from server
  backendDetails?: any            // Additional backend info
  axiosError?: string             // HTTP client error
}
```

### Cómo Añadir Más Detalles a los Errores

En el backend (PHP):
```php
return $this->jsonResponse($response, [
    'success' => false,
    'message' => 'Human readable error message',
    'error' => 'ERROR_CODE',
    'details' => [
        'context' => 'FunctionName',
        'attempted_action' => 'What the system tried to do',
        'additional_info' => 'Any debug info'
    ]
], 400);
```

En el frontend (TypeScript):
```typescript
// El servicio API automáticamente capturará:
- URL de solicitud
- Código HTTP
- Timestamp
- User-Agent
- Información del error del backend
```

### Monitoreo y Logging

Para registrar errores en la consola del desarrollador:
```javascript
// Open DevTools (F12)
// Go to Console tab
// Errors will be logged with full details
```

---

## 📞 Contacto y Soporte

Si necesitas ayuda con un error:

1. **Copia la información del error** (botón en el modal)
2. **Crea un issue en GitHub**: https://github.com/patchamama/MVP-LogistiQ/issues
3. **Incluye**:
   - El reporte de error completo
   - Pasos para reproducir
   - Navegador y sistema operativo
   - Información de la API key (no compartir la key real)

---

## ✅ Checklist para Reportar Errores

- [ ] Copié la información completa del error
- [ ] Incluí el código HTTP y error code
- [ ] Describí qué estaba intentando hacer
- [ ] Mencioné el navegador que usé
- [ ] Incluí el timestamp del error
- [ ] Proporciono pasos para reproducir
- [ ] No compartí ninguna API key real

---

## 🎓 Tabla Rápida de Soluciones

| Error Code | Causa | Solución |
|-----------|-------|----------|
| 400 | Datos inválidos | Verifica los datos enviados |
| 401 | API key inválida | Verifica tu API key en Configuración |
| 403 | Permiso denegado | Verifica permisos de tu API key |
| 404 | Recurso no encontrado | Verifica URL del backend |
| 429 | Rate limit | Espera antes de reintentar |
| 500 | Error del servidor | Contacta al administrador |
| NETWORK_ERROR | Sin conexión | Verifica backend está corriendo |
| INVALID_KEY | Formato de key | Verifica formato: sk-* (OpenAI), sk-ant-* (Claude) |
| ENCRYPTION_ERROR | Error de encriptación | Contacta al administrador |

---

**Última actualización:** 23 de Diciembre de 2025
**Versión:** LogistiQ v0.7.0
