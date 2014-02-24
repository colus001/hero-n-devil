//////////////////////////////////////////////////
//
//  grouple - admin/kingdom.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

// Module dependencies
var async = require('async');

// Model
var Player = require('../../lib/model').Player;
var Kingdom = require('../../lib/model').Kingdom;

// Model - Prototype
var ProtoKingdom = require('../../lib/model').ProtoKingdom;
var ProtoPrincess = require('../../lib/model').ProtoPrincess;

// Library
var errorHandler = require('../../lib/errorHandler');

exports.index = function (req, res) {
  async.waterfall([
    function getKingdoms (callback) {
      ProtoKingdom.find({}, function (err, kingdoms) {
        if (err) throw err;

        callback(null, kingdoms);
        return;
      });
    },

    function getPrincesses (kingdoms, callback) {
      ProtoPrincess.find({}, function (err, princesses) {
        if (err) throw err;

        var result = {
          'result': 'success',
          'kingdoms': kingdoms,
          'princesses': princesses
        };

        callback(null, result);
      });
    }
  ], function (err, result) {
    res.render('admin.kingdom.html', result);
    return;
  });
};

exports.create = function (req, res) {
  ProtoKingdom(req.body).save(function (err, kingdom) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'kingdom': kingdom
    };

    res.redirect('/admin/kingdom');
    return;
  });
};

exports.edit = function (req, res) {
  ProtoKingdom.findById(req.params.id, function (err, kingdom) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'kingdom': kingdom
    };

    res.render('admin.kingdom.edit.html', result);
    return;
  });
};

exports.publish = function (req, res) {
  async.waterfall([
    function getProtoKingdom (callback) {
      ProtoKingdom.findById(req.params.id, function (err, kingdom) {
        if (err) throw err;

        if ( !kingdom ) {
          callback('NO_KINGDOM_FOUND');
          return;
        }

        callback(null, kingdom);
        return;
      });
    },

    function updateProtoKingdom (kingdom, callback) {
      ProtoKingdom.findByIdAndUpdate(req.params.id, { 'published': !kingdom.published }, function (err, kingdom) {
        if (err) throw err;

        callback(null);
        return;
      });
    }
  ], function (err, result) {
    if (err) {
      errorHandler.sendErrorMessage(err, res);
      return;
    }

    res.redirect('/admin/kingdom');
    return;
  });
};

exports.view = function (req, res) {
  ProtoKingdom.findById(req.params.id, function (err, kingdom) {
    if (err) throw err;

    res.json(kingdom);
    return;
  });
};

exports.delete = function (req, res) {
  ProtoKingdom.findByIdAndRemove(req.params.id, function (err, kingdom) {
    if (err) throw err;

    res.redirect('/admin/kingdom');
    return;
  });
};

exports.apply = function (req, res) {
  async.waterfall([
    function getProtokingdoms (callback) {
      ProtoKingdom.find({ 'published': false }, function (err, kingdoms) {
        if (err) throw err;

        if ( kingdoms.length === 0 ) {
          errorHandler.sendErrorMessage('NO_CIITES_TO_UPDATE', res);
          callback('NO_CIITES_TO_UPDATE');
          return;
        }

        ProtoKingdom.update({ 'published': false }, { 'published': true }, function (err, updated) {
          if (err) throw err;

          if ( updated === 0 ) {
            errorHandler.sendErrorMessage('UPDATE_FAILED', res);
            return;
          }

          callback(null, kingdoms);
          return;
        });
      });
    },

    function getPlayers (kingdoms, callback) {
      Player.find({}, function (err, players) {
        if (err) throw err;

        if ( players.length === 0 ) {
          errorHandler.sendErrorMessage('NO_PLAYERS_TO_UPDATE', res);
          callbac('NO_PLAYERS_TO_UPDATE');
          return;
        }

        callback(null, kingdoms, players);
        return;
      });
    },

    function updatekingdoms (kingdoms, players, callback) {
      async.forEach(players, function (player, done) {
        async.map(kingdoms, function (protokingdom, next) {
          var kingdom = JSON.parse(JSON.stringify(protokingdom));
          kingdom.player_id = player._id;

          delete kingdom.created_at;
          delete kingdom.updated_at;
          delete kingdom._id;

          Kingdom(kingdom).save(function (err, kingdom) {
            if (err) throw err;

            next(null, kingdom);
            return;
          });
        }, function (err, results) {
          done(null);
          return;
        });
      }, function (err) {
        var result = {
          'result': 'success',
          'kingdoms': kingdoms,
          'players': players,
        };

        callback(null, result);
        return;
      });
    }
  ], function (err, result) {
    res.redirect('/admin/kingdom');
    return;
  });

};