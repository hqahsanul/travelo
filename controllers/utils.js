const jwt = require("jsonwebtoken");
const { User } = require("./../db/models/User.model");
const cache = require("memory-cache");
const signJWT = (user) => {
  const payload = {
    sub: user._id,
    iat: user.authTokenIssuedAt,
  };

  if (user.email) {
    payload.email = user.email;
  } else if (user.mobile) {
    payload.mobile = user.mobile;
  }

  return jwt.sign(payload, process.env.JWT_SECRET);
};

const verifyJWT = (req, res, next) => {
  if (req.headers["authorization"]) {
    jwt.verify(
      req.headers["authorization"],
      process.env.JWT_SECRET,
      async (err, decoded) => {
        if (err || !decoded || !decoded.sub) {
          return res.status(401).send("Unauthorized");
        }

        // console.log(decoded, "---------------------------decoded------------------------");

        const user = await User.findOne({
          _id: decoded.sub,
          authTokenIssuedAt: decoded.iat,
          $or: [{ mobile: decoded.mobile }, { email: decoded.email }],
          isDeleted: false,
        });

        if (!user) {
          return res.send({
            success: false,
            message: "UNAUTHORIZED",
            data: {},
          });
        }

        if (user.isSuspended) {
          return res.send({
            success: "deactivated",
            status: "deactivated",
            message: "Admin has deactivated your account",
          });
        }

        req._id = user["_id"];
        req.user = user;
        req.token = true;
        next();
      }
    );
  } else {
    req.token = false;
    next();
  }
};

const cacheMiddleware = (req, res, next) => {
  const key = req.query.query;
  const cachedResult = cache.get(key);

  if (cachedResult) {
    console.log("Result retrieved from cache");
    res.json({ result: cachedResult });
  } else {
    next();
  }
};

module.exports = { signJWT, verifyJWT, cacheMiddleware };
