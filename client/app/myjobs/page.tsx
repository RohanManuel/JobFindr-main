"use client";
import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import MyJob from "@/Components/JobItem/MyJob";
import { useUser } from "@clerk/nextjs";
import { useJobsContext } from "@/context/jobsContext";
import { Job } from "@/types/types";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

function Page() {
  const { userJobs, jobs } = useJobsContext();
  const { isSignedIn, user, isLoaded } = useUser();

  const [activeTab, setActiveTab] = React.useState("posts");

  const userId = user?.id || ""; // Ensures userId is always a string

  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("https://jobfindr-main.onrender.com");
    }
  }, [isSignedIn, isLoaded, router]);

  const likedJobs = jobs.filter((job: Job) => job.likes.includes(userId));

  if (!isLoaded) {
    return null;
  }

  return (
    <div>
      <Header />

      <div className="mt-8 w-[90%] mx-auto flex flex-col">
        <div className="self-center flex items-center gap-6">
          <button
            className={`border border-gray-400 px-8 py-2 rounded-full font-medium ${
              activeTab === "posts" ? "border-transparent bg-[#7263F3] text-white" : "border-gray-400"
            }`}
            onClick={() => setActiveTab("posts")}
          >
            My Job Posts
          </button>
          <button
            className={`border border-gray-400 px-8 py-2 rounded-full font-medium ${
              activeTab === "likes" ? "border-transparent bg-[#7263F3] text-white" : "border-gray-400"
            }`}
            onClick={() => setActiveTab("likes")}
          >
            Liked Jobs
          </button>
        </div>

        {activeTab === "posts" && userJobs.length === 0 && (
          <div className="mt-8 flex items-center">
            <p className="text-2xl font-bold">No job posts found.</p>
          </div>
        )}

        {activeTab === "likes" && likedJobs.length === 0 && (
          <div className="mt-8 flex items-center">
            <p className="text-2xl font-bold">No liked jobs found.</p>
          </div>
        )}

        <div className="my-8 grid grid-cols-2 gap-6">
          {activeTab === "posts" && userJobs.map((job: Job) => <MyJob key={job._id} job={job} />)}

          {activeTab === "likes" && likedJobs.map((job: Job) => <MyJob key={job._id} job={job} />)}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Page;
