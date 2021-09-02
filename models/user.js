const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  passwordHashAndSalt: {
    type: String, //we should never set a password in plain text, we should save it with a robust hashing encryption. We store the result after hashing.
    required: true
  }
});

module.exports = mongoose.model('User', userSchema);

// a hashing function must always be deterministic, every time we get a value from the user it should output the same value. The next time the user logs in, we get the input, hash it again and compare the new hash we the hash we have stored in the database. With this comparison we see if its the correct password or not.
