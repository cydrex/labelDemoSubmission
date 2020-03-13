const mongoose = require('mongoose');
//mongoose.set('debug', true);
const database = new mongoose.Schema({
	id: String,
	approved: { type: Boolean, default: false },
	name: String,
	title: String,
	genre: String,
	link: String
});
module.exports = mongoose.model("detail", database);