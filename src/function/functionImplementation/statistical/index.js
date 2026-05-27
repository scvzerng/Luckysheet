import statisticalBasic from './statisticalBasic';
import statisticalDistribution from './statisticalDistribution';
import statisticalRegression from './statisticalRegression';
import statisticalRanking from './statisticalRanking';

const statisticalFunctions = Object.assign(
    {},
    statisticalBasic,
    statisticalDistribution,
    statisticalRegression,
    statisticalRanking
);

export default statisticalFunctions;
