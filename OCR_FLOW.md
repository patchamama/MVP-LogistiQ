# OCR Processing Flow - Complete Integration

## Overview

The application now has a complete OCR pipeline that:
1. Retrieves encrypted API keys from the backend
2. Decrypts them in the browser (JavaScript)
3. Sends the decrypted keys to the MiniBACKEND
4. Processes images with Claude Vision (with OpenAI fallback)
5. Extracts reference codes automatically

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  WarehouseEntry Component                                    │
│  ├─ Calls checkHealth() → Gets encryption_key               │
│  ├─ Calls checkHealth() → Gets ocr_engines[].api_key_encrypted│
│  ├─ Uses decryptAPIKey() → Decrypts keys locally            │
│  └─ On image capture/upload:                                 │
│     ├─ Converts image to base64                             │
│     ├─ Calls processOCR(base64, claudeKey, openaiKey)       │
│     └─ Fills referencia field with extracted code           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓↓↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│              MiniBACKEND (PHP) on Production                 │
│                Backend at https://backend.patchamama.com     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  POST /api/health                                            │
│  └─ Returns:                                                 │
│     ├─ encryption_enabled: boolean                          │
│     ├─ encryption_key: hex string (64 chars)                │
│     └─ ocr_engines: Array with api_key_encrypted            │
│                                                               │
│  POST /api/ocr/process                                       │
│  ├─ Input:                                                   │
│  │  ├─ image_base64: Image data                            │
│  │  ├─ claude_api_key: Decrypted Claude key (optional)      │
│  │  ├─ openai_api_key: Decrypted OpenAI key (optional)      │
│  │  └─ language: 'es' or 'en' (default: es)                │
│  │                                                            │
│  ├─ OCRService Processing:                                  │
│  │  ├─ Try Claude Vision API                                │
│  │  │  └─ If success → Extract and return code             │
│  │  │  └─ If fail → Continue to fallback                   │
│  │  │                                                        │
│  │  └─ Try OpenAI Vision API (fallback)                     │
│  │     └─ If success → Extract and return code             │
│  │     └─ If fail → Return error                           │
│  │                                                            │
│  └─ Output:                                                  │
│     ├─ success: boolean                                     │
│     ├─ code: string or null                                 │
│     ├─ engine: 'claude' or 'openai'                         │
│     ├─ raw_response: Full response text                     │
│     └─ error: Error message if failed                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Step-by-Step Flow

### 1. Component Mount
```javascript
// WarehouseEntry.tsx - useEffect
loadAvailableOCREngines()
  ↓
checkHealth()
  ↓
Response:
{
  encryption_enabled: true,
  encryption_key: "b324431e082e95a3fc38b4bc00d4f002dc600d18aa4773f54abd16b760b1225e",
  ocr_engines: [
    {
      name: "openai",
      requires_key: true,
      api_key_encrypted: "ZTg2YzM4NzAzOGYwNDE5NTdlYzcyZDkyMzhmMDQwYTE6OjVIZ3..."
    },
    {
      name: "claude",
      requires_key: true,
      api_key_encrypted: "..."
    }
  ]
}
```

### 2. Decrypt API Keys
```javascript
// In loadAvailableOCREngines()
for (const engine of health.ocr_engines) {
  if (engine.api_key_encrypted) {
    keys[engine.name] = decryptAPIKey(
      engine.api_key_encrypted,
      health.encryption_key,
      health.encryption_enabled
    )
  }
}
// Result: decryptedKeys = { openai: "sk-proj-...", claude: "sk-ant-..." }
```

### 3. Image Capture / Upload
```javascript
// When user captures label with camera or uploads image
const imageBase64Clean = imageBase64.split(',')[1]  // Remove data URI prefix

const response = await processOCR(
  imageBase64Clean,
  decryptedKeys['claude'],    // Decrypted key
  decryptedKeys['openai']     // Decrypted key
)

// Sets referencia field with extracted code
setReferencia(response.code)
```

### 4. Backend Processing

**HTTP Request to `/api/ocr/process`:**
```json
{
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAUA...",
  "claude_api_key": "sk-ant-v5...",
  "openai_api_key": "sk-proj-...",
  "language": "es"
}
```

**Claude Vision API Call (Primary):**
```bash
POST https://api.anthropic.com/v1/messages
Authorization: Bearer sk-ant-v5...
Content-Type: application/json

{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image",
          "source": {
            "type": "base64",
            "media_type": "image/jpeg",
            "data": "iVBORw0KGgoAAAA..."
          }
        },
        {
          "type": "text",
          "text": "[Extraction prompt in Spanish]"
        }
      ]
    }
  ]
}
```

**If Claude Fails → OpenAI Vision API (Fallback):**
```bash
POST https://api.openai.com/v1/chat/completions
Authorization: Bearer sk-proj-...
Content-Type: application/json

{
  "model": "gpt-4o",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,iVBORw0KGgoAAAA..."
          }
        },
        {
          "type": "text",
          "text": "[Extraction prompt in Spanish]"
        }
      ]
    }
  ]
}
```

**Extraction Prompt (Spanish):**
```
Analiza esta imagen y extrae cualquier código de referencia, número de producto, código QR o número de identificación visible.

Tu respuesta DEBE estar en este formato JSON exacto:
{
  "code": "EL_CÓDIGO_O_REFERENCIA_EXTRAÍDA",
  "confidence": "alta/media/baja",
  "type": "codigo_qr/numero_referencia/codigo_producto/codigo_barras/otro",
  "details": "Descripción breve de lo encontrado"
}
```

**Backend Response:**
```json
{
  "success": true,
  "code": "ABC-123-XYZ",
  "engine": "claude",
  "raw_response": "{\"code\": \"ABC-123-XYZ\", \"confidence\": \"alta\", ...}",
  "error": null
}
```

### 5. Frontend Updates
```javascript
// WarehouseEntry.tsx
if (response.success && response.code) {
  setReferencia(response.code)
  console.log(`✓ Código extraído con ${response.engine}: ${response.code}`)
} else {
  setError(response.error)
}
```

## Security Flow

### Encryption at Rest
```
config.php (on server):
  ├─ encryption.enabled: true
  ├─ encryption.key: "b324431e082e95a3fc38b4bc00d4f002dc600d18aa4773f54abd16b760b1225e"
  └─ ocr.engines[].api_key_encrypted: "ZTg2YzM4NzAzOGYwNDE5NTdlYzcyZDkyMzhmMDQwYTE6OjVIZ3..."
```

### Encryption in Transit
```
HTTPS (TLS 1.2+)
/api/health
  → Returns: encryption_key + api_key_encrypted
  → Frontend receives encrypted keys + encryption key

/api/ocr/process
  → Sends: decrypted API keys + image
  → HTTPS protects in transit
```

### Decryption in Browser
```javascript
// decryptAPIKey() function
// Uses CryptoJS AES-256-CBC with:
// ├─ Key: encryption_key (hex string, 64 chars)
// ├─ IV: Extracted from encrypted data (deterministic)
// ├─ Padding: PKCS7
// └─ Mode: CBC

// Result: Plaintext API key ready to use
```

## Error Handling

### If Claude Fails
```
1. Claude API returns error or timeout
2. Backend logs error
3. Backend automatically tries OpenAI
4. If OpenAI succeeds → Return response with engine: "openai"
5. If OpenAI fails → Return error with both attempts failed
```

### If Both APIs Fail
```json
{
  "success": false,
  "code": null,
  "engine": null,
  "error": "No se pudo procesar la imagen con Claude ni OpenAI",
  "status": 500
}
```

## Configuration

### Production Setup

1. **Generate config.php:**
```bash
cd minibackend
OPENAI_API_KEY="sk-proj-..." node setup-config.js
```

2. **Enable Claude (optional):**
Edit `config.php` and add Claude API key:
```php
'claude' => [
  'enabled' => true,
  'requires_key' => true,
  'api_key_encrypted' => '...'
]
```

3. **Verify Health Endpoint:**
```bash
curl https://backend.patchamama.com/MVP-LogistiQ/minibackend/public/api/health
# Should return encryption_key and ocr_engines with api_key_encrypted
```

## Performance

- **Frontend Decryption**: ~1-5ms (local, instant)
- **API Request**: ~1-2 seconds (network latency)
- **Claude Vision**: ~5-15 seconds (processing)
- **OpenAI Vision**: ~3-10 seconds (processing)
- **Total Time**: ~10-30 seconds for complete flow

## Troubleshooting

### "No se pudo extraer el código de la imagen"
1. Check that API keys are valid and have remaining quota
2. Verify encryption_key matches between backend and browser
3. Check that image is clear and contains identifiable code
4. Review server logs for detailed error messages

### "Failed to decrypt API key: Malformed UTF-8 data"
1. Verify encryption_key in health response is correct
2. Verify api_key_encrypted hasn't been corrupted
3. Check that config.php was generated correctly

### "Claude/OpenAI API key invalid"
1. Regenerate config.php with correct API keys
2. Verify keys have valid format and permissions
3. Check API quotas and rate limits

## Testing

### Manual Test with cURL
```bash
# 1. Get health
curl https://backend.patchamama.com/MVP-LogistiQ/minibackend/public/api/health

# 2. Decrypt key locally (JavaScript)
# Use browser console with decryptAPIKey()

# 3. Test OCR endpoint
curl -X POST https://backend.patchamama.com/MVP-LogistiQ/minibackend/public/api/ocr/process \
  -H "Content-Type: application/json" \
  -d '{
    "image_base64": "...",
    "claude_api_key": "sk-ant-...",
    "openai_api_key": "sk-proj-..."
  }'
```

## Future Improvements

- [ ] Cache API keys in localStorage (with encryption)
- [ ] Implement request queuing for better performance
- [ ] Add support for other vision models (Google Gemini, etc)
- [ ] Implement image preprocessing (rotation, contrast, etc)
- [ ] Add OCR confidence scoring UI
- [ ] Implement cost tracking for API calls
- [ ] Add custom prompt configuration per engine
