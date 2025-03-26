import React, { useContext } from 'react'
import {UserContext} from '../UserContext'
import axios from 'axios'
import { Navigate, useNavigate } from 'react-router-dom'
import Button from "@mui/material/Button";


const AccountPage = () => {
  const navigate = useNavigate()
  const {user} = useContext(UserContext)
  if(!user){
    return <Navigate to='/login'/>
  }

  function handleLogout(){
    axios.post('/logout')
    .then((res)=>{
      navigate('/login')
      navigate(0)
      console.log(res);
    })
    .catch((err)=>{
      console.log(err)
    })
  }

  return (
    <div className="items-center text-center">
        <h1 className ="text-3xl text-center mt-4 border-b-2 py-4">Account Home</h1>
        {user? <div className = "py-4">Name: {user.firstName}</div> : <div>User not loaded...</div>}
        {user? <div className = 'mb-4'> Email: {user.email}</div> :<div>User not loaded...</div>}
        {user? <div> Role: {user.role}</div> :<div>User not loaded...</div>}

        <button onClick={handleLogout} className='py-1 mt-4 px-3'>
        <Button variant="contained">Logout</Button>
        </button>
    </div>
  )
}

export default AccountPage