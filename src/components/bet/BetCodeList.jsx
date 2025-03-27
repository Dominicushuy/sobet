// src/components/bet/BetCodeList.jsx
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useBetCode } from '@/contexts/BetCodeContext'
import { Save, AlertTriangle, BarChart2, Check } from 'lucide-react'
import BetCodeCard from './BetCodeCard'
import BetCodeFilter from './BetCodeFilter'
import BetCodeStats from './BetCodeStats'
import MultipleActionsButton from './MultipleActionsButton'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'

const BetCodeList = () => {
  const {
    betCodes,
    draftCodes,
    getFilteredCodes,
    confirmDraftCodes,
    isInitialized,
  } = useBetCode()

  // State cho chọn nhiều
  const [selectedIds, setSelectedIds] = useState([])
  const [selectMode, setSelectMode] = useState(false)

  // Lấy các mã cược đã lọc
  const filteredCodes = getFilteredCodes()

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
      <div className='flex flex-col h-full'>
        <div className='p-4 border-b'>
          <h2 className='text-lg font-bold'>Mã cược</h2>
        </div>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
            <p className='text-muted-foreground'>Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='p-4 border-b flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-bold'>Mã cược</h2>
          <span className='text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full'>
            {betCodes.length} đã lưu
          </span>
          {draftCodes.length > 0 && (
            <span className='text-xs text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full'>
              {draftCodes.length} nháp
            </span>
          )}
        </div>

        <div className='flex gap-2'>
          {selectMode ? (
            <>
              <Button variant='outline' size='sm' onClick={selectAll}>
                <Check className='h-4 w-4 mr-1' />
                Chọn tất cả
              </Button>

              <MultipleActionsButton
                selectedIds={selectedIds}
                onClearSelection={clearSelection}
              />

              <Button variant='outline' size='sm' onClick={toggleSelectMode}>
                Hủy
              </Button>
            </>
          ) : (
            <>
              <Button variant='outline' size='sm' onClick={toggleSelectMode}>
                Chọn nhiều
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <BarChart2 className='h-4 w-4 mr-1' />
                    Thống kê
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-80'>
                  <BetCodeStats />
                </PopoverContent>
              </Popover>

              <Button
                onClick={confirmDraftCodes}
                disabled={draftCodes.length === 0}
                className='flex items-center gap-2'>
                <Save className='h-4 w-4' />
                Lưu ({draftCodes.length})
              </Button>
            </>
          )}
        </div>
      </div>

      <div className='p-4 border-b'>
        <BetCodeFilter />
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {draftCodes.length > 0 && (
          <div className='bg-yellow-50 p-3 rounded-md flex items-center gap-2 text-yellow-800 text-sm'>
            <AlertTriangle className='h-4 w-4 text-yellow-600' />
            <span>
              Bạn có {draftCodes.length} mã cược chưa lưu. Nhấn nút{' '}
              <strong>Lưu</strong> để xác nhận.
            </span>
          </div>
        )}

        {betCodes.length === 0 && draftCodes.length === 0 ? (
          <div className='text-center py-8 text-muted-foreground'>
            Chưa có mã cược nào. Nhập mã cược trong chat để thêm.
          </div>
        ) : (
          <div className='space-y-4'>
            {/* Hiển thị các mã nháp trước */}
            {draftCodes.length > 0 && (
              <div className='space-y-4'>
                <h3 className='text-sm font-medium text-muted-foreground'>
                  Mã cược nháp
                </h3>
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
            )}

            {/* Hiển thị các mã đã lưu */}
            {filteredCodes.length > 0 && (
              <div className='space-y-4'>
                {draftCodes.length > 0 && (
                  <h3 className='text-sm font-medium text-muted-foreground'>
                    Mã cược đã lưu
                  </h3>
                )}
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
            )}

            {betCodes.length > 0 && filteredCodes.length === 0 && (
              <div className='text-center py-8 text-muted-foreground'>
                Không tìm thấy mã cược nào phù hợp với bộ lọc.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BetCodeList
