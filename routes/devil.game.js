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

// Constant
var SECONDS_FOR_A_TURN = 30;

exports.status = function (req, res) {
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

    function getDevil (player, devil, callback) {
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
          recoverDevil(devil, result, done);
        },
        function MONSTER (done) {
          recoverMonsters(monsters, result, done);
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

    if ( result.devil ) {
      console.log('result.devil:', result.devil);
    }

    res.send(result);
    return;
  });
};

exports.collect = function (req, res) {
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

exports.attack = function (req, res) {
  var logs = [];
  console.log('started');

  // player & devil -> city -> heros -> battle
  async.waterfall([
    function getPlayer (callback) {
      Player.findById(req.session.current_player_id, function (err, player) {
        if (err) throw err;

        if ( !player ) {
          callback('NO_PLAYER_FOUND', res);
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
      });
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

    function getDefenders (player, devil, city, callback) {
      if ( city.defenders.length > 0 ) {
        callback(null, devil, city);
        return;
      }

      ProtoSoldier.find({ 'published': true }, function summonDefenders (err, soldiers) {
        if (err) throw err;

        if ( soldiers.length === 0 ) {
          callback('NO_SOLDIERS_EXIST');
          return;
        }

        var defenders = [];

        for ( var i = 0; i < city.soldiers; i++ ) {
          var random = Math.floor(Math.random()*soldiers.length);
          var soldier = JSON.parse(JSON.stringify(soldiers[random]));
          soldier.current_health_point = soldier.health_point;
          defenders.push(soldier);
        }

        City.findByIdAndUpdate(city._id, { 'updated_at': new Date(), 'defenders': defenders }, function (err, city) {
          if (err) throw err;

          callback(null, devil, city);
          return;
        });
      });
    },

    function startBattle (devil, city, callback) {
      city = JSON.parse(JSON.stringify(city));

      // RECOVER CITY DEFENDERS
      var timeGap = Math.floor(( new Date() - city.updated_at ) / 1000);
      console.log('city:', city);
      if ( timeGap > SECONDS_FOR_A_TURN ) {
        for ( var i in city.defenders ) {
          city.defenders[i].current_health_point += 10 * Math.floor(timeGap/SECONDS_FOR_A_TURN);

          if ( city.defenders[i].current_health_point > city.defenders[i].health_point ) {
            city.defenders[i].current_health_point = city.defenders[i].health_point;
          }
          console.log(city.defenders[i], 'Recovered');
        }
      }

      console.log('city.defenders:', city.defenders);

      var defender = city.defenders[0];

      // DEVIL ATTACK
      defender.current_health_point -= getDamage(devil, defender);
      logs.push(devil.name + '이(가) ' + defender.name + '을(를) 공격하여 ' + getDamage(devil, defender) + '의 데미지를 입혔습니다.');

      // CHECK DEFENDER
      if ( defender.current_health_point <= 0 ) {
        logs.push(devil.name + '이(가) ' + defender.name + '을(를) 무찔렀습니다.');
        city.defenders.splice(0, 1);
      }

      // DEFENDERS ATTACK
      if ( city.defenders.length !== 0 ) {
        for ( var j in city.defenders ) {
          devil.current_health_point -= getDamage(city.defenders[j], devil);
          logs.push(city.defenders[j].name + '이(가) ' + devil.name + '을(를) 공격하여 ' + getDamage(city.defenders[j], devil) + '의 데미지를 입혔습니다.');
        }
      }

      // CHECK DEVIL
      if ( devil.current_health_point <= 0 ) {
        logs.push(defender.name + '이(가) ' + devil.name + '을(를) 무찔렀습니다.');
      }

      callback(null, devil, city);
      return;
    },

    function finish (devil, city, callback) {
      city = JSON.parse(JSON.stringify(city));
      var result = {
        'result': 'success',
        'logs': logs
      };

      if ( devil.current_health_point <= 0 ) {
        result.conclusion = 'win';
      } else if ( city.defenders.length === 0 ) {
        result.conclusion = 'lose';
      }

      async.parallel([
        function saveDevil (done) {
          var healthPointToUpdate = ( devil.current_health_point > 0 ) ? devil.current_health_point : 0;
          var update = {
            $set: {
              'updated_at': new Date(),
              'current_health_point': healthPointToUpdate
            }
          };

          if ( result.conclusion ) {
            update.$inc = { 'current_action_point': -1 };
          }

          Devil.findByIdAndUpdate(devil._id, update, function (err, devil) {
            if (err) throw err;

            result.devil = devil;
            done(null);
            return;
          });
        },

        function updateCity (done) {
          var update = {
            'updated_at': new Date(),
            'defenders': city.defenders
          };

          if ( city.defenders.length === 0 ) {
            update.isCaptured = true;
          }

          City.findByIdAndUpdate(city._id, update, function (err, city) {
            if (err) throw err;

            result.city = city;
            done(null);
            return;
          });
        },
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

var getTimeGap = function (object) {
  var timeGap = Math.floor(( new Date() - object.updated_at ) / 1000);
  var multiplier = Math.floor(timeGap/SECONDS_FOR_A_TURN);

  return multiplier;
};

var recoverDevil = function (devil, result, done) {
  var multiplier = getTimeGap(devil);

  if ( multiplier <= 0 ) {
    done('SHOULD_WAIT_MORE');
    return;
  }

  var healthPointToUpdate = getPointToUpdate(multiplier * 10, devil.current_health_point, devil.health_point);
  var actionPointToUpdate = getPointToUpdate(multiplier * 1, devil.current_action_point, devil.action_point);

  console.log('devil:', devil);

  var update = {
    $set: {
      'updated_at': new Date()
    },
    $inc: {
      'current_health_point': healthPointToUpdate,
      'current_action_point': actionPointToUpdate
    }
  };

  console.log('update:', update);

  Devil.findByIdAndUpdate(devil._id, update, function (err, devil) {
    if (err) throw err;

    console.log('devil:', devil);

    result.devil = devil;
    done(null);
    return;
  });
};

var recoverMonsters = function (monsters, result, done) {
  async.map(monsters, function (monster, next) {
    var multiplier = getTimeGap(monster);

    if ( multiplier <= 0 ) {
      next(null);
      return;
    }

    var healthPointToUpdate = getPointToUpdate(multiplier * 10, monster.current_health_point, monster.health_point);

    var update = {
      $set: {
        'updated_at': new Date()
      },
      $inc: {
        'current_health_point': healthPointToUpdate
      }
    };

    Monster.findByIdAndUpdate(monster._id, update, function (err, monster) {
      if (err) throw err;

      result.monsters.push(monster);
      next(null, monster);
      return;
    });
  }, function (err) {
    done(null);
    return;
  });
};

var getPointToUpdate = function (pointToUpdate, currentPoint, maximumPoint) {
  if ( pointToUpdate + currentPoint > maximumPoint ) {
    pointToUpdate =  maximumPoint - currentPoint;
  }

  return pointToUpdate;
};

var getDamage = function (attack, defense) {
  var phy_damage = attack.physical_damage - defense.armor;
  var mag_damage = attack.magic_damage - defense.magic_resist;
  var totalDamage = phy_damage + mag_damage;

  return ( totalDamage > 0 ) ? totalDamage : 10;
};