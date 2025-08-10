import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  generateUUID, 
  isValidUUID, 
  getUUIDVersion,
  type UUIDOptions 
} from './uuid'

describe('UUID Utility Functions', () => {
  let existingUUIDs: Set<string>

  beforeEach(() => {
    existingUUIDs = new Set()
    vi.clearAllMocks()
  })

  describe('generateUUID', () => {
    it('should generate a valid UUID v4 by default', () => {
      const options: UUIDOptions = {
        format: 'lowercase',
        version: 'v4',
        includeDashes: true
      }

      const result = generateUUID(options, existingUUIDs)

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('original')
      expect(result).toHaveProperty('formatted')
      expect(result).toHaveProperty('timestamp')
      expect(result.version).toBe('v4')
      expect(result.format).toBe('lowercase')
      expect(result.includeDashes).toBe(true)
      expect(isValidUUID(result.original)).toBe(true)
    })

    it('should generate UUID v1', () => {
      const options: UUIDOptions = {
        format: 'lowercase',
        version: 'v1',
        includeDashes: true
      }

      const result = generateUUID(options, existingUUIDs)
      
      expect(result.version).toBe('v1')
      expect(getUUIDVersion(result.original)).toBe(1)
    })

    it('should generate UUID v7', () => {
      const options: UUIDOptions = {
        format: 'lowercase',
        version: 'v7',
        includeDashes: true
      }

      const result = generateUUID(options, existingUUIDs)
      
      expect(result.version).toBe('v7')
      expect(getUUIDVersion(result.original)).toBe(7)
    })

    it('should format UUID as uppercase', () => {
      const options: UUIDOptions = {
        format: 'uppercase',
        version: 'v4',
        includeDashes: true
      }

      const result = generateUUID(options, existingUUIDs)
      
      expect(result.formatted).toBe(result.formatted.toUpperCase())
      expect(result.formatted).toMatch(/^[A-F0-9-]+$/)
    })

    it('should format UUID as lowercase', () => {
      const options: UUIDOptions = {
        format: 'lowercase',
        version: 'v4',
        includeDashes: true
      }

      const result = generateUUID(options, existingUUIDs)
      
      expect(result.formatted).toBe(result.formatted.toLowerCase())
      expect(result.formatted).toMatch(/^[a-f0-9-]+$/)
    })

    it('should remove dashes when includeDashes is false', () => {
      const options: UUIDOptions = {
        format: 'lowercase',
        version: 'v4',
        includeDashes: false
      }

      const result = generateUUID(options, existingUUIDs)
      
      expect(result.formatted).not.toContain('-')
      expect(result.formatted).toHaveLength(32)
      expect(result.formatted).toMatch(/^[a-f0-9]+$/)
    })

    it('should include dashes when includeDashes is true', () => {
      const options: UUIDOptions = {
        format: 'lowercase',
        version: 'v4',
        includeDashes: true
      }

      const result = generateUUID(options, existingUUIDs)
      
      expect(result.formatted).toContain('-')
      expect(result.formatted).toHaveLength(36)
      expect(result.formatted).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)
    })

    it('should avoid collisions by rerolling', () => {
      const options: UUIDOptions = {
        format: 'lowercase',
        version: 'v4',
        includeDashes: true
      }

      // Add a UUID to existing set
      const firstUUID = generateUUID(options, existingUUIDs)
      existingUUIDs.add(firstUUID.original)

      // Generate second UUID - should be different
      const secondUUID = generateUUID(options, existingUUIDs)
      
      expect(secondUUID.original).not.toBe(firstUUID.original)
      expect(existingUUIDs.has(firstUUID.original)).toBe(true)
    })

    it('should have proper timestamp', () => {
      const before = new Date()
      const options: UUIDOptions = {
        format: 'lowercase',
        version: 'v4',
        includeDashes: true
      }

      const result = generateUUID(options, existingUUIDs)
      const after = new Date()

      expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should generate unique IDs for tracking', () => {
      const options: UUIDOptions = {
        format: 'lowercase',
        version: 'v4',
        includeDashes: true
      }

      const result1 = generateUUID(options, existingUUIDs)
      const result2 = generateUUID(options, existingUUIDs)

      expect(result1.id).not.toBe(result2.id)
      expect(result1.id).toMatch(/^uuid_\d+_[a-z0-9]+$/)
    })
  })

  describe('isValidUUID', () => {
    it('should validate correct UUID with dashes', () => {
      const validUUIDs = [
        '123e4567-e89b-12d3-a456-426614174000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
      ]

      validUUIDs.forEach(uuid => {
        expect(isValidUUID(uuid)).toBe(true)
      })
    })

    it('should validate correct UUID without dashes', () => {
      const validUUIDs = [
        '123e4567e89b12d3a456426614174000',
        'f47ac10b58cc4372a5670e02b2c3d479'
      ]

      validUUIDs.forEach(uuid => {
        expect(isValidUUID(uuid)).toBe(true)
      })
    })

    it('should reject invalid UUIDs', () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '123e4567-e89b-12d3-a456',
        '',
        '123e4567-e89b-g2d3-a456-426614174000'
      ]

      invalidUUIDs.forEach(uuid => {
        expect(isValidUUID(uuid)).toBe(false)
      })
    })
  })

  describe('getUUIDVersion', () => {
    it('should detect UUID versions correctly', () => {
      expect(getUUIDVersion('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(1)
      expect(getUUIDVersion('123e4567-e89b-42d3-a456-426614174000')).toBe(4)
      expect(getUUIDVersion('123e4567-e89b-72d3-a456-426614174000')).toBe(7)
    })

    it('should work with UUIDs without dashes', () => {
      expect(getUUIDVersion('123e4567e89b42d3a456426614174000')).toBe(4)
    })

    it('should return null for invalid UUIDs', () => {
      expect(getUUIDVersion('not-a-uuid')).toBe(null)
      expect(getUUIDVersion('')).toBe(null)
      expect(getUUIDVersion('123e4567-e89b-82d3-a456-426614174000')).toBe(null) // invalid version
    })
  })
})