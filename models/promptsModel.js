const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  responseCount: { type: Number },
  input: { type: String },
  instruction: { type: String },
  temperature: { type: Number },
  imagesize: { type: String },
  response: [{ type: String }],
  timestamp: { type: Date, default: Date.now } // Agregar el campo timestamp con el valor por defecto Date.now
});

const promptSchema = new mongoose.Schema({
  name: { type: String },
  type: { type: String, enum: ['Edit', 'Images', 'Completitions'] },
  tags: [{type: String}],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema]
});

module.exports = mongoose.model('Prompts', promptSchema);
