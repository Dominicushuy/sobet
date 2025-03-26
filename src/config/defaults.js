// src/config/defaults.js
export const defaultStations = [
  // Miền Nam
  {
    name: 'TP. HCM',
    region: 'south',
    aliases: ['hcm', 'tphcm', 'tp', 'saigon', 'sài gòn', 'sg'],
    isActive: true,
    schedule: { day: 'monday', order: 1 },
  },
  {
    name: 'Đồng Tháp',
    region: 'south',
    aliases: ['dt', 'dongthap', 'đồng tháp', 'dthap'],
    isActive: true,
    schedule: { day: 'monday', order: 2 },
  },
  {
    name: 'Cà Mau',
    region: 'south',
    aliases: ['cm', 'camau', 'cà mau', 'cmau'],
    isActive: true,
    schedule: { day: 'monday', order: 3 },
  },
  {
    name: 'Bến Tre',
    region: 'south',
    aliases: ['bt', 'bentre', 'bến tre', 'btre'],
    isActive: true,
    schedule: { day: 'tuesday', order: 1 },
  },
  {
    name: 'Vũng Tàu',
    region: 'south',
    aliases: ['vt', 'vungtau', 'vũng tàu', 'vtau'],
    isActive: true,
    schedule: { day: 'tuesday', order: 2 },
  },
  {
    name: 'Bạc Liêu',
    region: 'south',
    aliases: ['bl', 'baclieu', 'bạc liêu', 'blieu'],
    isActive: true,
    schedule: { day: 'tuesday', order: 3 },
  },
  {
    name: 'Đồng Nai',
    region: 'south',
    aliases: ['dn', 'dnai', 'dongnai', 'đồng nai'],
    isActive: true,
    schedule: { day: 'wednesday', order: 1 },
  },
  {
    name: 'Cần Thơ',
    region: 'south',
    aliases: ['ct', 'cantho', 'cần thơ', 'ctho'],
    isActive: true,
    schedule: { day: 'wednesday', order: 2 },
  },
  {
    name: 'Sóc Trăng',
    region: 'south',
    aliases: ['st', 'soctrang', 'sóc trăng', 'strang'],
    isActive: true,
    schedule: { day: 'wednesday', order: 3 },
  },
  {
    name: 'Tây Ninh',
    region: 'south',
    aliases: ['tn', 'tayninh', 'tây ninh', 'tninh'],
    isActive: true,
    schedule: { day: 'thursday', order: 1 },
  },
  {
    name: 'An Giang',
    region: 'south',
    aliases: ['ag', 'angiang', 'an giang', 'agiang'],
    isActive: true,
    schedule: { day: 'thursday', order: 2 },
  },
  {
    name: 'Bình Thuận',
    region: 'south',
    aliases: ['bt', 'bthuan', 'binhthuan', 'bình thuận'],
    isActive: true,
    schedule: { day: 'thursday', order: 3 },
  },
  {
    name: 'Vĩnh Long',
    region: 'south',
    aliases: ['vl', 'vinhlong', 'vĩnh long', 'vlong'],
    isActive: true,
    schedule: { day: 'friday', order: 1 },
  },
  {
    name: 'Bình Dương',
    region: 'south',
    aliases: ['bd', 'bduong', 'binhduong', 'bình dương'],
    isActive: true,
    schedule: { day: 'friday', order: 2 },
  },
  {
    name: 'Trà Vinh',
    region: 'south',
    aliases: ['tv', 'travinh', 'trà vinh', 'tvinh'],
    isActive: true,
    schedule: { day: 'friday', order: 3 },
  },
  {
    name: 'Long An',
    region: 'south',
    aliases: ['la', 'longan', 'long an', 'lan'],
    isActive: true,
    schedule: { day: 'saturday', order: 2 },
  },
  {
    name: 'Bình Phước',
    region: 'south',
    aliases: ['bp', 'bphuoc', 'binhphuoc', 'bình phước'],
    isActive: true,
    schedule: { day: 'saturday', order: 3 },
  },
  {
    name: 'Hậu Giang',
    region: 'south',
    aliases: ['hg', 'hgiang', 'haugiang', 'hậu giang'],
    isActive: true,
    schedule: { day: 'saturday', order: 4 },
  },
  {
    name: 'Tiền Giang',
    region: 'south',
    aliases: ['tg', 'tiengiang', 'tiền giang', 'tgiang'],
    isActive: true,
    schedule: { day: 'sunday', order: 1 },
  },
  {
    name: 'Kiên Giang',
    region: 'south',
    aliases: ['kg', 'kiengiang', 'kiên giang', 'kgiang'],
    isActive: true,
    schedule: { day: 'sunday', order: 2 },
  },
  {
    name: 'Đà Lạt',
    region: 'south',
    aliases: ['dl', 'dalat', 'đà lạt', 'dlat'],
    isActive: true,
    schedule: { day: 'sunday', order: 3 },
  },

  // Miền Trung
  {
    name: 'Đà Nẵng',
    region: 'central',
    aliases: ['dnang', 'danang', 'đà nẵng'],
    isActive: true,
    schedule: { day: 'saturday', order: 1 },
  },
  {
    name: 'Quảng Nam',
    region: 'central',
    aliases: ['qn', 'qnam', 'quangnam', 'quảng nam'],
    isActive: true,
    schedule: { day: 'tuesday', order: 1 },
  },
  {
    name: 'Khánh Hòa',
    region: 'central',
    aliases: ['kh', 'khoa', 'khanhhoa', 'khánh hòa'],
    isActive: true,
    schedule: { day: 'wednesday', order: 1 },
  },

  // Miền Bắc
  {
    name: 'Miền Bắc',
    region: 'north',
    aliases: ['mb', 'mienbac', 'miền bắc', 'hanoi', 'hn', 'hà nội'],
    isActive: true,
    schedule: { day: 'daily', order: 1 },
  },
]

export const defaultBetTypes = [
  {
    name: 'Đầu Đuôi',
    aliases: ['dd', 'dau duoi', 'đầu đuôi', 'head and tail'],
    applicableRegions: ['south', 'central', 'north'],
    betRule: ['2 digits'],
    matchingDraw: {
      south: {
        head: [{ prize: 'eighth', count: 1 }],
        tail: [{ prize: 'special', count: 1 }],
      },
      central: {
        head: [{ prize: 'eighth', count: 1 }],
        tail: [{ prize: 'special', count: 1 }],
      },
      north: {
        head: [{ prize: 'seventh', count: 4 }],
        tail: [{ prize: 'special', count: 1 }],
      },
    },
    combinations: {
      south: 2,
      central: 2,
      north: 5,
    },
    matchingMethod: 'Match the last 2 digits of the draw',
    payoutRate: 75,
    isActive: true,
  },
  {
    name: 'Xỉu chủ',
    aliases: ['xc', 'x', 'xiu chu', 'xiuchu', 'three digits'],
    applicableRegions: ['south', 'central', 'north'],
    betRule: ['3 digits'],
    matchingDraw: {
      south: {
        head: [{ prize: 'seventh', count: 1 }],
        tail: [{ prize: 'special', count: 1 }],
      },
      central: {
        head: [{ prize: 'seventh', count: 1 }],
        tail: [{ prize: 'special', count: 1 }],
      },
      north: {
        head: [{ prize: 'sixth', count: 3 }],
        tail: [{ prize: 'special', count: 1 }],
      },
    },
    combinations: {
      south: 2,
      central: 2,
      north: 4,
    },
    matchingMethod: 'Match the last 3 digits of the draw',
    payoutRate: 650,
    isActive: true,
  },
  {
    name: 'Đầu',
    aliases: ['dau', 'đầu', 'head'],
    applicableRegions: ['south', 'central', 'north'],
    betRule: ['2 digits', '3 digits'],
    matchingDraw: {
      '2 digits': {
        south: [{ prize: 'eighth', count: 1 }],
        central: [{ prize: 'eighth', count: 1 }],
        north: [{ prize: 'seventh', count: 4 }],
      },
      '3 digits': {
        south: [{ prize: 'seventh', count: 1 }],
        central: [{ prize: 'seventh', count: 1 }],
        north: [{ prize: 'sixth', count: 3 }],
      },
    },
    combinations: {
      '2 digits': {
        south: 1,
        central: 1,
        north: 4,
      },
      '3 digits': {
        south: 1,
        central: 1,
        north: 3,
      },
    },
    matchingMethod: 'Match the last 2 or 3 digits of the draw',
    payoutRate: {
      '2 digits': 75,
      '3 digits': 650,
    },
    isActive: true,
  },
  {
    name: 'Đuôi',
    aliases: ['duoi', 'dui', 'đuôi', 'tail'],
    applicableRegions: ['south', 'central', 'north'],
    betRule: ['2 digits', '3 digits'],
    matchingDraw: {
      '2 digits': {
        south: [{ prize: 'special', count: 1 }],
        central: [{ prize: 'special', count: 1 }],
        north: [{ prize: 'special', count: 1 }],
      },
      '3 digits': {
        south: [{ prize: 'special', count: 1 }],
        central: [{ prize: 'special', count: 1 }],
        north: [{ prize: 'special', count: 1 }],
      },
    },
    combinations: {
      '2 digits': {
        south: 1,
        central: 1,
        north: 1,
      },
      '3 digits': {
        south: 1,
        central: 1,
        north: 1,
      },
    },
    matchingMethod: 'Match the last 2 or 3 digits of the draw',
    payoutRate: {
      '2 digits': 75,
      '3 digits': 650,
    },
    isActive: true,
  },
  {
    name: 'Bao Lô',
    aliases: ['b', 'bao', 'bao lo', 'bao lô', 'cover all'],
    applicableRegions: ['south', 'central', 'north'],
    betRule: ['2 digits', '3 digits', '4 digits'],
    matchingDraw: {
      '2 digits': {
        south: 'all prizes',
        central: 'all prizes',
        north: 'all prizes',
      },
      '3 digits': {
        south: 'all prizes except eighth',
        central: 'all prizes except eighth',
        north: 'all prizes except seventh',
      },
      '4 digits': {
        south: 'all prizes except eighth and seventh',
        central: 'all prizes except eighth and seventh',
        north: 'all prizes except seventh and sixth',
      },
    },
    combinations: {
      '2 digits': {
        south: 18,
        central: 18,
        north: 27,
      },
      '3 digits': {
        south: 17,
        central: 17,
        north: 23,
      },
      '4 digits': {
        south: 16,
        central: 16,
        north: 20,
      },
    },
    matchingMethod: 'Match the last 2, 3, or 4 digits of the draw',
    payoutRate: {
      '2 digits': 75,
      '3 digits': 650,
      '4 digits': 5500,
    },
    isActive: true,
  },
]

export const defaultNumberCombinations = [
  {
    name: 'Kéo',
    aliases: ['keo', 'sequence'],
    definition:
      'Chọn số bắt đầu, số tiếp theo và số kết thúc để tạo một dãy số',
    syntax: '[startNumber]/[nextNumber]keo[endNumber]',
    applicableBetTypes: ['dau', 'duoi', 'dd', 'xc'],
    examples: [
      '10/20keo90 (sequence: 10, 20, 30, 40, 50, 60, 70, 80, 90)',
      '10/11keo19 (sequence: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19)',
      '111/222keo999 (sequence: 111, 222, 333, 444, 555, 666, 777, 888, 999)',
    ],
    calculationMethod:
      'Let startNumber=A, nextNumber=B, endNumber=C. Step size D = B-A. Number of variations = (C-A)/D + 1',
    isActive: true,
  },
  {
    name: 'Tài',
    aliases: ['tai', 'high'],
    definition: 'Bao gồm 50 số từ 50 đến 99',
    syntax: 'tai',
    applicableBetTypes: ['dau', 'duoi', 'dd'],
    examples: ['tai (numbers: 50, 51, 52, ..., 99)'],
    calculationMethod: 'Fixed set of 50 numbers from 50 to 99',
    isActive: true,
  },
  {
    name: 'Xỉu',
    aliases: ['xiu', 'low'],
    definition: 'Bao gồm 50 số từ 00 đến 49',
    syntax: 'xiu',
    applicableBetTypes: ['dau', 'duoi', 'dd'],
    examples: ['xiu (numbers: 00, 01, 02, ..., 49)'],
    calculationMethod: 'Fixed set of 50 numbers from 00 to 49',
    isActive: true,
  },
  {
    name: 'Chẵn',
    aliases: ['chan', 'even'],
    definition: 'Bao gồm 50 số chẵn từ 00 đến 98',
    syntax: 'chan',
    applicableBetTypes: ['dau', 'duoi', 'dd'],
    examples: ['chan (numbers: 00, 02, 04, ..., 98)'],
    calculationMethod: 'Fixed set of 50 even numbers from 00 to 98',
    isActive: true,
  },
  {
    name: 'Lẻ',
    aliases: ['le', 'odd'],
    definition: 'Bao gồm 50 số lẻ từ 01 đến 99',
    syntax: 'le',
    applicableBetTypes: ['dau', 'duoi', 'dd'],
    examples: ['le (numbers: 01, 03, 05, ..., 99)'],
    calculationMethod: 'Fixed set of 50 odd numbers from 01 to 99',
    isActive: true,
  },
  {
    name: 'Chẵn Chẵn',
    aliases: ['chanchan', 'even-even'],
    definition: 'Bao gồm 25 số có cả hai chữ số đều chẵn',
    syntax: 'chanchan',
    applicableBetTypes: ['dau', 'duoi', 'dd'],
    examples: [
      'chanchan (numbers: 00, 02, 04, 06, 08, 20, 22, 24, 26, 28, ...)',
    ],
    calculationMethod: 'Fixed set of 25 numbers where both digits are even',
    isActive: true,
  },
  {
    name: 'Lẻ Lẻ',
    aliases: ['lele', 'odd-odd'],
    definition: 'Bao gồm 25 số có cả hai chữ số đều lẻ',
    syntax: 'lele',
    applicableBetTypes: ['dau', 'duoi', 'dd'],
    examples: ['lele (numbers: 11, 13, 15, 17, 19, 31, 33, 35, 37, 39, ...)'],
    calculationMethod: 'Fixed set of 25 numbers where both digits are odd',
    isActive: true,
  },
  {
    name: 'Chẵn Lẻ',
    aliases: ['chanle', 'even-odd'],
    definition: 'Bao gồm 25 số có chữ số đầu là chẵn và chữ số thứ hai là lẻ',
    syntax: 'chanle',
    applicableBetTypes: ['dau', 'duoi', 'dd'],
    examples: ['chanle (numbers: 01, 03, 05, 07, 09, 21, 23, 25, 27, 29, ...)'],
    calculationMethod:
      'Fixed set of 25 numbers where first digit is even and second digit is odd',
    isActive: true,
  },
  {
    name: 'Lẻ Chẵn',
    aliases: ['lechan', 'odd-even'],
    definition: 'Bao gồm 25 số có chữ số đầu là lẻ và chữ số thứ hai là chẵn',
    syntax: 'lechan',
    applicableBetTypes: ['dau', 'duoi', 'dd'],
    examples: ['lechan (numbers: 10, 12, 14, 16, 18, 30, 32, 34, 36, 38, ...)'],
    calculationMethod:
      'Fixed set of 25 numbers where first digit is odd and second digit is even',
    isActive: true,
  },
]
