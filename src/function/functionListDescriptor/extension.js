const extensionDescriptors = [{
  "n": "GET_TARGET",
  "t": 0,
  "m": [0, 0],
  "p": []
}, {
  "n": "GET_AIRTABLE_DATA",
  "t": 0,
  "m": [1, 3],
  "p": [{
    "example": "https://airtable.com/apppqwer/tblpoi/viwmnb",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "0",
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
  "n": "ASK_AI",
  "t": 0,
  "m": [1, 2],
  "p": [{
    "example": "I need an accountability goal achievement",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "B1:B10",
    "require": "m",
    "repeat": "n",
    "type": "range"
  }]
}, {
  "n": "EVALUATE",
  "t": "3",
  "m": [1, 1],
  "p": [{
    "example": "\"A1+5*2^2\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "REMOTE",
  "t": "5",
  "m": [1, 1],
  "p": [{
    "example": "SUM(A1:A10000000)",
    "require": "m",
    "repeat": "n",
    "type": "string"
  }]
}];
export default extensionDescriptors;