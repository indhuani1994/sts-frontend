import React from 'react'
import { Navigate } from 'react-router-dom';

const PublicRoutesProtect = ({children}) => {

 const role = localStorage.getItem('role');

 if(role == 'admin') {
    return <Navigate  to={'/admin-dashboard'} replace
    />
  
 
 }

 if(role == 'staff' || role == 'hr') {
    return <Navigate  to={'/staff-profile'} replace
    />
  
 
 }

    if(role == 'student') {
        return <Navigate  to={'/student-profile'} replace
        />
      
    }




  return children;
}

export default PublicRoutesProtect