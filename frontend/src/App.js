import { Route, Routes } from "react-router-dom";
import "./App.css";
import LoginForm from "./pages/LoginForm";
import Layout from "./Layout"
import IndexPage from "./pages/IndexPage";
import AccountPage from "./pages/AccountPage";
import RegisterFom from './pages/RegisterForm'
import EmployeeHome from './pages/EmployeeHome';
import ManagerHome from './pages/ManagerHome';
import EmployeeUpdate from "./pages/EmployeeUpdate";
import TaskForm from './pages/TaskForm';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import '@aws-amplify/ui-react/styles.css';
import axios from "axios";
import { UserContextProvider } from "./UserContext";



axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;
Amplify.configure({
  Auth: {
    region: awsExports.REGION,
    userPoolId: awsExports.USER_POOL_ID,
    userPoolWebClientId: awsExports.USER_POOL_APP_CLIENT_ID
}
})

function App() {
  return (
    // <Authenticator variation="modal" formFields={formFields} signUpAttributes={signupAttributes}>
    //         {({ signOut, user }) => (
    //             <div>
    //                 <p>Welcome {user.attributes.given_name}</p>
    //                 <button onClick={signOut}>Sign out</button>
    //             </div>
    //         )}
    //     </Authenticator>
    <UserContextProvider>
        <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path='/register' element={<RegisterFom />} />
          <Route path= '/account' element={<AccountPage />} />
          <Route path= '/employee' element={<EmployeeHome/>} />
          <Route path="/manager/:page?" element={<ManagerHome/>} /> 
          <Route path='/createTask' element={<TaskForm />} />
          <Route path="/updateEmployee/:id" element={<EmployeeUpdate />} />
        
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App;
