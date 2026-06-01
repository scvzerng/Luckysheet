import conditionformat from "../../controllers/conditionformat";
import { parseConditionRange } from "../../controllers/conditionformat/rangeParser.js";
import sheetmanage from "../../controllers/sheetmanage";
import locale from "../../locale/locale";
import Store from "../../store";
import { getObjType } from "../../utils/util";
import { getCurrentSheetOrder } from '../../utils/storeAccess.js';
import { diff, isdatetime } from "../datecontroll";
import tooltip from "../tooltip";
import { isRealNum } from "../validate";
import dayjs from "dayjs";

export function setRangeConditionalFormatDefault(conditionName, conditionValue, options = {}) {
    let conditionNameValues = [
        'greaterThan',
        'lessThan',
        'betweenness',
        'equal',
        'textContains',
        'occurrenceDate',
        'duplicateValue',
        'top10',
        'top10%',
        'last10',
        'last10%',
        'AboveAverage',
        'SubAverage',
        'regExp',
        'sort',
    ];

    if(!conditionName || !conditionNameValues.includes(conditionName)){
        return tooltip.info('The conditionName parameter is invalid.', '');
    }

    if(getObjType(conditionValue) != 'array' || conditionValue.length == 0){
        return tooltip.info('The conditionValue parameter is invalid.', '');
    }

    let {
        format = {
            "textColor": "#000000",
            "cellColor": "#ff0000"
        },
        cellrange = Store.selections,
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    cellrange = JSON.parse(JSON.stringify(cellrange));

    let file = Store.luckysheetfile[order];
    let data = file.data;

    if(data == null || data.length == 0){
        data = sheetmanage.buildGridData(file);
    }

    if(file == null){
        return tooltip.info('Incorrect worksheet index', '');
    }

    const conditionformat_Text = locale().conditionformat;

    let conditionRange = [], conditionValue2 = [];

    if(conditionName == 'betweenness'){
        let v1 = conditionValue[0];
        let v2 = conditionValue[1];

        let result1 = parseConditionRange(v1, conditionformat, conditionformat_Text, { data });
        if (result1 == null) {
            return;
        }
        if (result1.conditionRange.length > 0) {
            conditionRange[0] = result1.conditionRange[0];
        }
        conditionValue2.push(...result1.conditionValue);

        let result2 = parseConditionRange(v2, conditionformat, conditionformat_Text, { data });
        if (result2 == null) {
            return;
        }
        if (result2.conditionRange.length > 0) {
            conditionRange[1] = result2.conditionRange[0];
        }
        conditionValue2.push(...result2.conditionValue);
    }
    else if(conditionName == 'greaterThan' || conditionName == 'lessThan' || conditionName == 'equal'){
        let v = conditionValue[0];

        let result = parseConditionRange(v, conditionformat, conditionformat_Text, { data });
        if (result == null) {
            return;
        }
        conditionRange.push(...result.conditionRange);
        conditionValue2.push(...result.conditionValue);
    }
    else if(conditionName == 'textContains'){
        let v = conditionValue[0];

        let result = parseConditionRange(v, conditionformat, conditionformat_Text, { data, allowNonNumeric: true });
        if (result == null) {
            return;
        }
        conditionRange.push(...result.conditionRange);
        conditionValue2.push(...result.conditionValue);
    }
    else if(conditionName == 'occurrenceDate'){
        let v1 = conditionValue[0];
        let v2 = conditionValue[1];

        if(!isdatetime(v1) || !isdatetime(v2)){
            return tooltip.info('The conditionValue parameter is invalid.', '');
        }

        let v;
        if(diff(v1, v2) > 0){
            v = dayjs(v2).format("YYYY/MM/DD") + "-" + dayjs(v1).format("YYYY/MM/DD");
        }
        else{
            v = dayjs(v1).format("YYYY/MM/DD") + "-" + dayjs(v2).format("YYYY/MM/DD");
        }

        conditionValue2.push(v);
    }
    else if(conditionName == 'duplicateValue'){
        let v = conditionValue[0];

        if(v != '0' || v != '1'){
            return tooltip.info('The conditionValue parameter is invalid.', '');
        }

        conditionValue2.push(v);
    }
    else if(conditionName == 'top10' || conditionName == 'top10%' || conditionName == 'last10' || conditionName == 'last10%'){
        let v = conditionValue[0];

        if(parseInt(v) != v || parseInt(v) < 1 || parseInt(v) > 1000){
            conditionformat.infoDialog(conditionformat_Text.pleaseEnterInteger, "");
            return;
        }

        conditionValue2.push(parseInt(v));
    }
    else if(conditionName == 'AboveAverage' || conditionName == 'SubAverage'){
        conditionValue2.push(conditionName);
    }
    else if(conditionName == 'regExp') {
        conditionValue2.push(...conditionValue);
    }
    else if(conditionName == 'sort') {
        conditionValue2.push(...conditionValue);
    }

    if(!format.hasOwnProperty("textColor") || !format.hasOwnProperty("cellColor")){
        return tooltip.info('The format parameter is invalid.', '');
    }

    if(getObjType(cellrange) == 'string'){
        cellrange = conditionformat.getRangeByTxt(cellrange);
    }
    else if(getObjType(cellrange) == 'object'){
        cellrange = [cellrange];
    }

    if(getObjType(cellrange) != 'array'){
        return tooltip.info('The cellrange parameter is invalid.', '');
    }

    let rule = {
        "type": "default",
        "cellrange": cellrange,
        "format": format,
        "conditionName": conditionName,
        "conditionRange": conditionRange,
        "conditionValue": conditionValue2
    };

    //保存之前的规则
    let fileH = structuredClone(Store.luckysheetfile);
    let historyRules = conditionformat.getHistoryRules(fileH);

    //保存当前的规则
    let ruleArr = file["luckysheet_conditionformat_save"] || [];
    ruleArr.push(rule);
    file["luckysheet_conditionformat_save"] = ruleArr;

    let fileC = structuredClone(Store.luckysheetfile);
    let currentRules = conditionformat.getCurrentRules(fileC);

    //刷新一次表格
    conditionformat.ref(historyRules, currentRules);

    if (success && typeof success === 'function') {
        success();
    }
}

export function setRangeConditionalFormat(type, options = {}) {
    let typeValues = [
        'dataBar',
        'colorGradation',
        'icons'
    ];

    if(!type || !typeValues.includes(type)){
        return tooltip.info('The type parameter is invalid.', '');
    }

    let {
        format,
        cellrange = Store.selections,
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    cellrange = JSON.parse(JSON.stringify(cellrange));
    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info('Incorrect worksheet index', '');
    }

    if(type == 'dataBar'){
        if(format == null){
            format = ["#638ec6", "#ffffff"];
        }

        if(getObjType(format) != 'array' || format.length < 1 || format.length > 2){
            return tooltip.info('The format parameter is invalid.', '');
        }
    }
    else if(type == 'colorGradation'){
        if(format == null){
            format = ["rgb(99, 190, 123)", "rgb(255, 235, 132)", "rgb(248, 105, 107)"];
        }

        if(getObjType(format) != 'array' || format.length < 2 || format.length > 3){
            return tooltip.info('The format parameter is invalid.', '');
        }
    }
    else if(type == 'icons'){
        if(format == null){
            format = "threeWayArrowMultiColor";
        }

        let formatValues = [
            'threeWayArrowMultiColor',
            'threeTriangles',
            'fourWayArrowMultiColor',
            'fiveWayArrowMultiColor',
            'threeWayArrowGrayColor',
            'fourWayArrowGrayColor',
            'fiveWayArrowGrayColor',
            'threeColorTrafficLightRimless',
            'threeSigns',
            'greenRedBlackGradient',
            'threeColorTrafficLightBordered',
            'fourColorTrafficLight',
            'threeSymbolsCircled',
            'tricolorFlag',
            'threeSymbolsnoCircle',
            'threeStars',
            'fiveQuadrantDiagram',
            'fiveBoxes',
            'grade4',
            'grade5'
        ];

        if(getObjType(format) != 'string' || !formatValues.includes(format)){
            return tooltip.info('The format parameter is invalid.', '');
        }

        switch (format) {
            case 'threeWayArrowMultiColor':
                format = {
                    "len": 3,
                    "leftMin": 0,
                    "top": 0
                };
                break;
            case 'threeTriangles':
                format = {
                    "len": 3,
                    "leftMin": 0,
                    "top": 1
                };
                break;
            case 'fourWayArrowMultiColor':
                format = {
                    "len": 4,
                    "leftMin": 0,
                    "top": 2
                };
                break;
            case 'fiveWayArrowMultiColor':
                format = {
                    "len": 5,
                    "leftMin": 0,
                    "top": 3
                };
                break;
            case 'threeWayArrowGrayColor':
                format = {
                    "len": 3,
                    "leftMin": 5,
                    "top": 0
                };
                break;
            case 'fourWayArrowGrayColor':
                format = {
                    "len": 4,
                    "leftMin": 5,
                    "top": 1
                };
                break;
            case 'fiveWayArrowGrayColor':
                format = {
                    "len": 5,
                    "leftMin": 5,
                    "top": 2
                };
                break;
            case 'threeColorTrafficLightRimless':
                format = {
                    "len": 3,
                    "leftMin": 0,
                    "top": 4
                };
                break;
            case 'threeSigns':
                format = {
                    "len": 3,
                    "leftMin": 0,
                    "top": 5
                };
                break;
            case 'greenRedBlackGradient':
                format = {
                    "len": 4,
                    "leftMin": 0,
                    "top": 6
                };
                break;
            case 'threeColorTrafficLightBordered':
                format = {
                    "len": 3,
                    "leftMin": 5,
                    "top": 4
                };
                break;
            case 'fourColorTrafficLight':
                format = {
                    "len": 4,
                    "leftMin": 5,
                    "top": 5
                };
                break;
            case 'threeSymbolsCircled':
                format = {
                    "len": 3,
                    "leftMin": 0,
                    "top": 7
                };
                break;
            case 'tricolorFlag':
                format = {
                    "len": 3,
                    "leftMin": 0,
                    "top": 8
                };
                break;
            case 'threeSymbolsnoCircle':
                format = {
                    "len": 3,
                    "leftMin": 5,
                    "top": 7
                };
                break;
            case 'threeStars':
                format = {
                    "len": 3,
                    "leftMin": 0,
                    "top": 9
                };
                break;
            case 'fiveQuadrantDiagram':
                format = {
                    "len": 5,
                    "leftMin": 0,
                    "top": 10
                };
                break;
            case 'fiveBoxes':
                format = {
                    "len": 5,
                    "leftMin": 0,
                    "top": 11
                };
                break;
            case 'grade4':
                format = {
                    "len": 4,
                    "leftMin": 5,
                    "top": 9
                };
                break;
            case 'grade5':
                format = {
                    "len": 5,
                    "leftMin": 5,
                    "top": 10
                };
                break;
        }
    }

    if(getObjType(cellrange) == 'string'){
        cellrange = conditionformat.getRangeByTxt(cellrange);
    }
    else if(getObjType(cellrange) == 'object'){
        cellrange = [cellrange];
    }

    if(getObjType(cellrange) != 'array'){
        return tooltip.info('The cellrange parameter is invalid.', '');
    }

    let rule = {
        "type": type,
        "cellrange": cellrange,
        "format": format
    };

    //保存之前的规则
    let fileH = structuredClone(Store.luckysheetfile);
    let historyRules = conditionformat.getHistoryRules(fileH);

    //保存当前的规则
    let ruleArr = file["luckysheet_conditionformat_save"] || [];
    ruleArr.push(rule);
    file["luckysheet_conditionformat_save"] = ruleArr;

    let fileC = structuredClone(Store.luckysheetfile);
    let currentRules = conditionformat.getCurrentRules(fileC);

    //刷新一次表格
    conditionformat.ref(historyRules, currentRules);

    if (success && typeof success === 'function') {
        success();
    }
}

export function deleteRangeConditionalFormat(itemIndex, options = {}) {
    if(!isRealNum(itemIndex)){
        return tooltip.info('The itemIndex parameter is invalid.', '');
    }

    itemIndex = Number(itemIndex);

    let {
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info('The order parameter is invalid.', '');
    }

    let cdformat = structuredClone(file.luckysheet_conditionformat_save);

    if(cdformat.length == 0){
        return tooltip.info('This worksheet has no conditional format to delete', '');
    }
    else if(cdformat[itemIndex] == null){
        return tooltip.info('The conditional format of the index cannot be found', '');
    }

    let cdformatItem = cdformat.splice(itemIndex, 1);

    //保存之前的规则
    let fileH = structuredClone(Store.luckysheetfile);
    let historyRules = conditionformat.getHistoryRules(fileH);

    //保存当前的规则
    file["luckysheet_conditionformat_save"] = cdformat;

    let fileC = structuredClone(Store.luckysheetfile);
    let currentRules = conditionformat.getCurrentRules(fileC);

    //刷新一次表格
    conditionformat.ref(historyRules, currentRules);

    setTimeout(() => {
        if (success && typeof success === 'function') {
            success();
        }
    }, 1);

    return cdformatItem;
}
