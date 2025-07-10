import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';

async function fetchUser() {
  const response = await apiRequest("GET", "/api/auth/user");
  return response.json();
}

export const useAuth = () => {
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery<User, Error>({
    queryKey: ['user'],
    queryFn: fetchUser,
    retry: 1, // Retry once on failure
    refetchOnWindowFocus: false, // Optional: prevent refetching on window focus
  });

  return {
    user,
    loading: isLoading,
    error: isError ? error : null,
    isAuthenticated: !!user && !isLoading,
  };
};
