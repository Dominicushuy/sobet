Tôi có một trường hợp sau không biết bạn có tự động phát hiện và format lại text trước parse không?

Vi dụ người dùng nhập:
mb 01.02.03b1
=> thì tương đương với:
mb
01.02.03b1

[mã đài / mã tỉnh][dấu cách hoặc dấu chấm][số cược][kiểu cược][số tiền cược]

Có nghĩa là người dùng chỉ nhập dấu cách hoặc dấu chấm thay vì dấu xuống dòng thì hệ thống có thể tự động phát hiện và format lại thành 2 dòng như trên không?

Tôi đặt 1 dòng như trên thì ngon lành.

Khi tôi đặt 2 dòng thì hệ thống đã kiểm tra và tối ưu định dạng đúng nhưng parse và lưu lại phía daft code thì sai:

Ví dụ:

```
mb 01b1
2dmn 509.616xc10
```

Bot thông báo đúng (nếu áp dụng thì đúng)

Mã cược đã được tối ưu định dạng:

```
mb
01b1
2dmn
509.616xc10
```

Nhưng khi parse và lưu draft code thì lại thành:

Parsd result:

```js
{
    "success": true,
    "station": {
        "name": "Miền Bắc",
        "region": "north",
        "multiStation": false
    },
    "lines": [
        {
            "valid": true,
            "numbers": [
                "01"
            ],
            "amount": 1000,
            "betType": {
                "id": "Bao Lô",
                "name": "Bao Lô",
                "alias": "b"
            },
            "originalLine": "01b1",
            "additionalBetTypes": [],
            "lineIndex": 1
        }
    ],
    "hasValidLine": true,
    "wasReformatted": false,
    "hasMultipleStations": true,
    "stationCount": 2
}
```
