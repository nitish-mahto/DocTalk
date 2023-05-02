const User = require("../models/user");
const tokenSchema = require("../models/tokenSchema");
const { generateJWT } = require("../models/token");
const bcrypt = require("bcrypt");

const test = async (req, res) => {
  res.status(200).json({ message: "This is a test API" });
};

const otpVerify = async (req, res) => {
  try {
    let phoneNumber = await tokenSchema
      .findOne({ phoneNumber: req.body.phoneNumber })
      .lean()
      .exec();

    if (!phoneNumber) {
      return res.status(404).json({
        success: false,
        message: "Phone number does not exist",
      });
    }

    let otp = await tokenSchema
      .findOne({ token: phoneNumber.token })
      .lean()
      .exec();

    if (!otp) {
      return res.status(404).json({
        success: false,
        message: "Please enter valid OTP",
      });
    }

    let updateData = await User.updateOne(
      { phoneNumber: otp.phoneNumber },
      {
        $set: { status: true },
      }
    );

    let deleteToken = await tokenSchema
      .deleteOne({ otp: phoneNumber.otp })
      .lean()
      .exec();

    let data = await User.findOne({ phoneNumber: otp.phoneNumber })
      .select({
        name: 1,
        email: 1,
        organizationName: 1,
        phoneNumber: 1,
        countryCode: 1,
      })
      .lean()
      .exec();

    const { token } = await generateJWT(data);

    res.status(200).json({
      token: token,
      success: true,
      data: data,
    });
  } catch (error) {
    console.log("Error: " + error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const register = async (req, res) => {
  try {
    let newUser = new User({
      name: req.body.name,
      email: req.body.email,
      organizationName: req.body.organizationName,
      phoneNumber: req.body.phoneNumber,
      countryCode: req.body.countryCode,
      password: req.body.password,
    });

    let existingUser = await User.findOne({ phoneNumber: req.body.phoneNumber })
      .lean()
      .exec();

    if (existingUser) {
      return res.status(404).json({
        status: "Error",
        message: "User Already Exists.",
      });
    }

    let user = new User(newUser);
    await user.save();

    user = await User.findOne({ _id: user._id })
      .select({
        name: 1,
        email: 1,
        organizationName: 1,
        phoneNumber: 1,
        countryCode: 1,
      })
      .lean()
      .exec();

    const { token } = await generateJWT(user);

    try {
      var OTP = Math.round(Math.random() * (9999 - 1000) + 1000);

      var data = new tokenSchema({
        phoneNumber: req.body.phoneNumber,
        token: OTP,
      });

      await data.save();
    } catch (error) {
      res.send({ status: false, message: err.message });
    }

    return res.status(200).json({
      status: true,
      message: "Registration Successful ",
      token: token,
      data: user,
      OTP: OTP,
    });
  } catch (err) {
    console.log("Error: " + err.message);
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

const login = async (req, res) => {
  try {
    let phoneNumber = await User.findOne({
      phoneNumber: req.body.phoneNumber,
    })
      .lean()
      .exec();

    if (!phoneNumber) {
      return res.status(404).json({
        status: false,
        message: "Mobile Number not exist",
      });
    }

    let user = await User.findOne({
      status: true,
      phoneNumber: req.body.phoneNumber,
    })
      .lean()
      .exec();

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Please activate your mobile number",
      });
    }

    let isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      return res.status(404).json({
        status: false,
        message: "Password not match",
      });
    }

    user = await User.findOne({ _id: user._id })
      .select({
        name: 1,
        email: 1,
        organizationName: 1,
        phoneNumber: 1,
        countryCode: 1,
      })
      .lean()
      .exec();

    const { token } = await generateJWT(user);

    res.status(200).json({
      status: true,
      message: "Login Successful",
      token: token,
      data: user,
    });
  } catch (error) {
    console.log("Error1: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

module.exports = {
  test,
  register,
  otpVerify,
  login,
};
