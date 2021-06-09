const User = require("../models/users");
const bcrypt = require("bcryptjs");
const { mail } = require("../middleware/mail");

exports.readall = async (req, res, next) => {
  try {
    const users = await User.find();
    const totalUsers = await User.countDocuments();
    res.json({ users, totalUsers, status: true });
  } catch (err) {
    res.json({ error: "Please Contact Administrator", status: false });
    next(err);
  }
};

exports.updateuser = async (req, res, next) => {
  try {
    if (req.body.password) {
      //generate a salt
      const salt = await bcrypt.genSalt(10);
      //generate password hash

      const passwordHash = await bcrypt.hash(req.body.password, salt);
      //re-assign hasshed version of original
      req.body.password = passwordHash;
    }
    const user = await User.findByIdAndUpdate({ _id: req.params.id }, req.body);
    if (!user) {
      //return json  false response
      return res.status(403).json({ error: "Invalid credentials" });
    }
    if (req.body.password) {
      const { email } = user;

      let message = `Your password was reset. \n Your new password is changeMe123!. \n Please log in and change your Password`;
      await mail(email, "MPT Profile", message);
    }
    //return json true response
    res.json({ status: true, user });
  } catch (err) {
    next(err);
  }
};

exports.finduser = async (req, res, next) => {
  try {
    const users = await User.find({ _id: req.params.id });
    res.json({ users });
  } catch (err) {
    next(err);
  }
};
