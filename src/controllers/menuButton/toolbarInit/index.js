import { initPaintFormat } from './initPaintFormat.js';
import { initNumberFormat } from './initNumberFormat.js';
import { initMoreFormat } from './initMoreFormat.js';
import { initFontFamily } from './initFontFamily.js';
import { initTextColor } from './initTextColor.js';
import { initCellColor } from './initCellColor.js';
import { initFontSize } from './initFontSize.js';
import { initBorder } from './initBorder.js';
import { initMerge } from './initMerge.js';
import { initAlign } from './initAlign.js';
import { initValign } from './initValign.js';
import { initTextWrap } from './initTextWrap.js';
import { initRotation } from './initRotation.js';
import { initFreezen } from './initFreezen.js';
import { initAutofilter } from './initAutofilter.js';
import { initSearchReplace } from './initSearchReplace.js';
import { initFunction } from './initFunction.js';
import { initTextStyle } from './initTextStyle.js';
import { initConditionformat } from './initConditionformat.js';
import { initPostil } from './initPostil.js';
import { initPrint } from './initPrint.js';

const toolbarInitModule = {
  initialMenuButton: function () {
    let _this = this;
    initPaintFormat(_this);
    initNumberFormat(_this);
    initMoreFormat(_this);
    initFontFamily(_this);
    initTextColor(_this);
    initCellColor(_this);
    initFontSize(_this);
    initBorder(_this);
    initMerge(_this);
    initAlign(_this);
    initValign(_this);
    initTextWrap(_this);
    initRotation(_this);
    initFreezen(_this);
    initAutofilter(_this);
    initSearchReplace(_this);
    initFunction(_this);
    initTextStyle(_this);
    initConditionformat(_this);
    initPostil(_this);
    initPrint(_this);
  },
};

export default toolbarInitModule;
