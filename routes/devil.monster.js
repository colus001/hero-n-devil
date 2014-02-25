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
var common = require('../lib/common');


exports.train = function (req, res) {
  async.waterfall([
    function getPlayerAndDevil (callback) {
      common.getPlayerAndDevil(req.session.current_player_id, callback);
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

    function payTheCost (player, devil, protomonster, callback) {
      common.payMoneyAndAP(player, protomonster, devil, common.ACTION_POINT_TO_PAY, callback);
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
    function getPlayerAndDevil (callback) {
      common.getPlayerAndDevil(req.session.current_player_id, callback);
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
    function getPlayerAndDevil (callback) {
      common.getPlayerAndDevil(req.session.current_player_id, callback);
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

exports.intrude = function (req, res) {
  async.waterfall([
    function getPlayerAndDevil (callback) {
      common.getPlayerAndDevil(req.session.current_player_id, callback);
    },

    function getMonsters (player, devil, callback) {
      Monster.find({ 'player_id': player._id, 'ready': true }, function (err, monsters) {
        if (err) throw err;

        callback(null, player, devil, monsters);
        return;
      });
    },

    function getProtoHero (player, devil, monsters, callback) {
      var intruders = [];

      // THIS IS ONLY FOR THE TEST PURPOSE
      ProtoHero.find({ 'published': true }, function summonDefenders (err, protoheroes) {
        if (err) throw err;

        if ( protoheroes.length === 0 ) {
          callback('NO_PROTOHEROES_EXIST');
          return;
        }

        for ( var i = 0; i < Math.floor(Math.random()*4)+1; i++ ) {
          var random = Math.floor(Math.random()*protoheroes.length);
          var intruder = JSON.parse(JSON.stringify(protoheroes[random]));
          intruder.current_health_point = intruder.health_point;

          intruders.push(intruder);
        }

        console.log('intruders:', intruders.length);

        callback(null, player, devil, monsters, intruders);
        return;
      });
      // THIS IS ONLY FOR THE TEST PURPOSE
    },

    function battle (player, devil, monsters, intruders, callback) {
      var logs = [];

      var defenders = {
        '1f': [],
        '2f': [],
        '3f': [],
        '4f': [],
        '5f': [],
        '6f': []
      };

      for ( var i in monsters ) {
        var monster = monsters[i];

        if ( monster.floor !== 'waiting' && monster.floor !== undefined ) {
          defenders[monster.floor].push(monster);
        }
      }

      common.getIntrudeResult(intruders, defenders, devil, logs);

      callback(null, player, devil, defenders, intruders, logs);
      return;
    },

    function saveDevil (player, devil, defenders, intruders, logs, callback) {
      var healthPointToUpdate = ( devil.current_health_point > 0 ) ? devil.current_health_point : 0;
      var update = {
        $set: {
          'updated_at': new Date(),
          'current_health_point': healthPointToUpdate
        }
      };

      Devil.findByIdAndUpdate(devil._id, update, function (err, devil) {
        if (err) throw err;

        callback(null, player, devil, defenders, intruders, logs);
        return;
      });
    },

    function loseColonyWhenTheDevilIsDefeated (player, devil, defenders, intruders, logs, callback) {
      if ( devil.current_health_point > 0 ) {
        callback(null, player, devil, defenders, intruders, logs);
        return;
      }

      async.waterfall([
        function (next) {
          common.loseRandomColony(player, next);
        }
      ], function (err, result) {
        if (err) {
          errorHandler.sendErrorMessage(err, res);
          return;
        }

        callback(null, player, devil, defenders, intruders, logs);
        return;
      });
    },

    function finalResult (player, devil, defenders, intruders, logs, callback) {
      if ( defenders.length === 0 )
      console.log('defenders:', defenders);

      var result = {
        'result': 'success',
        'player': player,
        'devil': devil,
        'defenders': defenders,
        'intruders': intruders,
        'logs': logs
      };

      callback(null, result);
      return;
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