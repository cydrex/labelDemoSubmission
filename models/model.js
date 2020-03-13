const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let detail = new Schema({
	mokkiId: Number,
	mokinNimi: String,
	mokinPintaAla: Number,
	henkilomaara: Number,
	makuuhuoneita: Number,
	sankyjenMaara: Number,
    osoite: String,
    koordinaatit: String,
    mokinVarusteet: String,
    mokinKuvaus: String,
    mokinKuvat: String
});

module.exports = mongoose.model("detail", detail);