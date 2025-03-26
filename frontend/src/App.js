import { Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./Layout"
import AccountPage from "./pages/AccountPage";
import EmployeeHome from './pages/EmployeeHome';
import ManagerHome from './pages/ManagerHome';
import EmployeeUpdate from "./pages/EmployeeUpdate";
import TaskForm from './pages/TaskForm';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import '@aws-amplify/ui-react/styles.css';
import axios from "axios";
import LandingPage from "./pages/LandingPage";




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
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage/>}/>
            <Route path= '/account' element={<AccountPage />} />
            <Route path= '/employee' element={<EmployeeHome/>} />
            <Route path="/manager/:page?" element={<ManagerHome/>} /> 
            <Route path='/createTask' element={<TaskForm />} />
            <Route path="/updateEmployee/:id" element={<EmployeeUpdate />} />
        </Route>
      </Routes>
    
  );
}

export default App;
