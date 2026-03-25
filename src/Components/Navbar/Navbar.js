import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Navbar.css";

function Navbar() {
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem('user') || '{}');
 
       

  const navigatedTO = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem('user');
    navigatedTO("/");
  };

  console.log(role); 
  console.log('role'); 

  
  
  return (
    <nav className="navbar">
      <div className="navbar-logo">MySite</div>
      <ul className="navbar-menu">
        {/* These links are public - shown to everyone */}
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/gallery">Gallery</Link>
        </li>
         
        
   
        {
          (role === "admin" && (
            <>
              <li>
                <Link to={"/admin-dashboard"}>staff/student Controll</Link>
              </li>
              <li>
                <Link to="/staff-management">Staff </Link>
              </li>
              <li>
                <Link to="/student-management">Student </Link>
              </li>
              <li>
                <Link to="/course-management">Course </Link>
              </li>
              <li>
                <Link to="/placement-management">Placement </Link>
              </li>
               <li>
                <Link to="/Company">Company </Link>
              </li>
                <li>
                <Link to="/stureg">Register</Link>
              </li>
               <li>
                <Link to="/install">Installment</Link>
              </li>
                  <li>
                <Link to="/enquiry">Enquiry</Link>
              </li>

                 <li>
                <Link to="/course-update">schedule</Link>
              </li>
              
            </>
          ))
        }

        {!role && !user.role ? (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </>
        ) : (
          <>
            <li
             
                onClick={handleLogout}
                style={{
                 color: "red",
                 background: "white",
                 padding: "4px"
                }}
              >
                Logout
              
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;



