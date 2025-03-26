import React, { useState, useEffect } from 'react'
import { useBetCodes } from '@/hooks/useBetCodes'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  FileDown,
  Edit,
  Trash2,
  Eye,
  SlidersHorizontal,
  FileText,
  Calendar,
} from 'lucide-react'

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { BET_CODE_STATUS } from '@/config/constants'
import BetCodeDetailModal from '@/components/bet-code/BetCodeDetailModal'
import BetCodeEditModal from '@/components/bet-code/BetCodeEditModal'
import { exportToExcel } from '@/services/export/excelExporter'
import { exportToPdf } from '@/services/export/pdfExporter'

const UserBetCodeHistoryPage = () => {
  const { betCodes, loading, fetchUserBetCodes, deleteBetCode } = useBetCodes()
  const navigate = useNavigate()

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // State for modals
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBetCode, setSelectedBetCode] = useState(null)

  // Load bet codes on component mount
  useEffect(() => {
    fetchUserBetCodes()
  }, [fetchUserBetCodes])

  // Handle filtering bet codes
  const filteredBetCodes = betCodes.filter((betCode) => {
    // Status filter
    if (statusFilter !== 'all' && betCode.status !== statusFilter) {
      return false
    }

    // Date filter
    if (dateFilter) {
      const betCodeDate = new Date(betCode.createdAt)
      const filterDate = new Date(dateFilter)

      if (
        betCodeDate.getDate() !== filterDate.getDate() ||
        betCodeDate.getMonth() !== filterDate.getMonth() ||
        betCodeDate.getFullYear() !== filterDate.getFullYear()
      ) {
        return false
      }
    }

    // Search term filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      return (
        betCode.content.toLowerCase().includes(lowerSearchTerm) ||
        betCode.id.toString().includes(lowerSearchTerm)
      )
    }

    return true
  })

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredBetCodes.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredBetCodes.length / itemsPerPage)

  // Handler functions
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleDateFilterChange = (date) => {
    setDateFilter(date)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setDateFilter(null)
    setCurrentPage(1)
  }

  const handleViewDetails = (betCode) => {
    setSelectedBetCode(betCode)
    setDetailModalOpen(true)
  }

  const handleEdit = (betCode) => {
    setSelectedBetCode(betCode)
    setEditModalOpen(true)
  }

  const handleDeleteClick = (betCode) => {
    setSelectedBetCode(betCode)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedBetCode) return

    try {
      const result = await deleteBetCode(selectedBetCode.id)
      if (result) {
        toast.success('Đã xóa mã cược thành công')
      } else {
        toast.error('Không thể xóa mã cược')
      }
    } catch (error) {
      toast.error(`Lỗi khi xóa mã cược: ${error.message}`)
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const handleExportToExcel = () => {
    exportToExcel(filteredBetCodes, 'BetCodeHistory')
    toast.success('Đã xuất dữ liệu ra file Excel')
  }

  const handleExportToPdf = () => {
    exportToPdf(filteredBetCodes, 'BetCodeHistory')
    toast.success('Đã xuất dữ liệu ra file PDF')
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case BET_CODE_STATUS.PENDING:
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
            Chờ xử lý
          </span>
        )
      case BET_CODE_STATUS.VERIFIED:
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
            Đã đối soát
          </span>
        )
      case BET_CODE_STATUS.DELETED:
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
            Đã xóa
          </span>
        )
      default:
        return (
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
            Không xác định
          </span>
        )
    }
  }

  const handleEditSuccess = () => {
    setEditModalOpen(false)
    fetchUserBetCodes()
    toast.success('Đã cập nhật mã cược thành công')
  }

  return (
    <div className='container py-6'>
      <Card>
        <CardHeader>
          <div className='flex flex-wrap justify-between items-center gap-4'>
            <div>
              <CardTitle>Lịch sử mã cược</CardTitle>
              <CardDescription>
                Danh sách các mã cược đã nhập và trạng thái của chúng
              </CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className='h-4 w-4 mr-2' />
                Bộ lọc
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <FileDown className='h-4 w-4 mr-2' />
                    Xuất dữ liệu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={handleExportToExcel}>
                    <FileText className='h-4 w-4 mr-2' />
                    Xuất Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportToPdf}>
                    <FileText className='h-4 w-4 mr-2' />
                    Xuất PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size='sm' onClick={() => navigate('/')}>
                Thêm mã cược
              </Button>
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <div className='px-6 pb-4 border-b border-border'>
            <div className='flex flex-wrap gap-4 items-end'>
              <div className='flex-1 min-w-[200px]'>
                <div className='text-sm font-medium mb-1.5'>Tìm kiếm</div>
                <div className='relative'>
                  <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Tìm theo mã cược...'
                    value={searchTerm}
                    onChange={handleSearch}
                    className='pl-8'
                  />
                </div>
              </div>

              <div className='w-[180px]'>
                <div className='text-sm font-medium mb-1.5'>Trạng thái</div>
                <select
                  className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}>
                  <option value='all'>Tất cả</option>
                  <option value={BET_CODE_STATUS.PENDING}>Chờ xử lý</option>
                  <option value={BET_CODE_STATUS.VERIFIED}>Đã đối soát</option>
                </select>
              </div>

              <div className='w-[180px]'>
                <div className='text-sm font-medium mb-1.5'>Ngày</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='w-full justify-start text-left font-normal'>
                      <Calendar className='mr-2 h-4 w-4' />
                      {dateFilter ? (
                        format(dateFilter, 'dd/MM/yyyy')
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <CalendarComponent
                      mode='single'
                      selected={dateFilter}
                      onSelect={handleDateFilterChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button variant='ghost' onClick={handleClearFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        )}

        <CardContent className='p-0'>
          {loading ? (
            <div className='flex justify-center items-center py-10'>
              <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary'></div>
              <span className='ml-3'>Đang tải...</span>
            </div>
          ) : filteredBetCodes.length === 0 ? (
            <div className='text-center py-10 text-muted-foreground'>
              <FileText className='h-10 w-10 mx-auto mb-3 opacity-20' />
              <p>Không tìm thấy mã cược nào</p>
              {(searchTerm || statusFilter !== 'all' || dateFilter) && (
                <Button
                  variant='link'
                  onClick={handleClearFilters}
                  className='mt-2'>
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Mã cược</TableHead>
                  <TableHead>Tiền cược</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className='text-right'>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((betCode) => (
                  <TableRow key={betCode.id}>
                    <TableCell className='font-medium'>{betCode.id}</TableCell>
                    <TableCell>
                      <div className='max-w-[300px] truncate'>
                        {betCode.content}
                      </div>
                    </TableCell>
                    <TableCell>
                      {betCode.stakeAmount?.toLocaleString() || 0} đ
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(betCode.createdAt),
                        'HH:mm - dd/MM/yyyy',
                        {
                          locale: vi,
                        }
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(betCode.status)}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end space-x-1'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleViewDetails(betCode)}
                          title='Xem chi tiết'>
                          <Eye className='h-4 w-4' />
                        </Button>
                        {betCode.status !== BET_CODE_STATUS.VERIFIED && (
                          <>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleEdit(betCode)}
                              title='Chỉnh sửa'>
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleDeleteClick(betCode)}
                              title='Xóa'>
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {filteredBetCodes.length > 0 && (
          <CardFooter className='flex items-center justify-between border-t p-4'>
            <div className='text-sm text-muted-foreground'>
              Hiển thị {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredBetCodes.length)} trên{' '}
              {filteredBetCodes.length} mã cược
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}>
                Trước
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum = i + 1

                // Adjust for cases when current page is close to the end
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 3 + i

                  // Don't go beyond the last page
                  if (pageNum > totalPages) {
                    return null
                  }
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => handlePageChange(pageNum)}>
                    {pageNum}
                  </Button>
                )
              })}
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}>
                Sau
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa mã cược này không? Hành động này không
              thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant='destructive' onClick={confirmDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      {selectedBetCode && (
        <BetCodeDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          betCode={selectedBetCode}
        />
      )}

      {/* Edit Modal */}
      {selectedBetCode && (
        <BetCodeEditModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          betCode={selectedBetCode}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}

export default UserBetCodeHistoryPage
