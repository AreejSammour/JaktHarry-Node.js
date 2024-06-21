
import React, { useContext, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';

const Login = () => {

  const [inputs,setInputs] = useState({
    username:"",
    password:"",
  })

  const [err,setError] = useState(null);

  const navigate = useNavigate();

  const { login} = useContext(AuthContext);

  const handleChange = e =>{
    setInputs(prev=>({...prev, [e.target.name]: e.target.value}))
  };

  const handleSubmit = async e =>{
    e.preventDefault();
    try{
      await login(inputs);
      navigate("/");
    }catch(err){
      setError(err.response.data);
    }
  };
  return (
    <Container className='auth'>
      <h1>Logga in</h1>
      <form>
        <input required type="text" placeholder='Användarnamn ' name="username" onChange={handleChange} className='w-75'/>
        <input required type="password" placeholder='Lösenord' name="password" onChange={handleChange} className='w-75'/>
        <Button onClick={handleSubmit}>Logga in</Button>
        <span className='text-end text-danger'><Link className='link' to="/ResetPass">Glömt lösenord !.. </Link></span>
        {err && <p>{err}</p>}
        <span className='text-end'>Har du inget konto?.. <Link to="/register">Registrera</Link></span>
      </form>
      <Link className='HemClass nav-link' to="/">Gå hem ..</Link>
    </Container>
  );
}

export default Login;
