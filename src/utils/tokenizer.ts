import { getEncoding } from 'js-tiktoken'

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
  | 'gpt-5'
  | 'gpt-5-pro'
  | 'gpt-5-mini'
  | 'gpt-5-nano'
  | 'claude-4-sonnet'
  | 'claude-4-opus'
  | 'claude-opus-4.1'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash-lite'

// Model configurations with pricing (per 1K tokens) - Updated for 2025 models
export const MODEL_CONFIGS = {
  'gpt-5': {
    name: 'GPT-5',
    encoding: 'o200k_base',
    inputPrice: 0.003, // $0.003 per 1K input tokens
    outputPrice: 0.015, // $0.015 per 1K output tokens
    maxTokens: 200000,
    supportsNativeTokenization: true
  },
  'gpt-5-pro': {
    name: 'GPT-5 Pro',
    encoding: 'o200k_base',
    inputPrice: 0.015, // $0.015 per 1K input tokens
    outputPrice: 0.060, // $0.060 per 1K output tokens
    maxTokens: 200000,
    supportsNativeTokenization: true
  },
  'gpt-5-mini': {
    name: 'GPT-5 Mini',
    encoding: 'o200k_base',
    inputPrice: 0.0005, // $0.0005 per 1K input tokens
    outputPrice: 0.002, // $0.002 per 1K output tokens
    maxTokens: 200000,
    supportsNativeTokenization: true
  },
  'gpt-5-nano': {
    name: 'GPT-5 Nano',
    encoding: 'o200k_base',
    inputPrice: 0.0001, // $0.0001 per 1K input tokens
    outputPrice: 0.0005, // $0.0005 per 1K output tokens
    maxTokens: 128000,
    supportsNativeTokenization: true
  },
  'claude-4-sonnet': {
    name: 'Claude 4 Sonnet',
    encoding: 'cl100k_base', // Approximation using GPT tokenizer
    inputPrice: 0.003, // $3 per 1M tokens = $0.003 per 1K tokens
    outputPrice: 0.015, // $15 per 1M tokens = $0.015 per 1K tokens
    maxTokens: 1000000, // 1M context window
    supportsNativeTokenization: false
  },
  'claude-4-opus': {
    name: 'Claude 4 Opus',
    encoding: 'cl100k_base', // Approximation using GPT tokenizer
    inputPrice: 0.015, // $15 per 1M tokens = $0.015 per 1K tokens
    outputPrice: 0.075, // $75 per 1M tokens = $0.075 per 1K tokens
    maxTokens: 1000000, // 1M context window
    supportsNativeTokenization: false
  },
  'claude-opus-4.1': {
    name: 'Claude Opus 4.1',
    encoding: 'cl100k_base', // Approximation using GPT tokenizer
    inputPrice: 0.015, // $15 per 1M tokens = $0.015 per 1K tokens
    outputPrice: 0.075, // $75 per 1M tokens = $0.075 per 1K tokens
    maxTokens: 1000000, // 1M context window
    supportsNativeTokenization: false
  },
  'gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    encoding: 'cl100k_base', // Approximation using GPT tokenizer
    inputPrice: 0.0005, // Estimated based on Google's pricing
    outputPrice: 0.002, // Estimated based on Google's pricing
    maxTokens: 1000000, // 1M context window
    supportsNativeTokenization: false
  },
  'gemini-2.5-pro': {
    name: 'Gemini 2.5 Pro',
    encoding: 'cl100k_base', // Approximation using GPT tokenizer
    inputPrice: 0.01, // Higher pricing for Pro model
    outputPrice: 0.04, // Higher pricing for Pro model
    maxTokens: 1000000, // 1M context window
    supportsNativeTokenization: false
  },
  'gemini-2.5-flash-lite': {
    name: 'Gemini 2.5 Flash Lite',
    encoding: 'cl100k_base', // Approximation using GPT tokenizer
    inputPrice: 0.0001, // $0.10 per 1M tokens = $0.0001 per 1K tokens
    outputPrice: 0.0004, // $0.40 per 1M tokens = $0.0004 per 1K tokens
    maxTokens: 1000000, // 1M context window
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
    if (model.startsWith('gpt-5')) {
      // For GPT-5 models, use o200k_base encoding
      const encoding = getEncoding('o200k_base')
      const tokens = encoding.encode(text)
      return tokens.length
    } else {
      // Fallback for any other models
      const encoding = getEncoding('cl100k_base')
      const tokens = encoding.encode(text)
      return tokens.length
    }
  } catch (error) {
    console.error('Error counting OpenAI tokens:', error)
    // Fallback to cl100k_base encoding
    const encoding = getEncoding('cl100k_base')
    const tokens = encoding.encode(text)
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
    
    if (model.startsWith('gpt-5')) {
      encoding = getEncoding('o200k_base')
    } else if (config.supportsNativeTokenization) {
      encoding = getEncoding('cl100k_base')
    } else {
      // Use cl100k_base for non-OpenAI models (Claude, Gemini) as approximation
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
    id: `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
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