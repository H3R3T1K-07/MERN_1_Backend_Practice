const mongoose = require('mongoose')
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
	name: {
		type: string,
		required: true
	},
	email: {
		type: string,
		required: true
	},
	password: {
		type: string,
		required: true
	},
	avatar: {
		type: string,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	}
}):

module.exports = User = mongoose.model('users', UserSchema);