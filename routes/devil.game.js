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

// Library
var errorHandler = require('../lib/errorHandler');


exports.attack = function (req, res) {
  // var attack = {
  //   'account_id': req.session.account_id,
  //   'city_id': req.body.city_id
  // };

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

    function getCity (player, callback) {
      City.findById(req.body.city_id, function (err, city) {
        if (err) throw err;

        if ( !city ) {
          errorHandler.sendErrorMessage('NO_CITY_FOUND', res);
          return;
        }

        callback(null, player, city);
        return;
      });
    },

    function getDefenders (player, city, callback) {
      Hero.find({}, function (err, heroes) {
        if (err) throw err;

        if ( !heroes ) {
          errorHandler.sendErrorMessage('NO_HEROES_EXIST', res);
          return;
        }

        var defenders = [];

        for ( var i = 0; i < city.soldiers; i++ ) {
          var random = Math.floor(Math.random()*heroes.length);
          defenders.push(heroes[random]);
        }

        callback(null, player, city, defenders);
        return;
      });
    },

    function startBattle (player, city, defenders, callback) {
      var log;

      var devil = player.evil.devil;

      // devil attack
      // defender attack
      //

    }
  ], function (err, result) {

  });
};

var battle = function (target) {
  isBattleOnGoing = true;

  $log.html();
  var turn = 0;

  var battleInterval;

  var devilAttack = function () {
    var phy_damage = devil.physical_damage - hero.armor;
    var mag_damage = devil.magic_damage - hero.magic_resist;
    var total_damage = phy_damage + mag_damage;
    hero.health_point -= total_damage;

    logger('마왕이 용사를 공격합니다.');
    logger('마왕이 용사에게 ' + total_damage + '의 데미지를 입혔습니다.');
  };

  var heroAttack = function () {
    var phy_damage = hero.physical_damage - devil.armor;
    var mag_damage = hero.magic_damage - devil.magic_resist;
    var total_damage = phy_damage + mag_damage;
    devil.health_point -= total_damage;

    logger('용사가 마왕을 공격합니다.');
    logger('용사가 마왕에게 ' + total_damage + '의 데미지를 입혔습니다.');
  };

  var logger = function (logMessage) {
    turn++;
    var $message = $('<p></p>');
    $message.text(turn+': '+logMessage);
    $log.append($message);
  };

  var logHeatlhPoint = function () {
    logger('마왕 HP: ' + devil.health_point + ' 용사 HP: ' + hero.health_point);
    return;
  };

  var battleLoop = function () {
    logger('턴');

    devilAttack();
    logHeatlhPoint();

    if ( hero.health_point <= 0 ) {
      logger('마왕이 승리하였습니다.');

      clearInterval(battleInterval);
      isBattleOnGoing = false;
      targetCity = $('[data-id='+target+"]");
      targetCity.find('.panel-collapse').removeClass('in');
      targetCity.appendTo('#colonies');
      return;
    }

    heroAttack();
    logHeatlhPoint();

    if ( devil.health_point <= 0 ) {
      logger('용사가 승리하였습니다.');

      clearInterval(battleInterval);
      isBattleOnGoing = false;
      return;
    }
  };

  logger('배틀 시작!');

  battleInterval = setInterval(battleLoop, 1000);
};