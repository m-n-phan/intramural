import { useQuery } from '@tanstack/react-query';
import type { User, UserRole } from '@shared/schema';
import { USER_ROLES } from '@shared/schema';

async function fetchUser() {
  const response = await fetch("/api/auth/user", { credentials: "include" });
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  return response.json() as Promise<User | null>;
}

export const useAuth = () => {
  const {
    data: user,
    isLoading,
    isError,
    error,
    isFetched,
  } = useQuery<User | null, Error>({
    queryKey: ['user'],
    queryFn: fetchUser,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: Infinity, // User data is stable within a session
  });

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false;
    const rolesToCheck = Array.isArray(role) ? role : [role];
    return rolesToCheck.includes(user.role);
  };

  return {
    user,
    loading: isLoading,
    isLoaded: isFetched,
    error: isError ? error : null,
    isAuthenticated: !!user && !isLoading,
    hasRole, // Expose the helper
    isAdmin: user?.role === USER_ROLES.ADMIN, // Add convenience booleans
    isCaptain: user?.role === USER_ROLES.CAPTAIN,
    isReferee: user?.role === USER_ROLES.REFEREE,
  };
};
