const express = require('express');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const path = require('path');
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
const keys;
if(process.env.CALLBACK_URL) {
    keys = require('./config/keys');
}
const cookieSession = require('cookie-session');
const passport = require('passport');
const axios = require('axios');
const bodyParser = require('body-parser');
const User = require('./models/user');
const app = express();
const PORT = process.env.PORT || 3000;

const authCheck = (req, res, next) => {
    if(!req.user) {
        res.redirect('/auth/login');
    } else {
        next();
    }
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieSession({
    maxAge: 24*60*60*1000,
    keys: [process.env.COOKIE_KEY || keys.session.cookieKey]
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

//connect to mongo
mongoose.connect(process.env.DB_URI || keys.mongodb.dbURI, () => {
    console.log('test!');
});

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

app.get('/', (req, res) => {
    res.render('index', {
        user: req.user
    });
});

app.get('/movies', authCheck, (req, res) => {

    let userMovies = req.user.movies.map((e) => {
        return 'https://api.themoviedb.org/3/movie/' + e + '?api_key=ed07fde2a29e865fa73860b991476f93'
    }).map((e) => {
        return axios.get(e);
    });

    axios.all(userMovies).then(responseArr => {
        let newArr = responseArr.map((e) => {
            return {
                title: e.data.original_title,
                poster: e.data.poster_path
            }
        });

        res.render('movies', {
            user: req.user,
            movies: [],
            userMovies: newArr
        });
    });

});

//Search request
app.post('/movies', (req, res) => {
    
    let search = encodeURI(req.body.search);
    axios.get('https://api.themoviedb.org/3/search/movie?api_key=ed07fde2a29e865fa73860b991476f93&query=' + search + '&page=1').then((data) => {
        res.render('movies', {
            user: req.user,
            movies: data.data.results,
            userMovies: []
        });
    });
});


//Add movie button is clicked
app.post('/movies/add', (req, res) => {
    let id = req.body.id;
    let update = {
        $push: {
            movies: id
        }
    }

    User.findByIdAndUpdate(req.user.id, update, function(err, result) {
        if(err) {
            console.log(err);
            res.render('/movies', {
                error: "There was an error"
            });
        } else {
            console.log(result);
            res.redirect('/movies');
        }
    });

});

app.listen(PORT, () => {
    console.log("Server running at port 3000");
});