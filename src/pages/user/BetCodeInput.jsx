import React from 'react'
import ChatInterface from '@/components/chat/ChatInterface'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Info, HelpCircle, ListPlus } from 'lucide-react'

const BetCodeInputPage = () => {
  const exampleBetCodes = [
    { label: 'Đầu đuôi', code: 'vl 23 45 67 dd10' },
    { label: 'Xỉu chủ (ba càng)', code: 'mb 123 456 xc5' },
    { label: 'Bao lô 2 số', code: 'ct 12 34 56 b10' },
    { label: 'Đài miền Nam', code: '2dmn 45 67 89 dau20' },
  ]

  const copyExample = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        // The clipboard API success doesn't need a toast because we'll use it right away
      })
      .catch((error) => {
        console.error('Lỗi khi sao chép:', error)
      })
  }

  return (
    <div className='container py-6'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <Card className='h-[75vh] flex flex-col'>
            <CardHeader>
              <CardTitle className='flex justify-between items-center'>
                <span>Nhập mã cược</span>
                <Button variant='outline' size='sm'>
                  <ListPlus className='h-4 w-4 mr-2' />
                  Tạo mới
                </Button>
              </CardTitle>
              <CardDescription>
                Nhập mã cược để phân tích, kiểm tra lỗi và tính toán tiền cược
              </CardDescription>
            </CardHeader>
            <CardContent className='flex-1 p-0 overflow-hidden'>
              <ChatInterface />
            </CardContent>
          </Card>
        </div>

        <div>
          <Tabs defaultValue='examples'>
            <TabsList className='grid grid-cols-2 mb-4'>
              <TabsTrigger value='examples'>
                <ListPlus className='h-4 w-4 mr-2' />
                Ví dụ
              </TabsTrigger>
              <TabsTrigger value='help'>
                <HelpCircle className='h-4 w-4 mr-2' />
                Trợ giúp
              </TabsTrigger>
            </TabsList>

            <TabsContent value='examples'>
              <Card>
                <CardHeader>
                  <CardTitle>Ví dụ mã cược</CardTitle>
                  <CardDescription>
                    Click vào các ví dụ để sao chép
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {exampleBetCodes.map((example, index) => (
                    <div
                      key={index}
                      className='border rounded-md p-3 hover:bg-accent/50 cursor-pointer transition-colors'
                      onClick={() => copyExample(example.code)}>
                      <div className='font-medium text-sm mb-1'>
                        {example.label}
                      </div>
                      <code className='text-xs bg-accent p-1 rounded'>
                        {example.code}
                      </code>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='help'>
              <Card>
                <CardHeader>
                  <CardTitle>Hướng dẫn cú pháp</CardTitle>
                  <CardDescription>Cách viết mã cược chuẩn</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4 text-sm'>
                  <div className='space-y-2'>
                    <div className='font-medium'>Cấu trúc cơ bản:</div>
                    <code className='block bg-accent p-2 rounded'>
                      [Đài] [Số] [Kiểu cược][Tiền cược]
                    </code>
                    <p className='text-muted-foreground text-xs'>
                      Ví dụ: mb 45 67 dd10
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <div className='font-medium'>Đài nhiều miền:</div>
                    <code className='block bg-accent p-2 rounded'>
                      [Số lượng đài][Mã miền] [Số] [Kiểu cược][Tiền cược]
                    </code>
                    <p className='text-muted-foreground text-xs'>
                      Ví dụ: 2dmn 12 34 56 b10
                    </p>
                  </div>

                  <div className='flex items-center text-xs p-2 border rounded-md bg-primary/5'>
                    <Info className='h-4 w-4 mr-2 text-primary' />
                    <span>
                      Bot sẽ tự động phát hiện và sửa các lỗi thông thường trong
                      mã cược của bạn.
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default BetCodeInputPage
