import {useState, useEffect} from "react"
import axios from 'axios'
const { createContext } = require("react");



export const UserContext = createContext({});

export function UserContextProvider({children}){
    
    const[user, setUser] = useState(null)
    useEffect(()=>{
        if(!user){
            axios.get('/profile')
            .then(({data})=>{
                console.log(data)
                setUser(data)
            })
            .catch((error)=>{
                console.log(error)
            })
            
        }
    },[])
    return(
        <UserContext.Provider value = {{user, setUser}}>
            {children}
        </UserContext.Provider>
    );
}

