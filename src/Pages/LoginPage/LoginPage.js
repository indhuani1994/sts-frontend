import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../MainLayout.js/MainLayout";

import { API } from "../../API";



const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

 const handleLoginIn =async () => {
    try {
      const res =await  axios.post(`${API}/api/auth`, {username, password});
    
    localStorage.setItem('role', res.data.role);
    navigate('/');

    } catch (error) {
        console.log(error);
        
        alert('Invalid credentials');
    }
   
 }

  return (
    <MainLayout>
    <div className="login-container">
      <div  className="login-form">
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="add" onClick={handleLoginIn}>Login</button>
      </div>
    </div>
    </MainLayout>
  );
};

export default Login;
