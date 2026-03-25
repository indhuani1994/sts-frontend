import React from 'react';

import './App.css';

// import { ToastContainer } from 'react-toastify';

import AppRoutes from './AppRoutes/AppRoutes';
import ToastComponent from './Components/ToastComponent/ToastComponent';

const App = () => {
  return (
    <div>
        <AppRoutes />
        <ToastComponent />
    </div>
   
  );
};

export default App;
