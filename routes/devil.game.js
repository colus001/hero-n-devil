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


exports.attack = function (req, res) {
  // var attack = {
  //   'account_id': req.session.account_id,
  //   'city_id': req.body.city_id
  // };
  var logs = [];

  // player & devil -> city -> heros -> battle
  async.waterfall([
    function getPlayer (callback) {
      Player.findByIdAndUpdate(req.session.current_player_id, { 'updated_at': new Date() }, function (err, player) {
        if (err) throw err;

        if ( !player ) {
          errorHandler.sendErrorMessage('NO_PLAYER_FOUND');
          return;
        }

        callback(null, player);
        return;
      });
    },

    function getDevil (player, callback) {
      Devil.findByIdAndUpdate(player.devil_id, { 'updated_at': new Date() }, function (err, devil) {
        if (err) throw err;

        if ( !devil ) {
          errorHandler.sendErrorMessage('NO_DEVIL_FOUND');
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

        City.findByIdAndUpdate(city._id, { 'defenders': defenders }, function (err, city) {
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

      // HERO ATTACK
      if ( city.defenders[0].length > 1 || defender.current_health_point > 0 ) {
        devil.current_health_point -= getDamage(defender, devil);
      } else {
        city.defenders.splice(0, 1);
      }

      callback(null, devil, city);
      return;
    },

    function finish (devil, city, callback) {
      city = JSON.parse(JSON.stringify(city));

      var result = {
        'result': 'success'
      };

      async.parallel([
        function (done) {
          Devil.findByIdAndUpdate(devil._id, { 'current_health_point': devil.current_health_point }, function (err, devil) {
            if (err) throw err;

            result.devil = devil;
            done(null);
            return;
          });
        },

        function (done) {
          City.findByIdAndUpdate(city._id, { 'defenders': city.defenders }, function (err, city) {
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