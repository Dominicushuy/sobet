Có vẻ như phần tính toán tiềm năng thắng cược đang bị sai:

Bây giờ hãy sửa lại theo ý sau:

- Tách riêng 2 logic chuyên biệt để tính tiềm năng thắng cược ở kiểu "Đá" và ở các kiểu còn lại (tạo function riêng cho kiểu "Đá" vì khá phức tạp).
- Công thức tính tiềm năng thắng như sau:

  - Đối với kiểu "Đá", Tham khảo lại định nghĩa sau:

  ```md
        11. Đá: Đặc biệt phần này có có thêm cách tính hệ số đóng (để tính số tiền đóng) và cách tính thưởng khác với những phần khác. Trong phần này tôi sẽ ký hiệu những phần có liên quan với nhau.

        - Cách viết: "da" hoặc "dv" đều được.

        - Nếu đá 1 đài: "da1".
        - Nếu đá 2 đài: "da2".
        - Nếu đá đài Miền Bắc: "damb".

        - Áp dụng cho cả 3 miền.
        - Quy tắc đặt: Chọn nhiều số có 2 chữ số và chọn tối đa 2 đài.
        - Định nghĩa lô khớp:
        - Đài Miền Nam và Miền Trung có tổng cộng 18 lô ở tất cả các giải.
        - Đài Miền Bắc có tổng cộng 27 lô ở tất cả các giải.
        - Số tổ hợp:
        - Đài Miền Nam và Miền Trung có tổng cộng 18 lô.
        - Đài Miền Bắc có tổng cộng 27 lô.
        - Cách kiểm tra số cược thắng:
        - Chỉ cần ít nhất 2 số trong số cược trùng với 2 chữ số cuối của lô khớp.
        - Tỉ lệ thưởng (R):
        - Nếu chọn 1 đài: 1 ăn 750 (1:750)
        - Nếu chọn 2 đài: 1 ăn 550 (1:550)
        - Nếu chọn đài Miền Bắc: 1 ăn 650 (1:650)
        - Cách tính hệ số vòng:
        - Sử dụng công thức "tổ hợp chập n" C(n,2) = n\*(n-1)/2 với n là số lô đặt cược.
        - Ví dụ: Nếu người chơi đặt 2 số thì hệ số vòng sẽ là 1, nếu đặt 3 số thì hệ số vòng sẽ là 3, nếu đặt 4 số thì hệ số vòng sẽ là 6.
        - Cách tính số tiền thắng:
        - Hệ số tính thưởng "W":
            - Tổng số các số đặt cược trùng với 2 chữ số cuối của lô khớp trừ đi 1.
            - Ví dụ:
            - Nếu người chơi đặt 2 số và có 2 số trùng với 2 chữ số cuối của lô khớp thì hệ số tính thưởng sẽ là 1.
            - Nếu người chơi đặt 3 số và có 3 số trùng với 2 chữ số cuối của lô khớp thì hệ số tính thưởng sẽ là 2.
            - Tương tự cho n số đặt cược mà cả n số đều trùng với 2 chữ số cuối của lô khớp thì hệ số tính thưởng sẽ là n-1.
        - Số tiền thắng 1 vòng "V":
            - W = 1: Đặt 2 số và 2 số này trùng với 2 chữ số cuối của lô khớp và không có số nào xuất hiện 2 lần trong lô khớp.
            - Số tiền đặt cược \* Tỉ lệ thưởng (R)
        - Số tiền thưởng nháy "B":
            - Hệ số tính thưởng W > 1
            - Nếu trong số lô khớp có 1 số về "N" (N > 1) lần thì số tiền thưởng nháy sẽ là:
            (N - 1) \* 0.5 \* tiền thắng 1 vòng (V). Trong đó N là số lần xuất hiện nhiều hơn 2 lần của 1 số trong lô khớp (lấy số lần xuất hiện nhiều nhất).
        - Số tiền thưởng = tiền thắng 1 vòng (V) \* Hệ số tính thưởng (W) + Số tiền thưởng nháy (B).
        - Ví dụ:
            1. Người chơi đặt 2 số "01" và "02" đài Miền Nam. Trong 18 lô của đài Miền Nam thì có 2 lô có 2 chữ số cuối là "01" và "02", số tiền đặt cược là 1000, tỉ lệ thưởng là 750 thì:
            - W = 1 (có 2 số trùng với 2 chữ số cuối của lô khớp)
            - V = 1000 \* 750 = 750000 (Số tiền thắng 1 vòng)
            - B = 0 ( N = 1 )
            - Số tiền thưởng = 750000
            2. Người chơi đặt 2 số "01" và "02" đài Miền Nam. Trong 18 lô của đài Miền Nam thì có 2 lô có 2 chữ số cuối là "01" và "02", trong đó lô "01" xuất hiện 2 lần, số tiền đặt cược là 1000, tỉ lệ thưởng là 750:
            - W = 1
            - V = 1000 \* 750 = 750000 (Số tiền thắng 1 vòng)
            - B = (2 - 1) \* 0.5 \* 750000 = 375000 (N = 2 ~ Lô "01" xuất hiện 2 lần)
            - Số tiền thưởng = 750000 + 375000 = 1125000
            3. Người chơi đặt 3 số là "01","02","03" đài Miền Nam. Trong 18 lô của đài Miền Nam thì có 3 lô có 2 chữ số cuối là "01", "02" và "03", số tiền đặt cược là 1000, tỉ lệ thưởng là 750:
            - W = 2, V = 1000 \* 750 = 750000
            - B = 0 (N = 1)
            - Số tiền thưởng = 750000 \* 2 = 1500000
            4. Người chơi đặt 3 số là "01","02","03" đài Miền Nam. Trong 18 lô của đài Miền Nam thì có 3 lô có 2 chữ số cuối là "01", "02" và "03", trong đó lô "01" xuất hiện 2 lần, số tiền đặt cược là 1000, tỉ lệ thưởng là 750:
            - W = 2, V = 1000 \* 750 = 750000
            - B = (2 - 1) \* 0.5 \* 750000 = 375000 (N = 2 ~ Lô "01" xuất hiện 2 lần)
            - Số tiền thưởng = 750000 \* 2 + 375000 = 1875000
            5. Người chơi đặt 3 số là "01","02","03" đài Miền Nam. Trong 18 lô của đài Miền Nam thì có 3 lô có 2 chữ số cuối là "01", "02" và "03", trong đó lô "01" xuất hiện 2 lần và lô "02" xuất hiện 3 lần, số tiền đặt cược là 1000, tỉ lệ thưởng là 750:
            - W = 2, V = 1000 \* 750 = 750000
            - B = (3 - 1) \* 0.5 \* 750000 = 750000 (N = 3 ~ Lô "02" xuất hiện 3 lần, lấy số lần xuất hiện nhiều nhất)
            - Số tiền thưởng = 750000 \* 2 + 750000 = 2250000
  ```

  - Đối với các kiểu còn lại:
    Tiền thắng trên 1 số khớp = Tỉ lệ thắng cược \* Đơn vị tiền cược (trong mã) \* Số mã đặt cược.
