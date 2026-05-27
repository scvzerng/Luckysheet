import sheetCRUDModule from './sheetCRUD.js';
import sheetSwitchModule from './sheetSwitch.js';
import sheetDataUtilsModule from './sheetDataUtils.js';
import sheetParamRestoreModule from './sheetParamRestore.js';
import sheetInitModule from './sheetInit.js';
import sheetLayoutModule from './sheetLayout.js';
import sheetCacheModule from './sheetCache.js';
import sheetUtilsModule from './sheetUtils.js';
import sheetVisibilityModule from './sheetVisibility.js';
import sheetDataModule from './sheetData.js';

const sheetmanage = {
    ...sheetCRUDModule,
    ...sheetSwitchModule,
    ...sheetDataUtilsModule,
    ...sheetParamRestoreModule,
    ...sheetInitModule,
    ...sheetLayoutModule,
    ...sheetCacheModule,
    ...sheetUtilsModule,
    ...sheetVisibilityModule,
    ...sheetDataModule,
};

export default sheetmanage;
