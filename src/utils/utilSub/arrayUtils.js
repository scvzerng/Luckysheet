

function ArrayUnique(dataArr) {
    let result = [];
    let obj = {};
    if (dataArr.length > 0) {
        for (let i = 0; i < dataArr.length; i++) {
            let item = dataArr[i];
            if (!obj[item]) {
                result.push(item);
                obj[item] = 1;
            }
        }
    }
    return result;
}

function arrayRemoveItem(array, item) {
    array.some((curr, index, arr) => {
        if (curr === item) {
            arr.splice(index, 1);
            return curr === item;
        }
    });
}

export { ArrayUnique, arrayRemoveItem };
