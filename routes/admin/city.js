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
var City = require('../../lib/model').City;

exports.index = function (req, res) {
  City.find({}, function (err, cities) {
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
  City(req.body).save(function (err, city) {
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
  City.findById(req.params.id, function (err, city) {
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
  City.findById(req.params.id, function (err, city) {
    if (err) throw err;

    res.json(city);
    return;
  });
};

exports.delete = function (req, res) {
  City.findByIdAndRemove(req.params.id, function (err, city) {
    if (err) throw err;

    res.redirect('/admin/city');
    return;
  });
};