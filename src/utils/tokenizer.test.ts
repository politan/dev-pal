import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  countTokens,
  countTokensOpenAI,
  countTokensClaude,
  tokenizeText,
  analyzeText,
  calculateEstimatedCost,
  getWordCount,
  validateTokenLimit,
  formatMessageForTokenCounting,
  MESSAGE_ROLES,
  MODEL_CONFIGS,
  type SupportedModel,
  type TokenizerOptions
} from './tokenizer'

// Mock js-tiktoken module
vi.mock('js-tiktoken', () => {
  const mockEncoding = {
    encode: vi.fn(),
    decode: vi.fn()
  }

  return {
    getEncoding: vi.fn(() => mockEncoding)
  }
})

describe('tokenizer utility functions', () => {
  const mockEncoding = {
    encode: vi.fn(),
    decode: vi.fn()
  }
  
  const getEncoding = vi.fn(() => mockEncoding)

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup mock encoding responses  
    mockEncoding.encode.mockReturnValue([1, 2, 3, 4, 5]) // 5 tokens
    mockEncoding.decode.mockImplementation((tokens: number[]) => {
      const tokenTexts = ['Hello', ',', ' world', '!', '']
      return tokens.map(token => tokenTexts[token - 1] || '').join('')
    })
  })

  describe('countTokensOpenAI', () => {
    it('should count tokens correctly for GPT-5', () => {
      const result = countTokensOpenAI('Hello, world!', 'gpt-5')
      expect(result).toBe(5)
      expect(getEncoding).toHaveBeenCalledWith('o200k_base')
    })

    it('should count tokens correctly for GPT-5-mini', () => {
      const result = countTokensOpenAI('Hello, world!', 'gpt-5-mini')
      expect(result).toBe(5)
      expect(getEncoding).toHaveBeenCalledWith('o200k_base')
    })

    it('should use cl100k_base encoding for non-GPT-5 models', () => {
      const result = countTokensOpenAI('Hello, world!', 'claude-4-sonnet')
      expect(result).toBe(5)
      expect(getEncoding).toHaveBeenCalledWith('cl100k_base')
    })

    it('should handle encoding errors gracefully', () => {
      mockEncoding.encode.mockImplementation(() => {
        throw new Error('Encoding failed')
      })

      const result = countTokensOpenAI('Hello, world!', 'gpt-5')
      expect(result).toBe(5) // Should fall back to cl100k_base
      expect(getEncoding).toHaveBeenCalledWith('cl100k_base')
    })
  })

  describe('countTokensClaude', () => {
    it('should count tokens with Claude adjustment factor', () => {
      const result = countTokensClaude('Hello, world!')
      expect(result).toBe(Math.round(5 * 1.05)) // 5 tokens * 1.05 adjustment
      expect(getEncoding).toHaveBeenCalledWith('cl100k_base')
    })

    it('should handle encoding errors with character fallback', () => {
      mockEncoding.encode.mockImplementation(() => {
        throw new Error('Encoding failed')
      })

      const result = countTokensClaude('Hello, world!')
      expect(result).toBe(Math.ceil('Hello, world!'.length / 4)) // ~4 chars per token
    })

  })

  describe('countTokens', () => {
    it('should use OpenAI tokenizer for supported models', () => {
      const result = countTokens('Hello, world!', 'gpt-5')
      expect(result).toBe(5)
      expect(getEncoding).toHaveBeenCalledWith('o200k_base')
    })

    it('should use Claude approximation for Claude models', () => {
      const result = countTokens('Hello, world!', 'claude-4-sonnet')
      expect(result).toBe(Math.round(5 * 1.05))
      expect(getEncoding).toHaveBeenCalledWith('cl100k_base')
    })
  })

  describe('tokenizeText', () => {
    beforeEach(() => {
      mockEncoding.encode.mockReturnValue([101, 102, 103, 104]) // 4 tokens
      mockEncoding.decode.mockImplementation((tokens: number[]) => {
        const tokenMap: { [key: number]: string } = {
          101: 'Hello',
          102: ',',
          103: ' world',
          104: '!'
        }
        return tokens.map(token => tokenMap[token] || '').join('')
      })
    })

    it('should return detailed token chunks with colors', () => {
      const result = tokenizeText('Hello, world!', 'gpt-5')
      
      expect(result).toHaveLength(4)
      expect(result[0]).toEqual({
        id: 'token-0',
        text: 'Hello',
        token: 101,
        color: expect.any(String),
        index: 0
      })
      expect(result[0].color).toMatch(/^#[0-9A-F]{6}$/i) // Valid hex color
    })

    it('should handle different models correctly', () => {
      const result = tokenizeText('Test', 'claude-4-sonnet')
      expect(getEncoding).toHaveBeenCalledWith('cl100k_base') // Claude uses approximation
      expect(result.length).toBeGreaterThan(0)
    })

    it('should provide fallback for tokenization errors', () => {
      mockEncoding.encode.mockImplementation(() => {
        throw new Error('Tokenization failed')
      })

      const result = tokenizeText('Hello world', 'gpt-5')
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toEqual(expect.objectContaining({
        id: expect.stringMatching(/^fallback-/),
        text: expect.any(String),
        color: expect.any(String)
      }))
    })
  })

  describe('formatMessageForTokenCounting', () => {
    it('should format system messages correctly', () => {
      const result = formatMessageForTokenCounting('You are helpful', MESSAGE_ROLES[0])
      expect(result).toBe('<|im_start|>system\nYou are helpful<|im_end|>')
    })

    it('should format user messages correctly', () => {
      const result = formatMessageForTokenCounting('Hello!', MESSAGE_ROLES[1])
      expect(result).toBe('<|im_start|>user\nHello!<|im_end|>')
    })

    it('should format assistant messages correctly', () => {
      const result = formatMessageForTokenCounting('Hi there!', MESSAGE_ROLES[2])
      expect(result).toBe('<|im_start|>assistant\nHi there!<|im_end|>')
    })
  })

  describe('calculateEstimatedCost', () => {
    it('should calculate cost correctly for input tokens', () => {
      const cost = calculateEstimatedCost(1000, 'gpt-5', MESSAGE_ROLES[1]) // user role
      const expected = (1000 / 1000) * MODEL_CONFIGS['gpt-5'].inputPrice
      expect(cost).toBe(expected)
    })

    it('should calculate cost correctly for output tokens', () => {
      const cost = calculateEstimatedCost(1000, 'gpt-5', MESSAGE_ROLES[2]) // assistant role
      const expected = (1000 / 1000) * MODEL_CONFIGS['gpt-5'].outputPrice
      expect(cost).toBe(expected)
    })

    it('should handle different models correctly', () => {
      const cost1 = calculateEstimatedCost(1000, 'gpt-5-mini', MESSAGE_ROLES[1])
      const cost2 = calculateEstimatedCost(1000, 'gpt-5', MESSAGE_ROLES[1])
      
      expect(cost1).toBe(MODEL_CONFIGS['gpt-5-mini'].inputPrice)
      expect(cost2).toBe(MODEL_CONFIGS['gpt-5'].inputPrice)
      expect(cost2).toBeGreaterThan(cost1) // GPT-5 is more expensive than mini
    })
  })

  describe('getWordCount', () => {
    it('should count words correctly', () => {
      expect(getWordCount('Hello world')).toBe(2)
      expect(getWordCount('One two three four')).toBe(4)
      expect(getWordCount('  spaced   words  ')).toBe(2)
    })

    it('should handle empty strings', () => {
      expect(getWordCount('')).toBe(0)
      expect(getWordCount('   ')).toBe(0)
    })

    it('should handle single words', () => {
      expect(getWordCount('Hello')).toBe(1)
      expect(getWordCount('  Hello  ')).toBe(1)
    })
  })

  describe('validateTokenLimit', () => {
    it('should validate tokens within limit', () => {
      const result = validateTokenLimit(1000, 'gpt-5')
      expect(result.isValid).toBe(true)
      expect(result.maxTokens).toBe(MODEL_CONFIGS['gpt-5'].maxTokens)
      expect(result.percentage).toBeLessThan(1)
    })

    it('should detect tokens exceeding limit', () => {
      const result = validateTokenLimit(300000, 'gpt-5-nano') // Exceeds GPT-5-nano limit
      expect(result.isValid).toBe(false)
      expect(result.percentage).toBeGreaterThan(100)
    })

    it('should calculate percentage correctly', () => {
      const model: SupportedModel = 'gpt-5-mini'
      const tokens = MODEL_CONFIGS[model].maxTokens / 2 // 50% of limit
      const result = validateTokenLimit(tokens, model)
      
      expect(result.percentage).toBeCloseTo(50, 1)
      expect(result.isValid).toBe(true)
    })
  })

  describe('analyzeText', () => {
    const mockOptions: TokenizerOptions = {
      model: 'gpt-5-mini',
      role: MESSAGE_ROLES[1]
    }

    beforeEach(() => {
      // Setup more detailed mock for complete analysis
      mockEncoding.encode.mockReturnValue([1, 2, 3]) // 3 tokens
      mockEncoding.decode.mockImplementation((tokens: number[]) => {
        const tokenTexts = ['Hello', ' ', 'world']
        return tokens.map((_, i) => tokenTexts[i] || '').join('')
      })
    })

    it('should return complete analysis result', () => {
      const result = analyzeText('Hello world', mockOptions)
      
      expect(result).toEqual(expect.objectContaining({
        id: expect.any(String),
        text: 'Hello world',
        tokens: expect.any(Array),
        totalTokens: expect.any(Number),
        characterCount: 11,
        wordCount: 2,
        estimatedCost: expect.any(Number),
        model: 'gpt-5-mini',
        role: MESSAGE_ROLES[1],
        timestamp: expect.any(Date)
      }))
    })

    it('should generate unique IDs', () => {
      const result1 = analyzeText('Text 1', mockOptions)
      const result2 = analyzeText('Text 2', mockOptions)
      
      expect(result1.id).not.toBe(result2.id)
    })

    it('should include token visualization data', () => {
      const result = analyzeText('Hello world', mockOptions)
      
      expect(result.tokens).toHaveLength(3)
      result.tokens.forEach((token, index) => {
        expect(token).toEqual(expect.objectContaining({
          id: `token-${index}`,
          text: expect.any(String),
          token: expect.any(Number),
          color: expect.stringMatching(/^#[0-9A-F]{6}$/i),
          index
        }))
      })
    })

    it('should calculate costs based on role', () => {
      const userResult = analyzeText('Test', { ...mockOptions, role: MESSAGE_ROLES[1] })
      const assistantResult = analyzeText('Test', { ...mockOptions, role: MESSAGE_ROLES[2] })
      
      expect(assistantResult.estimatedCost).toBeGreaterThan(userResult.estimatedCost)
    })
  })

  describe('MODEL_CONFIGS', () => {
    it('should have configurations for all supported models', () => {
      const models: SupportedModel[] = [
        'gpt-5', 'gpt-5-pro', 'gpt-5-mini', 'gpt-5-nano',
        'claude-4-sonnet', 'claude-4-opus', 'claude-opus-4.1',
        'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite'
      ]
      
      models.forEach(model => {
        expect(MODEL_CONFIGS[model]).toBeDefined()
        expect(MODEL_CONFIGS[model]).toEqual(expect.objectContaining({
          name: expect.any(String),
          encoding: expect.any(String),
          inputPrice: expect.any(Number),
          outputPrice: expect.any(Number),
          maxTokens: expect.any(Number),
          supportsNativeTokenization: expect.any(Boolean)
        }))
      })
    })

    it('should have correct native tokenization flags', () => {
      expect(MODEL_CONFIGS['gpt-5'].supportsNativeTokenization).toBe(true)
      expect(MODEL_CONFIGS['claude-4-sonnet'].supportsNativeTokenization).toBe(false)
    })

    it('should have reasonable pricing values', () => {
      Object.values(MODEL_CONFIGS).forEach(config => {
        expect(config.inputPrice).toBeGreaterThan(0)
        expect(config.outputPrice).toBeGreaterThan(0)
        expect(config.outputPrice).toBeGreaterThanOrEqual(config.inputPrice)
        expect(config.maxTokens).toBeGreaterThan(1000)
      })
    })
  })

  describe('MESSAGE_ROLES', () => {
    it('should have three predefined roles', () => {
      expect(MESSAGE_ROLES).toHaveLength(3)
      expect(MESSAGE_ROLES.map(role => role.type)).toEqual(['system', 'user', 'assistant'])
    })

    it('should have descriptive labels', () => {
      MESSAGE_ROLES.forEach(role => {
        expect(role.label).toBeTruthy()
        expect(typeof role.label).toBe('string')
      })
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle empty text input', () => {
      const result = analyzeText('', { model: 'gpt-5', role: MESSAGE_ROLES[0] })
      expect(result.text).toBe('')
      expect(result.characterCount).toBe(0)
      expect(result.wordCount).toBe(0)
    })

    it('should handle very long text input', () => {
      const longText = 'word '.repeat(10000)
      const result = analyzeText(longText, { model: 'gpt-5', role: MESSAGE_ROLES[1] })
      
      expect(result.text).toBe(longText)
      expect(result.characterCount).toBe(longText.length)
      expect(result.wordCount).toBeGreaterThan(0)
    })

    it('should handle special characters and unicode', () => {
      const specialText = '🚀 Hello 世界! @#$%^&*()'
      const result = analyzeText(specialText, { model: 'gpt-5', role: MESSAGE_ROLES[1] })
      
      expect(result.text).toBe(specialText)
      expect(result.characterCount).toBe(specialText.length)
    })

    it('should handle newlines and whitespace', () => {
      const multilineText = 'Line 1\n\nLine 2\t\tTabbed\r\nWindows line'
      const result = analyzeText(multilineText, { model: 'gpt-5', role: MESSAGE_ROLES[1] })
      
      expect(result.text).toBe(multilineText)
      expect(result.characterCount).toBe(multilineText.length)
    })
  })
})