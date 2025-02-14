import express from "express";
import {
  createJob,
  getJobs,
  getJobsByUser,
  searchJobs,
  applyJob,
  likeJob,
  getJobById,
  deleteJob,
} from "../controllers/jobController.js";
import { requireAuth } from "@clerk/clerk-sdk-node";

const router = express.Router();

router.post("/jobs", requireAuth(), createJob);
router.get("/jobs", getJobs);
router.get("/jobs/user/:id", requireAuth(), getJobsByUser);

// search jobs
router.get("/jobs/search", searchJobs);

// apply for job
router.put("/jobs/apply/:id", requireAuth(), applyJob);

// like job and unlike job
router.put("/jobs/like/:id", requireAuth(), likeJob);

// getJobById
router.get("/jobs/:id", requireAuth(), getJobById);

// delete job
router.delete("/jobs/:id", requireAuth(), deleteJob);

export default router;
