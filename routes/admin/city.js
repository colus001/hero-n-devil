//////////////////////////////////////////////////
//
//  grouple - admin/city.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

// Module dependencies
var async = require('async');

// Model
var Player = require('../../lib/model').Player;
var City = require('../../lib/model').City;

// Model - Prototype
var ProtoCity = require('../../lib/model').ProtoCity;

// Library
var errorHandler = require('../../lib/errorHandler');

exports.index = function (req, res) {
  ProtoCity.find({}, function (err, cities) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'cities': cities
    };

    res.render('admin.city.html', result);
    return;
  });
};

exports.create = function (req, res) {
  ProtoCity(req.body).save(function (err, city) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'city': city
    };

    res.redirect('/admin/city');
    return;
  });
};

exports.edit = function (req, res) {
  ProtoCity.findById(req.params.id, function (err, city) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'city': city
    };

    res.render('admin.city.edit.html', result);
    return;
  });
};

exports.view = function (req, res) {
  ProtoCity.findById(req.params.id, function (err, city) {
    if (err) throw err;

    res.json(city);
    return;
  });
};

exports.delete = function (req, res) {
  ProtoCity.findByIdAndRemove(req.params.id, function (err, city) {
    if (err) throw err;

    res.redirect('/admin/city');
    return;
  });
};

exports.apply = function (req, res) {
  async.waterfall([
    function getProtocities (callback) {
      ProtoCity.find({ 'playable': false }, function (err, cities) {
        if (err) throw err;

        if ( cities.length === 0 ) {
          errorHandler.sendErrorMessage('NO_CIITES_TO_UPDATE', res);
          callback('NO_CIITES_TO_UPDATE');
          return;
        }

        ProtoCity.update({ 'playable': false }, { 'playable': true }, function (err, updated) {
          if (err) throw err;

          if ( updated === 0 ) {
            errorHandler.sendErrorMessage('UPDATE_FAILED', res);
            return;
          }

          callback(null, cities);
          return;
        });
      });
    },

    function getPlayers (cities, callback) {
      Player.find({}, function (err, players) {
        if (err) throw err;

        if ( players.length === 0 ) {
          errorHandler.sendErrorMessage('NO_PLAYERS_TO_UPDATE', res);
          callbac('NO_PLAYERS_TO_UPDATE');
          return;
        }

        callback(null, cities, players);
        return;
      });
    },

    function updateCities (cities, players, callback) {
      async.forEach(players, function (player, done) {
        async.map(cities, function (protocity, next) {
          var city = JSON.parse(JSON.stringify(protocity));
          city.player_id = player._id;

          delete city.created_at;
          delete city.updated_at;
          delete city._id;

          City(city).save(function (err, city) {
            if (err) throw err;

            next(null, city);
            return;
          });
        }, function (err, results) {
          done(null);
          return;
        });
      }, function (err) {
        var result = {
          'result': 'success',
          'cities': cities,
          'players': players,
        };

        callback(null, result);
        return;
      });
    }
  ], function (err, result) {
    res.redirect('/admin/city');
    return;
  });

};