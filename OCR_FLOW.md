# OCR Processing Flow - Frontend-First Architecture

## Overview

The application now has a complete OCR pipeline that:
1. Retrieves encrypted API keys from the backend health endpoint
2. Decrypts them in the browser (JavaScript/CryptoJS)
3. **Calls Claude Vision API directly from the frontend**
4. Falls back to OpenAI Vision if Claude fails
5. Extracts reference codes automatically
6. **Backend has minimal involvement** (only provides encrypted keys)

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                         │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  WarehouseEntry Component                                     │
│  ├─ Calls checkHealth()                                       │
│  │  └─ Receives: encryption_key + ocr_engines[].api_key_enc  │
│  │                                                             │
│  └─ On image capture/upload:                                  │
│     ├─ Converts image to base64                              │
│     ├─ Calls processImageWithOCR()                           │
│     │  ├─ Decrypts API keys locally (CryptoJS)              │
│     │  ├─ Calls Claude Vision API directly                  │
│     │  │  └─ https://api.anthropic.com/v1/messages          │
│     │  │  └─ If fails → Continue to fallback                │
│     │  │                                                      │
│     │  └─ Calls OpenAI Vision API (fallback)                │
│     │     └─ https://api.openai.com/v1/chat/completions    │
│     │                                                         │
│     └─ Fills referencia field with extracted code           │
│                                                                │
└──────────────────────────────────────────────────────────────┘
                        ↓↓↓ HTTPS
        ┌────────────────────────────────┐
        │   Claude Vision API (Primary)   │
        │  api.anthropic.com/v1/messages │
        └────────────────────────────────┘
                  OR (Fallback)
        ┌────────────────────────────────┐
        │   OpenAI Vision API            │
        │ api.openai.com/v1/chat/comp... │
        └────────────────────────────────┘
                        ↓↓↓ HTTPS
        ┌────────────────────────────────┐
        │    MiniBACKEND (PHP)           │
        │  backend.patchamama.com        │
        │                                │
        │  GET /api/health               │
        │  └─ Returns:                   │
        │     ├─ encryption_key: hex     │
        │     └─ ocr_engines[]:          │
        │        └─ api_key_encrypted    │
        └────────────────────────────────┘
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

// Store ENCRYPTED keys + encryption_key for later use
setEncryptionKey(health.encryption_key)
setEncryptedKeys({
  openai: health.ocr_engines[0].api_key_encrypted,
  claude: health.ocr_engines[1].api_key_encrypted
})
```

### 2. Image Capture / Upload
```javascript
// When user captures label with camera or uploads image
const imageBase64Clean = imageBase64.split(',')[1]  // Remove data URI prefix

const response = await processImageWithOCR(
  imageBase64Clean,
  encryptedKeys['claude'],      // Still encrypted!
  encryptedKeys['openai'],      // Still encrypted!
  encryptionKey                 // Needed to decrypt
)

// Sets referencia field with extracted code
setReferencia(response.code)
```

### 3. Frontend OCR Service (ocr.ts)

**Inside `processImageWithOCR()`:**

#### Step 1: Decrypt API Keys Locally
```javascript
// Decrypt using CryptoJS and the encryption key
claudeKey = decryptAPIKey(encryptedClaudeKey, encryptionKey, true)
openaiKey = decryptAPIKey(encryptedOpenAIKey, encryptionKey, true)
```

#### Step 2: Try Claude Vision API (Primary)
```bash
POST https://api.anthropic.com/v1/messages
x-api-key: ${claudeKey}  // Decrypted key
anthropic-version: 2023-06-01
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
          "text": "Analiza esta imagen y extrae cualquier código..."
        }
      ]
    }
  ]
}
```

**If Claude succeeds:**
```javascript
return {
  success: true,
  code: "ABC-123-XYZ",
  engine: "claude",
  rawResponse: "{...}",
  error: null
}
```

#### Step 3: Fallback to OpenAI Vision (if Claude fails)
```bash
POST https://api.openai.com/v1/chat/completions
Authorization: Bearer ${openaiKey}  // Decrypted key
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
          "text": "Analiza esta imagen y extrae cualquier código..."
        }
      ]
    }
  ]
}
```

**If OpenAI succeeds:**
```javascript
return {
  success: true,
  code: "ABC-123-XYZ",
  engine: "openai",
  rawResponse: "{...}",
  error: null
}
```

### 4. Frontend Updates
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

### If Claude Fails (Frontend)
```
1. Frontend calls Claude Vision API
2. API returns error or timeout
3. Frontend catches error and logs it
4. Frontend automatically tries OpenAI
5. If OpenAI succeeds → Return response with engine: "openai"
6. If OpenAI fails → Return error with both attempts failed
```

### If Both APIs Fail
```json
{
  "success": false,
  "code": null,
  "engine": null,
  "error": "No se pudo procesar la imagen con Claude ni OpenAI",
  "rawResponse": null
}
```

### Frontend Error Console Output
```
⚠️ Claude failed, trying OpenAI fallback: Claude API error: 401 - Invalid x-api-key
🔄 Falling back to OpenAI Vision...
✓ Code extracted with OpenAI: ABC-123-XYZ
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
