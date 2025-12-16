'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authService } from '@/services/authService';
import Link from 'next/link';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
        // Automatically redirect to login or dashboard?
        // Usually login page after registration or auto-login.
        // Let's redirect to login with success message if possible, or just login.
        router.push('/login?registered=true');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.password_confirmation) {
        setError("Passwords do not match");
        return;
    }

    registerMutation.mutate({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">Create your account</h2>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input 
            label="Full Name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
        />

        <Input 
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
        />

        <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
        />

        <Input
            label="Confirm Password"
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password_confirmation}
            onChange={handleChange}
        />

        {error && (
            <div className="text-sm text-error bg-error/10 p-2 rounded">
                {error}
            </div>
        )}

        <div>
          <Button
            type="submit"
            className="w-full"
            isLoading={registerMutation.isPending}
          >
            Register
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
              Or
            </span>
          </div>
        </div>

        <div className="mt-6 text-center">
            <Link href="/login" className="font-medium text-primary hover:text-opacity-80">
                Already have an account? Sign in
            </Link>
        </div>
      </div>
    </div>
  );
}
