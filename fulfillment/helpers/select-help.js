var builder = require("botbuilder");
var request = require("request");

module.exports = [
    (session, args, next) => {
        console.log("enter help");
        var entities = args.entities;
        var option_num = 0;

        var offer_option = {
            url: 'http://ghbotapi.azurewebsites.net/crewmembers/',
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'GET',
            json: true
        };
        request(offer_option, function (error, response, body) {
            var address = session.message.address;
            var msg = new builder.Message()
                .attachmentLayout(builder.AttachmentLayout.carousel)
                .address(address)
                .attachments(create_cards(body, session));
            session.endDialog(msg);

        })
    }
];

function create_cards(body, session_to_use) {
    console.log(JSON.stringify(body));
    var crew = body;
    var cards = [];
    for (i = 0; i < crew.length; i++) {
        var item = crew[i];
        var option = item.EmpId;
        console.log(item.EmpId);
        console.log(item.FirstName);
        console.log(item.LastName);
        console.log('Creating ancillary prods');
        var card = new builder.HeroCard(session_to_use)
            .title(item.FirstName + " " + item.LastName)
            .subtitle(item.EmpId.toString())
            .images([
                builder.CardImage.create(session_to_use, get_image_url("MEL"))
            ])
            .buttons([builder.CardAction.postBack(session_to_use, 'Select Crew Member ' + option, 'Select Crew Member')]);
        cards.push(card);
    }
    console.log(cards);
    return cards;
}

function get_image_url(code) {
    if (code === 'MEL') {

        return 'http://michaelsphotolab.com/yahoo_site_admin/assets/images/Air_Pilot2x2.307191941_std.JPG';
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