const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const code = new Schema({
  userid: { type: String},
  code: { type: String},
  date:{type:Date}
});


module.exports = mongoose.model('Code', code);