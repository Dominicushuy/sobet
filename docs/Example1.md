# Phụ lục: Ví dụ chi tiết về cách tính tiền cược và tiềm năng thắng

## Mục lục

1. [Đầu đuôi (dd)](#1-đầu-đuôi-dd)
2. [Xỉu chủ (xc)](#2-xỉu-chủ-xc)
3. [Đầu (dau)](#3-đầu-dau)
4. [Đuôi (duoi)](#4-đuôi-duoi)
5. [Bao lô (b)](#5-bao-lô-b)
6. [Đảo bao lô (bdao)](#6-đảo-bao-lô-bdao)
7. [Bao lô 7 và Bao lô 8](#7-bao-lô-7-và-bao-lô-8)
8. [Đá (da)](#8-đá-da)
9. [Đảo xỉu chủ và biến thể](#9-đảo-xỉu-chủ-và-biến-thể)
10. [Nhất to (nt)](#10-nhất-to-nt)
11. [Các kiểu tổ hợp số](#11-các-kiểu-tổ-hợp-số)
12. [Mã cược phức hợp](#12-mã-cược-phức-hợp)

> **Lưu ý**: Trong tất cả các ví dụ, áp dụng hệ số nhân (betMultiplier) là 0.8. Tùy thuộc vào cài đặt người dùng, hệ số này có thể thay đổi.

## 1. Đầu đuôi (dd)

### Ví dụ 1: Đầu đuôi đài đơn

```
tpho
23.45.67dd10
```

**Giải thích:**

- Đài: TP.HCM (tpho)
- Số cược: 23, 45, 67
- Kiểu cược: Đầu đuôi (dd)
- Tiền cược: 10.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 3
- Số tổ hợp cho mỗi số: 2 (đầu và đuôi)
- Tiền cược mỗi số: 10.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 3 × 2 × 10.000 × 0.8 = 48.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 10.000 × 75 = 750.000đ
- Tiềm năng thắng tất cả: 750.000 × 3 = 2.250.000đ

### Ví dụ 2: Đầu đuôi nhiều đài miền Nam

```
2dmn
12.34dd5
```

**Giải thích:**

- Đài: 2 đài miền Nam bất kỳ
- Số cược: 12, 34
- Kiểu cược: Đầu đuôi (dd)
- Tiền cược: 5.000đ/số

**Tính tiền đóng:**

- Số đài: 2
- Số cược: 2
- Số tổ hợp cho mỗi số: 2 (đầu và đuôi)
- Tiền cược mỗi số: 5.000đ
- Hệ số nhân: 0.8

Tiền đóng = 2 × 2 × 2 × 5.000 × 0.8 = 32.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 5.000 × 75 = 375.000đ
- Tiềm năng thắng tất cả: 375.000 × 2 = 750.000đ

### Ví dụ 3: Đầu đuôi miền Bắc

```
mb
01.02.03dd20
```

**Giải thích:**

- Đài: Miền Bắc (mb)
- Số cược: 01, 02, 03
- Kiểu cược: Đầu đuôi (dd)
- Tiền cược: 20.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 3
- Số tổ hợp cho miền Bắc: 5 (4 lô ở giải 7 + 1 lô ở giải đặc biệt)
- Tiền cược mỗi số: 20.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 3 × 5 × 20.000 × 0.8 = 240.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 20.000 × 75 = 1.500.000đ
- Tiềm năng thắng tất cả: 1.500.000 × 3 = 4.500.000đ

## 2. Xỉu chủ (xc)

### Ví dụ 1: Xỉu chủ đài đơn miền Nam

```
vl
123.456.789xc2
```

**Giải thích:**

- Đài: Vĩnh Long (vl)
- Số cược: 123, 456, 789
- Kiểu cược: Xỉu chủ (xc)
- Tiền cược: 2.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 3
- Số tổ hợp cho miền Nam: 2 (1 lô ở giải 7 + 1 lô ở giải đặc biệt)
- Tiền cược mỗi số: 2.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 3 × 2 × 2.000 × 0.8 = 9.600đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 2.000 × 650 = 1.300.000đ
- Tiềm năng thắng tất cả: 1.300.000 × 3 = 3.900.000đ

### Ví dụ 2: Xỉu chủ miền Bắc

```
mb
123.234.345xc5
```

**Giải thích:**

- Đài: Miền Bắc (mb)
- Số cược: 123, 234, 345
- Kiểu cược: Xỉu chủ (xc)
- Tiền cược: 5.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 3
- Số tổ hợp cho miền Bắc: 4 (3 lô ở giải 6 + 1 lô ở giải đặc biệt)
- Tiền cược mỗi số: 5.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 3 × 4 × 5.000 × 0.8 = 48.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 5.000 × 650 = 3.250.000đ
- Tiềm năng thắng tất cả: 3.250.000 × 3 = 9.750.000đ

## 3. Đầu (dau)

### Ví dụ 1: Đầu 2 chữ số

```
tp.dt
23.45.67dau15
```

**Giải thích:**

- Đài: TP.HCM (tp) và Đồng Tháp (dt)
- Số cược: 23, 45, 67
- Kiểu cược: Đầu (dau)
- Tiền cược: 15.000đ/số

**Tính tiền đóng:**

- Số đài: 2
- Số cược: 3
- Số tổ hợp cho mỗi đài miền Nam: 1 (1 lô ở giải 8)
- Tiền cược mỗi số: 15.000đ
- Hệ số nhân: 0.8

Tiền đóng = 2 × 3 × 1 × 15.000 × 0.8 = 72.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 15.000 × 75 = 1.125.000đ
- Tiềm năng thắng tất cả: 1.125.000 × 3 = 3.375.000đ

### Ví dụ 2: Đầu 3 chữ số

```
mb
123.234.345dau10
```

**Giải thích:**

- Đài: Miền Bắc (mb)
- Số cược: 123, 234, 345
- Kiểu cược: Đầu (dau)
- Tiền cược: 10.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 3
- Số tổ hợp cho miền Bắc với số 3 chữ số: 3 (3 lô ở giải 6)
- Tiền cược mỗi số: 10.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 3 × 3 × 10.000 × 0.8 = 72.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 10.000 × 650 = 6.500.000đ
- Tiềm năng thắng tất cả: 6.500.000 × 3 = 19.500.000đ

## 4. Đuôi (duoi)

### Ví dụ 1: Đuôi 2 chữ số nhiều đài

```
3dmn
34.56.78duoi10
```

**Giải thích:**

- Đài: 3 đài miền Nam bất kỳ
- Số cược: 34, 56, 78
- Kiểu cược: Đuôi (duoi)
- Tiền cược: 10.000đ/số

**Tính tiền đóng:**

- Số đài: 3
- Số cược: 3
- Số tổ hợp cho mỗi đài: 1 (1 lô ở giải đặc biệt)
- Tiền cược mỗi số: 10.000đ
- Hệ số nhân: 0.8

Tiền đóng = 3 × 3 × 1 × 10.000 × 0.8 = 72.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 10.000 × 75 = 750.000đ
- Tiềm năng thắng tất cả: 750.000 × 3 = 2.250.000đ

### Ví dụ 2: Đuôi 3 chữ số

```
mb
123.234.345duoi5
```

**Giải thích:**

- Đài: Miền Bắc (mb)
- Số cược: 123, 234, 345
- Kiểu cược: Đuôi (duoi)
- Tiền cược: 5.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 3
- Số tổ hợp cho miền Bắc: 1 (1 lô ở giải đặc biệt)
- Tiền cược mỗi số: 5.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 3 × 1 × 5.000 × 0.8 = 12.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 5.000 × 650 = 3.250.000đ
- Tiềm năng thắng tất cả: 3.250.000 × 3 = 9.750.000đ

## 5. Bao lô (b)

### Ví dụ 1: Bao lô 2 chữ số

```
vl
23.45.67b5
```

**Giải thích:**

- Đài: Vĩnh Long (vl)
- Số cược: 23, 45, 67
- Kiểu cược: Bao lô (b)
- Tiền cược: 5.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 3
- Số tổ hợp cho miền Nam: 18 (tất cả các giải)
- Tiền cược mỗi số: 5.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 3 × 18 × 5.000 × 0.8 = 216.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 5.000 × 75 = 375.000đ
- Tiềm năng thắng tất cả: 375.000 × 3 = 1.125.000đ

### Ví dụ 2: Bao lô 3 chữ số

```
mb
123.234.345b1
```

**Giải thích:**

- Đài: Miền Bắc (mb)
- Số cược: 123, 234, 345
- Kiểu cược: Bao lô (b)
- Tiền cược: 1.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 3
- Số tổ hợp cho miền Bắc với số 3 chữ số: 23 (tất cả giải trừ giải 7)
- Tiền cược mỗi số: 1.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 3 × 23 × 1.000 × 0.8 = 55.200đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 1.000 × 650 = 650.000đ
- Tiềm năng thắng tất cả: 650.000 × 3 = 1.950.000đ

### Ví dụ 3: Bao lô 4 chữ số

```
tpho
1234.5678b0.5
```

**Giải thích:**

- Đài: TP.HCM (tpho)
- Số cược: 1234, 5678
- Kiểu cược: Bao lô (b)
- Tiền cược: 500đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 2
- Số tổ hợp cho miền Nam với số 4 chữ số: 16 (tất cả giải trừ giải 7 và 8)
- Tiền cược mỗi số: 500đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 2 × 16 × 500 × 0.8 = 12.800đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 500 × 5500 = 2.750.000đ
- Tiềm năng thắng tất cả: 2.750.000 × 2 = 5.500.000đ

## 6. Đảo bao lô (bdao)

### Ví dụ 1: Đảo bao lô 2 chữ số

```
vl
23.45.67bdao5
```

**Giải thích:**

- Đài: Vĩnh Long (vl)
- Số cược: 23, 45, 67
- Kiểu cược: Đảo bao lô (bdao)
- Tiền cược: 5.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 3
- Số hoán vị cho mỗi số: 2 (23 và 32, 45 và 54, 67 và 76)
- Số tổ hợp cho miền Nam: 18 (tất cả các giải)
- Tiền cược mỗi số: 5.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 3 × 2 × 18 × 5.000 × 0.8 = 432.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 5.000 × 75 = 375.000đ
- Tiềm năng thắng tất cả: 375.000 × 3 = 1.125.000đ

### Ví dụ 2: Đảo bao lô 3 chữ số

```
mb
123bdao1
```

**Giải thích:**

- Đài: Miền Bắc (mb)
- Số cược: 123
- Kiểu cược: Đảo bao lô (bdao)
- Tiền cược: 1.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 1
- Số hoán vị cho số 123: 6 (123, 132, 213, 231, 312, 321)
- Số tổ hợp cho miền Bắc với số 3 chữ số: 23 (tất cả giải trừ giải 7)
- Tiền cược mỗi số: 1.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 1 × 6 × 23 × 1.000 × 0.8 = 110.400đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 1.000 × 650 = 650.000đ
- Tiềm năng thắng tất cả: 650.000 × 1 = 650.000đ

## 7. Bao lô 7 và Bao lô 8

### Ví dụ 1: Bao lô 7 (Miền Nam)

```
vl
23.45.67b7l5
```

**Giải thích:**

- Đài: Vĩnh Long (vl)
- Số cược: 23, 45, 67
- Kiểu cược: Bao lô 7 (b7l)
- Tiền cược: 5.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 3
- Số tổ hợp cho miền Nam: 7 (giải 8, 7, 6, 5 và đặc biệt)
- Tiền cược mỗi số: 5.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 3 × 7 × 5.000 × 0.8 = 84.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 5.000 × 75 = 375.000đ
- Tiềm năng thắng tất cả: 375.000 × 3 = 1.125.000đ

### Ví dụ 2: Bao lô 8 (Miền Bắc)

```
mb
23.45.67b8l5
```

**Giải thích:**

- Đài: Miền Bắc (mb)
- Số cược: 23, 45, 67
- Kiểu cược: Bao lô 8 (b8l)
- Tiền cược: 5.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 3
- Số tổ hợp cho miền Bắc: 8 (4 lô ở giải 7, 3 lô ở giải 6 và 1 lô ở giải đặc biệt)
- Tiền cược mỗi số: 5.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 3 × 8 × 5.000 × 0.8 = 96.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 5.000 × 75 = 375.000đ
- Tiềm năng thắng tất cả: 375.000 × 3 = 1.125.000đ

### Ví dụ 3: Bao lô 7 đảo (Miền Nam)

```
vl
23.45b7ldao5
```

**Giải thích:**

- Đài: Vĩnh Long (vl)
- Số cược: 23, 45
- Kiểu cược: Bao lô 7 đảo (b7ldao)
- Tiền cược: 5.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 2
- Số hoán vị cho mỗi số: 2 (23 và 32, 45 và 54)
- Số tổ hợp cho miền Nam: 7 (giải 8, 7, 6, 5 và đặc biệt)
- Tiền cược mỗi số: 5.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 2 × 2 × 7 × 5.000 × 0.8 = 112.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 5.000 × 75 = 375.000đ
- Tiềm năng thắng tất cả: 375.000 × 2 = 750.000đ

## 8. Đá (da)

### Ví dụ 1: Đá 1 đài

```
vl
23.45.67.89da10
```

**Giải thích:**

- Đài: Vĩnh Long (vl)
- Số cược: 23, 45, 67, 89
- Kiểu cược: Đá (da)
- Tiền cược: 10.000đ/cặp

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 4
- Số cặp (hệ số vòng): C(4,2) = 4×3/2 = 6 cặp (23-45, 23-67, 23-89, 45-67, 45-89, 67-89)
- Số tổ hợp cho miền Nam: 18 (tất cả các giải)
- Tiền cược mỗi cặp: 10.000đ
- Hệ số nhân: 0.8
- Hệ số đá: 2

Tiền đóng = 1 × 6 × 18 × 10.000 × 0.8 × 2 = 1.728.000đ

**Tính tiềm năng thắng:**

- Tỉ lệ thưởng cho đá 1 đài: 750
- Tiềm năng thắng cho 1 cặp: 10.000 × 750 = 7.500.000đ
- Tiềm năng thắng tất cả: 7.500.000 × 6 = 45.000.000đ

### Ví dụ 2: Đá 2 đài

```
tp.dt
23.45.67da5
```

**Giải thích:**

- Đài: TP.HCM (tp) và Đồng Tháp (dt)
- Số cược: 23, 45, 67
- Kiểu cược: Đá (da)
- Tiền cược: 5.000đ/cặp

**Tính tiền đóng:**

- Số đài: 2
- Số cược: 3
- Số cặp (hệ số vòng): C(3,2) = 3×2/2 = 3 cặp (23-45, 23-67, 45-67)
- Số tổ hợp cho miền Nam: 18 (tất cả các giải)
- Tiền cược mỗi cặp: 5.000đ
- Hệ số nhân: 0.8
- Hệ số đá: 2

Tiền đóng = 2 × 3 × 18 × 5.000 × 0.8 × 2 = 864.000đ

**Tính tiềm năng thắng:**

- Tỉ lệ thưởng cho đá 2 đài: 550
- Tiềm năng thắng cho 1 cặp: 5.000 × 550 = 2.750.000đ
- Tiềm năng thắng tất cả: 2.750.000 × 3 × 2 = 16.500.000đ

### Ví dụ 3: Đá miền Bắc

```
mb
23.45.67.89da2
```

**Giải thích:**

- Đài: Miền Bắc (mb)
- Số cược: 23, 45, 67, 89
- Kiểu cược: Đá (da)
- Tiền cược: 2.000đ/cặp

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 4
- Số cặp (hệ số vòng): C(4,2) = 4×3/2 = 6 cặp
- Số tổ hợp cho miền Bắc: 27 (tất cả các giải)
- Tiền cược mỗi cặp: 2.000đ
- Hệ số nhân: 0.8
- Hệ số đá: 2

Tiền đóng = 1 × 6 × 27 × 2.000 × 0.8 × 2 = 518.400đ

**Tính tiềm năng thắng:**

- Tỉ lệ thưởng cho đá miền Bắc: 650
- Tiềm năng thắng cho 1 cặp: 2.000 × 650 = 1.300.000đ
- Tiềm năng thắng tất cả: 1.300.000 × 6 = 7.800.000đ

## 9. Đảo xỉu chủ và biến thể

### Ví dụ 1: Đảo xỉu chủ

```
tp
123.321.456dxc5
```

**Giải thích:**

- Đài: TP.HCM (tp)
- Số cược: 123, 321, 456
- Kiểu cược: Đảo xỉu chủ (dxc)
- Tiền cược: 5.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 3
- Số hoán vị cho mỗi số:
  - 123: 6 hoán vị (123, 132, 213, 231, 312, 321)
  - 321: 6 hoán vị (nhưng trùng với hoán vị của 123, nên chỉ tính 1 lần)
  - 456: 6 hoán vị (456, 465, 546, 564, 645, 654)
- Số tổ hợp cho miền Nam: 2 (giải 7 và đặc biệt)
- Tiền cược mỗi số: 5.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × (6+6) × 2 × 5.000 × 0.8 = 96.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 5.000 × 650 = 3.250.000đ
- Tiềm năng thắng tất cả: 3.250.000 × 2 = 6.500.000đ

### Ví dụ 2: Đảo xỉu chủ đầu

```
mb
123.456ddau5
```

**Giải thích:**

- Đài: Miền Bắc (mb)
- Số cược: 123, 456
- Kiểu cược: Đảo xỉu chủ đầu (ddau)
- Tiền cược: 5.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 2
- Số hoán vị cho mỗi số: 6 hoán vị/số
- Số tổ hợp cho miền Bắc: 3 (3 lô ở giải 6)
- Tiền cược mỗi số: 5.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × (6+6) × 3 × 5.000 × 0.8 = 144.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 5.000 × 650 = 3.250.000đ
- Tiềm năng thắng tất cả: 3.250.000 × 2 = 6.500.000đ

### Ví dụ 3: Đảo xỉu chủ đuôi

```
tp
123.456dduoi5
```

**Giải thích:**

- Đài: TP.HCM (tp)
- Số cược: 123, 456
- Kiểu cược: Đảo xỉu chủ đuôi (dduoi)
- Tiền cược: 5.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 2
- Số hoán vị cho mỗi số: 6 hoán vị/số
- Số tổ hợp cho miền Nam: 1 (1 lô ở giải đặc biệt)
- Tiền cược mỗi số: 5.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × (6+6) × 1 × 5.000 × 0.8 = 48.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 5.000 × 650 = 3.250.000đ
- Tiềm năng thắng tất cả: 3.250.000 × 2 = 6.500.000đ

## 10. Nhất to (nt)

### Ví dụ 1: Nhất to 2 chữ số

```
mb
23.45.67nto10
```

**Giải thích:**

- Đài: Miền Bắc (mb)
- Số cược: 23, 45, 67
- Kiểu cược: Nhất to (nto)
- Tiền cược: 10.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 3
- Số tổ hợp: 1 (chỉ giải nhất)
- Tiền cược mỗi số: 10.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 3 × 1 × 10.000 × 0.8 = 24.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 10.000 × 75 = 750.000đ
- Tiềm năng thắng tất cả: 750.000 × 3 = 2.250.000đ

### Ví dụ 2: Nhất to 3 chữ số

```
mb
123.234.345nt5
```

**Giải thích:**

- Đài: Miền Bắc (mb)
- Số cược: 123, 234, 345
- Kiểu cược: Nhất to (nt)
- Tiền cược: 5.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 3
- Số tổ hợp: 1 (chỉ giải nhất)
- Tiền cược mỗi số: 5.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 3 × 1 × 5.000 × 0.8 = 12.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 5.000 × 650 = 3.250.000đ
- Tiềm năng thắng tất cả: 3.250.000 × 3 = 9.750.000đ

## 11. Các kiểu tổ hợp số

### Ví dụ 1: Kéo

```
tp
10/20keo90dd5
```

**Giải thích:**

- Đài: TP.HCM (tp)
- Số cược: Dãy số từ 10 đến 90 bước nhảy 10 (10, 20, 30, 40, 50, 60, 70, 80, 90)
- Kiểu cược: Đầu đuôi (dd)
- Tiền cược: 5.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 9 (số lượng số trong dãy)
- Số tổ hợp cho miền Nam: 2 (đầu và đuôi)
- Tiền cược mỗi số: 5.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 9 × 2 × 5.000 × 0.8 = 72.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 5.000 × 75 = 375.000đ
- Tiềm năng thắng tất cả: 375.000 × 9 = 3.375.000đ

### Ví dụ 2: Tài (50-99)

```
tp
taidd10
```

**Giải thích:**

- Đài: TP.HCM (tp)
- Số cược: Tài (50 số từ 50 đến 99)
- Kiểu cược: Đầu đuôi (dd)
- Tiền cược: 10.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 50 (số lượng số trong tài)
- Số tổ hợp cho miền Nam: 2 (đầu và đuôi)
- Tiền cược mỗi số: 10.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 50 × 2 × 10.000 × 0.8 = 800.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 10.000 × 75 = 750.000đ
- Tiềm năng thắng tất cả: 750.000 × 50 = 37.500.000đ

### Ví dụ 3: Chẵn chẵn

```
mb
chanchanduoi5
```

**Giải thích:**

- Đài: Miền Bắc (mb)
- Số cược: Chẵn chẵn (25 số có cả 2 chữ số đều chẵn)
- Kiểu cược: Đuôi (duoi)
- Tiền cược: 5.000đ/số

**Tính tiền đóng:**

- Số đài: 1
- Số cược: 25 (số lượng số chẵn chẵn)
- Số tổ hợp cho miền Bắc: 1 (giải đặc biệt)
- Tiền cược mỗi số: 5.000đ
- Hệ số nhân: 0.8

Tiền đóng = 1 × 25 × 1 × 5.000 × 0.8 = 100.000đ

**Tính tiềm năng thắng:**

- Tiềm năng thắng trên 1 số: 5.000 × 75 = 375.000đ
- Tiềm năng thắng tất cả: 375.000 × 25 = 9.375.000đ

## 12. Mã cược phức hợp

### Ví dụ 1: Nhiều dòng cược khác nhau

```
3dmn
01.02.03dd10
123.234.345xc2
45.56.67.78b5
19.91da10
```

**Giải thích:**

- Đài: 3 đài miền Nam bất kỳ
- Dòng 1: Số 01, 02, 03 kiểu đầu đuôi, tiền cược 10.000đ/số
- Dòng 2: Số 123, 234, 345 kiểu xỉu chủ, tiền cược 2.000đ/số
- Dòng 3: Số 45, 56, 67, 78 kiểu bao lô, tiền cược 5.000đ/số
- Dòng 4: Số 19, 91 kiểu đá, tiền cược 10.000đ/cặp

**Tính tiền đóng:**
Dòng 1: 3 × 3 × 2 × 10.000 × 0.8 = 144.000đ
Dòng 2: 3 × 3 × 2 × 2.000 × 0.8 = 28.800đ
Dòng 3: 3 × 4 × 18 × 5.000 × 0.8 = 864.000đ
Dòng 4: 3 × 1 × 18 × 10.000 × 0.8 × 2 = 864.000đ
Tổng tiền đóng = 1.900.800đ

**Tính tiềm năng thắng:**
Dòng 1:

- Tiềm năng thắng trên 1 số: 10.000 × 75 = 750.000đ
- Tiềm năng thắng tất cả: 750.000 × 3 = 2.250.000đ

Dòng 2:

- Tiềm năng thắng trên 1 số: 2.000 × 650 = 1.300.000đ
- Tiềm năng thắng tất cả: 1.300.000 × 3 = 3.900.000đ

Dòng 3:

- Tiềm năng thắng trên 1 số: 5.000 × 75 = 375.000đ
- Tiềm năng thắng tất cả: 375.000 × 4 = 1.500.000đ

Dòng 4:

- Tiềm năng thắng trên 1 cặp: 10.000 × 750 = 7.500.000đ
- Tiềm năng thắng tất cả: 7.500.000 × 1 = 7.500.000đ

Tổng tiềm năng thắng tất cả = 15.150.000đ

### Ví dụ 2: Kết hợp nhiều loại cược trên cùng dãy số

```
mb
23.45.67b5dd10xc2
```

**Giải thích:**

- Đài: Miền Bắc (mb)
- Số cược: 23, 45, 67
- Kiểu cược: Bao lô (b) 5.000đ/số, đầu đuôi (dd) 10.000đ/số, xỉu chủ (xc) 2.000đ/số

**Tính tiền đóng:**
Bao lô: 1 × 3 × 27 × 5.000 × 0.8 = 324.000đ
Đầu đuôi: 1 × 3 × 5 × 10.000 × 0.8 = 120.000đ
Xỉu chủ (áp dụng cho số 67): 1 × 1 × 4 × 2.000 × 0.8 = 6.400đ
Tổng tiền đóng = 450.400đ

**Tính tiềm năng thắng:**
Bao lô:

- Tiềm năng thắng trên 1 số: 5.000 × 75 = 375.000đ
- Tiềm năng thắng tất cả: 375.000 × 3 = 1.125.000đ

Đầu đuôi:

- Tiềm năng thắng trên 1 số: 10.000 × 75 = 750.000đ
- Tiềm năng thắng tất cả: 750.000 × 3 = 2.250.000đ

Xỉu chủ:

- Tiềm năng thắng trên 1 số: 2.000 × 650 = 1.300.000đ
- Tiềm năng thắng tất cả: 1.300.000 × 1 = 1.300.000đ

Tổng tiềm năng thắng tất cả = 4.675.000đ

### Ví dụ 3: Kết hợp kiểu tổ hợp số với nhiều loại cược

```
vl.ct
tai dau30 duoi10
chanchan b5 dd2
```

**Giải thích:**

- Đài: Vĩnh Long (vl) và Cần Thơ (ct)
- Dòng 1: Số tài (50-99) kiểu đầu 30.000đ/số và kiểu đuôi 10.000đ/số
- Dòng 2: Số chẵn chẵn (25 số) kiểu bao lô 5.000đ/số và đầu đuôi 2.000đ/số

**Tính tiền đóng:**
Dòng 1 (đầu): 2 × 50 × 1 × 30.000 × 0.8 = 2.400.000đ
Dòng 1 (đuôi): 2 × 50 × 1 × 10.000 × 0.8 = 800.000đ
Dòng 2 (bao lô): 2 × 25 × 18 × 5.000 × 0.8 = 3.600.000đ
Dòng 2 (đầu đuôi): 2 × 25 × 2 × 2.000 × 0.8 = 160.000đ
Tổng tiền đóng = 6.960.000đ

**Tính tiềm năng thắng:**
Dòng 1 (đầu):

- Tiềm năng thắng trên 1 số: 30.000 × 75 = 2.250.000đ
- Tiềm năng thắng tất cả: 2.250.000 × 50 = 112.500.000đ

Dòng 1 (đuôi):

- Tiềm năng thắng trên 1 số: 10.000 × 75 = 750.000đ
- Tiềm năng thắng tất cả: 750.000 × 50 = 37.500.000đ

Dòng 2 (bao lô):

- Tiềm năng thắng trên 1 số: 5.000 × 75 = 375.000đ
- Tiềm năng thắng tất cả: 375.000 × 25 = 9.375.000đ

Dòng 2 (đầu đuôi):

- Tiềm năng thắng trên 1 số: 2.000 × 75 = 150.000đ
- Tiềm năng thắng tất cả: 150.000 × 25 = 3.750.000đ

Tổng tiềm năng thắng tất cả = 163.125.000đ
