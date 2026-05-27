import { getSheetIndex } from '../../methods/get';
import editor from '../../global/editor';
import { isRealNull, isEditMode } from '../../global/validate';
import tooltip from '../../global/tooltip';
import { rowlenByRange } from '../../global/getRowlen';
import { selectHightlightShow } from '../select';
import { luckysheetMoveEndCell } from '../sheetMove';
import { luckysheetlodingHTML } from '../constant';
import locale from '../../locale/locale';
import Store from '../../store';
import menuButton from '../menuButton';
import conditionformat from '../conditionformat';
import alternateformat from '../alternateformat';
import { rgbTohex, showrightclickmenu } from '../../utils/util';
import cleargridelement from '../../global/cleargridelement';
import { jfrefreshgrid, jfrefreshgrid_rhcw } from '../../global/refresh';
import { orderbydata, orderbydata1D } from '../../global/sort';
import json from '../../global/json';
import { update, genarate } from '../../global/format';
import { labelFilterOptionState } from './labelFilterOptionState';
import { orderbydatafiler } from './orderbydatafiler';
import { createFilter } from './createFilter';
import filterState from './filterState';
import { filterMenuEvents } from './filterMenuEvents';
import { filterOptionClick } from './filterOptionClick';
import { filterColorEvents } from './filterColorEvents';
import { filterCheckboxEvents } from './filterCheckboxEvents';
import { filterActions } from './filterActions';

function initialFilterHandler() {
    const _locale = locale();
    filterState.locale_filter = _locale.filter;
    filterState.locale_button = _locale.button;
    $("#luckysheetfilter").click(createFilter);

    filterMenuEvents();
    filterOptionClick();
    filterColorEvents();
    filterCheckboxEvents();
    filterActions();
}

export { initialFilterHandler };
