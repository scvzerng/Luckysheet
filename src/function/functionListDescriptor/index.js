import mathDescriptors from './math.js';
import statisticalDescriptors from './statistical.js';
import dateDescriptors from './date.js';
import textDescriptors from './text.js';
import logicalDescriptors from './logical.js';
import lookupDescriptors from './lookup.js';
import financialDescriptors from './financial.js';
import informationDescriptors from './information.js';
import databaseDescriptors from './database.js';
import engineeringDescriptors from './engineering.js';
import arrayMatrixDescriptors from './arrayMatrix.js';
import dynamicArrayDescriptors from './dynamicArray.js';
import conditionalAggDescriptors from './conditionalAgg.js';
import localeCnDescriptors from './localeCn.js';
import dataMiningDescriptors from './dataMining.js';
import extensionDescriptors from './extension.js';

const functionListDescriptor = [
    ...mathDescriptors,
    ...statisticalDescriptors,
    ...dateDescriptors,
    ...textDescriptors,
    ...logicalDescriptors,
    ...lookupDescriptors,
    ...financialDescriptors,
    ...informationDescriptors,
    ...databaseDescriptors,
    ...engineeringDescriptors,
    ...arrayMatrixDescriptors,
    ...dynamicArrayDescriptors,
    ...conditionalAggDescriptors,
    ...localeCnDescriptors,
    ...dataMiningDescriptors,
    ...extensionDescriptors,
];

export default functionListDescriptor;
