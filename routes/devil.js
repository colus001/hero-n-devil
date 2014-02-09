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