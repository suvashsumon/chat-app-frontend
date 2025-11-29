import { JSEncrypt } from 'jsencrypt';
import CryptoJS from 'crypto-js';

// Generate RSA key pair
export const generateKeyPair = () => {
  const crypt = new JSEncrypt({ default_key_size: 2048 });
  const publicKey = crypt.getPublicKey();
  const privateKey = crypt.getPrivateKey();
  return { publicKey, privateKey };
};

// Encrypt with RSA public key
export const encryptWithPublicKey = (publicKey, text) => {
  const crypt = new JSEncrypt();
  crypt.setPublicKey(publicKey);
  return crypt.encrypt(text);
};

// Decrypt with RSA private key
export const decryptWithPrivateKey = (privateKey, encryptedText) => {
  const crypt = new JSEncrypt();
  crypt.setPrivateKey(privateKey);
  return crypt.decrypt(encryptedText);
};

// Generate symmetric key based on algorithm
export const generateKey = async (algorithm) => {
  switch (algorithm) {
    case 'AES':
      return await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    case '3DES':
      return CryptoJS.lib.WordArray.random(24); // 3DES key size is 192 bits (24 bytes)
    case 'ChaCha20':
      return crypto.getRandomValues(new Uint8Array(32)); // ChaCha20 key size is 256 bits (32 bytes)
    default:
      throw new Error('Unsupported algorithm');
  }
};

// Export AES key
export const exportAesKey = async (key) => {
  const exported = await crypto.subtle.exportKey(
    "jwk",
    key
  );
  return JSON.stringify(exported);
};

// Import AES key
export const importAesKey = async (jwk) => {
  const imported = await crypto.subtle.importKey(
    "jwk",
    JSON.parse(jwk),
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
  return imported;
};

// Encrypt with AES key
export const encryptWithAes = async (key, text) => {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization Vector
  const encoded = new TextEncoder().encode(text);
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encoded
  );

  const iv_base64 = btoa(String.fromCharCode.apply(null, iv));
  const ciphertext_base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(ciphertext)));

  return `${iv_base64}:${ciphertext_base64}`;
};

// Decrypt with AES key
export const decryptWithAes = async (key, encryptedText) => {
  const parts = encryptedText.split(':');
  const iv = new Uint8Array(atob(parts[0]).split('').map(char => char.charCodeAt(0)));
  const ciphertext = new Uint8Array(atob(parts[1]).split('').map(char => char.charCodeAt(0)));

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
};

// Generate AES key (for symmetric encryption)
export const generateAesKey = async () => {
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
  return key;
};

// Encrypt data based on algorithm
export const encrypt = async (algorithm, key, data) => {
  switch (algorithm) {
    case 'AES': {
      const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM IV size is 96 bits
      const encoded = new TextEncoder().encode(data);
      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
      );
      return { ciphertext, iv };
    }
    case '3DES': {
      const ciphertext = CryptoJS.TripleDES.encrypt(data, key.toString());
      return { ciphertext: ciphertext.toString() };
    }
    case 'ChaCha20': {
      const nonce = crypto.getRandomValues(new Uint8Array(12)); // ChaCha20 nonce size is 96 bits
      // ChaCha20 encryption requires a library (not natively supported by Web Crypto API)
      throw new Error('ChaCha20 encryption not implemented');
    }
    default:
      throw new Error('Unsupported algorithm');
  }
};

// Decrypt data based on algorithm
export const decrypt = async (algorithm, key, encryptedData) => {
  switch (algorithm) {
    case 'AES': {
      const { ciphertext, iv } = encryptedData;
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );
      return new TextDecoder().decode(decrypted);
    }
    case '3DES': {
      const decrypted = CryptoJS.TripleDES.decrypt(
        encryptedData.ciphertext,
        key.toString()
      );
      return decrypted.toString(CryptoJS.enc.Utf8);
    }
    case 'ChaCha20': {
      throw new Error('ChaCha20 decryption not implemented');
    }
    default:
      throw new Error('Unsupported algorithm');
  }
};

// Enhanced logging for debugging decryption issues
export const decryptWithLogging = async (algorithm, key, encryptedData) => {
  try {
    console.log('Decrypting with algorithm:', algorithm);
    console.log('Encrypted data:', encryptedData);

    if (algorithm === 'AES') {
      const { ciphertext, iv } = encryptedData;
      console.log('IV:', iv);
      console.log('Ciphertext:', ciphertext);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );
      const result = new TextDecoder().decode(decrypted);
      console.log('Decryption successful. Result:', result);
      return result;
    } else if (algorithm === '3DES') {
      console.log('Decrypting with 3DES. Ciphertext:', encryptedData.ciphertext);
      const decrypted = CryptoJS.TripleDES.decrypt(
        encryptedData.ciphertext,
        key.toString()
      );
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      console.log('Decryption successful. Result:', result);
      return result;
    } else {
      throw new Error('Unsupported algorithm');
    }
  } catch (error) {
    console.error('Decryption failed:', error);
    throw error;
  }
};

// Configuration for encryption algorithm
export const encryptionConfig = {
  algorithm: '3DES', // Default algorithm
};

// Function to set the encryption algorithm dynamically
export const setEncryptionAlgorithm = (algorithm) => {
  if (!['AES', '3DES', 'ChaCha20'].includes(algorithm)) {
    throw new Error('Unsupported algorithm');
  }
  encryptionConfig.algorithm = algorithm;
};
