import {  getSheetIndex } from "../../methods/get";
import menuButton from "../../controllers/menuButton";
import { jfrefreshgrid } from "../refresh";
// import luckysheet_function from '../function/luckysheet_function';
// import functionlist from '../function/functionlist';
import {
    luckysheet_compareWith,
    luckysheet_getarraydata,
    luckysheet_getcelldata,
    luckysheet_parseData,
    luckysheet_getValue,
    luckysheet_indirect_check,
    luckysheet_indirect_check_return,
    luckysheet_offset_check,
    luckysheet_calcADPMM,
    luckysheet_getSpecialReference,
} from "../../function/func";
import Store from "../../store";

const refreshButton = {
        cellFocus:function(row_index, col_index) {
            const file = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)];
            if(file.calcChain){
                let txt = ''
                file.calcChain?.find(({ r, c, func }) => {
                    if(r === row_index && c === col_index){
                        txt = Store.flowdata[r][c]?.f;
                        return true
                    }
                });
                if(txt.indexOf('=GET_AIRTABLE_DATA') === 0){
                    this.showButton(row_index, col_index)
                    this.addButtonListener(txt,row_index, col_index,)
                }else{
                    this.hideButton()
                }
            }


        },

        addButtonListener:function(txt, r, c){
            let listener =  $("#luckysheet-formula-refresh").data("listener")

            if(!listener){
                console.info('listener')
                $("#luckysheet-formula-refresh").data("listener","true")
                $("#luckysheet-formula-refresh").on('click',(e)=>{
                    this.execFunctionGroupForce(true);
                    jfrefreshgrid()
                    e.stopPropagation();
                })
            }

        },

        showButton: function(r, c) {

            let _this = this;

            let row = Store.visibledatarow[r],
                row_pre = r == 0 ? 0 : Store.visibledatarow[r - 1];
            let col = Store.visibledatacolumn[c],
                col_pre = c == 0 ? 0 : Store.visibledatacolumn[c - 1];

            let margeset = menuButton.mergeborer(Store.flowdata, r, c);
            if(!!margeset){
                row = margeset.row[1];
                row_pre = margeset.row[0];

                col = margeset.column[1];
                col_pre = margeset.column[0];
            }

            $("#luckysheet-formula-refresh").show().css({
                'max-width': col - col_pre,
                'max-height': row - row_pre,
                'left': col - 20,
                'top': row_pre + (row - row_pre - 20) / 2
            })
        },

        hideButton: function() {
            $("#luckysheet-formula-refresh").hide()
        }
};

export default refreshButton;
