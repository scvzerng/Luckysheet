const dataMiningDescriptors = [{
  "n": "DM_TEXT_CUTWORD",
  "t": "4",
  "m": [1, 2],
  "p": [{
    "example": "\"I came to Beijing Tsinghua University\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "0",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "DM_TEXT_TFIDF",
  "t": "4",
  "m": [1, 3],
  "p": [{
    "example": "\"I came to Beijing Tsinghua University\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "20",
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
  "n": "DM_TEXT_TEXTRANK",
  "t": "4",
  "m": [1, 3],
  "p": [{
    "example": "\"I came to Beijing Tsinghua University\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "20",
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
export default dataMiningDescriptors;