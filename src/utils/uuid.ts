export type UUIDFormat = 'uppercase' | 'lowercase' | 'mixedcase'
export type UUIDVersion = 'v4' | 'v1' | 'v7'

export interface UUIDOptions {
  format: UUIDFormat
  version: UUIDVersion
  includeDashes: boolean
}

export interface GeneratedUUID {
  id: string
  original: string
  formatted: string
  timestamp: Date
  version: UUIDVersion
  format: UUIDFormat
  includeDashes: boolean
}

// Generate crypto-secure random values
function getRandomValues(length: number): Uint8Array {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint8Array(length))
  }
  // Fallback for environments without crypto
  const array = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    array[i] = Math.floor(Math.random() * 256)
  }
  return array
}

// UUID v4 generation (random)
function generateUUIDv4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Manual v4 generation using crypto.getRandomValues when available
  const randomBytes = getRandomValues(16)
  
  // Set version (4) and variant bits
  randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40 // Version 4
  randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80 // Variant 10
  
  // Convert to hex string with dashes
  const hex = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`
}

// UUID v1 generation (timestamp + MAC-like)
function generateUUIDv1(): string {
  const timestamp = Date.now()
  const timestampHex = timestamp.toString(16).padStart(12, '0')
  
  // Generate random node (MAC-like) and clock sequence
  const node = Math.random().toString(16).substring(2, 14)
  const clockSeq = Math.random().toString(16).substring(2, 6)
  
  // Format as UUID v1
  const timeLow = timestampHex.substring(4, 12)
  const timeMid = timestampHex.substring(0, 4)
  const timeHigh = '1' + timestampHex.substring(0, 3) // version 1
  
  return `${timeLow}-${timeMid}-${timeHigh}-${clockSeq}-${node}`
}

// UUID v7 generation (timestamp + random)
function generateUUIDv7(): string {
  const timestamp = Date.now()
  const timestampHex = timestamp.toString(16).padStart(12, '0')
  
  // Generate random bytes for the rest
  const randomPart = Array.from({ length: 10 }, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('')
  
  // Format as UUID v7
  return `${timestampHex.substring(0, 8)}-${timestampHex.substring(8, 12)}-7${randomPart.substring(0, 3)}-${randomPart.substring(3, 7)}-${randomPart.substring(7, 19)}`
}

// Generate raw UUID based on version
function generateRawUUID(version: UUIDVersion): string {
  switch (version) {
    case 'v1':
      return generateUUIDv1()
    case 'v7':
      return generateUUIDv7()
    case 'v4':
    default:
      return generateUUIDv4()
  }
}

// Format UUID according to options
function formatUUID(uuid: string, options: UUIDOptions): string {
  let formatted = uuid
  
  // Remove dashes if not wanted
  if (!options.includeDashes) {
    formatted = formatted.replace(/-/g, '')
  }
  
  // Apply case formatting
  switch (options.format) {
    case 'uppercase':
      formatted = formatted.toUpperCase()
      break
    case 'lowercase':
      formatted = formatted.toLowerCase()
      break
    case 'mixedcase':
      // Keep original case but ensure some variety
      formatted = formatted.split('').map((char, index) => 
        index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
      ).join('')
      break
    default:
      formatted = formatted.toLowerCase()
  }
  
  return formatted
}

// Main UUID generation function
export function generateUUID(options: UUIDOptions, existingUUIDs: Set<string>): GeneratedUUID {
  let uuid: string
  let attempts = 0
  const maxAttempts = 100 // Prevent infinite loops
  
  do {
    uuid = generateRawUUID(options.version)
    attempts++
    
    if (attempts >= maxAttempts) {
      console.warn('Max UUID generation attempts reached, using potentially duplicate UUID')
      break
    }
  } while (existingUUIDs.has(uuid))
  
  const formatted = formatUUID(uuid, options)
  
  return {
    id: `uuid_${Date.now()}_${Math.random().toString(36).substring(2)}`,
    original: uuid,
    formatted,
    timestamp: new Date(),
    version: options.version,
    format: options.format,
    includeDashes: options.includeDashes
  }
}

// Validate UUID format
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const uuidNoDashesRegex = /^[0-9a-f]{32}$/i
  
  return uuidRegex.test(uuid) || uuidNoDashesRegex.test(uuid)
}

// Get UUID version from string
export function getUUIDVersion(uuid: string): number | null {
  const cleanUuid = uuid.replace(/-/g, '')
  if (cleanUuid.length !== 32) return null
  
  const versionChar = cleanUuid.charAt(12)
  const version = parseInt(versionChar, 10)
  
  return version >= 1 && version <= 7 ? version : null
}