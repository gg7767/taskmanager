import React from 'react'
import {useContext} from 'react';
import {UserContext} from '../UserContext'
import { Navigate } from 'react-router-dom';
const IndexPage = () => {
  const {user} = useContext(UserContext)
  if(!user){
    console.log("no user found")
  }
  if(user && user?.Role ==='Employee'){
    return <Navigate to='/employee' />
  }
  else if(user && user?.Role === 'Manager'){
    return <Navigate to='/manager' />
  }
  return<Navigate to='/login' />
}

export default IndexPage