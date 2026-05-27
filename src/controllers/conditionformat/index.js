import dialogModule from './dialog.js';
import computeModule from './compute.js';
import ruleManagerModule from './ruleManager.js';
import rangeSplitModule from './rangeSplit.js';
import utilsModule from './utils.js';
import dataModule from './data.js';

const conditionformat = {
    ...dialogModule,
    ...computeModule,
    ...ruleManagerModule,
    ...rangeSplitModule,
    ...utilsModule,
    ...dataModule,
};

export default conditionformat;
