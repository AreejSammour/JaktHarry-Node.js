import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Button} from 'react-bootstrap';
import message from "../img/message.png";
import telephone from "../img/telephone.png";
import user from "../img/user.png";
import padlock from "../img/padlock.png";

const Register = () => {
  const [inputs,setInputs] = useState({
    username:"",
    email:"",
    password:"",
    role: 0,
    phone:"",
    firstName:"",
    lastName:"",
  })

  const [err,setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = e =>{
    setInputs(prev=>({...prev, [e.target.name]: e.target.value}))
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!inputs.email || !inputs.password) {
        return setError(!inputs.email && !inputs.password ? "Email and Password is Required!" : !inputs.email ? "Email is required!" : !inputs.password ? "Password is Required!" : '')
      }
      if (!passwordRegex.test(inputs.password)) {
        setError("Lösenordet måste vara en kombination av bokstäver och siffror och ha minst åtta tecken.")
        return 0
      } else {
        console.log("Password is valid.");
        setError("")
        await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, inputs);
        navigate("/Login");
      }
    } catch (err) {
      setError(err.response.data);
    }
  };

  return (
    <Container className='auth'>
      <div className="authDiv">
      <h1>Registreringsformulär</h1>
      <form >
        <div>
            <label><img src={user} alt="" style={{ width: '15px',height: '15px' }}/> Användarnamn</label>
            <span><input required type="text" placeholder='Välj användarnamn' name='username' onChange={handleChange} /></span>
        </div>
        <div>
            <label>Förnamn</label>
            <span><input required type="text" placeholder='skriv in ditt förnamn' name='firstName' onChange={handleChange}/></span>
        </div>
        <div>
            <label>Efternamn</label>
            <span><input required type="text" placeholder='Skriv in ditt efternamn' name='lastName' onChange={handleChange}/></span>
        </div>
        
        <div>
            <label><img src={message} alt="" style={{ width: '15px',height: '15px' }}/></label>
            <span><input required type="email" placeholder='e-post' name='email' onChange={handleChange}/></span>
        </div>
        <div>
            <label><img src={telephone} alt="" style={{ width: '15px',height: '15px' }}/></label>
            <span><input required type="number" placeholder='telefonnummer' name='phone' onChange={handleChange}/></span>
        </div>
        <div>
            <label><img src={padlock} alt="" style={{ width: '15px',height: '15px' }}/></label>
            <span><input required type="password" placeholder='Lösenord' name='password' onChange={handleChange}/></span>
        </div>
        <Button onClick={handleSubmit}>Registrera</Button>
        {err && <p>{err}</p>}
        <span>Har du ett konto?.. <Link to="/Login">Logga in</Link></span>
      </form>
      </div>
    </Container>
  );
}

export default Register;

