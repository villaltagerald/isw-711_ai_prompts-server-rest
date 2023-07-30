const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const permission = new mongoose.Schema({
  permission: { type: [String]},
  idPermission: { type: String}
}, { _id: false });

const user = new Schema({
  first_name: { type: String },
  last_name: { type: String },
  password: { type: String },
  email: { type: String },
  varified: { type: Boolean },
  permission: { type: [permission], default: [{ idPermission: "prompts", permission: ['create', 'edit', 'read', 'delete'] }] }
});

module.exports = mongoose.model('User', user);