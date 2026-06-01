import locale from "../../locale/locale";
import luckysheetConfigsetting from "../luckysheetConfigsetting";
import { getObjType } from "../../utils/util";

//dom variable
const gridHTML = function() {
    const _locale = locale();
    const locale_info = _locale.info;
    const locale_print = _locale.print;
    const userInfo =
        luckysheetConfigsetting.userInfo === true
            ? '<i style="font-size:16px;color:#ff6a00;" class="fa fa-taxi" aria-hidden="true"></i> Lucky'
            : luckysheetConfigsetting.userInfo; // When true, use the default HTML string. The rendering of userInfo below uses nested template strings. Otherwise, when display is used and the image path is not passed in, there will be an undefined request

    return `<div class="luckysheet">
                    <canvas id="luckysheetTableContentF" style="display:none;" class="luckysheetTableContent"></canvas> 
                    <div class="luckysheet-work-area luckysheet-noselected-text"> 
                        <div id ="luckysheet_info_detail" class="luckysheet_info_detail"> 
                            <div data-tips="${
                                locale_info.return
                            }" id="luckysheet_info_detail_title" class="luckysheet_info_detail_back"> 
                                <i style="color:#444D5A;" class="fa fa-angle-left fa-2x" aria-hidden="true"></i> 
                            </div> 
                            <div class="luckysheet-share-logo" title="\${logotitle}"></div>
                            <div class="sheet-name"> 
                                <input data-tips="${
                                    locale_info.tips
                                }" id="luckysheet_info_detail_input" class="luckysheet_info_detail_input luckysheet-mousedown-cancel" value="${
        locale_info.noName
    }" tabindex="0" dir="ltr" aria-label="${
        locale_info.rename
    }" style="visibility: visible; width: 149px;" data-tooltip="${locale_info.rename}"> 
                            </div> 
                            <div id="luckysheet_info_detail_update" class="luckysheet_info_detail_update"> ${
                                locale_info.detailUpdate
                            } </div> 
                            <div id="luckysheet_info_detail_save" class="luckysheet_info_detail_save"> ${
                                locale_info.wait
                            } </div>
                            
                            \${functionButton}
                            
                            ${
                                getObjType(userInfo) === "string"
                                    ? `<div class="luckysheet_info_detail_user">
                            <span id="luckysheet_info_detail_user">${userInfo}</span></div>`
                                    : ""
                            }

                            ${
                                getObjType(userInfo) === "object"
                                    ? `<div class="luckysheet_info_detail_user">                            
                            <img src="${userInfo.userImage}" id="luckysheet_info_detail_user_img">
                            <span id="luckysheet_info_detail_user">${userInfo.userName}</span>
                            </div>`
                                    : ""
                            }
                            
                        </div> 
                        <div id="luckysheet-wa-editor" class="luckysheet-wa-editor toolbar"> \${menu} </div> 
                        <div id="luckysheet-wa-calculate" class="luckysheet-wa-calculate"> 
                            <div class="luckysheet-wa-calculate-size" id="luckysheet-wa-calculate-size"></div> 
                            <div class="luckysheet-wa-calculate-help"> 
                                <div class="luckysheet-wa-calculate-help-box"> 
                                    <div spellcheck="false" aria-hidden="false" id="luckysheet-helpbox">
                                        <div id="luckysheet-helpbox-cell" class="luckysheet-helpbox-cell-input luckysheet-mousedown-cancel" tabindex="0" contenteditable="true" dir="ltr" aria-autocomplete="list"></div>
                                    </div> 
                                </div>  
                                <div class="luckysheet-wa-calculate-help-tool">
                                    <i class="fa fa-caret-down" aria-hidden="true"></i>
                                </div> 
                            </div> 
                            <div id="luckysheet-wa-functionbox-cancel" class="luckysheet-wa-functionbox">
                                <span><i class="iconfont-luckysheet luckysheet-iconfont-qingchu" aria-hidden="true"></i></span>
                            </div> 
                            <div id="luckysheet-wa-functionbox-confirm" class="luckysheet-wa-functionbox">
                                <span><i class="iconfont-luckysheet luckysheet-iconfont-yunhang" aria-hidden="true"></i></span>
                            </div> 
                            <div id="luckysheet-wa-functionbox-fx" class="luckysheet-wa-functionbox">
                                <span><i class="iconfont-luckysheet luckysheet-iconfont-hanshu" aria-hidden="true" style="color:#333"></i></span> 
                            </div> 
                            <div id="luckysheet-functionbox-container" class="luckysheet-mousedown-cancel">
                                <div class="luckysheet-mousedown-cancel" dir="ltr">
                                    <div spellcheck="false" aria-hidden="false" id="luckysheet-functionbox">
                                        <div id="luckysheet-functionbox-cell" class="luckysheet-functionbox-cell-input luckysheet-mousedown-cancel" tabindex="0" contenteditable="true" dir="ltr" aria-autocomplete="list" aria-label="D4"></div>
                                    </div>
                                </div>
                            </div>   
                        </div> 
                    </div> 
                    <div class="luckysheet-grid-container luckysheet-scrollbars-enabled"> 
                        <div class="luckysheet-grid-window"> 
                            <div class="luckysheet-help-sub"></div> 
                            <div class="luckysheet-grid-window-1" id="luckysheet-grid-window-1">
                                <canvas id="luckysheetTableContent" class="luckysheetTableContent"></canvas> 
                                <table class="luckysheet-grid-window-2" cellspacing="0" cellpadding="0" dir="ltr" tabindex="-1" > 
                                    <tbody> 
                                        <tr> 
                                            <td valign="top" class="luckysheet-paneswrapper"> 
                                                <div class="luckysheet-left-top" id="luckysheet-left-top"> </div> 
                                            </td> 
                                            <td valign="top" class="luckysheet-paneswrapper"> 
                                                <div id="luckysheet-col-header" class="luckysheet-col-header">
                                                    <div class="luckysheet-cols-change-size" id="luckysheet-cols-change-size"></div>  
                                                    <div class="luckysheet-cols-menu-btn luckysheet-mousedown-cancel" id="luckysheet-cols-menu-btn"><i class="fa fa-caret-down luckysheet-mousedown-cancel" aria-hidden="true"></i></div>  
                                                    <div class="luckysheet-cols-h-hover" id="luckysheet-cols-h-hover"></div>  
                                                    <div id="luckysheet-cols-h-selected"></div>  
                                                    <div class="luckysheet-grdusedrange"></div>  
                                                    <div class="luckysheet-grdblkflowpush"></div>  \${columnHeader}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td valign="top" class="luckysheet-paneswrapper"> 
                                                <div class="luckysheet-row-header" id="luckysheet-row-header"> 
                                                    <div class="luckysheet-rows-change-size" id="luckysheet-rows-change-size"></div> 
                                                    <div class="luckysheet-rows-h-hover" id="luckysheet-rows-h-hover"></div> 
                                                    <div id="luckysheet-rows-h-selected"></div>  
                                                    <div class="luckysheet-grdusedrange"></div>  
                                                    <div class="luckysheet-grdblkflowpush"></div> \${rowHeader}
                                                </div> 
                                            </td>  
                                            <td valign="top" class="luckysheet-paneswrapper">
                                                <div class="luckysheet-cell-loading" id="luckysheet-cell-loading">
                                                    <div class="luckysheet-cell-loading-inner">
                                                        <i class="fa fa-circle-o-notch fa-spin"></i>
                                                        <span></span>
                                                    </div>
                                                </div> 
                                                <div class="luckysheet-cell-freezen"></div> 
                                                <div class="luckysheet-scrollbars luckysheet-scrollbar-ltr luckysheet-scrollbar-x" id="luckysheet-scrollbar-x"><div></div></div> 
                                                <div class="luckysheet-scrollbars luckysheet-scrollbar-ltr luckysheet-scrollbar-y" id="luckysheet-scrollbar-y"><div></div></div> 
                                                <div class="luckysheet-grid-body " id="luckysheet-grid-body">
                                                    <div id="luckysheet-formula-functionrange"></div>  
                                                    <div id="luckysheet-formula-functionrange-select" class="luckysheet-selection-copy luckysheet-formula-functionrange-select">
                                                        <div class="luckysheet-selection-copy-top luckysheet-copy"></div>
                                                        <div class="luckysheet-selection-copy-right luckysheet-copy"></div>
                                                        <div class="luckysheet-selection-copy-bottom luckysheet-copy"></div>
                                                        <div class="luckysheet-selection-copy-left luckysheet-copy"></div>
                                                        <div class="luckysheet-selection-copy-hc"></div>
                                                    </div>  
                                                    <div class="luckysheet-row-count-show luckysheet-count-show" id="luckysheet-row-count-show"></div>
                                                    <div class="luckysheet-column-count-show luckysheet-count-show" id="luckysheet-column-count-show"></div>
                                                    <div class="luckysheet-change-size-line" id="luckysheet-change-size-line"></div>  
                                                    <div class="luckysheet-cell-selected-focus" id="luckysheet-cell-selected-focus"></div>  
                                                    <div id="luckysheet-selection-copy"></div>  
                                                    <div class="luckysheet-cell-selected-extend" id="luckysheet-cell-selected-extend"></div>  
                                                    <div class="luckysheet-cell-selected-move" id="luckysheet-cell-selected-move"></div>  
                                                    <div id="luckysheet-cell-selected-boxs">
                                                        <div id="luckysheet-cell-selected" class="luckysheet-cell-selected">
                                                            <div class="luckysheet-cs-inner-border"></div>
                                                            <div class="luckysheet-cs-fillhandle"></div>
                                                            <div class="luckysheet-cs-inner-border"></div>
                                                            <div class="luckysheet-cs-draghandle-top luckysheet-cs-draghandle"></div>
                                                            <div class="luckysheet-cs-draghandle-bottom luckysheet-cs-draghandle"></div>
                                                            <div class="luckysheet-cs-draghandle-left luckysheet-cs-draghandle"></div>
                                                            <div class="luckysheet-cs-draghandle-right luckysheet-cs-draghandle"></div>
                                                            <div class="luckysheet-cs-touchhandle luckysheet-cs-touchhandle-lt"><div class="luckysheet-cs-touchhandle-btn"></div></div>
                                                            <div class="luckysheet-cs-touchhandle luckysheet-cs-touchhandle-rb"><div class="luckysheet-cs-touchhandle-btn"></div></div>
                                                        </div>
                                                    </div>
                                                    <div id="luckysheet-postil-showBoxs"></div>
                                                    <div id="luckysheet-multipleRange-show"></div>  
                                                    <div id="luckysheet-dynamicArray-hightShow"></div>  
                                                    <div id="luckysheet-image-showBoxs">
                                                        <div id="luckysheet-modal-dialog-activeImage" class="luckysheet-modal-dialog" style="display:none;padding:0;position:absolute;z-index:300;">
                                                            <div class="luckysheet-modal-dialog-border" style="position:absolute;"></div> 
                                                            <div class="luckysheet-modal-dialog-content"></div>  
                                                            <div class="luckysheet-modal-dialog-resize">
                                                                <div class="luckysheet-modal-dialog-resize-item luckysheet-modal-dialog-resize-item-lt" data-type="lt"></div>
                                                                <div class="luckysheet-modal-dialog-resize-item luckysheet-modal-dialog-resize-item-mt" data-type="mt"></div>
                                                                <div class="luckysheet-modal-dialog-resize-item luckysheet-modal-dialog-resize-item-lm" data-type="lm"></div>
                                                                <div class="luckysheet-modal-dialog-resize-item luckysheet-modal-dialog-resize-item-rm" data-type="rm"></div>
                                                                <div class="luckysheet-modal-dialog-resize-item luckysheet-modal-dialog-resize-item-rt" data-type="rt"></div>
                                                                <div class="luckysheet-modal-dialog-resize-item luckysheet-modal-dialog-resize-item-lb" data-type="lb"></div>
                                                                <div class="luckysheet-modal-dialog-resize-item luckysheet-modal-dialog-resize-item-mb" data-type="mb"></div>
                                                                <div class="luckysheet-modal-dialog-resize-item luckysheet-modal-dialog-resize-item-rb" data-type="rb"></div>
                                                            </div>
                                                            <div class="luckysheet-modal-dialog-controll">
                                                                <span class="luckysheet-modal-controll-btn luckysheet-modal-controll-crop" role="button" tabindex="0" aria-label="裁剪" title="裁剪">
                                                                    <i class="fa fa-pencil" aria-hidden="true"></i>
                                                                </span>
                                                                <span class="luckysheet-modal-controll-btn luckysheet-modal-controll-restore" role="button" tabindex="0" aria-label="恢复原图" title="恢复原图">
                                                                    <i class="fa fa-window-maximize" aria-hidden="true"></i>
                                                                </span>
                                                                <span class="luckysheet-modal-controll-btn luckysheet-modal-controll-del" role="button" tabindex="0" aria-label="删除" title="删除">
                                                                    <i class="fa fa-trash" aria-hidden="true"></i>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div id="luckysheet-modal-dialog-cropping" class="luckysheet-modal-dialog" style="display:none;padding:0;position:absolute;z-index:300;">
                                                            <div class="cropping-mask"></div>
                                                            <div class="cropping-content"></div>
                                                            <div class="luckysheet-modal-dialog-border" style="position:absolute;"></div>
                                                            <div class="luckysheet-modal-dialog-resize">
                                                                <div class="resize-item lt" data-type="lt"></div> 
                                                                <div class="resize-item mt" data-type="mt"></div> 
                                                                <div class="resize-item lm" data-type="lm"></div> 
                                                                <div class="resize-item rm" data-type="rm"></div> 
                                                                <div class="resize-item rt" data-type="rt"></div> 
                                                                <div class="resize-item lb" data-type="lb"></div> 
                                                                <div class="resize-item mb" data-type="mb"></div> 
                                                                <div class="resize-item rb" data-type="rb"></div>
                                                            </div>
                                                            <div class="luckysheet-modal-dialog-controll">
                                                                <span class="luckysheet-modal-controll-btn luckysheet-modal-controll-crop" role="button" tabindex="0" aria-label="裁剪" title="裁剪">
                                                                    <i class="fa fa-pencil" aria-hidden="true"></i>
                                                                </span>
                                                                <span class="luckysheet-modal-controll-btn luckysheet-modal-controll-restore" role="button" tabindex="0" aria-label="恢复原图" title="恢复原图">
                                                                    <i class="fa fa-window-maximize" aria-hidden="true"></i>
                                                                </span>
                                                                <span class="luckysheet-modal-controll-btn luckysheet-modal-controll-del" role="button" tabindex="0" aria-label="删除" title="删除">
                                                                    <i class="fa fa-trash" aria-hidden="true"></i>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div class="img-list"></div>
                                                        <div class="cell-date-picker">
                                                            <input id="cellDatePickerBtn" class="formulaInputFocus" readonly="readonly"/>
                                                        </div>
                                                    </div>
                                                    <div id="luckysheet-formula-refresh"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M4 20v-2h2.75l-.4-.35q-1.225-1.225-1.788-2.663T4 12.05q0-2.775 1.663-4.938T10 4.25v2.1Q8.2 7 7.1 8.562T6 12.05q0 1.125.425 2.188T7.75 16.2l.25.25V14h2v6H4Zm10-.25v-2.1q1.8-.65 2.9-2.212T18 11.95q0-1.125-.425-2.187T16.25 7.8L16 7.55V10h-2V4h6v2h-2.75l.4.35q1.225 1.225 1.788 2.663T20 11.95q0 2.775-1.663 4.938T14 19.75Z"/></svg></div>
                                                    <div class="luckysheet-cell-copy"></div>  
                                                    <div class="luckysheet-grdblkflowpush"></div>  \${flow} 
                                                </div> 
                                            </td> 
                                        </tr> 
                                    </tbody> 
                                </table> 
                            </div> 
                            <div class="luckysheet-sheet-area luckysheet-noselected-text" id="luckysheet-sheet-area">
                                <div id="luckysheet-sheet-content">
                                    <div id="luckysheet-sheets-add" class="luckysheet-sheets-add lucky-button-custom"><i class="iconfont-luckysheet luckysheet-iconfont-jia1"></i></div>
                                    <div id="luckysheet-sheets-m" class="luckysheet-sheets-m lucky-button-custom"><i class="iconfont-luckysheet luckysheet-iconfont-caidan2"></i></div>
                                    <div class="luckysheet-sheet-container" id="luckysheet-sheet-container">
                                        <div class="docs-sheet-fade docs-sheet-fade-left" style="display: none;">
                                            <div class="docs-sheet-fade3"></div>
                                            <div class="docs-sheet-fade2"></div>
                                            <div class="docs-sheet-fade1"></div>
                                        </div>
                                        <div class="docs-sheet-fade docs-sheet-fade-right" style="display: none;">
                                            <div class="docs-sheet-fade1"></div>
                                            <div class="docs-sheet-fade2"></div>
                                            <div class="docs-sheet-fade3"></div>
                                        </div>
                                        <div class="luckysheet-sheet-container-c" id="luckysheet-sheet-container-c"></div>
                                    </div>
                                    <div id="luckysheet-sheets-leftscroll" class="luckysheet-sheets-scroll lucky-button-custom"><i class="fa fa-caret-left"></i></div>
                                    <div id="luckysheet-sheets-rightscroll" class="luckysheet-sheets-scroll lucky-button-custom"><i class="fa fa-caret-right"></i></div>
                                </div>
                            </div> 
                        </div> 
                        <div class="luckysheet-stat-area"> 
                            <div class="luckysheet-sta-c">
                                <div class="luckysheet-zoom-content" id="luckysheet-zoom-content">
                                    <div class="luckysheet-zoom-minus" id="luckysheet-zoom-minus">
                                        <div class="luckysheet-zoom-minus-icon"></div>
                                    </div>
                                    <div class="luckysheet-zoom-slider" id="luckysheet-zoom-slider">
                                        <div class="luckysheet-zoom-line"></div>
                                        <div class="luckysheet-zoom-cursor" id="luckysheet-zoom-cursor"></div>
                                        <div class="luckysheet-zoom-hundred"></div>
                                    </div>
                                    <div class="luckysheet-zoom-plus" id="luckysheet-zoom-plus">
                                        <div class="luckysheet-zoom-plus-icon"></div>
                                    </div>
                                    <div class="luckysheet-zoom-ratioText" id="luckysheet-zoom-ratioText">100%</div>
                                </div>
                                <div class="luckysheet-sta-content" id="luckysheet-sta-content"></div>  
                                <!--<div class="luckysheet-bottom-content" id="luckysheet-bottom-content-show"></div> -->
                            </div> 
                        </div> 
                    </div>
                    <div id="luckysheet-copy-content" contenteditable="true"></div>
                    <input id="luckysheet-copy-btn" type="button" data-clipboard-target="luckysheet-copy-content">
                    <div id="testdpidiv" style="height: 1in; left: -100%; position: absolute; top: -100%; width: 1in;"></div>
                  </div>`;
};

export { gridHTML };
