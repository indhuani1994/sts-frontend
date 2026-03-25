import React, { useState } from 'react'

export const EnquiryContext = React.createContext();


const EnquiryContextProvider = ({children}) => {
  const [count, setCount] = useState(null);
  const handleCount = (val) => {
    setCount(val);
  } 
  return (
    <EnquiryContext.Provider value={{count,handleCount}}>
        {children}
    </EnquiryContext.Provider>
  )
}

export default EnquiryContextProvider;