import templatesModule from './templates.js';
import paintFormatModule from './paintFormat.js';
import toolbarInitModule from './toolbarInit.js';
import formatUpdateModule from './formatUpdate.js';
import formatStatusModule from './formatStatus.js';
import borderUtilsModule from './borderUtils.js';
import mergeCalcModule from './mergeCalc.js';
import formulaAutoInputModule from './formulaAutoInput.js';
import sizeUtilsModule from './sizeUtils.js';
import styleReadModule from './styleRead.js';
import fontManageModule from './fontManage.js';
import menuUtilsModule from './menuUtils.js';

const menuButton = {
    ...templatesModule,
    ...paintFormatModule,
    ...toolbarInitModule,
    ...formatUpdateModule,
    ...formatStatusModule,
    ...borderUtilsModule,
    ...mergeCalcModule,
    ...formulaAutoInputModule,
    ...sizeUtilsModule,
    ...styleReadModule,
    ...fontManageModule,
    ...menuUtilsModule,
};

export default menuButton;
