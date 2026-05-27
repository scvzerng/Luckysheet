const informationDescriptors = [{
  "n": "ISFORMULA",
  "t": 15,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }]
}, {
  "n": "CELL",
  "t": 15,
  "m": [2, 2],
  "p": [{
    "example": "\"type\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "C2",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }]
}, {
  "n": "NA",
  "t": 15,
  "m": [0, 0],
  "p": []
}, {
  "n": "ERROR_TYPE",
  "t": 15,
  "m": [1, 1],
  "p": [{
    "example": "A3",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "ISBLANK",
  "t": 15,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }]
}, {
  "n": "ISERR",
  "t": 15,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "ISERROR",
  "t": 15,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "ISLOGICAL",
  "t": 15,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "ISNA",
  "t": 15,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "ISNONTEXT",
  "t": 15,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "ISNUMBER",
  "t": 15,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "ISREF",
  "t": 15,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }]
}, {
  "n": "ISTEXT",
  "t": 15,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "TYPE",
  "t": 15,
  "m": [1, 1],
  "p": [{
    "example": "C4",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "N",
  "t": 15,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "TO_DATE",
  "t": 16,
  "m": [1, 1],
  "p": [{
    "example": "25405",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "TO_PURE_NUMBER",
  "t": 16,
  "m": [1, 1],
  "p": [{
    "example": "50%",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "TO_TEXT",
  "t": 16,
  "m": [1, 1],
  "p": [{
    "example": "24",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "TO_DOLLARS",
  "t": 16,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "TO_PERCENT",
  "t": 16,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}];
export default informationDescriptors;