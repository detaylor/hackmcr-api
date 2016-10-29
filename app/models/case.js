var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CaseSchema   = new Schema({
	reference: String,
	surname: String,
	forename: String
});

module.exports = mongoose.model('Case', CaseSchema);
