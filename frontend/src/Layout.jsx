import React from 'react'
import Header from './components/Header'
import { Outlet } from 'react-router-dom'
import { UserContextProvider } from './UserContext'

const Layout = () => {
  return (
    <div className='p-4'>
        <Header />
        <Outlet />
      
    </div>
  )
}

export default Layout