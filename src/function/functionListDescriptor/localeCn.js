const localeCnDescriptors = [{
  "n": "AGE_BY_IDCARD",
  "t": "3",
  "m": [1, 2],
  "p": [{
    "example": "A1",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"2017-10-01\"",
    "require": "o",
    "repeat": "n",
    "type": "rangedatetime"
  }]
}, {
  "n": "SEX_BY_IDCARD",
  "t": "3",
  "m": [1, 1],
  "p": [{
    "example": "\"31033519900101XXXX\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "BIRTHDAY_BY_IDCARD",
  "t": "3",
  "m": [1, 2],
  "p": [{
    "example": "\"31033519900101XXXX\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "0",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "PROVINCE_BY_IDCARD",
  "t": "3",
  "m": [1, 1],
  "p": [{
    "example": "\"31033519900101XXXX\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "CITY_BY_IDCARD",
  "t": "3",
  "m": [1, 1],
  "p": [{
    "example": "\"31033519900101XXXX\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "STAR_BY_IDCARD",
  "t": "3",
  "m": [1, 1],
  "p": [{
    "example": "\"31033519900101XXXX\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "ANIMAL_BY_IDCARD",
  "t": "3",
  "m": [1, 1],
  "p": [{
    "example": "\"31033519900101XXXX\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "ISIDCARD",
  "t": "3",
  "m": [1, 1],
  "p": [{
    "example": "\"31033519900101XXXX\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "DATA_CN_STOCK_CLOSE",
  "t": "5",
  "m": [1, 3],
  "p": [{
    "example": "\"000001\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "2015-01-08",
    "require": "o",
    "repeat": "n",
    "type": "rangedate"
  }, {
    "example": "0",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "DATA_CN_STOCK_OPEN",
  "t": "5",
  "m": [1, 3],
  "p": [{
    "example": "\"000001\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "2015-01-08",
    "require": "o",
    "repeat": "n",
    "type": "rangedate"
  }, {
    "example": "0",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "DATA_CN_STOCK_MAX",
  "t": "5",
  "m": [1, 3],
  "p": [{
    "example": "\"000001\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "2015-01-08",
    "require": "o",
    "repeat": "n",
    "type": "rangedate"
  }, {
    "example": "0",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "DATA_CN_STOCK_MIN",
  "t": "5",
  "m": [1, 3],
  "p": [{
    "example": "\"000001\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "2015-01-08",
    "require": "o",
    "repeat": "n",
    "type": "rangedate"
  }, {
    "example": "0",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "DATA_CN_STOCK_VOLUMN",
  "t": "5",
  "m": [1, 3],
  "p": [{
    "example": "\"000001\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "2015-01-08",
    "require": "o",
    "repeat": "n",
    "type": "rangedate"
  }, {
    "example": "0",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "DATA_CN_STOCK_AMOUNT",
  "t": "5",
  "m": [1, 3],
  "p": [{
    "example": "\"000001\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "2015-01-08",
    "require": "o",
    "repeat": "n",
    "type": "rangedate"
  }, {
    "example": "0",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}];
export default localeCnDescriptors;