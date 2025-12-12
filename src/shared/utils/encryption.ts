import CryptoJS from "crypto-js";

const BLOCK_SIZE = 32;
const key = CryptoJS.enc.Utf8.parse("12345678901234567890123456789012"); // 32 bytes = 256-bit

function pad(text: string): string {
  const padLength = BLOCK_SIZE - (text.length % BLOCK_SIZE);
  return text + String.fromCharCode(padLength).repeat(padLength);
}

function unpad(text: string): string {
  const padLength = text.charCodeAt(text.length - 1);
  return text.slice(0, -padLength);
}

export function encryptPayload(data: object): string {
  const raw = pad(JSON.stringify(data));
  const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(raw), key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  });
  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
}

export function decryptPayload(encryptedBase64: string): object {
  const encrypted = CryptoJS.enc.Base64.parse(encryptedBase64);
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: encrypted } as CryptoJS.lib.CipherParams,
    key,
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding,
    },
  );
  const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
  return JSON.parse(unpad(decryptedText));
}
