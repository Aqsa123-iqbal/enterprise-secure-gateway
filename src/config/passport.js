const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/v1/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          googleId: profile.id
        });

        if (!user) {
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(null, false);
          }

          user = await User.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            user.provider = 'google';
            await user.save();
          } else {
            user = await User.create({
              name: profile.displayName || 'Google User',
              email: email,
              googleId: profile.id,
              provider: 'google',
              role: 'Employee'
            });
          }
        }

        return done(null, user);

      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;