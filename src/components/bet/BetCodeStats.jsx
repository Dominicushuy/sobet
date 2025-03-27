// src/components/bet/BetCodeStats.jsx
import React from 'react'
import { useBetCode } from '@/contexts/BetCodeContext'
import { formatMoney } from '@/utils/formatters'
import {
  BarChart2,
  Building,
  DollarSign,
  Award,
  Hash,
  FileText,
  Percent,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'

const BetCodeStats = () => {
  const { getStatistics } = useBetCode()
  const stats = getStatistics()

  // Calculate the win ratio
  const winRatio =
    stats.totalStake > 0
      ? ((stats.totalPotential / stats.totalStake) * 100).toFixed(1)
      : 0

  // Get top 5 stations by count
  const topStations = Object.entries(stats.stationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Find max count for progress bar scaling
  const maxStationCount = topStations.length > 0 ? topStations[0][1] : 1

  return (
    <div className='space-y-5'>
      <div className='flex items-center gap-2'>
        <BarChart2 className='h-5 w-5 text-primary' />
        <h3 className='font-semibold text-lg'>Thống kê mã cược</h3>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div className='bg-blue-50 p-3 rounded-lg border border-blue-100'>
          <div className='flex items-center gap-1.5 text-blue-700 mb-1.5'>
            <Hash className='h-4 w-4' />
            <div className='text-sm font-medium'>Tổng mã cược</div>
          </div>
          <div className='flex items-baseline gap-2'>
            <div className='font-semibold text-2xl text-blue-800'>
              {stats.totalBetCodes}
            </div>
            {stats.totalDraftCodes > 0 && (
              <div className='text-xs text-blue-600'>
                ({stats.totalDraftCodes} nháp)
              </div>
            )}
          </div>
        </div>

        <div className='bg-green-50 p-3 rounded-lg border border-green-100'>
          <div className='flex items-center gap-1.5 text-green-700 mb-1.5'>
            <Percent className='h-4 w-4' />
            <div className='text-sm font-medium'>Tỉ lệ thắng</div>
          </div>
          <div className='font-semibold text-2xl text-green-800'>
            {winRatio}x
          </div>
        </div>
      </div>

      <div className='space-y-3'>
        <div className='bg-indigo-50 p-3 rounded-lg border border-indigo-100'>
          <div className='flex items-center gap-1.5 text-indigo-700 mb-1.5'>
            <DollarSign className='h-4 w-4' />
            <div className='text-sm font-medium'>Tổng tiền cược</div>
          </div>
          <div className='font-semibold text-xl text-indigo-800'>
            {formatMoney(stats.totalStake)}đ
          </div>
          <div className='text-xs text-indigo-600 mt-0.5'>
            Tương đương {formatMoney(stats.totalStake / 0.8)}đ tiền đặt
          </div>
        </div>

        <div className='bg-amber-50 p-3 rounded-lg border border-amber-100'>
          <div className='flex items-center gap-1.5 text-amber-700 mb-1.5'>
            <Award className='h-4 w-4' />
            <div className='text-sm font-medium'>Tiềm năng thắng</div>
          </div>
          <div className='font-semibold text-xl text-amber-800'>
            {formatMoney(stats.totalPotential)}đ
          </div>
        </div>
      </div>

      {topStations.length > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center gap-1.5 text-gray-700'>
            <Building className='h-4 w-4' />
            <h4 className='text-sm font-medium'>Thống kê theo đài</h4>
          </div>

          <div className='space-y-2.5 max-h-48 overflow-y-auto pr-1'>
            {topStations.map(([station, count]) => (
              <div key={station} className='space-y-1'>
                <div className='flex justify-between text-sm'>
                  <span className='font-medium truncate' title={station}>
                    {station.length > 20
                      ? station.substring(0, 17) + '...'
                      : station}
                  </span>
                  <span className='text-muted-foreground'>{count}</span>
                </div>
                <Progress
                  value={(count / maxStationCount) * 100}
                  className='h-1.5'
                />
              </div>
            ))}
          </div>

          {Object.keys(stats.stationCounts).length > 5 && (
            <div className='text-xs text-muted-foreground text-right pt-1'>
              +{Object.keys(stats.stationCounts).length - 5} đài khác
            </div>
          )}
        </div>
      )}

      <div className='flex justify-center pt-1'>
        <button className='text-xs flex items-center text-primary hover:text-primary/80 hover:underline'>
          <FileText className='h-3 w-3 mr-1' />
          Xuất báo cáo chi tiết
        </button>
      </div>
    </div>
  )
}

export default BetCodeStats
