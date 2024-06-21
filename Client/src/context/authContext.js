import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext()

export const AuthContextProvider = ({children})=>{
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem("user")|| null))

  const login = async (inputs) => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, inputs);
      if (res.data && res.data.token) {
        // Assuming the response contains user data and a token
        setCurrentUser(res.data); // Set current user data 
        // Store token in local storage or state for future requests
        localStorage.setItem('accessToken', res.data.token);
      } else {
        // Handle the case where the response does not contain the expected user data or token
        console.error('Login failed: Unexpected response format');
      }
    } catch (error) {
      // Handle error (e.g., show a message to the user)
      console.error('Login failed:', error.message);
    }
  };

  const logout = async(inputs)=>{
    await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`);
    localStorage.removeItem("accessToken");
    setCurrentUser(null);
  };

  useEffect(() => {
    const updateLastActivity = async () => {
      try {
        if (currentUser && currentUser.id) {
          await axios.put(
            `${process.env.REACT_APP_API_URL}/api/users/update-last-activity/${currentUser.id}`
          );
          setCurrentUser((prevUser) => ({
            ...prevUser,
            lastActivity: new Date().toISOString(),
          }));
        }
      } catch (error) {
        console.error("Error updating last activity:", error.message);
      }
    };

    const interval = setInterval(updateLastActivity, 60000); // Update every 1 minute
    // const interval = setInterval(updateLastActivity, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(()=>{
    localStorage.setItem("user", JSON.stringify(currentUser));
  },[currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, login, logout }}>{children}</AuthContext.Provider>
  );
};