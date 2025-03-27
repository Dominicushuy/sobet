Để thuận tiện cho việc xử lý tính toán bạn hãy cập nhật logic, tách tất cả những mã cược nhiều dòng thành 1 dòng tương đương với 1 bet riêng biệt để thuận tiện cho việc đối soát, tính toán kết quả.

Giữ nguyên logic cho các trường hợp đặc biệt

Output: Sửa lại tất cả logic code và components hiện tại và bỏ đi những function, code cũ dư thừa không dùng đến nữa.
Bao gồm các file trong folder `src/services/betCodeParser`, `src/components/bet`, `src/contexts`

Ví dụ 1

```
2dmn
01.02da5
03.04da5
05.06da5
```

=> Tách thành 3 bet riêng biệt:

```
2dmn
01.02da5
```

```
2dmn
03.04da5
```

```
2dmn
05.06da5
```
