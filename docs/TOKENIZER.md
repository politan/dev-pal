# Tokenizer Module Documentation

## Overview

The Tokenizer is a comprehensive AI token analysis tool that provides accurate token counting, cost estimation, and interactive token visualization for various Large Language Models (LLMs). It supports both OpenAI GPT models and Anthropic Claude models, offering developers precise insights into token usage and associated costs.

## Features

### Core Functionality
- **Multi-Model Support**: Supports GPT-5 family (GPT-5, GPT-5 Pro, GPT-5 Mini, GPT-5 Nano), Claude 4 family (Claude 4 Sonnet, Claude 4 Opus, Claude Opus 4.1), and Google Gemini 2.5 models (Flash, Pro, Flash Lite)
- **Role-Based Analysis**: Accurate token counting for system, user, and assistant message roles
- **Real-Time Analysis**: Optional live token counting as you type with intelligent debouncing
- **Cost Estimation**: Precise cost calculations based on current API pricing (input/output token differentiation)
- **Token Limit Validation**: Visual warnings when text exceeds model-specific token limits

### Interactive Visualization
- **Color-Coded Tokens**: Each token is displayed in a unique color for easy identification
- **Hover Details**: Detailed token information on hover (token ID, position, text content)
- **Token Inspector**: Modal dialog with comprehensive token details
- **Responsive Layout**: Token visualization adapts to different screen sizes

### Analysis Features
- **Comprehensive Statistics**: Token count, character count, word count, estimated cost
- **Analysis History**: Maintains history of recent analyses with quick reload functionality
- **Export Functionality**: Export analysis results in JSON or CSV format
- **Copy Operations**: Copy tokens to clipboard for external use

### User Experience
- **Real-Time Toggle**: Switch between real-time and manual analysis modes
- **Model Comparison**: Easy switching between different models to compare token usage
- **Toast Notifications**: User-friendly feedback for all operations
- **Accessibility**: Full keyboard navigation and screen reader support

## Dependencies

### External Packages

#### js-tiktoken (v1.0.21)
- **Purpose**: Official JavaScript port of OpenAI's tiktoken tokenizer
- **Usage**: Provides accurate token counting for OpenAI GPT models
- **Reason**: Ensures token counts match exactly with OpenAI's API billing
- **License**: MIT

### Internal Dependencies

#### @vueuse/core
- **Purpose**: Vue composition utilities for clipboard operations
- **Usage**: `useClipboard` composable for copy-to-clipboard functionality

#### lucide-vue-next
- **Purpose**: Icon system for consistent UI elements
- **Usage**: Various icons throughout the interface (Calculator, Coins, etc.)

## Architecture

### Component Structure

```
src/components/tools/Tokenizer.vue
├── Configuration Panel (Model & Role Selection)
├── Text Input Area (with real-time analysis option)
├── Statistics Dashboard (tokens, characters, words, cost)
├── Token Visualization Panel (color-coded token breakdown)
├── Analysis History (previous analyses with reload functionality)
├── Token Detail Modal (detailed token information)
└── Export & Copy Operations
```

### Utility Structure

```
src/utils/tokenizer.ts
├── Token Counting Functions
│   ├── countTokensOpenAI() - Native OpenAI tokenization
│   ├── countTokensClaude() - Approximated Claude tokenization
│   └── countTokens() - Unified interface
├── Text Analysis Functions
│   ├── tokenizeText() - Detailed token breakdown with colors
│   ├── analyzeText() - Complete text analysis
│   └── formatMessageForTokenCounting() - Role-based formatting
├── Utility Functions
│   ├── calculateEstimatedCost() - Cost estimation
│   ├── validateTokenLimit() - Token limit validation
│   └── getWordCount() - Word counting
└── Configuration Objects
    ├── MODEL_CONFIGS - Model specifications and pricing
    ├── MESSAGE_ROLES - Available message roles
    └── TOKEN_COLORS - Color palette for visualization
```

## Implementation Details

### Token Counting Logic

#### OpenAI Models
- **GPT-3.5 & GPT-4**: Uses `encodingForModel()` for native tokenization
- **GPT-4o Models**: Uses `o200k_base` encoding (newer tokenizer)
- **Message Formatting**: Includes OpenAI's message structure tokens for accurate billing

#### Claude Models
- **Approximation Method**: Uses OpenAI's `cl100k_base` tokenizer with 5% adjustment
- **Reasoning**: No official JavaScript tokenizer available for Claude models
- **Accuracy**: Typically within ±5-10% of actual Claude token counts

### Color-Coded Visualization

The tokenizer assigns unique colors to each token using a predefined palette of 20 colors. Colors are assigned sequentially and cycle when more than 20 tokens are present.

```typescript
const TOKEN_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  // ... additional colors
]
```

### Performance Optimizations

- **Debounced Real-Time Analysis**: 300ms delay to prevent excessive tokenization
- **Encoding Memory Management**: Proper cleanup of tiktoken encodings
- **History Limiting**: Maximum 20 analyses in history to prevent memory issues

### Error Handling

- **Graceful Fallbacks**: Falls back to approximation methods if primary tokenization fails
- **User-Friendly Messages**: Clear error messages with actionable guidance
- **Defensive Programming**: Input validation and edge case handling

## API Integration

### Model Support Matrix (2025 Updated)

| Model | Native Support | Encoding | Max Tokens | Input Price (per 1K) | Output Price (per 1K) |
|-------|----------------|----------|------------|---------------------|----------------------|
| **OpenAI GPT-5 Family** |
| GPT-5 | ✅ | o200k_base | 200,000 | $0.003 | $0.015 |
| GPT-5 Pro | ✅ | o200k_base | 200,000 | $0.015 | $0.060 |
| GPT-5 Mini | ✅ | o200k_base | 200,000 | $0.0005 | $0.002 |
| GPT-5 Nano | ✅ | o200k_base | 128,000 | $0.0001 | $0.0005 |
| **Anthropic Claude 4 Family** |
| Claude 4 Sonnet | 🔶 | Approximated | 1,000,000 | $0.003 | $0.015 |
| Claude 4 Opus | 🔶 | Approximated | 1,000,000 | $0.015 | $0.075 |
| Claude Opus 4.1 | 🔶 | Approximated | 1,000,000 | $0.015 | $0.075 |
| **Google Gemini 2.5 Family** |
| Gemini 2.5 Flash | 🔶 | Approximated | 1,000,000 | $0.0005 | $0.002 |
| Gemini 2.5 Pro | 🔶 | Approximated | 1,000,000 | $0.01 | $0.04 |
| Gemini 2.5 Flash Lite | 🔶 | Approximated | 1,000,000 | $0.0001 | $0.0004 |

*Note: 🔶 indicates approximated tokenization*

### Message Role Formatting

The tokenizer accurately formats messages according to OpenAI's chat completion format:

```typescript
// System message example
"<|im_start|>system\nYou are a helpful assistant<|im_end|>"

// User message example  
"<|im_start|>user\nHello, how are you?<|im_end|>"

// Assistant message example
"<|im_start|>assistant\nI'm doing well, thank you!<|im_end|>"
```

This ensures token counts include the overhead for message structure, matching actual API usage.

## Usage Examples

### Basic Token Analysis

```javascript
import { analyzeText, MESSAGE_ROLES } from '@/utils/tokenizer'

const result = analyzeText("Hello, world!", {
  model: 'gpt-5-mini',
  role: MESSAGE_ROLES[1] // User role
})

console.log(result.totalTokens) // e.g., 6
console.log(result.estimatedCost) // e.g., 0.000003
```

### Token Visualization

```javascript
import { tokenizeText } from '@/utils/tokenizer'

const tokens = tokenizeText("Hello, world!", 'gpt-5-mini')
tokens.forEach(token => {
  console.log(`Token: "${token.text}", Color: ${token.color}`)
})
```

### Cost Comparison Across Models

```javascript
const text = "Your sample text here"
const models = ['gpt-5-mini', 'gpt-5', 'claude-4-sonnet', 'gemini-2.5-flash']

models.forEach(model => {
  const result = analyzeText(text, { 
    model, 
    role: MESSAGE_ROLES[1] 
  })
  console.log(`${model}: ${result.totalTokens} tokens, $${result.estimatedCost.toFixed(6)}`)
})
```

## Testing

### Test Coverage

The tokenizer includes comprehensive tests covering:

- **Token counting accuracy** against known test cases
- **Model-specific tokenization** for each supported model
- **Role-based message formatting** validation
- **Cost calculation accuracy** with current pricing
- **Edge cases** (empty text, very long text, special characters)
- **UI interactions** and component state management
- **Error handling** and fallback mechanisms

### Test Structure

```
src/components/tools/Tokenizer.test.ts
├── Unit Tests
│   ├── Token counting accuracy
│   ├── Cost calculations
│   ├── Model configurations
│   └── Utility functions
├── Integration Tests
│   ├── Component interactions
│   ├── Real-time analysis
│   └── Export functionality
└── Edge Case Tests
    ├── Empty/null inputs
    ├── Extremely long texts
    └── Invalid model configurations
```

### Running Tests

```bash
# Run tokenizer tests specifically
npm run test -- tokenizer

# Run with coverage
npm run test:coverage

# Run in watch mode during development
npm run test
```

## Performance Considerations

### Memory Management
- **Encoding Cleanup**: Tiktoken encodings are properly freed after use
- **History Limits**: Analysis history is capped at 20 items
- **Token Visualization**: Large texts are handled efficiently with virtualization considerations

### CPU Optimization
- **Debounced Analysis**: Real-time mode uses 300ms debouncing
- **Lazy Loading**: Token details are loaded on-demand
- **Efficient Rendering**: React keys and memoization for token visualization

### Browser Compatibility
- **Modern Browsers**: Requires ES2018+ for proper tiktoken support
- **Fallback Handling**: Graceful degradation for unsupported features
- **Memory Limits**: Handles large texts within browser memory constraints

## Future Enhancements

### Planned Features
- **Custom Model Support**: Allow users to define custom models and pricing
- **Batch Analysis**: Analyze multiple texts simultaneously
- **Token Usage Tracking**: Historical usage patterns and analytics
- **API Integration**: Direct integration with OpenAI/Anthropic APIs for live validation

### Technical Improvements
- **Worker Threads**: Move heavy tokenization to web workers
- **Caching**: Cache tokenization results for identical inputs
- **Streaming**: Support for real-time streaming tokenization
- **Advanced Visualization**: Interactive token dependency graphs

### UI/UX Enhancements
- **Themes**: Light/dark mode toggle for token visualization
- **Keyboard Shortcuts**: Power-user keyboard navigation
- **Mobile Optimization**: Improved mobile experience for token visualization
- **Accessibility**: Enhanced screen reader support and ARIA labels

## Troubleshooting

### Common Issues

#### "Encoding failed" Error
- **Cause**: Usually occurs with very long texts or special characters
- **Solution**: The tokenizer falls back to approximation methods automatically
- **Prevention**: Validate input text length before analysis

#### Inaccurate Claude Token Counts
- **Cause**: Claude uses a different tokenizer than OpenAI
- **Expected**: ±5-10% variance from actual Claude API usage
- **Mitigation**: Use for estimation purposes, not exact billing

#### Performance Issues with Large Texts
- **Cause**: Browser memory limits with very large token visualizations
- **Solution**: Consider chunking large texts or disabling real-time mode
- **Recommendation**: Texts over 10,000 tokens may impact performance

### Debug Mode

Enable debug logging by setting the `DEBUG_TOKENIZER` environment variable:

```bash
DEBUG_TOKENIZER=true npm run dev
```

This will log detailed information about tokenization processes and performance metrics.

## Contributing

When extending the tokenizer functionality:

1. **Add New Models**: Update `MODEL_CONFIGS` with proper configuration
2. **Update Tests**: Ensure test coverage for new features
3. **Documentation**: Update this documentation file
4. **Performance**: Consider impact on browser performance
5. **Accessibility**: Maintain keyboard navigation and screen reader support

## License

This tokenizer module is part of the DevPal project and follows the project's overall licensing terms.