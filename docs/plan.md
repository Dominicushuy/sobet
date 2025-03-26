# Kế hoạch xây dựng hệ thống đối soát kết quả xổ số

## I. Tổng quan dự án

### 1.1 Mục tiêu

Xây dựng hệ thống client-side rendering, không cần server, để quản lý và đối soát kết quả đặt cược xổ số, sử dụng Dexie.js để lưu trữ dữ liệu cục bộ.

### 1.2 Phạm vi

- **Roles**: Admin và User với các quyền khác nhau
- **Thời gian lưu trữ**: Lưu trữ dữ liệu trong 1 tuần
- **Giới hạn người dùng**: Số lượng user có hạn theo config (mặc định 10)

### 1.3 Tính năng chính

- Nhập và phân tích mã cược
- Phát hiện và sửa lỗi mã cược
- Tính toán tiền đóng và tiềm năng thắng cược
- Đối soát kết quả xổ số
- Quản lý đài và kiểu cược
- Xuất báo cáo và thống kê

## II. Cấu trúc dự án

```
📁 src/
  📁 assets/                 # Tài nguyên tĩnh (hình ảnh, icons)
  📁 components/             # Components tái sử dụng
    📁 common/               # Components dùng chung (Button, Input, etc.)
    📁 layout/               # Components bố cục (Header, Sidebar, etc.)
    📁 chat/                 # Components cho UI chat với bot
    📁 tables/               # Components bảng, danh sách
    📁 forms/                # Components form
    📁 modals/               # Components modal và dialog
    📁 charts/               # Components biểu đồ cho dashboard
  📁 contexts/               # React contexts
    📄 AuthContext.jsx       # Quản lý authentication
    📄 UIContext.jsx         # Quản lý UI state
  📁 database/               # Cấu hình và logic Dexie.js
    📄 db.js                 # Định nghĩa database
    📄 schema.js             # Schema database
    📄 seeders.js            # Dữ liệu mặc định
    📄 migrations.js         # Database migrations
  📁 hooks/                  # Custom hooks
    📄 useBetCodes.js        # Hook quản lý mã cược
    📄 useVerification.js    # Hook đối soát kết quả
    📄 useStations.js        # Hook quản lý đài
  📁 pages/                  # Các trang
    📁 auth/                 # Trang xác thực
    📁 user/                 # Trang dành cho user
      📄 BetCodeInput.jsx    # Màn hình nhập mã cược
      📄 BetCodeHistory.jsx  # Màn hình lịch sử mã cược
    📁 admin/                # Trang dành cho admin
      📄 Dashboard.jsx       # Dashboard tổng quan
      📄 UserManagement.jsx  # Quản lý người dùng
      📄 StationManagement.jsx # Quản lý đài
      📄 BetTypeManagement.jsx # Quản lý kiểu cược
      📄 BetCodeVerification.jsx # Đối soát mã cược
      📄 VerificationHistory.jsx # Lịch sử đối soát
  📁 services/               # Logic nghiệp vụ
    📁 betCodeParser/        # Phân tích mã cược
      📄 parser.js           # Phân tích cú pháp mã
      📄 validator.js        # Kiểm tra tính hợp lệ
      📄 errorDetector.js    # Phát hiện lỗi
      📄 errorFixer.js       # Gợi ý sửa lỗi
    📁 calculator/           # Tính toán
      📄 stakeCalculator.js  # Tính tiền đóng
      📄 prizeCalculator.js  # Tính tiền thưởng
    📁 verification/         # Đối soát kết quả
      📄 matcher.js          # So khớp mã cược với kết quả
      📄 resultProcessor.js  # Xử lý kết quả đối soát
    📁 export/               # Xuất dữ liệu
      📄 excelExporter.js    # Xuất file Excel
      📄 pdfExporter.js      # Xuất file PDF
  📁 utils/                  # Tiện ích
    📄 formatters.js         # Định dạng dữ liệu
    📄 validators.js         # Hàm kiểm tra dữ liệu
    📄 calculations.js       # Các hàm tính toán
    📄 dateUtils.js          # Xử lý ngày tháng
  📁 config/                 # Cấu hình
    📄 constants.js          # Các hằng số
    📄 defaults.js           # Giá trị mặc định
    📄 roles.js              # Cấu hình vai trò
  📄 App.jsx                 # Component App
  📄 index.jsx               # Điểm khởi đầu
```

## III. Thiết kế Database (IndexedDB với Dexie.js)

### 3.1 Schema Database

```javascript
export const schema = {
  users: '++id, username, role, isActive',
  stations: '++id, name, region, aliases, isActive, [region+name]',
  betTypes: '++id, name, aliases, isActive',
  numberCombinations: '++id, name, aliases, isActive',
  betCodes: '++id, userId, content, createdAt, status, [userId+createdAt]',
  lotteryResults: '++id, region, station, date, results, [region+station+date]',
  verificationResults: '++id, betCodeIds, resultsId, verifiedAt, [verifiedAt]',
  settings: 'key, value',
}
```

### 3.2 Cấu trúc đối tượng dữ liệu

#### 3.2.1 User

```javascript
{
  id: Number, // Auto-increment primary key
  username: String,
  password: String, // Hashed
  role: String, // 'admin' hoặc 'user'
  isActive: Boolean,
  createdAt: Date,
  lastLogin: Date
}
```

#### 3.2.2 Station (Đài xổ số)

```javascript
{
  id: Number,
  name: String,
  region: String, // 'south', 'central', 'north'
  aliases: Array, // Các cách viết tắt
  isActive: Boolean,
  schedule: {
    day: String, // Thứ trong tuần
    order: Number // Thứ tự xuất hiện
  }
}
```

#### 3.2.3 BetType (Kiểu đặt cược)

```javascript
{
  id: Number,
  name: String,
  aliases: Array, // Các cách viết tắt
  applicableRegions: Array, // ['south', 'central', 'north']
  betRule: Array, // ['2 digits', '3 digits']
  matchingDraw: Object, // Định nghĩa lô khớp
  combinations: Object, // Số tổ hợp
  matchingMethod: String, // Cách so khớp
  payoutRate: Object, // Tỉ lệ thưởng
  isActive: Boolean
}
```

#### 3.2.4 NumberCombination (Kiểu chọn tổ hợp số)

```javascript
{
  id: Number,
  name: String,
  aliases: Array, // Các cách viết tắt
  definition: String, // Định nghĩa
  syntax: String, // Cú pháp
  applicableBetTypes: Array, // Các kiểu đặt cược có thể áp dụng
  examples: Array, // Ví dụ minh họa
  calculationMethod: String, // Phương pháp tính toán
  isActive: Boolean
}
```

#### 3.2.5 BetCode (Mã đặt cược)

```javascript
{
  id: Number,
  userId: Number, // Người tạo
  content: String, // Nội dung mã gốc
  parsedContent: Array, // Mã đã phân tích
  /*
    [
      {
        station: String,
        numbers: Array,
        betType: String,
        amount: Number
      }
    ]
  */
  stakeAmount: Number, // Tiền đóng
  potentialWinning: Number, // Tiềm năng thắng
  createdAt: Date,
  updatedAt: Date,
  status: String, // 'pending', 'verified', 'deleted'
  errors: Array // Lỗi phát hiện được
}
```

#### 3.2.6 LotteryResult (Kết quả xổ số)

```javascript
{
  id: Number,
  region: String, // 'south', 'central', 'north'
  station: String, // Tên đài
  date: Date, // Ngày xổ
  results: Object,
  /*
    {
      special: ['123456'],
      first: ['12345'],
      second: ['12345'],
      ...
    }
  */
  createdAt: Date,
  importedBy: Number // User ID
}
```

#### 3.2.7 VerificationResult (Kết quả đối soát)

```javascript
{
  id: Number,
  betCodeIds: Array, // IDs của mã cược được đối soát
  resultsId: Number, // ID của kết quả xổ số
  verifiedAt: Date,
  verifiedBy: Number, // User ID
  summary: {
    totalBets: Number, // Tổng số mã cược
    totalStake: Number, // Tổng tiền đóng
    totalWinning: Number, // Tổng tiền thắng
    details: Array // Chi tiết từng mã cược
    /*
      [
        {
          betCodeId: Number,
          winningAmount: Number,
          matches: Array
        }
      ]
    */
  }
}
```

#### 3.2.8 Settings (Cài đặt)

```javascript
{
  key: String, // Tên cài đặt
  value: Any // Giá trị cài đặt
}
```

## IV. Kế hoạch triển khai

### 4.1 Giai đoạn 1: Thiết lập dự án (1-2 tuần)

#### 4.1.1 Thiết lập môi trường

- Khởi tạo dự án React với Vite
- Cài đặt dependencies: Dexie, Tailwind CSS, React Router, v.v.
- Thiết lập cấu trúc thư mục và base components

#### 4.1.2 Thiết lập database

- Thiết lập Dexie.js schema
- Tạo dữ liệu mặc định cho đài, kiểu cược, tổ hợp số
- Thiết lập migration plan

#### 4.1.3 Thiết lập authentication

- Xây dựng màn hình đăng nhập
- Thiết lập logic xác thực cục bộ
- Cấu hình protected routes

### 4.2 Giai đoạn 2: Xây dựng tính năng core cho User (2-3 tuần)

#### 4.2.1 Phân tích mã cược

- Xây dựng parser để phân tích cú pháp mã cược
- Xây dựng validator để kiểm tra tính hợp lệ
- Xây dựng error detector và fixer để phát hiện và gợi ý sửa lỗi

#### 4.2.2 Màn hình nhập mã cược

- Thiết kế UI chat với bot
- Hiển thị kết quả phân tích và gợi ý sửa lỗi
- Lưu trữ lịch sử chat

#### 4.2.3 Tính toán tiền cược

- Xây dựng calculator để tính tiền đóng
- Tính toán tiềm năng thắng cược
- Hiển thị chi tiết cách tính

#### 4.2.4 Màn hình lịch sử mã cược

- Hiển thị danh sách mã cược
- Chức năng tìm kiếm và lọc
- Chức năng sửa, xóa, in, xuất Excel

### 4.3 Giai đoạn 3: Xây dựng tính năng quản lý cho Admin (2-3 tuần)

#### 4.3.1 Quản lý người dùng

- Màn hình danh sách người dùng
- Chức năng thêm, sửa, xóa, kích hoạt/vô hiệu hóa
- Kiểm soát số lượng user theo cấu hình

#### 4.3.2 Quản lý đài

- Màn hình danh sách đài
- Chức năng thêm, sửa, xóa, kích hoạt/vô hiệu hóa
- Quản lý lịch xổ số

#### 4.3.3 Quản lý kiểu cược

- Màn hình danh sách kiểu cược
- Chức năng sửa và kích hoạt/vô hiệu hóa
- Cấu hình chi tiết từng field

#### 4.3.4 Quản lý mã cược

- Màn hình danh sách mã cược từ tất cả user
- Chức năng lọc theo user, đài, thời gian
- Chức năng sửa, xóa, in, xuất Excel

### 4.4 Giai đoạn 4: Tính năng đối soát kết quả (2-3 tuần)

#### 4.4.1 Nhập kết quả xổ số

- Màn hình nhập kết quả xổ số
- Chức năng import từ file hoặc URL
- Lưu trữ và quản lý kết quả

#### 4.4.2 Đối soát mã cược

- Xây dựng logic so khớp mã cược với kết quả
- Tính toán tiền thắng cược theo từng kiểu cược
- Hiển thị kết quả đối soát chi tiết

#### 4.4.3 Quản lý lịch sử đối soát

- Màn hình danh sách lịch sử đối soát
- Chức năng lọc theo thời gian, đài
- Chức năng xem chi tiết, in, xuất Excel

#### 4.4.4 Báo cáo thống kê

- Tạo dashboard thống kê tổng quan
- Biểu đồ phân bố mã cược theo đài, kiểu cược
- Biểu đồ tiền đóng, tiền thắng cược

### 4.5 Giai đoạn 5: Hoàn thiện và tối ưu (1-2 tuần)

#### 4.5.1 Tối ưu hiệu năng

- Cải thiện thời gian phản hồi
- Tối ưu truy vấn database
- Cài đặt caching

#### 4.5.2 Cải thiện UX/UI

- Consistency check cho giao diện
- Responsive design
- Animation và transitions

#### 4.5.3 Testing

- Unit tests cho các hàm core
- Integration tests cho các luồng chính
- User testing và thu thập feedback

#### 4.5.4 Triển khai

- Package và build production version
- Tạo installer (nếu cần)
- Tài liệu hướng dẫn sử dụng

### 4.6 Giai đoạn 6: Tính năng chia kèo (phát triển sau)

#### 4.6.1 Phân tích yêu cầu

- Xác định business logic cụ thể
- Thiết kế data model
- Lên workflow

#### 4.6.2 Thiết kế và triển khai

- Thiết kế UI
- Triển khai backend logic
- Testing và tối ưu

## V. Công nghệ đề xuất

### 5.1 Frontend

- **Framework**: React với Vite
- **UI Library**: Tailwind CSS + Headless UI/Radix UI
- **State Management**: React Context API hoặc Zustand
- **Forms**: React Hook Form + Zod
- **Routing**: React Router

### 5.2 Database & Storage

- **Local Database**: Dexie.js (IndexedDB wrapper)
- **State Persistence**: localforage
- **Data Export**: xlsx.js, jsPDF

### 5.3 Utils & Helpers

- **Date Management**: date-fns
- **Data Manipulation**: lodash
- **Charts**: Recharts
- **Tables**: TanStack Table (react-table)
- **Notifications**: react-hot-toast

## VI. Thiết kế UI chính

### 6.1 Màn hình nhập mã cược (Chat UI)

- Textarea nhập mã cược
- Hiển thị lịch sử chat với bot
- Hiển thị kết quả phân tích và gợi ý sửa lỗi
- Nút in và xem chi tiết

### 6.2 Màn hình lịch sử mã cược

- Bảng danh sách mã cược
- Bộ lọc theo đài, thời gian, trạng thái
- Các nút tác vụ: xem, sửa, xóa, in
- Nút export Excel

### 6.3 Dashboard Admin

- Widget thông tin tổng quan
- Biểu đồ phân bố mã cược
- Biểu đồ tiền đóng, tiền thắng
- Shortcuts tới các chức năng chính

### 6.4 Màn hình đối soát kết quả

- Chọn kết quả xổ số
- Danh sách mã cược cần đối soát
- Nút đối soát tất cả hoặc đối soát đã chọn
- Hiển thị kết quả đối soát chi tiết

## VII. Rủi ro và giải pháp

### 7.1 Rủi ro về dữ liệu

- **Vấn đề**: Mất dữ liệu cục bộ
- **Giải pháp**: Chức năng backup/restore database, export/import data

### 7.2 Rủi ro về hiệu năng

- **Vấn đề**: Chậm khi xử lý nhiều mã cược
- **Giải pháp**: Xử lý batch, tối ưu database queries, web workers

### 7.3 Rủi ro về độ chính xác

- **Vấn đề**: Lỗi trong phân tích mã cược hoặc đối soát
- **Giải pháp**: Test cases đầy đủ, validation kép, logging chi tiết
