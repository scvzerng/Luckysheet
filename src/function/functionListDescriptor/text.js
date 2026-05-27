const textDescriptors = [{
  "n": "CONCAT",
  "t": 11,
  "m": [2, 2],
  "p": [{
    "example": "\"de\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"mystify\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "CONCATENATE",
  "t": 12,
  "m": [1, 255],
  "p": [{
    "example": "\"Super\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"calla\"",
    "require": "o",
    "repeat": "y",
    "type": "rangeall"
  }]
}, {
  "n": "CODE",
  "t": 12,
  "m": [1, 1],
  "p": [{
    "example": "\"a\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "CHAR",
  "t": 12,
  "m": [1, 1],
  "p": [{
    "example": "97",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "ARABIC",
  "t": 12,
  "m": [1, 1],
  "p": [{
    "example": "\"XIV\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "ROMAN",
  "t": 12,
  "m": [1, 1],
  "p": [{
    "example": "499",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "REGEXEXTRACT",
  "t": 12,
  "m": [2, 2],
  "p": [{
    "example": "\"Needle in a haystack\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\".e{2}dle\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "REGEXMATCH",
  "t": 12,
  "m": [2, 2],
  "p": [{
    "example": "\"Spreadsheets\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"S.r\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "REGEXREPLACE",
  "t": 12,
  "m": [3, 3],
  "p": [{
    "example": "\"Spreadsheets\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"S.*d\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"Bed\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "T",
  "t": 12,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "FIXED",
  "t": 12,
  "m": [1, 3],
  "p": [{
    "example": "3.141592653",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "2",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "FALSE()",
    "require": "o",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "FIND",
  "t": 12,
  "m": [2, 3],
  "p": [{
    "example": "\"n\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "14",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "FINDB",
  "t": 12,
  "m": [2, 3],
  "p": [{
    "example": "\"new\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"new year\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "2",
    "require": "o",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "JOIN",
  "t": 12,
  "m": [2, 255],
  "p": [{
    "example": "\" and-a \"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "{1",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "2",
    "require": "o",
    "repeat": "y",
    "type": "rangeall"
  }]
}, {
  "n": "LEFT",
  "t": 12,
  "m": [1, 2],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "RIGHT",
  "t": 12,
  "m": [1, 2],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "2",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "MID",
  "t": 12,
  "m": [3, 3],
  "p": [{
    "example": "\"get this\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "5",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "4",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "LEN",
  "t": 12,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "LENB",
  "t": 12,
  "m": [1, 1],
  "p": [{
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "LOWER",
  "t": 12,
  "m": [1, 1],
  "p": [{
    "example": "\"LOREM IPSUM\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "UPPER",
  "t": 12,
  "m": [1, 1],
  "p": [{
    "example": "\"lorem ipsum\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "EXACT",
  "t": 12,
  "m": [2, 2],
  "p": [{
    "example": "A1",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "REPLACE",
  "t": 12,
  "m": [4, 4],
  "p": [{
    "example": "\"Spreadsheets\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "1",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "6",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "\"Bed\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "REPT",
  "t": 12,
  "m": [2, 2],
  "p": [{
    "example": "\"ha\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "4",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "SEARCH",
  "t": 12,
  "m": [2, 3],
  "p": [{
    "example": "\"n\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "A2",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "14",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "SUBSTITUTE",
  "t": 12,
  "m": [3, 4],
  "p": [{
    "example": "\"search for it\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"search for\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "\"Google\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }, {
    "example": "3",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }]
}, {
  "n": "CLEAN",
  "t": 12,
  "m": [1, 1],
  "p": [{
    "example": "\"AF\"&CHAR(31)",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "TEXT",
  "t": 12,
  "m": [2, 2],
  "p": [{
    "example": "1.23",
    "require": "m",
    "repeat": "n",
    "type": "rangenumber"
  }, {
    "example": "\"$0.00\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "TRIM",
  "t": 12,
  "m": [1, 1],
  "p": [{
    "example": "\" lorem ipsum\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "VALUE",
  "t": 12,
  "m": [1, 1],
  "p": [{
    "example": "\"123\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}, {
  "n": "PROPER",
  "t": 12,
  "m": [1, 1],
  "p": [{
    "example": "\"united states\"",
    "require": "m",
    "repeat": "n",
    "type": "rangeall"
  }]
}];
export default textDescriptors;