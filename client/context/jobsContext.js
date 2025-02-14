"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const JobsContext = createContext();

axios.defaults.baseURL = "https://jobfindr-main.onrender.com";
axios.defaults.withCredentials = true;

export const JobsContextProvider = ({ children }) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userJobs, setUserJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState({ tags: "", location: "", title: "" });
  const [filters, setFilters] = useState({
    fullTime: false,
    partTime: false,
    internship: false,
    contract: false,
    fullStack: false,
    backend: false,
    devOps: false,
    uiux: false,
  });
  const [minSalary, setMinSalary] = useState(30000);
  const [maxSalary, setMaxSalary] = useState(120000);

  const getJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/v1/jobs");
      setJobs(res.data);
    } catch (error) {
      console.error("Error getting jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData) => {
    try {
      const res = await axios.post("/api/v1/jobs", jobData);
      toast.success("Job created successfully");
      setJobs((prevJobs) => [res.data, ...prevJobs]);
      if (user?.id) {
        setUserJobs((prevUserJobs) => [res.data, ...prevUserJobs]);
        await getUserJobs(user.id);
      }
      await getJobs();
      router.push(`/job/${res.data._id}`);
    } catch (error) {
      console.error("Error creating job", error);
    }
  };

  const getUserJobs = async (userId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/v1/jobs/user/${userId}`);
      setUserJobs(res.data);
    } catch (error) {
      console.error("Error getting user jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const searchJobs = async (tags, location, title) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (tags) query.append("tags", tags);
      if (location) query.append("location", location);
      if (title) query.append("title", title);
      const res = await axios.get(`/api/v1/jobs/search?${query.toString()}`);
      setJobs(res.data);
    } catch (error) {
      console.error("Error searching jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const getJobById = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/v1/jobs/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error getting job by id", error);
    } finally {
      setLoading(false);
    }
  };

  const likeJob = async (jobId) => {
    try {
      const res = await axios.put(`/api/v1/jobs/like/${jobId}`);
      toast.success("Job liked successfully");
      getJobs();
    } catch (error) {
      console.error("Error liking job", error);
    }
  };

  const applyToJob = async (jobId) => {
    const job = jobs.find((job) => job._id === jobId);
    if (job && job.applicants.includes(user?.id)) {
      toast.error("You have already applied to this job");
      return;
    }
    try {
      const res = await axios.put(`/api/v1/jobs/apply/${jobId}`);
      toast.success("Applied to job successfully");
      getJobs();
    } catch (error) {
      console.error("Error applying to job", error);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  const deleteJob = async (jobId) => {
    try {
      await axios.delete(`/api/v1/jobs/${jobId}`);
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
      setUserJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
      toast.success("Job deleted successfully");
    } catch (error) {
      console.error("Error deleting job", error);
    }
  };

  const handleSearchChange = (searchName, value) => {
    setSearchQuery((prev) => ({ ...prev, [searchName]: value }));
  };

  const handleFilterChange = (filterName) => {
    setFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  useEffect(() => {
    if (isLoaded) getJobs();
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded && user?.id) {
      getUserJobs(user.id);
    }
  }, [isLoaded, user?.id]);

  return (
    <JobsContext.Provider
      value={{
        jobs,
        loading,
        createJob,
        userJobs,
        searchJobs,
        getJobById,
        likeJob,
        applyToJob,
        deleteJob,
        handleSearchChange,
        searchQuery,
        setSearchQuery,
        handleFilterChange,
        filters,
        minSalary,
        setMinSalary,
        maxSalary,
        setMaxSalary,
        setFilters,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
};

export const useJobsContext = () => useContext(JobsContext);
