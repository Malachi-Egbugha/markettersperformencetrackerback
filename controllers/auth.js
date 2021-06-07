const User = require("../models/users");
const { mail } = require("../middleware/mail");

exports.signup = async (req, res, next) => {
  try {
    const { email } = req.body;
    const foundUser = await User.findOne({ email });
    if (foundUser) {
      return res
        .status(403)
        .json({ error: "Email is already in use", status: false });
    }
    const message = `You have been signed up as a user on the MPT APP. Your Credentials are Username=${email} Password:eedc01. Please Login and Change your password`;
    const user = new User(req.body);
    await user.save();
    await mail(email, "MPT Profile", message);
    res.json({ user, status: true });
  } catch (err) {
    next(err);
  }
};

exports.signin = async (req, res, next) => {
  try {
    //destructure email and password
    const { email, password } = req.value.body;

    // validate  email and password
    if (!email || !password) {
      return res
        .status(403)
        .json({ error: "Please provide  Email and Password", status: false });
    }
    //find user
    const user = await User.findOne({ email });

    //check is user exist
    if (!user) {
      return res.status(403).json({ error: "invalid credentials" });
    }
    if (user.status != "active") {
      return res.status(403).json({ error: "You have been Deactivated" });
    }
    //check is password match
    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(403).json({ error: "Invalid credentials" });
    }
    //respond with token
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.signout = async (req, res, next) => {
  try {
    res.clearCookie("token");
    res.json({ message: "Signout success" });
  } catch (err) {
    next(err);
  }
};

//Get token from model, create cookie and send response

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJWToken();
  //console.log(token);
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ status: true, token, user });
};
