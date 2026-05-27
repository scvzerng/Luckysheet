const statisticalDescriptorsA = [
const statisticalDescriptors = [{
  "n": "COUNTBLANK",
  "t": 1,
  "m": [1, 1],
  "p": [{
    "example": "A2:C100",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }]
}, {
  "n": "SUBTOTAL",
  "t": 0,
  "m": [2, 256],
  "p": [{
    "example": "1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "A2:A5",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }, {
    "example": "B2:B8",
    "require": "o",
    "repeat": "y",
    "type": "range"
  }]
}, {
  "n": "COUNTIF",
  "t": 1,
  "m": [2, 2],
  "p": [{
    "example": "A1:A10",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }, {
    "example": "\">20\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "COUNTUNIQUE",
  "t": 0,
  "m": [1, 255],
  "p": [{
    "example": "A1:C100",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "1",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "COUNTIFS",
  "t": 1,
  "m": [2, 256],
  "p": [{
    "example": "A1:A10",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }, {
    "example": " \">20\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": " B1:B10",
    "require": "o",
    "repeat": "y",
    "type": "rangeall"
  }]
}, {
  "n": "HARMEAN",
  "t": 1,
  "m": [1, 255],
  "p": [{
    "example": "1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "2",
    "require": "o",
    "repeat": "y",
    "type": "rangenumber"
  }]
}, {
  "n": "HYPGEOMDIST",
  "t": 1,
  "m": [5, 5],
  "p": [{
    "example": "4",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "12",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "20",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "40",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "TRUE()",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "INTERCEPT",
  "t": 1,
  "m": [2, 2],
  "p": [{
    "example": "A2:A100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "B2:B100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "KURT",
  "t": 1,
  "m": [1, 255],
  "p": [{
    "example": "1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "2",
    "require": "o",
    "repeat": "y",
    "type": "rangenumber"
  }]
}, {
  "n": "LARGE",
  "t": 1,
  "m": [2, 2],
  "p": [{
    "example": "A2:B100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "4",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "STDEVA",
  "t": 1,
  "m": [1, 255],
  "p": [{
    "example": "1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "2",
    "require": "o",
    "repeat": "y",
    "type": "rangenumber"
  }]
}, {
  "n": "STDEVP",
  "t": 1,
  "m": [1, 255],
  "p": [{
    "example": "1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "2",
    "require": "o",
    "repeat": "y",
    "type": "rangenumber"
  }]
}, {
  "n": "GEOMEAN",
  "t": 1,
  "m": [1, 255],
  "p": [{
    "example": "1",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "2",
    "require": "o",
    "repeat": "y",
    "type": "rangeall"
  }]
}, {
  "n": "RANK_EQ",
  "t": 1,
  "m": [2, 3],
  "p": [{
    "example": "A10",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "A1:A100",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }, {
    "example": "TRUE()",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "RANK_AVG",
  "t": 1,
  "m": [2, 3],
  "p": [{
    "example": "A10",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "A1:A100",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }, {
    "example": "TRUE()",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "PERCENTRANK_EXC",
  "t": 1,
  "m": [2, 3],
  "p": [{
    "example": "A1:A100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "4",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "PERCENTRANK_INC",
  "t": 1,
  "m": [2, 3],
  "p": [{
    "example": "A1:A100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": " A2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "4",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "FORECAST",
  "t": 1,
  "m": [3, 3],
  "p": [{
    "example": "A1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "A2:A100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "B2:B100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "FISHERINV",
  "t": 1,
  "m": [1, 1],
  "p": [{
    "example": "0.962",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "FISHER",
  "t": 1,
  "m": [1, 1],
  "p": [{
    "example": "0.962",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "MODE_SNGL",
  "t": 1,
  "m": [1, 255],
  "p": [{
    "example": "A2:A100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "B2:B100",
    "require": "o",
    "repeat": "y",
    "type": "rangenumber"
  }]
}, {
  "n": "WEIBULL_DIST",
  "t": 1,
  "m": [4, 4],
  "p": [{
    "example": "2.4",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "3",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "TRUE()",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "COUNT",
  "t": 1,
  "m": [1, 255],
  "p": [{
    "example": "A2:A100",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "B2:B100",
    "require": "o",
    "repeat": "y",
    "type": "rangeall"
  }]
}, {
  "n": "COUNTA",
  "t": 1,
  "m": [1, 255],
  "p": [{
    "example": "A2:A100",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "B2:B100",
    "require": "o",
    "repeat": "y",
    "type": "rangeall"
  }]
}, {
  "n": "AVEDEV",
  "t": 1,
  "m": [1, 255],
  "p": [{
    "example": "1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "2",
    "require": "o",
    "repeat": "y",
    "type": "rangenumber"
  }]
}, {
  "n": "AVERAGE",
  "t": 1,
  "m": [1, 255],
  "p": [{
    "example": "A2:A100",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "B2:B100",
    "require": "o",
    "repeat": "y",
    "type": "rangeall"
  }]
}, {
  "n": "AVERAGEA",
  "t": 1,
  "m": [1, 255],
  "p": [{
    "example": "A2:A100",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "B2:B100",
    "require": "o",
    "repeat": "y",
    "type": "rangeall"
  }]
}, {
  "n": "BINOM_DIST",
  "t": 1,
  "m": [4, 4],
  "p": [{
    "example": "4",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "0.005",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "FALSE()",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "BINOM_INV",
  "t": 1,
  "m": [3, 3],
  "p": [{
    "example": "100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "0.005",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "0.8",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "CONFIDENCE_NORM",
  "t": 1,
  "m": [3, 3],
  "p": [{
    "example": "0.05",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "1.6",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "250",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "CORREL",
  "t": 1,
  "m": [2, 2],
  "p": [{
    "example": "A2:A100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "B2:B100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "COVARIANCE_P",
  "t": 1,
  "m": [2, 2],
  "p": [{
    "example": "B2:B100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "A2:A100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "COVARIANCE_S",
  "t": 1,
  "m": [2, 2],
  "p": [{
    "example": "A2:A100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "B2:B100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "DEVSQ",
  "t": 1,
  "m": [1, 255],
  "p": [{
    "example": "1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "2",
    "require": "o",
    "repeat": "y",
    "type": "rangenumber"
  }]
}, {
  "n": "EXPON_DIST",
  "t": 1,
  "m": [3, 3],
  "p": [{
    "example": "4",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "0.5",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "FALSE()",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "AVERAGEIF",
  "t": 1,
  "m": [2, 3],
  "p": [{
    "example": "A1:A10",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\">20\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "B1:B10",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "AVERAGEIFS",
  "t": 1,
  "m": [2, 255],
  "p": [{
    "example": "A1:A10",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": " B1:B10",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": " \">20\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": " C1:C10",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "PERMUT",
  "t": 1,
  "m": [2, 2],
  "p": [{
    "example": "4",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "TRIMMEAN",
  "t": 1,
  "m": [2, 2],
  "p": [{
    "example": "A2:A100",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }, {
    "example": "0.1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "PERCENTILE_EXC",
  "t": 1,
  "m": [2, 2],
  "p": [{
];

export default statisticalDescriptorsA;
