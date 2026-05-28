import Store from '../../store/index.js';
import { getcellvalue } from '../../global/getdata.js';

function parseConditionRange(rangeText, _this, conditionformat_Text, options = {}) {
    const { data = Store.flowdata, allowNonNumeric = false } = options;
    let conditionRange = [];
    let conditionValue = [];

    let rangeArr = _this.getRangeByTxt(rangeText);

    if (rangeArr.length > 1) {
        _this.infoDialog(conditionformat_Text.onlySingleCell, "");
        return null;
    } else if (rangeArr.length == 1) {
        let r1 = rangeArr[0].row[0], r2 = rangeArr[0].row[1];
        let c1 = rangeArr[0].column[0], c2 = rangeArr[0].column[1];
        if (r1 == r2 && c1 == c2) {
            let v = getcellvalue(r1, c1, data);
            conditionRange.push({ "row": rangeArr[0].row, "column": rangeArr[0].column });
            conditionValue.push(v);
        } else {
            _this.infoDialog(conditionformat_Text.onlySingleCell, "");
            return null;
        }
    } else if (rangeArr.length == 0) {
        if (rangeText == "" || (!allowNonNumeric && isNaN(rangeText))) {
            _this.infoDialog(conditionformat_Text.conditionValueCanOnly, "");
            return null;
        } else {
            conditionValue.push(rangeText);
        }
    }

    return { conditionRange, conditionValue };
}

export { parseConditionRange };
