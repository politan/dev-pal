import { beforeAll, vi } from 'vitest'

// Create crypto mock function
const createCryptoMock = () => ({
  getRandomValues: vi.fn((array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
    return array
  }),
  randomUUID: vi.fn(() => {
    // Generate a mock UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }),
  hash: vi.fn(() => 'mock-hash'),
  subtle: {} as SubtleCrypto
})

// Mock crypto API for testing environment - apply immediately to all possible locations
const cryptoMock = createCryptoMock()

// Use Object.defineProperty to properly override read-only crypto properties

// Apply to global scope
if (typeof global !== 'undefined') {
  Object.defineProperty(global, 'crypto', {
    value: cryptoMock,
    writable: true,
    configurable: true
  })
}

// Apply to globalThis
if (typeof globalThis !== 'undefined') {
  Object.defineProperty(globalThis, 'crypto', {
    value: cryptoMock,
    writable: true,
    configurable: true
  })
}

beforeAll(() => {
  // Additional setup that needs to run before each test file

  // Mock clipboard API
  Object.defineProperty(navigator, 'clipboard', {
    writable: true,
    value: {
      writeText: vi.fn(() => Promise.resolve()),
      readText: vi.fn(() => Promise.resolve(''))
    }
  })

  // Mock URL.createObjectURL and revokeObjectURL
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  global.URL.revokeObjectURL = vi.fn()

  // Mock HTMLAnchorElement click for file downloads
  HTMLAnchorElement.prototype.click = vi.fn()
})