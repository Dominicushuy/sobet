# Quy tắc cược xổ số - Tài liệu tham khảo

## Mục lục

1. [Tổng quan](#tổng-quan)
2. [Phân loại đài và miền](#phân-loại-đài-và-miền)
3. [Cơ cấu giải thưởng](#cơ-cấu-giải-thưởng)
4. [Các kiểu đặt cược](#các-kiểu-đặt-cược)
5. [Kiểu chọn tổ hợp số](#kiểu-chọn-tổ-hợp-số)
6. [Cú pháp mã cược](#cú-pháp-mã-cược)
7. [Quy tắc tính tiền cược](#quy-tắc-tính-tiền-cược)
8. [Quy tắc tính tiền thắng](#quy-tắc-tính-tiền-thắng)
9. [Bảng so sánh các kiểu cược](#bảng-so-sánh-các-kiểu-cược)
10. [Mã cược ví dụ và giải thích](#mã-cược-ví-dụ-và-giải-thích)
11. [Lỗi thường gặp và cách khắc phục](#lỗi-thường-gặp-và-cách-khắc-phục)
12. [Thuật ngữ chuyên ngành](#thuật-ngữ-chuyên-ngành)
13. [Phụ lục ví dụ chi tiết](#phụ-lục-ví-dụ-chi-tiết)

## Tổng quan

Tài liệu này mô tả quy tắc cược xổ số lô đề dựa trên kết quả xổ số kiến thiết ở Việt Nam. Hệ thống chia làm 3 miền chính: Miền Bắc, Miền Trung và Miền Nam. Người chơi có thể đặt cược dựa trên nhiều kiểu cược khác nhau như đầu đuôi, xỉu chủ, đầu, đuôi, bao lô, v.v.

Mỗi lượt đặt cược sẽ tạo ra một tổ hợp mã (mã cược) bao gồm các thông tin về đài, số, kiểu đặt và số tiền. Hệ thống sẽ dựa vào tổ hợp mã này để tính tiền đóng, tỉ lệ thắng cược và số tiền thắng cược.

Để hiểu rõ hơn về cách tính tiền đóng và tiềm năng thắng, tài liệu này sẽ mô tả chi tiết các công thức tính toán kèm theo ví dụ cụ thể. Tài liệu cũng bao gồm các phụ lục với nhiều ví dụ chi tiết giúp người dùng dễ dàng nắm bắt và áp dụng trong thực tế.

## Phân loại đài và miền

### 1. Miền Nam

**Cách viết**: "mn", "dmn", "dn", "dnam", "miennam", "mien nam", "miền nam", "đài nam", "đài miền nam", "mnam".

**Cược nhiều đài**: Thêm số 2,3 trước các cách viết. Ví dụ: 2mn, 3mn, 2dmn, 3dmn, v.v.

**Lịch xổ**:

- **Chủ nhật**: Tiền Giang, Kiên Giang, Đà Lạt
- **Thứ hai**: TP. HCM, Đồng Tháp, Cà Mau
- **Thứ ba**: Bến Tre, Vũng Tàu, Bạc Liêu
- **Thứ tư**: Đồng Nai, Cần Thơ, Sóc Trăng
- **Thứ năm**: Tây Ninh, An Giang, Bình Thuận
- **Thứ sáu**: Vĩnh Long, Bình Dương, Trà Vinh
- **Thứ bảy**: TP. HCM, Long An, Bình Phước, Hậu Giang

**Cách viết từng đài**:

- Tiền Giang: "tg", "tgiang", "tiengiang", "tien giang", "tiền giang"
- Kiên Giang: "kg", "kgiang", "kiengiang", "kien giang", "kiên giang"
- Đà Lạt: "dl", "dlat" "dalat", "da lat", "đà lạt"
- Đồng Tháp: "dt", "dthap", "dongthap", "dong thap", "đồng tháp"
- Cà Mau: "cm", "cmau", "camau", "ca mau", "cà mau"
- TP. HCM: "hcm", "tp hcm", "thanh pho ho chi minh", "thành phố hồ chí minh", "tp", "tpho"
- Và các đài khác có cách viết tương tự

### 2. Miền Trung

**Cách viết**: "mt", "dmt", "dt", "dtrung", "mientrung", "mien trung", "miền trung", "đài trung", "đài miền trung", "mtrung"

**Cược nhiều đài**: Thêm số 2,3 trước các cách viết. Ví dụ: 2mt, 3mt, 2dmt, 3dmt, v.v.

**Lịch xổ**:

- **Chủ nhật**: Kon Tum, Khánh Hòa, Thừa Thiên Huế
- **Thứ hai**: Phú Yên, Thừa Thiên Huế
- **Thứ ba**: Đắk Lắk, Quảng Nam
- **Thứ tư**: Đà Nẵng, Khánh Hòa
- **Thứ năm**: Bình Định, Quảng Trị, Quảng Bình
- **Thứ sáu**: Gia Lai, Ninh Thuận
- **Thứ bảy**: Đà Nẵng, Quảng Ngãi, Đắk Nông

**Cách viết từng đài:**

- **Đà Nẵng**: "dn", "dnang", "danang", "da nang", "đà nẵng"
- **Quảng Nam**: "qn", "qnam", "quangnam", "quang nam", "quảng nam"
- **Đắk Lắk**: "dl", "dlak", "daklak", "dak lak", "đắk lắk"
- **Khánh Hòa**: "kh", "khoa", "khanhhoa", "khanh hoa", "khánh hòa"
- **Thừa Thiên Huế**: "hue", "tthue", "thuathienhue", "thua thien hue", "thừa thiên huế"
- **Phú Yên**: "py", "pyen", "phuyen", "phu yen", "phú yên"
- **Bình Định**: "bd", "bdinh", "binhdinh", "binh dinh", "bình định"
- **Quảng Trị**: "qt", "qtri", "quangtri", "quang tri", "quảng trị"
- **Quảng Bình**: "qb", "qbinh", "quangbinh", "quang binh", "quảng bình"
- **Gia Lai**: "gl", "glai", "gialai", "gia lai"
- **Ninh Thuận**: "nt", "nthuan", "ninhthuan", "ninh thuan", "ninh thuận"
- **Quảng Ngãi**: "qngai", "quangngai", "quang ngai", "quảng ngãi"
- **Đắk Nông**: "dn", "dnong", "daknong", "dak nong", "đắk nông"
- **Kon Tum**: "kt", "ktum", "kontum", "kon tum"

### 3. Miền Bắc

**Cách viết**: "mb", "hn", "hanoi", "mienbac", "db", "hà nội", "miền bắc", "daibac", "dbac", "đài bắc", "đài miền bắc"

Miền Bắc mỗi ngày chỉ xổ 1 đài, bao gồm các đài: Hà Nội, Quảng Ninh, Bắc Ninh, Hải Phòng, Nam Định, Thái Bình.

### Lưu ý

**Lưu ý:** Đối với đài Đà Nẵng và Đắk Nông cùng có ký hiệu viết tắt là "dn". Để tránh nhầm lẫn, đặc biệt trong ngày thứ Tư khi có cả Đà Nẵng và Đồng Nai (cũng viết tắt là "dn"), nên sử dụng cách viết đầy đủ hơn như "dnang" cho Đà Nẵng, "dnai" cho Đồng Nai.

## Cơ cấu giải thưởng

### Miền Trung và Miền Nam (18 lô)

- **Giải đặc biệt**: 1 lô có 6 chữ số
- **Giải nhất**: 1 lô có 5 chữ số
- **Giải nhì**: 1 lô có 5 chữ số
- **Giải ba**: 2 lô có 5 chữ số
- **Giải tư**: 7 lô có 5 chữ số
- **Giải năm**: 1 lô có 4 chữ số
- **Giải sáu**: 3 lô có 4 chữ số
- **Giải bảy**: 1 lô có 3 chữ số
- **Giải tám**: 1 lô có 2 chữ số

### Miền Bắc (27 lô)

- **Giải đặc biệt**: 1 lô có 5 chữ số
- **Giải nhất**: 1 lô có 5 chữ số
- **Giải nhì**: 2 lô có 5 chữ số
- **Giải ba**: 6 lô có 5 chữ số
- **Giải tư**: 4 lô có 4 chữ số
- **Giải năm**: 6 lô có 4 chữ số
- **Giải sáu**: 3 lô có 3 chữ số
- **Giải bảy**: 4 lô có 2 chữ số

## Các kiểu đặt cược

### 1. Đầu đuôi (dd)

- **Áp dụng**: Cả 3 miền
- **Quy tắc đặt**: Chọn một hoặc nhiều số có 2 chữ số
- **Lô khớp**:
  - **Miền Nam/Trung**: 1 lô ở giải tám (đầu) và 1 lô ở giải đặc biệt (đuôi)
  - **Miền Bắc**: 4 lô ở giải bảy (đầu) và 1 lô ở giải đặc biệt (đuôi)
- **Tổng số lô khớp**: Miền Nam/Trung: 2 lô, Miền Bắc: 5 lô
- **Tỉ lệ thưởng**: 1 ăn 75 (1:75)

### 2. Xỉu chủ (xc, x)

- **Áp dụng**: Cả 3 miền
- **Quy tắc đặt**: Chọn một hoặc nhiều số có 3 chữ số
- **Lô khớp**:
  - **Miền Nam/Trung**: 1 lô ở giải bảy (đầu) và 1 lô ở giải đặc biệt (đuôi)
  - **Miền Bắc**: 3 lô ở giải sáu (đầu) và 1 lô ở giải đặc biệt (đuôi)
- **Tổng số lô khớp**: Miền Nam/Trung: 2 lô, Miền Bắc: 4 lô
- **Tỉ lệ thưởng**: 1 ăn 650 (1:650)

### 3. Đầu (dau)

- **Áp dụng**: Cả 3 miền
- **Quy tắc đặt**: Chọn một hoặc nhiều số có 2 hoặc 3 chữ số
- **Lô khớp**:
  - **Số 2 chữ số**: Miền Nam/Trung: 1 lô ở giải tám, Miền Bắc: 4 lô ở giải bảy
  - **Số 3 chữ số**: Miền Nam/Trung: 1 lô ở giải bảy, Miền Bắc: 3 lô ở giải sáu
- **Tỉ lệ thưởng**:
  - Số 2 chữ số: 1 ăn 75 (1:75)
  - Số 3 chữ số: 1 ăn 650 (1:650)

### 4. Đuôi (duoi, dui)

- **Áp dụng**: Cả 3 miền
- **Quy tắc đặt**: Chọn một hoặc nhiều số có 2 hoặc 3 chữ số
- **Lô khớp**: Giải đặc biệt trong tất cả các miền
- **Tỉ lệ thưởng**:
  - Số 2 chữ số: 1 ăn 75 (1:75)
  - Số 3 chữ số: 1 ăn 650 (1:650)

### 5. Bao lô (b, bao, baolo)

- **Áp dụng**: Cả 3 miền
- **Quy tắc đặt**: Chọn một hoặc nhiều số có 2, 3 hoặc 4 chữ số
- **Lô khớp**: Tất cả các giải, với một số giới hạn tùy theo số chữ số
- **Tổng số lô khớp**:
  - **Số 2 chữ số**: Miền Nam/Trung: 18 lô, Miền Bắc: 27 lô
  - **Số 3 chữ số**: Miền Nam/Trung: 17 lô, Miền Bắc: 23 lô
  - **Số 4 chữ số**: Miền Nam/Trung: 16 lô, Miền Bắc: 20 lô
- **Tỉ lệ thưởng**:
  - Số 2 chữ số: 1 ăn 75 (1:75)
  - Số 3 chữ số: 1 ăn 650 (1:650)
  - Số 4 chữ số: 1 ăn 5500 (1:5500)

### 6. Đảo bao lô (daob, bdao)

- **Áp dụng**: Cả 3 miền
- **Quy tắc đặt**: Chọn 1 số có 2 hoặc 3 chữ số
- **Tính năng**: So khớp với tất cả các hoán vị có thể của số đặt
- **Tỉ lệ thưởng**:
  - Số 2 chữ số: 1 ăn 75 (1:75)
  - Số 3 chữ số: 1 ăn 650 (1:650)

### 7-8. Bao lô 7 (b7l, baobay) / Bao lô 8 (b8l, baotam)

- **Bao lô 7**: Chỉ áp dụng cho Miền Nam/Trung, bao gồm 7 lô ở các giải 8, 7, 6, 5 và đặc biệt
- **Bao lô 8**: Chỉ áp dụng cho Miền Bắc, bao gồm 8 lô ở các giải 7, 6 và đặc biệt
- **Tỉ lệ thưởng**: 1 ăn 75 (1:75)

### 9-10. Bao lô 7 đảo / Bao lô 8 đảo

- Tương tự Bao lô 7 và Bao lô 8, nhưng so khớp với tất cả các hoán vị
- **Tỉ lệ thưởng**: 1 ăn 75 (1:75)

### 11. Đá (da, dv)

- **Áp dụng**: Cả 3 miền
- **Quy tắc đặt**: Chọn nhiều số có 2 chữ số và chọn tối đa 2 đài
- **Cách tính thắng đặc biệt**: Dựa trên số cặp số trúng và số lần xuất hiện
- **Tỉ lệ thưởng**:
  - 1 đài: 1 ăn 750 (1:750)
  - 2 đài: 1 ăn 550 (1:550)
  - Miền Bắc: 1 ăn 650 (1:650)

### 12-14. Đảo xỉu chủ và biến thể

- **Đảo xỉu chủ**: So khớp với tất cả hoán vị của số 3 chữ số ở giải bảy/sáu và đặc biệt
- **Đảo xỉu chủ đầu**: Chỉ so khớp với số ở giải bảy/sáu
- **Đảo xỉu chủ đuôi**: Chỉ so khớp với số ở giải đặc biệt
- **Tỉ lệ thưởng**: 1 ăn 650 (1:650)

### 15. Nhất to (nt, nto, nhatto)

- **Áp dụng**: Miền Bắc
- **Quy tắc đặt**: Chọn số có 2, 3 hoặc 4 chữ số
- **Lô khớp**: Chỉ giải nhất của Miền Bắc
- **Tỉ lệ thưởng**:
  - Số 2 chữ số: 1 ăn 75 (1:75)
  - Số 3 chữ số: 1 ăn 650 (1:650)
  - Số 4 chữ số: 1 ăn 5500 (1:5500)

## Kiểu chọn tổ hợp số

### 1. Kéo

- **Định nghĩa**: Chọn số đầu, số tiếp theo và số cuối để tạo dãy số có bước nhảy đều
- **Cú pháp**: "[số đầu]/[số tiếp theo]keo[số cuối]"
- **Ví dụ**:
  - "10/20keo90" → 10, 20, 30, 40, 50, 60, 70, 80, 90
  - "10/11keo19" → 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
  - "111/222keo999" → 111, 222, 333, 444, 555, 666, 777, 888, 999

### 2. Tài

- **Định nghĩa**: 50 số từ 50 đến 99
- **Cú pháp**: "tai"

### 3. Xỉu

- **Định nghĩa**: 50 số từ 00 đến 49
- **Cú pháp**: "xiu"

### 4. Chẵn

- **Định nghĩa**: 50 số chẵn từ 00 đến 98
- **Cú pháp**: "chan"

### 5. Lẻ

- **Định nghĩa**: 50 số lẻ từ 01 đến 99
- **Cú pháp**: "le"

### 6. Chẵn Chẵn

- **Định nghĩa**: 25 số có cả 2 chữ số đều chia hết cho 2
- **Cú pháp**: "chanchan"
- **Ví dụ**: 00, 02, 04, ..., 88

### 7. Lẻ Lẻ

- **Định nghĩa**: 25 số có cả 2 chữ số đều là số lẻ
- **Cú pháp**: "lele"
- **Ví dụ**: 11, 13, 15, ..., 99

### 8. Chẵn Lẻ

- **Định nghĩa**: 25 số có chữ số đầu chẵn và chữ số cuối lẻ
- **Cú pháp**: "chanle"
- **Ví dụ**: 01, 03, 05, ..., 89

### 9. Lẻ Chẵn

- **Định nghĩa**: 25 số có chữ số đầu lẻ và chữ số cuối chẵn
- **Cú pháp**: "lechan"
- **Ví dụ**: 10, 12, 14, ..., 98

## Cú pháp mã cược

Mã cược bao gồm 4 phần chính:

1. **Đài cược**: Chọn đài hoặc miền để đặt cược
2. **Số cược**: Chọn một hoặc nhiều số để đặt cược
3. **Kiểu cược**: Chọn kiểu đặt cược
4. **Số tiền cược**: Số tiền đặt cược (đơn vị nghìn đồng)

### Quy tắc cú pháp:

```
[đài cược]
[số cược 1][kiểu cược 1][số tiền cược 1]
[số cược 2][kiểu cược 2][số tiền cược 2]
...
```

- **Dấu phân cách số**:

  - Dùng dấu chấm (".") để phân cách giữa các số
  - Nếu người dùng sử dụng dấu cách (" "), dấu phẩy (",") hoặc dấu gạch ngang ("-"), hệ thống sẽ tự động chuyển thành dấu chấm

- **Số tiền cược**:
  - Phải là số dương chia cho 1000
  - Ký hiệu "n" đại diện cho "nghìn" và sẽ được bỏ qua khi xử lý
  - Ví dụ: "5" = 5000đ, "1,5" = 1500đ, "0,5" = 500đ, "75n" = 75000đ

## Quy tắc tính tiền cược

### Công thức chung:

```
Tiền đóng = [Số đài] × [Số cược] × [Số tổ hợp] × [Số tiền cược] × [Hệ số nhân]
```

Với:

- **Số đài**: Số lượng đài được chọn
- **Số cược**: Số lượng số đặt cược
- **Số tổ hợp**: Số lượng tổ hợp dựa trên kiểu cược và miền
- **Số tiền cược**: Số tiền đặt cho mỗi số
- **Hệ số nhân**: Hệ số điều chỉnh (default: 0.8)

**Lưu ý**:

- Với kiểu đá (da), thay vì nhân trực tiếp với số cược, sử dụng hệ số vòng tính theo công thức tổ hợp chập 2: C(n,2) = n\*(n-1)/2, và phải nhân thêm với 2 vì ý nghĩa của đá là 2 con số với nhau.
- Với kiểu đảo, nhân với số lượng hoán vị của mỗi số

## Quy tắc tính tiền thắng

### Công thức tính tiềm năng thắng:

Tiềm năng thắng được tính theo hai cách:

1. **Tiềm năng thắng trên 1 số**:

   ```
   Tiềm năng thắng 1 số = [Số tiền cược] × [Tỉ lệ thưởng]
   ```

2. **Tiềm năng thắng tất cả**:
   ```
   Tiềm năng thắng tất cả = [Tiềm năng thắng 1 số] × [Số lượng số đặt]
   ```

### Công thức theo từng kiểu cược:

1. **Kiểu thông thường** (đầu đuôi, đầu, đuôi, bao lô, bao lô 7/8, nhất to):

   - Tiềm năng thắng 1 số = Số tiền cược × Tỉ lệ thưởng
   - Tiềm năng thắng tất cả = Tiềm năng thắng 1 số × Số lượng số đặt

2. **Kiểu đá (da)**:

   - Tiềm năng thắng 1 cặp = Số tiền cược × Tỉ lệ thưởng
   - Tiềm năng thắng tất cả = Tiềm năng thắng 1 cặp × Số cặp

3. **Kiểu đảo** (đảo bao lô, đảo xỉu chủ):

   - Tiềm năng thắng 1 số = Số tiền cược × Tỉ lệ thưởng
   - Tiềm năng thắng tất cả = Tiềm năng thắng 1 số × Số lượng số đặt

### Tính tiền thắng thực tế:

Khi có kết quả xổ số, tiền thắng thực tế được tính dựa trên số lượng số trúng:

**Kiểu thông thường**:

```
Tiền thắng = [Số lượng số trúng] × [Số tiền cược] × [Tỉ lệ thưởng]
```

**Trường hợp đặc biệt - Kiểu đá (da)**:

1. Tính hệ số tính thưởng W = Số lượng số trúng - 1
2. Tính tiền thắng 1 vòng V = Số tiền cược × Tỉ lệ thưởng
3. Tính tiền thưởng nháy B nếu có số xuất hiện nhiều lần:
   - B = (N - 1) × 0.5 × V (N là số lần xuất hiện nhiều nhất của 1 số)
4. Tổng tiền thưởng = V × W + B

## Bảng so sánh các kiểu cược

| Kiểu cược   | Ký hiệu     | Miền áp dụng | Số chữ số   | Tỉ lệ thưởng                           | Lô khớp                                                                             | Đặc điểm               |
| ----------- | ----------- | ------------ | ----------- | -------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------- |
| Đầu đuôi    | dd          | Tất cả       | 2           | 75                                     | MN/MT: 2 lô<br>MB: 5 lô                                                             | Khớp với đầu và đuôi   |
| Xỉu chủ     | xc, x       | Tất cả       | 3           | 650                                    | MN/MT: 2 lô<br>MB: 4 lô                                                             | Khớp với 3 số cuối     |
| Đầu         | dau         | Tất cả       | 2<br>3      | 75<br>650                              | MN/MT: 1 lô<br>MB: 4 lô<br>MN/MT: 1 lô<br>MB: 3 lô                                  | Khớp với đầu           |
| Đuôi        | duoi, dui   | Tất cả       | 2<br>3      | 75<br>650                              | Tất cả: 1 lô                                                                        | Khớp với đuôi          |
| Bao lô      | b, bao      | Tất cả       | 2<br>3<br>4 | 75<br>650<br>5500                      | MN/MT: 18 lô<br>MB: 27 lô<br>MN/MT: 17 lô<br>MB: 23 lô<br>MN/MT: 16 lô<br>MB: 20 lô | Khớp với tất cả vị trí |
| Đảo bao lô  | daob, bdao  | Tất cả       | 2<br>3      | 75<br>650                              | Như bao lô                                                                          | Tính cả hoán vị        |
| Bao lô 7    | b7l, baobay | MN, MT       | 2           | 75                                     | 7 lô                                                                                | Khớp với 7 lô cụ thể   |
| Bao lô 8    | b8l, baotam | MB           | 2           | 75                                     | 8 lô                                                                                | Khớp với 8 lô cụ thể   |
| Đá          | da, dv      | Tất cả       | 2           | 750 (1 đài)<br>550 (2 đài)<br>650 (MB) | Tất cả                                                                              | Nhiều số khớp cùng lúc |
| Đảo xỉu chủ | dxc, xcdao  | Tất cả       | 3           | 650                                    | MN/MT: 2 lô<br>MB: 4 lô                                                             | Khớp hoán vị 3 số      |
| Nhất to     | nt, nto     | MB           | 2<br>3<br>4 | 75<br>650<br>5500                      | 1 lô                                                                                | Chỉ khớp giải nhất     |

## Mã cược ví dụ và giải thích

### Ví dụ 1:

```
2dmn
01.02dd1
123.456.789xc1,5
```

- Đặt cược 2 đài miền Nam bất kỳ
- Dòng 1: Số 01, 02 kiểu đầu đuôi, tiền cược 1000đ/số
- Dòng 2: Số 123, 456, 789 kiểu xỉu chủ, tiền cược 1500đ/số

**Tính tiền đóng**:

- Dòng 1: 2 × 2 × 2 × 1000 × 0.8 = 6.400đ
- Dòng 2: 2 × 3 × 2 × 1500 × 0.8 = 14.400đ
- Tổng: 20.800đ

**Tiềm năng thắng**:

- Dòng 1: 1000 × 75 = 75.000đ/số × 2 số = 150.000đ
- Dòng 2: 1500 × 650 = 975.000đ/số × 3 số = 2.925.000đ
- Tổng: 3.075.000đ

### Ví dụ 2:

```
mb
39.25.52b5
45.58.23da0,5
14.41.69.96.64duoi6
```

- Đặt cược đài miền Bắc
- Dòng 1: Số 39, 25, 52 kiểu bao lô, tiền cược 5000đ/số
- Dòng 2: Số 45, 58, 23 kiểu đá, tiền cược 500đ/số
- Dòng 3: Số 14, 41, 69, 96, 64 kiểu đuôi, tiền cược 6000đ/số

**Tính tiền đóng**:

- Dòng 1: 1 × 3 × 27 × 5000 × 0.8 = 324.000đ
- Dòng 2: 1 × 3 × 27 × 500 × 0.8 × 2 = 64.800đ (với 3 là số cặp: 45-58, 45-23, 58-23)
- Dòng 3: 1 × 5 × 1 × 6000 × 0.8 = 24.000đ
- Tổng: 412.800đ

**Tiềm năng thắng**:

- Dòng 1: 5000 × 75 = 375.000đ/số × 3 số = 1.125.000đ
- Dòng 2: 500 × 650 = 325.000đ/cặp × 3 cặp = 975.000đ
- Dòng 3: 6000 × 75 = 450.000đ/số × 5 số = 2.250.000đ
- Tổng: 4.350.000đ

### Ví dụ 3:

```
vl.ct
25 dau30.duoi10
20/21keo29 dau2
01 41 81 30 70dd2
```

- Đặt cược 2 đài Vĩnh Long và Cần Thơ
- Dòng 1: Số 25 kiểu đầu tiền cược 30000đ và kiểu đuôi tiền cược 10000đ
- Dòng 2: Dãy số từ 20 đến 29 (kéo) kiểu đầu tiền cược 2000đ/số
- Dòng 3: Số 01, 41, 81, 30, 70 kiểu đầu đuôi tiền cược 2000đ/số

**Tính tiền đóng**:

- Dòng 1 (đầu): 2 × 1 × 1 × 30000 × 0.8 = 48.000đ
- Dòng 1 (đuôi): 2 × 1 × 1 × 10000 × 0.8 = 16.000đ
- Dòng 2: 2 × 10 × 1 × 2000 × 0.8 = 32.000đ (số kéo từ 20-29 gồm 10 số)
- Dòng 3: 2 × 5 × 2 × 2000 × 0.8 = 32.000đ
- Tổng: 128.000đ

**Tiềm năng thắng**:

- Dòng 1 (đầu): 30000 × 75 = 2.250.000đ × 1 số = 2.250.000đ
- Dòng 1 (đuôi): 10000 × 75 = 750.000đ × 1 số = 750.000đ
- Dòng 2: 2000 × 75 = 150.000đ × 10 số = 1.500.000đ
- Dòng 3: 2000 × 75 = 150.000đ × 5 số = 750.000đ
- Tổng: 5.250.000đ

## Lỗi thường gặp và cách khắc phục

### 1. Lỗi cú pháp đài

**Lỗi phổ biến**:

- Viết sai tên đài
- Viết tên đài không rõ ràng dẫn đến nhầm lẫn
- Chọn đài không xổ trong ngày hiện tại

**Giải pháp**:

- Kiểm tra lại cách viết đài trong phần Phân loại đài và miền
- Sử dụng ký hiệu đài phổ biến và rõ ràng
- Kiểm tra lịch xổ đài trước khi đặt cược

**Ví dụ sửa lỗi**:

```
// Lỗi
dongthap (Có thể gây nhầm lẫn với đồng nai)
// Sửa
dt
```

### 2. Lỗi cú pháp kiểu cược

**Lỗi phổ biến**:

- Viết sai kiểu cược
- Sử dụng kiểu cược không áp dụng cho miền đã chọn
- Dùng kiểu cược không phù hợp với số chữ số

**Giải pháp**:

- Kiểm tra lại cách viết kiểu cược
- Tham khảo bảng so sánh các kiểu cược
- Kiểm tra tính tương thích giữa kiểu cược và miền

**Ví dụ sửa lỗi**:

```
// Lỗi
vl 123 bd10 (Đảo bao lô không áp dụng cho 3 chữ số)
// Sửa
vl 123 b10 (Bao lô cho 3 chữ số)
```

### 3. Lỗi định dạng số cược

**Lỗi phổ biến**:

- Không có dấu phân cách giữa các số
- Sử dụng dấu phân cách không nhất quán
- Nhập số không phù hợp với kiểu cược

**Giải pháp**:

- Sử dụng dấu chấm (.) để phân cách giữa các số
- Kiểm tra số chữ số phù hợp với kiểu cược
- Chuẩn hóa định dạng số

**Ví dụ sửa lỗi**:

```
// Lỗi
mb 12 34 56 dd10
// Sửa
mb 12.34.56dd10
```

### 4. Lỗi định dạng tiền cược

**Lỗi phổ biến**:

- Không nhập số tiền cược
- Sử dụng dấu phân cách tiền không nhất quán
- Nhập tiền cược là số âm

**Giải pháp**:

- Luôn nhập số tiền cược sau kiểu cược
- Sử dụng dấu phẩy (,) cho phân cách thập phân
- Kiểm tra số tiền cược là số dương

**Ví dụ sửa lỗi**:

```
// Lỗi
mb 12.34.56dd
// Sửa
mb 12.34.56dd10
```

### 5. Lỗi cược không hợp lệ

**Lỗi phổ biến**:

- Đặt cược kiểu bao lô 7 cho miền Bắc
- Đặt cược kiểu bao lô 8 cho miền Nam/Trung

**Giải pháp**:

- Kiểm tra tính tương thích giữa kiểu cược và miền
- Tham khảo bảng so sánh các kiểu cược
- Thay đổi sang kiểu cược tương tự phù hợp với miền

**Ví dụ sửa lỗi**:

```
// Lỗi
mb b7l10 (Bao lô 7 chỉ áp dụng cho miền Nam/Trung)
// Sửa
mb b8l10 (Bao lô 8 áp dụng cho miền Bắc)
```

## Thuật ngữ chuyên ngành

| Thuật ngữ       | Giải thích                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| Đài             | Đơn vị phát hành vé số theo tỉnh/thành phố                                                             |
| Lô              | Số tương ứng với số đuôi của các giải thưởng                                                           |
| Lô khớp         | Các vị trí mà số cược có thể trùng với kết quả xổ số                                                   |
| Đầu             | Vị trí của số trong một giải thưởng nhất định (thường là giải 8 ở miền Nam/Trung và giải 7 ở miền Bắc) |
| Đuôi            | Vị trí của số trong giải đặc biệt                                                                      |
| Đầu đuôi        | Đặt cược cho cả vị trí đầu và đuôi                                                                     |
| Xỉu chủ         | Đặt cược cho số có 3 chữ số                                                                            |
| Bao lô          | Đặt cược cho số xuất hiện ở bất kỳ vị trí nào trong tất cả các giải                                    |
| Đá              | Đặt cược cho nhiều số cùng một lúc                                                                     |
| Hệ số nhân      | Hệ số điều chỉnh tiền đóng, thường là 0.8                                                              |
| Tiềm năng thắng | Tiền thưởng tối đa có thể nhận nếu số cược trúng                                                       |
| Tiền đóng       | Số tiền người chơi phải đóng khi đặt cược                                                              |
| Tỉ lệ thưởng    | Hệ số nhân với tiền cược để tính tiền thưởng                                                           |
| Kéo             | Kiểu chọn số theo dãy có bước nhảy đều                                                                 |
| Tài/Xỉu         | Kiểu chọn số từ 50-99 và 00-49                                                                         |
| Chẵn/Lẻ         | Kiểu chọn số chẵn hoặc lẻ                                                                              |
| Hoán vị         | Các cách sắp xếp khác nhau của một số                                                                  |
| Tổ hợp          | Các vị trí có thể trúng cho mỗi kiểu cược                                                              |

## Phụ lục ví dụ chi tiết

Để hiểu rõ hơn về cách tính tiền đóng và tiềm năng thắng, vui lòng tham khảo phụ lục "Phụ lục: Ví dụ chi tiết về cách tính tiền cược và tiềm năng thắng" trong file `Example1.md` với nhiều ví dụ cụ thể cho từng kiểu cược.

# Cách viết/chọn đài Miền Trung và Miền Nam

## Cấu trúc đài xổ số

Mỗi ngày thường có 2-3 đài xổ số ở mỗi miền (Nam và Trung), bao gồm:

- **Đài chính**: Thường là đài lớn, mở thưởng đầu tiên
- **Đài phụ**: 1-2 đài mở thưởng tiếp theo

## Cách chọn đài theo ngày

### Miền Nam:

- **Chủ nhật**: Tiền Giang (đài chính), Kiên Giang, Đà Lạt
- **Thứ hai**: TP. HCM (đài chính), Đồng Tháp, Cà Mau
- **Thứ ba**: Bến Tre (đài chính), Vũng Tàu, Bạc Liêu
- **Thứ tư**: Đồng Nai (đài chính), Cần Thơ, Sóc Trăng
- **Thứ năm**: Tây Ninh (đài chính), An Giang, Bình Thuận
- **Thứ sáu**: Vĩnh Long (đài chính), Bình Dương, Trà Vinh
- **Thứ bảy**: TP. HCM (đài chính), Long An, Bình Phước, Hậu Giang

### Miền Trung:

- **Chủ nhật**: Kon Tum (đài chính), Khánh Hòa, Thừa Thiên Huế
- **Thứ hai**: Phú Yên (đài chính), Thừa Thiên Huế
- **Thứ ba**: Đắk Lắk (đài chính), Quảng Nam
- **Thứ tư**: Đà Nẵng (đài chính), Khánh Hòa
- **Thứ năm**: Bình Định (đài chính), Quảng Trị, Quảng Bình
- **Thứ sáu**: Gia Lai (đài chính), Ninh Thuận
- **Thứ bảy**: Đà Nẵng (đài chính), Quảng Ngãi, Đắk Nông

## Quy ước chọn nhiều đài

### Chọn 2 hoặc 3 đài cùng miền:

- **2dmn**: Hệ thống tự động chọn 2 đài đầu tiên của Miền Nam trong ngày

  - Ví dụ: Vào thứ hai, "2dmn" = TP.HCM và Đồng Tháp
  - Ví dụ: Vào thứ tư, "2dmn" = Đồng Nai và Cần Thơ

- **3dmn**: Hệ thống tự động chọn 3 đài của Miền Nam trong ngày

  - Ví dụ: Vào thứ năm, "3dmn" = Tây Ninh, An Giang và Bình Thuận

- **2dmt**: Hệ thống tự động chọn 2 đài đầu tiên của Miền Trung trong ngày

  - Ví dụ: Vào thứ ba, "2dmt" = Đắk Lắk và Quảng Nam
  - Ví dụ: Vào thứ bảy, "2dmt" = Đà Nẵng và Quảng Ngãi

- **3dmt**: Hệ thống tự động chọn 3 đài của Miền Trung trong ngày (nếu có)
  - Ví dụ: Vào chủ nhật, "3dmt" = Kon Tum, Khánh Hòa và Thừa Thiên Huế

### Chọn đài theo tên viết tắt:

Để chọn đài cụ thể, bạn có thể sử dụng tên viết tắt của từng đài:

- **Viết liền**: "vl.ct" (Vĩnh Long và Cần Thơ)
- **Viết tách**: "vl ct" (Vĩnh Long và Cần Thơ)
- **Dùng dấu phẩy**: "vl,ct" (Vĩnh Long và Cần Thơ)

### Chọn đài khác miền:

Khi muốn đặt cược cho 2 đài thuộc 2 miền khác nhau, bạn cần viết rõ tên viết tắt của từng đài:

- Ví dụ: "vl.dnang" (Vĩnh Long thuộc Miền Nam và Đà Nẵng thuộc Miền Trung)
- Ví dụ: "tg kt" (Tiền Giang thuộc Miền Nam và Kon Tum thuộc Miền Trung)

### Lưu ý quan trọng:

- Cần tránh nhầm lẫn đài có ký hiệu tương tự như:

  - "dn" có thể là Đà Nẵng (MT), Đồng Nai (MN), hoặc Đắk Nông (MT)
  - "dl" có thể là Đà Lạt (MN) hoặc Đắk Lắk (MT)
  - "bd" có thể là Bình Dương (MN) hoặc Bình Định (MT)

- Trong những trường hợp trên, nên sử dụng tên viết tắt đầy đủ hơn:
  - Đà Nẵng: "dnang"
  - Đồng Nai: "dnai"
  - Đắk Nông: "dnong"
  - Đà Lạt: "dlat"
  - Đắk Lắk: "dlak"
  - Bình Dương: "bduong"
  - Bình Định: "bdinh"
