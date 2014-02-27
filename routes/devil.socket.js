//////////////////////////////////////////////////
//
//  grouple - devil.socket.js
//
//  Purpose: Display devil
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
var Soldier = require('../lib/model').Soldier;
var Kingdom = require('../lib/model').Kingdom;

// Model Prototype
var ProtoCity = require('../lib/model').ProtoCity;
var ProtoDevil = require('../lib/model').ProtoDevil;
var ProtoMonster = require('../lib/model').ProtoMonster;
var ProtoPrincess = require('../lib/model').ProtoPrincess;

// Library
var errorHandler = require('../lib/errorHandler');
var common = require('../lib/common');

exports.connection =  function (err, socket, session) {
  if (err) throw err;

  socket.on('BattleBegin', function (data) {
    async.waterfall([
      function getPlayerAndDevil (callback) {
        common.getPlayerAndDevil(session.current_player_id, callback);
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
        City.findById(data.cityId, function (err, city) {
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
            callback(err);
            return;
          }

          callback(null, devil, city, defenders);
          return;
        });
      },

      function done (devil, city, defenders, callback) {
        var result = {
          'result': 'success',
          'devil': devil,
          'city': city,
          'defenders': defenders,
          'logs': []
        };

        async.each(defenders, function (defender, next) {
          var intervalTime = common.getIntervalFromAtackSpeed(defender.attack_speed_per_sec);
          defender.interval = setInterval(function () {
            var random = Math.floor(Math.random()*100+1) / 100;
            setTimeout(null, intervalTime*random);

            Soldier.findById(defender._id, function (err, soldier) {
              if (err) throw err;

              if ( !soldier || soldier.current_health_point <= 0 ) {
                clearInterval(defender.interval);
                return;
              }

              var logs = [];
              var conclusion = '';
              var result = { 'devil': devil, 'logs': logs };

              if ( devil.current_health_point <= 0 ) {
                conclusion = 'lose';
                clearInterval(defender.interval);
                return;
              }

              common.attackByTime(defender, devil, logs);
              common.updateDevil (devil, conclusion, result);
              socket.emit('defenderAttack', result);
              return;
            });
          }, intervalTime);

          next(null);
          return;
        }, function (err) {
          callback(null, result);
          return;
        });
      }
    ], function (err, result) {
      if (err) throw err;

      socket.emit('battleReady', result);
      return;
    });
  });

  socket.on('attackBegin', function (data) {
    async.waterfall([
      function getPlayerAndDevil (callback) {
        common.getPlayerAndDevil(session.current_player_id, callback);
      },

      function checkDevil (player, devil, callback) {
        if ( devil.current_health_point === 0 ) {
          callback('NOT_ENOUGH_HEALTH_POINT');
          return;
        }

        callback(null, player, devil);
        return;
      },

      function getSoldier (player, devil, callback) {
        Soldier.findById(data.defender_id, function (err, soldier) {
          if (err) throw err;

          if ( !soldier ) {
            callback('NO_SOLDIER_FOUND');
            return;
          }

          callback(null, devil, soldier);
          return;
        });
      },

      function updateDamage (devil, soldier, callback) {
        var logs = [];
        common.attackByTime(devil, soldier, logs);
        common.clearDeadObjects([ soldier ]);

        callback(null, devil, soldier, logs);
        return;
      },

      function checkCaptured (devil, soldier, logs, callback) {
        Soldier.find({ 'city_id': soldier.city_id }, function (err, soldiers) {
          if (err) throw err;

          var result = {
            'result': 'success',
            'soldier': soldier,
            'devil': devil,
            'logs': logs
          };

          if ( soldiers.length !== 0 ) {
            callback(null, result);
            return;
          }

          result.logs.push(devil.name + '이(가) 승리하였습니다. 도시를 손에 넣었습니다.');

          async.parallel([
            function (done) {
              common.updateDevil(devil, 'win', result, done);
            },

            function (done) {
              var update = {
                'updated_at': new Date(),
                'isCaptured': true
              };

              City.findByIdAndUpdate(soldier.city_id, update, function (err, city) {
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
            callback(null, result);
            return;
          });
        });
      },
    ], function (err, result) {
      if (err) {
        socket.emit('error', err);
        return;
      }

      socket.emit('attackDone', result);
      return;
    });
  });
};