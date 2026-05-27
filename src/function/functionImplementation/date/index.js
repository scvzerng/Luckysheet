import dateCreation from './dateCreation';
import dateExtraction from './dateExtraction';
import dateCalculation from './dateCalculation';

const dateFunctions = Object.assign(
    {},
    dateCreation,
    dateExtraction,
    dateCalculation
);

export default dateFunctions;
