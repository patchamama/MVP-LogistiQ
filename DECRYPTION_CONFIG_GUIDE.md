# Decryption Testing & Config.php Generation Guide

## Overview

The application uses AES-256-CBC encryption to securely store API keys. This guide explains how to:
1. Test that decryption works correctly in the browser
2. Generate a correct `config.php` file for your production server
3. Debug decryption issues

## Quick Start

### Step 1: Obtain Production Data

From your backend server, get the health endpoint response:

```bash
curl https://your-backend.com/api/health
```

You need these values:
- `encryption_key` - A 64-character hexadecimal string
- `ocr_engines[].api_key_encrypted` - A base64-encoded encrypted API key

### Step 2: Test Decryption in Browser

1. Open `test-decrypt-production.html` in your browser
2. Fill in the fields:
   - **Encryption Key**: Paste the `encryption_key` from Step 1
   - **Encrypted OpenAI Key**: Paste the `api_key_encrypted` from Step 1
   - **Expected API Key** (optional): Your OpenAI API key for verification
3. Click "Probar Desencriptación" button

### Step 3: Verify Results

The page will show:
- ✅ **Success**: If decryption works, your `config.php` is generated
- ❌ **Error**: If decryption fails, see the troubleshooting section

### Step 4: Deploy config.php

If decryption succeeds:
1. Copy the generated `config.php` from the page
2. Paste it into `minibackend/config.php` on your server
3. Set permissions: `chmod 600 config.php`
4. Restart PHP-FPM or the web server

## Using setup-config.js to Generate config.php

If you want to generate `config.php` using the Node.js script:

### Prerequisites

```bash
cd minibackend
npm install crypto-js
```

### Generate with New Keys

```bash
export OPENAI_API_KEY="sk-proj-your-actual-key-here"
node setup-config.js
```

This creates `minibackend/config.php` with:
- A new random encryption key
- Your OpenAI API key encrypted

### Generate with Existing Encryption Key

If you already have an encryption key from production:

```bash
export ENCRYPTION_KEY="b324431e082e95a3fc38b4bc00d4f002dc600d18aa4773f54abd16b760b1225e"
export OPENAI_API_KEY="sk-proj-your-actual-key-here"
node setup-config.js
```

This ensures the new `config.php` uses the same encryption key as your production server.

## Understanding Encryption Format

### How Encryption Works

1. **Plaintext**: Your OpenAI API key (e.g., `sk-proj-...`)
2. **IV Generation**: SHA256 hash of the plaintext (first 32 chars = 16 bytes)
3. **Encryption**: AES-256-CBC with the encryption key and IV
4. **Encoding**:
   ```
   base64(IV_hex + "::" + ciphertext_base64)
   ```

### Example Flow

```
Plaintext:        sk-proj-FCHWdqAFEGsze0sx4VN6FzX8GH-hegUVbEmU7Pi8EEQPaRd7...
↓
SHA256:           b324431e082e95a3fc38b4bc00d4f002dc600d18aa4773f54abd16f...
↓
IV (hex):         b324431e082e95a3fc38b4bc00d4f002 (16 bytes)
↓
Encrypted (base64): JzM7K8pQ9xZ2L4mN1oP5tR8vW3sQ6yU9...
↓
Combined:         b324431e082e95a3fc38b4bc00d4f002::JzM7K8pQ9xZ2L4mN1oP5tR8vW3sQ6yU9...
↓
Final (base64):   YjMyNDQzMWUwODJlOTVhM2ZjMzhiNGJjMDA...
```

## Troubleshooting

### Error: "Malformed UTF-8 data"

This means the decryption ran but produced invalid UTF-8 characters. Causes:

1. **Wrong encryption key**
   - Verify the `encryption_key` from `/api/health` is exactly correct
   - Check for whitespace or extra characters

2. **Corrupted encrypted data**
   - Verify the `api_key_encrypted` hasn't been modified
   - Check that it's valid base64 (use `echo 'DATA' | base64 -d` to test)

3. **Mismatched encryption**
   - The encrypted data might be from a different encryption key
   - Check that both frontend and backend use the same CryptoJS encryption method

### Error: "Invalid base64 format"

The encrypted data is not valid base64. Check:
- No extra spaces or newlines
- No special characters that aren't part of base64 alphabet
- The data wasn't truncated during copy/paste

### Error: "Invalid cipher format - expected IV::encrypted"

The encrypted data doesn't have the expected format. This usually means:
- The data was encrypted with a different method
- The data is from an old version of the encryption system
- The data is incomplete or corrupted

### Decryption succeeds but key doesn't match

This means:
- The `encryption_key` is correct
- The `api_key_encrypted` is valid
- But it decrypts to a different API key than expected

This usually indicates:
- You're using the wrong OpenAI API key for verification
- The encrypted data is from a different key

## Verifying Everything Works

After deploying `config.php`:

1. Check that the health endpoint returns the encryption key:
```bash
curl https://your-backend.com/api/health | jq '.encryption_key'
```

2. Test OCR in the frontend:
   - Upload an image in the warehouse entry form
   - The image should be processed by Claude or OpenAI
   - A reference code should be extracted

3. Check browser console for logs:
   - Look for "Code extracted with Claude" or "Code extracted with OpenAI"
   - No "Decryption error" messages should appear

## File Locations

- **test-decrypt-production.html** - Browser-based test (run locally or upload to server)
- **minibackend/setup-config.js** - Node.js script to generate config.php
- **minibackend/config.php** - Generated configuration file (NOT in git, for server only)
- **minibackend/public/handlers/health.php** - Returns encryption_key and api_key_encrypted

## Security Notes

⚠️ **Important**:
- Never commit `config.php` to version control
- Never share encryption keys via email or chat
- Use HTTPS only for all API communications
- Set `config.php` permissions to `600` (read/write for owner only)
- The encryption key is sensitive - treat it like a password

## How Frontend Decryption Works

When the WarehouseEntry component loads:

1. Calls `/api/health` to get:
   - `encryption_key` (hex string)
   - `ocr_engines[].api_key_encrypted` (base64 string)

2. On image upload:
   - Calls `processImageWithOCR()` with encrypted keys
   - Function decrypts keys locally using CryptoJS
   - Decrypted keys are used to call Claude/OpenAI APIs
   - Encrypted keys are never sent to any external API

3. Result:
   - ✅ API keys are only decrypted when needed
   - ✅ Decrypted keys are not stored
   - ✅ Communication with Claude/OpenAI is direct from frontend

## Advanced: Regenerating Everything

If you need to change your API keys or encryption key:

```bash
# 1. Update your environment variables
export OPENAI_API_KEY="sk-proj-your-new-key"
export ENCRYPTION_KEY="your-new-encryption-key-hex"

# 2. Regenerate config.php locally
cd minibackend
npm install
node setup-config.js

# 3. Test locally with test-decrypt-production.html
# Get the new encryption_key and api_key_encrypted from config.php
# Test in browser to verify decryption works

# 4. Copy config.php to server
scp config.php user@server.com:/path/to/minibackend/config.php
ssh user@server.com "chmod 600 /path/to/minibackend/config.php"

# 5. Verify with curl
curl https://your-backend.com/api/health

# 6. Test in production frontend
# Upload an image to verify OCR works with new keys
```

## Need Help?

If you encounter issues:

1. Check the browser console (F12) for error messages
2. Use test-decrypt-production.html to verify decryption
3. Review the error messages - they indicate the specific problem
4. Ensure all values (encryption_key, api_key_encrypted) are exactly correct
5. Check MINIBACKEND_SETUP.md for general backend configuration

