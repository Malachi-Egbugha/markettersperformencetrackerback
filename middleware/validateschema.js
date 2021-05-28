const Joi = require("joi");
exports.validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema.validate(req.body);

    if (result.error) {
      return res
        .status(400)
        .json({ error: result.error.details[0].message, status: false });
    }
    let domain = req.body.email.split("@");
    if (domain[1] !== "enugudisco.com") {
      return res
        .status(400)
        .json({ error: "only enugudisco domain is allowed", status: false });
    }
    if (!req.value) {
      req.value = {};
    }
    req.value["body"] = result.value;
    next();
  };
};
exports.schemas = {
  authSchema: Joi.object({
    email: Joi.string().email(),
    password: Joi.string().required(),
  }),
};

exports.emailschemas = {
  authSchema: Joi.object({
    email: Joi.string().email(),
  }),
};
