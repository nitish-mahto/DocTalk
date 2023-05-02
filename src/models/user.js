const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let userSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  phoneNumber: {
    type: String,
    require: true,
  },
  organizationName: {
    type: String,
    require: true,
  },
  countryCode: {
    type: String,
    require: true,
  },
  usertype: {
    type: Number,
    default: 1,
  },
  status: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    require: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", function (next) {
  var user = this;
  if (!user.isModified("password")) return next();

  //generate a salt
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

module.exports = mongoose.model("user", userSchema);
