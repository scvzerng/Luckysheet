const dateDescriptors = [{
  "n": "TIME",
  "t": 6,
  "m": [3, 3],
  "p": [{
    "example": "11",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "40",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "59",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "TIMEVALUE",
  "t": 6,
  "m": [1, 1],
  "p": [{
    "example": "\"2:15 PM\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "EOMONTH",
  "t": 6,
  "m": [2, 2],
  "p": [{
    "example": "DATE(1969",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "7",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "EDATE",
  "t": 6,
  "m": [2, 2],
  "p": [{
    "example": "DATE(1969",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "7",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "SECOND",
  "t": 6,
  "m": [1, 1],
  "p": [{
    "example": "TIME(11",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "MINUTE",
  "t": 6,
  "m": [1, 1],
  "p": [{
    "example": "TIME(11",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "HOUR",
  "t": 6,
  "m": [1, 1],
  "p": [{
    "example": "TIME(11",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "NOW",
  "t": 6,
  "m": [0, 0],
  "p": []
}, {
  "n": "NETWORKDAYS",
  "t": 6,
  "m": [2, 3],
  "p": [{
    "example": "DATE(1969",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "7",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "16)",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "NETWORKDAYS_INTL",
  "t": 6,
  "m": [2, 4],
  "p": [{
    "example": "DATE(1969",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "7",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "16)",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "DATE(1969",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "ISOWEEKNUM",
  "t": 6,
  "m": [1, 1],
  "p": [{
    "example": "DATE(1969",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "WEEKNUM",
  "t": 6,
  "m": [1, 2],
  "p": [{
    "example": "DATE(1969",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "7",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "WEEKDAY",
  "t": 6,
  "m": [1, 2],
  "p": [{
    "example": "DATE(1969",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "7",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "DAY",
  "t": 6,
  "m": [1, 1],
  "p": [{
    "example": "DATE(1969",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "DAYS",
  "t": 6,
  "m": [2, 2],
  "p": [{
    "example": "2011-3-15",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "2011-2-1",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "DAYS360",
  "t": 6,
  "m": [2, 3],
  "p": [{
    "example": "DATE(1969",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "7",
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
  "n": "DATE",
  "t": 6,
  "m": [3, 3],
  "p": [{
    "example": "1969",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "7",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "20",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "DATEVALUE",
  "t": 6,
  "m": [1, 1],
  "p": [{
    "example": "\"1969-7-20\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "DATEDIF",
  "t": 6,
  "m": [3, 3],
  "p": [{
    "example": "DATE(1969",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "7",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "16)",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "WORKDAY",
  "t": 6,
  "m": [2, 3],
  "p": [{
    "example": "DATE(1969",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "7",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "16)",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "WORKDAY_INTL",
  "t": 6,
  "m": [2, 4],
  "p": [{
    "example": "DATE(1969",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "7",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "16)",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "DATE(1969",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "YEAR",
  "t": 6,
  "m": [1, 1],
  "p": [{
    "example": "DATE(1969",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "YEARFRAC",
  "t": 6,
  "m": [2, 3],
  "p": [{
    "example": "DATE(1969",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "7",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "16)",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "TODAY",
  "t": 6,
  "m": [0, 0],
  "p": []
}, {
  "n": "MONTH",
  "t": 6,
  "m": [1, 1],
  "p": [{
    "example": "DATE(1969",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "ISDATE",
  "t": "6",
  "m": [1, 1],
  "p": [{
    "example": "\"1990-01-01\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}];
export default dateDescriptors;