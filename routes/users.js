const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User Model
const User= require('../models/User')

// Login Page
router.get('/login', (req, res) => res.render('Login'));

// Register Page
router.get('/register', (req, res) => res.render('Register'));

// Register Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    // Check req fields
    if(!name || !email || !password || !password2){
        errors.push({ msg: 'Please fill in all fields' })
    }

    // Check Password
    if(password !== password2){
        errors.push({ msg:'Passwords do not match' });
    }

    // Check pass length
    if(password.length < 6){
        errors.push({ msg:'Password must consist 6 characters' });
    }

    if(errors.length > 0) {
        res.render('register', {
            errors, 
            name,
            email,
            password,
            password2
        });
    } else {
        // Validation Passed
        User.findOne({ email: email })
            .then(user => {
                if(user){
                    //if user exist
                    errors.push({ msg: 'Email Already Registered' });
                    res.render('register', {
                        errors, 
                        name,
                        email,
                        password,
                        password2
                    });  
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password,
                    });
                    
                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) => 
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) throw err;
                            // paswword set to hash
                            newUser.password = hash;
                            // Save User
                            newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'Welcome! Now you are a member and now you can login!');
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err))
                    }))
                }
            });
    } 
});

// Login Handle 
router.post('/Login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

// Dashboard(Home)
router.get('/dashboard', (req, res) => res.render('Dashboard'));

module.exports = router;