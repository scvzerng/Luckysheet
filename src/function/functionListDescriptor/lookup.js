const lookupDescriptors = [{
  "n": "VLOOKUP",
  "t": 2,
  "m": [3, 4],
  "p": [{
    "example": "10003",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "A2:B26",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "FALSE()",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "HLOOKUP",
  "t": 2,
  "m": [3, 4],
  "p": [{
    "example": "10003",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "A2:Z6",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "FALSE()",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "LOOKUP",
  "t": 2,
  "m": [2, 3],
  "p": [{
    "example": "10003",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "A1:A100",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "B1:B100",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "ADDRESS",
  "t": 2,
  "m": [2, 5],
  "p": [{
    "example": "1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "4",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "FALSE()",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"Sheet2\"",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "INDIRECT",
  "t": 2,
  "m": [1, 2],
  "p": [{
    "example": "\"Sheet2!\"&B10",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "FALSE()",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "ROW",
  "t": 2,
  "m": [0, 1],
  "p": [{
    "example": "A9",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "ROWS",
  "t": 2,
  "m": [1, 1],
  "p": [{
    "example": "A9:A62",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "COLUMN",
  "t": 2,
  "m": [0, 1],
  "p": [{
    "example": "A9",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "COLUMNS",
  "t": 2,
  "m": [1, 1],
  "p": [{
    "example": "A9:W62",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "OFFSET",
  "t": 2,
  "m": [3, 5],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }, {
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
    "example": "2",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "2",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "MATCH",
  "t": 2,
  "m": [2, 3],
  "p": [{
    "example": "\"Sunday\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "A2:A9",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }, {
    "example": "0",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "INDEX",
  "t": 2,
  "m": [2, 3],
  "p": [{
    "example": "A1:C20",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }, {
    "example": "5",
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
  "n": "GETPIVOTDATA",
  "t": 2,
  "m": [2, 254],
  "p": [{
    "example": "\"SUM of number of units\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "'Pivot table'!A1",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"division\"",
    "require": "o",
    "repeat": "y",
    "type": "rangeall"
  }, {
    "example": "\"east\"",
    "require": "o",
    "repeat": "y",
    "type": "rangeall"
  }]
}, {
  "n": "CHOOSE",
  "t": 2,
  "m": [2, 255],
  "p": [{
    "example": "2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "\"A\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"B\"",
    "require": "o",
    "repeat": "y",
    "type": "rangeall"
  }]
}, {
  "n": "HYPERLINK",
  "t": 2,
  "p": [{
    "example": "\"http://www.luckysheet.com/\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"luckysheet\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}];
export default lookupDescriptors;