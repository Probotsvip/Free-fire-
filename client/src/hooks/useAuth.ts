import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.clear();
    },
  });

  const updateLastLoginMutation = useMutation({
    mutationFn: async () => {
      if (user?.id) {
        return await apiRequest("POST", `/api/users/${user.id}/update-last-login`);
      }
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(["/api/auth/user"], data);
      }
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  const updateLastLogin = () => {
    if (user?.id) {
      updateLastLoginMutation.mutate();
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    logout,
    updateLastLogin,
    isLoggingOut: logoutMutation.isPending,
  };
}