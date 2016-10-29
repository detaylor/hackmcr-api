var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CaseSchema   = new Schema({
	reference: String,
	surname: String,
	forename: String,
	imageName: String,
	added: Date
});

module.exports = mongoose.model('Case', CaseSchema);
