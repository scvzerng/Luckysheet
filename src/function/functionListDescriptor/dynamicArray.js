const dynamicArrayDescriptors = [{
  "n": "SORT",
  "t": "14",
  "m": [1, 4],
  "p": [{
    "example": "A2:A17",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "1",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "-1",
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
  "n": "FILTER",
  "t": "14",
  "m": [2, 3],
  "p": [{
    "example": "A5:D20",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }, {
    "example": "1",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }, {
    "example": "\"\"",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "UNIQUE",
  "t": "14",
  "m": [1, 3],
  "p": [{
    "example": "A2:B26",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "TRUE()",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "FALSE()",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "RANDARRAY",
  "t": "14",
  "m": [0, 2],
  "p": [{
    "example": "1",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "1",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "SEQUENCE",
  "t": "14",
  "m": [1, 4],
  "p": [{
    "example": "1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "1",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "1",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "1",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}];
export default dynamicArrayDescriptors;