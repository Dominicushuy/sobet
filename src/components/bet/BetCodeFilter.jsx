// src/components/bet/BetCodeFilter.jsx
import React, { useState } from 'react'
import { useBetCode } from '@/contexts/BetCodeContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

const BetCodeFilter = () => {
  const { filterCodes } = useBetCode()
  const [searchText, setSearchText] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const { value } = e.target
    setSearchText(value)

    // Debounce search to avoid too many filter operations
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeoutId = setTimeout(() => {
      if (value.trim() === '') {
        filterCodes(null) // Clear filter if search is empty
      } else {
        filterCodes({ searchText: value })
      }
    }, 300)

    setSearchTimeout(timeoutId)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchText('')
    filterCodes(null)
    toast.success('Đã xóa tìm kiếm')
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            type='text'
            placeholder='Tìm mã cược...'
            value={searchText}
            onChange={handleSearchChange}
            className='pl-9'
          />
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={handleClearSearch}
          disabled={!searchText}
          className='h-10 whitespace-nowrap'>
          <RotateCcw className='h-3.5 w-3.5 mr-1.5' />
          Xóa tìm kiếm
        </Button>
      </div>
    </div>
  )
}

export default BetCodeFilter
