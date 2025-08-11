import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import UUIDGenerator from './UUIDGenerator.vue'
import type { GeneratedUUID, UUIDFormat } from '../../utils/uuid'

// Define the exposed component interface
interface UUIDGeneratorExposed {
  generatedUUIDs: GeneratedUUID[]
  currentUUID: GeneratedUUID | null
  existingUUIDs: Set<string>
  collisionCount: number
  bulkCount: number
  showToast: boolean
  toastMessage: string
  formatDisplayName: (format: UUIDFormat) => string
  formatTime: (date: Date) => string
  exportUUIDs: (format: 'json' | 'csv') => void
  generateSingleUUID: () => void
  generateBulkUUIDs: () => void
  clearAll: () => void
}

// Mock lucide-vue-next icons
vi.mock('lucide-vue-next', () => ({
  Plus: { name: 'Plus', render: () => 'Plus' },
  Copy: { name: 'Copy', render: () => 'Copy' },
  Download: { name: 'Download', render: () => 'Download' },
  Database: { name: 'Database', render: () => 'Database' },
  Trash2: { name: 'Trash2', render: () => 'Trash2' },
  Hash: { name: 'Hash', render: () => 'Hash' }
}))

// Mock @vueuse/core
vi.mock('@vueuse/core', () => ({
  useClipboard: () => ({
    copy: vi.fn(() => Promise.resolve()),
    isSupported: { value: true }
  })
}))

describe('UUIDGenerator Component', () => {
  let wrapper: VueWrapper<UUIDGeneratorExposed>

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(UUIDGenerator) as VueWrapper<UUIDGeneratorExposed>
  })

  describe('Initial State', () => {
    it('should render successfully', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('should have form controls', () => {
      // Check for select elements (version and format)
      const selects = wrapper.findAll('select')
      expect(selects.length).toBeGreaterThanOrEqual(2)
      
      // Check for checkbox (include dashes)
      const checkbox = wrapper.find('input[type="checkbox"]')
      expect(checkbox.exists()).toBe(true)
      
      // Check for number input (bulk count)
      const numberInput = wrapper.find('input[type="number"]')
      expect(numberInput.exists()).toBe(true)
    })

    it('should have generation buttons', () => {
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should generate initial UUID on mount', async () => {
      await nextTick()
      expect(wrapper.vm.generatedUUIDs.length).toBeGreaterThan(0)
      expect(wrapper.vm.currentUUID).toBeTruthy()
    })
  })

  describe('UUID Generation', () => {
    it('should generate new UUID when generate button is clicked', async () => {
      const initialCount = wrapper.vm.generatedUUIDs.length
      
      // Find the first button (should be generate button)
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      await nextTick()

      expect(wrapper.vm.generatedUUIDs.length).toBeGreaterThan(initialCount)
    })

    it('should update current UUID after generation', async () => {
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      await nextTick()

      expect(wrapper.vm.currentUUID).toBeTruthy()
    })

    it('should use selected version', async () => {
      // Change version select to v1
      const versionSelect = wrapper.findAll('select')[0]
      await versionSelect.setValue('v1')
      
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      await nextTick()

      expect(wrapper.vm.currentUUID?.version).toBe('v1')
    })

    it('should use selected format', async () => {
      // Change format select to uppercase
      const formatSelect = wrapper.findAll('select')[1]
      await formatSelect.setValue('uppercase')
      
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      await nextTick()

      expect(wrapper.vm.currentUUID?.format).toBe('uppercase')
    })

    it('should respect dash preference', async () => {
      // Uncheck include dashes
      const dashCheckbox = wrapper.find('input[type="checkbox"]')
      await dashCheckbox.setValue(false)
      
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      await nextTick()

      expect(wrapper.vm.currentUUID?.includeDashes).toBe(false)
      expect(wrapper.vm.currentUUID?.formatted).not.toContain('-')
    })
  })

  describe('Bulk Generation', () => {
    it('should set bulk count from input', async () => {
      const bulkInput = wrapper.find('input[type="number"]')
      await bulkInput.setValue(25)
      
      expect(wrapper.vm.bulkCount).toBe(25)
    })

    it('should generate multiple UUIDs in bulk', async () => {
      const initialCount = wrapper.vm.generatedUUIDs.length
      
      // Set bulk count to 3
      const bulkInput = wrapper.find('input[type="number"]')
      await bulkInput.setValue(3)
      
      // Trigger bulk generation (find button next to number input)
      const bulkButton = wrapper.find('input[type="number"]').element.nextElementSibling as HTMLButtonElement
      expect(bulkButton).toBeDefined()
      expect(bulkButton.tagName).toBe('BUTTON')
      
      // Use wrapper.find to get the VueWrapper for the button
      const bulkButtonWrapper = wrapper.findAll('button').find(btn => 
        btn.element === bulkButton
      )
      
      expect(bulkButtonWrapper).toBeDefined()
      await bulkButtonWrapper!.trigger('click')
      await nextTick()

      expect(wrapper.vm.generatedUUIDs.length).toBe(initialCount + 3)
    })
  })

  describe('Clear Functionality', () => {
    it('should clear all UUIDs when clear button is clicked', async () => {
      // Generate a few UUIDs first
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      await generateButton.trigger('click')
      await nextTick()

      const initialCount = wrapper.vm.generatedUUIDs.length
      expect(initialCount).toBeGreaterThan(1)

      // Find clear button (look for Trash icon or "Clear" text)
      const buttons = wrapper.findAll('button')
      const clearButton = buttons.find(btn => 
        btn.text().includes('Clear') || 
        btn.text().includes('Trash') ||
        btn.html().includes('Trash')
      )
      
      expect(clearButton).toBeDefined()
      expect(clearButton!.exists()).toBe(true)
      expect(clearButton!.attributes('disabled')).toBeFalsy()
      
      await clearButton!.trigger('click')
      await nextTick()

      expect(wrapper.vm.generatedUUIDs).toHaveLength(0)
      expect(wrapper.vm.currentUUID).toBe(null)
      expect(wrapper.vm.collisionCount).toBe(0)
    })
  })

  describe('Statistics Display', () => {
    it('should show correct UUID count', async () => {
      await nextTick()
      const count = wrapper.vm.generatedUUIDs.length
      const statsText = wrapper.text()
      expect(statsText).toContain(`${count} UUIDs generated`)
    })

    it('should track collision count', () => {
      expect(wrapper.vm.collisionCount).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Toast Notifications', () => {
    it('should show toast message after generation', async () => {
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      await nextTick()

      expect(wrapper.vm.showToast).toBe(true)
      expect(wrapper.vm.toastMessage).toBeTruthy()
    })

    it('should show success message', async () => {
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      await nextTick()

      expect(wrapper.vm.toastMessage).toContain('successfully')
    })
  })

  describe('Utility Functions', () => {
    it('should format display names correctly', () => {
      expect(wrapper.vm.formatDisplayName('uppercase')).toBe('Uppercase')
      expect(wrapper.vm.formatDisplayName('lowercase')).toBe('Lowercase')
      expect(wrapper.vm.formatDisplayName('mixedcase')).toBe('Mixed Case')
    })

    it('should format time correctly', () => {
      const date = new Date('2024-01-01T12:00:00Z')
      const formatted = wrapper.vm.formatTime(date)
      expect(typeof formatted).toBe('string')
      expect(formatted.length).toBeGreaterThan(0)
    })
  })

  describe('Data Management', () => {
    it('should store generated UUIDs with proper structure', async () => {
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      await nextTick()

      const uuid = wrapper.vm.generatedUUIDs[0]
      expect(uuid).toHaveProperty('id')
      expect(uuid).toHaveProperty('original')
      expect(uuid).toHaveProperty('formatted')
      expect(uuid).toHaveProperty('timestamp')
      expect(uuid).toHaveProperty('version')
      expect(uuid).toHaveProperty('format')
      expect(uuid).toHaveProperty('includeDashes')
    })

    it('should maintain existing UUIDs set', async () => {
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      await generateButton.trigger('click')
      await nextTick()

      expect(wrapper.vm.existingUUIDs.size).toBe(wrapper.vm.generatedUUIDs.length)
    })
  })

  describe('Export Functionality', () => {
    it('should have export methods', () => {
      expect(typeof wrapper.vm.exportUUIDs).toBe('function')
    })

    it('should call export function with correct parameters', async () => {
      // Generate some UUIDs first
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      await nextTick()

      // Test the export function directly
      expect(() => wrapper.vm.exportUUIDs('json')).not.toThrow()
      expect(() => wrapper.vm.exportUUIDs('csv')).not.toThrow()
    })
  })
})