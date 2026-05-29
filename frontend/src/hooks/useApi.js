import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL;

export function useApi() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const request = useCallback(
    async (url, options = {}) => {
      const token = localStorage.getItem('token');

      const headers = {
        ...options.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      try {
        const fullUrl = url.startsWith('http')
          ? url
          : `${BASE_URL}${url}`;

        const response = await fetch(fullUrl, {
          ...options,
          headers,
        });

        if (response.status === 401) {
          console.warn(
            'API returned 401. Local session token is invalid or expired.'
          );

          localStorage.removeItem('token');

          await signOut();

          navigate('/login', { replace: true });

          throw new Error(
            'Session expired. Please log in again.'
          );
        }

        return response;
      } catch (err) {
        console.error(
          'Network or API error:',
          err
        );
        throw err;
      }
    },
    [signOut, navigate]
  );

  return { request };
}