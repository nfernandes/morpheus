// development config
'use strict';
module.exports = {
    urls: {
        base: 'http://localhost:3000',
    },
    db: {
        url: {
            morpheus: process.env.morpheusdb || "mongodb://localhost/morpheus-dev"
        }
    },
    http: {
        port: process.env.PORT || 3000
    },
    email: {
        nodemailer: {
            host: 'email-smtp.us-east-1.amazonaws.com',
            auth: {
                user: 'AKIAJVZCJHKHDWKTJSLA',
                pass: 'AmAdmXxlZ9xgSEZL7Nq7mH3HPJlI4NScv0OiTno9WMko'
            }
        },
        defaultFrom: "email@gmail.com"
    },
    jwt: {
        secret: '91a2a6e376eb7788fd9047b203dc69996043e6916f35a6b4e77ba8b5be0763c1'
    },
    session: {
        secret: 'leosarethebest'
    },
    sms: {
        token: 'a18sov',
        defaultFromNumber: '+3160000000'
    }
}