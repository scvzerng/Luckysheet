import { initialCopyFormatOperation } from './copyFormatOperation';
import { initialMatrixFlipOperation } from './matrixFlipOperation';
import { initialMatrixCalcOperation } from './matrixCalcOperation';
import { initialMatrixCleanOperation } from './matrixCleanOperation';

function initialMatrixOperation() {
    initialCopyFormatOperation();
    initialMatrixFlipOperation();
    initialMatrixCalcOperation();
    initialMatrixCleanOperation();
}

export { initialMatrixOperation };
export { checkMultiSelection, checkPartMerge } from './matrixValidation';
export { jfnqrt } from './matrixCalcOperation';
