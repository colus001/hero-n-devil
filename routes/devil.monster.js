//////////////////////////////////////////////////
//
//  grouple - devil.game.js
//
//  Purpose: Game logic for devil
//  Created: 2014.02.11
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

// Model Prototype
var ProtoHero = require('../lib/model').ProtoHero;
var ProtoSoldier = require('../lib/model').ProtoSoldier;
var ProtoMonster = require('../lib/model').ProtoMonster;

// Library
var errorHandler = require('../lib/errorHandler');

exports.purchase = function (req, res) {
  async.waterfall([
    function getPlayer (callback) {
      Player.findById(req.session.current_player_id, function (err, player) {
        if (err) throw err;

        if ( !player ) {
          callback('NO_PLAYER_FOUND');
          return;
        }

        callback(null, player);
        return;
      });
    },

    function getDevil (player, callback) {
      Devil.findById(player.devil_id, function (err, devil) {
        if (err) throw err;

        if ( !devil ) {
          callback('NO_DEVIL_FOUND');
          return;
        }

        callback(null, devil, player);
        return;
      });
    },

    function getProtoMonster (devil, player, callback) {
      ProtoMonster.findById(req.body.monster_id, function (err, protomonster) {
        if (err) throw err;

        if ( !protomonster ) {
          callback('NO_MONSTER_PROTOTYPE_FOUND');
          return;
        }

        callback(null, devil, player, protomonster);
        return;
      });
    },

    function addToMonster (devil, player, protomonster, callback) {
      var monster = JSON.parse(JSON.stringify(protomonster));

      monster.player_id = player._id;
      monster.current_health_point = monster.health_point;

      delete monster.created_at;
      delete monster.updated_at;
      delete monster._id;

      Monster(monster).save(function (err, monster) {
        if (err) throw err;

        var result = {
          'result': 'success',
          'monster': monster
        };

        callback(null, result);
        return;
      });
    }
  ], function (err, result) {
    if (err) {
      errorHandler.sendErrorMessage(err, res);
      return;
    }

    res.send(result);
    return;
  });
};