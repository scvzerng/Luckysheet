const conditionalAggDescriptors = [{
  "n": "SUMIF",
  "t": 0,
  "m": [2, 3],
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
  }, {
    "example": "B1:B10",
    "require": "o",
    "repeat": "n",
    "type": "range"
  }]
}, {
  "n": "SUMIFS",
  "t": 0,
  "m": [3, 257],
  "p": [{
    "example": "A1:A10",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }, {
    "example": " B1:B10",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }, {
    "example": " \">20\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": " C1:C10",
    "require": "o",
    "repeat": "y",
    "type": "rangeall"
  }]
}];
export default conditionalAggDescriptors;