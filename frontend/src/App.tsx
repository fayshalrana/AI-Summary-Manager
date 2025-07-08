import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { getCurrentUser } from './store/slices/userSlice';
import AuthForm from './components/AuthForm';
import DashboardLayout from './components/DashboardLayout';

const App: React.FC = () => {
  const { user, isAuthenticated, token } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();

  // On mount, if token exists but no user, fetch user info
  useEffect(() => {
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [token, user, dispatch]);

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
