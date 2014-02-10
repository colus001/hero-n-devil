//////////////////////////////////////////////////
//
//  grouple - player.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

// Module dependencies
var async = require('async');

// Model
var Hero = require('../lib/model').Hero;
var Devil = require('../lib/model').Devil;
var City = require('../lib/model').City;
var Player = require('../lib/model').Player;
var Monster = require('../lib/model').Monster;
var Account = require('../lib/model').Account;

// Library
var errorHandler = require('../lib/errorHandler');

exports.index = function (req, res) {
  var option = {
    sort: { created_at: 1 }
  };

  Player.find({ 'account_id': req.session.account_id }, null, option, function (err, players) {
    if (err) throw err;

    if ( players.length === 0 ) {
      res.redirect('/player/create');
      return;
    }

    var result = {
      'result': 'success',
      'players': players
    };

    res.render('player.index.html', result);
    return;
  });
};

exports.create = function (req, res) {
  res.render('player.create.html');
  return;
};

exports.createPlayer = function (req, res) {
  var player = {
    'name': req.body.name,
    'account_id': req.session.account_id
  };

  async.waterfall([
    function checkPlayerCreationLimit (callback) {
      Player.find({ account_id: req.session.account_id }, function (err, players) {
        if (err) throw err;
        console.log('players_length:', players.length);

        if ( players.length > 2 ) {
          errorHandler.sendErrorMessage('NO_MORE_PLAYER_TO_CREATE', res);
          return;
        }

        callback(null);
        return;
      });
    },

    function savePlayer (callback) {
      Player(player).save(function (err, player) {
        if (err) throw err;

        req.session.current_player_id = player._id;
        callback(null, player);
        return;
      });
    }
  ], function (err, result) {
    res.redirect('/player');
    return;
  });
};

exports.select = function (req, res) {
  Player.findById(req.params.id, function (err, player) {
    if (err) throw err;

    if ( !player ) {
      errorHandler.sendErrorMessage('NO_PLAYER_FOUND', res);
      return;
    }

    req.session.current_player_id = player._id;
    res.redirect('/');
    return;
  });
};