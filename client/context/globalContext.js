import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useUser, useAuth } from "@clerk/nextjs";

const GlobalContext = createContext();

axios.defaults.baseURL = "https://jobfindr-main.onrender.com";
axios.defaults.withCredentials = true;

export const GlobalContextProvider = ({ children }) => {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [userProfile, setUserProfile] = useState({});
  const [loading, setLoading] = useState(false);

  // input state
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [salary, setSalary] = useState(0);
  const [activeEmploymentTypes, setActiveEmploymentTypes] = useState([]);
  const [salaryType, setSalaryType] = useState("Year");
  const [negotiable, setNegotiable] = useState(false);
  const [tags, setTags] = useState([]);
  const [skills, setSkills] = useState([]);
  const [location, setLocation] = useState({
    country: "",
    city: "",
    address: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isSignedIn && user) {
        setLoading(true);
        try {
          const token = await getToken();
          const res = await axios.get(`/api/v1/user/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserProfile(res.data);
        } catch (error) {
          console.log("Error fetching user profile", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [isSignedIn, user, getToken]);

  const resetJobForm = () => {
    setJobTitle("");
    setJobDescription("");
    setSalary(0);
    setActiveEmploymentTypes([]);
    setSalaryType("Year");
    setNegotiable(false);
    setTags([]);
    setSkills([]);
    setLocation({
      country: "",
      city: "",
      address: "",
    });
  };

  return (
    <GlobalContext.Provider
      value={{
        isAuthenticated: isSignedIn,
        user,
        userProfile,
        loading,
        jobTitle,
        jobDescription,
        salary,
        activeEmploymentTypes,
        salaryType,
        negotiable,
        tags,
        skills,
        location,
        setJobTitle,
        setJobDescription,
        setSalary,
        setActiveEmploymentTypes,
        setSalaryType,
        setNegotiable,
        setTags,
        setSkills,
        setLocation,
        resetJobForm,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
