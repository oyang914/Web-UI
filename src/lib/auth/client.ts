
'use client';

import type { User } from '@/types/user';

function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

const user = {
  id: 'USR-000',
  avatar: '/assets/avatar.png',
  firstName: 'Sofia',
  lastName: 'Rivers',
  email: 'sofia@devias.io',
} satisfies User;

export interface SignUpParams {
  username: string;
  name: string;
  email: string;
  password: string;
  emergency_contact_name: string;
  emergency_contact_number: string;
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  // Sign up method (register a new user)
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    const { username, name, email, password, emergency_contact_name, emergency_contact_number } = params;
  
    try {
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, name, emergency_contact_name, emergency_contact_number }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        return { error: data.message || 'Signup failed' };
      }
  
      const token = generateToken();
      localStorage.setItem('custom-auth-token', token);
  
      return {};
    } catch (error) {
      console.error('Signup error:', error);
      return { error: 'Server error. Please try again.' };
    }
  }

  // Login method with password
  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { email, password } = params;

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Login failed' };
      }

      // Store JWT token from backend
      localStorage.setItem('custom-auth-token', data.token);

      return {};
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Server error. Please try again.' };
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // Make API request

    const token = localStorage.getItem('custom-auth-token');

    if (!token) {
      return { data: null };
    }

    return { data: user };
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');

    return {};
  }
}

export const authClient = new AuthClient();
