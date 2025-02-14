import express from "express";
import { withAuth, clerkClient } from "@clerk/clerk-sdk-node";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connect from "./db/connect.js";
import fs from "fs";
import User from "./models/UserModel.js";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const ensureUserInDB = async (userId) => {
  try {
    const user = await clerkClient.users.getUser(userId);
    const existingUser = await User.findOne({ clerkId: user.id });

    if (!existingUser) {
      const newUser = new User({
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName + " " + user.lastName,
        profilePicture: user.imageUrl,
        role: "jobseeker",
      });
      await newUser.save();
      console.log("User added to db", newUser);
    }
  } catch (error) {
    console.log("Error checking or adding user to db", error.message);
  }
};

app.get("/", withAuth, async (req, res) => {
  if (req.auth) {
    await ensureUserInDB(req.auth.userId);
    return res.redirect(process.env.CLIENT_URL);
  } else {
    return res.send("Logged out");
  }
});

const routeFiles = fs.readdirSync("./routes");
routeFiles.forEach((file) => {
  import(`./routes/${file}`)
    .then((route) => app.use("/api/v1/", route.default))
    .catch((error) => console.log("Error importing route", error));
});

const server = async () => {
  try {
    await connect();
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("Server error", error.message);
    process.exit(1);
  }
};

server();
