import React, { useState } from 'react'
import { useLotteryResults } from '@/hooks/useLotteryResults'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { toast } from 'sonner'

const LotteryResultsPage = () => {
  const {
    results,
    loading,
    importLatestResults,
    importResultsFromJson,
    cleanup,
  } = useLotteryResults()

  const [jsonContent, setJsonContent] = useState('')

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result)
          setJsonContent(json)
          toast.success('File JSON đã được đọc thành công')
        } catch (error) {
          toast.error('Lỗi khi đọc file JSON')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleImportJson = () => {
    if (jsonContent) {
      importResultsFromJson(jsonContent)
    } else {
      toast.error('Vui lòng chọn file JSON hợp lệ trước')
    }
  }

  // Tối ưu hiển thị tiền
  const getRegionName = (region) => {
    switch (region) {
      case 'north':
        return 'Miền Bắc'
      case 'central':
        return 'Miền Trung'
      case 'south':
        return 'Miền Nam'
      default:
        return region
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Quản lý kết quả xổ số</h1>
      </div>

      <Tabs defaultValue='view'>
        <TabsList>
          <TabsTrigger value='view'>Xem kết quả</TabsTrigger>
          <TabsTrigger value='import'>Nhập kết quả</TabsTrigger>
        </TabsList>

        <TabsContent value='view' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Danh sách kết quả xổ số</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='text-center py-4'>Đang tải...</div>
              ) : results.length === 0 ? (
                <div className='text-center py-4'>
                  Chưa có dữ liệu kết quả xổ số
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Miền</TableHead>
                      <TableHead>Tỉnh/Thành</TableHead>
                      <TableHead>Giải đặc biệt</TableHead>
                      <TableHead>Thời gian nhập</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          {format(new Date(result.date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>{getRegionName(result.region)}</TableCell>
                        <TableCell>{result.station}</TableCell>
                        <TableCell>
                          {result.results.special?.join(', ') || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {result.importedAt
                            ? format(
                                new Date(result.importedAt),
                                'HH:mm dd/MM/yyyy'
                              )
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='import' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Nhập kết quả xổ số</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <h3 className='font-medium'>Nhập tự động</h3>
                <Button
                  onClick={() => importLatestResults()}
                  disabled={loading}>
                  {loading ? 'Đang nhập...' : 'Nhập kết quả mới nhất'}
                </Button>
              </div>

              <div className='space-y-2'>
                <h3 className='font-medium'>Nhập từ file JSON</h3>
                <div className='flex flex-col space-y-2'>
                  <input
                    type='file'
                    accept='.json'
                    onChange={handleFileUpload}
                    className='w-full'
                  />
                  <Button
                    onClick={handleImportJson}
                    disabled={loading || !jsonContent}>
                    {loading ? 'Đang nhập...' : 'Nhập từ JSON'}
                  </Button>
                </div>
              </div>

              <div className='space-y-2'>
                <h3 className='font-medium'>Dọn dẹp dữ liệu</h3>
                <div className='flex space-x-2'>
                  <Button
                    variant='destructive'
                    onClick={() => cleanup(7)}
                    disabled={loading}>
                    Xóa dữ liệu cũ (7 ngày)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LotteryResultsPage
