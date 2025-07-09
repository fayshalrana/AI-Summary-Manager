import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { getCurrentUser } from './store/slices/userSlice';
import AuthForm from './components/AuthForm';
import DashboardLayout from './components/DashboardLayout';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const { user, isAuthenticated, token, loading } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  // On mount, if token exists but no user, fetch user info
  useEffect(() => {
    if (token && !user) {
      dispatch(getCurrentUser());
    } else if (!token) {
      // If no token, we're done initializing
      setIsInitializing(false);
    }
  }, [token, user, dispatch]);

  // Mark as not initializing once we have a result
  useEffect(() => {
    if (!loading && (user || !token)) {
      setIsInitializing(false);
    }
  }, [loading, user, token]);

  // Show loading spinner during initial authentication check
  if (isInitializing || (token && !user && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 w-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated && user ? (
              <DashboardLayout />
            ) : (
              <AuthForm />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
