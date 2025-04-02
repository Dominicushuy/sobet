// src/components/bet/BetCodeList.jsx
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useBetCode } from '@/contexts/BetCodeContext'
import {
  Save,
  AlertTriangle,
  BarChart2,
  Check,
  Filter,
  CircleSlash,
  Loader2,
  PanelTopClose,
  PanelTopOpen,
} from 'lucide-react'
import BetCodeCard from './BetCodeCard'
import BetCodeFilter from './BetCodeFilter'
import MultipleActionsButton from './MultipleActionsButton'
import { formatMoney } from '@/utils/formatters'
import { cn } from '@/lib/utils'

const BetCodeList = () => {
  const {
    betCodes,
    draftCodes,
    getFilteredCodes,
    confirmDraftCodes,
    isInitialized,
    getStatistics,
    getFilteredStatistics, // Add the new function
  } = useBetCode()

  // State cho chọn nhiều
  const [selectedIds, setSelectedIds] = useState([])
  const [selectMode, setSelectMode] = useState(false)
  const [filterOpen, setFilterOpen] = useState(true)

  // Lấy các mã cược đã lọc
  const filteredCodes = getFilteredCodes()

  // Lấy thống kê cho tất cả mã cược
  const stats = getStatistics()

  // Lấy thống kê cho mã cược đã lọc
  const filteredStats = getFilteredStatistics(filteredCodes)

  console.log({ stats, filteredStats })

  // Toggle select mode
  const toggleSelectMode = () => {
    setSelectMode(!selectMode)
    setSelectedIds([])
  }

  // Toggle chọn một mã cược
  const toggleSelectBetCode = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    )
  }

  // Chọn tất cả
  const selectAll = () => {
    const allIds = [
      ...filteredCodes.map((code) => code.id),
      ...draftCodes.map((code) => code.id),
    ]
    setSelectedIds(allIds)
  }

  // Bỏ chọn tất cả
  const clearSelection = () => {
    setSelectedIds([])
  }

  // Hiển thị thông báo đang tải
  if (!isInitialized) {
    return (
      <div className='flex flex-col h-full bg-white rounded-md shadow-sm'>
        <div className='p-4 border-b'>
          <h2 className='text-lg font-bold'>Mã cược</h2>
        </div>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-primary' />
            <p className='text-muted-foreground'>Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full bg-white rounded-md shadow-sm'>
      <div className='p-4 border-b flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-bold'>Mã cược</h2>
          <div className='flex space-x-1'>
            <span className='text-xs text-white bg-primary px-2 py-0.5 rounded-full'>
              {betCodes.length} đã lưu
            </span>
            {draftCodes.length > 0 && (
              <span className='text-xs text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full'>
                {draftCodes.length} nháp
              </span>
            )}
          </div>
        </div>

        <div className='flex gap-1.5'>
          {selectMode ? (
            <>
              <Button
                variant='outline'
                size='sm'
                onClick={selectAll}
                className='h-8'>
                <Check className='h-3.5 w-3.5 mr-1' />
                Chọn tất cả
              </Button>

              <MultipleActionsButton
                selectedIds={selectedIds}
                onClearSelection={clearSelection}
              />

              <Button
                variant='outline'
                size='sm'
                onClick={toggleSelectMode}
                className='h-8'>
                <CircleSlash className='h-3.5 w-3.5 mr-1' />
                Hủy
              </Button>
            </>
          ) : (
            <>
              <Button
                variant='outline'
                size='sm'
                onClick={toggleSelectMode}
                className='h-8'>
                Chọn nhiều
              </Button>

              <Button
                onClick={confirmDraftCodes}
                disabled={draftCodes.length === 0}
                className='flex items-center gap-1.5 h-8 bg-primary-600 hover:bg-primary-700'>
                <Save className='h-3.5 w-3.5' />
                {draftCodes.length > 0 && `Lưu (${draftCodes.length})`}
                {draftCodes.length === 0 && 'Lưu tất cả'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className='px-4 py-3 border-b bg-muted/20'>
        <div className='flex items-center justify-between mb-2'>
          <div className='text-sm font-medium flex items-center gap-1.5'>
            <Filter className='h-4 w-4 text-muted-foreground' />
            Tìm kiếm
            <Button
              variant='ghost'
              size='sm'
              className='h-6 px-1.5'
              onClick={() => setFilterOpen(!filterOpen)}>
              {filterOpen ? (
                <PanelTopClose className='h-4 w-4' />
              ) : (
                <PanelTopOpen className='h-4 w-4' />
              )}
            </Button>
          </div>

          <div className='flex items-center gap-4 text-sm'>
            <div className='flex items-center gap-1.5'>
              <span className='text-muted-foreground'>Tổng tiền đóng:</span>
              <span className='font-medium text-blue-600'>
                {formatMoney(
                  filteredCodes.length > 0
                    ? filteredStats.totalStake
                    : stats.totalStake
                )}
                đ
              </span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='text-muted-foreground'>Tiềm năng thắng:</span>
              <span className='font-medium text-green-600'>
                {formatMoney(
                  filteredCodes.length > 0
                    ? filteredStats.totalPotential
                    : stats.totalPotential
                )}
                đ
              </span>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'transition-all duration-200',
            filterOpen
              ? 'max-h-96 opacity-100'
              : 'max-h-0 opacity-0 overflow-hidden'
          )}>
          <BetCodeFilter />
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {draftCodes.length > 0 && (
          <div className='bg-yellow-50 p-3 rounded-md flex items-center gap-2 text-yellow-800 border border-yellow-200'>
            <AlertTriangle className='h-4 w-4 text-yellow-600 shrink-0' />
            <span className='text-sm'>
              Bạn có {draftCodes.length} mã cược chưa lưu. Nhấn nút{' '}
              <strong>Lưu</strong> để xác nhận.
            </span>
          </div>
        )}

        {betCodes.length === 0 && draftCodes.length === 0 ? (
          <div className='text-center py-12 text-muted-foreground'>
            <div className='flex justify-center mb-4'>
              <CircleSlash className='h-12 w-12 text-muted-foreground/50' />
            </div>
            <p className='text-lg font-medium mb-1'>Chưa có mã cược nào</p>
            <p className='text-sm'>
              Nhập mã cược trong chat để thêm mã cược mới
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {/* Hiển thị các mã nháp trước */}
            {draftCodes.length > 0 && (
              <div className='space-y-3'>
                <h3 className='text-sm font-medium text-yellow-700 flex items-center gap-1.5'>
                  <AlertTriangle className='h-3.5 w-3.5' />
                  Mã cược nháp
                </h3>
                <div className='grid grid-cols-1 gap-3'>
                  {draftCodes.map((code) => (
                    <BetCodeCard
                      key={code.id}
                      betCode={code}
                      isDraft={true}
                      selectable={selectMode}
                      selected={selectedIds.includes(code.id)}
                      onSelectChange={() => toggleSelectBetCode(code.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Hiển thị các mã đã lưu */}
            {filteredCodes.length > 0 && (
              <div className='space-y-3'>
                {draftCodes.length > 0 && (
                  <h3 className='text-sm font-medium text-muted-foreground flex items-center gap-1.5'>
                    <Check className='h-3.5 w-3.5' />
                    Mã cược đã lưu
                  </h3>
                )}
                <div className='grid grid-cols-1 gap-3'>
                  {filteredCodes.map((code) => (
                    <BetCodeCard
                      key={code.id}
                      betCode={code}
                      selectable={selectMode}
                      selected={selectedIds.includes(code.id)}
                      onSelectChange={() => toggleSelectBetCode(code.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {betCodes.length > 0 && filteredCodes.length === 0 && (
              <div className='text-center py-12 text-muted-foreground'>
                <div className='flex justify-center mb-4'>
                  <Filter className='h-10 w-10 text-muted-foreground/50' />
                </div>
                <p className='text-lg font-medium mb-1'>
                  Không tìm thấy mã cược
                </p>
                <p className='text-sm'>
                  Không có mã cược nào phù hợp với từ khóa tìm kiếm
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  className='mt-4'
                  onClick={() => setFilterOpen(true)}>
                  Điều chỉnh tìm kiếm
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BetCodeList
