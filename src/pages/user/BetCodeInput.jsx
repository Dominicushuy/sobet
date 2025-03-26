import React, { useState, useEffect } from 'react'
import ChatInterface from '@/components/chat/ChatInterface'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Info,
  HelpCircle,
  ListPlus,
  Copy,
  Search,
  Plus,
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Settings,
  Star,
  StarOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { useBetCodes } from '@/hooks/useBetCodes'
import { format } from 'date-fns'

const BetCodeInputPage = () => {
  const [activeTab, setActiveTab] = useState('examples')
  const [showPanel, setShowPanel] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [recentBetCodes, setRecentBetCodes] = useState([])
  const [favorites, setFavorites] = useState([])
  const [newCodeDialogOpen, setNewCodeDialogOpen] = useState(false)
  const [newCodeContent, setNewCodeContent] = useState('')
  const { fetchUserBetCodes } = useBetCodes()

  // Popular example bet codes
  const exampleBetCodes = [
    {
      label: 'Đầu đuôi',
      code: 'vl 23 45 67 dd10',
      description: 'Đặt cược đầu đuôi với 3 số khác nhau',
    },
    {
      label: 'Xỉu chủ (ba càng)',
      code: 'mb 123 456 xc5',
      description: 'Đặt ba càng (3 số) tại miền Bắc',
    },
    {
      label: 'Bao lô 2 số',
      code: 'ct 12 34 56 b10',
      description: 'Bao lô 3 số 2 chữ số tại Cần Thơ',
    },
    {
      label: 'Đài miền Nam',
      code: '2dmn 45 67 89 dau20',
      description: 'Đặt cược đầu với 2 đài miền Nam',
    },
    {
      label: 'Đánh dàn số',
      code: 'tg 10/20keo90 dd15',
      description: 'Đánh dàn số với kéo (dãy từ 10-90 bước 10)',
    },
    {
      label: 'Đánh chẵn lẻ',
      code: 'bd chanchan dd20',
      description: 'Đánh tất cả số chẵn chẵn tại Bình Dương',
    },
  ]

  // Common bet types with short description
  const betTypeGuides = [
    {
      type: 'Đầu Đuôi (dd)',
      syntax: '[đài] [số] dd[tiền]',
      example: 'vl 23 45 dd10',
      description: 'Đánh cả đầu (số giải 8) và đuôi (số giải đặc biệt)',
    },
    {
      type: 'Bao Lô (b)',
      syntax: '[đài] [số] b[tiền]',
      example: 'mb 45 67 b10',
      description: 'Đánh số ở tất cả các giải thưởng',
    },
    {
      type: 'Đầu (dau)',
      syntax: '[đài] [số] dau[tiền]',
      example: 'dn 23 45 dau10',
      description: 'Chỉ đánh số ở giải đầu (giải 8)',
    },
    {
      type: 'Đuôi (duoi)',
      syntax: '[đài] [số] duoi[tiền]',
      example: 'ct 67 89 duoi5',
      description: 'Chỉ đánh số ở giải đuôi (giải đặc biệt)',
    },
    {
      type: 'Xỉu Chủ (xc)',
      syntax: '[đài] [số 3 chữ số] xc[tiền]',
      example: 'ag 123 456 xc5',
      description: 'Đánh ba càng (3 số)',
    },
    {
      type: 'Đá (da)',
      syntax: '[đài] [số] [số] [số]... da[tiền]',
      example: 'vt 12 34 56 da10',
      description: 'Đánh theo kiểu lô đá (ghép cặp các số)',
    },
  ]

  // Syntax explanation sections
  const syntaxSections = [
    {
      title: 'Cấu trúc mã cược cơ bản',
      content: `Mã cược cần có 4 thành phần chính theo thứ tự:
1. Đài: Tên đài hoặc viết tắt (mb, vl, tg...)
2. Số: Các số muốn đánh, cách nhau bởi dấu cách
3. Kiểu cược: dd (đầu đuôi), b (bao), dau (đầu), duoi (đuôi)...
4. Tiền cược: Số tiền đặt cho mỗi số/cặp số`,
    },
    {
      title: 'Đài nhiều miền',
      content: `Để đặt cược cho nhiều đài cùng một miền:
- 2dmn = 2 đài miền Nam
- 3dmn = 3 đài miền Nam
- 2dmt = 2 đài miền Trung
- Ví dụ: 2dmn 45 67 dd10`,
    },
    {
      title: 'Cách viết số dạng kéo',
      content: `Để đánh một dãy số theo quy luật:
- Cú pháp: [số đầu]/[số thứ hai]keo[số cuối]
- Ví dụ: 10/20keo90 tạo dãy: 10, 20, 30, 40, 50, 60, 70, 80, 90
- Ví dụ: 5/10keo50 tạo dãy: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50`,
    },
  ]

  // Fetch recent bet codes
  useEffect(() => {
    const loadRecentBetCodes = async () => {
      try {
        const codes = await fetchUserBetCodes()
        // Filter only valid, non-deleted codes and take the most recent ones
        const recent = codes
          .filter((code) => code.status !== 'deleted')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
        setRecentBetCodes(recent)
      } catch (error) {
        console.error('Error loading recent bet codes:', error)
      }
    }

    // Load saved favorites from localStorage
    const loadFavorites = () => {
      try {
        const saved = localStorage.getItem('favoriteBetCodes')
        if (saved) {
          setFavorites(JSON.parse(saved))
        }
      } catch (error) {
        console.error('Error loading favorites:', error)
      }
    }

    loadRecentBetCodes()
    loadFavorites()
  }, [fetchUserBetCodes])

  // Function to handle favorite toggle
  const toggleFavorite = (code) => {
    let newFavorites
    if (favorites.some((fav) => fav.code === code.code)) {
      newFavorites = favorites.filter((fav) => fav.code !== code.code)
      toast.info('Đã loại khỏi danh sách yêu thích')
    } else {
      newFavorites = [...favorites, code]
      toast.success('Đã thêm vào danh sách yêu thích')
    }
    setFavorites(newFavorites)
    localStorage.setItem('favoriteBetCodes', JSON.stringify(newFavorites))
  }

  // Function to copy a bet code
  const copyExample = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        toast.success('Đã sao chép mã cược')
      })
      .catch((error) => {
        console.error('Lỗi khi sao chép:', error)
        toast.error('Không thể sao chép mã cược')
      })
  }

  // Handle filtering examples
  const filteredExamples = exampleBetCodes.filter(
    (example) =>
      searchTerm === '' ||
      example.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      example.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      example.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle filtering bet types
  const filteredBetTypes = betTypeGuides.filter(
    (guide) =>
      searchTerm === '' ||
      guide.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.syntax.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.example.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle new code creation
  const handleCreateNewCode = () => {
    if (!newCodeContent.trim()) {
      toast.error('Vui lòng nhập nội dung mã cược')
      return
    }

    // Here we would normally process and save the new code
    // For now we'll just copy it to clipboard and close the dialog
    navigator.clipboard.writeText(newCodeContent)
    toast.success('Đã tạo mã cược mới và sao chép vào clipboard')
    setNewCodeDialogOpen(false)
    setNewCodeContent('')
  }

  return (
    <div className='container py-6'>
      <div className='flex flex-col lg:flex-row gap-6 h-[80vh]'>
        {/* Main input area - grows to take available space */}
        <div className='lg:flex-1'>
          <Card className='h-full flex flex-col'>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-2xl font-bold'>
                    Nhập mã cược
                  </CardTitle>
                  <CardDescription>
                    Nhập mã cược để phân tích, kiểm tra lỗi và tính toán tiền
                    cược
                  </CardDescription>
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    onClick={() => setShowPanel(!showPanel)}
                    variant='ghost'
                    size='icon'
                    className='lg:hidden'>
                    {showPanel ? <ChevronRight /> : <ChevronLeft />}
                  </Button>
                  <Dialog
                    open={newCodeDialogOpen}
                    onOpenChange={setNewCodeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className='h-4 w-4 mr-2' />
                        Tạo mới
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-[500px]'>
                      <DialogHeader>
                        <DialogTitle>Tạo mã cược mới</DialogTitle>
                        <DialogDescription>
                          Tạo một mã cược mới để sử dụng. Mã cược của bạn sẽ
                          được phân tích tự động.
                        </DialogDescription>
                      </DialogHeader>
                      <div className='py-4'>
                        <Textarea
                          value={newCodeContent}
                          onChange={(e) => setNewCodeContent(e.target.value)}
                          placeholder='Nhập mã cược của bạn (vd: mb 23 45 dd10)'
                          className='h-32'
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          variant='outline'
                          onClick={() => setNewCodeDialogOpen(false)}>
                          Hủy
                        </Button>
                        <Button onClick={handleCreateNewCode}>
                          Tạo mã cược
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className='flex-1 overflow-hidden p-0'>
              <ChatInterface />
            </CardContent>
          </Card>
        </div>

        {/* Side panel - fixed width that can be toggled */}
        {(showPanel || !window.matchMedia('(max-width: 1024px)').matches) && (
          <div className='lg:w-96 w-full'>
            <Card className='h-full overflow-hidden flex flex-col'>
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle>Trợ giúp & Ví dụ</CardTitle>
                  <Button
                    onClick={() => setShowPanel(!showPanel)}
                    variant='ghost'
                    size='icon'
                    className='hidden lg:flex'>
                    {showPanel ? <ChevronRight /> : <ChevronLeft />}
                  </Button>
                </div>
                <div className='relative mt-2'>
                  <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Tìm kiếm...'
                    className='pl-8'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className='flex-1 overflow-y-auto p-0'>
                <Tabs
                  defaultValue='examples'
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className='h-full flex flex-col'>
                  <TabsList className='mx-4 mt-2 grid grid-cols-4'>
                    <TabsTrigger value='examples'>
                      <ListPlus className='h-4 w-4 mr-2' />
                      <span className='hidden sm:inline'>Ví dụ</span>
                    </TabsTrigger>
                    <TabsTrigger value='recent'>
                      <Clock className='h-4 w-4 mr-2' />
                      <span className='hidden sm:inline'>Gần đây</span>
                    </TabsTrigger>
                    <TabsTrigger value='syntax'>
                      <BookOpen className='h-4 w-4 mr-2' />
                      <span className='hidden sm:inline'>Cú pháp</span>
                    </TabsTrigger>
                    <TabsTrigger value='favorites'>
                      <Star className='h-4 w-4 mr-2' />
                      <span className='hidden sm:inline'>Yêu thích</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Examples Tab */}
                  <TabsContent
                    value='examples'
                    className='flex-1 overflow-y-auto px-4 py-3 mt-0'>
                    <div className='space-y-4'>
                      <div className='font-medium flex items-center'>
                        <Lightbulb className='h-4 w-4 mr-2 text-yellow-500' />
                        Các mẫu mã cược phổ biến
                      </div>

                      {searchTerm && filteredExamples.length === 0 ? (
                        <div className='text-center py-8 text-muted-foreground'>
                          Không tìm thấy mẫu mã cược nào phù hợp
                        </div>
                      ) : (
                        <div className='grid grid-cols-1 gap-3'>
                          {filteredExamples.map((example, index) => (
                            <div
                              key={index}
                              className='border rounded-md p-3 transition-all hover:bg-accent/40 hover:shadow-sm'>
                              <div className='flex justify-between items-start mb-1'>
                                <div className='font-medium'>
                                  {example.label}
                                </div>
                                <div className='flex gap-1'>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-6 w-6'
                                    onClick={() => toggleFavorite(example)}>
                                    {favorites.some(
                                      (fav) => fav.code === example.code
                                    ) ? (
                                      <Star className='h-3.5 w-3.5 text-yellow-500 fill-yellow-500' />
                                    ) : (
                                      <StarOff className='h-3.5 w-3.5' />
                                    )}
                                  </Button>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-6 w-6'
                                    onClick={() => copyExample(example.code)}>
                                    <Copy className='h-3.5 w-3.5' />
                                  </Button>
                                </div>
                              </div>
                              <div className='bg-muted px-2 py-1 rounded text-xs font-mono mb-2'>
                                {example.code}
                              </div>
                              <p className='text-xs text-muted-foreground'>
                                {example.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Common bet types guide */}
                      <div className='font-medium flex items-center mt-6'>
                        <HelpCircle className='h-4 w-4 mr-2 text-blue-500' />
                        Các kiểu cược thông dụng
                      </div>

                      {searchTerm && filteredBetTypes.length === 0 ? (
                        <div className='text-center py-8 text-muted-foreground'>
                          Không tìm thấy kiểu cược nào phù hợp
                        </div>
                      ) : (
                        <div className='space-y-3'>
                          {filteredBetTypes.map((guide, index) => (
                            <div
                              key={index}
                              className='border rounded-md p-3 transition-all hover:bg-accent/40'>
                              <div className='font-medium mb-1'>
                                {guide.type}
                              </div>
                              <div className='text-xs text-muted-foreground mb-1'>
                                Cú pháp:{' '}
                                <span className='font-mono'>
                                  {guide.syntax}
                                </span>
                              </div>
                              <div className='text-xs text-muted-foreground mb-1'>
                                Ví dụ:{' '}
                                <span className='font-mono bg-muted px-1 py-0.5 rounded'>
                                  {guide.example}
                                </span>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-4 w-4 ml-1 -my-1'
                                  onClick={() => copyExample(guide.example)}>
                                  <Copy className='h-3 w-3' />
                                </Button>
                              </div>
                              <p className='text-xs text-muted-foreground'>
                                {guide.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Recent Tab */}
                  <TabsContent
                    value='recent'
                    className='flex-1 overflow-y-auto px-4 py-3 mt-0'>
                    <div className='space-y-4'>
                      <div className='font-medium flex items-center'>
                        <Clock className='h-4 w-4 mr-2 text-blue-500' />
                        Mã cược gần đây
                      </div>

                      {recentBetCodes.length === 0 ? (
                        <div className='text-center py-12 text-muted-foreground'>
                          <Clock className='h-12 w-12 mx-auto mb-3 opacity-20' />
                          <p>Chưa có mã cược nào gần đây</p>
                        </div>
                      ) : (
                        <div className='space-y-3'>
                          {recentBetCodes.map((betCode) => (
                            <div
                              key={betCode.id}
                              className='border rounded-md p-3 hover:bg-accent/40 transition-all'>
                              <div className='flex justify-between items-start mb-1'>
                                <div className='font-medium'>
                                  Mã #{betCode.id}
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  {format(
                                    new Date(betCode.createdAt),
                                    'HH:mm dd/MM/yyyy'
                                  )}
                                </div>
                              </div>
                              <div className='bg-muted px-2 py-1 rounded text-xs font-mono mb-2 truncate'>
                                {betCode.content}
                              </div>
                              <div className='flex justify-between text-xs text-muted-foreground'>
                                <div>
                                  Tiền cược:{' '}
                                  {betCode.stakeAmount?.toLocaleString() || 0}đ
                                </div>
                                <div className='flex gap-1'>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-6 w-6'
                                    onClick={() =>
                                      toggleFavorite({
                                        label: `Mã #${betCode.id}`,
                                        code: betCode.content,
                                        description: `Tiền cược: ${
                                          betCode.stakeAmount?.toLocaleString() ||
                                          0
                                        }đ`,
                                      })
                                    }>
                                    {favorites.some(
                                      (fav) => fav.code === betCode.content
                                    ) ? (
                                      <Star className='h-3.5 w-3.5 text-yellow-500 fill-yellow-500' />
                                    ) : (
                                      <StarOff className='h-3.5 w-3.5' />
                                    )}
                                  </Button>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-6 w-6'
                                    onClick={() =>
                                      copyExample(betCode.content)
                                    }>
                                    <Copy className='h-3.5 w-3.5' />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Syntax Tab */}
                  <TabsContent
                    value='syntax'
                    className='flex-1 overflow-y-auto px-4 py-3 mt-0'>
                    <div className='space-y-6'>
                      {syntaxSections.map((section, index) => (
                        <div key={index} className='border rounded-md p-4'>
                          <div className='font-medium mb-2 flex items-center'>
                            <BookOpen className='h-4 w-4 mr-2 text-blue-500' />
                            {section.title}
                          </div>
                          <div className='text-sm whitespace-pre-line'>
                            {section.content}
                          </div>
                        </div>
                      ))}

                      <div className='border rounded-md p-4 bg-yellow-50 dark:bg-yellow-900/20'>
                        <div className='font-medium mb-2 flex items-center'>
                          <Info className='h-4 w-4 mr-2 text-yellow-600' />
                          Mẹo hữu ích
                        </div>
                        <ul className='text-sm space-y-2 list-disc pl-5'>
                          <li>
                            Bạn có thể sử dụng viết tắt tên đài (mb, vl, ag...)
                          </li>
                          <li>
                            Bạn có thể viết nhiều dòng cược cùng lúc, mỗi dòng
                            là một cú pháp riêng
                          </li>
                          <li>
                            Hệ thống sẽ tự động phát hiện và sửa các lỗi thông
                            thường
                          </li>
                          <li>
                            Để đánh nhiều số cùng kiểu, liệt kê các số cách nhau
                            bằng dấu cách
                          </li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Favorites Tab */}
                  <TabsContent
                    value='favorites'
                    className='flex-1 overflow-y-auto px-4 py-3 mt-0'>
                    <div className='space-y-4'>
                      <div className='font-medium flex items-center'>
                        <Star className='h-4 w-4 mr-2 text-yellow-500' />
                        Mã cược yêu thích
                      </div>

                      {favorites.length === 0 ? (
                        <div className='text-center py-12 text-muted-foreground'>
                          <Star className='h-12 w-12 mx-auto mb-3 opacity-20' />
                          <p>Chưa có mã cược yêu thích nào</p>
                          <p className='text-sm mt-2'>
                            Nhấn biểu tượng sao để thêm vào danh sách yêu thích
                          </p>
                        </div>
                      ) : (
                        <div className='space-y-3'>
                          {favorites.map((favorite, index) => (
                            <div
                              key={index}
                              className='border rounded-md p-3 hover:bg-accent/40 transition-all'>
                              <div className='flex justify-between items-start mb-1'>
                                <div className='font-medium'>
                                  {favorite.label}
                                </div>
                                <div className='flex gap-1'>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-6 w-6'
                                    onClick={() => toggleFavorite(favorite)}>
                                    <Star className='h-3.5 w-3.5 text-yellow-500 fill-yellow-500' />
                                  </Button>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-6 w-6'
                                    onClick={() => copyExample(favorite.code)}>
                                    <Copy className='h-3.5 w-3.5' />
                                  </Button>
                                </div>
                              </div>
                              <div className='bg-muted px-2 py-1 rounded text-xs font-mono mb-2'>
                                {favorite.code}
                              </div>
                              <p className='text-xs text-muted-foreground'>
                                {favorite.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className='py-2 px-4 border-t flex justify-between'>
                <div className='text-xs text-muted-foreground'>
                  Nhấn vào mã cược để sao chép
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={() =>
                    setActiveTab(
                      activeTab === 'examples'
                        ? 'syntax'
                        : activeTab === 'syntax'
                        ? 'recent'
                        : activeTab === 'recent'
                        ? 'favorites'
                        : 'examples'
                    )
                  }>
                  <Settings className='h-4 w-4' />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default BetCodeInputPage
