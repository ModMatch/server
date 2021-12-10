const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

var User = require("./models/user");

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET_KEY;

module.exports = new JwtStrategy(opts, async (jwt_payload, done) => {
  const user = await User.findOne({email: jwt_payload.email});
  if (!user) {
    return done(null, false)
  }
  return done(null, user);
}) 
