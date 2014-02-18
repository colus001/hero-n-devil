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

        callback(null, player, devil);
        return;
      });
    },

    function checkMonsterLimit (player, devil, callback) {
      Monster.find({ 'player_id': player._id }, function (err, monsters) {
        if (err) throw err;

        if ( devil.monster_limit <= monsters.length - 1 ) {
          callback('MONSTER_LIMIT_EXCEEDED');
          return;
        }

        callback(null, player, devil);
        return;
      });
    },

    function getProtoMonster (player, devil, callback) {
      ProtoMonster.findById(req.body.monster_id, function (err, protomonster) {
        if (err) throw err;

        if ( !protomonster ) {
          callback('NO_MONSTER_PROTOTYPE_FOUND');
          return;
        }

        callback(null, player, devil, protomonster);
        return;
      });
    },

    function payMonsterTraining (player, devil, protomonster, callback) {
      var update = {
        $inc: {
          'money': -protomonster.price
        }
      };
      console.log('update:', update);

      if ( player.money < protomonster.price ) {
        callback('NOT_ENOUGH_MONEY');
        return;
      }

      Player.findByIdAndUpdate(player._id, update, function (err, player) {
        if (err) throw err;

        if ( !player ) {
          callback('NO_PLAYER_FOUND');
          return;
        }

        callback(null, player, devil, protomonster);
        return;
      });
    },

    function addToMonster (player, devil, protomonster, callback) {
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
          'player': player,
          'monster': monster
        };

        callback(null, result);
        return;
      });
    },
  ], function (err, result) {
    if (err) {
      errorHandler.sendErrorMessage(err, res);
      return;
    }

    res.send(result);
    return;
  });
};

exports.delete = function (req, res) {
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

        callback(null, player, devil);
        return;
      });
    },

    function removeMonster (player, devil, callback) {
      Monster.findOneAndRemove({ '_id': req.body.monster_id, 'player_id': player._id }, function (err, monster) {
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

exports.buildup = function (req, res) {
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

        callback(null, player, devil);
        return;
      });
    },

    function getMonster (player, devil, callback) {
      Monster.findOne({ '_id': req.body.monster_id, 'player_id': player._id }, function (err, monster) {
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

exports.position = function (req, res) {
  Monster.findByIdAndUpdate(req.body.monster_id, { 'floor': req.body.floor }, function (err, monster) {
    if (err) throw err;

    if ( !monster ) {
      errorHandler.sendErrorMessage('NO_MONSTER_FOUND', res);
      return;
    }

    var result = {
      'result': 'success',
      'monster': monster
    };

    res.send(result);
    return;
  });
};
