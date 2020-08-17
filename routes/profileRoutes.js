const router = require('express').Router();
const axios = require('axios');

const authCheck = (req, res, next) => {
    if(!req.user) {
        res.redirect('/');
    } else {
        next();
    }
}

router.get('/', authCheck, (req, res) => {

    let amount = (req.user.movies.length > 4) ? 4 : req.user.movies.length;

    let userMovies = [];
    for(let i=0;i<amount;i++) {
        userMovies.push('https://api.themoviedb.org/3/movie/' + req.user.movies[i].movieId + '?api_key=ed07fde2a29e865fa73860b991476f93')
    }
    
    let fullData = [];

    for(let i=0;i<amount;i++) {
        fullData.push(axios.get(userMovies[i]));
    }

    axios.all(fullData).then(responseArr => {
        let newArr = responseArr.map((e) => {
            return {
                title: e.data.original_title,
                poster: e.data.poster_path,
                id: e.data.id
            }
        });
        res.render('profile', {
            user: req.user,
            movies: newArr
        });
    });

    
});

module.exports = router;