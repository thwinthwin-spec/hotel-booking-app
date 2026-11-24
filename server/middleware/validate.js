// Turns express-validator results into the canonical 400 error shape.
const { validationResult } = require('express-validator');

function validate(rules) {
  return async function runValidation(req, res, next) {
    try {
      await Promise.all(rules.map((rule) => rule.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array().map((item) => ({
            field: item.path || item.param || item.location,
            msg: item.msg
          }))
        });
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = { validate };
