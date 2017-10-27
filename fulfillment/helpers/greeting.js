var builder = require("botbuilder");

module.exports = [
    (session, args, next) => {
        if (session.userData.first_name) {
           
            session.endDialog(`Hello ${session.userData.first_name}. :)`);
        } else {          
            console.log(session.message.address);
            session.endDialog(`Hello there . :)`);
        }
    }
];