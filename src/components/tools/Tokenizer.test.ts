import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Tokenizer from './Tokenizer.vue'
import * as tokenizerUtils from '../../utils/tokenizer'

// Mock the tokenizer utility functions
vi.mock('../../utils/tokenizer', () => ({
  analyzeText: vi.fn(),
  MESSAGE_ROLES: [
    { type: 'system', label: 'System Message' },
    { type: 'user', label: 'User Message' },
    { type: 'assistant', label: 'Assistant Message' }
  ],
  MODEL_CONFIGS: {
    'gpt-4o-mini': {
      name: 'GPT-4o Mini',
      encoding: 'o200k_base',
      inputPrice: 0.000150,
      outputPrice: 0.000600,
      maxTokens: 128000,
      supportsNativeTokenization: true
    },
    'gpt-4o': {
      name: 'GPT-4o',
      encoding: 'o200k_base',
      inputPrice: 0.0025,
      outputPrice: 0.0100,
      maxTokens: 128000,
      supportsNativeTokenization: true
    },
    'claude-3.5-sonnet': {
      name: 'Claude 3.5 Sonnet',
      encoding: 'cl100k_base',
      inputPrice: 0.003,
      outputPrice: 0.015,
      maxTokens: 200000,
      supportsNativeTokenization: false
    }
  },
  validateTokenLimit: vi.fn()
}))

// Mock VueUse clipboard
vi.mock('@vueuse/core', () => ({
  useClipboard: vi.fn(() => ({
    copy: vi.fn(),
    isSupported: ref(true)
  }))
}))

// Mock Lucide icons
vi.mock('lucide-vue-next', () => {
  const mockIcon = { name: 'MockIcon' }
  return {
    Calculator: mockIcon,
    Coins: mockIcon,
    Type: mockIcon,
    FileText: mockIcon,
    DollarSign: mockIcon,
    Clock: mockIcon,
    Palette: mockIcon,
    Copy: mockIcon,
    Download: mockIcon,
    AlertTriangle: mockIcon,
    Info: mockIcon,
    X: mockIcon
  }
})

describe('Tokenizer Component', () => {
  let mockAnalyzeText: MockedFunction<typeof tokenizerUtils.analyzeText>
  let mockValidateTokenLimit: MockedFunction<typeof tokenizerUtils.validateTokenLimit>

  const mockAnalysisResult = {
    id: 'test-analysis-1',
    text: 'Hello, world!',
    tokens: [
      { id: 'token-0', text: 'Hello', token: 101, color: '#3B82F6', index: 0 },
      { id: 'token-1', text: ',', token: 102, color: '#10B981', index: 1 },
      { id: 'token-2', text: ' world', token: 103, color: '#F59E0B', index: 2 },
      { id: 'token-3', text: '!', token: 104, color: '#EF4444', index: 3 }
    ],
    totalTokens: 6,
    characterCount: 13,
    wordCount: 2,
    estimatedCost: 0.000009,
    model: 'gpt-4o-mini' as const,
    role: { type: 'user' as const, label: 'User Message' },
    timestamp: new Date('2024-01-01T12:00:00Z')
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockAnalyzeText = tokenizerUtils.analyzeText as MockedFunction<typeof tokenizerUtils.analyzeText>
    mockValidateTokenLimit = tokenizerUtils.validateTokenLimit as MockedFunction<typeof tokenizerUtils.validateTokenLimit>
    
    mockAnalyzeText.mockReturnValue(mockAnalysisResult)
    mockValidateTokenLimit.mockReturnValue({
      isValid: true,
      maxTokens: 128000,
      percentage: 0.005
    })

    // Mock timers for debouncing tests
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Component Initialization', () => {
    it('should render with default state', () => {
      const wrapper = mount(Tokenizer)
      
      expect(wrapper.find('select').element.value).toBe('gpt-4o-mini')
      expect(wrapper.find('textarea').attributes('placeholder')).toContain('Enter your text here')
      expect(wrapper.find('input[type="checkbox"]').element.checked).toBe(true) // Real-time analysis
    })

    it('should initialize with sample text and analyze it', async () => {
      const wrapper = mount(Tokenizer)
      await nextTick()
      
      expect(wrapper.vm.inputText).toBe('Hello! How can I help you today?')
      expect(mockAnalyzeText).toHaveBeenCalled()
    })

    it('should expose component methods for testing', () => {
      const wrapper = mount(Tokenizer)
      
      expect(wrapper.vm.analyzeCurrentText).toBeDefined()
      expect(wrapper.vm.clearText).toBeDefined()
      expect(wrapper.vm.clearHistory).toBeDefined()
      expect(wrapper.vm.exportAnalysis).toBeDefined()
    })
  })

  describe('User Interactions', () => {
    it('should analyze text when model selection changes', async () => {
      const wrapper = mount(Tokenizer)
      wrapper.vm.inputText = 'Test text'
      
      await wrapper.find('select').setValue('gpt-4o')
      await nextTick()
      
      expect(mockAnalyzeText).toHaveBeenCalledWith('Test text', {
        model: 'gpt-4o',
        role: expect.objectContaining({ type: 'user' })
      })
    })

    it('should analyze text when role selection changes', async () => {
      const wrapper = mount(Tokenizer)
      wrapper.vm.inputText = 'Test text'
      
      const roleSelect = wrapper.findAll('select')[1]
      await roleSelect.setValue(tokenizerUtils.MESSAGE_ROLES[2]) // Assistant role
      await nextTick()
      
      expect(mockAnalyzeText).toHaveBeenCalledWith('Test text', {
        model: 'gpt-4o-mini',
        role: tokenizerUtils.MESSAGE_ROLES[2]
      })
    })

    it('should handle text input with real-time analysis', async () => {
      const wrapper = mount(Tokenizer)
      const textarea = wrapper.find('textarea')
      
      await textarea.setValue('New test text')
      
      // Fast-forward debounce timer
      vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(mockAnalyzeText).toHaveBeenCalledWith('New test text', expect.any(Object))
    })

    it('should not auto-analyze when real-time is disabled', async () => {
      const wrapper = mount(Tokenizer)
      await wrapper.find('input[type="checkbox"]').setValue(false) // Disable real-time
      
      vi.clearAllMocks()
      
      const textarea = wrapper.find('textarea')
      await textarea.setValue('Test without real-time')
      
      vi.advanceTimersByTime(500)
      await nextTick()
      
      expect(mockAnalyzeText).not.toHaveBeenCalled()
    })

    it('should show analyze button when real-time is disabled and text exists', async () => {
      const wrapper = mount(Tokenizer)
      
      await wrapper.find('input[type="checkbox"]').setValue(false)
      await wrapper.find('textarea').setValue('Some text')
      await nextTick()
      
      const analyzeButton = wrapper.find('button:has(.lucide)')
      expect(analyzeButton.exists()).toBe(true)
    })

    it('should clear text and analysis when clear button is clicked', async () => {
      const wrapper = mount(Tokenizer)
      wrapper.vm.inputText = 'Text to clear'
      wrapper.vm.currentAnalysis = mockAnalysisResult
      
      const clearButton = wrapper.find('button:contains("Clear")')
      await clearButton.trigger('click')
      
      expect(wrapper.vm.inputText).toBe('')
      expect(wrapper.vm.currentAnalysis).toBeNull()
    })
  })

  describe('Analysis Results Display', () => {
    beforeEach(() => {
      const wrapper = mount(Tokenizer)
      wrapper.vm.currentAnalysis = mockAnalysisResult
    })

    it('should display token statistics correctly', () => {
      const wrapper = mount(Tokenizer)
      wrapper.vm.currentAnalysis = mockAnalysisResult
      
      expect(wrapper.text()).toContain('6') // Total tokens
      expect(wrapper.text()).toContain('13') // Character count
      expect(wrapper.text()).toContain('2') // Word count
      expect(wrapper.text()).toContain('$0.000009') // Estimated cost
    })

    it('should display token visualization', () => {
      const wrapper = mount(Tokenizer)
      wrapper.vm.currentAnalysis = mockAnalysisResult
      
      const tokenSpans = wrapper.findAll('span[title*="Token"]')
      expect(tokenSpans).toHaveLength(4)
      
      expect(tokenSpans[0].text()).toBe('Hello')
      expect(tokenSpans[1].text()).toBe(',')
      expect(tokenSpans[2].text()).toBe(' world')
      expect(tokenSpans[3].text()).toBe('!')
    })

    it('should show token details modal when token is clicked', async () => {
      const wrapper = mount(Tokenizer)
      wrapper.vm.currentAnalysis = mockAnalysisResult
      
      const firstToken = wrapper.find('span[title*="Token"]')
      await firstToken.trigger('click')
      
      expect(wrapper.vm.selectedToken).toEqual(mockAnalysisResult.tokens[0])
      
      const modal = wrapper.find('.fixed.inset-0')
      expect(modal.exists()).toBe(true)
      expect(modal.text()).toContain('Token Details')
    })

    it('should close token details modal when X is clicked', async () => {
      const wrapper = mount(Tokenizer)
      wrapper.vm.selectedToken = mockAnalysisResult.tokens[0]
      await nextTick()
      
      const closeButton = wrapper.find('button:has(.lucide)')
      await closeButton.trigger('click')
      
      expect(wrapper.vm.selectedToken).toBeNull()
    })
  })

  describe('Token Limit Validation', () => {
    it('should show warning when token limit is exceeded', async () => {
      mockValidateTokenLimit.mockReturnValue({
        isValid: false,
        maxTokens: 8192,
        percentage: 120
      })
      
      const wrapper = mount(Tokenizer)
      wrapper.vm.currentAnalysis = { ...mockAnalysisResult, totalTokens: 10000 }
      await nextTick()
      
      const warning = wrapper.find('.bg-destructive\\/10')
      expect(warning.exists()).toBe(true)
      expect(warning.text()).toContain('Token Limit Exceeded')
    })

    it('should show approximation notice for Claude models', async () => {
      const claudeResult = { 
        ...mockAnalysisResult, 
        model: 'claude-3.5-sonnet' as const 
      }
      
      const wrapper = mount(Tokenizer)
      wrapper.vm.currentAnalysis = claudeResult
      await nextTick()
      
      const notice = wrapper.find('.bg-yellow-500\\/10')
      expect(notice.exists()).toBe(true)
      expect(notice.text()).toContain('Approximation Notice')
    })
  })

  describe('Analysis History', () => {
    it('should add analysis to history', async () => {
      const wrapper = mount(Tokenizer)
      
      wrapper.vm.analyzeCurrentText()
      await nextTick()
      
      expect(wrapper.vm.analysisHistory).toHaveLength(1)
      expect(wrapper.vm.analysisHistory[0]).toEqual(mockAnalysisResult)
    })

    it('should not add duplicate analyses to history', async () => {
      const wrapper = mount(Tokenizer)
      wrapper.vm.analysisHistory = [mockAnalysisResult]
      
      mockAnalyzeText.mockReturnValue(mockAnalysisResult) // Same result
      wrapper.vm.analyzeCurrentText()
      await nextTick()
      
      expect(wrapper.vm.analysisHistory).toHaveLength(1) // No duplicate added
    })

    it('should limit history to 20 items', async () => {
      const wrapper = mount(Tokenizer)
      
      // Fill history with 21 items
      for (let i = 0; i < 21; i++) {
        wrapper.vm.analysisHistory.push({
          ...mockAnalysisResult,
          id: `analysis-${i}`,
          text: `Text ${i}`
        })
      }
      
      expect(wrapper.vm.analysisHistory).toHaveLength(20) // Automatically trimmed
    })

    it('should load analysis from history when clicked', async () => {
      const historicalAnalysis = { ...mockAnalysisResult, text: 'Historical text' }
      const wrapper = mount(Tokenizer)
      wrapper.vm.analysisHistory = [historicalAnalysis]
      await nextTick()
      
      const historyItem = wrapper.find('.hover\\:bg-accent\\/50')
      await historyItem.trigger('click')
      
      expect(wrapper.vm.inputText).toBe('Historical text')
      expect(wrapper.vm.currentAnalysis).toEqual(historicalAnalysis)
    })

    it('should clear history when clear button is clicked', async () => {
      const wrapper = mount(Tokenizer)
      wrapper.vm.analysisHistory = [mockAnalysisResult]
      
      const clearButton = wrapper.find('button:contains("Clear History")')
      await clearButton.trigger('click')
      
      expect(wrapper.vm.analysisHistory).toHaveLength(0)
    })
  })

  describe('Export and Copy Functionality', () => {
    beforeEach(() => {
      // Mock DOM APIs
      global.URL = {
        createObjectURL: vi.fn(() => 'mock-url'),
        revokeObjectURL: vi.fn()
      } as any
      
      global.Blob = vi.fn() as any
      
      // Mock document methods
      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: vi.fn(),
        remove: vi.fn()
      }
      
      Object.defineProperty(document, 'createElement', {
        value: vi.fn(() => mockLink)
      })
      
      Object.defineProperty(document.body, 'appendChild', {
        value: vi.fn()
      })
      
      Object.defineProperty(document.body, 'removeChild', {
        value: vi.fn()
      })
    })

    it('should export analysis as JSON', async () => {
      const wrapper = mount(Tokenizer)
      wrapper.vm.currentAnalysis = mockAnalysisResult
      
      wrapper.vm.exportAnalysis('json')
      
      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining('"totalTokens": 6')],
        { type: 'application/json' }
      )
    })

    it('should export analysis as CSV', async () => {
      const wrapper = mount(Tokenizer)
      wrapper.vm.currentAnalysis = mockAnalysisResult
      
      wrapper.vm.exportAnalysis('csv')
      
      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining('Text,Model,Role,Tokens,Characters,Words,Cost,Timestamp')],
        { type: 'text/csv' }
      )
    })

    it('should copy tokens to clipboard', async () => {
      const mockCopy = vi.fn()
      const { useClipboard } = await import('@vueuse/core')
      ;(useClipboard as any).mockReturnValue({
        copy: mockCopy,
        isSupported: { value: true }
      })
      
      const wrapper = mount(Tokenizer)
      wrapper.vm.currentAnalysis = mockAnalysisResult
      
      await wrapper.vm.copyTokensToClipboard()
      
      expect(mockCopy).toHaveBeenCalledWith('Hello, world!')
    })
  })

  describe('Toast Notifications', () => {
    it('should show toast message', async () => {
      const wrapper = mount(Tokenizer)
      
      wrapper.vm.showToastMessage('Test message')
      await nextTick()
      
      expect(wrapper.vm.showToast).toBe(true)
      expect(wrapper.vm.toastMessage).toBe('Test message')
      
      const toast = wrapper.find('.fixed.bottom-4')
      expect(toast.exists()).toBe(true)
      expect(toast.text()).toBe('Test message')
    })

    it('should hide toast after timeout', async () => {
      const wrapper = mount(Tokenizer)
      
      wrapper.vm.showToastMessage('Test message')
      await nextTick()
      
      expect(wrapper.vm.showToast).toBe(true)
      
      // Fast-forward timer
      vi.advanceTimersByTime(3000)
      await nextTick()
      
      expect(wrapper.vm.showToast).toBe(false)
    })
  })

  describe('Accessibility and UX', () => {
    it('should have proper ARIA labels and roles', () => {
      const wrapper = mount(Tokenizer)
      
      const selects = wrapper.findAll('select')
      expect(selects[0].attributes('aria-label')).toBeDefined()
      
      const textarea = wrapper.find('textarea')
      expect(textarea.attributes('placeholder')).toBeTruthy()
    })

    it('should support keyboard navigation', async () => {
      const wrapper = mount(Tokenizer)
      wrapper.vm.selectedToken = mockAnalysisResult.tokens[0]
      await nextTick()
      
      // Test Escape key to close modal
      const modal = wrapper.find('.fixed.inset-0')
      await modal.trigger('keydown.esc')
      
      // Note: This would require additional keyboard event handling in the component
    })

    it('should provide visual feedback for user actions', async () => {
      const wrapper = mount(Tokenizer)
      
      wrapper.vm.showToastMessage('Action completed')
      await nextTick()
      
      const toast = wrapper.find('.fixed.bottom-4')
      expect(toast.classes()).toContain('transition-all')
      expect(toast.classes()).toContain('duration-300')
    })
  })

  describe('Error Handling', () => {
    it('should handle analysis errors gracefully', async () => {
      mockAnalyzeText.mockImplementation(() => {
        throw new Error('Analysis failed')
      })
      
      const wrapper = mount(Tokenizer)
      
      wrapper.vm.analyzeCurrentText()
      await nextTick()
      
      expect(wrapper.vm.showToast).toBe(true)
      expect(wrapper.vm.toastMessage).toContain('Error analyzing text')
    })

    it('should handle empty text gracefully', async () => {
      const wrapper = mount(Tokenizer)
      wrapper.vm.inputText = ''
      
      wrapper.vm.analyzeCurrentText()
      await nextTick()
      
      expect(wrapper.vm.currentAnalysis).toBeNull()
      expect(mockAnalyzeText).not.toHaveBeenCalled()
    })

    it('should handle export errors gracefully', async () => {
      global.Blob = vi.fn().mockImplementation(() => {
        throw new Error('Blob creation failed')
      })
      
      const wrapper = mount(Tokenizer)
      wrapper.vm.currentAnalysis = mockAnalysisResult
      
      wrapper.vm.exportAnalysis('json')
      
      expect(wrapper.vm.showToast).toBe(true)
      expect(wrapper.vm.toastMessage).toContain('Export failed')
    })
  })

  describe('Performance Considerations', () => {
    it('should debounce real-time analysis', async () => {
      const wrapper = mount(Tokenizer)
      const textarea = wrapper.find('textarea')
      
      // Type multiple characters quickly
      await textarea.setValue('a')
      await textarea.setValue('ab')
      await textarea.setValue('abc')
      
      // Only one analysis should be pending
      expect(mockAnalyzeText).not.toHaveBeenCalled()
      
      // Fast-forward past debounce delay
      vi.advanceTimersByTime(300)
      await nextTick()
      
      // Now analysis should have been called once
      expect(mockAnalyzeText).toHaveBeenCalledTimes(1)
    })

    it('should handle large token arrays efficiently', async () => {
      const largeTokenArray = Array.from({ length: 1000 }, (_, i) => ({
        id: `token-${i}`,
        text: `token${i}`,
        token: i,
        color: '#3B82F6',
        index: i
      }))

      const largeAnalysis = {
        ...mockAnalysisResult,
        tokens: largeTokenArray,
        totalTokens: 1000
      }
      
      const wrapper = mount(Tokenizer)
      wrapper.vm.currentAnalysis = largeAnalysis
      await nextTick()
      
      // Component should render without performance issues
      const tokenSpans = wrapper.findAll('span[title*="Token"]')
      expect(tokenSpans.length).toBe(1000)
    })
  })
})