const express = require('express');
const User = require('./../models/user');
const bcryptjs = require('bcryptjs');

const router = new express.Router();

router.get('/', (req, res, next) => {
  console.log(req.session);
  const message = req.session.user
    ? `Hello ${req.session.user.email}`
    : `Hello Stranger`;
  res.render('home', { title: message, message: message });
});

router.get('/register', (req, res, next) => {
  res.render('register');
});

router.post('/register', (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  bcryptjs
    .hash(password, 10) //returns a promise that resolves with
    //takes as argument the password
    //second argument is 'the salt' length

    .then((passwordHashAndSalt) => {
      console.log(passwordHashAndSalt);
      return User.create({
        email,
        passwordHashAndSalt
      }).then((user) => {
        req.session.user = user._id; // this gets stored in the database as a session.
        console.log('New user created: ', user);
        res.redirect('/register');
      });
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/log-in', (req, res, next) => {
  res.render('log-in');
});

router.post('/log-in', (req, res, next) => {
  const { email, password } = req.body;
  let user;
  User.findOne({ email })
    .then((document) => {
      user = document;
      if (!document) {
        throw new Error('ACCOUNT_NOT_FOUND');
      } else {
        return bcryptjs.compare(password, document.passwordHashAndSalt); // method to check if the provided value equals what we have
      }
    })
    .then((comparison) => {
      if (comparison) {
        console.log('User was authenticated');
        req.session.user = user._id;
        // instead of saving the entire user, we might want to limit the amount of information
        res.redirect('/');
      } else {
        throw new Error('WRONG_PASSWORD');
      }
    })
    .catch((error) => {
      next(error);
    });
});

//to destyroy a session req.session.destroy(); should erase the cookie from user
router.post('/log-out', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;

// salt: when a user registers for the first time, salt, a random String, is concatenated and the result is hashed.
//when we call compare, bcrypt know where the hash start and salt ends, it splits the string, concatenates the password and salt and compares with the provided values.

//express-sessino package adds a session document to the req object.
