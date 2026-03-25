import React from 'react'
import MainLayout from '../../../MainLayout.js/MainLayout';

const StaffHomePage = () => {
  const name = localStorage.getItem('loggedInName');
  return (
    <MainLayout>
    <div>
      <h1>hello {name}</h1>
    </div>
    </MainLayout>
  )
}
   
export default StaffHomePage;
