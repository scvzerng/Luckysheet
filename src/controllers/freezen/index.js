import freezeCoreModule from './freezeCore.js';
import freezeConfigModule from './freezeConfig.js';
import freezeCanvasModule from './freezeCanvas.js';
import scrollAdaptModule from './scrollAdapt.js';
import windowSizeModule from './windowSize.js';

const luckysheetFreezen = {
    ...freezeCoreModule,
    ...freezeConfigModule,
    ...freezeCanvasModule,
    ...scrollAdaptModule,
    ...windowSizeModule,
};

export default luckysheetFreezen;
