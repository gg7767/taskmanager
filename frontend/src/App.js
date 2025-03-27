import { Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./Layout"
import EmployeeHome from './pages/EmployeeHome';
import ManagerHome from './pages/ManagerHome';
import EmployeeUpdate from "./pages/EmployeeUpdate";
import TaskForm from './pages/TaskForm';
import RoleSelection from './pages/RoleSelection';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import '@aws-amplify/ui-react/styles.css';
import axios from "axios";
import LandingPage from "./pages/LandingPage";
import { SignIn } from "@clerk/clerk-react";

axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage/>}/>
        <Route path="/sign-in" element={<SignIn />} />
        
        {/* Protected Routes */}
        <Route path="/role-selection" element={
          <ProtectedRoute>
            <RoleSelection />
          </ProtectedRoute>
        } />
        
        {/* Role-based Routes */}
        <Route path="/employee" element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['employee']}>
              <EmployeeHome />
            </RoleBasedRoute>
          </ProtectedRoute>
        } />
        <Route path="/manager/:page?" element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['manager']}>
              <ManagerHome />
            </RoleBasedRoute>
          </ProtectedRoute>
        } />
        <Route path="/leadership" element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['leadership']}>
              <div>Leadership Dashboard</div>
            </RoleBasedRoute>
          </ProtectedRoute>
        } />
        <Route path="/createTask" element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['manager', 'leadership']}>
              <TaskForm />
            </RoleBasedRoute>
          </ProtectedRoute>
        } />
        <Route path="/updateEmployee/:id" element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['manager', 'leadership']}>
              <EmployeeUpdate />
            </RoleBasedRoute>
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;
