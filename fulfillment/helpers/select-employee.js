var builder = require("botbuilder");
var request = require("request");

module.exports = [
    (session, args, next) => {
        console.log("enter employee:" + JSON.stringify(args.entities));
        var entities = args.entities;
        var option_num = 0;
        var empidlocal = 0;


        for (var i = 0, len = entities.length; i < len; i++) {
            if (entities[i].type === 'builtin.number') {
                empidlocal = entities[i].entity;
            }
        }

        var offer_option = {
            url: 'http://ghbotapi.azurewebsites.net/crewmembers/' + empidlocal.toString(),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'GET',
            json: true
        };
        request(offer_option, function (error, response, body) {
            var address = session.message.address;
            var msg = new builder.Message()
                .address(address)
                .addAttachment(create_card(body, session));
            session.endDialog(msg);
        })
    }
];

function create_card(body, session_to_use) {
    console.log(JSON.stringify(body));
    var crew = body[0];
    console.log(crew);
    return new builder.ThumbnailCard(session_to_use)
        .title(crew.FirstName + crew.LastName)
        .subtitle('JobTitle:' + crew.JobTitle)
        .images([
            builder.CardImage.create(session_to_use, 'http://michaelsphotolab.com/yahoo_site_admin/assets/images/Air_Pilot2x2.307191941_std.JPG')
        ])
        .buttons([
            builder.CardAction.call(session_to_use, crew.mobile.toString(),"Calling")
        ]);
}