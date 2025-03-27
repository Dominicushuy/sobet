# Tài liệu tham khảo: Cách hiểu và viết mã cược xổ số

## Mục lục

1. [Cấu trúc cơ bản của mã cược](#cấu-trúc-cơ-bản-của-mã-cược)
2. [Quy tắc đặt cược theo đài](#quy-tắc-đặt-cược-theo-đài)
3. [Kiểu cược và cách viết tắt](#kiểu-cược-và-cách-viết-tắt)
4. [Cách gộp số thành nhóm](#cách-gộp-số-thành-nhóm)
5. [Cách gộp nhiều kiểu đánh](#cách-gộp-nhiều-kiểu-đánh)
6. [Các cách viết số đặc biệt](#các-cách-viết-số-đặc-biệt)
7. [Ví dụ phân tích mã cược phức tạp](#ví-dụ-phân-tích-mã-cược-phức-tạp)
8. [Cách tính tiền cược và tiềm năng thắng](#cách-tính-tiền-cược-và-tiềm-năng-thắng)
9. [Các lỗi thường gặp và cách khắc phục](#các-lỗi-thường-gặp-và-cách-khắc-phục)

## Cấu trúc cơ bản của mã cược

Mã cược bao gồm 4 phần chính:

1. **Đài cược**: Chọn đài hoặc miền để đặt cược
2. **Số cược**: Chọn một hoặc nhiều số để đặt cược
3. **Kiểu cược**: Chọn kiểu đặt cược
4. **Số tiền cược**: Số tiền đặt cược (đơn vị nghìn đồng)

### Quy tắc cú pháp cơ bản:

```
[đài cược]
[số cược 1][kiểu cược 1][số tiền cược 1]
[số cược 2][kiểu cược 2][số tiền cược 2]
...
```

### Ví dụ cơ bản:

```
mb
23.45.67dd10
```

Trong đó:

- `mb`: Miền Bắc
- `23.45.67`: Số cược (23, 45 và 67)
- `dd`: Kiểu cược đầu đuôi
- `10`: Tiền cược 10.000đ/số

### Ví dụ mã cược phức tạp hơn:

```
vl.ct
25.36.47b10
58.69da5
123.456xc2
```

Trong đó:

- `vl.ct`: Đài Vĩnh Long và Cần Thơ
- Dòng 1: Số 25, 36, 47 đánh bao lô 10.000đ/số
- Dòng 2: Số 58, 69 đánh đá 5.000đ/cặp
- Dòng 3: Số 123, 456 đánh xỉu chủ 2.000đ/số

## Quy tắc đặt cược theo đài

### 1. Cược đài đơn lẻ

#### Miền Nam

Các đài Miền Nam có thể viết dưới dạng tên đầy đủ hoặc viết tắt:

```
vl
25.36dd10
```

hoặc

```
vinhlong
25.36dd10
```

#### Miền Trung

Tương tự, đài Miền Trung:

```
dn
25.36dd10
```

hoặc

```
danang
25.36dd10
```

#### Miền Bắc

Miền Bắc thường được viết dưới dạng:

```
mb
25.36dd10
```

hoặc

```
mienbac
25.36dd10
```

### 2. Cược nhiều đài cụ thể

Có thể đặt cược trên nhiều đài cụ thể bằng cách ghép tên các đài, phân cách bằng dấu chấm:

```
vl.ct
25.36dd10
```

Trong đó:

- `vl.ct`: Đài Vĩnh Long và Cần Thơ
- Hệ thống sẽ tự động nhân tiền cược với số đài (2 đài = nhân đôi tiền cược)

### 3. Cược nhiều đài theo miền

Thay vì liệt kê từng đài, có thể cược nhiều đài trong một miền:

```
2dmn
25.36dd10
```

Trong đó:

- `2dmn`: 2 đài miền Nam bất kỳ
- Số trước `dmn` xác định số lượng đài muốn cược

Các dạng tương tự:

- `3dmt`: 3 đài miền Trung
- `2dn`: 2 đài miền Nam (viết tắt)
- `3dt`: 3 đài miền Trung (viết tắt)

## Kiểu cược và cách viết tắt

### Các kiểu cược phổ biến:

| Kiểu cược   | Cách viết tắt | Mô tả                                |
| ----------- | ------------- | ------------------------------------ |
| Đầu đuôi    | dd            | Cược cả đầu và đuôi của một số       |
| Bao lô      | b, bao        | Cược bao lô (khớp với tất cả vị trí) |
| Xỉu chủ     | xc, x         | Cược số có 3 chữ số                  |
| Đầu         | dau           | Chỉ cược phần đầu                    |
| Đuôi        | duoi, dui     | Chỉ cược phần đuôi                   |
| Đá          | da, dv        | Cược nhiều số khớp cùng lúc          |
| Đảo bao lô  | daob, bdao    | Cược tất cả hoán vị của số           |
| Bao lô 7    | b7l, baobay   | Cược 7 lô cụ thể (Miền Nam/Trung)    |
| Bao lô 8    | b8l, baotam   | Cược 8 lô cụ thể (Miền Bắc)          |
| Đảo xỉu chủ | dxc, xcdao    | Cược hoán vị của số 3 chữ số         |
| Nhất to     | nt, nto       | Chỉ cược giải nhất (Miền Bắc)        |

## Cách gộp số thành nhóm

### 1. Gộp nhiều số 2 chữ số với dấu chấm

```
23.45.67dd10
```

Đây là cách viết thông thường để liệt kê nhiều số, trong đó:

- `23`, `45`, `67`: Ba số cược riêng biệt
- `dd10`: Đánh đầu đuôi 10.000đ/số

### 2. Gộp nhiều số không có dấu chấm

#### Ví dụ: `1234.5678dd10`

Hệ thống sẽ tự động phân tách thành các cặp số 2 chữ số:

- `1234` → `12` và `34`
- `5678` → `56` và `78`

Tương đương với:

```
12.34.56.78dd10
```

#### Ví dụ phức tạp: `010203.040506dd10`

Hệ thống sẽ tự động phân tách:

- `010203` → `01`, `02`, `03`
- `040506` → `04`, `05`, `06`

Tương đương với:

```
01.02.03.04.05.06dd10
```

### 3. Gộp nhiều số 3 chữ số

```
123.456.789xc10
```

Trong đó:

- `123`, `456`, `789`: Ba số 3 chữ số riêng biệt
- `xc10`: Đánh xỉu chủ 10.000đ/số

### 4. Sử dụng kiểu kéo (sequence)

Cú pháp: `[số đầu]/[số tiếp theo]keo[số cuối]`

#### Ví dụ 1: `10/20keo90dd10`

Tạo dãy số: 10, 20, 30, 40, 50, 60, 70, 80, 90
Tương đương với:

```
10.20.30.40.50.60.70.80.90dd10
```

#### Ví dụ 2: `10/11keo19dd10`

Tạo dãy số: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
Tương đương với:

```
10.11.12.13.14.15.16.17.18.19dd10
```

#### Ví dụ 3: `111/222keo999xc10`

Tạo dãy số: 111, 222, 333, 444, 555, 666, 777, 888, 999
Tương đương với:

```
111.222.333.444.555.666.777.888.999xc10
```

## Cách gộp nhiều kiểu đánh

### 1. Gộp nhiều kiểu đánh có cùng số cược

#### Ví dụ 1: `23.45dd10.dau5`

Trong đó:

- Số cược: `23` và `45`
- `dd10`: Đánh đầu đuôi 10.000đ/số
- `dau5`: Đánh đầu 5.000đ/số

Tương đương với:

```
23.45dd10
23.45dau5
```

#### Ví dụ 2: `123.456xc10.dxc5.dduoi2`

Trong đó:

- Số cược: `123` và `456`
- `xc10`: Đánh xỉu chủ 10.000đ/số
- `dxc5`: Đánh đảo xỉu chủ 5.000đ/số
- `dduoi2`: Đánh đảo xỉu chủ đuôi 2.000đ/số

Tương đương với:

```
123.456xc10
123.456dxc5
123.456dduoi2
```

### 2. Cách tách các kiểu cược khác nhau

#### Ví dụ: `23.45dd10 67.89b5`

Trong một dòng, hệ thống sẽ tự động tách thành hai phần cược:

- `23.45dd10`: Số 23, 45 đánh đầu đuôi 10.000đ/số
- `67.89b5`: Số 67, 89 đánh bao lô 5.000đ/số

## Các cách viết số đặc biệt

### 1. Sử dụng từ khóa đặc biệt

| Từ khóa  | Ý nghĩa                    | Số tương ứng    |
| -------- | -------------------------- | --------------- |
| tai      | Tài (50 số từ 50-99)       | 50, 51, ..., 99 |
| xiu      | Xỉu (50 số từ 00-49)       | 00, 01, ..., 49 |
| chan     | Chẵn (50 số chẵn từ 00-98) | 00, 02, ..., 98 |
| le       | Lẻ (50 số lẻ từ 01-99)     | 01, 03, ..., 99 |
| chanchan | Chẵn Chẵn (25 số)          | 00, 02, ..., 88 |
| lele     | Lẻ Lẻ (25 số)              | 11, 13, ..., 99 |
| chanle   | Chẵn Lẻ (25 số)            | 01, 03, ..., 89 |
| lechan   | Lẻ Chẵn (25 số)            | 10, 12, ..., 98 |

#### Ví dụ: `taib10`

Đánh bao lô 10.000đ/số cho tất cả 50 số từ 50-99.

#### Ví dụ: `chanchandd5 leledd5`

Đánh đầu đuôi 5.000đ/số cho:

- Tất cả 25 số chẵn chẵn (00, 02, ..., 88)
- Tất cả 25 số lẻ lẻ (11, 13, ..., 99)

### 2. Kết hợp từ khóa đặc biệt với nhiều kiểu cược

#### Ví dụ: `tai.leb5.dd2`

Trong đó:

- Số cược: Tài (50-99) và Lẻ (01, 03, ..., 99)
- `b5`: Đánh bao lô 5.000đ/số
- `dd2`: Đánh đầu đuôi 2.000đ/số

Tương đương với:

```
taib5
leb5
taidd2
ledd2
```

## Ví dụ phân tích mã cược phức tạp

### Ví dụ 1: Mã cược với nhiều đài và kiểu cược

```
vl.ct.tg
123.456xc10
78.90da5
010203b2
tai.chandd1
```

Phân tích:

1. Đài cược: Vĩnh Long, Cần Thơ và Tiền Giang (3 đài)
2. Dòng 1: Số 123, 456 đánh xỉu chủ 10.000đ/số
3. Dòng 2: Số 78, 90 đánh đá 5.000đ/cặp
4. Dòng 3: Số 01, 02, 03 đánh bao lô 2.000đ/số
5. Dòng 4: Tất cả số tài (50-99) và số chẵn (00, 02, ..., 98) đánh đầu đuôi 1.000đ/số

Tiền cược sẽ được nhân với 3 (3 đài).

### Ví dụ 2: Mã cược với kết hợp kéo và nhiều kiểu cược

```
2dmt
10/20keo90b10.dd5
01/33keo99da5
chanchan.leleduoi2
```

Phân tích:

1. Đài cược: 2 đài miền Trung bất kỳ
2. Dòng 1: Dãy số 10, 20, ..., 90 đánh bao lô 10.000đ/số và đầu đuôi 5.000đ/số
3. Dòng 2: Dãy số 01, 33, 66, 99 đánh đá 5.000đ/cặp
4. Dòng 3: Tất cả số chẵn chẵn và lẻ lẻ đánh đuôi 2.000đ/số

### Ví dụ 3: Mã cược phức tạp với số không dấu chấm

```
mb
123456xc10
7890123456da5
01/11keo99dau2
10/20keo90.chanleb5
```

Phân tích:

1. Đài cược: Miền Bắc
2. Dòng 1: Số 123, 456 đánh xỉu chủ 10.000đ/số (tự động tách)
3. Dòng 2: Số 78-90, 12-34, 56 đánh đá 5.000đ/cặp (tự động tách thành cặp 2 chữ số)
4. Dòng 3: Dãy số 01, 11, ..., 99 đánh đầu 2.000đ/số
5. Dòng 4: Dãy số 10, 20, ..., 90 và tất cả số chẵn lẻ đánh bao lô 5.000đ/số

## Cách tính tiền cược và tiềm năng thắng

### 1. Công thức tính tiền cược

```
Tiền đóng = [Số đài] × [Số cược] × [Số tổ hợp] × [Số tiền cược] × [Hệ số nhân]
```

#### Ví dụ: `2dmn 23.45dd10`

- Số đài: 2
- Số cược: 2 (23 và 45)
- Số tổ hợp: 2 (đầu đuôi)
- Số tiền cược: 10.000đ
- Hệ số nhân: 0.8

Tiền đóng = 2 × 2 × 2 × 10.000 × 0.8 = 64.000đ

### 2. Công thức tính tiềm năng thắng

```
Tiềm năng thắng = [Số tiền cược] × [Tỉ lệ thưởng] × [Số lượng số đặt]
```

#### Ví dụ: `2dmn 23.45dd10`

- Số tiền cược: 10.000đ
- Tỉ lệ thưởng cho kiểu đầu đuôi: 75
- Số lượng số đặt: 2 (23 và 45)

Tiềm năng thắng = 10.000 × 75 × 2 = 1.500.000đ

### 3. Tính tiền đá đặc biệt

Với kiểu đá, công thức tính tiền đóng:

```
Tiền đóng = [Số đài] × [Số cặp] × [Số tổ hợp] × [Số tiền cược] × [Hệ số nhân]
```

Trong đó, số cặp được tính theo công thức tổ hợp: C(n,2) = n\*(n-1)/2

#### Ví dụ: `mb 23.45.67da5`

- Số đài: 1
- Số cặp: C(3,2) = 3 (cặp 23-45, 23-67, 45-67)
- Số tổ hợp: 27 (miền Bắc)
- Số tiền cược: 5.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 3 × 27 × 5.000 × 0.8 = 324.000đ

Tiềm năng thắng phụ thuộc vào tỉ lệ thưởng của kiểu đá:

- Miền Bắc: 650
- 1 đài miền Nam/Trung: 750
- 2 đài miền Nam/Trung: 550

## Các lỗi thường gặp và cách khắc phục

### 1. Lỗi đài không hợp lệ

#### Lỗi: Viết sai tên đài hoặc đài không xổ trong ngày hiện tại

```
dltp
23.45dd10
```

#### Sửa:

```
dt
23.45dd10
```

hoặc

```
dongthap
23.45dd10
```

### 2. Lỗi kiểu cược không hợp lệ với miền

#### Lỗi: Sử dụng b8l (bao lô 8) cho miền Nam

```
vl
23.45b8l10
```

#### Sửa:

```
vl
23.45b7l10
```

hoặc

```
vl
23.45b10
```

### 3. Lỗi số chữ số không phù hợp với kiểu cược

#### Lỗi: Sử dụng số 3 chữ số với kiểu đầu đuôi

```
mb
123dd10
```

#### Sửa:

```
mb
123xc10
```

hoặc

```
mb
12dd10
```

### 4. Lỗi thiếu kiểu cược hoặc tiền cược

#### Lỗi: Chỉ có số mà không có kiểu cược hoặc tiền cược

```
mb
23.45.67
```

#### Sửa:

```
mb
23.45.67dd10
```

### 5. Lỗi đài trùng lặp hoặc không cùng miền

#### Lỗi: Kết hợp đài miền Nam và miền Trung

```
vl.dn
23.45dd10
```

#### Sửa:

```
vl.ct
23.45dd10
```

hoặc

```
dn.tthue
23.45dd10
```

### Tổng kết

Việc nắm vững cách viết và hiểu mã cược sẽ giúp quá trình đặt cược diễn ra nhanh chóng và chính xác. Hãy tuân thủ các quy tắc về cấu trúc, tên đài, kiểu cược và số tiền để tránh các lỗi không đáng có. Nếu gặp lỗi, hãy tham khảo phần sửa lỗi hoặc ví dụ trên để điều chỉnh mã cược của bạn.
