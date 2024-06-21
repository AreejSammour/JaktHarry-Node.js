import React, { useState,useContext } from "react";
import "../assets/styles/updatePassword.scss";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/authContext.js";

const UpdatePassword = () => {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        setMessage("Lösenordet måste vara en kombination av bokstäver och siffror och ha minst åtta tecken.");
        return;
      }

      if (!oldPassword) {
        setMessage("Vänligen ange ditt gamla lösenord.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setMessage("Nytt lösenord och bekräftelselösenord måste matcha");
        return;
      }

      setIsLoading(true);

      const data = {
        oldPassword,
        newPassword,
        confirmPassword,
        userId: currentUser.id
      };
      console.log(data)

      const token = localStorage.getItem('accessToken');
      console.log("token",token)
      const headers = { Authorization: `Bearer ${token}` };
      // Send request to backend API
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/users/update-password`, data, { headers });
      console.log(response)

      setMessage("Lösenordet har uppdaterats");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsLoading(false); // Reset loading state
      navigate("/login"); // Redirect user
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage("Det gick inte att uppdatera ditt lösenord");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="password-update-form-container">
      <h2>Lösenord Uppdatering</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleUpdatePassword}>
        <div className="form-group">
          <label htmlFor="oldPassword">Gammalt lösenord :</label>
          <input
            type="password"
            id="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">Nytt lösenord :</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Bekräfta lösenord :</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          Uppdatera lösenord
        </Button>
      </form>
    </div>
  );
};

export default UpdatePassword;