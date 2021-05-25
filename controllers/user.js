const User = require("../models/users");
const bcrypt = require("bcryptjs");

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
    //return json true response
    res.json({ status: true, user });
  } catch (err) {
    next(err);
  }
};
