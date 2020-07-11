const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
let keys = {};
if(!process.env.CALLBACK_URL) {
    keys = require('./keys');
}
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
        callbackURL: process.env.CALLBACK_URL || '/auth/google/redirect',
        clientID: process.env.CLIENT_ID || keys.google.clientID,
        clientSecret: process.env.CLIENT_SECRET || keys.google.clientSecret,
        proxy: true
    }, (accessToken, refreshToken, profile, done) => {
        console.log("HERE");
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