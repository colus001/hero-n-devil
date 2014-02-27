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
var City = require('./model').City;
var Devil = require('./model').Devil;
var Monster = require('./model').Monster;
var Player = require('./model').Player;
var Soldier = require('./model').Soldier;

var ProtoHero = require('./model').ProtoHero;
var ProtoSoldier = require('./model').ProtoSoldier;

var errorHandler = require('./errorHandler');

// Constants
var SECONDS_FOR_A_TURN = 60;
var ACTION_POINT_TO_PAY = 1;
var POINT_PER_LEVEL = 3;

// Methods
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

var getIntervalFromAtackSpeed = function (attackSpeed) {
  return Math.floor(1/attackSpeed*1000);
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

var getPlayerAndDevil = function (player_id, callback) {
  async.waterfall([
    function getPlayer (next) {
      Player.findById(player_id, function (err, player) {
        if (err) throw err;

        if ( !player ) {
          next('NO_PLAYER_FOUND');
          return;
        }

        next(null, player);
        return;
      });
    },

    function getDevil (player, next) {
      Devil.findById(player.devil_id, function (err, devil) {
        if (err) throw err;

        if ( !devil ) {
          next('NO_DEVIL_FOUND');
          return;
        }

        var result = {
          'player': player,
          'devil': devil
        };

        next(null, result);
        return;
      });
    },
  ], function (err, result) {
    if (err) {
      errorHandler.sendErrorMessage(err, res);
      return;
    }

    callback(null, result.player, result.devil);
    return;
  });
};

var recoverDevil = function (devil, result, done) {
  var multiplier = getTimeGap(devil);

  if ( multiplier === 0 ) {
    done(null);
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

    devil = JSON.parse(JSON.stringify(devil));

    if ( devil.current_experience >= devil.target_experience ) {
      devil.level_up_available = true;
    }

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

var recoverSoldiers = function (soldiers, callback) {
  async.map(soldiers, function (soldier, done) {
    var multiplier = getTimeGap(soldier);

    if ( multiplier <= 0 ) {
      done(null, soldier);
      return;
    }

    if ( soldier.current_health_point === soldier.health_point ) {
      done(null, soldier);
      return;
    }

    var healthPointToUpdate = getPointToUpdate(multiplier * 10, soldier.current_health_point, soldier.health_point);

    var update = {
      $set: {
        'updated_at': new Date()
      },
      $inc: {
        'current_health_point': healthPointToUpdate
      }
    };

    Soldier.findByIdAndUpdate(soldier._id, update, function (err, soldier) {
      if (err) throw err;

      done(null, soldier);
      return;
    });
  }, function (err) {
    callback(null, soldiers);
    return;
  });
};

var updateExperience = function (object, experience) {
  var DATABASE;

  switch ( object.type ) {
    case 'Hero':
      DATABASE = Hero;
      break;

    case 'Devil':
      DATABASE = Devil;
      break;

    case 'Monster':
      DATABASE = Monster;
      break;

    case 'Soldier':
      DATABASE = Soldier;
      break;

    default:
      break;
  }

  if ( !DATABASE ) {
    return;
  }

  DATABASE.findByIdAndUpdate(object._id, { $inc: { 'current_experience': experience } }, function (err, object) {
    if (err) throw err;
  });
};

var getBattleResult = function (attackers, defenders, battleLogs) {
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
    updateExperience(attacker, defender.experience);
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
    updateExperience(attacker, defender.experience);
  }
};

var removeObject = function (obj) {
  var DATABASE;

  switch ( obj.type ) {
    case 'Monster':
      DATABASE = Monster;
      break;

    case 'Soldier':
      DATABASE = Soldier;
      break;

    default:
      break;
  }

  if ( !DATABASE ) {
    return;
  }

  DATABASE.findByIdAndRemove(obj._id, function (err, object) {
    if (err) throw err;

    console.log('object:', object);
    return;
  });
};

var clearDeadObjects = function (first, second) {
  for ( var i in first ) {
    if ( first[i].current_health_point <= 0 ) {
      removeObject(first[i]);
      first.splice(i, 1);
    }
  }

  if ( !second ) {
    return;
  }

  for ( var j in second ) {
    if ( second[j].current_health_point <= 0 ) {
      removeObject(second[j]);
      second.splice(j, 1);
    }
  }
};

var getIntrudeResult = function (attackers, defenders, boss, battleLogs) {
  for ( var i in defenders ) {
    var attacker = attackers[0];
    var current_floor_defenders = defenders[i];

    if ( current_floor_defenders.length === 0 ) {
      battleLogs.push(i + '에 수비병력이 없습니다. 바로 다음 단계로 진행합니다.');
    } else {
      battleLogs.push(attacker.name + '이(가) ' + i + '을(를) 공략합니다.');
    }

    while ( current_floor_defenders.length > 0 && attacker.current_health_point > 0 ) {
      getBattleResult(attackers, current_floor_defenders, battleLogs);
      clearDeadObjects(attackers, current_floor_defenders);

      if ( current_floor_defenders.length === 0 ) {
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
    getBattleResult(attackers, bossArray, battleLogs);
    clearDeadObjects(attackers, bossArray);
  }

  if ( bossArray.length === 0 ) {
    // loseColony(bossArray); // 콜로니를 빼앗김
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

var getDefenders = function (city, callback) {
  async.waterfall([
    function findSoldiers (next) {
      Soldier.find({ 'city_id': city._id }, function (err, defenders) {
        if (err) throw err;

        if ( defenders.length > 0 ) {
          recoverSoldiers(defenders, next);
          return;
        }

        next(null, defenders);
        return;
      });
    },

    function getProtoSoldier (existingDefenders, next) {
      var findQuery = {
        'published': true,
        'level': { $lte: city.army_level }
      };

      ProtoSoldier.find(findQuery, function summonDefenders (err, protosoldiers) {
        if (err) throw err;

        if ( protosoldiers.length === 0 ) {
          next('NO_PROTOSOLDIERS_EXIST');
          return;
        }

        next(null, existingDefenders, protosoldiers);
        return;
      });
    },

    function createSoldier (existingDefenders, protosoldiers, next) {
      var recruitCount = 0;

      if ( existingDefenders.length === 0 ) {
        recruitCount = city.soldiers;
      } else {
        var numberAbleToRecruit = Math.floor((new Date() - city.updated_at) / 1000 / SECONDS_FOR_A_TURN * city.army_level ); // 소요시간 / 1분 * 도시의 군사등급
        var soldiersToRecruit = city.soldiers - existingDefenders.length;
        recruitCount = ( numberAbleToRecruit > soldiersToRecruit ) ? soldiersToRecruit : numberAbleToRecruit;
      }

      var defenders = [];

      for ( var i = 0; i < recruitCount; i++ ) {
        var random = Math.floor(Math.random()*protosoldiers.length);
        var soldier = JSON.parse(JSON.stringify(protosoldiers[random]));

        soldier.current_health_point = soldier.health_point;
        soldier.city_id = city._id;

        delete soldier.created_at;
        delete soldier.updated_at;
        delete soldier._id;

        defenders.push(soldier);
      }

      next(null, defenders);
      return;
    },

    function saveSoldier (defenders, next) {
      if ( defenders.length === 0) {
        next(null);
        return;
      }

      async.map(defenders, function (defender, done) {
        Soldier(defender).save(function (err, defender) {
          if (err) throw err;

          done(null, defender);
          return;
        });
      }, function (err) {
        if (err) throw err;
        console.log('saveSoldier');

        next(null);
        return;
      });
    },

    function findSoldiers (next) {
      Soldier.find({ 'city_id': city._id }, function (err, defenders) {
        if (err) throw err;

        if ( defenders.length === 0 ) {
          next('NO_DEFENDERS_EXIST');
          return;
        }

        next(null, defenders);
        return;
      });
    }
  ], function (err, results) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, results);
    return;
  });
};

var getLevelUpCount = function (current_experience, target_experience) {
  var level = Math.floor(current_experience / target_experience);

  if ( level === 1 ) {
    return POINT_PER_LEVEL;
  } else {
    return POINT_PER_LEVEL + getLevelUpCount(current_experience, target_experience*2);
  }
};

var getExperienceCount = function (target_experience, points) {
  var count = points / POINT_PER_LEVEL;

  for ( var i = 0; i < count; i++ ) {
    target_experience *= 2;
  }

  return target_experience;
};

var getPointUp = function (stat) {
  switch ( stat ) {
    case 'health_point':
      return 50;
    case 'action_point':
      return 1;
    case 'attack_speed_per_sec':
      return 0.05;
    case 'physical_damage':
      return 10;
    case 'magic_damage':
      return 10;
    case 'armor':
      return 5;
    case 'magic_resist':
      return 5;
    default:
      return 0;
  }
};

var getLevelFromPoints = function (points) {
  return points / POINT_PER_LEVEL;
};

var loseRandomColony = function (player, callback) {
  async.waterfall([
    function (next) {
      City.find({ 'player_id': player._id, 'isCaptured': true }, function (err, cities) {
        if (err) throw err;

        if ( cities.length === 0 ) {
          callback(null);
          return;
        }

        var random = Math.floor(Math.random()*cities.length);
        next(null, cities[random]);
        return;
      });
    },

    function (city, next) {
      City.findByIdAndUpdate(city._id, { 'isCaptured': false }, function (err, city) {
        if (err) throw err;

        if ( !city ) {
          callback('NO_CITY_FOUND');
          return;
        }

        next(null);
      });
    }
  ], function (err, result) {
    console.log('lost_colony:', result);
    callback(null);
    return;
  });
};

var updateDevil = function (devil, conclusion, result, callback) {
  var healthPointToUpdate = ( devil.current_health_point > 0 ) ? devil.current_health_point : 0;

  var update = {
    $set: {
      'updated_at': new Date(),
      'current_health_point': healthPointToUpdate
    },
    $inc: { }
  };

  if ( conclusion ) {
    update.$inc['current_action_point'] = -1;
  }

  Devil.findByIdAndUpdate(devil._id, update, function (err, devil) {
    if (err) throw err;

    result.devil = devil;
    if ( callback ) {
      callback(null);
    }

    return;
  });
};

var attackByTime = function (attacker, defender, battleLogs) {
  // ATTACKER's TURN
  if ( attacker.current_health_point > 0 ) {
    defender.current_health_point -= getDamage(attacker, defender);
    battleLogs.push(attacker.name + '이(가) ' + defender.name + '을(를) 공격하여 ' + getDamage(attacker, defender) + '의 데미지를 입혔습니다.');
  }

  // CHECK DEFENDER
  if ( defender.current_health_point <= 0 ) {
    battleLogs.push(attacker.name + '이(가) ' + defender.name + '을(를) 무찔렀습니다.');
    updateExperience(attacker, defender.experience);
  }
};

module.exports = {
  'SECONDS_FOR_A_TURN': SECONDS_FOR_A_TURN,
  'ACTION_POINT_TO_PAY': ACTION_POINT_TO_PAY,
  'POINT_PER_LEVEL': POINT_PER_LEVEL,
  'getPlayerAndDevil': getPlayerAndDevil,
  'getPointToUpdate': getPointToUpdate,
  'getDamage': getDamage,
  'getTimeGap': getTimeGap,
  'getIntervalFromAtackSpeed': getIntervalFromAtackSpeed,
  'getBattleResult': getBattleResult,
  'getIntrudeResult': getIntrudeResult,
  'getDefenders': getDefenders,
  'getLevelUpCount': getLevelUpCount,
  'getExperienceCount': getExperienceCount,
  'getPointUp': getPointUp,
  'getLevelFromPoints': getLevelFromPoints,
  'attackByTime': attackByTime,
  'recoverDevil': recoverDevil,
  'recoverMonsters': recoverMonsters,
  'recoverSoldiers': recoverSoldiers,
  'payMoneyAndAP': payMoneyAndAP,
  'clearDeadObjects': clearDeadObjects,
  'loseRandomColony': loseRandomColony,
  'updateDevil': updateDevil
};