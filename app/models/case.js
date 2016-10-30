var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CaseSchema   = new Schema({
	reference: String,
	surname: String,
	forename: String,
	gender: String,
	birthYear: String,
	status: String,
	category: String,
	accomodation: String,
	borough: String,
	area: String,
	xCord: String,
	yCord: String,
	dateMissing: String,
	recordCreated: String,
	imageName: String,
	added: Date
});

module.exports = mongoose.model('Case', CaseSchema);
