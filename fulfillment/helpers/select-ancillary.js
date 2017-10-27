var builder = require("botbuilder");
var request = require("request");

module.exports = [
    (session, args, next) => {
        var entities = args.entities;
        var option_num = 0;
        var flight_num = 0;
        entities.forEach(function (item) {

            var entities = args.entities;
            var option_num = 0;
            entities.forEach(function (item) {
                console.log(item);
                if (item.type === 'number') {
                    option_num = item.entity;
                }
                if (item.type === 'flight') {
                    flight_num = item.entity;
                }
            });
            var offer_option = {
                url: ' https://1dc8cf29.ngrok.io/databaserest/flight_offers/' + session.message.address.user.id,
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'GET',
                json: true
            };
            request(offer_option, function (error, response, body) {
                if (error) {
                    console.log('Unable to get data ');
                    session.send(`We are finalizing your offer.... Kindly hold on.`);
                    throw new Error(error);

                } else {
                    offer = body.offers[option_num];
                    console.log('Offer selected:' + JSON.stringify(offer));
                    var ancillary_option = {
                        url: offer.links[1].href,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        method: 'POST',
                        json: true
                    };
                    request(ancillary_option, function (error, response, anc_body) {
                        if (error) {
                            console.log('Unable to get data ');
                            throw new Error(error);
                        } else {
                            console.log(anc_body);
                            var offer_option = {
                                method: 'POST',
                                url: 'https://1dc8cf29.ngrok.io/databaserest/final_offer/' + session.message.address.user.id,
                                headers: {
                                    'content-type': 'application/json'
                                },
                                body: anc_body,
                                json: true
                            };
                            request(offer_option, function (error, response, value) {
                                if (error) {
                                    console.log('Offeres are not saved....');
                                } else {
                                    console.log('Offers are saved....');
                                }
                            });
                        }
                    });
                }
            });
            console.log(item);
        });
        let msg_checklist = new builder.Message(session).addAttachment(new builder.ThumbnailCard(session)
        .title('Done. Here is your booking.')
        .buttons([
            builder.CardAction.openUrl(session, 'https://dialog-flow-webhook.herokuapp.com/flightdetails.html?departure_code=ARN&arrival_code=LHR&arrival_station=London&departure_station=Stolkhom&departure_date=12December&arrival_date=12December&pnr=X7uG5t', 'View Details')
        ]));
    session.endDialog(msg_checklist);
    }
];