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

var getBattleResult = common.getBattleResult;
var getIntrudeResult = common.getIntrudeResult;
var getPointToUpdate = common.getPointToUpdate;
var getDamage = common.getDamage;

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
      if ( player.money < protomonster.price ) {
        callback('NOT_ENOUGH_MONEY');
        return;
      }

      if ( devil.current_action_point < 1 ) {
        callback('NOT_ENOUGH_ACTION_POINT');
        return;
      }

      async.parallel([
        function payActionPoint (done) {
          Devil.findByIdAndUpdate(devil._id, { $inc: { 'current_action_point': -1 } }, function (err, devil) {
            if (err) throw err;

            if ( !devil ) {
              done('NO_DEVIL_FOUND');
              return;
            }

            done(null);
            return;
          });
        },

        function payMoney (done) {
          var update = {
            $inc: {
              'money': -protomonster.price
            }
          };

          Player.findByIdAndUpdate(player._id, update, function (err, player) {
            if (err) throw err;

            if ( !player ) {
              done('NO_PLAYER_FOUND');
              return;
            }

            done(null);
            return;
          });
        }
      ], function (err, result) {
        if (err) {
          callback(err);
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

exports.intrude = function (req, res) {
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

    function getMonsters (player, devil, callback) {
      Monster.find({ 'player_id': player._id }, function (err, monsters) {
        if (err) throw err;

        callback(null, player, devil, monsters);
        return;
      });
    },

    function getProtoHero (player, devil, monsters, callback) {
      // THIS IS ONLY FOR THE TEST PURPOSE
      ProtoHero.find({ 'published': true }, function summonDefenders (err, protoheroes) {
        if (err) throw err;

        if ( protoheroes.length === 0 ) {
          callback('NO_PROTOHEROES_EXIST');
          return;
        }

        var random = Math.floor(Math.random()*protoheroes.length);
        var intruder = JSON.parse(JSON.stringify(protoheroes[random]));
        intruder.current_health_point = intruder.health_point;

        if ( !intruder ) {
          callback('FAILED_TO_MAKE_INTRUDER');
          return;
        }

        callback(null, player, devil, monsters, intruder);
        return;
      });
      // THIS IS ONLY FOR THE TEST PURPOSE
    },

    function battle (player, devil, monsters, intruder, callback) {
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

      getIntrudeResult([ intruder ], defenders, devil, logs);

      callback(null, player, devil, defenders, intruder, logs);
      return;
    },

    function saveDevil (player, devil, defenders, intruder, logs, callback) {
      var healthPointToUpdate = ( devil.current_health_point > 0 ) ? devil.current_health_point : 0;
      var update = {
        $set: {
          'updated_at': new Date(),
          'current_health_point': healthPointToUpdate
        }
      };

      Devil.findByIdAndUpdate(devil._id, update, function (err, devil) {
        if (err) throw err;


        callback(null, player, devil, defenders, intruder, logs);
        return;
      });
    },

    function testResult (player, devil, defenders, intruder, logs, callback) {
      console.log('defenders:', defenders);

      var result = {
        'result': 'success',
        'player': player,
        'devil': devil,
        'defenders': defenders,
        'intruder': intruder,
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