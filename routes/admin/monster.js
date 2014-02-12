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
var ProtoMonster = require('../../lib/model').ProtoMonster;

exports.index = function (req, res) {
  ProtoMonster.find({}, function (err, monsters) {
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
  ProtoMonster(req.body).save(function (err, monster) {
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
  ProtoMonster.findById(req.params.id, function (err, monster) {
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
  ProtoMonster.findById(req.params.id, function (err, monster) {
    if (err) throw err;

    res.json(monster);
    return;
  });
};

exports.delete = function (req, res) {
  ProtoMonster.findByIdAndRemove(req.params.id, function (err, monster) {
    if (err) throw err;

    res.redirect('/admin/monster');
    return;
  });
};