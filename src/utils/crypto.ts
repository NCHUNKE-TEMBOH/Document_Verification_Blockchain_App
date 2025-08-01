import CryptoJS from 'crypto-js'

/**
 * Hash a file using SHA-256
 * @param file - The file to hash
 * @returns Promise<string> - The SHA-256 hash of the file
 */
export async function hashFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer)
        const hash = CryptoJS.SHA256(wordArray).toString()
        resolve(hash)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Hash a string using SHA-256
 * @param text - The text to hash
 * @returns string - The SHA-256 hash of the text
 */
export function hashString(text: string): string {
  return CryptoJS.SHA256(text).toString()
}

/**
 * Generate a random hash for demo purposes
 * @returns string - A random SHA-256 hash
 */
export function generateRandomHash(): string {
  const randomString = Math.random().toString(36) + Date.now().toString(36)
  return CryptoJS.SHA256(randomString).toString()
}

/**
 * Verify if a hash matches the expected format
 * @param hash - The hash to verify
 * @returns boolean - True if the hash is valid SHA-256 format
 */
export function isValidHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash)
}

/**
 * Create a document fingerprint combining multiple attributes
 * @param attributes - Object containing document attributes
 * @returns string - The combined hash of all attributes
 */
export function createDocumentFingerprint(attributes: Record<string, any>): string {
  const sortedKeys = Object.keys(attributes).sort()
  const concatenated = sortedKeys.map(key => `${key}:${attributes[key]}`).join('|')
  return hashString(concatenated)
}
