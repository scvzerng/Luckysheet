import uiModule from './ui.js';
import coreModule from './core.js';
import fillStrategyModule from './fillStrategy.js';
import chnNumberModule from './chnNumber.js';
import typeDetectorModule from './typeDetector.js';
import mathUtilsModule from './mathUtils.js';

const luckysheetDropCell = {
    ...uiModule,
    ...coreModule,
    ...fillStrategyModule,
    ...chnNumberModule,
    ...typeDetectorModule,
    ...mathUtilsModule,
};

export default luckysheetDropCell;
