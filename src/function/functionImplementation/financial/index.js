import financialCashflow from './financialCashflow';
import financialBond from './financialBond';
import financialDepreciation from './financialDepreciation';

const financialFunctions = Object.assign(
    {},
    financialCashflow,
    financialBond,
    financialDepreciation
);

export default financialFunctions;
