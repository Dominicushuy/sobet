15 16 37 77 dau20.duoi10
10/11keo19 dau6.duoi2

Gộp nhiều cặp đá: thêm dấu. ở giữa mỗi cặp: 12.34da1 và 45.67da1 có thể viết như sau: 1234.4567da1

// Mã cược thông thường
mb
12.34da5

// Cách viết gộp đá (cùng ý nghĩa với mã trên)
mb
1234da5
=>
mb
12.34da5

// Nhiều cặp đá trong một dòng
mb
1234.5678.9012da5
// Tương đương với:
// mb
// 12.34da5
// 56.78da5
// 90.12da5

=> Hệ thống phải tự động tách thành 3 lần cược và tự lưu:
// mb
// 12.34da5
// mb
// 56.78da5
// mb
// 90.12da5

// Trường hợp phức tạp hơn
vl.ct
1234.5678da10

// Tương đương với:
// vl.ct
// 12.34da10
// 56.78da10

=> Hệ thống phải tự động tách thành 2 lần cược và tự lưu:
// vl.ct
// 12.34da10
// vl.ct
// 56.78da10

// Kết hợp nhiều cặp đá và các kiểu cược khác
mb
1234.5678.9012da10
25.50.75dd5
xiu.chanb2

// Hệ thống phải tự động tách thành 5 lần cược và tự lưu:
// mb
// 12.34da10
// mb
// 56.78da10
// mb
// 90.12da10
// mb
// 25.50.75dd5
// mb
// xiu.chanb2
