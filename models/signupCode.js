const mongoose = require('mongoose');
//mongoose.set('debug', true);
const signupCode = new mongoose.Schema({
    pin: String,
    used: { type: Boolean, default: false }
});
module.exports = mongoose.model("SignupCode", signupCode);