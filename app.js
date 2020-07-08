const express = require('express');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const path = require('path');
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const cookieSession = require('cookie-session');
const passport = require('passport');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieSession({
    maxAge: 24*60*60*1000,
    keys: [keys.session.cookieKey]
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

//connect to mongo
mongoose.connect(keys.mongodb.dbURI, () => {
    console.log('test!');
});

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

app.get('/', (req, res) => {
    res.render('index', {
        user: req.user
    });
});

app.get('/movies', (req, res) => {
    res.render('movies', {
        user: req.user,
        movies: []
    })
});

app.post('/movies', (req, res) => {
    
    let search = encodeURI(req.body.search);
    axios.get('https://api.themoviedb.org/3/search/movie?api_key=ed07fde2a29e865fa73860b991476f93&query=' + search + '&page=1').then((data) => {
        
        res.render('movies', {
            user: req.user,
            movies: data.data.results
        });

    });
});

app.post('/movies/add', (req, res) => {
    let id = req.body.id;

    res.redirect('/movies');
});


app.listen(3000, () => {
    console.log("Server running at port 3000");
});