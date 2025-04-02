Triển khai phân tích mã cược người dùng đặt và tự động tách mã cược thành các phần riêng biệt theo các quy tắc sau:

"Gộp nhiều kiểu đánh có cùng số"

ví dụ → 66.8865b5 và 66.88da1 có thể viết như sau: 66.88da1.b5

1. Ví dụ chi tiết về `66.8865b5 và 66.88da1` có thể viết như sau: `66.88da1.b5`

Các ví dụ bổ sung khác:

2. `23.456xc10.dxc5`

   - Số: 23.456
   - Kiểu 1: `xc10` - Xỉu chủ 10.000đ
   - Kiểu 2: `dxc5` - Đảo xỉu chủ 5.000đ

3. `45.789dd15.dau10`

   - Số: 45.789
   - Kiểu 1: `dd15` - Đầu đuôi 15.000đ
   - Kiểu 2: `dau10` - Đầu 10.000đ

4. `12.345b7.da3`
   - Số: 12.345
   - Kiểu 1: `b7` - Bao lô 7 lô (7.000đ)
   - Kiểu 2: `da3` - Đá 3.000đ

Chi tiết về số cước và số tiền:

- **Số cước**:

  - Sử dụng dấu chấm (".") để phân cách
  - Có thể là 2, 3 hoặc 4 chữ số
  - Ví dụ: 23, 456, 12.345

- **Số tiền**:
  - Luôn đặt sau kiểu cược
  - Đơn vị tính là nghìn đồng (1 = 1.000đ)
  - Các định dạng hợp lệ:
    - `5` = 5.000đ
    - `10` = 10.000đ
    - `1,5` = 1.500đ
    - `75n` = 75.000đ

### Kết hợp 3 kiểu cược

1. `68.123xc10.da5.b3`

   - Số: 68.123
   - Kiểu 1: `xc10` - Xỉu chủ 10.000đ
   - Kiểu 2: `da5` - Đá 5.000đ
   - Kiểu 3: `b3` - Bao lô 3 lô (3.000đ)

2. `79.456dau15.duoi7.xc5`

   - Số: 79.456
   - Kiểu 1: `dau15` - Đầu 15.000đ
   - Kiểu 2: `duoi7` - Đuôi 7.000đ
   - Kiểu 3: `xc5` - Xỉu chủ 5.000đ

3. `55.789dd20.da10.b5`
   - Số: 55.789
   - Kiểu 1: `dd20` - Đầu đuôi 20.000đ
   - Kiểu 2: `da10` - Đá 10.000đ
   - Kiểu 3: `b5` - Bao lô 5 lô (5.000đ)

### Kết hợp 4 kiểu cược

1. `86.234xc15.da7.b4.dau10`

   - Số: 86.234
   - Kiểu 1: `xc15` - Xỉu chủ 15.000đ
   - Kiểu 2: `da7` - Đá 7.000đ
   - Kiểu 3: `b4` - Bao lô 4 lô (4.000đ)
   - Kiểu 4: `dau10` - Đầu 10.000đ

2. `92.567dit10.dau15.xc7.dd5`

   - Số: 92.567
   - Kiểu 1: `dit10` - Đuôi 10.000đ
   - Kiểu 2: `dau15` - Đầu 15.000đ
   - Kiểu 3: `xc7` - Xỉu chủ 7.000đ
   - Kiểu 4: `dd5` - Đầu đuôi 5.000đ

3. `43.210b6.xc12.da8.dit5`
   - Số: 43.210
   - Kiểu 1: `b6` - Bao lô 6 lô (6.000đ)
   - Kiểu 2: `xc12` - Xỉu chủ 12.000đ
   - Kiểu 3: `da8` - Đá 8.000đ
   - Kiểu 4: `dit5` - Đuôi 5.000đ

### Lưu ý quan trọng:

- Thứ tự các kiểu cược không quan trọng
- Mỗi kiểu cược được viết ngay sau số, phân cách bằng dấu chấm
- Số tiền của mỗi kiểu cược có thể khác nhau
- Hệ thống chấp nhận nhiều kiểu cược cho cùng một số

**Yêu cầu hệ thống phải tự động nhận diện các kiểu cược này và tách chúng ra thành các phần riêng biệt.**

### Ví dụ chi tiết về mã cược với mã miền và tách mã

1. Mã cược gốc:

```
2dmn
66.88da1.b5
```

Hệ thống sẽ tự động tách thành:

```
2dmn
66.88da1
66.88b5
```

Các ví dụ mở rộng:

2. Miền Nam:

```
3mn
45.789dd15.dau10
```

Tách thành:

```
3mn
45.789dd15
45.789dau10
```

3. Miền Bắc:

```
1mb
23.456xc10.dxc5
```

Tách thành:

```
1mb
23.456xc10
23.456dxc5
```

4. Miền Trung:

```
2mt
92.567dit10.xc7
```

Tách thành:

```
2mt
92.567dit10
92.567xc7
```

### Quy tắc mã miền:

- `1mb`: Miền Bắc
- `2mt`: Miền Trung
- `3mn`: Miền Nam
- `2dmn`: Đa miền (nhiều miền)

### Ví dụ phức tạp:

```
2dmn
86.234xc15.da7.b4.dau10
```

Hệ thống sẽ tách thành:

```
2dmn
86.234xc15
86.234da7
86.234b4
86.234dau10
```
