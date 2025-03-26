import React, { useState, useEffect } from 'react'
import { useVerification } from '@/hooks/useVerification'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { toast } from 'sonner'

const AdminBetCodeVerificationPage = () => {
  const { loading, verifyAllBetCodes, isAfter4PM, fetchUnverifiedBetCodes } =
    useVerification()
  const [unverifiedBetCodes, setUnverifiedBetCodes] = useState([])

  useEffect(() => {
    const loadUnverifiedBetCodes = async () => {
      try {
        const codes = await fetchUnverifiedBetCodes()
        setUnverifiedBetCodes(codes)
      } catch (error) {
        toast.error('Lỗi khi tải mã cược chưa đối soát')
      }
    }

    loadUnverifiedBetCodes()
  }, [fetchUnverifiedBetCodes])

  const handleVerifyAll = async () => {
    if (!isAfter4PM()) {
      toast.error('Chỉ có thể đối soát tất cả sau 16h')
      return
    }

    const result = await verifyAllBetCodes()
    if (result.success) {
      // Tải lại danh sách sau khi đối soát
      const codes = await fetchUnverifiedBetCodes()
      setUnverifiedBetCodes(codes)
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Đối soát kết quả</h1>
        <Button
          onClick={handleVerifyAll}
          disabled={
            loading || !isAfter4PM() || unverifiedBetCodes.length === 0
          }>
          {loading ? 'Đang đối soát...' : 'Đối soát tất cả'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách mã cược chưa đối soát</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='text-center py-4'>Đang tải...</div>
          ) : unverifiedBetCodes.length === 0 ? (
            <div className='text-center py-4'>
              Không có mã cược nào cần đối soát
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unverifiedBetCodes.map((betCode) => (
                  <TableRow key={betCode.id}>
                    <TableCell>{betCode.id}</TableCell>
                    <TableCell>{betCode.userId}</TableCell>
                    <TableCell>{betCode.content}</TableCell>
                    <TableCell>
                      {format(new Date(betCode.createdAt), 'HH:mm dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button size='sm' variant='outline'>
                        Đối soát
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className='justify-between'>
          <div>
            <span className='text-sm text-muted-foreground'>
              Tổng cộng: {unverifiedBetCodes.length} mã cược
            </span>
          </div>
          <div>
            {!isAfter4PM() && (
              <span className='text-sm text-yellow-500'>
                Chức năng đối soát tất cả chỉ khả dụng sau 16h
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default AdminBetCodeVerificationPage
