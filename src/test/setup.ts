import { beforeAll, vi } from 'vitest'

// Mock crypto API for testing environment
beforeAll(() => {
  // Mock crypto.getRandomValues
  if (!global.crypto) {
    global.crypto = {
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
      subtle: {} as SubtleCrypto
    } as Crypto
  }

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