import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';

const AutoLogout: React.FC = () => {
  const { token, logout } = useAuth();

  useEffect(() => {
    if (!token) return;

    const checkTokenExpiration = () => {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          logout();
          alert('Your session has expired. Please log in again.');
        }
      } catch (error) {
        console.error('Token decode error:', error);
        logout();
      }
    };

    // Check immediately and set interval
    checkTokenExpiration();
    const intervalId = setInterval(checkTokenExpiration, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [token, logout]);

  return null;
};

export default AutoLogout;