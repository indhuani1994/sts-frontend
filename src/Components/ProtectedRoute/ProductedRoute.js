import React from 'react'
import { Navigate } from 'react-router-dom';

function ProductedRoute({children}) {
    const isAuthenticated = localStorage.getItem('role') === 'admin';

  return isAuthenticated ? children : <Navigate to={'/'}/>
}

export default ProductedRoute;
