import clipboardCopyModule from './clipboardCopy.js';
import clipboardPasteModule from './clipboardPaste.js';
import clipboardCutPasteModule from './clipboardCutPaste.js';
import clipboardCopyPasteModule from './clipboardCopyPaste.js';
import clipboardPaintModelModule from './clipboardPaintModel.js';
import utilsModule from './utils.js';

const selection = {
    ...clipboardCopyModule,
    ...clipboardPasteModule,
    ...clipboardCutPasteModule,
    ...clipboardCopyPasteModule,
    ...clipboardPaintModelModule,
    ...utilsModule,
};

export default selection;
