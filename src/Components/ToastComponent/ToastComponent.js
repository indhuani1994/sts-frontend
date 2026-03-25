import React from 'react'
import {Toaster} from 'react-hot-toast';


const ToastComponent = () => {
  return (
    <div>
       <Toaster
  position="top-center"
  reverseOrder={false}
  gutter={8}
  containerClassName=""
  containerStyle={{}}
  toastOptions={{
    // Define default options
    className: '',
    duration: 5000,
    removeDelay: 1000,
    style: {
      background: '#fffdfdff',
      color: '#000',
    },

    // Default options for specific types
    success: {
      duration: 3000,
       className: 'shiny-border-toast',
      
      iconTheme: {
        primary: 'green',
        secondary: '#fff',

      },

    },
     error: {
            duration: 3000,
            className: 'glassy-red-border-toast',
          },
  }}
/>
    </div>
  )
}

export default ToastComponent
