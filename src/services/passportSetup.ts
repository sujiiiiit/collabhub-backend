import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { userCollection } from "../config/db";
import { ObjectId } from "mongodb";

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userCollection.findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: `${process.env.SERVER_URL}/auth/github/callback`,
      scope: ["user:email", "repo"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: (error: any, user?: any) => void
    ) => {
      try {
        const email = profile.emails?.[0]?.value || "Private";
        const existingUser = await userCollection.findOne({
          githubId: profile.id,
        });

        if (existingUser) {
          await userCollection.updateOne(
            { githubId: profile.id },
            { $set: { accessToken } }
          );
          return done(null, existingUser);
        } else {
          const newUser = {
            username: profile.username,
            email,
            githubId: profile.id,
            accessToken,
          };

          const result = await userCollection.insertOne(newUser);
          const newUserWithId = await userCollection.findOne({
            _id: result.insertedId,
          });
          return done(null, newUserWithId);
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);
