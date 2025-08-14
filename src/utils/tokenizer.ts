import { encodingForModel, getEncoding } from 'js-tiktoken'

export interface TokenizerOptions {
  model: SupportedModel
  role: MessageRole
}

export interface TokenizedResult {
  id: string
  text: string
  tokens: TokenChunk[]
  totalTokens: number
  characterCount: number
  wordCount: number
  estimatedCost: number
  model: SupportedModel
  role: MessageRole
  timestamp: Date
}

export interface TokenChunk {
  id: string
  text: string
  token: number
  color: string
  index: number
}

export interface MessageRole {
  type: 'system' | 'user' | 'assistant'
  label: string
}

export type SupportedModel = 
  | 'gpt-3.5-turbo'
  | 'gpt-4'
  | 'gpt-4-turbo'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'claude-3-haiku'
  | 'claude-3-sonnet'
  | 'claude-3.5-sonnet'
  | 'claude-3-opus'

// Model configurations with pricing (per 1K tokens)
export const MODEL_CONFIGS = {
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    encoding: 'cl100k_base',
    inputPrice: 0.0010, // $0.001 per 1K input tokens
    outputPrice: 0.0020, // $0.002 per 1K output tokens
    maxTokens: 16385,
    supportsNativeTokenization: true
  },
  'gpt-4': {
    name: 'GPT-4',
    encoding: 'cl100k_base',
    inputPrice: 0.0300, // $0.03 per 1K input tokens
    outputPrice: 0.0600, // $0.06 per 1K output tokens
    maxTokens: 8192,
    supportsNativeTokenization: true
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    encoding: 'cl100k_base',
    inputPrice: 0.0100, // $0.01 per 1K input tokens
    outputPrice: 0.0300, // $0.03 per 1K output tokens
    maxTokens: 128000,
    supportsNativeTokenization: true
  },
  'gpt-4o': {
    name: 'GPT-4o',
    encoding: 'o200k_base',
    inputPrice: 0.0025, // $0.0025 per 1K input tokens
    outputPrice: 0.0100, // $0.01 per 1K output tokens
    maxTokens: 128000,
    supportsNativeTokenization: true
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    encoding: 'o200k_base',
    inputPrice: 0.000150, // $0.00015 per 1K input tokens
    outputPrice: 0.000600, // $0.0006 per 1K output tokens
    maxTokens: 128000,
    supportsNativeTokenization: true
  },
  'claude-3-haiku': {
    name: 'Claude 3 Haiku',
    encoding: 'cl100k_base', // Approximation using GPT tokenizer
    inputPrice: 0.00025, // $0.00025 per 1K input tokens
    outputPrice: 0.00125, // $0.00125 per 1K output tokens
    maxTokens: 200000,
    supportsNativeTokenization: false
  },
  'claude-3-sonnet': {
    name: 'Claude 3 Sonnet',
    encoding: 'cl100k_base', // Approximation using GPT tokenizer
    inputPrice: 0.003, // $0.003 per 1K input tokens
    outputPrice: 0.015, // $0.015 per 1K output tokens
    maxTokens: 200000,
    supportsNativeTokenization: false
  },
  'claude-3.5-sonnet': {
    name: 'Claude 3.5 Sonnet',
    encoding: 'cl100k_base', // Approximation using GPT tokenizer
    inputPrice: 0.003, // $0.003 per 1K input tokens
    outputPrice: 0.015, // $0.015 per 1K output tokens
    maxTokens: 200000,
    supportsNativeTokenization: false
  },
  'claude-3-opus': {
    name: 'Claude 3 Opus',
    encoding: 'cl100k_base', // Approximation using GPT tokenizer
    inputPrice: 0.015, // $0.015 per 1K input tokens
    outputPrice: 0.075, // $0.075 per 1K output tokens
    maxTokens: 200000,
    supportsNativeTokenization: false
  }
} as const

// Predefined message roles
export const MESSAGE_ROLES: MessageRole[] = [
  { type: 'system', label: 'System Message' },
  { type: 'user', label: 'User Message' },
  { type: 'assistant', label: 'Assistant Message' }
]

// Color palette for token visualization
const TOKEN_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
  '#14B8A6', '#FACC15', '#F43F5E', '#A855F7', '#0EA5E9',
  '#22C55E', '#FB923C', '#E11D48', '#9333EA', '#0284C7'
]

/**
 * Count tokens for supported OpenAI models using js-tiktoken
 */
export function countTokensOpenAI(text: string, model: SupportedModel): number {
  try {
    const config = MODEL_CONFIGS[model]
    
    if (model === 'gpt-4o' || model === 'gpt-4o-mini') {
      // For GPT-4o models, use o200k_base encoding
      const encoding = getEncoding('o200k_base')
      const tokens = encoding.encode(text)
      // Safely free encoding if method exists
      if (typeof encoding.free === 'function') {
        encoding.free()
      }
      return tokens.length
    } else {
      // For other OpenAI models, use the model-specific encoding
      const encoding = encodingForModel(model as 'gpt-3.5-turbo' | 'gpt-4')
      const tokens = encoding.encode(text)
      // Safely free encoding if method exists
      if (typeof encoding.free === 'function') {
        encoding.free()
      }
      return tokens.length
    }
  } catch (error) {
    console.error('Error counting OpenAI tokens:', error)
    // Fallback to cl100k_base encoding
    const encoding = getEncoding('cl100k_base')
    const tokens = encoding.encode(text)
    // Safely free encoding if method exists
    if (typeof encoding.free === 'function') {
      encoding.free()
    }
    return tokens.length
  }
}

/**
 * Approximate token count for Claude models using OpenAI tokenizer
 * This is an approximation since Claude uses a different tokenizer
 */
export function countTokensClaude(text: string): number {
  try {
    // Use cl100k_base as approximation - Claude typically has similar token counts
    const encoding = getEncoding('cl100k_base')
    const tokens = encoding.encode(text)
    // Safely free encoding if method exists
    if (typeof encoding.free === 'function') {
      encoding.free()
    }
    
    // Apply a small adjustment factor based on empirical observations
    // Claude tokens tend to be slightly different, but this is a reasonable approximation
    return Math.round(tokens.length * 1.05)
  } catch (error) {
    console.error('Error counting Claude tokens:', error)
    // Very rough fallback: ~4 characters per token average
    return Math.ceil(text.length / 4)
  }
}

/**
 * Count tokens for any supported model
 */
export function countTokens(text: string, model: SupportedModel): number {
  const config = MODEL_CONFIGS[model]
  
  if (config.supportsNativeTokenization) {
    return countTokensOpenAI(text, model)
  } else {
    return countTokensClaude(text)
  }
}

/**
 * Tokenize text and return detailed token information with colors
 */
export function tokenizeText(text: string, model: SupportedModel): TokenChunk[] {
  try {
    const config = MODEL_CONFIGS[model]
    let encoding
    
    if (model === 'gpt-4o' || model === 'gpt-4o-mini') {
      encoding = getEncoding('o200k_base')
    } else if (config.supportsNativeTokenization) {
      encoding = encodingForModel(model as 'gpt-3.5-turbo' | 'gpt-4')
    } else {
      // Use cl100k_base for Claude approximation
      encoding = getEncoding('cl100k_base')
    }
    
    const tokens = encoding.encode(text)
    const chunks: TokenChunk[] = []
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      const tokenText = encoding.decode([token])
      
      chunks.push({
        id: `token-${i}`,
        text: tokenText,
        token,
        color: TOKEN_COLORS[i % TOKEN_COLORS.length],
        index: i
      })
    }
    
    // Safely free encoding if method exists
    if (typeof encoding.free === 'function') {
      encoding.free()
    }
    return chunks
    
  } catch (error) {
    console.error('Error tokenizing text:', error)
    
    // Fallback: split by spaces and assign colors
    const words = text.split(/(\s+)/)
    return words.map((word, i) => ({
      id: `fallback-${i}`,
      text: word,
      token: i, // This isn't a real token ID in fallback mode
      color: TOKEN_COLORS[i % TOKEN_COLORS.length],
      index: i
    }))
  }
}

/**
 * Format message with role for accurate token counting
 * Based on OpenAI's message formatting
 */
export function formatMessageForTokenCounting(text: string, role: MessageRole): string {
  // Simulate OpenAI's message format for token counting
  // This adds the overhead tokens that OpenAI includes for message structure
  switch (role.type) {
    case 'system':
      return `<|im_start|>system\n${text}<|im_end|>`
    case 'user':
      return `<|im_start|>user\n${text}<|im_end|>`
    case 'assistant':
      return `<|im_start|>assistant\n${text}<|im_end|>`
    default:
      return text
  }
}

/**
 * Calculate estimated cost based on token count and model pricing
 */
export function calculateEstimatedCost(tokenCount: number, model: SupportedModel, role: MessageRole): number {
  const config = MODEL_CONFIGS[model]
  const pricePerToken = role.type === 'assistant' ? config.outputPrice : config.inputPrice
  
  // Convert from price per 1K tokens to price per token
  return (tokenCount / 1000) * pricePerToken
}

/**
 * Get word count from text
 */
export function getWordCount(text: string): number {
  if (!text.trim()) return 0
  return text.trim().split(/\s+/).length
}

/**
 * Main tokenization function that returns complete analysis
 */
export function analyzeText(text: string, options: TokenizerOptions): TokenizedResult {
  const formattedText = formatMessageForTokenCounting(text, options.role)
  const tokens = tokenizeText(text, options.model) // Use original text for visual tokens
  const totalTokens = countTokens(formattedText, options.model) // Use formatted text for accurate count
  const characterCount = text.length
  const wordCount = getWordCount(text)
  const estimatedCost = calculateEstimatedCost(totalTokens, options.model, options.role)
  
  return {
    id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text,
    tokens,
    totalTokens,
    characterCount,
    wordCount,
    estimatedCost,
    model: options.model,
    role: options.role,
    timestamp: new Date()
  }
}

/**
 * Validate if text exceeds model's token limit
 */
export function validateTokenLimit(tokenCount: number, model: SupportedModel): {
  isValid: boolean
  maxTokens: number
  percentage: number
} {
  const config = MODEL_CONFIGS[model]
  const percentage = (tokenCount / config.maxTokens) * 100
  
  return {
    isValid: tokenCount <= config.maxTokens,
    maxTokens: config.maxTokens,
    percentage
  }
}