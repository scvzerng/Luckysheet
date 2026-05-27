import {luckysheetfontformat} from '../../utils/util';
import menuButton from '../../controllers/menuButton';
import {checkstatusByCell} from '../../global/getdata';
import {colLocationByIndex,colSpanLocationByIndex} from '../../global/location';
import {checkWordByteLength, hasChinaword, isRealNull} from '../../global/validate';
import {isInlineStringCell} from '../../controllers/inlineString';
import Store from '../../store';
import { getMeasureText } from './getMeasureText';

function getCellTextSplitArr(strValue, strArr, cellWidth, canvas){
    for(let strI = 1; strI <= strValue.length; strI++){
        let strV = strValue.substring(0, strI);
        let strtextMetrics = getMeasureText(strV, canvas).width;

        if(strtextMetrics > cellWidth){
            if(strI - 1 <= 0){
                return strArr;
            }
            else{
                strArr.push(strValue.substring(0, strI - 1));
                return getCellTextSplitArr(strValue.substring(strI - 1), strArr, cellWidth, canvas);
            }
        }
        else if(strI == strValue.length){
            strArr.push(strV);
        }
    }

    return strArr;
}

export { getCellTextSplitArr };
