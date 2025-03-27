Dựa vào tài liệu trong Project knowledge của dự án và Ví dụ cho các trường hợp đặc biệt ở dưới, có cách này phát hiện ra các kiểu đặc biệt này và tự động tách thành các dòng riêng biệt , kiểu cược riêng biệt hay không?

Lưu ý quan trọng: Tôi đã cập nhật logic các files trong folder `betCodeParser` bao gồm (`errorDetector.js`, `errorFixer.js`, `formatter.js`, `parser.js`) và một vài component như `BetCodeContext.jsx`, `ChatContext.jsx` Hãy tiếp tục với những phần bạn cảm thấy cần bổ sung và nâng cấp cho tính năng đặc biệt trên, không cập nhật lại những phần đã hoàn thiện.

Ví dụ cho các trường hợp đặc biệt

# Cách hiểu đúng về các trường hợp đặt cược đặc biệt

## 1. Gộp nhiều số thành nhóm với dấu chấm

### Định nghĩa

Cách viết này giúp tách số thành các cặp 2 chữ số từ một chuỗi số liền nhau, phân tách bằng dấu chấm.

### Ví dụ 1: 1234.4567da1

- Phân tách đúng:

  - Nhóm 1: 1234 tách thành 12 và 34

  - Nhóm 2: 4567 tách thành 45 và 67

- Kiểu cược: đá (da)

- Tiền cược: 1.000đ/cặp

Tách thành các dòng riêng biệt:

```

12.34da1

45.67da1

```

Lưu ý: Đây không phải là ghép chéo giữa các nhóm, mà đơn giản là viết gọn cho nhiều cặp số.

### Ví dụ 2: 2345.6789da2

- Phân tách đúng:

  - Nhóm 1: 2345 tách thành 23 và 45

  - Nhóm 2: 6789 tách thành 67 và 89

- Kiểu cược: đá (da)

- Tiền cược: 2.000đ/cặp

Tách thành các dòng riêng biệt:

```

23.45da2

67.89da2

```

### Ví dụ 3: 0102.0304.0506da5

- Phân tách đúng:

  - Nhóm 1: 0102 tách thành 01 và 02

  - Nhóm 2: 0304 tách thành 03 và 04

  - Nhóm 3: 0506 tách thành 05 và 06

- Kiểu cược: đá (da)

- Tiền cược: 5.000đ/cặp

Tách thành các dòng riêng biệt:

```

01.02da5

03.04da5

05.06da5

```

## 2. Gộp nhiều kiểu đánh có cùng số

### Định nghĩa

Cách viết này cho phép đặt nhiều kiểu cược khác nhau trên cùng một tập hợp số, với mỗi kiểu cược có mức tiền cược riêng.

### Ví dụ 1: 66.88da1.b5

- Số cược: 66, 88

- Kiểu cược 1: đá (da) với tiền cược 1.000đ/cặp

- Kiểu cược 2: bao lô (b) với tiền cược 5.000đ/số

Tách thành các dòng riêng biệt:

```

66.88da1

66b5

88b5

```

### Ví dụ 2: 23.45.67dd10.dau20.duoi5

- Số cược: 23, 45, 67

- Kiểu cược 1: đầu đuôi (dd) với 10.000đ/số

- Kiểu cược 2: đầu (dau) với 20.000đ/số

- Kiểu cược 3: đuôi (duoi) với 5.000đ/số

Tách thành các dòng riêng biệt:

```

23.45.67dd10

23.45.67dau20

23.45.67duoi5

```

### Ví dụ 3: tai.leb5.dd2

- Số cược:

  - Tài: 50 số từ 50-99

  - Lẻ: 50 số lẻ từ 01-99

- Kiểu cược 1: bao lô (b) với 5.000đ/số

- Kiểu cược 2: đầu đuôi (dd) với 2.000đ/số

Tách thành các dòng riêng biệt:

```

taib5

leb5

taidd2

ledd2

```

### Ví dụ 4: 123.456xc10.dxc5.dduoi2

- Số cược: 123, 456

- Kiểu cược 1: xỉu chủ (xc) với 10.000đ/số

- Kiểu cược 2: đảo xỉu chủ (dxc) với 5.000đ/số

- Kiểu cược 3: đảo xỉu chủ đuôi (dduoi) với 2.000đ/số

Tách thành các dòng riêng biệt:

```

123.456xc10

123.456dxc5

123.456dduoi2

```
