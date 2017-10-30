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
            //calling.Prompt.voice("male");
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
                        session.replaceDialog('/help', {
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
    bot_call.dialog('/help', [
        function (session, args) {
            calling.Prompt.text(session," Please Let me know ! which department information your want");
            console.log('help sent');
            var Details = session.dialogData.Details = {
                Department: "",
                Object: "",
                Subject: ""
            };
        },
        function (session, results, args) {
            session.Details.Department = results.response;
            calling.Prompt.text(session," Please Let me know ! what information you need regarding" + session.Details.Department);
        },
        function (session, results, args) {
            session.Details.Object = results.response;
            require('../fulfillment/helpers/select-help')
        }
    ]);
    bot_call.dialog('/rebook', [
        function (session) {
            calling.Prompt.text(session,"This is rebook for you");
            //session.send(prompts.rebook.confirmation);
            //calling.Prompts.confirm(session, prompts.rebook.success);
            // session.send(prompts.rebook.success);
            // console.log('Confirmations sent');
            // var address = session.message.address;
            // var options = {
            //     method: 'POST',
            //     url: 'http://3ffc8a95.ngrok.io/ndcrest/offers',
            //     headers: {
            //         'content-type': 'application/json'
            //     },
            //     body: {
            //         cabin: 'ECONOMY',
            //         airlinePreference: 'C9',
            //         currency: 'EUR',
            //         passengers: {
            //             ADULT: 1
            //         },
            //         connections: [{
            //             departureDate: '2017-12-12',
            //             origin: 'ARN',
            //             destination: 'LHR'
            //         }]
            //     },
            //     json: true
            // };
        //     console.log('Sending Flight offer');
        //     request(options, function (error, response, offer_received) {
        //         if (error) {
        //             console.log('No Offers');
        //             throw new Error(error);
        //         } else {
        //             var offer_option = {
        //                 method: 'POST',
        //                 url: 'https://1dc8cf29.ngrok.io/databaserest/flight_offers/' + session.message.address.user.id,
        //                 headers: {
        //                     'content-type': 'application/json'
        //                 },
        //                 body: offer_received,
        //                 json: true
        //             };
        //             console.log(offer_option);
        //             request(offer_option, function (error, response, value) {
        //                 if (error) {
        //                     console.log('Offeres are not saved....');
        //                 } else {
        //                     console.log('Offers are saved....');
        //                 }
        //             });

        //             if (offer_received.offers.length > 0) {
        //                 let new_session = session;
        //                 new_session.message.address.conversation.id = session.message.user.id;
        //                 console.log('Sending offers');
        //                 var msg = new builder.Message()
        //                     .address(address)
        //                     .attachments(create_cards(offer_received, new_session, builder));
        //                 bot.send(msg, function (err) {
        //                     console.log('Error is:' + err);
        //                     session.endDialog(err ? prompts.chat.failed : prompts.chat.sent);
        //                 });
        //             } else {
        //                 console.log('No Offers');
        //                 session.send(`We will get back to you with offers...`);
        //             }
        //         }

        //     });
        // 
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