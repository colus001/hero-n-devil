//////////////////////////////////////////////////
//
//  grouple - util.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

// Module dependencies
var mongoose = require('mongoose');

// Mongoose ObjectId
var ObjectId = mongoose.Schema.ObjectId;

// User
exports.User = mongoose.model('user', {
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

// Hero
exports.Hero = mongoose.model('hero', {
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  class: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  health_point: {
    type: Number,
    required: true
  },
  attack_speed_per_sec: {
    type: Number,
    required: true
  },
  physical_damage: {
    type: Number,
    required: true
  },
  magic_damage: {
    type: Number,
    required: true
  },
  armor: {
    type: Number,
    required: true
  },
  magic_resist: {
    type: Number,
    required: true
  },
  skills: [{
    type: String
  }],
  tags: [{
    type: String
  }]
});

exports.City = mongoose.model('city', {
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    required: true
  },
  population: {
    type: Number,
    required: true
  },
  economy_level: {
    type: Number,
    required: true
  },
  army: {
    type: Number,
    required: true
  },
  army_level: {
    type: Number,
    required: true
  }
});