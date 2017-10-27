var builder = require("botbuilder");
var request = require("request");

module.exports = [
    (session, args, next) => {
        var entities = args.entities;
        var option_num = 0;
        entities.forEach(function (item) {
            console.log(item);
            if (item.type === 'number') {
                option_num = item.entity;
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
                session.send(`We will get back to you with ancillary offers...`);
                throw new Error(error);

            } else {
                offer = body.offers[option_num];
                console.log('Offer selected:' + JSON.stringify(offer));
                var ancillary_option = {
                    url: offer.links[0].href,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'GET',
                    json: true
                };
                request(ancillary_option, function (error, response, anc_body) {
                    if (error) {
                        console.log('Unable to get data ');
                        throw new Error(error);
                    } else {
                        var offer_option = {
                            method: 'POST',
                            url: 'https://1dc8cf29.ngrok.io/databaserest/anc_offers/' + session.message.address.user.id,
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
                        var address = session.message.address;
                        if (anc_body.length > 0) {
                            console.log('Sending offers');
                            var msg = new builder.Message()
                                .attachmentLayout(builder.AttachmentLayout.carousel)
                                .address(address)
                                .attachments(create_cards(anc_body, session));
                            session.endDialog(msg);
                        } else {
                            console.log('No Offers');
                            session.send(`We will get back to you with offers...`);
                        }
                    }
                });
            }
        });
    }
];

function create_cards(body, session_to_use) {
    console.log('Creating cards');
    var offers = body;
    var cards = [];
    for (i = 0; i < offers.length; i++) {
        var item = offers[i];
        var option = i;
        if (item.code === 'GRN') {
            console.log('Ignoring Lounge');
        } else {
            console.log(item.code);
            console.log(get_image_url(item.code));
            console.log('Creating ancillary prods');
            var card = new builder.HeroCard(session_to_use)
                .title(get_titles(item.code))
                .subtitle(get_txt(item.code))
                .images([
                    builder.CardImage.create(session_to_use, get_image_url(item.code))
                ])
                //.tap(builder.CardAction.openUrl(session_to_use, "https://www.finnair.com/fr/fr/?gclid=EAIaIQobChMI4eek5qWB1wIVl5EbCh2qrw2HEAAYASAAEgIO3PD_BwE"))
                .buttons([builder.CardAction.postBack(session_to_use, 'Select ancillary ' + option, 'Select this ancillary')]);
            cards.push(card);
        }
    }
    console.log(cards);
    return cards;
}

function get_image_url(code) {
    if (code === 'MEL') {

        return 'https://s3-us-west-2.amazonaws.com/beachbody-blog/uploads/2016/05/mexican-meal-prep.jpg';
    }
    if (code === 'CON') {

        return 'http://www.informationsecuritybuzz.com/wp-content/uploads/wifi-1.jpg';
    }
    if (code === 'BAG') {

        return 'https://dishccvmy41gl.cloudfront.net/spree/products/173/product_retina/Away_Large_Navy.jpg?1493120102https://s3-us-west-2.amazonaws.com/beachbody-blog/uploads/2016/05/mexican-meal-prep.jpg'
    }
    if (code === 'SET') {

        return 'https://i.pinimg.com/originals/c0/a6/09/c0a609801d296f340a04f0014bfc67fc.jpg';
    }
}

function get_txt(code) {
    if (code === 'MEL') {

        return 'Amazing meals';
    }
    if (code === 'CON') {

        return 'Fast connection anywhere';
    }
    if (code === 'BAG') {

        return 'Extra luggage allowance';
    }
    if (code === 'SET') {

        return 'Extra comfort';
    }
}

function get_titles(code) {
    if (code === 'MEL') {

        return 'Meals';
    }
    if (code === 'CON') {

        return 'Wifi';
    }
    if (code === 'BAG') {

        return 'Luggage';
    }
    if (code === 'SET') {

        return 'Seat';
    }
}