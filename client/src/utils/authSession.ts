import axios from 'axios';
import type { NavigateFunction } from 'react-router-dom';

export function clearSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common['Authorization'];
}

export function logout(navigate: NavigateFunction): void {
  clearSession();
  navigate('/login', { replace: true });
}
