//////////////////////////////////////////////////
//
//  grouple - util.js
//
//  Purpose: Utliities
//  Created: 2013.12.03
//
//////////////////////////////////////////////////

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
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  friends: [{
    type: ObjectId
  }],
  favorites: [{
    type: ObjectId
  }]

});