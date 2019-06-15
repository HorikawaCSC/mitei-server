import { Router } from 'express';
import * as passport from 'passport';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { config } from '../../config';
import { User } from '../../models/User';

passport.use(
  new TwitterStrategy(
    {
      consumerKey: config.twitter.consumerKey,
      consumerSecret: config.twitter.consumerSecret,
      callbackURL: `${config.appUrl}/auth/callback/twitter`,
    },
    async (token, tokenSecret, profile, done) => {
      try {
        const user = await User.findOne({
          userId: profile.id,
          type: 'twitter',
        });
        if (user) {
          user.iconUrl = profile.photos ? profile.photos[0].value : '';
          user.token = token;
          user.tokenSecret = tokenSecret;
          user.screenName = profile.username;

          await user.save();
          return done(null, user);
        }

        const userNew = new User();
        userNew.userId = profile.id;
        userNew.kind = 'normal';
        userNew.type = 'twitter';
        userNew.iconUrl = profile.photos ? profile.photos[0].value : '';
        userNew.token = token;
        userNew.tokenSecret = tokenSecret;
        userNew.screenName = profile.username;

        await userNew.save();

        return done(null, userNew);
      } catch (err) {
        done(err);
      }
    },
  ),
);

passport.serializeUser((user: User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId: string, done) => {
  const user = await User.findOne(userId);
  if (user) {
    done(null, user);
  } else {
    done('no user');
  }
});

export const router = Router();

router.use(
  '/callback/twitter',
  passport.authenticate('twitter'),
  (req, res) => {
    if (req.session && req.session.redirect) {
      res.redirect(req.session.redirect);
    } else {
      res.redirect('/');
    }
  },
);

router.use(
  '/login/twitter',
  (req, res, next) => {
    if (!req.session) return next();
    if (req.isAuthenticated()) return res.redirect('/');
    const { redirect }: { redirect?: string } = req.query;
    if (redirect && redirect.startsWith('/')) {
      if (req.session) {
        req.session.redirect = redirect;
      }
    }
    return next();
  },
  passport.authenticate('twitter'),
);
