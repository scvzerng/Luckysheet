const engineeringDescriptors = [{
  "n": "BIN2DEC",
  "t": 9,
  "m": [1, 1],
  "p": [{
    "example": "101",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "BIN2HEX",
  "t": 9,
  "m": [1, 2],
  "p": [{
    "example": "101",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "8",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "BIN2OCT",
  "t": 9,
  "m": [1, 2],
  "p": [{
    "example": "101",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "8",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "DEC2BIN",
  "t": 9,
  "m": [1, 2],
  "p": [{
    "example": "100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "8",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "DEC2HEX",
  "t": 9,
  "m": [1, 2],
  "p": [{
    "example": "100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "8",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "DEC2OCT",
  "t": 9,
  "m": [1, 2],
  "p": [{
    "example": "100",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "8",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "HEX2BIN",
  "t": 9,
  "m": [1, 2],
  "p": [{
    "example": "\"f3\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "8",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "HEX2DEC",
  "t": 9,
  "m": [1, 1],
  "p": [{
    "example": "\"f3\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "HEX2OCT",
  "t": 9,
  "m": [1, 2],
  "p": [{
    "example": "\"f3\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "8",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "OCT2BIN",
  "t": 9,
  "m": [1, 2],
  "p": [{
    "example": "37",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "8",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "OCT2DEC",
  "t": 9,
  "m": [1, 1],
  "p": [{
    "example": "37",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "OCT2HEX",
  "t": 9,
  "m": [1, 2],
  "p": [{
    "example": "37",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "8",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "COMPLEX",
  "t": 9,
  "m": [2, 3],
  "p": [{
    "example": "3",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "4",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "\"j\"",
    "require": "o",
    "repeat": "n",
    "type": "rangestring"
  }]
}, {
  "n": "IMREAL",
  "t": 9,
  "m": [1, 1],
  "p": [{
    "example": "\"4+5i\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "IMAGINARY",
  "t": 9,
  "m": [1, 1],
  "p": [{
    "example": "\"4+5i\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "IMCONJUGATE",
  "t": 9,
  "m": [1, 1],
  "p": [{
    "example": "\"3+4i\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "IMABS",
  "t": 9,
  "m": [1, 1],
  "p": [{
    "example": "\"3+4i\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "DELTA",
  "t": 9,
  "m": [1, 2],
  "p": [{
    "example": "2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "1",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "IMSUM",
  "t": 9,
  "m": [1, 255],
  "p": [{
    "example": "\"3+4i\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"5-3i\"",
    "require": "o",
    "repeat": "y",
    "type": "rangeall"
  }]
}, {
  "n": "IMSUB",
  "t": 9,
  "m": [2, 2],
  "p": [{
    "example": "\"6+5i\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"2+3i\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "IMPRODUCT",
  "t": 9,
  "m": [1, 255],
  "p": [{
    "example": "\"3+4i\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"5-3i\"",
    "require": "o",
    "repeat": "y",
    "type": "rangeall"
  }]
}, {
  "n": "IMDIV",
  "t": 9,
  "m": [2, 2],
  "p": [{
    "example": "\"11+16i\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"3+2i\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "CONVERT",
  "t": 13,
  "m": [3, 3],
  "p": [{
    "example": "5.1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "\"g\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"kg\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}];
export default engineeringDescriptors;