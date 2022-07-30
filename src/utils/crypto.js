import CryptoJS from "crypto-js";

const KEY_CHARS = [
  "b",
  "2",
  "6",
  "2",
  "6",
  "7",
  "3",
  "b",
  "4",
  "d",
  "7",
  "b",
  "0",
  "e",
  "4",
  "a",
  "4",
  "b",
  "b",
  "3",
  "9",
  "3",
  "8",
  "4",
  "6",
  "7",
  "7",
  "6",
  "4",
  "5",
  "2",
  "5",
  "d",
  "f",
  "b",
  "3",
  "d",
  "8",
  "6",
  "f",
  "9",
  "9",
  "0",
  "0",
  "7",
  "2",
  "5",
  "0",
  "7",
  "a",
  "a",
  "d",
  "d",
  "3",
  "2",
  "b",
  "3",
  "b",
  "5",
  "f",
  "7",
  "5",
  "f",
  "4",
];

const IV_CHARS = [
  "9",
  "e",
  "3",
  "5",
  "2",
  "0",
  "a",
  "a",
  "a",
  "8",
  "b",
  "f",
  "5",
  "b",
  "b",
  "c",
  "e",
  "2",
  "8",
  "7",
  "9",
  "d",
  "f",
  "1",
  "0",
  "8",
  "9",
  "7",
  "7",
  "9",
  "6",
  "f",
];

const KEY_HEX = KEY_CHARS.join("");
const IV_HEX = IV_CHARS.join("");

const key = CryptoJS.enc.Hex.parse(KEY_HEX);
const iv = CryptoJS.enc.Hex.parse(IV_HEX);

export function convertWordArrayToBuffer(wordArray) {
  const l = wordArray.sigBytes;
  const words = wordArray.words;
  const result = new Uint8Array(l);
  let i = 0; /*dst*/
  let j = 0; /*src*/
  while (true) {
    // here i is a multiple of 4
    if (i == l) break;
    let w = words[j++];
    result[i++] = (w & 0xff000000) >>> 24;
    if (i == l) break;
    result[i++] = (w & 0x00ff0000) >>> 16;
    if (i == l) break;
    result[i++] = (w & 0x0000ff00) >>> 8;
    if (i == l) break;
    result[i++] = w & 0x000000ff;
  }
  return result;
}

export function decryptBuffer(buffer) {
  const inputWordArray = CryptoJS.lib.WordArray.create(buffer);
  const outputWordArray = CryptoJS.AES.decrypt(
    { ciphertext: inputWordArray },
    key,
    { iv }
  );
  const decryptedBuffer = convertWordArrayToBuffer(outputWordArray);
  return decryptedBuffer;
}

export function createBlobUrl(buffer) {
  const blob = new Blob([buffer]);
  const blobUrl = URL.createObjectURL(blob);
  return blobUrl;
}
