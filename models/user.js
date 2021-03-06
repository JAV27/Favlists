const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    googleID: String,
    image: String,
    movies: [
        {
            movieId: Number
        }
    ]
});

const User = mongoose.model('user', userSchema);

module.exports = User;