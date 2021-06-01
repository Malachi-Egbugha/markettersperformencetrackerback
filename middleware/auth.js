const jwt = require("jsonwebtoken");
const User = require("../models/users");
//Protect routes
exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  //elseif(req.cookies.token)
  //{
  //token = req.cookies.token;

  //}
  if (!token) {
    return res.status(403).json({ error: "Unauthorise User", status: false });
  }

  try {
    //Verify token
    const decoded = jwt.verify(token, process.env.KEYGEN);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(403).json({ error: "Unauthorise Users", status: false });
  }
};
//Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.usertype)) {
      return res.status(403).json({
        error: `User with ID ${req.user.email} is Unauthorise to commit this action`,
        status: false,
      });
    }
    if (req.user.status != "active") {
      return res.status(403).json({
        error: `User with ID ${req.user.email} is not activated`,
        status: false,
      });
    }
    next();
  };
};

exports.apiauthorize = (req, res, next) => {
  let token;

  if (req.headers.accesstoken) {
    token = req.headers.accesstoken;
  }

  if (!token) {
    return res.status(403).json({ error: "Unauthorise User", status: false });
  } else if (token !== process.env.ACCESSTOKEN) {
    return res.status(403).json({ error: "Wrong Token", status: false });
  }
  next();
};
