import React from 'react';
import { Navigate } from 'react-router-dom';
import { getDefaultHomePath } from '../utils/roles';
import LandingPage from '../pages/LandingPage';

/**
 * Public marketing landing. Authenticated users are sent to their role home.
 */
const PublicLandingOrRedirect: React.FC = () => {
  const token = localStorage.getItem('token');
  const raw = localStorage.getItem('user');
  if (token && raw) {
    try {
      const user = JSON.parse(raw) as { role?: string };
      return <Navigate to={getDefaultHomePath(user.role)} replace />;
    } catch {
      /* show landing */
    }
  }
  return <LandingPage />;
};

export default PublicLandingOrRedirect;
