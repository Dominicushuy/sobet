// src/components/chat/ChatInput.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Send,
  Eraser,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Save,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const ChatInput = ({ onSendMessage, onClear, disabled, placeholder }) => {
  const [input, setInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [savedInputs, setSavedInputs] = useState([])
  const textareaRef = useRef(null)

  // Load saved inputs from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedBetInputs')
    if (saved) {
      try {
        setSavedInputs(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading saved inputs:', e)
      }
    }
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      const baseHeight = isExpanded ? 100 : 56
      textareaRef.current.style.height = `${baseHeight}px` // Reset height
      const scrollHeight = textareaRef.current.scrollHeight
      const newHeight = isExpanded
        ? Math.max(baseHeight, Math.min(scrollHeight, 200))
        : Math.min(scrollHeight, baseHeight)
      textareaRef.current.style.height = `${newHeight}px`
    }
  }, [input, isExpanded])

  // Bet code pattern detection for suggestions
  useEffect(() => {
    if (input.trim()) {
      // Very basic detection of potential bet code patterns
      const words = input.trim().split(/\s+/)
      const lastWord = words[words.length - 1]

      // If we have a potential station abbreviation, suggest common bet types
      const stationPatterns = [
        'mb',
        'vl',
        'hcm',
        'dn',
        'ct',
        'ag',
        'tp',
        'tg',
        'la',
        'bt',
      ]
      const numberPattern = /^\d+$/

      if (stationPatterns.includes(lastWord.toLowerCase())) {
        setSuggestions([
          '23 45 67 dd10',
          '12 34 56 b5',
          '45 67 dau10',
          '78 90 duoi5',
        ])
        setShowSuggestions(true)
      }
      // If the last word is a number, suggest adding another number or bet type
      else if (numberPattern.test(lastWord)) {
        setSuggestions(['45 67', 'dd10', 'b5', 'duoi10'])
        setShowSuggestions(true)
      }
      // If we have multiple words and the last one starts with d or b, suggest bet types
      else if (
        words.length > 1 &&
        (lastWord.startsWith('d') ||
          lastWord.startsWith('b') ||
          lastWord.startsWith('x'))
      ) {
        setSuggestions(['dd', 'dau', 'duoi', 'b', 'xc'])
        setShowSuggestions(true)
      } else {
        setShowSuggestions(false)
      }
    } else {
      setShowSuggestions(false)
    }
  }, [input])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSendMessage(input)
      setInput('')
      setShowSuggestions(false)

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = isExpanded ? '100px' : '56px'
      }
    }
  }

  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    // Insert the suggestion at the current cursor position or at the end
    const textarea = textareaRef.current
    if (textarea) {
      const cursorPos = textarea.selectionStart
      const textBefore = input.substring(0, cursorPos)
      const textAfter = input.substring(cursorPos)

      // Add a space before suggestion if needed
      const needsSpace = textBefore.length > 0 && !textBefore.endsWith(' ')
      const newValue =
        textBefore + (needsSpace ? ' ' : '') + suggestion + textAfter

      setInput(newValue)
      setShowSuggestions(false)

      // Focus back on textarea and place cursor at the right position
      setTimeout(() => {
        textarea.focus()
        const newCursorPos =
          cursorPos + suggestion.length + (needsSpace ? 1 : 0)
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    }
  }

  const saveCurrentInput = () => {
    if (input.trim()) {
      const newSavedInputs = [
        input,
        ...savedInputs.filter((i) => i !== input),
      ].slice(0, 5)
      setSavedInputs(newSavedInputs)
      localStorage.setItem('savedBetInputs', JSON.stringify(newSavedInputs))
    }
  }

  const loadSavedInput = (savedInput) => {
    setInput(savedInput)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  return (
    <form onSubmit={handleSubmit} className='relative'>
      <div className='relative'>
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Nhập mã cược...'}
          disabled={disabled}
          className={`pr-24 min-h-[56px] resize-none transition-all duration-200 ${
            isExpanded ? 'min-h-[100px] pb-10' : 'max-h-[120px]'
          }`}
          rows={1}
        />

        {/* Toggle expand button */}
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='absolute left-2 bottom-2 h-6 w-6 opacity-60 hover:opacity-100'
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Thu gọn' : 'Mở rộng'}>
          {isExpanded ? (
            <ChevronDown className='h-4 w-4' />
          ) : (
            <ChevronUp className='h-4 w-4' />
          )}
        </Button>

        <div className='absolute right-2 bottom-2 flex gap-1'>
          {/* Saved inputs dropdown */}
          {savedInputs.length > 0 && (
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8'
                        disabled={disabled}>
                        <Sparkles className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mã cược đã lưu</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align='end' className='w-60'>
                {savedInputs.map((savedInput, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => loadSavedInput(savedInput)}>
                    <div className='truncate'>{savedInput}</div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Save current input */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={saveCurrentInput}
                  title='Lưu mã cược'
                  disabled={disabled || !input.trim()}
                  className='h-8 w-8'>
                  <Save className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Lưu mã cược</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Clear chat button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={onClear}
                  title='Xóa lịch sử'
                  disabled={disabled}
                  className='h-8 w-8'>
                  <Eraser className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Xóa lịch sử</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Send button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='submit'
                  size='icon'
                  disabled={!input.trim() || disabled}
                  className='h-8 w-8'>
                  <Send className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gửi mã cược</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Suggestions bar */}
        {showSuggestions && suggestions.length > 0 && (
          <div className='absolute -top-10 left-0 right-0 bg-background border rounded-md p-1 flex items-center gap-1 flex-wrap shadow-md'>
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant='outline'
                size='sm'
                onClick={() => handleSuggestionClick(suggestion)}
                className='h-7 py-0 px-2 text-xs'>
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </div>
    </form>
  )
}

export default ChatInput
