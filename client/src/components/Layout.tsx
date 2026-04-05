import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import StaffAppShell, { StaffAppShellUser } from './StaffAppShell';
import { getDefaultHomePath, sidebarItemsForRole } from '../utils/roles';

const Layout: React.FC = () => {
  const [user, setUser] = useState<StaffAppShellUser | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (!user) {
    return null;
  }

  const navigation = sidebarItemsForRole(user.role);
  const roleHome = getDefaultHomePath(user.role);
  const headerTitle =
    navigation.find((item) => item.href === location.pathname)?.name || 'Dashboard';

  return (
    <StaffAppShell
      user={user}
      navigation={navigation}
      roleHome={roleHome}
      headerTitle={headerTitle}
      showApiHealthBanner
    >
      <Outlet />
    </StaffAppShell>
  );
};

export default Layout;
