const mongoose = require('mongoose');

const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please tell us your name !'] },
  email: {
    type: String,
    required: [true, 'Please tell us your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email ']
  },
  photo: { type: String },
  password: { type: String, required: true, minlength: 8 },
  passwordConfirm: { type: String, required: true, minlength: 8 }
});

//Modal variables always with a capital letter
const User = mongoose.Model('User', userSchema);
module.exports = User;
