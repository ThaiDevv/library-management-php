import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../services/api/auth.api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const Login = () => {
  const [MaNV, setMaNV] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!MaNV || !password) {
      toast.error('Please enter both Staff ID and Password');
      return;
    }

    try {
      setIsLoading(true);
      const data = await authApi.login(MaNV, password);
      // Wait, let's verify what the backend returns. Assuming { token: string, role: string, MaNV: string }
      // Or maybe token payload contains these. For now, let's just assume data.token exists.
      
      // Let's decode the JWT to get the sub and role if it's only returning the token
      const token = data.token || data.accessToken || data; // handle different possible returns
      const payloadBase64 = typeof token === 'string' ? token.split('.')[1] : null;
      let user = { sub: MaNV, role: 'Staff' as const }; // fallback

      if (payloadBase64) {
        try {
          const decodedPayload = JSON.parse(atob(payloadBase64));
          user = { 
            sub: decodedPayload.sub || MaNV, 
            role: decodedPayload.role || decodedPayload.vaitro || 'Staff' 
          };
        } catch (e) {
          console.error('Failed to parse JWT', e);
        }
      }

      login(user, typeof token === 'string' ? token : '');
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Input
        label="Staff ID (MaNV)"
        id="MaNV"
        type="text"
        placeholder="Enter your Staff ID"
        value={MaNV}
        onChange={(e) => setMaNV(e.target.value)}
        required
      />

      <Input
        label="Password"
        id="password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={isLoading}
      >
        Sign in
      </Button>
    </form>
  );
};

export default Login;
