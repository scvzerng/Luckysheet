import locale from "../../locale/locale";
import { customCellRightClickConfig } from "./configFunctions";

//右键菜单dom
function rightclickHTML() {
    const _locale = locale();
    const rightclick = _locale.rightclick;
    const toolbar = _locale.toolbar;

    const config = customCellRightClickConfig();

    // 当一个功能菜单块内所有的按钮都隐藏的时候，它顶部的分割线也需要隐藏掉
    let handleincellMenuseparator = true;

    if (!config.insertRow && !config.insertColumn && !config.deleteRow && !config.deleteColumn && !config.deleteCell) {
        handleincellMenuseparator = false;
    }

    let dataMenuseparator = true;

    if (
        !config.clear &&
        !config.matrix &&
        !config.sort &&
        !config.filter &&
        !config.image &&
        !config.link &&
        !config.data
    ) {
        dataMenuseparator = false;
    }

    const customsButtons = (config.customs || [])
        .map(
            (item, index) => `
            <div data-index="${index}" class="luckysheetColsRowsHandleAdd_custom luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                ${item.title}
                </div>
            </div>`,
        )
        .join("");

    const rightclickContainer = `<div id="luckysheet-rightclick-menu" class="luckysheet-cols-menu luckysheet-rightgclick-menu luckysheet-mousedown-cancel">
                <div id="luckysheet-copy-btn" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel luckysheet-copy-btn" data-clipboard-action="copy" data-clipboard-target="#luckysheet-copy-content" style="display:${
                    config.copy ? "block" : "none"
                };">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${rightclick.copy}</div>
                </div>
                <div id="luckysheetcopyfor" class="luckysheet-cols-menuitem luckysheet-cols-submenu luckysheet-mousedown-cancel"  style="display:${
                    config.copyAs ? "block" : "none"
                };">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${
                            rightclick.copyAs
                        }<span class="luckysheet-submenu-arrow iconfont-luckysheet luckysheet-iconfont-youjiantou" style="user-select: none;"></span>
                    </div>
                </div>
                <div id="luckysheet-copy-paste" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="display:${
                    config.paste ? "block" : "none"
                };">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${rightclick.paste}</div>
                </div>
                <div id="luckysheet-cols-rows-handleincell">
                    <div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator" style="display:${
                        handleincellMenuseparator ? "block" : "none"
                    };"></div>
                    <div id="luckysheetColsRowsHandleAdd_row" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="display:${
                        config.insertRow ? "block" : "none"
                    };">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                            ${rightclick.insert}${
        rightclick.row
    }<span class="luckysheet-submenu-arrow" style="user-select: none;"></span>
                        </div>
                    </div>
                    <div id="luckysheetColsRowsHandleAdd_column" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="display:${
                        config.insertColumn ? "block" : "none"
                    };">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                            ${rightclick.insert}${
        rightclick.column
    }<span class="luckysheet-submenu-arrow" style="user-select: none;"></span>
                        </div>
                    </div>
                    <div id="luckysheet-delRows" class="luckysheet-cols-menuitem luckysheet-cols-submenu luckysheet-mousedown-cancel" style="display:${
                        config.deleteRow ? "block" : "none"
                    };">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.deleteSelected}${
        rightclick.row
    }<span class="luckysheet-submenu-arrow" style="user-select: none;"></span>
                        </div>
                    </div>
                    <div id="luckysheet-delCols" class="luckysheet-cols-menuitem luckysheet-cols-submenu luckysheet-mousedown-cancel" style="display:${
                        config.deleteColumn ? "block" : "none"
                    };">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.deleteSelected}${
        rightclick.column
    }<span class="luckysheet-submenu-arrow" style="user-select: none;"></span>
                        </div>
                    </div>
                    <!-- cell right click remove hide button
                    <div id="luckysheetColsRowsHandleHid" class="luckysheet-cols-menuitem luckysheet-cols-submenu luckysheet-mousedown-cancel">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                            ${
                                rightclick.hide
                            }<span class="luckysheet-submenu-arrow iconfont-luckysheet luckysheet-iconfont-youjiantou" style="user-select: none;"></span>
                        </div>
                    </div>
                    -->
                    <div id="luckysheetCellsHandleDel" class="luckysheet-cols-menuitem luckysheet-cols-submenu luckysheet-mousedown-cancel" style="display:${
                        config.deleteCell ? "block" : "none"
                    };">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                            ${
                                rightclick.deleteCell
                            }<span class="luckysheet-submenu-arrow iconfont-luckysheet luckysheet-iconfont-youjiantou" style="user-select: none;"></span>
                        </div>
                    </div>
                </div>
                <div id="luckysheet-cols-rows-add">
                    <div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator"></div>
                    <div id="luckysheet-top-left-add-selected" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                            ${rightclick.to}
                            <span class="luckysheet-cols-rows-shift-left">${rightclick.left}</span>
                            ${rightclick.add}
                            <input type="text" class="luckysheet-mousedown-cancel" placeholder="${
                                rightclick.number
                            }" value="1" style="width:40px;height:20px;box-sizing:border-box;text-align:center;margin-left:5px;"/>
                            <span class="luckysheet-cols-rows-shift-word luckysheet-mousedown-cancel">${
                                rightclick.column
                            }</span>
                        </div>
                    </div>
                    <div id="luckysheet-bottom-right-add-selected" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                            ${rightclick.to}
                            <span class="luckysheet-cols-rows-shift-right">${rightclick.right}</span>
                            ${rightclick.add}
                            <input type="text" class="luckysheet-mousedown-cancel" placeholder="${
                                rightclick.number
                            }" value="1" style="width:40px;height:20px;box-sizing:border-box;text-align: center;margin-left:5px;"/>
                            <span class="luckysheet-cols-rows-shift-word luckysheet-mousedown-cancel">${
                                rightclick.column
                            }</span>
                        </div>
                    </div>
                    <div id="luckysheet-del-selected" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                            ${rightclick.deleteSelected}
                            <span class="luckysheet-cols-rows-shift-word luckysheet-mousedown-cancel">${
                                rightclick.column
                            }</span>
                        </div>
                    </div>
                    <div id="luckysheet-hide-selected" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.hideSelected}
                        <span class="luckysheet-cols-rows-shift-word luckysheet-mousedown-cancel">${
                            rightclick.column
                        }</span>
                        </div>
                    </div>
                    <div id="luckysheet-show-selected" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                            ${rightclick.showHide}
                            <span class="luckysheet-cols-rows-shift-word luckysheet-mousedown-cancel">${
                                rightclick.column
                            }</span>
                        </div>
                    </div>
                    <div id="luckysheet-column-row-width-selected" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                            <span class="luckysheet-cols-rows-shift-word luckysheet-mousedown-cancel">${
                                rightclick.column
                            }</span>
                            <span class="luckysheet-cols-rows-shift-size luckysheet-mousedown-cancel">${
                                rightclick.width
                            }</span>
                            <input type="number" class="luckysheet-mousedown-cancel rcsize" min="0" max="255" placeholder="${
                                rightclick.number
                            }" value="" style="width:50px;height:20px;box-sizing:border-box;text-align: center;margin-left:5px;">
                            px
                        </div>
                    </div>
                </div>
                <div id="luckysheet-cols-rows-shift">
                    <div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator" style="display:${
                        config.sort ? "block" : "none"
                    };"></div>
                    <div id="luckysheetorderbyasc" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="display:${
                        config.sort ? "block" : "none"
                    };">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${
                            rightclick.orderAZ
                        }</div>
                    </div>
                    <div id="luckysheetorderbydesc" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="display:${
                        config.sort ? "block" : "none"
                    };">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${
                            rightclick.orderZA
                        }</div>
                    </div>
                </div>
                <div id="luckysheet-cols-rows-data">
                    <div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator" style="display:${
                        dataMenuseparator ? "block" : "none"
                    };"></div>
                    <div id="luckysheet-delete-text" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="display:${
                        config.clear ? "block" : "none"
                    };">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${
                            rightclick.clearContent
                        }</div>
                    </div>
                    <div id="luckysheetmatrix" class="luckysheet-cols-menuitem luckysheet-cols-submenu luckysheet-mousedown-cancel" style="display:${
                        config.matrix ? "block" : "none"
                    };">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                            ${
                                rightclick.matrix
                            }<span class="luckysheet-submenu-arrow iconfont-luckysheet luckysheet-iconfont-youjiantou" style="user-select: none;"></span>
                        </div>
                    </div>
                    <div id="luckysheetorderby" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="display:${
                        config.sort ? "block" : "none"
                    };">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${
                            rightclick.sortSelection
                        }</div>
                    </div>
                    <div id="luckysheetfilter" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="display:${
                        config.filter ? "block" : "none"
                    };">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${
                            rightclick.filterSelection
                        }</div>
                    </div>
                    <div id="luckysheetInsertImage" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="display:${
                        config.image ? "block" : "none"
                    };">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${
                            toolbar.insertImage
                        }</div>
                    </div>
                    <div id="luckysheetInsertLink" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="display:${
                        config.link ? "block" : "none"
                    };">
                        <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${
                            toolbar.insertLink
                        }</div>
                    </div>
                    ${customsButtons}
                </div>
            </div>
            <div id="luckysheetcopyfor_sub" class="luckysheet-cols-menu luckysheet-rightgclick-menu luckysheet-rightgclick-menu-sub luckysheet-mousedown-cancel">
                <div id="luckysheet-copy-json-head" data-clipboard-action="copy" data-clipboard-target="#luckysheet-copy-content" class="luckysheet-cols-menuitem luckysheet-copy-btn luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">Json ${
                        rightclick.firstLineTitle
                    }</div>
                </div>
                <div id="luckysheet-copy-json-nohead" data-clipboard-action="copy" data-clipboard-target="#luckysheet-copy-content" class="luckysheet-cols-menuitem luckysheet-copy-btn luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">Json ${
                        rightclick.untitled
                    }</div>
                </div>
                <div id="luckysheet-copy-array1" data-clipboard-action="copy" data-clipboard-target="#luckysheet-copy-content" class="luckysheet-cols-menuitem luckysheet-copy-btn luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${rightclick.array1}</div>
                </div>
                <div id="luckysheet-copy-array2" data-clipboard-action="copy" data-clipboard-target="#luckysheet-copy-content" class="luckysheet-cols-menuitem luckysheet-copy-btn luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${rightclick.array2}</div>
                </div>
                <div id="luckysheet-copy-arraymore-confirm" data-clipboard-action="copy" data-clipboard-target="#luckysheet-copy-content" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        <span class="luckysheet-mousedown-cancel">${rightclick.array3}</span>
                        <input type="number" id="luckysheet-copy-arraymore-row" min="1" class="luckysheet-mousedown-cancel" placeholder="${
                            rightclick.row
                        }" style="width:40px;height:20px;box-sizing:border-box;text-align: center;"/>
                            ×
                            <input type="number" id="luckysheet-copy-arraymore-col" min="1" class="luckysheet-mousedown-cancel" placeholder="${
                                rightclick.column
                            }" style="width:40px;height:20px;box-sizing:border-box;text-align: center;"/>
                    </div>
                </div>
                <div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator"></div>
                <div id="luckysheet-copy-diagonal" data-clipboard-action="copy" data-clipboard-target="#luckysheet-copy-content" class="luckysheet-cols-menuitem luckysheet-copy-btn luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${
                        rightclick.diagonal
                    }</div>
                </div>
                <div id="luckysheet-copy-antidiagonal" data-clipboard-action="copy" data-clipboard-target="#luckysheet-copy-content" class="luckysheet-cols-menuitem luckysheet-copy-btn luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${
                        rightclick.antiDiagonal
                    }</div>
                </div>
                <div id="luckysheet-copy-diagonaloffset" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.diagonalOffset}
                        <input type="number" id="luckysheet-copy-diagonaloffset-value" class="luckysheet-mousedown-cancel" placeholder="${
                            rightclick.offset
                        }" value="1" style="width:40px;height:20px;box-sizing:border-box;text-align: center;margin-left:5px;"/>
                        ${rightclick.column}
                    </div>
                </div>
                <div id="luckysheet-copy-boolvalue" data-clipboard-action="copy" data-clipboard-target="#luckysheet-copy-content" class="luckysheet-cols-menuitem luckysheet-copy-btn luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${
                        rightclick.boolean
                    }</div>
                </div>
            </div>
            
            <!-- Revision: modeled on google sheet
            
            <div id="luckysheetColsRowsHandleAdd_sub" class="luckysheet-cols-menu luckysheet-rightgclick-menu luckysheet-rightgclick-menu-sub luckysheet-mousedown-cancel">
                <div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.to}${rightclick.top}${rightclick.add}
                        <input type="text" class="luckysheet-mousedown-cancel" placeholder="${
                            rightclick.number
                        }" value="1" style="width:40px;height:20px;box-sizing:border-box;text-align: center;margin-left:5px;"/>
                        <span class="luckysheet-mousedown-cancel">${rightclick.row}</span>
                    </div>
                </div>
                <div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.to}${rightclick.bottom}${rightclick.add}
                        <input type="text" class="luckysheet-mousedown-cancel" placeholder="${
                            rightclick.number
                        }" value="1" style="width:40px;height:20px;box-sizing:border-box;text-align: center;margin-left:5px;"/>
                        <span class="luckysheet-mousedown-cancel">${rightclick.row}</span>
                    </div>
                </div>
                <div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.to}${rightclick.left}${rightclick.add}
                        <input type="text" class="luckysheet-mousedown-cancel" placeholder="${
                            rightclick.number
                        }" value="1" style="width:40px;height:20px;box-sizing:border-box;text-align: center;margin-left:5px;"/>
                        <span class="luckysheet-mousedown-cancel">${rightclick.column}</span>
                    </div>
                </div>
                <div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.to}${rightclick.right}${rightclick.add}
                        <input type="text" class="luckysheet-mousedown-cancel" placeholder="${
                            rightclick.number
                        }" value="1" style="width:40px;height:20px;box-sizing:border-box;text-align: center;margin-left:5px;"/>
                        <span class="luckysheet-mousedown-cancel">${rightclick.column}</span>
                    </div>
                </div>
            </div>
            
            -->

            <!-- delete row or column
            
            <div id="luckysheetColsRowsHandleDel_sub" class="luckysheet-cols-menu luckysheet-rightgclick-menu luckysheet-rightgclick-menu-sub luckysheet-mousedown-cancel">
                <div id="luckysheet-delRows" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.deleteSelected}${rightclick.row}
                    </div>
                </div>
                <div id="luckysheet-delCols" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.deleteSelected}${rightclick.column}
                    </div>
                </div>
            </div>
            
            -->

            <!--
            <div id="luckysheetColsRowsHandleHid_sub" class="luckysheet-cols-menu luckysheet-rightgclick-menu luckysheet-rightgclick-menu-sub luckysheet-mousedown-cancel">
                <div id="luckysheet-hidRows" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.hideSelected}${rightclick.row}
                    </div>
                </div>
                <div id="luckysheet-showHidRows" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.showHide}${rightclick.row}
                    </div>
                </div>
                <div id="luckysheet-hidCols" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.hideSelected}${rightclick.column}
                    </div>
                </div>
                <div id="luckysheet-showHidCols" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.showHide}${rightclick.column}
                    </div>
                </div>
            </div>

            -->

            <div id="luckysheetCellsHandleDel_sub" class="luckysheet-cols-menu luckysheet-rightgclick-menu luckysheet-rightgclick-menu-sub luckysheet-mousedown-cancel">
                <div id="luckysheet-delCellsMoveLeft" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.moveLeft}
                    </div>
                </div>
                <div id="luckysheet-delCellsMoveUp" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.moveUp}
                    </div>
                </div>
            </div>
            <div id="luckysheetmatrix_sub" class="luckysheet-cols-menu luckysheet-rightgclick-menu luckysheet-rightgclick-menu-sub luckysheet-mousedown-cancel">
                <div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.flip}
                        <button id="luckysheet-matrix-turn-up" class="btn btn-primary luckysheet-mousedown-cancel" style="margin-left:5px;padding:2px 3px;line-height:12px;font-size:12px;">${
                            rightclick.upAndDown
                        }</button>
                        <button id="luckysheet-matrix-turn-left" class="btn btn-primary luckysheet-mousedown-cancel" style="margin-left:5px;padding:2px 3px;line-height:12px;font-size:12px;">${
                            rightclick.leftAndRight
                        }</button>
                    </div>
                </div>
                <div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.flip}
                        <button id="luckysheet-matrix-turn-cw" class="btn btn-primary luckysheet-mousedown-cancel" style="margin-left:5px;padding:2px 3px;line-height:12px;font-size:12px;">${
                            rightclick.clockwise
                        }</button>
                        <button id="luckysheet-matrix-turn-anticw" class="btn btn-primary luckysheet-mousedown-cancel" style="margin-left:5px;padding:2px 3px;line-height:12px;font-size:12px;">${
                            rightclick.counterclockwise
                        }</button>
                    </div>
                </div>
                <div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div id="luckysheet-matrix-turn-trans" class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${
                        rightclick.transpose
                    }</div>
                </div>
                <div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator"></div>
                <div id="luckysheet-matrix-cal-confirm" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        <div class="luckysheet-mousedown-cancel">${rightclick.matrixCalculation}</div>
                        <div class="luckysheet-mousedown-cancel">
                            <select id="luckysheet-matrix-cal-type" class="luckysheet-mousedown-cancel" style="height:20px;">
                                <option value="plus">${rightclick.plus}</option>
                                <option value="minus">${rightclick.minus}</option>
                                <option value="multiply">${rightclick.multiply}</option>
                                <option value="divided">${rightclick.divided}</option>
                                <option value="power">${rightclick.power}</option>
                                <option value="root">${rightclick.root}</option>
                                <option value="log">${rightclick.log}</option>
                            </select>
                            <input type="number" id="luckysheet-matrix-cal-value" class="luckysheet-mousedown-cancel" placeholder="${
                                rightclick.number
                            }" value="2" style="width:40px;height:20px;box-sizing:border-box;text-align: center;margin-left:5px;"/>
                        </div>
                    </div>
                </div>
                <div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.delete0}
                        <button id="luckysheet-matrix-delezero-row" class="btn btn-primary luckysheet-mousedown-cancel" style="margin-left:5px;padding:2px 3px;line-height:12px;font-size:12px;">${
                            rightclick.byRow
                        }</button>
                        <button id="luckysheet-matrix-delezero-column" class="btn btn-primary luckysheet-mousedown-cancel" style="margin-left:5px;padding:2px 3px;line-height:12px;font-size:12px;">${
                            rightclick.byCol
                        }</button>
                    </div>
                </div>
                <div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">
                        ${rightclick.removeDuplicate}
                        <button id="luckysheet-matrix-delerpt-row" class="btn btn-primary luckysheet-mousedown-cancel" style="margin-left:5px;padding:2px 3px;line-height:12px;font-size:12px;">${
                            rightclick.byRow
                        }</button>
                        <button id="luckysheet-matrix-delerpt-column" class="btn btn-primary luckysheet-mousedown-cancel" style="margin-left:5px;padding:2px 3px;line-height:12px;font-size:12px;">${
                            rightclick.byCol
                        }</button>
                    </div>
                </div>
            </div>`;

    return rightclickContainer;
}

export { rightclickHTML };
