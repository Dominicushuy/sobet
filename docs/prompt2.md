Hoàn thiện Form đặt cược:

Tiếp tục đến phần Chọn loại cược và số tiền:

Lưu ý phần này cực kỳ khó và phức tạp nên tôi sẽ nâng cấp cải thiện từng bước theo mỗi loại cược. Kiểm tra kỹ dữ liệu JSON tôi cung cấp về các Rules hiện có trong bảng `rules` , tài liệu `Rules Detailed Document.md` (phần 3. Object JSON về các loại cược )

Kiểm tra logic chỗ tính toán tổng tiền đặt cược bị sai khi có đài miền Bắc.
Ví dụ tôi chọn Ngày xổ: Thứ Bảy (21/03/2025), chọn 1 đài miền Bắc là Nam Định (namdinh), 1 đài miền Nam là TPHCM (tphcm) và chọn loại cược là "Đầu Đuôi" biến thể cược là "Đầu Đuôi" với mệnh giá cược là 10000 với 2 số chọn là 01, 02 thì tổng số tiền đóng phải là:
TỔNG SỐ ĐÃ CHỌN x ((SỐ TIỀN CƯỢC x SỐ BIẾN THỂ CƯỢC ĐẦU ĐUÔI CHO ĐÀI MIỀN NAM) x SỐ ĐÀI MIỀN NAM ĐÃ CHỌN + (SỐ TIỀN CƯỢC x SỐ BIẾN THỂ CƯỢC ĐẦU ĐUÔI CHO ĐÀI MIỀN BẮC) x SỐ ĐÀI MIỀN BẮC ĐÃ CHỌN)
= 2 x ((10000 x 2) x 1 + (10000 x 5) x 1) = 140000

(x là phép nhân)

TỔNG SỐ ĐÃ CHỌN: 2 số 01, 02
SỐ TIỀN CƯỢC: 10000
SỐ BIẾN THỂ CƯỢC ĐẦU ĐUÔI CHO ĐÀI MIỀN NAM: 2
SỐ BIẾN THỂ CƯỢC ĐẦU ĐUÔI CHO ĐÀI MIỀN BẮC: 5
SỐ ĐÀI MIỀN NAM ĐÃ CHỌN: 1 (TPHCM)
SỐ ĐÀI MIỀN BẮC ĐÃ CHỌN: 1 (Nam Định)

Yêu cầu Output:

- Chỉ cần cho kết quả code không cần giải thích. Tôi cần đầy đủ code của một file để dễ dàng copy và paste vào project của tôi.
- Code cần tuân thủ theo quy tắc Eslint.
- Code cải tiến đè lên code cũ luôn không cần tạo file mới.
- Tập trung vào phần yêu cầu không trả lời những phần khác. Tôi sẽ cải tiến sau đó

Rules:

```json
[
  {
    "id": "88548da2-63c5-4c42-8317-c89c5f9bae93",
    "bet_type_id": "dd",
    "name": "Đầu Đuôi",
    "description": "Đặt cược dựa trên 2 chữ số (00-99)",
    "digit_count": 2,
    "region_rules": {
      "M1": {
        "winningRules": {
          "dau": "Khớp với số ở giải 8",
          "duoi": "Khớp với 2 số cuối của giải Đặc Biệt"
        },
        "betMultipliers": {
          "dd": 2,
          "dau": 1,
          "duoi": 1
        },
        "combinationCount": {
          "dd": 2,
          "dau": 1,
          "duoi": 1
        }
      },
      "M2": {
        "winningRules": {
          "dau": "Khớp với số ở giải 7",
          "duoi": "Khớp với 2 số cuối của giải Đặc Biệt"
        },
        "betMultipliers": {
          "dd": 5,
          "dau": 4,
          "duoi": 1
        },
        "combinationCount": {
          "dd": 5,
          "dau": 4,
          "duoi": 1
        }
      }
    },
    "variants": [
      {
        "id": "dd",
        "name": "Đầu Đuôi",
        "description": "Đặt cược cả đầu và đuôi"
      },
      {
        "id": "dau",
        "name": "Chỉ Đầu",
        "description": "Đặt cược chỉ ở đầu"
      },
      {
        "id": "duoi",
        "name": "Chỉ Đuôi",
        "description": "Đặt cược chỉ ở đuôi"
      }
    ],
    "winning_ratio": 75,
    "created_at": "2025-03-21 16:25:51.688546+00",
    "updated_at": "2025-03-21 16:25:51.688546+00",
    "is_active": true
  },
  {
    "id": "97df50c4-3a54-48a9-9191-92f44815136e",
    "bet_type_id": "xc",
    "name": "Xỉu Chủ",
    "description": "Đặt cược dựa trên 3 chữ số (000-999)",
    "digit_count": 3,
    "region_rules": {
      "M1": {
        "winningRules": {
          "dau": "Khớp với số ở giải 7",
          "duoi": "Khớp với 3 số cuối của giải Đặc Biệt"
        },
        "betMultipliers": {
          "xc": 2,
          "dau": 1,
          "duoi": 1
        },
        "combinationCount": {
          "xc": 2,
          "dau": 1,
          "duoi": 1
        }
      },
      "M2": {
        "winningRules": {
          "dau": "Khớp với số ở giải 6",
          "duoi": "Khớp với 3 số cuối của giải Đặc Biệt"
        },
        "betMultipliers": {
          "xc": 4,
          "dau": 3,
          "duoi": 1
        },
        "combinationCount": {
          "xc": 4,
          "dau": 3,
          "duoi": 1
        }
      }
    },
    "variants": [
      {
        "id": "xc",
        "name": "Xỉu Chủ Toàn Phần",
        "description": "Đặt cược cả đầu và đuôi"
      },
      {
        "id": "dau",
        "name": "Chỉ Đầu",
        "description": "Đặt cược chỉ ở đầu"
      },
      {
        "id": "duoi",
        "name": "Chỉ Đuôi",
        "description": "Đặt cược chỉ ở đuôi"
      }
    ],
    "winning_ratio": 650,
    "created_at": "2025-03-21 16:25:51.688546+00",
    "updated_at": "2025-03-21 16:25:51.688546+00",
    "is_active": true
  },
  {
    "id": "602bcbae-916b-4b5a-a76e-50fb7efdc822",
    "bet_type_id": "b7l",
    "name": "Bao 7 Lô",
    "description": "Tập hợp con của bao lô, áp dụng cho 7 lô nhất định ở M1",
    "digit_count": null,
    "region_rules": {
      "M1": {
        "winningRules": "Số cược khớp với N số cuối của 7 lô đặc biệt (giải tám, giải bảy, giải sáu, giải năm, giải đặc biệt)",
        "betMultipliers": {
          "b7l2": 7,
          "b7l3": 7,
          "b7l4": 7
        },
        "combinationCount": 7
      }
    },
    "variants": [
      {
        "id": "b7l2",
        "name": "Bao 7 Lô (2 chữ số)",
        "digitCount": 2,
        "description": "Đặt cược với 2 chữ số"
      },
      {
        "id": "b7l3",
        "name": "Bao 7 Lô (3 chữ số)",
        "digitCount": 3,
        "description": "Đặt cược với 3 chữ số"
      },
      {
        "id": "b7l4",
        "name": "Bao 7 Lô (4 chữ số)",
        "digitCount": 4,
        "description": "Đặt cược với 4 chữ số"
      }
    ],
    "winning_ratio": {
      "b7l2": 75,
      "b7l3": 650,
      "b7l4": 5500
    },
    "created_at": "2025-03-21 16:25:51.688546+00",
    "updated_at": "2025-03-21 16:25:51.688546+00",
    "is_active": true
  },
  {
    "id": "8b1cd086-1d5b-477c-a77a-0bf0526bba95",
    "bet_type_id": "b8l",
    "name": "Bao 8 Lô",
    "description": "Tập hợp con của bao lô, áp dụng cho 8 lô nhất định ở M2",
    "digit_count": null,
    "region_rules": {
      "M2": {
        "winningRules": "Số cược khớp với N số cuối của 8 lô đặc biệt (giải đặc biệt, giải bảy, giải sáu, giải năm, giải tư, giải ba)",
        "betMultipliers": {
          "b8l2": 8,
          "b8l3": 8,
          "b8l4": 8
        },
        "combinationCount": 8
      }
    },
    "variants": [
      {
        "id": "b8l2",
        "name": "Bao 8 Lô (2 chữ số)",
        "digitCount": 2,
        "description": "Đặt cược với 2 chữ số"
      },
      {
        "id": "b8l3",
        "name": "Bao 8 Lô (3 chữ số)",
        "digitCount": 3,
        "description": "Đặt cược với 3 chữ số"
      },
      {
        "id": "b8l4",
        "name": "Bao 8 Lô (4 chữ số)",
        "digitCount": 4,
        "description": "Đặt cược với 4 chữ số"
      }
    ],
    "winning_ratio": {
      "b8l2": 75,
      "b8l3": 650,
      "b8l4": 5500
    },
    "created_at": "2025-03-21 16:25:51.688546+00",
    "updated_at": "2025-03-21 16:25:51.688546+00",
    "is_active": true
  },
  {
    "id": "9865c055-a915-459c-b64f-50ea62312a2d",
    "bet_type_id": "nt",
    "name": "Nhất To",
    "description": "Đặt cược dựa trên 2 số cuối của giải Nhất",
    "digit_count": 2,
    "region_rules": {
      "M2": {
        "winningRules": "Số cược khớp với 2 số cuối của giải Nhất",
        "betMultipliers": 1,
        "combinationCount": 1
      }
    },
    "variants": null,
    "winning_ratio": 75,
    "created_at": "2025-03-21 16:25:51.688546+00",
    "updated_at": "2025-03-21 16:25:51.688546+00",
    "is_active": true
  },
  {
    "id": "e99faf4f-2b1f-4339-92bb-7c59babb8b43",
    "bet_type_id": "xien",
    "name": "Xiên",
    "description": "Đặt cược với nhiều cặp số 2 chữ số",
    "digit_count": 2,
    "region_rules": {
      "M2": {
        "winningRules": "Tất cả các số được chọn phải xuất hiện trong kết quả (2 số cuối của các lô)",
        "betMultipliers": 27,
        "combinationCount": 27
      }
    },
    "variants": [
      {
        "id": "x2",
        "name": "Xiên 2",
        "description": "Chọn 2 cặp số",
        "numberCount": 2
      },
      {
        "id": "x3",
        "name": "Xiên 3",
        "description": "Chọn 3 cặp số",
        "numberCount": 3
      },
      {
        "id": "x4",
        "name": "Xiên 4",
        "description": "Chọn 4 cặp số",
        "numberCount": 4
      }
    ],
    "winning_ratio": {
      "x2": 75,
      "x3": 40,
      "x4": 250
    },
    "created_at": "2025-03-21 16:25:51.688546+00",
    "updated_at": "2025-03-21 16:25:51.688546+00",
    "is_active": true
  },
  {
    "id": "57028456-7870-468a-8f06-37822f56346d",
    "bet_type_id": "da",
    "name": "Đá",
    "description": "Đặt cược với nhiều cặp số, có nhiều trường hợp trúng",
    "digit_count": 2,
    "region_rules": {
      "M1": {
        "winningRules": "Nhiều trường hợp trúng thưởng khác nhau dựa trên số lượng số trúng và số lần xuất hiện",
        "betMultipliers": {
          "da2": 1,
          "da3": 3,
          "da4": 6,
          "da5": 10
        },
        "combinationCount": {
          "da2": 1,
          "da3": 3,
          "da4": 6,
          "da5": 10
        }
      }
    },
    "variants": [
      {
        "id": "da2",
        "name": "Đá 2",
        "description": "Chọn 2 cặp số",
        "numberCount": 2
      },
      {
        "id": "da3",
        "name": "Đá 3",
        "description": "Chọn 3 cặp số",
        "numberCount": 3
      },
      {
        "id": "da4",
        "name": "Đá 4",
        "description": "Chọn 4 cặp số",
        "numberCount": 4
      },
      {
        "id": "da5",
        "name": "Đá 5",
        "description": "Chọn 5 cặp số",
        "numberCount": 5
      }
    ],
    "winning_ratio": {
      "da2": {
        "2_numbers": 12.5
      },
      "da3": {
        "3_numbers": 37.5,
        "2_numbers_no_doubles": 25,
        "2_numbers_1_number_2_times": 43.75,
        "3_numbers_1_number_2_times": 75,
        "3_numbers_1_number_3_times": 112.5
      },
      "da4": {
        "4_numbers": 250,
        "2_numbers_1_number_2_times": 75,
        "2_numbers_2_number_2_times": 150,
        "3_numbers_1_number_2_times": 500,
        "3_numbers_1_number_3_times": 750
      },
      "da5": {
        "5_numbers": 1250,
        "3_numbers_1_number_2_times": 500,
        "3_numbers_2_number_2_times": 750,
        "4_numbers_1_number_2_times": 2500,
        "4_numbers_1_number_3_times": 3750
      }
    },
    "created_at": "2025-03-21 16:25:51.688546+00",
    "updated_at": "2025-03-21 16:25:51.688546+00",
    "is_active": true
  },
  {
    "id": "63754138-4118-47ac-a901-69fd31ec9b68",
    "bet_type_id": "bao_lo",
    "name": "Bao Lô N",
    "description": "Đặt cược với N chữ số (N = 2, 3 hoặc 4)",
    "digit_count": 2,
    "region_rules": {
      "M1": {
        "winningRules": "Số cược khớp với N số cuối của bất kỳ lô nào trong các giải",
        "betMultipliers": {
          "b2": 18,
          "b3": 17,
          "b4": 16
        },
        "combinationCount": {
          "b2": 18,
          "b3": 17,
          "b4": 16
        }
      },
      "M2": {
        "winningRules": "Số cược khớp với N số cuối của bất kỳ lô nào trong các giải",
        "betMultipliers": {
          "b2": 27,
          "b3": 23,
          "b4": 20
        },
        "combinationCount": {
          "b2": 27,
          "b3": 23,
          "b4": 20
        }
      }
    },
    "variants": [
      {
        "id": "b2",
        "name": "Bao Lô 2",
        "digitCount": 2,
        "description": "Đặt cược với 2 chữ số"
      },
      {
        "id": "b3",
        "name": "Bao Lô 3",
        "digitCount": 3,
        "description": "Đặt cược với 3 chữ số"
      },
      {
        "id": "b4",
        "name": "Bao Lô 4",
        "digitCount": 4,
        "description": "Đặt cược với 4 chữ số"
      }
    ],
    "winning_ratio": {
      "b2": 75,
      "b3": 650,
      "b4": 5500
    },
    "created_at": "2025-03-21 16:25:51.688546+00",
    "updated_at": "2025-03-21 16:25:51.688546+00",
    "is_active": true
  }
]
```
