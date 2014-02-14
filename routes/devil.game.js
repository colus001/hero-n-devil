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

// Library
var errorHandler = require('../lib/errorHandler');

exports.status = function (req, res) {
  async.waterfall([
    function getPlayer (callback) {
      Player.findById(req.session.current_player_id, function (err, player) {
        if (err) throw err;

        if ( !player ) {
          errorHandler.sendErrorMessage('NO_PLAYER_FOUND', res);
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
          errorHandler.sendErrorMessage('NO_DEVIL_FOUND', res);
          return;
        }

        callback(null, devil, player);
        return;
      });
    },

    function checkTimeGap (devil, player, callback) {
      var timeGap = Math.floor(( new Date() - devil.updated_at ) / 1000);

      if ( timeGap < 10 ) {
        console.log('timeGap:', timeGap);
        errorHandler.sendErrorMessage('SHOULD_WAIT_MORE', res);
        return;
      }

      var multiplier = Math.floor(timeGap/10);
      callback(null, devil, player, multiplier);
      return;
    },

    function recoverPoints (devil, player, multiplier, callback) {
      var healthPointToUpdate = ( ( multiplier * 10 ) + devil.current_health_point > devil.health_point ) ? devil.health_point-devil.current_health_point : multiplier * 10;
      var actionPointToUpdate = ( ( multiplier * 1 ) + devil.current_action_point > devil.action_point ) ? devil.action_point-devil.current_action_point : multiplier * 1;

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

        callback(null, devil);
      });
    }
  ], function (err, result) {
    result = {
      'result': 'success',
      'devil': result
    };

    res.send(result);
    return;
  });
};

exports.attack = function (req, res) {
  var logs = [];

  // player & devil -> city -> heros -> battle
  async.waterfall([
    function getPlayer (callback) {
      Player.findById(req.session.current_player_id, function (err, player) {
        if (err) throw err;

        if ( !player ) {
          errorHandler.sendErrorMessage('NO_PLAYER_FOUND', res);
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
          errorHandler.sendErrorMessage('NO_DEVIL_FOUND', res);
          return;
        }

        callback(null, devil, player);
        return;
      });
    },

    function getCity (devil, player, callback) {
      City.findById(req.body.city_id, function (err, city) {
        if (err) throw err;

        if ( !city ) {
          errorHandler.sendErrorMessage('NO_CITY_FOUND', res);
          return;
        }

        callback(null, devil, player, city);
        return;
      });
    },

    function getDefenders (devil, player, city, callback) {
      if ( city.defenders.length > 0 ) {
        callback(null, devil, city);
        return;
      }

      ProtoHero.find({}, function summonDefenders (err, heros) {
        if (err) throw err;

        if ( !heros ) {
          errorHandler.sendErrorMessage('NO_HEROS_EXIST', res);
          return;
        }

        var defenders = [];

        for ( var i = 0; i < city.soldiers; i++ ) {
          var random = Math.floor(Math.random()*heros.length);
          var hero = JSON.parse(JSON.stringify(heros[random]));
          hero.current_health_point = hero.health_point;
          defenders.push(hero);
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
        for ( var i in city.defenders ) {
          devil.current_health_point -= getDamage(city.defenders[i], devil);
          logs.push(city.defenders[i].name + '이(가) ' + devil.name + '을(를) 공격하여 ' + getDamage(city.defenders[i], devil) + '의 데미지를 입혔습니다.');
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

        function saveCity (done) {
          var update = {
            'updated_at': new Date(),
            'defenders': city.defenders
          };

          if ( city.defenders.length === 0 ) {
            update.isColony = true;
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
    if (err) throw err;

    res.send(result);
    return;
  });
};

var getDamage = function (attack, defense) {
  var phy_damage = attack.physical_damage - defense.armor;
  var mag_damage = attack.magic_damage - defense.magic_resist;

  return phy_damage + mag_damage;
};