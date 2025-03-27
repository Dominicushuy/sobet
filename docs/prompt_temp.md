Trong Chat Context, tôi đã thêm phần console.log trong hàm `processUserMessage`

```jsx
// Format the bet code first for better parsing
const formattedBetCode = formatBetCode(text)

// Parse the bet code
const parseResult = parseBetCode(formattedBetCode)

// Detect any errors
const errorResult = detectErrors(formattedBetCode, parseResult)

console.log({ formattedBetCode, parseResult, errorResult })
```

và tôi nhận được kết quả sau:

```js
{
    "formattedBetCode": "2dmn\n123.456.789xc2",
    "parseResult": {
        "success": true,
        "station": {
            "name": "Miền Nam",
            "region": "south",
            "count": 2,
            "multiStation": true
        },
        "lines": [
            {
                "valid": null,
                "numbers": [
                    "2"
                ],
                "amount": 0,
                "betType": null,
                "originalLine": "2dmn",
                "additionalBetTypes": [],
                "lineIndex": 0
            },
            {
                "valid": true,
                "numbers": [
                    "123",
                    "456",
                    "789"
                ],
                "amount": 2000,
                "betType": {
                    "id": "Xỉu chủ",
                    "name": "Xỉu chủ",
                    "alias": "xc"
                },
                "originalLine": "123.456.789xc2",
                "additionalBetTypes": [],
                "lineIndex": 1
            }
        ],
        "hasValidLine": true
    },
    "errorResult": {
        "hasErrors": true,
        "errors": [
            {
                "type": "NO_BET_TYPE",
                "message": "Thiếu kiểu cược",
                "scope": "line",
                "lineIndex": 0,
                "line": "2dmn"
            },
            {
                "type": "INVALID_AMOUNT",
                "message": "Số tiền cược không hợp lệ",
                "scope": "line",
                "lineIndex": 0,
                "line": "2dmn"
            }
        ]
    }
}
```

Vấn đề lỗi:
Trong `parseResult` đã xác định đúng dữ liệu của `station` nhưng phần `line` đang bị sai. Phần line đúng chỉ chứa 1 object giá trị

```js
{
  "valid": true,
  "numbers": [
      "123",
      "456",
      "789"
  ],
  "amount": 2000,
  "betType": {
      "id": "Xỉu chủ",
      "name": "Xỉu chủ",
      "alias": "xc"
  },
  "originalLine": "123.456.789xc2",
  "additionalBetTypes": [],
  "lineIndex": 1
}
```

Còn phần này đâu phải mã cược, đang bị hiểu nhầm phần đài là mã cược

```js
{
  "valid": null,
  "numbers": [
      "2"
  ],
  "amount": 0,
  "betType": null,
  "originalLine": "2dmn",
  "additionalBetTypes": [],
  "lineIndex": 0
},
```
