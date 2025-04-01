Người dùng có một kiểu đặt đặc biệt dành riêng cho kiểu đá là Gộp nhiều cặp đá bằng cách thêm dấu chấm "." ở giữa mỗi cặp đá.
Ví dụ :

- 12.34da1 và 45.67da1 có thể viết như sau: 1234.4567da1
- 12.34.56.78da1 và 45.67.89.90da1 có thể viết như sau: 12345678.45678990da1
- 11.22.33da1, 44.55.66da1, 77.88.99da1 có thể viết như sau: 112233.445566.778899da1

Khi viết như vậy thì hệ thống phải tự động nhận diện được đây là kiểu đá và không phải là kiểu đánh khác, đồng thời tự tách (format) thành nhiều dòng code đơn lẻ trước khi parse thành draft code.

- Ví dụ 1:
  mb
  1234.4567da1

=> thì format thành:
mb
12.34da1
45.67da1

- Ví dụ 2:

2dmn
12345678.45678990da1

=> thì format thành:
2dmn
12.34.56.78da1
45.67.89.90da1

- Ví dụ 3:

2dmt
112233.445566.778899da1

=> thì format thành:
2dmt
11.22.33da1
44.55.66da1
77.88.99da1
