import React, { useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: (isAuthenticated: boolean) => ReactNode;
  }

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Use the useEffect hook to make a request to /api/check_login
  useEffect(() => {
    // Perform the authentication check
    fetch('/api/check_login')
      .then((response) => {
        if (response.status === 200) {
          // User is authenticated
          setIsAuthenticated(true);
        } else {
          // User is not authenticated
          setIsAuthenticated(false);
        }
      })
      .catch((error) => {
        // Handle network or request error
        console.error('Error checking login status:', error);
        setIsAuthenticated(false);
      });
  }, []);

  // Render children based on the authentication status
  return isAuthenticated === null ? null : children(isAuthenticated);
}

export default ProtectedRoute;
