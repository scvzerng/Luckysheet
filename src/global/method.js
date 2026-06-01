import { onNS, offNS, deepMerge } from '../utils/migrationHelpers.js';
import {  luckysheetlodingHTML } from '../controllers/constant';
import sheetmanage from '../controllers/sheetmanage';
import luckysheetformula from './formula';
import imageCtrl from '../controllers/imageCtrl';
import luckysheetFreezen from '../controllers/freezen';
import { getSheetIndex } from '../methods/get';
import { getFileBySheetIndex } from '../utils/storeAccess.js';
import { luckysheetextendData } from './extend';
import luckysheetConfigsetting from '../controllers/luckysheetConfigsetting';
import editor from './editor';
import luckysheetcreatesheet from './createsheet';
import inputBox from '../ui/inputBox.js';
import gridWindow from '../ui/gridWindow.js';
import Store from '../store';
import formulaDialogs from '../ui/formulaDialogs.js';
import countShow from '../ui/countShow.js';
import formulaRangeSelect from '../ui/formulaRangeSelect.js';
import resizeHandles from '../ui/resizeHandles.js';
import cellSelectedFocus from '../ui/cellSelectedFocus.js';
import selectionCopy from '../ui/selectionCopy.js';

const defaultConfig = {
    defaultStore:{
        container: null, 
        luckysheetfile: null, 
        defaultcolumnNum: 60, 
        defaultrowNum: 84, 
        fullscreenmode: true,
        devicePixelRatio: 1,
    
        currentSheetIndex: 0,
        calculateSheetIndex: 0,
        flowdata: [],
        config: {},
    
        visibledatarow: [],
        visibledatacolumn: [],
        ch_width: 0,
        rh_height: 0,
    
        cellmainWidth: 0,
        cellmainHeight: 0,
        toolbarHeight: 0,
        infobarHeight: 0,
        calculatebarHeight: 0,
        rowHeaderWidth: 46,
        columnHeaderHeight: 20,
        cellMainSrollBarSize: 12,
        sheetBarHeight: 31,
        statisticBarHeight: 23,
        luckysheetTableContentHW: [0, 0], 
    
        defaultcollen: 73,
        defaultrowlen: 19,
    
        jfcountfuncTimeout: null, 
        jfautoscrollTimeout: null,
    
        luckysheet_select_status: false,
        luckysheet_select_save: [{ "row": [0, 0], "column": [0, 0] }],
        luckysheet_selection_range: [],
    
        luckysheet_copy_save: {}, //复制粘贴
        luckysheet_paste_iscut: false,
    
        filterchage: true, //筛选
        luckysheet_filter_save: { "row": [], "column": [] },
    
        luckysheet_sheet_move_status: false,
        luckysheet_sheet_move_data: [],
        luckysheet_scroll_status: false,
    
        luckysheetisrefreshdetail: true,
        luckysheetisrefreshtheme: true,
    
        luckysheet_rows_selected_status: false,  //行列标题相关参
        luckysheet_cols_selected_status: false,  
        luckysheet_rows_change_size: false,
        luckysheet_rows_change_size_start: [],
        luckysheet_cols_change_size: false,
        luckysheet_cols_change_size_start: [],
        luckysheet_cols_dbclick_timeout: null,
        luckysheet_cols_dbclick_times: 0,
    
        luckysheetCellUpdate: [],
        
        luckysheet_shiftpositon: null,
    
        iscopyself: true,
    
        orderbyindex: 0, //排序下标
    
        luckysheet_model_move_state: false, //模态框拖动
        luckysheet_model_xy: [0, 0],
        luckysheet_model_move_obj: null,
    
        luckysheet_cell_selected_move: false,  //选区拖动替换
        luckysheet_cell_selected_move_index: [],
    
        luckysheet_cell_selected_extend: false,  //选区下拉
        luckysheet_cell_selected_extend_index: [],
        luckysheet_cell_selected_extend_time: null,
    
        clearjfundo: true,
        jfredo: [],
        jfundo: [],
        lang: 'en', //language
        zIndex: 15,
        functionList:null, //function list explanation
        luckysheet_function:null,

        scrollRefreshSwitch:true,
    
        measureTextCache:{},
        measureTextCellInfoCache:{},
        measureTextCacheTimeOut:null,
        cellOverflowMapCache:{},
    
        zoomRatio:1,
    
        visibledatacolumn_unique:null,
        visibledatarow_unique:null,
    
        showGridLines:true,
    
        toobarObject: {}, //toolbar constant
        inlineStringEditCache:null,
        inlineStringEditRange:null,
    
        fontList:[],

        currentSheetView:"viewNormal",
    
    },    
    defaultFormula:{
        searchFunctionCell: null,
        functionlistPosition: {},
        rangechangeindex: null,
        rangestart: false,
        rangetosheet: null,
        rangeSetValueTo: null,
        func_selectedrange: {}, //函数选区范围
        rangedrag_column_start: false,
        rangedrag_row_start: false,
        rangeResizeObj: null,
        rangeResize: null,
        rangeResizeIndex: null,
        rangeResizexy: null,
        rangeResizeWinH: null,
        rangeResizeWinW: null,
        rangeResizeTo: null,
        rangeMovexy: null,
        rangeMove: false,
        rangeMoveObj: null,
        rangeMoveIndex: null,
        rangeMoveRangedata: null,
        functionHTMLIndex: 0,
        functionRangeIndex: null,
        execvertex: {},
        execFunctionGroupData: null,
        execFunctionExist: null,
        formulaContainSheetList:{},
        cellTextToIndexList:{},
        isFunctionRangeSave: false,
        formulaContainCellList:{},
        execFunctionGlobalData:{},
        groupValuesRefreshData: [],
        functionResizeData: {},
        functionResizeStatus: false,
        functionResizeTimeout: null,
        data_parm_index: 0  //选择公式后参数索引标记
    },
    defaultSheet:{
        sheetMaxIndex: 0,
        nulldata: null,
        mergeCalculationSheet:{},
        checkLoadSheetIndexToDataIndex:{},
        CacheNotLoadControll:[],
    },
    defaultImage:{
        imgItem: {
            type: '3',  //1移动并调整单元格大小 2移动并且不调整单元格的大小 3不要移动单元格并调整其大小
            src: '',  //图片url
            originWidth: null,  //图片原始宽度
            originHeight: null,  //图片原始高度
            default: {
                width: null,  //图片 宽度
                height: null,  //图片 高度
                left: null,  //图片离表格左边的 位置
                top: null,  //图片离表格顶部的 位置
            },
            crop: {
                width: null,  //图片裁剪后 宽度
                height: null,  //图片裁剪后 高度
                offsetLeft: 0,  //图片裁剪后离未裁剪时 左边的位移
                offsetTop: 0,  //图片裁剪后离未裁剪时 顶部的位移
            },
            isFixedPos: false,  //固定位置
            fixedLeft: null,  //固定位置 左位移
            fixedTop: null,  //固定位置 右位移
            border: {
                width: 0,  //边框宽度
                radius: 0,  //边框半径
                style: 'solid',  //边框类型
                color: '#000',  //边框颜色
            }
        },
        images: null,
        currentImgId: null,
        currentWinW: null,
        currentWinH: null,
        resize: null,  
        resizeXY: null,
        move: false,
        moveXY: null,
        cropChange: null,  
        cropChangeXY: null,
        cropChangeObj: null,
        copyImgItemObj: null,
    }
}

const method = {
    //翻页
    addDataAjax: function(param, index, url, func){
        let _this = this;

        if(index == null){
            index = Store.currentSheetIndex;
        }

        if(url == null){
            url = luckysheetConfigsetting.loadSheetUrl;
        }

        const _loadingObj1 = luckysheetlodingHTML(gridWindow.el);
        param.currentPage++;
        
        let dataType = 'application/json;charset=UTF-8';
        let token = sessionStorage.getItem('x-auth-token');

        fetch(url, {
            method: 'POST',
            headers: { "Content-Type": "application/json;charset=UTF-8", "x-auth-token": token },
            body: JSON.stringify(param)
        }).then(function(response) { return response.textContent; }).then(function(d) {
            if(typeof d == "string"){
                try { d = JSON.parse(d); } catch(e) {}
            }

            let dataset = d.data;
            
            let newData = dataset.celldata;
            luckysheetextendData(dataset["row"], newData);

            setTimeout(function(){
                Store.loadingObj.close()
            }, 500);

            if(func && typeof(func)=="function"){ 
                func(dataset);
            }
        })
    },
    //重载
    reload: function(param, index, url, func){
        let _this = this;

        if(index == null){
            index = Store.currentSheetIndex;
        }

        if(url == null){
            url = luckysheetConfigsetting.loadSheetUrl;
        }

        const _loadingObj2 = luckysheetlodingHTML(gridWindow.el);

        let arg = {"gridKey" : luckysheetConfigsetting.gridKey, "index": index};
        param = deepMerge(param, arg);
        let file = getFileBySheetIndex(index);

        fetch(url, {
            method: 'POST',
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(param).toString()
        }).then(function(response) { return response.textContent; }).then(function(d) {
            let dataset = new Function("return " + d)();
            file.celldata = dataset[index.toString()];
            let data = sheetmanage.buildGridData(file);

            setTimeout(function(){
                Store.loadingObj.close()
            }, 500);

            file["data"] = data;
            Store.sheetData = data;
            editor.webWorkerFlowDataCache(data);//worker存数据

            luckysheetcreatesheet(data[0].length, data.length, data, null, false);
            file["load"] = "1";

            Store.luckysheet_select_save.length = 0;
            Store.luckysheet_selection_range = [];


            sheetmanage.changeSheet(index);

            if(func && typeof(func)=="function"){ 
                func();
            }
        });
    },
    clearSheetByIndex: function(i){
        let index = getSheetIndex(i);
        let sheetfile = Store.luckysheetfile[index];

        sheetfile.data = [];
        sheetfile.row = Store.defaultrowNum;
        sheetfile.column = Store.defaultcolumnNum;

            sheetfile.config = null;
            sheetfile.filter = null;
            sheetfile.filter_select = null;
            sheetfile.celldata = [];
            sheetfile.calcChain = [];
            sheetfile.status = 0;
            sheetfile.load = 0;

            Store.sheetData = [];
            editor.webWorkerFlowDataCache(Store.sheetData);//worker存数据

            document.querySelector("#"+ Store.container +" .luckysheet-datavisual-selection-set")?.remove();

            countShow.row.hide();
            countShow.column.hide();
            formulaRangeSelect.hide();
            resizeHandles.changeSizeLine.hide();
            cellSelectedFocus.hide();
            selectionCopy.hide();
            [document.getElementById("luckysheet-cell-selected-extend"), document.getElementById("luckysheet-cell-selected-move"), document.getElementById("luckysheet-cell-selected")].forEach(el => { if (el) el.style.display = 'none'; });

            delete sheetfile.load;
    },
    clear: function(index){
        let _this = this;

        if(index == "all"){
            for(let i = 0; i < Store.luckysheetfile.length; i++){
                let sheetfile = Store.luckysheetfile[i];
                _this.clearSheetByIndex(sheetfile.index);
            }
            
        }
        else{
            if(index == null){
                index = Store.currentSheetIndex;
            }
            _this.clearSheetByIndex(index);
        }

        sheetmanage.changeSheet(Store.luckysheetfile[0].index);
    },
    destroy:function(){
        const _el = document.getElementById(Store.container); if (_el) _el.innerHTML = '';
        document.querySelector("body > .luckysheet-cols-menu")?.remove();

        document.querySelector("#luckysheet-modal-dialog-mask, #luckysheetTextSizeTest, #luckysheet-icon-morebtn-div")?.remove();
        inputBox.removeParent();
        formulaDialogs.formulaHelp.remove();
        document.querySelector(".luckysheet-modal-dialog-slider")?.remove();

        //document event release
        offNS("luckysheetEvent");
        
        //参数重置
        luckysheetFreezen.initialHorizontal = true;
        luckysheetFreezen.initialVertical = true;

        let defaultStore = structuredClone(defaultConfig.defaultStore);
        for(let key in defaultStore){
            if(key in Store){
                Store[key] = defaultStore[key];
            }
        }

        let defaultFormula = structuredClone(defaultConfig.defaultFormula);
        for(let key in defaultFormula){
            if(key in luckysheetformula){
                luckysheetformula[key] = defaultFormula[key];
            }
        }

        let defaultSheet = structuredClone(defaultConfig.defaultSheet);
        for(let key in defaultSheet){
            if(key in sheetmanage){
                sheetmanage[key] = defaultSheet[key];
            }
        }

        let defaultImage = structuredClone(defaultConfig.defaultImage);
        for(let key in defaultImage){
            if(key in imageCtrl){
                imageCtrl[key] = defaultImage[key];
            }
        }

        // remove proxy
        Store.asyncLoad = ['core'];
    },
    /**
     * 获取单元格的值
     * @param {name} 函数名称
     * @param {arguments} 函数参数
     */
    createHookFunction:function(){
        let hookName = arguments[0];
        if(luckysheetConfigsetting.hook && luckysheetConfigsetting.hook[hookName]!=null && (typeof luckysheetConfigsetting.hook[hookName] == "function")){
            var args = Array.prototype.slice.apply(arguments);
            args.shift();
            let ret = luckysheetConfigsetting.hook[hookName].apply(this, args);
            if(ret===false){
                return false;
            }
            else{
                return true;
            }
        }

        return true;
    }

}

export default method;
