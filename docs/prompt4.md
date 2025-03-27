Trong Chat context tôi có debug thêm console.log sau:

```jsx
const stakeResult = calculateStake(parseResult)
const prizeResult = calculatePotentialPrize(parseResult)

console.log({ parseResult, stakeResult, prizeResult })
```

Tôi nhận được kết quả:

```js
{
    "parseResult": {
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
                    "25",
                    "36",
                    "47"
                ],
                "amount": 10000,
                "betType": {
                    "id": "Đầu Đuôi",
                    "name": "Đầu Đuôi",
                    "alias": "dd"
                },
                "originalLine": "25.36.47dd10",
                "additionalBetTypes": [],
                "lineIndex": 1
            }
        ],
        "hasValidLine": true
    },
    "stakeResult": {
        "success": true,
        "totalStake": 48000,
        "details": [
            {
                "lineIndex": 0,
                "originalLine": "25.36.47dd10",
                "stake": 48000,
                "valid": true,
                "stationCount": 1,
                "numberCount": 3,
                "combinationCount": 2,
                "betAmount": 10000,
                "multiplier": 1,
                "formula": "(1 × 3 × 2 × 10000 × 1) × 0.8",
                "betTypeAlias": "dd",
                "originalStake": 60000,
                "betMultiplier": 0.8
            }
        ],
        "error": null,
        "betMultiplier": 0.8
    },
    "prizeResult": {
        "success": true,
        "totalPotential": 2250000,
        "details": [
            {
                "lineIndex": 0,
                "originalLine": "25.36.47dd10",
                "potentialPrize": 2250000,
                "valid": true,
                "stationCount": 1,
                "numberCount": 3,
                "betAmount": 10000,
                "payoutRate": 75,
                "multiplier": 1,
                "formula": "1 × 3 × 10000 × 75"
            }
        ],
        "error": null
    }
}
```

Trong dữ liệu của `multiplier` trong `stakeResult` đang bị lấy sai, dữ liệu đúng phải là 5 (combinations => north => 5) vì dữ liệu của `defaultBetTypes` trong file `defaults.js` như sau:

```js
{
    name: "Đầu Đuôi",
    aliases: ["dd", "dau duoi", "đầu đuôi", "head and tail"],
    applicableRegions: ["south", "central", "north"],
    betRule: ["2 digits"],
    matchingDraw: {
      south: {
        head: [{ prize: "eighth", count: 1 }],
        tail: [{ prize: "special", count: 1 }],
      },
      central: {
        head: [{ prize: "eighth", count: 1 }],
        tail: [{ prize: "special", count: 1 }],
      },
      north: {
        head: [{ prize: "seventh", count: 4 }],
        tail: [{ prize: "special", count: 1 }],
      },
    },
    combinations: {
      south: 2,
      central: 2,
      north: 5,
    },
    matchingMethod: "Match the last 2 digits of the draw",
    payoutRate: 75,
    isActive: true,
  },
```
