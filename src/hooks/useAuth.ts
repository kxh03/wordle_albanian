import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchMe,
  loginApi,
  logoutApi,
  registerApi,
  setAuthToken,
  getAuthToken,
  updateProfileApi,
  type AuthUser,
} from '@/api/auth';

const meKey = ['auth', 'me'] as const;

export function useAuth() {
  const queryClient = useQueryClient();
  const hasToken = Boolean(getAuthToken());

  const meQuery = useQuery({
    queryKey: meKey,
    queryFn: fetchMe,
    enabled: hasToken,
    staleTime: 60_000,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setAuthToken(data.token);
      queryClient.setQueryData(meKey, { user: data.user });
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      setAuthToken(data.token);
      queryClient.setQueryData(meKey, { user: data.user });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await logoutApi();
      } finally {
        setAuthToken(null);
      }
    },
    onSettled: () => {
      queryClient.removeQueries({ queryKey: meKey });
      queryClient.invalidateQueries();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (data) => {
      queryClient.setQueryData(meKey, { user: data.user });
    },
  });

  const user: AuthUser | undefined = meQuery.data?.user;

  return {
    user,
    isAuthenticated: Boolean(user),
    hasToken,
    isBootstrapping: hasToken && meQuery.isPending,
    isLoading: hasToken && meQuery.isPending,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    loginState: loginMutation,
    registerState: registerMutation,
    logoutState: logoutMutation,
    refetchMe: meQuery.refetch,
  };
}
