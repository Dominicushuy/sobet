// src/components/bet/BetCodeFilter.jsx
import React, { useState } from 'react'
import { useBetCode } from '@/contexts/BetCodeContext'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, X } from 'lucide-react'

const BetCodeFilter = () => {
  const { filterCodes, betCodes } = useBetCode()
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState({
    station: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    searchText: '',
  })

  // Get unique stations from bet codes
  const stations = [
    ...new Set(betCodes.map((code) => code.station?.name).filter(Boolean)),
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleApplyFilter = () => {
    // Convert numeric values
    const processedFilters = {
      ...filters,
      minAmount: filters.minAmount ? Number(filters.minAmount) : undefined,
      maxAmount: filters.maxAmount ? Number(filters.maxAmount) : undefined,
    }

    // Remove empty values
    Object.keys(processedFilters).forEach((key) => {
      if (processedFilters[key] === '' || processedFilters[key] === undefined) {
        delete processedFilters[key]
      }
    })

    filterCodes(
      Object.keys(processedFilters).length > 0 ? processedFilters : null
    )
  }

  const handleClearFilter = () => {
    setFilters({
      station: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      searchText: '',
    })
    filterCodes(null)
  }

  const handleQuickSearch = (e) => {
    e.preventDefault()
    if (filters.searchText.trim()) {
      filterCodes({ searchText: filters.searchText.trim() })
    } else {
      filterCodes(null)
    }
  }

  return (
    <div>
      <div className='flex items-center mb-2'>
        <form onSubmit={handleQuickSearch} className='flex-1 flex space-x-2'>
          <Input
            type='text'
            placeholder='Tìm kiếm...'
            name='searchText'
            value={filters.searchText}
            onChange={handleChange}
            className='flex-1'
          />
          <Button type='submit' size='sm' variant='outline'>
            <Search className='h-4 w-4' />
          </Button>
        </form>
        <Button
          variant='ghost'
          size='sm'
          className='ml-2'
          onClick={() => setIsExpanded(!isExpanded)}>
          <Filter className='h-4 w-4 mr-1' />
          {isExpanded ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
        </Button>
      </div>

      {isExpanded && (
        <Card className='mb-4'>
          <CardContent className='pt-4 pb-2'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <Label htmlFor='station'>Đài</Label>
                <Select
                  value={filters.station}
                  onValueChange={(value) =>
                    handleSelectChange('station', value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder='Tất cả đài' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=''>Tất cả đài</SelectItem>
                    {stations.map((station) => (
                      <SelectItem key={station} value={station}>
                        {station}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='dateFrom'>Từ ngày</Label>
                <Input
                  type='date'
                  id='dateFrom'
                  name='dateFrom'
                  value={filters.dateFrom}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor='dateTo'>Đến ngày</Label>
                <Input
                  type='date'
                  id='dateTo'
                  name='dateTo'
                  value={filters.dateTo}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor='minAmount'>Tiền cược từ</Label>
                <Input
                  type='number'
                  id='minAmount'
                  name='minAmount'
                  value={filters.minAmount}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor='maxAmount'>Tiền cược đến</Label>
                <Input
                  type='number'
                  id='maxAmount'
                  name='maxAmount'
                  value={filters.maxAmount}
                  onChange={handleChange}
                />
              </div>

              <div className='flex items-end space-x-2'>
                <Button
                  variant='default'
                  onClick={handleApplyFilter}
                  className='flex-1'>
                  Áp dụng
                </Button>
                <Button variant='outline' onClick={handleClearFilter}>
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BetCodeFilter
