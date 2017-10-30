var prompts = require('./prompts');
var request = require("request");

module.exports = (bot, bot_call, builder, calling) => {
    bot_call.dialog('/', [
        function (session) {
            if (!session.userData.welcomed) {
                session.userData.welcomed = true;
                session.send(prompts.welcome);
                session.beginDialog('/introduction', {
                    full: true
                });
            } else {
                session.send(prompts.welcomeBack);
                session.beginDialog('/introduction', {
                    full: false
                });
            }
        },
        function (session, results) {
            session.send(prompts.goodbye);
        }
    ]);

    bot_call.dialog('/introduction', [
        function (session, args) {
            var list = [];
            list.push(calling.Prompt.text(session, prompts.help_question));
            calling.Prompts.choice(session, new calling.PlayPromptAction(session).prompts(list), [{
                    name: 'flight',
                    speechVariation: ['rebook', 'can you rebook my flight', 'my flight is delayed can you book me to an earlier flight']
                },
                {
                    name: 'help',
                    speechVariation: ['help', 'help me']
                },
                {
                    name: 'quit',
                    speechVariation: ['nothing thanks', 'thank you']
                }
            ]);
        },
        function (session, results) {
            if (results.response) {
                switch (results.response.entity) {
                    case 'flight':
                        session.beginDialog('/rebook');
                        break;
                    case 'help':
                        session.replaceDialog('/introduction', {
                            full: true
                        });
                        break;
                    case 'quit':
                        session.endDialog();
                        break;
                    default:
                        session.beginDialog('/');
                        break;
                }
            } else {
                session.endDialog(prompts.canceled);
            }
        },
        function (session, results) {
            session.replaceDialog('/introduction', {
                full: false
            });
        }
    ]);

    bot_call.dialog('/rebook', [
        function (session) {
            session.send(prompts.rebook.confirmation);
        }
    ]);
};

function create_cards(body, session_to_use, builder) {
    console.log('Creating cards');
    var offers = body.offers;
    var cards = [];
    var item = offers[0];
    var option = 1;
    console.log(item.links[0]);
    var card = new builder.HeroCard(session_to_use)
        .title("Rebooked Flight")
        .images([
            builder.CardImage.create(session_to_use, item.links[item.links.length - 1].href)
        ])
        .tap(builder.CardAction.openUrl(session_to_use, "https://dialog-flow-webhook.herokuapp.com/flightdetails.html?departure_code=ARN&arrival_code=LHR&arrival_station=London&departure_station=Stolkhom&departure_date=12December&arrival_date=12December&pnr=t7dmY7"))
        .buttons([builder.CardAction.openUrl(session_to_use, 'https://dialog-flow-webhook.herokuapp.com/flightdetails.html?departure_code=ARN&arrival_code=LHR&arrival_station=London&departure_station=Stolkhom&departure_date=12December&arrival_date=12December&pnr=t7dmY7', 'View Details')]);
    cards.push(card);
    console.log('length of cards are ' + cards.length);
    console.log(cards);
    return cards;
}