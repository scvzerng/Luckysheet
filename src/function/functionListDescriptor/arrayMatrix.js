const arrayMatrixDescriptors = [{
  "n": "SUMX2MY2",
  "t": 14,
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
  "n": "SUMX2PY2",
  "t": 14,
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
  "n": "SUMXMY2",
  "t": 14,
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
  "n": "TRANSPOSE",
  "t": 14,
  "m": [1, 1],
  "p": [{
    "example": "{1,2}",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }]
}, {
  "n": "TREND",
  "t": 14,
  "m": [1, 4],
  "p": [{
    "example": "B2:B10",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "A2:A10",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "A11:A13",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "TRUE()",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "FREQUENCY",
  "t": 14,
  "m": [2, 2],
  "p": [{
    "example": "A2:A40",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "B2:B5",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "GROWTH",
  "t": 14,
  "m": [1, 4],
  "p": [{
    "example": "B2:B10",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "A2:A10",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "A11:A13",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "TRUE()",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "LINEST",
  "t": 14,
  "m": [1, 4],
  "p": [{
    "example": "B2:B10",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "A2:A10",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "TRUE()",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "TRUE()",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "LOGEST",
  "t": 14,
  "m": [1, 4],
  "p": [{
    "example": "B2:B10",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "A2:A10",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "TRUE()",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "TRUE()",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "MDETERM",
  "t": 14,
  "m": [1, 1],
  "p": [{
    "example": "A1:D4",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "MINVERSE",
  "t": 14,
  "m": [1, 1],
  "p": [{
    "example": "A1:D4",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "MMULT",
  "t": 14,
  "m": [2, 2],
  "p": [{
    "example": "A1:B3",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "C1:F2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "SUMPRODUCT",
  "t": 14,
  "m": [1, 255],
  "p": [{
    "example": "A2:C5",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "D2:F5",
    "require": "o",
    "repeat": "y",
    "type": "rangenumber"
  }]
}];
export default arrayMatrixDescriptors;