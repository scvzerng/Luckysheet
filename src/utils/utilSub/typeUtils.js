

function common_extend(jsonbject1, jsonbject2) {
    let resultJsonObject = {};

    for (let attr in jsonbject1) {
        resultJsonObject[attr] = jsonbject1[attr];
    }

    for (let attr in jsonbject2) {
        // undefined is equivalent to no setting
        if (jsonbject2[attr] == undefined) {
            continue;
        }
        resultJsonObject[attr] = jsonbject2[attr];
    }

    return resultJsonObject;
}

function getObjType(obj) {
    let toString = Object.prototype.toString;

    let map = {
        "[object Boolean]": "boolean",
        "[object Number]": "number",
        "[object String]": "string",
        "[object Function]": "function",
        "[object Array]": "array",
        "[object Date]": "date",
        "[object RegExp]": "regExp",
        "[object Undefined]": "undefined",
        "[object Null]": "null",
        "[object Object]": "object",
    };

    // if(obj instanceof Element){
    //     return 'element';
    // }

    return map[toString.call(obj)];
}

export { common_extend, getObjType };
