#!/usr/bin/env node

/**
 * setup-config.js - Genera config.php usando CryptoJS
 *
 * Este script genera el archivo config.php encriptando las API keys
 * con la MISMA librería CryptoJS que usa el frontend.
 *
 * Uso: npm install crypto-js && node setup-config.js
 */

const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

console.log('===========================================');
console.log('  MiniBACKEND - Setup de Configuración');
console.log('  (Usando CryptoJS para compatibilidad)');
console.log('===========================================\n');

// Función para generar clave de encriptación aleatoria
function generateKey(length = 32) {
  return CryptoJS.lib.WordArray.random(length).toString();
}

// Función para encriptar con IV determinístico (basado en plaintext)
function encrypt(plaintext, keyHex) {
  const key = CryptoJS.enc.Hex.parse(keyHex);

  // IV determinístico basado en SHA256 del plaintext
  const ivHex = CryptoJS.enc.Hex.stringify(
    CryptoJS.SHA256(plaintext)
  ).substring(0, 32); // 16 bytes = 32 chars hex
  const iv = CryptoJS.enc.Hex.parse(ivHex);

  // Encriptar con CryptoJS
  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // Formato: base64(IV_hex::ciphertext_base64)
  const combined = ivHex + '::' + encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  return btoa(combined);
}

// 1. Generar clave de encriptación
console.log('[1/3] Generando clave de encriptación...');
const encryptionKey = generateKey(32);
console.log('✓ Clave generada: ' + encryptionKey + '\n');

// 2. Encriptar API key de OpenAI
// Leer desde variable de entorno OPENAI_API_KEY
// Si no está configurada, usar string vacío (se debe configurar en config.php)
const openaiKey = process.env.OPENAI_API_KEY || '';

console.log('[2/3] Encriptando API key de OpenAI...');
const encryptedOpenAI = encrypt(openaiKey, encryptionKey);
console.log('✓ API Key encriptada correctamente\n');

// 3. Crear config.php
console.log('[3/3] Creando config.php...');

const config = {
  encryption: {
    enabled: true,
    key: encryptionKey,
  },
  ocr: {
    engines: {
      tesseract: {
        enabled: true,
        requires_key: false,
      },
      easyocr: {
        enabled: true,
        requires_key: false,
      },
      openai: {
        enabled: true,
        requires_key: true,
        api_key_encrypted: encryptedOpenAI,
      },
      claude: {
        enabled: false,
        requires_key: true,
        api_key_encrypted: '',
      },
    },
  },
  app: {
    version: '0.8.0',
    name: 'LogistiQ MiniBACKEND',
  },
};

// Convertir a formato PHP
const phpCode = `<?php
/**
 * config.php - Archivo de configuración generado automáticamente
 * Fecha: ${new Date().toISOString()}
 * IMPORTANTE: Este archivo NO debe commitearse - está en .gitignore
 */
return ${phpExportVar(config)};
`;

const configPath = path.join(__dirname, 'config.php');
fs.writeFileSync(configPath, phpCode);

console.log('✓ Archivo config.php creado\n');

console.log('===========================================');
console.log('  ✓ Configuración completada exitosamente');
console.log('===========================================\n');

console.log('Resumen:');
console.log('  - Clave de encriptación: ' + encryptionKey);
console.log('  - OpenAI API Key: Encriptada ✓');
console.log('  - Archivo: minibackend/config.php');
console.log('  - Versión: 0.8.0\n');

console.log('⚠️  IMPORTANTE:');
console.log('  - Agregar config.php a .gitignore');
console.log('  - No compartir la clave de encriptación');
console.log('  - Verificar permisos: chmod 600 config.php\n');

// Función para exportar variables en formato PHP
function phpExportVar(obj, indent = 0) {
  const spaces = ' '.repeat(indent);
  const nextSpaces = ' '.repeat(indent + 2);

  if (obj === null) {
    return 'null';
  }
  if (typeof obj === 'string') {
    return "'" + obj.replace(/'/g, "\\'") + "'";
  }
  if (typeof obj === 'boolean') {
    return obj ? 'true' : 'false';
  }
  if (typeof obj === 'number') {
    return String(obj);
  }
  if (Array.isArray(obj)) {
    const items = obj.map(item => nextSpaces + phpExportVar(item, indent + 2));
    return '[\n' + items.join(',\n') + '\n' + spaces + ']';
  }
  if (typeof obj === 'object') {
    const items = Object.entries(obj).map(([key, value]) => {
      return nextSpaces + "'" + key + "' => " + phpExportVar(value, indent + 2);
    });
    return '[\n' + items.join(',\n') + '\n' + spaces + ']';
  }
  return String(obj);
}
