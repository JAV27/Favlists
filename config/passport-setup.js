const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const keys = require('./keys');
const User = require('../models/user');
const mongoose = require('mongoose');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy({
        callbackURL: '/auth/google/redirect',
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    }, (accessToken, refreshToken, profile, done) => {

        User.findOne({googleID: profile.id}).then((currentUser) => {
            if(currentUser) {
                console.log("User is: " + currentUser);
                done(null, currentUser);
            } else {
                new User({
                    username: profile.displayName,
                    googleID: profile.id
                }).save().then((newUser) => {
                    console.log("New User: " + newUser);
                    done(null, newUser);
                }); 
            }
        })    
    })
);