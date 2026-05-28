import { isdatetime, diff } from '../../global/datecontroll.js';
import { isRealNum } from '../../global/validate.js';
import numeral from 'numeral';

function compareValues(x, y, order) {
    if (order == null) {
        order = "asc";
    }
    let x1 = x == null ? "" : x.toString();
    let y1 = y == null ? "" : y.toString();

    let result = 0;
    if (isdatetime(x1) && isdatetime(y1)) {
        result = diff(x1, y1);
    } else if (isRealNum(x1) && isRealNum(y1)) {
        let n1 = numeral(x1).value();
        let n2 = numeral(y1).value();
        result = n1 - n2;
    } else if (!isRealNum(x1) && !isRealNum(y1)) {
        result = x1.localeCompare(y1, "zh");
    } else if (isRealNum(x1)) {
        result = -1;
    } else {
        result = 1;
    }

    if (order === "desc") {
        result = -result;
    }
    return result;
}

export { compareValues };
