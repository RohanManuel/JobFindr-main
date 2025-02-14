import asyncHandler from "express-async-handler";
import Job from "../models/JobModel.js";
import { clerkClient } from '@clerk/clerk-sdk-node';

export const createJob = asyncHandler(async (req, res) => {
  try {
    const userId = req.auth?.actor || req.auth?.userId;
    if (!userId) return res.status(401).json({ message: "Not Authorized" });

    const { title, description, location, salary, jobType, tags, skills, salaryType, negotiable } = req.body;
    if (!title || !description || !location || !salary || !jobType || !tags || !skills) 
      return res.status(400).json({ message: "All fields are required" });

    const job = new Job({ title, description, location, salary, jobType, tags, skills, salaryType, negotiable, createdBy: userId });
    await job.save();
    return res.status(201).json(job);
  } catch (error) { return res.status(500).json({ message: "Server Error" }); }
});

export const getJobs = asyncHandler(async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    const populatedJobs = await Promise.all(jobs.map(async (job) => {
      const user = await clerkClient.users.getUser(job.createdBy);
      return { ...job.toObject(), createdBy: { name: user.fullName, profileImage: user.imageUrl } };
    }));
    return res.status(200).json(populatedJobs);
  } catch (error) { return res.status(500).json({ message: "Server Error" }); }
});

export const getJobsByUser = asyncHandler(async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.params.id }).sort({ createdAt: -1 });
    return res.status(200).json(jobs);
  } catch (error) { return res.status(500).json({ message: "Server Error" }); }
});

export const searchJobs = asyncHandler(async (req, res) => {
  try {
    const { tags, location, title } = req.query;
    let query = {};
    if (tags) query.tags = { $in: tags.split(',') };
    if (location) query.location = { $regex: location, $options: 'i' };
    if (title) query.title = { $regex: title, $options: 'i' };
    const jobs = await Job.find(query);
    return res.status(200).json(jobs);
  } catch (error) { return res.status(500).json({ message: "Server Error" }); }
});

export const applyJob = asyncHandler(async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    const userId = req.auth?.actor || req.auth?.userId;
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.applicants.includes(userId)) return res.status(400).json({ message: "Already applied" });
    job.applicants.push(userId);
    await job.save();
    return res.status(200).json(job);
  } catch (error) { return res.status(500).json({ message: "Server Error" }); }
});

export const likeJob = asyncHandler(async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    const userId = req.auth?.actor || req.auth?.userId;
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.likes.includes(userId)) {
      job.likes = job.likes.filter(id => id !== userId);
    } else {
      job.likes.push(userId);
    }
    await job.save();
    return res.status(200).json(job);
  } catch (error) { return res.status(500).json({ message: "Server Error" }); }
});

export const getJobById = asyncHandler(async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    const user = await clerkClient.users.getUser(job.createdBy);
    return res.status(200).json({ ...job.toObject(), createdBy: { name: user.fullName, profileImage: user.imageUrl } });
  } catch (error) { return res.status(500).json({ message: "Server Error" }); }
});

export const deleteJob = asyncHandler(async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    const userId = req.auth?.actor || req.auth?.userId;
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.createdBy.toString() !== userId) return res.status(403).json({ message: "Not authorized" });
    await job.deleteOne();
    return res.status(200).json({ message: "Job deleted" });
  } catch (error) { return res.status(500).json({ message: "Server Error" }); }
});
