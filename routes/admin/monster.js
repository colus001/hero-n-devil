//////////////////////////////////////////////////
//
//  grouple - admin/monster.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

// Module dependencies
var async = require('async');

// Model
var Monster = require('../../lib/model').Monster;

exports.index = function (req, res) {
  Monster.find({}, function (err, monsters) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'monsters': monsters
    };

    res.render('admin.monster.html', result);
    return;
  });
};

exports.create = function (req, res) {
  Monster(req.body).save(function (err, monster) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'monster': monster
    };

    res.redirect('/admin/monster');
    return;
  });
};

exports.edit = function (req, res) {
  Monster.findById(req.params.id, function (err, monster) {
    if (err) throw err;

    var result = {
      'result': 'success',
      'monster': monster
    };

    res.render('admin.monster.edit.html', result);
    return;
  });
};

exports.view = function (req, res) {
  Monster.findById(req.params.id, function (err, monster) {
    if (err) throw err;

    res.json(monster);
    return;
  });
};

exports.delete = function (req, res) {
  Monster.findByIdAndRemove(req.params.id, function (err, monster) {
    if (err) throw err;

    res.redirect('/admin/monster');
    return;
  });
};