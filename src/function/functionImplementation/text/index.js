import textManipulation from './textManipulation';
import textTransform from './textTransform';
import textSearch from './textSearch';

const textFunctions = Object.assign(
    {},
    textManipulation,
    textTransform,
    textSearch
);

export default textFunctions;
