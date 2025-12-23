# Vista Previa: Modal de Detalles del Error

## 🎨 Interfaz del Usuario

Cuando ocurre un error en LogistiQ, el usuario verá:

### 1. **Badge de Error Inicial** (En la pantalla principal)

```
┌──────────────────────────────────────────────────┐
│ ❌ Error al procesar la imagen                    │
│                                                  │
│ Código HTTP: 400 | Error Code: INVALID_REQUEST   │
│                                                  │
│ 🔍 Haz click aquí para ver detalles completos    │
│    (URL, logs, etc.)                             │
└──────────────────────────────────────────────────┘
```

**Elementos:**
- ❌ Icono rojo indicando error
- Mensaje principal del error
- Código HTTP visible a simple vista
- Error code para categorización
- Instrucción clara de cómo ver más detalles
- **Clickeable**: Al hacer click, se abre el modal

---

### 2. **Modal de Detalles del Error** (Al hacer click)

```
╔══════════════════════════════════════════════════════════════╗
║ 🔴 Detalles del Error                               ✕       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║ 📌 ERROR PRINCIPAL                                           ║
║ ┌────────────────────────────────────────────────────────┐  ║
║ │ OpenAI API key not configured                          │  ║
║ └────────────────────────────────────────────────────────┘  ║
║                                                              ║
║ 🌐 SOLICITUD HTTP                                            ║
║ ┌────────────────────────────────────────────────────────┐  ║
║ │ URL: http://localhost:8000/api/ocr/process            │  ║
║ │ Método: POST                                           │  ║
║ │ Código HTTP: 400                                       │  ║
║ │ Error Code: INVALID_REQUEST                            │  ║
║ └────────────────────────────────────────────────────────┘  ║
║                                                              ║
║ ⚙️  RESPUESTA DEL BACKEND                                    ║
║ ┌────────────────────────────────────────────────────────┐  ║
║ │ Mensaje: OpenAI API key not configured. Please         │  ║
║ │          configure it in settings.                    │  ║
║ │ Detalles: {                                            │  ║
║ │   "engine": "openai-vision",                           │  ║
║ │   "userId": "user_1234567"                             │  ║
║ │ }                                                      │  ║
║ └────────────────────────────────────────────────────────┘  ║
║                                                              ║
║ 💻 INFORMACIÓN DEL CLIENTE                                   ║
║ ┌────────────────────────────────────────────────────────┐  ║
║ │ Hora: 2025-12-23T15:30:45.123Z                         │  ║
║ │ User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64...    │  ║
║ │ Axios Error: Request failed with status code 400       │  ║
║ └────────────────────────────────────────────────────────┘  ║
║                                                              ║
║ 📢 PARA REPORTAR ESTE ERROR                                  ║
║ ┌────────────────────────────────────────────────────────┐  ║
║ │ ✓ Incluye el código HTTP: 400                          │  ║
║ │ ✓ Incluye el Error Code: INVALID_REQUEST               │  ║
║ │ ✓ Incluye la URL del endpoint:                         │  ║
║ │   http://localhost:8000/api/ocr/process                │  ║
║ │ ✓ Copia toda la información usando el botón de abajo   │  ║
║ └────────────────────────────────────────────────────────┘  ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║ [📋 Copiar Información Completa]    [Cerrar]               ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 🎯 Flujo Completo de Error

### Paso 1: Usuario intenta procesar imagen
```
1. Usuario abre la cámara
2. Captura una imagen
3. Selecciona motor "OpenAI GPT-4 Vision"
4. Presiona "Capturar"
```

### Paso 2: Error ocurre en el backend
```
Backend: "Hey, el usuario no configuró su OpenAI API key"
Backend: "Devolviendo error 400"
```

### Paso 3: Frontend captura el error
```
Frontend captura automáticamente:
- URL: http://localhost:8000/api/ocr/process
- Método: POST
- Código HTTP: 400
- Error Message: "OpenAI API key not configured..."
- Timestamp: 2025-12-23T15:30:45.123Z
- User-Agent: Mozilla/5.0...
```

### Paso 4: Usuario ve el error
```
Se muestra el badge rojo con:
- Error principal: "Error al procesar la imagen"
- Código HTTP: 400
- Error Code: INVALID_REQUEST
```

### Paso 5: Usuario hace click para más detalles
```
Se abre el modal mostrando:
- El mensaje exacto del backend
- URL del endpoint
- Toda la información técnica
- Instrucciones para reportar
```

### Paso 6: Usuario copia y reporta
```
Usuario hace click en "Copiar Información Completa"
Se copia todo al portapapeles
Usuario crea un issue en GitHub con la información
```

---

## 📱 Vista en Dispositivos Móviles

En dispositivos móviles, el modal se adapta automáticamente:

```
┌─────────────────────────────┐
│ 🔴 Detalles del Error    ✕  │
├─────────────────────────────┤
│                             │
│ 📌 ERROR PRINCIPAL          │
│ OpenAI API key not          │
│ configured                  │
│                             │
│ 🌐 SOLICITUD HTTP           │
│ URL: http://localhost...    │
│ Método: POST                │
│ Código HTTP: 400            │
│ Error Code: INVALID_REQUEST │
│                             │
│ [Scroll down for more...]   │
│                             │
│ [📋 Copiar] [Cerrar]        │
└─────────────────────────────┘
```

---

## 🎨 Esquema de Colores del Modal

| Sección | Color | Significado |
|---------|-------|------------|
| Header | 🔴 Rojo Oscuro | Error crítico |
| Error Principal | 🔴 Rojo Claro | Descripción del error |
| Solicitud HTTP | 🔵 Azul | Detalles técnicos |
| Respuesta Backend | 🟠 Naranja | Información del servidor |
| Cliente | ⚪ Gris | Información local |
| Detalles Técnicos | 🟣 Púrpura | Datos complejos |
| Instrucciones | 🟡 Amarillo | Cómo reportar |

---

## 💾 Información que se Copia al Portapapeles

Cuando el usuario hace click en "📋 Copiar Información Completa", se copia:

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
   Detalles: {
  "engine": "openai-vision",
  "userId": "user_1234567"
}

💻 INFORMACIÓN DEL CLIENTE:
   Hora: 2025-12-23T15:30:45.123Z
   User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
   Axios Error: Request failed with status code 400

════════════════════════════════════════
```

---

## 🔄 Diferentes Tipos de Errores

### Error 1️⃣: API Key no Configurada
```
Código HTTP: 400
Error Code: INVALID_REQUEST
Color: 🔴 Rojo
Acción: Ir a Configuración > API Keys
```

### Error 2️⃣: API Key Inválida
```
Código HTTP: 400
Error Code: INVALID_KEY
Color: 🔴 Rojo
Acción: Verificar formato de API key
```

### Error 3️⃣: API Key Expirada
```
Código HTTP: 401
Error Code: UNAUTHORIZED
Color: 🔴 Rojo
Acción: Renovar API key en cuenta del proveedor
```

### Error 4️⃣: Límite de Llamadas Alcanzado
```
Código HTTP: 429
Error Code: RATE_LIMIT_ERROR
Color: 🟠 Naranja
Acción: Esperar antes de reintentar
```

### Error 5️⃣: Error de Red
```
Código HTTP: Network Error
Error Code: NETWORK_ERROR
Color: 🔴 Rojo
Acción: Verificar que el backend está corriendo
```

### Error 6️⃣: Error Interno del Servidor
```
Código HTTP: 500
Error Code: INTERNAL_SERVER_ERROR
Color: 🔴 Rojo
Acción: Contactar al administrador
```

---

## 🖼️ Ejemplo Real Completo

### Escenario: Usuario intenta usar OpenAI Vision sin API key

**Lo que ve el usuario:**

1. **Primero** - Badge de error simple:
```
❌ Error al procesar la imagen
Código HTTP: 400 | Error Code: INVALID_REQUEST
🔍 Haz click aquí para ver detalles completos (URL, logs, etc.)
```

2. **Luego de hacer click** - Modal completo:
```
[Modal abierto con toda la información detallada]
- Error Principal: "OpenAI API key not configured"
- URL: http://localhost:8000/api/ocr/process
- Código HTTP: 400
- Mensaje del Backend: "OpenAI API key not configured..."
- Información del cliente (hora, navegador)
- Botón para copiar todo
```

3. **Después de copiar** - Usuario ve confirmación:
```
alert("Error copiado al portapapeles")
```

4. **Usuario crea issue en GitHub** - Pega la información:
```
🐛 Descripción:
Intenté usar OpenAI Vision pero recibo error 400

📋 Información del Error:
[PEGA AQUÍ LA INFORMACIÓN COPIADA]

📝 Pasos para reproducir:
1. Abre la app
2. Selecciona "OpenAI GPT-4 Vision"
3. Captura una imagen
4. Veo error "OpenAI API key not configured"
```

---

## ✨ Ventajas del Sistema de Reporte

✅ **Para Usuarios:**
- Entienden qué salió mal
- Saben exactamente qué información copiar
- Instrucciones claras de qué hacer

✅ **Para Desarrolladores:**
- Información técnica completa
- Timestamp exacto del error
- URL y método de solicitud
- Detalles del backend
- Info del cliente (navegador, OS)

✅ **Para Soporte:**
- Errores categorizados por código
- Toda la información en un lugar
- Fácil de buscar y filtrar
- Contexto completo del problema

---

**Última actualización:** 23 de Diciembre de 2025
**Versión:** LogistiQ v0.7.0
