const mathDescriptors = [{
  "n": "TAN",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "45*PI()/180",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "TANH",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "CEILING",
  "t": 0,
  "m": [2, 2],
  "p": [{
    "example": "23.25",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "0.1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "ATAN",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "0",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "ASINH",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "0.9",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "ABS",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "-2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "ACOS",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "0",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "ACOSH",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "MULTINOMIAL",
  "t": 0,
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
  "n": "ATANH",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "0.9",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "ATAN2",
  "t": 0,
  "m": [2, 2],
  "p": [{
    "example": "4",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "3",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "COSH",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "INT",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "99.44",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "ISEVEN",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "4",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "ISODD",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "4",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "LCM",
  "t": 0,
  "m": [1, 255],
  "p": [{
    "example": "A2:A5",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "3",
    "require": "o",
    "repeat": "y",
    "type": "rangeall"
  }]
}, {
  "n": "LN",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "LOG",
  "t": 0,
  "m": [1, 2],
  "p": [{
    "example": "128",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "2",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "LOG10",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "MOD",
  "t": 0,
  "m": [2, 2],
  "p": [{
    "example": "10",
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
  "n": "MROUND",
  "t": 0,
  "m": [2, 2],
  "p": [{
    "example": "21",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "14",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "ODD",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "SUMSQ",
  "t": 0,
  "m": [1, 255],
  "p": [{
    "example": "A2:A100",
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
  "n": "COMBIN",
  "t": 0,
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
  "n": "SUM",
  "t": 0,
  "m": [1, 255],
  "p": [{
    "example": "A2:A100",
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
  "n": "ASIN",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "0",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "RADIANS",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "180",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "RAND",
  "t": 0,
  "m": [0, 0],
  "p": []
}, {
  "n": "DEGREES",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "PI()",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "ERFC",
  "t": 9,
  "m": [1, 1],
  "p": [{
    "example": "2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "EVEN",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "3",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "EXP",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "FACT",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "3",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "FACTDOUBLE",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "6",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "PI",
  "t": 0,
  "m": [0, 0],
  "p": []
}, {
  "n": "FLOOR",
  "t": 0,
  "m": [2, 2],
  "p": [{
    "example": "23.25",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "0.1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "GCD",
  "t": 0,
  "m": [1, 255],
  "p": [{
    "example": "A2:A5",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "96",
    "require": "o",
    "repeat": "y",
    "type": "rangeall"
  }]
}, {
  "n": "RANDBETWEEN",
  "t": 0,
  "m": [2, 2],
  "p": [{
    "example": "1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "10",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "ROUND",
  "t": 0,
  "m": [2, 2],
  "p": [{
    "example": "99.44",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "ROUNDDOWN",
  "t": 0,
  "m": [2, 2],
  "p": [{
    "example": "99.44",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "ROUNDUP",
  "t": 0,
  "m": [2, 2],
  "p": [{
    "example": "99.44",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "SERIESSUM",
  "t": 0,
  "m": [4, 4],
  "p": [{
    "example": "1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "0",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "{FACT(0)",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "SIGN",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "-42",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "SIN",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "PI()",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "SINH",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "SQRT",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "9",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "SQRTPI",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "9",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "GAMMALN",
  "t": 1,
  "m": [1, 1],
  "p": [{
    "example": "4",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "COS",
  "t": 0,
  "m": [1, 1],
  "p": [{
    "example": "PI()",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "TRUNC",
  "t": 0,
  "m": [1, 2],
  "p": [{
    "example": "3.141592654",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "2",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "QUOTIENT",
  "t": 0,
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
  "n": "POWER",
  "t": 0,
  "m": [2, 2],
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
  }]
}, {
  "n": "PRODUCT",
  "t": 0,
  "m": [1, 255],
  "p": [{
    "example": "A2:A100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "2",
    "require": "o",
    "repeat": "y",
    "type": "rangenumber"
  }]
}];
export default mathDescriptors;