import React from 'react'
import { Button } from '@/components/ui/button'
import { useBetCode } from '@/contexts/BetCodeContext'
import { Save } from 'lucide-react'

const BetCodeList = () => {
  const { betCodes, draftCodes, confirmDraftCodes } = useBetCode()

  const allCodes = [...betCodes, ...draftCodes]

  return (
    <div className='flex flex-col h-full'>
      <div className='p-4 border-b flex justify-between items-center'>
        <h2 className='text-lg font-bold'>Mã cược</h2>
        <Button
          onClick={confirmDraftCodes}
          disabled={draftCodes.length === 0}
          className='flex items-center gap-2'>
          <Save className='h-4 w-4' />
          Lưu ({draftCodes.length})
        </Button>
      </div>

      <div className='flex-1 overflow-y-auto p-4'>
        {allCodes.length === 0 ? (
          <div className='text-center py-8 text-muted-foreground'>
            Chưa có mã cược nào. Nhập mã cược trong chat để thêm.
          </div>
        ) : (
          <div className='space-y-4'>
            {allCodes.map((code) => (
              <div
                key={code.id}
                className={`p-4 border rounded-md ${
                  code.isDraft
                    ? 'border-dashed border-yellow-500'
                    : 'border-solid'
                }`}>
                <div className='font-medium'>
                  {code.station?.name || 'Đài không xác định'}
                  {code.isDraft && (
                    <span className='ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full'>
                      Bản nháp
                    </span>
                  )}
                </div>
                <div className='text-sm mt-2 text-muted-foreground'>
                  {code.originalText || 'Không có nội dung'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BetCodeList
