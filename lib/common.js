//////////////////////////////////////////////////
//
//  grouple - common.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

var TURN = 30;
exports.SECONDS_FOR_A_TURN = TURN;

exports.getPointToUpdate = function (pointToUpdate, currentPoint, maximumPoint) {
  if ( pointToUpdate + currentPoint > maximumPoint ) {
    pointToUpdate =  maximumPoint - currentPoint;
  }

  return pointToUpdate;
};

exports.getDamage = function (attack, defense) {
  var phy_damage = attack.physical_damage - defense.armor;
  var mag_damage = attack.magic_damage - defense.magic_resist;
  var totalDamage = phy_damage + mag_damage;

  return ( totalDamage > 0 ) ? totalDamage : 10;
};

exports.getTimeGap = function (object) {
  var timeGap = Math.floor(( new Date() - object.updated_at ) / 1000);
  var multiplier = Math.floor(timeGap/TURN);

  return multiplier;
};