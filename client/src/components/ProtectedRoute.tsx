import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getDefaultHomePath } from '../utils/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If set, only these roles may view this route; others are sent to their home path. */
  allowedRoles?: readonly string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [allowed, setAllowed] = useState(false);
  const allowedRolesRef = useRef(allowedRoles);
  allowedRolesRef.current = allowedRoles;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const raw = localStorage.getItem('user');

    if (!token || !raw) {
      setAllowed(false);
      navigate('/login', { state: { from: location.pathname }, replace: true });
      return;
    }

    let user: { role?: string };
    try {
      user = JSON.parse(raw);
    } catch {
      setAllowed(false);
      navigate('/login', { replace: true });
      return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const roles = allowedRolesRef.current;
    if (roles?.length && (!user.role || !roles.includes(user.role))) {
      setAllowed(false);
      navigate(getDefaultHomePath(user.role), { replace: true });
      return;
    }

    setAllowed(true);
  }, [navigate, location.pathname]);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
