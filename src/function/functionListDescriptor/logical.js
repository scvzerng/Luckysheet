const logicalDescriptors = [{
  "n": "NOT",
  "t": 10,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "TRUE",
  "t": 10,
  "m": [0, 0],
  "p": []
}, {
  "n": "FALSE",
  "t": 10,
  "m": [0, 0],
  "p": []
}, {
  "n": "AND",
  "t": 10,
  "m": [1, 255],
  "p": [{
    "example": "A2 = \"foo\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "A3 = \"bar\"",
    "require": "o",
    "repeat": "y",
    "type": "rangeall"
  }]
}, {
  "n": "IFERROR",
  "t": 10,
  "m": [2, 2],
  "p": [{
    "example": "A1",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"Error in cell A1\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "IF",
  "t": 10,
  "m": [2, 3],
  "p": [{
    "example": "A2 = \"foo\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"A2 is foo\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"A2 was false\"",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "OR",
  "t": 10,
  "m": [1, 255],
  "p": [{
    "example": "A2 = \"foo\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": " A3 = \"bar\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "NE",
  "t": 11,
  "m": [2, 2],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "A3",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "EQ",
  "t": 11,
  "m": [2, 2],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "A3",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "GT",
  "t": 11,
  "m": [2, 2],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "A3",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "GTE",
  "t": 11,
  "m": [2, 2],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "A3",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "LT",
  "t": 11,
  "m": [2, 2],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "A3",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "LTE",
  "t": 11,
  "m": [2, 2],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "A3",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "ADD",
  "t": 11,
  "m": [2, 2],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "A3",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "MINUS",
  "t": 11,
  "m": [2, 2],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "A3",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "MULTIPLY",
  "t": 11,
  "m": [2, 2],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "B2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "DIVIDE",
  "t": 11,
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
  "n": "UNARY_PERCENT",
  "t": 11,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}];
export default logicalDescriptors;