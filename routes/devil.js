//////////////////////////////////////////////////
//
//  grouple - devil.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

// Module dependencies
var async = require('async');

// Model
var Hero = require('../lib/model').Hero;
var City = require('../lib/model').City;
var Monster = require('../lib/model').Monster;

// Library
var errorHandler = require('../lib/errorHandler');

exports.index = function (req, res) {
  async.waterfall([
    function (callback) {
      City.find({}, function (err, cities) {
        if (err) throw err;

        if ( !cities ) {
          errorHandler.sendErrorMessage('NO_CITIES_FOUND', res);
          return;
        }

        callback(null, cities);
        return;
      });
    },

    function (cities, callback) {
      Monster.find({}, function (err, monsters) {
        if (err) throw err;

        if ( !monsters ) {
          errorHandler.sendErrorMessage('NO_MONSTERS_FOUND', res);
          return;
        }

        callback(null, cities, monsters);
        return;
      });
    },

    function (cities, monsters, callback) {
      var result = {
        'result': 'success',
        'cities': cities,
        'monsters': monsters
      };

      callback(null, result);
      return;
    }
  ], function (err, result) {
    res.render('devil.index.html', result);
    return;
  });
};

exports.attack = function (req, res) {
  var attack = {
    'user': req.session.account_id,
    'city_id': req.body.city_id
  };

  console.log('attack:', attack);
  res.send(attack);
  return;
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