Tôi định chỉ xây dựng Client Side Rendering không cần server, lưu kết quả đặt cược và kết quả xổ số trong 1 tuần ở local, sử dụng thư viện "dexie" để xây dựng database.

- Tôi cần 2 role là "admin" và "user". Admin có thể tạo ra số lượng user có hạn theo cài đặt từ 1 file config, ví dụ tôi cài đặt trong đó là 10 thì admin chỉ tạo được tối đa 10 user.
- User bản chất là thư ký sẽ có 2 màn hình chính:
  - Màn hình đầu tiên sử dụng nhiều nhất đó là màn hình nhập mã, tôi nghĩ nên làm UI giống như đang chat với bot, khi nhập mã thì bot sẽ kiểm tra tính hợp lệ của mã, nếu mã chưa đúng thì bot sẽ tìm ra lỗi và gợi ý sửa. Nếu mã đã đúng rồi thì Bot sẽ trả lời lại đầy đủ thông thông tin đặt cược của mã kèm theo đó là 1 nút in mã đặt. Khi bấm vào sẽ hiện chi tiết cách nhân ra số tiền đóng, tiềm năng thắng,... ở dialog mới.
  - Màn hình thứ hai hiển thị danh sách lịch sử các mã đặt, có bộ lọc, nút: xóa, sửa, in, xem chi tiết. Có nút export excel để xuất ra file excel danh sách mã đặt cược.
- Amin bản chất là một nhà cái, sẽ có các màn hình chính sau:
  - Màn hình cài đặt quản lý tất cả các kiểu cược, có thể sửa thông tin chi tiết từng field của kiểu cược, kích hoạt/deactive kiểu cược. (Không có chức năng phép thêm, xóa kiểu cược)
  - Màn hình quản lý tất cả các đài, có chức năng thêm, sửa, xóa, kích hoạt/deactive đài.
  - Màn hình hiển thị toàn bộ danh sách mã cược của toàn bộ user, có các chức năng y chang như của user. Thêm một nút đặc biệt nữa là đối soát tất cả và đối soát theo danh sách đã chọn.
  - Màn hình lịch sử đối soát kết quả xổ số, có bộ lọc, nút: xóa, sửa, in, xem chi tiết. Có nút export excel để xuất ra file excel danh sách mã đặt cược.
  - Admin cũng sẽ có màn hình nhập mã y như của user và lưu lại thành một danh sách riêng của admin.
  - Dashboard thống kê, thao tác nhanh
  - Màn hình chia kèo cho các nhà cái khác dựa trên tổng mã đang chờ đối soát. Phần này khá phức tạp tôi sẽ làm sau

Dựa trên những thông tin trên hãy phân tích giúp tôi cấu trúc dự án, thiết kế Database, lên kế hoạch xây dựng dự án chi tiết, (Output chỉ cần là bản kế hoạch, không chứa chi tiết code của từng file tôi sẽ triển khai sau)
