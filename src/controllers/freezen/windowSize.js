import { getSheetIndex } from "../../methods/get";
import { luckysheet_searcharray } from "../sheetSearch";
import { selectHightlightShow } from "../select";
import { createFilterOptions } from "../filter";
import menuButton from "../menuButton";
import luckysheetPostil from "../postil";
import luckysheetDropCell from "../dropCell";
import { rowLocationByIndex, colLocationByIndex } from "../../global/location";
import Store from "../../store";
import locale from "../../locale/locale";
import { luckysheetrefreshgrid } from "../../global/refresh";
const windowSizeModule = {
  windowHeight: null,
  windowWidth: null
};
export default windowSizeModule;