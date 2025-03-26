# Lottery Result Verification System Documentation

## I. System Overview

### 1.1 Purpose

The system is designed to analyze lottery bet codes, detect and fix errors, calculate stake amounts, and verify results based on lottery draw outcomes.

### 1.2 Processing Workflow

1. **Input bet codes**: Users enter bet codes according to specified syntax
2. **Parse syntax**: System analyzes, normalizes and checks for errors
3. **Calculate stake**: System calculates the stake amount based on rules
4. **Input lottery results**: System receives lottery results from various sources
5. **Verify results**: System matches bet codes with results and calculates winnings
6. **Display reports**: System displays detailed verification reports

## II. JSON Schemas

### 2.1 Lottery Stations Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Lottery Stations",
  "description": "Definition of lottery stations in Vietnam by region",
  "type": "object",
  "properties": {
    "regions": {
      "type": "object",
      "properties": {
        "south": {
          "type": "object",
          "description": "Southern region lottery stations",
          "properties": {
            "aliases": {
              "type": "array",
              "description": "Accepted abbreviations for the southern region",
              "items": {
                "type": "string"
              },
              "examples": [
                "mn",
                "dmn",
                "dn",
                "dnam",
                "miennam",
                "mien nam",
                "miền nam",
                "đài nam",
                "đài miền nam",
                "mnam"
              ]
            },
            "multiStationAliases": {
              "type": "object",
              "description": "Aliases for multiple stations in the region",
              "properties": {
                "two": {
                  "type": "array",
                  "description": "Aliases for 2 southern stations",
                  "items": {
                    "type": "string"
                  },
                  "examples": [
                    "2mn",
                    "2dmn",
                    "2dn",
                    "2dnam",
                    "2miennam",
                    "2miền nam",
                    "2đài nam",
                    "2đài miền nam",
                    "2mnam"
                  ]
                },
                "three": {
                  "type": "array",
                  "description": "Aliases for 3 southern stations",
                  "items": {
                    "type": "string"
                  },
                  "examples": [
                    "3mn",
                    "3dmn",
                    "3dn",
                    "3dnam",
                    "3miennam",
                    "3miền nam",
                    "3đài nam",
                    "3đài miền nam",
                    "3mnam"
                  ]
                }
              }
            },
            "schedule": {
              "type": "object",
              "description": "Weekly drawing schedule for southern stations",
              "properties": {
                "sunday": {
                  "type": "array",
                  "description": "Stations drawing on Sunday",
                  "items": {
                    "type": "string"
                  },
                  "examples": ["Tiền Giang", "Kiên Giang", "Đà Lạt"]
                },
                "monday": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "examples": ["TP. HCM", "Đồng Tháp", "Cà Mau"]
                },
                "tuesday": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "examples": ["Bến Tre", "Vũng Tàu", "Bạc Liêu"]
                },
                "wednesday": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "examples": ["Đồng Nai", "Cần Thơ", "Sóc Trăng"]
                },
                "thursday": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "examples": ["Tây Ninh", "An Giang", "Bình Thuận"]
                },
                "friday": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "examples": ["Vĩnh Long", "Bình Dương", "Trà Vinh"]
                },
                "saturday": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "examples": ["TP. HCM", "Long An", "Bình Phước", "Hậu Giang"]
                }
              }
            },
            "stations": {
              "type": "object",
              "description": "Map of station names to their aliases",
              "additionalProperties": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "examples": {
                "Tiền Giang": [
                  "tg",
                  "tgiang",
                  "tiengiang",
                  "tien giang",
                  "tiền giang"
                ],
                "Đồng Nai": ["dnai", "dongnai", "dong nai", "đồng nai"]
              }
            }
          },
          "required": ["aliases", "multiStationAliases", "schedule", "stations"]
        },
        "central": {
          "type": "object",
          "description": "Central region lottery stations",
          "properties": {
            "aliases": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "examples": [
                "mt",
                "dmt",
                "dt",
                "dtrung",
                "mientrung",
                "mien trung",
                "miền trung",
                "đài trung",
                "đài miền trung",
                "mtrung"
              ]
            },
            "multiStationAliases": {
              "type": "object",
              "properties": {
                "two": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "three": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              }
            },
            "schedule": {
              "type": "object",
              "additionalProperties": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            },
            "stations": {
              "type": "object",
              "additionalProperties": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          },
          "required": ["aliases", "multiStationAliases", "schedule", "stations"]
        },
        "north": {
          "type": "object",
          "description": "Northern region lottery station",
          "properties": {
            "aliases": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "examples": [
                "mb",
                "hn",
                "hanoi",
                "mienbac",
                "db",
                "hà nội",
                "miền bắc",
                "daibac",
                "dbac",
                "đài bắc",
                "đài miền bắc"
              ]
            },
            "stations": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "examples": [
                "Hà Nội",
                "Quảng Ninh",
                "Bắc Ninh",
                "Hải Phòng",
                "Nam Định",
                "Thái Bình"
              ]
            }
          },
          "required": ["aliases", "stations"]
        }
      },
      "required": ["south", "central", "north"]
    },
    "conflictResolution": {
      "type": "object",
      "description": "Rules to resolve conflicts in station abbreviations",
      "properties": {
        "specialCases": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "case": {
                "type": "string",
                "description": "Description of the conflict case"
              },
              "resolution": {
                "type": "string",
                "description": "How to resolve the conflict"
              }
            },
            "required": ["case", "resolution"]
          },
          "examples": [
            {
              "case": "dn (Đồng Nai vs Đà Nẵng)",
              "resolution": "Use 'dnai' for Đồng Nai and 'dnang' for Đà Nẵng"
            }
          ]
        }
      },
      "required": ["specialCases"]
    }
  },
  "required": ["regions", "conflictResolution"]
}
```

### 2.2 Prize Structure Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Prize Structure",
  "description": "Definition of prize structure for different lottery regions",
  "type": "object",
  "properties": {
    "regions": {
      "type": "object",
      "properties": {
        "southAndCentral": {
          "type": "object",
          "description": "Prize structure for southern and central regions",
          "properties": {
            "prizes": {
              "type": "object",
              "additionalProperties": {
                "type": "object",
                "properties": {
                  "count": {
                    "type": "integer",
                    "description": "Number of prizes in this category"
                  },
                  "digits": {
                    "type": "integer",
                    "description": "Number of digits in the prize"
                  }
                },
                "required": ["count", "digits"]
              },
              "examples": {
                "special": { "count": 1, "digits": 6 },
                "first": { "count": 1, "digits": 5 },
                "eighth": { "count": 1, "digits": 2 }
              }
            },
            "totalDraws": {
              "type": "integer",
              "description": "Total number of prize draws",
              "examples": [18]
            }
          },
          "required": ["prizes", "totalDraws"]
        },
        "north": {
          "type": "object",
          "description": "Prize structure for northern region",
          "properties": {
            "prizes": {
              "type": "object",
              "additionalProperties": {
                "type": "object",
                "properties": {
                  "count": {
                    "type": "integer"
                  },
                  "digits": {
                    "type": "integer"
                  }
                },
                "required": ["count", "digits"]
              }
            },
            "totalDraws": {
              "type": "integer",
              "examples": [27]
            }
          },
          "required": ["prizes", "totalDraws"]
        }
      },
      "required": ["southAndCentral", "north"]
    }
  },
  "required": ["regions"]
}
```

### 2.3 Bet Types Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Bet Types",
  "description": "Definition of different lottery bet types",
  "type": "object",
  "properties": {
    "payoutRates": {
      "type": "object",
      "description": "Standard payout rates for different bet types",
      "properties": {
        "twoDigits": {
          "type": "object",
          "properties": {
            "standard": {
              "type": "integer",
              "description": "Standard payout rate for 2-digit bets",
              "examples": [75]
            },
            "bridgeOneStation": {
              "type": "integer",
              "description": "Payout rate for bridge bets with 1 station",
              "examples": [750]
            },
            "bridgeTwoStations": {
              "type": "integer",
              "description": "Payout rate for bridge bets with 2 stations",
              "examples": [550]
            },
            "bridgeNorth": {
              "type": "integer",
              "description": "Payout rate for bridge bets in northern region",
              "examples": [650]
            },
            "crossTwo": {
              "type": "integer",
              "description": "Payout rate for 2-number cross bets",
              "examples": [350]
            },
            "crossThree": {
              "type": "integer",
              "description": "Payout rate for 3-number cross bets",
              "examples": [1000]
            },
            "crossFour": {
              "type": "integer",
              "description": "Payout rate for 4-number cross bets",
              "examples": [3000]
            }
          },
          "required": [
            "standard",
            "bridgeOneStation",
            "bridgeTwoStations",
            "bridgeNorth",
            "crossTwo",
            "crossThree",
            "crossFour"
          ]
        },
        "threeDigits": {
          "type": "integer",
          "description": "Standard payout rate for 3-digit bets",
          "examples": [650]
        },
        "fourDigits": {
          "type": "integer",
          "description": "Standard payout rate for 4-digit bets",
          "examples": [5500]
        }
      },
      "required": ["twoDigits", "threeDigits", "fourDigits"]
    },
    "betTypes": {
      "type": "array",
      "description": "List of bet types",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "Name of the bet type"
          },
          "aliases": {
            "type": "array",
            "description": "Abbreviations and alternate names",
            "items": {
              "type": "string"
            }
          },
          "applicableRegions": {
            "type": "array",
            "description": "Regions where this bet type can be used",
            "items": {
              "type": "string",
              "enum": ["South", "Central", "North"]
            }
          },
          "betRule": {
            "type": "array",
            "description": "Required number of digits",
            "items": {
              "type": "string"
            }
          },
          "matchingDraw": {
            "type": "object",
            "description": "Definition of which draws are matched",
            "additionalProperties": true
          },
          "combinations": {
            "type": "object",
            "description": "Number of possible combinations for each region",
            "additionalProperties": true
          },
          "matchingMethod": {
            "type": "string",
            "description": "How to check if a bet wins"
          },
          "payoutRate": {
            "type": "object",
            "description": "Payout rate for winning bets",
            "additionalProperties": true
          }
        },
        "required": [
          "name",
          "aliases",
          "applicableRegions",
          "betRule",
          "matchingDraw",
          "combinations",
          "matchingMethod",
          "payoutRate"
        ]
      }
    }
  },
  "required": ["payoutRates", "betTypes"]
}
```

### 2.4 Number Combination Types Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Number Combination Types",
  "description": "Definition of different number combination selection types",
  "type": "object",
  "properties": {
    "combinationTypes": {
      "type": "array",
      "description": "List of number combination types",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "Name of the combination type"
          },
          "aliases": {
            "type": "array",
            "description": "Abbreviations and alternate names",
            "items": {
              "type": "string"
            }
          },
          "definition": {
            "type": "string",
            "description": "Definition of this combination type"
          },
          "syntax": {
            "type": "string",
            "description": "How to express this combination in bet codes"
          },
          "applicableBetTypes": {
            "type": "array",
            "description": "Bet types that can use this combination",
            "items": {
              "type": "string"
            }
          },
          "examples": {
            "type": "array",
            "description": "Examples of this combination type",
            "items": {
              "type": "string"
            }
          },
          "calculationMethod": {
            "type": "string",
            "description": "How to calculate the combinations"
          }
        },
        "required": [
          "name",
          "aliases",
          "definition",
          "syntax",
          "applicableBetTypes",
          "examples"
        ]
      }
    }
  },
  "required": ["combinationTypes"]
}
```

### 2.5 Error Detection and Correction Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Error Detection and Correction",
  "description": "Definition of error detection and correction rules",
  "type": "object",
  "properties": {
    "errorTypes": {
      "type": "array",
      "description": "Types of errors that can occur in bet codes",
      "items": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "description": "Type of error"
          },
          "detection": {
            "type": "string",
            "description": "Method to detect this error"
          },
          "correction": {
            "type": "string",
            "description": "Method to automatically correct this error"
          },
          "examples": {
            "type": "array",
            "description": "Examples of this error and correction",
            "items": {
              "type": "object",
              "properties": {
                "input": {
                  "type": "string",
                  "description": "Error input"
                },
                "corrected": {
                  "type": "string",
                  "description": "Corrected output"
                },
                "explanation": {
                  "type": "string",
                  "description": "Explanation of the correction"
                }
              },
              "required": ["input", "corrected", "explanation"]
            }
          }
        },
        "required": ["type", "detection", "correction", "examples"]
      }
    },
    "inputNormalization": {
      "type": "array",
      "description": "Rules for normalizing input",
      "items": {
        "type": "object",
        "properties": {
          "rule": {
            "type": "string",
            "description": "Normalization rule"
          },
          "method": {
            "type": "string",
            "description": "Method to apply the rule"
          },
          "examples": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "input": {
                  "type": "string"
                },
                "normalized": {
                  "type": "string"
                }
              },
              "required": ["input", "normalized"]
            }
          }
        },
        "required": ["rule", "method", "examples"]
      }
    }
  },
  "required": ["errorTypes", "inputNormalization"]
}
```

## III. Number Combination Types

This section defines different ways to select combinations of numbers for betting.

### 3.1 Sequence (keo)

```json
{
  "name": "Sequence",
  "aliases": ["keo"],
  "definition": "Select a start number, next number, and end number to create a sequence",
  "syntax": "[startNumber]/[nextNumber]keo[endNumber]",
  "applicableBetTypes": ["head", "tail", "headAndTail", "threeDigits"],
  "examples": [
    "10/20keo90 (sequence: 10, 20, 30, 40, 50, 60, 70, 80, 90)",
    "10/11keo19 (sequence: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19)",
    "111/222keo999 (sequence: 111, 222, 333, 444, 555, 666, 777, 888, 999)"
  ],
  "calculationMethod": "Let startNumber=A, nextNumber=B, endNumber=C. Step size D = B-A. Number of variations = (C-A)/D + 1"
}
```

### 3.2 High (tai)

```json
{
  "name": "High",
  "aliases": ["tai"],
  "definition": "Includes 50 numbers from 50 to 99",
  "syntax": "tai",
  "applicableBetTypes": ["head", "tail", "headAndTail"],
  "examples": ["tai (numbers: 50, 51, 52, ..., 99)"]
}
```

### 3.3 Low (xiu)

```json
{
  "name": "Low",
  "aliases": ["xiu"],
  "definition": "Includes 50 numbers from 00 to 49",
  "syntax": "xiu",
  "applicableBetTypes": ["head", "tail", "headAndTail"],
  "examples": ["xiu (numbers: 00, 01, 02, ..., 49)"]
}
```

### 3.4 Even (chan)

```json
{
  "name": "Even",
  "aliases": ["chan"],
  "definition": "Includes 50 even numbers from 00 to 98",
  "syntax": "chan",
  "applicableBetTypes": ["head", "tail", "headAndTail"],
  "examples": ["chan (numbers: 00, 02, 04, ..., 98)"]
}
```

### 3.5 Odd (le)

```json
{
  "name": "Odd",
  "aliases": ["le"],
  "definition": "Includes 50 odd numbers from 01 to 99",
  "syntax": "le",
  "applicableBetTypes": ["head", "tail", "headAndTail"],
  "examples": ["le (numbers: 01, 03, 05, ..., 99)"]
}
```

### 3.6 Even-Even (chanchan)

```json
{
  "name": "Even-Even",
  "aliases": ["chanchan"],
  "definition": "Includes 25 numbers where both digits are even",
  "syntax": "chanchan",
  "applicableBetTypes": ["head", "tail", "headAndTail"],
  "examples": [
    "chanchan (numbers: 00, 02, 04, 06, 08, 20, 22, 24, 26, 28, ...)"
  ]
}
```

### 3.7 Odd-Odd (lele)

```json
{
  "name": "Odd-Odd",
  "aliases": ["lele"],
  "definition": "Includes 25 numbers where both digits are odd",
  "syntax": "lele",
  "applicableBetTypes": ["head", "tail", "headAndTail"],
  "examples": ["lele (numbers: 11, 13, 15, 17, 19, 31, 33, 35, 37, 39, ...)"]
}
```

### 3.8 Even-Odd (chanle)

```json
{
  "name": "Even-Odd",
  "aliases": ["chanle"],
  "definition": "Includes 25 numbers where first digit is even and second digit is odd",
  "syntax": "chanle",
  "applicableBetTypes": ["head", "tail", "headAndTail"],
  "examples": ["chanle (numbers: 01, 03, 05, 07, 09, 21, 23, 25, 27, 29, ...)"]
}
```

### 3.9 Odd-Even (lechan)

```json
{
  "name": "Odd-Even",
  "aliases": ["lechan"],
  "definition": "Includes 25 numbers where first digit is odd and second digit is even",
  "syntax": "lechan",
  "applicableBetTypes": ["head", "tail", "headAndTail"],
  "examples": ["lechan (numbers: 10, 12, 14, 16, 18, 30, 32, 34, 36, 38, ...)"]
}
```

## IV. Bet Types

Here are the detailed definitions of various bet types:

### 4.1 Head and Tail (dd)

```json
{
  "name": "Head and Tail",
  "aliases": ["dd"],
  "applicableRegions": ["South", "Central", "North"],
  "betRule": ["2 digits"],
  "matchingDraw": {
    "South/Central": {
      "head": [{ "prize": "eighth", "count": 1 }],
      "tail": [{ "prize": "special", "count": 1 }]
    },
    "North": {
      "head": [{ "prize": "seventh", "count": 4 }],
      "tail": [{ "prize": "special", "count": 1 }]
    }
  },
  "combinations": {
    "South/Central": 2,
    "North": 5
  },
  "matchingMethod": "Match the last 2 digits of the draw",
  "payoutRate": 75
}
```

### 4.2 Three Digits (xc, x)

```json
{
  "name": "Three Digits",
  "aliases": ["xc", "x"],
  "applicableRegions": ["South", "Central", "North"],
  "betRule": ["3 digits"],
  "matchingDraw": {
    "South/Central": {
      "head": [{ "prize": "seventh", "count": 1 }],
      "tail": [{ "prize": "special", "count": 1 }]
    },
    "North": {
      "head": [{ "prize": "sixth", "count": 3 }],
      "tail": [{ "prize": "special", "count": 1 }]
    }
  },
  "combinations": {
    "South/Central": 2,
    "North": 4
  },
  "matchingMethod": "Match the last 3 digits of the draw",
  "payoutRate": 650
}
```

### 4.3 Head (dau)

```json
{
  "name": "Head",
  "aliases": ["dau"],
  "applicableRegions": ["South", "Central", "North"],
  "betRule": ["2 digits", "3 digits"],
  "matchingDraw": {
    "2 digits": {
      "South/Central": [{ "prize": "eighth", "count": 1 }],
      "North": [{ "prize": "seventh", "count": 4 }]
    },
    "3 digits": {
      "South/Central": [{ "prize": "seventh", "count": 1 }],
      "North": [{ "prize": "sixth", "count": 3 }]
    }
  },
  "combinations": {
    "2 digits": {
      "South/Central": 1,
      "North": 4
    },
    "3 digits": {
      "South/Central": 1,
      "North": 3
    }
  },
  "matchingMethod": "Match the last 2 or 3 digits of the draw",
  "payoutRate": {
    "2 digits": 75,
    "3 digits": 650
  }
}
```

### 4.4 Tail (duoi)

```json
{
  "name": "Tail",
  "aliases": ["duoi", "dui"],
  "applicableRegions": ["South", "Central", "North"],
  "betRule": ["2 digits", "3 digits"],
  "matchingDraw": {
    "2 digits": {
      "South/Central": [{ "prize": "special", "count": 1 }],
      "North": [{ "prize": "special", "count": 1 }]
    },
    "3 digits": {
      "South/Central": [{ "prize": "special", "count": 1 }],
      "North": [{ "prize": "special", "count": 1 }]
    }
  },
  "combinations": {
    "2 digits": {
      "South/Central": 1,
      "North": 1
    },
    "3 digits": {
      "South/Central": 1,
      "North": 1
    }
  },
  "matchingMethod": "Match the last 2 or 3 digits of the draw",
  "payoutRate": {
    "2 digits": 75,
    "3 digits": 650
  }
}
```

### 4.5 Cover All (b)

```json
{
  "name": "Cover All",
  "aliases": ["b"],
  "applicableRegions": ["South", "Central", "North"],
  "betRule": ["2 digits", "3 digits", "4 digits"],
  "matchingDraw": {
    "2 digits": {
      "South/Central": "all prizes",
      "North": "all prizes"
    },
    "3 digits": {
      "South/Central": "all prizes except eighth",
      "North": "all prizes except seventh"
    },
    "4 digits": {
      "South/Central": "all prizes except eighth and seventh",
      "North": "all prizes except seventh and sixth"
    }
  },
  "combinations": {
    "2 digits": {
      "South/Central": 18,
      "North": 27
    },
    "3 digits": {
      "South/Central": 17,
      "North": 23
    },
    "4 digits": {
      "South/Central": 16,
      "North": 20
    }
  },
  "matchingMethod": "Match the last 2, 3, or 4 digits of the draw",
  "payoutRate": {
    "2 digits": 75,
    "3 digits": 650,
    "4 digits": 5500
  }
}
```

## V. Stake Calculation

### 5.1 General Formula

```javascript
// General formula
stakeAmount = numberOfStations × numberOfBets × numberOfCombinations × betAmount;

// Special case for Bridge bets
stakeAmount = numberOfStations × bridgeFactor × numberOfCombinations × betAmount;
// Where bridgeFactor = C(n,2) = n*(n-1)/2 with n being the number of bets.

// Special case for Permutation bets
stakeAmount = numberOfStations × numberOfPermutations × numberOfCombinations × betAmount;
// Where numberOfPermutations is calculated using permutation formula excluding duplicates
```

### 5.2 Prize Calculation

```javascript
// General formula
prizeAmount = numberOfWinningCombinations × betAmount × payoutRate;

// Special case for Bridge bets (with bonus prize)
prizeCalculationFactor = numberOfMatches - 1;
baseWinningAmount = betAmount × payoutRate;
bonusPrize = (maxOccurrences - 1) × 0.5 × baseWinningAmount;
prizeAmount = baseWinningAmount × prizeCalculationFactor + bonusPrize;
```

## VI. System Architecture

### 6.1 Overall Architecture

```
📁 src/
  📁 core/
    📄 constants.js   # Constants, station lists, bet types...
    📄 types.js       # Type definitions
  📁 modules/
    📁 parser/
      📄 inputParser.js   # Input processing, normalization
      📄 betCodeParser.js # Bet code parsing
    📁 validator/
      📄 betValidator.js   # Bet code validation
      📄 errorDetector.js  # Error detection
      📄 errorFixer.js     # Automatic error correction
    📁 calculator/
      📄 stakeCalculator.js # Stake calculation
      📄 prizeCalculator.js # Prize calculation
    📁 matcher/
      📄 resultMatcher.js   # Result matching
  📁 services/
    📄 betService.js      # Bet processing service
    📄 resultService.js   # Result verification service
  📁 api/
    📄 betController.js   # Bet API
    📄 resultController.js # Result API
  📁 ui/
    📁 components/        # UI components
    📁 pages/             # Pages
```

### 6.2 Processing Flow

```
1. User inputs bet codes
2. System normalizes input
3. System parses bet code syntax
4. System detects and fixes errors
5. System calculates stake
6. User inputs/system loads lottery results
7. System verifies results and calculates prizes
8. System displays verification report
```

## VII. Proposed Improvements

### 7.1 Normalization and Error Correction

- Use string distance algorithms (Levenshtein) for automatic error correction
- Machine learning from historical data to improve error correction accuracy
- Create abbreviation and synonym dictionaries to support more writing styles

### 7.2 Performance and Extensibility

- Optimize verification algorithms for large volumes
- Design modular system for easy addition of new bet types
- Support multiple lottery result sources

### 7.3 UI/UX

- Create intuitive interface for bet code analysis
- Display error analysis and correction suggestions
- Visual verification reports with charts and tables
