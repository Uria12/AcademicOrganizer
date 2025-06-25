import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('authToken', token);
      // Fetch user info and call login
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            login(data.user, token);
          }
          window.location.href = '/dashboard';
        })
        .catch(() => {
          window.location.href = '/login';
        });
    } else {
      navigate('/login');
    }
  }, [login, navigate]);

  return <div>Signing you in with Google...</div>;
};

export default OAuthCallback; 