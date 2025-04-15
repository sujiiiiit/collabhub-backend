import express, { Request, Response } from "express";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import session from "express-session";
import cors from "cors";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Update with your frontend URL
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

// MongoDB connection setup
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not defined");
}
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const connectDB = async () => {
  try {
    await client.connect();
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

connectDB();

const db = client.db("collabhub");
const userCollection = db.collection("user");
const rolePostCollection = db.collection("rolePost");

// Session and Passport setup
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

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

// GitHub OAuth setup
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
          return done(null, existingUser);
        } else {
          const newUser = {
            username: profile.username,
            email,
            githubId: profile.id,
            accessToken, // store access token for fetching repos later
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

// Routes
app.get("/auth/github", passport.authenticate("github"));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    successRedirect: process.env.CLIENT_URL,
  })
);

app.get("/auth/user", (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.post("/auth/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
});

// Add this route to app.ts

app.get("/auth/github/repos", async (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const accessToken = (req.user as any).accessToken; // assuming you're saving the accessToken when user logs in

  // console.log(accessToken)

  try {
    const response = await fetch("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const repos = await response.json();
    res.json(repos);
  } catch (err) {
    console.error("Error fetching repos:", err);
    res.status(500).json({ message: "Failed to fetch repositories" });
  }
});

app.post("/api/roles", async (req: Request, res: Response) => {
  try {
    await client.connect();

    const {
      name_1498371116,
      name_6998689863,
      name_3377255024,
      name_0160577085,
      address,
      description,
      userId,
    } = req.body;

    const newRole = {
      name_1498371116,
      name_6998689863,
      name_3377255024,
      name_0160577085,
      address,
      description,
      userId,
    };

    const result = await rolePostCollection.insertOne(newRole);

    res
      .status(201)
      .json({
        message: "Role created successfully",
        roleId: result.insertedId,
      });
  } catch (error) {
    console.error("Error inserting role:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close();
  }
});

app.get("/api/roles", async (req: Request, res: Response) => {
  try {
    await client.connect();
    const roles = await rolePostCollection.find({}).toArray();

    res.status(200).json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close();
  }
});

export default app;
