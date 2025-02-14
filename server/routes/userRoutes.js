import express from "express";
import { getUserProfile } from "../controllers/userController.js";
import { requireAuth } from "@clerk/clerk-sdk-node";

const router = express.Router();

router.get("/check-auth", (req, res) => {
  if (req.auth) {
    return res.status(200).json({
      isAuthenticated: true,
      user: req.auth.user,
    });
  } else {
    return res.status(200).json(false);
  }
});

router.get("/user/:id", requireAuth(), getUserProfile);

export default router;
