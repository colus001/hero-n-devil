//////////////////////////////////////////////////
//
//  grouple - util.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

// Module dependencies
var async = require('async');

// Model
var Account = require('../lib/model').Account;
var Player = require('../lib/model').Player;


exports.index = function (req, res) {
  Player.findById(req.session.current_player_id, function (err, player) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'player': player
    };

    res.render('index.html', result);
    return;
  });
};