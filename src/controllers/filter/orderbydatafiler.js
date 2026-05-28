import editor from '../../global/editor';
import {  isEditMode  } from '../../global/validate';
import tooltip from '../../global/tooltip';
import { rowlenByRange } from '../../global/getRowlen';
import locale from '../../locale/locale';
import Store from '../../store';
import {  jfrefreshgrid } from '../../global/refresh';
import {  orderbydata } from '../../global/sort';

function orderbydatafiler(str, stc, edr, edc, index, asc) {
    let d = editor.deepCopyFlowData(Store.flowdata);

    str = str + 1;

    let hasMc = false; //排序选区是否有合并单元格
    let data = [];

    for(let r = str; r <= edr; r++){
        let data_row = [];

        for(let c = stc; c <= edc; c++){
            if(d[r][c] != null && d[r][c].mc != null){
                hasMc = true;
                break;
            }

            data_row.push(d[r][c]);
        }

        data.push(data_row);
    }

    if(hasMc){
        const locale_filter = locale().filter;

        if(isEditMode()){
            alert(locale_filter.mergeError);
        }
        else{
            tooltip.info(locale_filter.mergeError, "");
        }

        return;
    }

    data = orderbydata(data, index - stc, asc);

    for(let r = str; r <= edr; r++){
        for(let c = stc; c <= edc; c++){
            d[r][c] = data[r - str][c - stc];
        }
    }

    let allParam = {};
    if(Store.config["rowlen"] != null){
        let cfg = $.extend(true, {}, Store.config);
        cfg = rowlenByRange(d, str, edr, cfg);

        allParam = {
            "cfg": cfg,
            "RowlChange": true
        }
    }

    jfrefreshgrid(d, [{ "row": [str, edr], "column": [stc, edc] }], allParam);
}

export { orderbydatafiler };
