import React from 'react'
import { Navigate } from 'react-router-dom';

const PublicRoute = ({children, role}) => {
 

    if(role === 'staff') {
        return <Navigate to={'/staff'} replace/>
    }

    if(role === 'hr') {
        return <Navigate to={'/staff-profile'} replace/>
    }

    if(role === 'student') {
        return <Navigate to={'/student'} replace/>
    }

    if(role === 'admin') {
        return <Navigate to={'/admin-dashboard'} replace/>
    }



    return children;
}

export default PublicRoute
