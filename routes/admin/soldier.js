//////////////////////////////////////////////////
//
//  grouple - admin.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

// Module dependencies
var async = require('async');

// Model
var ProtoSoldier = require('../../lib/model').ProtoSoldier;

exports.index = function (req, res) {
  ProtoSoldier.find({}, function (err, soldiers) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'soldiers': soldiers
    };

    res.render('admin.soldier.html', result);
    return;
  });
};

exports.create = function (req, res) {
  if ( req.params.id ) {
    // EDIT
    ProtoSoldier.findByIdAndUpdate(req.params.id, { $set: req.body }, function (err, soldier) {
      if (err) throw err;

      var result = {
        'result': 'success',
        'soldier': soldier
      };

      console.log('result:', result);
      res.redirect('/admin/soldier');
      return;
    });
  } else {
    // ADD
    ProtoSoldier(req.body).save(function (err, soldier) {
      if (err) throw err;

      var result = {
        'result': 'success',
        'soldier': soldier
      };

      console.log('result:', result);
      res.redirect('/admin/soldier');
      return;
    });
  }
};

exports.edit = function (req, res) {
  ProtoSoldier.findById(req.params.id, function (err, soldier) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'soldier': soldier
    };

    res.render('admin.soldier.edit.html', result);
    return;
  });
};

exports.view = function (req, res) {
  ProtoSoldier.findById(req.params.id, function (err, soldier) {
    if (err) throw err;

    res.json(soldier);
    return;
  });
};

exports.delete = function (req, res) {
  ProtoSoldier.findByIdAndRemove(req.params.id, function (err, soldier) {
    if (err) throw err;

    res.redirect('/admin/soldier');
    return;
  });
};

exports.publish = function (req, res) {
  async.waterfall([
    function (callback) {
      ProtoSoldier.findById(req.params.id, function (err, soldier) {
        if (err) throw err;

        callback(null, soldier);
        return;
      });
    },

    function (soldier, callback) {
      ProtoSoldier.findByIdAndUpdate(req.params.id, { 'published': !soldier.published }, function (err, soldier) {
        if (err) throw err;

        callback(null);
        return;
      });
    }
  ], function (err, result) {
    res.redirect('/admin/soldier');
    return;
  });
};