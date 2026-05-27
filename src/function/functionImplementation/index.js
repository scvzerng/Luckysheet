import mathFunctions from './math.js';
import statisticalFunctions from './statistical.js';
import dateFunctions from './date.js';
import textFunctions from './text.js';
import logicalFunctions from './logical.js';
import lookupFunctions from './lookup.js';
import financialFunctions from './financial.js';
import informationFunctions from './information.js';
import databaseFunctions from './database.js';
import engineeringFunctions from './engineering.js';
import arrayMatrixFunctions from './arrayMatrix.js';
import dynamicArrayFunctions from './dynamicArray.js';
import conditionalAggFunctions from './conditionalAgg.js';
import localeCnFunctions from './localeCn.js';
import dataMiningFunctions from './dataMining.js';
import extensionFunctions from './extension.js';

const functionImplementation = {
    ...mathFunctions,
    ...statisticalFunctions,
    ...dateFunctions,
    ...textFunctions,
    ...logicalFunctions,
    ...lookupFunctions,
    ...financialFunctions,
    ...informationFunctions,
    ...databaseFunctions,
    ...engineeringFunctions,
    ...arrayMatrixFunctions,
    ...dynamicArrayFunctions,
    ...conditionalAggFunctions,
    ...localeCnFunctions,
    ...dataMiningFunctions,
    ...extensionFunctions,
};

export default functionImplementation;
