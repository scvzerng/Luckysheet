import locale from '../../locale/locale';
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
