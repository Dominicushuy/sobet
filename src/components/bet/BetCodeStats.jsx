// src/components/bet/BetCodeStats.jsx
import React from 'react'
import { useBetCode } from '@/contexts/BetCodeContext'
import { formatMoney } from '@/utils/formatters'

const BetCodeStats = () => {
  const { getStatistics } = useBetCode()
  const stats = getStatistics()

  return (
    <div className='space-y-3'>
      <h3 className='font-semibold'>Thống kê mã cược</h3>

      <div className='grid grid-cols-2 gap-2 text-sm'>
        <div className='bg-muted p-2 rounded'>
          <div className='text-muted-foreground'>Tổng mã cược</div>
          <div className='font-medium text-lg'>{stats.totalBetCodes}</div>
        </div>

        <div className='bg-muted p-2 rounded'>
          <div className='text-muted-foreground'>Mã nháp</div>
          <div className='font-medium text-lg'>{stats.totalDraftCodes}</div>
        </div>

        <div className='bg-green-50 p-2 rounded col-span-2'>
          <div className='text-green-700'>Tổng tiền cược</div>
          <div className='font-medium text-lg text-green-800'>
            {formatMoney(stats.totalStake)}đ
          </div>
        </div>

        <div className='bg-blue-50 p-2 rounded col-span-2'>
          <div className='text-blue-700'>Tiềm năng thắng</div>
          <div className='font-medium text-lg text-blue-800'>
            {formatMoney(stats.totalPotential)}đ
          </div>
        </div>
      </div>

      {Object.keys(stats.stationCounts).length > 0 && (
        <div className='mt-2'>
          <h4 className='text-sm font-medium mb-1'>Theo đài</h4>
          <div className='space-y-1 max-h-40 overflow-y-auto text-sm'>
            {Object.entries(stats.stationCounts).map(([station, count]) => (
              <div key={station} className='flex justify-between'>
                <span>{station}</span>
                <span className='font-medium'>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default BetCodeStats
