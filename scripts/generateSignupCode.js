const mongoose = require('mongoose'),
    uuid = require('uuid');
    SignupCode = require('../models/signupCode.js');

require('dotenv').config();

//database connection
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => {
    const code = new SignupCode({
        pin: uuid.v4()
    });

    code.save((err, result) => {
        if(err) {
            console.log(err);
            return;
        }
        console.log('Code generated! your register code is:', result.pin);
    });
});