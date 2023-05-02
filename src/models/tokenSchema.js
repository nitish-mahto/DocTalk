const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    ref: "user",
  },
  token: {
    type: String,
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
    expired: 3600,
  },
});

module.exports = mongoose.model("token", tokenSchema);
