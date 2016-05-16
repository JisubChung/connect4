var mongoose = require('mongoose');

// TODO: Find out the fields we need....dont get all fields from database

var gameSchema = new mongoose.Schema({
  created: Date,
  content: String,
  username: String,
  room: String
});

var Game = mongoose.model('game', gameSchema);

module.exports = Game;