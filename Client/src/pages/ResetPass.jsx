import React, { useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const ResetPass = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      // Send request to backend to handle forgot password
      await axios.get(`${process.env.REACT_APP_API_URL}/api/users/reset?email=${email}`);
      
      setSuccess(true);
      navigate("/login");
    } catch (err) {
      setError(err.response.data.error);
    }
  };

  return (
    <Container className='auth'>
      <h1>Glömt ditt lösenord</h1>
      <form onSubmit={handleSubmit}>
        <input required type="email" placeholder='Ange registrerad e-postadress' name="email" value={email} onChange={handleChange} className='w-75 mx-auto'/>
        <Button type="submit" className='w-75 mx-auto mt-2'>Skicka nytt lösenord</Button>
        {error && <p><strong>{error}</strong></p>}
        {success && <p><strong>En e-post med instruktioner för att återställa lösenordet har skickats till {email}.</strong></p>}
        <span>Har du inget konto?.. <Link to="/register">Registrera</Link></span>
      </form>
      <Link className='HemClass nav-link' to="/">Gå hem ..</Link>
    </Container>
  );
}

export default ResetPass;
