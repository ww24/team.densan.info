/**
 * User Model
 */

var mongoose = require("mongoose");
var validator = require("validator");

var UserSchema = new mongoose.Schema({
  id: {
    type: String,
    index: {unique: true},
    required: true
  },
  name: {
    first: {
      type: String,
      required: true
    },
    last: {
      type: String,
      required: true
    }
  },
  email: {
    type: String,
    index: {unique: true},
    required: true,
    validate: [function (value) {
      if (! value) {
        return false;
      }

      var is_email = validator.isEmail(value);
      var isnt_HUS_email = ! validator.equals(value.slice(-9), "hus.ac.jp");

      return is_email && isnt_HUS_email;
    }, "不正なメールアドレスです"]
  },
  team: [{
    type: mongoose.Schema.ObjectId,
    ref: "Team",
    required: true
  }],
  role: {
    type: mongoose.Schema.ObjectId,
    ref: "Role",
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    "default": Date.now
  }
});

var userDataReMap = function (profile) {
  profile = JSON.parse(JSON.stringify(profile));

  profile.team = profile.team.map(function (team) {
    return team.name;
  }).sort();
  profile.role = {
    name: profile.role.name,
    permissions: profile.role.permissions
  };

  return profile;
};

/**
 * User.getProfileList(Function)                => callback(err, Array<Object>)
 *     .getProfileList(String, Function)        => callback(err, Object)
 *     .getProfileList(Array<String>, Function) => callback(err, Array<Object>)
 */
UserSchema.statics.getProfileList = function (id, callback) {
  if (typeof id === "function")
    callback = id;

  var query;
  if (typeof id === "string")
    query = this.findOne({id: id});
  else {
    query = this.find();
    if (typeof id === "object")
      query = query.or(id.map(function (id) {
        return {id: id};
      }));
  }

  query = query.populate("team").populate("role");
  query.exec(function (err, profiles) {
    if (err)
      return callback(err);

    if (profiles instanceof Array)
      profiles = profiles.map(userDataReMap);
    else if (profiles !== null)
      profiles = userDataReMap(profiles);

    callback(err, profiles);
  });

  return query;
};

module.exports = mongoose.model("User", UserSchema);
