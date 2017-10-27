var builder = require("botbuilder");
var request = require("request");

module.exports = [
    (session, args, next) => {
        // session.send(`You have approved the travel.`);
        var proactive_session_option = {
            url: 'https://test-app-ndc.herokuapp.com/api/CustomWebApi?id=' + session.message.user.id + '&messageText=You have approved the request',
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'GET',
            json: true
        };
        request(proactive_session_option, function (error, response, body) {
            if (error) {
                console.log('Unable to message Manager....');
                throw new Error(error);
            } else {
                console.log('Manager Successfully messaged ');
            }
        });
        console.log('Session sent:' + session.message.address);
        console.log('Options sent:' + proactive_session_option);
        var channel = session.message.channelId;
        var id = session.message.user.id;
        var db_url = 'https://1dc8cf29.ngrok.io/databaserest/users_info/';
        var entities = args.entities;
        var old_id = '';
        entities.forEach(function (item) {
            if (item.type === 'id') {
                id = item.entity;
            }
        });
        request({
            url: db_url + '/' + id,
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'GET',
            json: true
        }, (error, response, body) => {
            if (error) {
                console.log('Error retrieving DB: ', error);
            } else if (response.body.error) {
                console.log('Error retrieving DB: ', response.body.error);
            } else {
                console.log(session.message.address);
                old_id = session.message.address.user.id;
                var documents = body;
                var skype_id = body.skype_id;
                var session_to_use = session;
                session_to_use.message.address.user.id = skype_id;
                session_to_use.message.address.conversation.id = skype_id;
                session_to_use.message.user.id = skype_id;
                session_to_use.send('Great... Approvals done. Let me find some flights for you.');
                var options = {
                    method: 'POST',
                    url: 'http://3ffc8a95.ngrok.io/ndcrest/offers',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: {
                        cabin: 'ECONOMY',
                        airlinePreference: 'C9',
                        currency: 'EUR',
                        passengers: {
                            ADULT: 1
                        },
                        connections: [{
                            departureDate: '2017-12-12',
                            origin: 'ARN',
                            destination: 'LHR'
                        }]
                    },
                    json: true
                };

                request(options, function (error, response, offer_received) {
                    if (error) {
                        console.log('No Offers');
                        throw new Error(error);
                    } else {
                        var offer_option = {
                            method: 'POST',
                            url: 'https://1dc8cf29.ngrok.io/databaserest/flight_offers/' + skype_id,
                            headers: {
                                'content-type': 'application/json'
                            },
                            body: offer_received,
                            json: true
                        };
                        request(offer_option, function (error, response, value) {
                            if (error) {
                                console.log('Offeres are not saved....');
                            } else {
                                console.log('Offers are saved....');
                            }
                        });
                        
                        var address = session_to_use.message.address;
                        if (offer_received.offers.length > 0) {
                            console.log('Sending offers');
                            var msg = new builder.Message()
                                .attachmentLayout(builder.AttachmentLayout.carousel)
                                .address(address)
                                .attachments(create_cards(offer_received, session_to_use));
                            session_to_use.endDialog(msg);
                        } else {
                            console.log('No Offers');
                            session_to_use.send(`We will get back to you with offers...`);
                        }
                    }

                });
            }
        });
    }
];

function create_cards(body, session_to_use) {
    console.log('Creating cards');
    var offers = body.offers;
    var cards = [];
    for (i = 0; i < offers.length; i++) {
        //  offers.forEach(function (item) {
        var item = offers[i];
        var option = i;
        console.log(item.links[item.links.length - 1]);
        var card = new builder.HeroCard(session_to_use)
            .title("Kronos")
            .subtitle(item.bestOfferReason)
            .images([
                builder.CardImage.create(session_to_use, item.links[item.links.length - 1].href)
            ])
            //.tap(builder.CardAction.openUrl(session_to_use, "https://www.finnair.com/fr/fr/?gclid=EAIaIQobChMI4eek5qWB1wIVl5EbCh2qrw2HEAAYASAAEgIO3PD_BwE"))
            .buttons([builder.CardAction.postBack(session_to_use, 'Select option ' + option, 'Select this offer')]);
        cards.push(card);
    }
    console.log(cards);
    return cards;
}