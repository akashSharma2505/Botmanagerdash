module.exports = (intents) => {
    console.log(JSON.stringify(intents));
    intents.matches('greeting', require('../fulfillment/helpers/greeting'));
    intents.matches('approval-check', require('../fulfillment/helpers/approval-check'));
    intents.matches('approval-confirmation', require('../fulfillment/helpers/approval-confirmation'));
    intents.matches('select-option', require('../fulfillment/helpers/select-option'));
    intents.matches('select-ancillary', require('../fulfillment/helpers/select-ancillary'));
    intents.matches('GH.Help', require('../fulfillment/helpers/select-help'));
    intents.matches('GH.Employee', require('../fulfillment/helpers/select-employee'));
};