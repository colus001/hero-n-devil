//////////////////////////////////////////////////
//
//  grouple - common.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

var getLevelUpCount = function (current_experience, target_experience) {
  var level = Math.floor(current_experience / target_experience);

  if ( level === 1 ) {
    return 3;
  } else {
    return 3 + getLevelUpCount(current_experience, target_experience*2);
  }
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

var getAndRemoveElementFromArray = function (array, value) {
  var i;
  if ( array.indexOf ) { // IE9+,  다른 모든 브라우져
    while((i = array.indexOf(value)) !== -1) {
      return array.splice(i, 1)[0];
    }
  } else { // IE8 이하
    for (i = array.length; i--;) {  //뒤에서부터 배열을 탐색
      if (array[i] === value) {
        return array.splice(i, 1)[0];
      }
    }
  }
};

var getIntervalFromAtackSpeed = function (attackSpeed) {
  return Math.floor(1/attackSpeed*1000);
};

var getDamage = function (attack, defense) {
  var phy_damage = attack.physical_damage - defense.armor;
  var mag_damage = attack.magic_damage - defense.magic_resist;
  var totalDamage = phy_damage + mag_damage;

  return ( totalDamage > 10 ) ? totalDamage : 10;
};

var attack = function (attacker, defender, $battleLog) {
  // ATTACKER's TURN
  if ( attacker.current_health_point > 0 ) {
    defender.current_health_point -= getDamage(attacker, defender);
    log = attacker.name + '이(가) ' + defender.name + '을(를) 공격하여 ' + getDamage(attacker, defender) + '의 데미지를 입혔습니다.';
    $battleLog.append($('<p></p>').text(log));
  }

  // CHECK DEFENDER
  if ( defender.current_health_point <= 0 ) {
    log = attacker.name + '이(가) ' + defender.name + '을(를) 무찔렀습니다.';
    $battleLog.append($('<p></p>').text(log));
  }
};

var getObjectLength = function (object) {
  var count = 0;

  for ( var i in object ) {
    if ( object[i] !== undefined ) {
      count++;
    }
  }

  return count;
};