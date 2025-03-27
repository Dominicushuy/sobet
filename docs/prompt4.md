Fix lỗi tính số tiền cược bị sai:

Mã tôi đặt là:

```
mb
25.36.47dd10
```

Mô tả:
Tôi chọn mã miền Bắc với 3 số là 25, 36, 47 và cược 10 (10000) với kiểu cược đầu đuôi.

Hệ thống

```Chi tiết tính tiền đặt:
Dòng 1: 25.36.47dd10
Kiểu cược: dd
Số đài: 1
Số lượng số: 3
Tổ hợp: 2
Tiền cược: 10,000đ
Hệ số: 1
Công thức: (1 × 3 × 2 × 10000 × 1) × 0.8
Kết quả: 48,000đ
```

Hiện tại đang bị sai chỗ tổ hợp, `combinations` của "Đầu Đuôi" phải là `north` miền bắc với giá trị là 5.
