// src/components/bet/BetCodeFilter.jsx
import React, { useState, useEffect } from 'react'
import { useBetCode } from '@/contexts/BetCodeContext'
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
import {
  Search,
  Filter,
  X,
  Calendar,
  DollarSign,
  Building,
  Clock,
  RotateCcw,
} from 'lucide-react'
import { formatMoney } from '@/utils/formatters'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

const BetCodeFilter = () => {
  const { filterCodes, betCodes } = useBetCode()
  const [filters, setFilters] = useState({
    station: 'all',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    searchText: '',
  })
  const [activeFilters, setActiveFilters] = useState([])
  const [searchTimeout, setSearchTimeout] = useState(null)

  // Get unique stations from bet codes
  const stations = [
    ...new Set(betCodes.map((code) => code.station?.name).filter(Boolean)),
  ].sort()

  useEffect(() => {
    // Update active filters for display
    const newActiveFilters = []
    if (filters.station !== 'all')
      newActiveFilters.push({
        key: 'station',
        label: `Đài: ${filters.station}`,
      })
    if (filters.dateFrom)
      newActiveFilters.push({
        key: 'dateFrom',
        label: `Từ: ${formatDate(filters.dateFrom)}`,
      })
    if (filters.dateTo)
      newActiveFilters.push({
        key: 'dateTo',
        label: `Đến: ${formatDate(filters.dateTo)}`,
      })
    if (filters.minAmount)
      newActiveFilters.push({
        key: 'minAmount',
        label: `Tối thiểu: ${formatMoney(filters.minAmount)}đ`,
      })
    if (filters.maxAmount)
      newActiveFilters.push({
        key: 'maxAmount',
        label: `Tối đa: ${formatMoney(filters.maxAmount)}đ`,
      })
    if (filters.searchText)
      newActiveFilters.push({
        key: 'searchText',
        label: `Tìm: ${filters.searchText}`,
      })

    setActiveFilters(newActiveFilters)
  }, [filters])

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

  const handleRemoveFilter = (filterKey) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: '',
    }))

    // Apply updated filters
    const updatedFilters = { ...filters, [filterKey]: '' }
    const processedFilters = {}

    Object.keys(updatedFilters).forEach((key) => {
      if (updatedFilters[key] !== '' && updatedFilters[key] !== undefined) {
        if (key === 'minAmount' || key === 'maxAmount') {
          processedFilters[key] = Number(updatedFilters[key])
        } else {
          processedFilters[key] = updatedFilters[key]
        }
      }
    })

    filterCodes(
      Object.keys(processedFilters).length > 0 ? processedFilters : null
    )
  }

  const handleSearchChange = (e) => {
    const { value } = e.target
    setFilters((prev) => ({ ...prev, searchText: value }))

    // Debounce search to avoid too many filter operations
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeoutId = setTimeout(() => {
      const updatedFilters = { ...filters, searchText: value }
      const processedFilters = {}

      Object.keys(updatedFilters).forEach((key) => {
        if (updatedFilters[key] !== '' && updatedFilters[key] !== undefined) {
          if (key === 'minAmount' || key === 'maxAmount') {
            processedFilters[key] = Number(updatedFilters[key])
          } else {
            processedFilters[key] = updatedFilters[key]
          }
        }
      })

      filterCodes(
        Object.keys(processedFilters).length > 0 ? processedFilters : null
      )
    }, 300)

    setSearchTimeout(timeoutId)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      return format(new Date(dateString), 'dd/MM/yyyy')
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className='space-y-4'>
      {/* Search and active filters */}
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <div className='relative flex-1'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Tìm mã cược...'
              name='searchText'
              value={filters.searchText}
              onChange={handleSearchChange}
              className='pl-9'
            />
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={handleClearFilter}
            disabled={activeFilters.length === 0}
            className='h-10 whitespace-nowrap'>
            <RotateCcw className='h-3.5 w-3.5 mr-1.5' />
            Xóa bộ lọc
          </Button>
        </div>

        {activeFilters.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {activeFilters.map((filter, index) => (
              <Badge
                key={index}
                variant='secondary'
                className='px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100'>
                {filter.label}
                <button
                  className='ml-1.5 hover:text-blue-900'
                  onClick={() => handleRemoveFilter(filter.key)}>
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Advanced filters */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {/* Station filter */}
        <div className='space-y-1.5'>
          <Label
            htmlFor='station'
            className='flex items-center text-sm gap-1.5'>
            <Building className='h-3.5 w-3.5 text-muted-foreground' />
            Đài
          </Label>
          <Select
            value={filters.station}
            onValueChange={(value) => handleSelectChange('station', value)}>
            <SelectTrigger>
              <SelectValue placeholder='Tất cả đài' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả đài</SelectItem>
              {stations.map((station) => (
                <SelectItem key={station} value={station}>
                  {station}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date range filters */}
        <div className='space-y-1.5'>
          <Label
            htmlFor='dateFrom'
            className='flex items-center text-sm gap-1.5'>
            <Calendar className='h-3.5 w-3.5 text-muted-foreground' />
            Từ ngày
          </Label>
          <Input
            type='date'
            id='dateFrom'
            name='dateFrom'
            value={filters.dateFrom}
            onChange={handleChange}
          />
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='dateTo' className='flex items-center text-sm gap-1.5'>
            <Calendar className='h-3.5 w-3.5 text-muted-foreground' />
            Đến ngày
          </Label>
          <Input
            type='date'
            id='dateTo'
            name='dateTo'
            value={filters.dateTo}
            onChange={handleChange}
          />
        </div>

        {/* Amount range filters */}
        <div className='space-y-1.5'>
          <Label
            htmlFor='minAmount'
            className='flex items-center text-sm gap-1.5'>
            <DollarSign className='h-3.5 w-3.5 text-muted-foreground' />
            Tiền cược từ
          </Label>
          <Input
            type='number'
            id='minAmount'
            name='minAmount'
            value={filters.minAmount}
            onChange={handleChange}
            placeholder='Nhập số tiền tối thiểu'
          />
        </div>

        <div className='space-y-1.5'>
          <Label
            htmlFor='maxAmount'
            className='flex items-center text-sm gap-1.5'>
            <DollarSign className='h-3.5 w-3.5 text-muted-foreground' />
            Tiền cược đến
          </Label>
          <Input
            type='number'
            id='maxAmount'
            name='maxAmount'
            value={filters.maxAmount}
            onChange={handleChange}
            placeholder='Nhập số tiền tối đa'
          />
        </div>

        <div className='flex items-end space-x-2'>
          <Button
            variant='default'
            onClick={handleApplyFilter}
            className='flex-1'>
            <Filter className='h-3.5 w-3.5 mr-1.5' />
            Áp dụng
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BetCodeFilter
