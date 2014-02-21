//////////////////////////////////////////////////
//
//  grouple - common.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

// Module dependencies
var async = require('async');

// Model
var Monster = require('./model').Monster;
var Devil = require('./model').Devil;
var Player = require('./model').Player;

// Constants
var SECONDS_FOR_A_TURN = 60;

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

  return ( totalDamage > 10 ) ? totalDamage : 10;
};

var getTimeGap = function (object) {
  var timeGap = Math.floor(( new Date() - object.updated_at ) / 1000);
  var multiplier = Math.floor(timeGap/SECONDS_FOR_A_TURN);

  return multiplier;
};

var getBattleResult = function (attackers, defenders, experience, battleLogs) {
  var attacker = attackers[0];
  var defender = defenders[0];

  // ATTACKER's TURN
  if ( attackers.length > 0 ) {
    for ( var i in attackers ) {
      defender.current_health_point -= getDamage(attackers[i], defender);
      battleLogs.push(attackers[i].name + '이(가) ' + defender.name + '을(를) 공격하여 ' + getDamage(attackers[i], defender) + '의 데미지를 입혔습니다.');
    }
  }

  // CHECK DEFENDER
  if ( defender.current_health_point <= 0 ) {
    battleLogs.push(attacker.name + '이(가) ' + defender.name + '을(를) 무찔렀습니다.');
    if ( experience !== undefined && defender.experience !== undefined ) {
      experience += defender.experience;
    }
    defenders.splice(0, 1);
  }

  // DEFENDER's TURN
  if ( defenders.length > 0 ) {
    for ( var j in defenders ) {
      attacker.current_health_point -= getDamage(defenders[j], attacker);
      battleLogs.push(defenders[j].name + '이(가) ' + attacker.name + '을(를) 공격하여 ' + getDamage(defenders[j], attacker) + '의 데미지를 입혔습니다.');
    }
  }

  // CHECK ATTACKER
  if ( attacker.current_health_point <= 0 ) {
    battleLogs.push(defender.name + '이(가) ' + attacker.name + '을(를) 무찔렀습니다.');
    attackers.splice(0, 1);
  }

  console.log('experience:', experience);
};

var removeMonster = function (id) {
  Monster.findByIdAndRemove(id, function (err, monster) {
    if (err) throw err;

    if ( !monster ) {
      console.log('MONSTER_NOT_FOUND');
      return;
    }

    return;
  });
};

var recoverDevil = function (devil, result, done) {
  var multiplier = getTimeGap(devil);

  if ( multiplier <= 0 ) {
    done('SHOULD_WAIT_MORE');
    return;
  }

  var healthPointToUpdate = getPointToUpdate(multiplier * 10, devil.current_health_point, devil.health_point);
  var actionPointToUpdate = getPointToUpdate(multiplier * 1, devil.current_action_point, devil.action_point);

  var update = {
    $set: {
      'updated_at': new Date()
    },
    $inc: {
      'current_health_point': healthPointToUpdate,
      'current_action_point': actionPointToUpdate
    }
  };

  Devil.findByIdAndUpdate(devil._id, update, function (err, devil) {
    if (err) throw err;

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

var getIntrudeResult = function (attackers, defenders, boss, experience, battleLogs) {
  for ( var i in defenders ) {
    var attacker = attackers[0];
    var defender = defenders[i];

    if ( defender.length === 0 ) {
      battleLogs.push(i + '에 수비병력이 없습니다. 바로 다음 단계로 진행합니다.');
    } else {
      battleLogs.push(attacker.name + '이(가) ' + i + '을(를) 공략합니다.');
    }

    while ( defender.length > 0 && attacker.current_health_point > 0 ) {
      getBattleResult(attackers, defender, experience, battleLogs);
      if ( defender.length === 0 ) {
        battleLogs.push(attacker.name + '이(가) ' + i + '을(를) 돌파하였습니다.');
      }
    }
  }

  var isAttackerLost = true;

  for ( var j in defenders ) {
    if ( defenders[j].length !== 0 ) {
      isAttackerLost = false;
    }
  }

  if ( !isAttackerLost ) {
    battleLogs.push('수비 병력이 훌륭하게 막아냈습니다!');
    return;
  }

  battleLogs.push('모든 수비 병력이 돌파당했습니다. 이제 당신이 나설 차례입니다!');

  var bossArray = [ boss ];

  while ( bossArray.length > 0 && attackers.length > 0 ) {
    getBattleResult(attackers, bossArray, experience, battleLogs);
  }

  if ( bossArray.length === 0 ) {
    battleLogs.push('패배하였습니다. 콜로니를 탈환당했습니다.');
  }
};

var payMoneyAndAP = function (player, protomonster, devil, actionPoint, callback) {
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
      Devil.findByIdAndUpdate(devil._id, { $inc: { 'current_action_point': -actionPoint } }, function (err, devil) {
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
};

module.exports = {
  'SECONDS_FOR_A_TURN': SECONDS_FOR_A_TURN,
  'getPointToUpdate': getPointToUpdate,
  'getDamage': getDamage,
  'getTimeGap': getTimeGap,
  'getBattleResult': getBattleResult,
  'getIntrudeResult': getIntrudeResult,
  'recoverDevil': recoverDevil,
  'recoverMonsters': recoverMonsters,
  'payMoneyAndAP': payMoneyAndAP
};