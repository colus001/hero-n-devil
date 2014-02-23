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

// Library
var errorHandler = require('../lib/errorHandler');
var common = require('../lib/common');


exports.status = function (req, res) {
  async.waterfall([
    function getPlayerAndDevil (callback) {
      common.getPlayerAndDevil(req.session.current_player_id, callback);
    },

    function getMonsters (player, devil, callback) {
      Monster.find({ 'player_id': player._id }, function (err, monsters) {
        if (err) throw err;

        callback(null, player, devil, monsters);
        return;
      });
    },

    function updateStatus (player, devil, monsters, callback) {
      var result = {
        'result': 'success',
        'monsters': []
      };

      async.parallel([
        function DEVIL (done) {
          common.recoverDevil(devil, result, done);
        },
        function MONSTER (done) {
          common.recoverMonsters(monsters, result, done);
        }
      ], function (err) {
        if (err) {
          errorHandler.sendErrorMessage(err, res);
          return;
        }

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

exports.collect = function (req, res) {
  async.waterfall([
    function getPlayerAndDevil (callback) {
      common.getPlayerAndDevil(req.session.current_player_id, callback);
    },

    function getColonies (player, devil, callback) {
      City.findById(req.body.colony_id, function (err, colony) {
        if (err) throw err;

        if ( !colony ) {
          callback('NO_COLONY_FOUND');
          return;
        }

        if ( !colony.isCaptured ) {
          callback('NOT_CAPTURED');
          return;
        }

        var timeGap = Math.floor(( new Date() - colony.updated_at ) / 1000);
        console.log('timeGap:', timeGap);
        if ( timeGap < colony.time_to_collect ) {
          callback('SHOULD_WAIT_MORE');
          return;
        }

        callback(null, player, devil, colony);
        return;
      });
    },

    function collect (player, devil, colony, callback) {
      async.parallel([
        function updatePlayer (done) {
          var update = {
            $set: {
              'updated_at': new Date()
            },
            $inc: {
              'money': colony.population *  ( colony.economy_level * 0.5 )
            }
          };

          Player.findByIdAndUpdate(player._id, update, function (err, player) {
            if (err) throw err;

            if ( !player ) {
              callback('NO_PLAYER_FOUND');
              return;
            }

            done(null);
            return;
          });
        },

        function updateColony (done) {
          City.findByIdAndUpdate(colony._id, { 'updated_at': new Date() }, function (err, city) {
            if (err) throw err;

            if ( !city ) {
              callback('NO_CITY_FOUND');
              return;
            }

            done(null);
            return;
          });
        },

        function updateDevil (done) {
          Devil.findByIdAndUpdate(devil._id, { $inc: { 'current_action_point': -1 } }, function (err, devil) {
            if (err) throw err;

            if ( !devil ) {
              callback('NO_DEVIL_FOUND');
              return;
            }

            done(null);
            return;
          });
        }
      ], function (err) {
        if (err) throw err;

        var result = {
          'result': 'success',
          'player': player,
          'colony': colony
        };

        callback(null, result);
        return;
      });
    }
  ], function (err, result) {
    if (err) {
      console.log('error: ', err);
      errorHandler.sendErrorMessage(err, res);
      return;
    }

    res.send(result);
    return;
  });
};

exports.levelUp = function (req, res) {
  async.waterfall([
    function checkReqeust (callback) {
      var totalPoint = 0;

      for ( var i in req.body ) {
        totalPoint += req.body[i];
      }

      if ( totalPoint > 3 ) {
        callback('POINT_EXCEEDED_TO_LEVEL_UP');
        return;
      }
    },

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

        callback(null, devil);
        return;
      });
    },

    function updateLevelUp (devil, callback) {
      var update;

      for ( var i in req.body ) {
        update[i] = devil[i] * 1.1;
      }

      if ( update.health_point ) {
        update.current_health_point = update.health_point;
      }

      Devil.findByIdAndUpdate(player.devil_id, update, function (err, devil) {
        if (err) throw err;

        if ( !devil ) {
          callback('NO_DEVIL_FOUND');
          return;
        }

        var result = {
          'result': 'success',
          'devil': devil
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

    res.redirect('/devil');
    return;
  });
};

exports.battle = function (req, res) {
  var logs = [];
  console.log('started');

  async.waterfall([
    function getPlayerAndDevil (callback) {
      common.getPlayerAndDevil(req.session.current_player_id, callback);
    },

    function checkDevil (player, devil, callback) {
      if ( devil.current_health_point === 0 ) {
        callback('NOT_ENOUGH_HEALTH_POINT');
        return;
      }

      if ( devil.current_action_point === 0 ) {
        callback('NOT_ENOUGH_ACTION_POINT');
        return;
      }

      callback(null, player, devil);
      return;
    },

    function getCity (player, devil, callback) {
      City.findById(req.body.city_id, function (err, city) {
        if (err) throw err;

        if ( !city ) {
          callback('NO_CITY_FOUND');
          return;
        }

        callback(null, player, devil, city);
        return;
      });
    },

    function prepareForBattle (player, devil, city, callback) {
      async.waterfall([
        function waiting (next) {
          common.getDefenders(city, next);
        }
      ], function (err, defenders) {
        if (err) {
          errorHandler.sendErrorMessage(err, res);
          return;
        }

        callback(null, devil, city, defenders);
        return;
      });
    },

    function startBattle (devil, city, defenders, callback) {
      common.getBattleResult([ devil ], defenders, logs);
      common.clearDeadObjects(defenders);

      callback(null, devil, city, defenders);
      return;
    },

    function finish (devil, city, defenders, callback) {

      city = JSON.parse(JSON.stringify(city));
      var result = {
        'result': 'success',
        'logs': logs
      };

      if ( devil.current_health_point <= 0 ) {
        result.conclusion = 'win';
      } else if ( defenders.length === 0 ) {
        result.conclusion = 'lose';
      }

      async.parallel([
        function updateDevil (done) {
          var healthPointToUpdate = ( devil.current_health_point > 0 ) ? devil.current_health_point : 0;

          var update = {
            $set: {
              'updated_at': new Date(),
              'current_health_point': healthPointToUpdate
            },
            $inc: {

            }
          };

          if ( result.conclusion ) {
            update.$inc['current_action_point'] = -1;
          }

          console.log('update:', update);

          Devil.findByIdAndUpdate(devil._id, update, function (err, devil) {
            if (err) throw err;

            result.devil = devil;
            done(null);
            return;
          });
        },

        function updateCity (done) {
          var update = {
            'updated_at': new Date()
          };

          if ( defenders.length === 0 ) {
            update.isCaptured = true;
          }

          City.findByIdAndUpdate(city._id, update, function (err, city) {
            if (err) throw err;

            result.city = city;
            done(null);
            return;
          });
        }
      ], function (err) {
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