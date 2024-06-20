import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { envConfig } from "../../config/envConfig";
import Auth from "../../auth/models/authModel";
import { Role } from "../../admin/models/roleModel";

// passport strategy for google
passport.use(
  new GoogleStrategy(
    {
      clientID: envConfig.client_ID,
      clientSecret: envConfig.client_Secret,
      callbackURL: `/auth/google/callback`,
      scope: ["profile", "email"],
    },
    async function (
      accessToken: String,
      refreshToken: String,
      profile: any,
      cb: any
    ) {
      const defaultRole = await Role.findOne({ role: "user" });

      //  user data
      var userData = {
        email: profile.emails[0].value,
        fullName: profile.displayName,
        provider: profile.provider,
        role: defaultRole,
      };
      try {
        const existingUser = await Auth.findOne({
          email: profile.emails[0].value,
        }).exec();
        if (existingUser) {
          // User exists, update user information if necessary
          return cb(null, existingUser);
        } else {
          // saving the user in data bases
          const newUser = new Auth(userData);
          await newUser.save();
          return cb(null, newUser);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);

// passport serializer
passport.serializeUser(function (user: any, cb: any) {
  process.nextTick(function () {
    cb(null, user._id);
  });
});

// passport deserializer
passport.deserializeUser((id: any, done: any) => {
  Auth.findOne({ _id: id }, "name email username token")
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});
