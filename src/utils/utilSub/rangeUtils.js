

function transformRangeToAbsolute(txt1) {
    if (txt1 == null || txt1.length == 0) {
        return null;
    }

    let txtArray = txt1.split(",");
    let ret = "";
    for (let i = 0; i < txtArray.length; i++) {
        let txt = txtArray[i];
        let txtSplit = txt.split("!"),
            sheetName = "",
            rangeTxt = "";
        if (txtSplit.length > 1) {
            sheetName = txtSplit[0];
            rangeTxt = txtSplit[1];
        } else {
            rangeTxt = txtSplit[0];
        }

        let rangeTxtArray = rangeTxt.split(":");

        let rangeRet = "";
        for (let a = 0; a < rangeTxtArray.length; a++) {
            let t = rangeTxtArray[a];

            let row = t.replace(/[^0-9]/g, "");
            let col = t.replace(/[^A-Za-z]/g, "");
            let rangeTT = "";
            if (col != "") {
                rangeTT += "$" + col;
            }

            if (row != "") {
                rangeTT += "$" + row;
            }

            rangeRet += rangeTT + ":";
        }

        rangeRet = rangeRet.substr(0, rangeRet.length - 1);

        ret += sheetName + rangeRet + ",";
    }

    return ret.substr(0, ret.length - 1);
}

export { transformRangeToAbsolute };
