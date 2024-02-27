import CryptoJS from 'crypto-js';
export const decryptData = (data) => {
  return CryptoJS.AES.decrypt(data, import.meta.env.VITE_AES_KEY).toString(CryptoJS.enc.Utf8);
}