import { UserResponse } from '@/types';

// Fallback to localhost if not provided in environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchUsers(): Promise<UserResponse[]> {
  const response = await fetch(`${API_URL}/api/users?limit=50`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}
