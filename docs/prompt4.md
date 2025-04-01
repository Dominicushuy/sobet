Tôi có một trường hợp sau không biết bạn có tự động phát hiện và format lại text trước parse không?

Vi dụ người dùng nhập:
mb 01.02.03b1
=> thì tương đương với:
mb
01.02.03b1

[mã đài / mã tỉnh][dấu cách hoặc dấu chấm][số cược][kiểu cược][số tiền cược]

Kiểm tra phần đặt cược nếu người dùng nhập kiểu cược

Xỉu chủ đầu đuôi
Gộp nhiều cặp đá
Gộp nhiều kiểu đánh có cùng số

- xcd, xcdui, xcduoi => duoi
  Ví dụ:
  111xcdui1 => 111duoi1
  123.456xcduoi1 => 123.456duoi1

- xcdau, xcd => dau
  Ví dụ:
  111xcdau1 => 111dau1
  123.456xcdau1 => 123.456dau1
