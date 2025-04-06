import { Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./Layout"
import EmployeeHome from './pages/EmployeeHome';
import ManagerHome from './pages/ManagerHome';
import EmployeeUpdate from "./pages/EmployeeUpdate";
import CreateTask from './pages/CreateTask';
import RoleSelection from './pages/RoleSelection';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import '@aws-amplify/ui-react/styles.css';
import axios from "axios";
import LandingPage from "./pages/LandingPage";
import { SignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import AddEmployee from "./pages/AddEmployee";
import useUserRole from './hooks/useUserRole';
import TaskDiscussion from "./pages/TaskDiscussion"; // ✅ Import the discussion page

axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

function App() {
  const { userDb, isLoading } = useUserRole();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <>
              <SignedIn>
                {isLoading ? (
                  <div className="flex items-center justify-center h-screen bg-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
                  </div>
                ) : userDb?.role ? (
                  <Navigate to={`/${userDb.role}`} replace />
                ) : (
                  <Navigate to="/role-selection" replace />
                )}
              </SignedIn>
              <SignedOut>
                <LandingPage />
              </SignedOut>
            </>
          }
        />

        <Route path="/sign-in" element={<SignIn />} />

        <Route path="/role-selection" element={
          <ProtectedRoute>
            <RoleSelection />
          </ProtectedRoute>
        } />

        <Route path="/employee" element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['employee']}>
              <EmployeeHome />
            </RoleBasedRoute>
          </ProtectedRoute>
        } />
        <Route path="/manager" element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['manager']}>
              <ManagerHome />
            </RoleBasedRoute>
          </ProtectedRoute>
        } />
        <Route path="/manager/add-employee" element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['manager', 'leadership']}>
              <AddEmployee />
            </RoleBasedRoute>
          </ProtectedRoute>
        } />
        <Route path="/manager/create-task" element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['manager', 'leadership']}>
              <CreateTask />
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
        <Route path="/task/:taskId/discussion" element={
          <ProtectedRoute>
            <TaskDiscussion />
          </ProtectedRoute>
        } />
        <Route path="/leadership" element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['leadership']}>
              <div>Leadership Dashboard</div>
            </RoleBasedRoute>
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;
