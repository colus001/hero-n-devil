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