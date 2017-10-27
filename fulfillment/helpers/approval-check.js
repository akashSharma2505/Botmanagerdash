var builder = require("botbuilder");
var request = require("request");

module.exports = [
    (session, args, next) => {
        var channel = session.message.channel;
        var id = session.message.user.id;
        var db_url ='https://1dc8cf29.ngrok.io/databaserest/users_info/';
        request({
            url: db_url,
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
                var documents = body;
                documents.forEach(function (item) {
                    if (item.skype_id === id && item.approved === 'true') {
                        session.send(`Your request is approved , coming back with results.`);
                    } else {
                        session.endDialog(`Your request is not approved`);
                    }
                });
            }
        });
    }
];