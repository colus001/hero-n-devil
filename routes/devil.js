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
var Devil = require('../lib/model').Devil;
var City = require('../lib/model').City;
var Player = require('../lib/model').Player;
var Monster = require('../lib/model').Monster;

// Library
var errorHandler = require('../lib/errorHandler');

exports.index = function (req, res) {
  async.waterfall([
    function getPlayer (callback) {
      Player.findById(req.session.current_player_id, function (err, player) {
        if (err) throw err;

        if ( !player ) {
          console.log('NO_PLAYER_FOUND');
          res.redirect('/player');
          return;
        }

        if ( !player.evil.devil._id ) {
          res.redirect('/devil/select');
          return;
        }

        console.log('player:', player);
        callback(null, player);
        return;
      });
    },

    function getCities (player, callback) {
      City.find({}, function (err, cities) {
        if (err) throw err;

        if ( !cities ) {
          errorHandler.sendErrorMessage('NO_CITIES_FOUND', res);
          return;
        }

        callback(null, player, cities);
        return;
      });
    },

    function getMonsters (player, cities, callback) {
      Monster.find({}, function (err, monsters) {
        if (err) throw err;

        if ( !monsters ) {
          errorHandler.sendErrorMessage('NO_MONSTERS_FOUND', res);
          return;
        }

        callback(null, player, cities, monsters);
        return;
      });
    },

    function getResult (player, cities, monsters, callback) {
      var result = {
        'result': 'success',
        'devil': player.evil.devil,
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

exports.select = function (req, res) {
  async.waterfall([
    function getPlayerAndCheckDevil (callback) {
      Player.findById(req.session.current_player_id, function (err, player) {
        if (err) throw err;

        if ( !player ) {
          errorHandler.sendErrorMessage('NO_PLAYER_FOUND', res);
          return;
        }

        if ( player.evil.devil._id ) {
          res.redirect('/devil');
          return;
        }

        callback(null);
        return;
      });
    },

    function (callback) {
      Devil.find({}, function (err, devils) {
        if (err) throw err;

        if ( devils.length === 0 ) {
          errorHandler.sendErrorMessage('NO_DEVILS_FOUND', res);
          return;
        }

        var result = {
          'result': 'success',
          'devils': devils
        };

        callback(null, result);
        return;
      });
    }
  ], function (err, result) {
    res.render('devil.select.html', result);
    return;
  });
};

exports.selectDevil = function (req, res) {
  async.waterfall([
    function getPlayerAndCheckDevil (callback) {
      Player.findById(req.session.current_player_id, function (err, player) {
        if (err) throw err;

        if ( !player ) {
          errorHandler.sendErrorMessage('NO_PLAYER_FOUND', res);
          return;
        }

        if ( player.evil.devil._id ) {
          res.redirect('/devil');
          return;
        }

        callback(null);
        return;
      });
    },

    function getDevil (callback) {
      Devil.findById(req.params.id, function (err, devil) {
        if (err) throw err;

        if ( !devil ) {
          errorHandler.sendErrorMessage('NO_DEVIL_FOUND', res);
          return;
        }

        callback(null, devil);
        return;
      });
    },

    function updatePlayer (devil, callback) {
      var update = {
        'evil': {
          'devil': {
            'name': devil.name,
            'current_health_point': devil.health_point,
            'health_point': devil.health_point,
            'attack_speed_per_sec': devil.attack_speed_per_sec,
            'physical_damage': devil.physical_damage,
            'magic_damage': devil.magic_damage,
            'armor': devil.armor,
            'magic_resist': devil.magic_resist,
            'skills': devil.skills,
            '_id': devil._id
          }
        }
      };

      console.log('update:', update);

      Player.findByIdAndUpdate(req.session.current_player_id, update, function (err, player) {
        if (err) throw err;

        if ( !player ) {
          errorHandler.sendErrorMessage('NO_PLAYER_FOUND', res);
          return;
        }

        callback(null);
        return;
      });
    }
  ], function (err, result) {
    res.redirect('/devil');
    return;
  });
};

exports.attack = function (req, res) {
  var attack = {
    'account_id': req.session.account_id,
    'city_id': req.body.city_id
  };

  // account -> player -> devil -> city -> hero -> battle

  async.waterfall([
    function getAccount (callback) {
      Account.findByIdAndUpdate(req.session.account_id, { 'updated_at': new Date() }, function (err, account) {
        if (err) throw err;

        if ( !account ) {
          errorHandler.sendErrorMessage('NO_CITY_FOUND', res);
          return;
        }

        callback(null, account);
        return;
      });
    },

    function getPlayer (account, callback) {
      Player.findByIdAndUpdate(account.players_id[0], { 'updated_at': new Date() }, function (err, player) {
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

    function getHeroesForCity (player, city, callback) {
      Hero.find({}, function (err, heroes) {
        if (err) throw err;

        if ( !heroes ) {
          errorHandler.sendErrorMessage('NO_HEROES_EXIST', res);
          return;
        }

        var defenders = [];

        for ( var i in city.soldiers ) {
          var random = Math.random() * heroes.length;
          defenders.push(heroes[random]);
        }

        callback(null, player, city, defenders);
        return;
      });
    },

    function prepareForBattle (player, city, defenders, callback) {
      Player.findByIdAndUpdate();
    }
  ], function (err, result) {

  });

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