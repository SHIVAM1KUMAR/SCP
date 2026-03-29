import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useUserProfile = () => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["auth-profile"],
    enabled: !!localStorage.getItem("token"),
    queryFn: async () => {
      const { data } = await axiosInstance.get("/auth/profile", {
        headers: getAuthHeaders(),
      });
      return data?.data ?? data ?? null;
    },
  });

  const refreshProfile = async () => {
    await queryClient.invalidateQueries({ queryKey: ["auth-profile"] });
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosInstance.put("/auth/profile", payload, {
        headers: getAuthHeaders(),
      });
      return data?.data ?? data ?? null;
    },
    onSuccess: async () => {
      await refreshProfile();
    },
  });

  const setPrimaryAddressMutation = useMutation({
    mutationFn: async ({ addressId }) => {
      const { data } = await axiosInstance.put(
        "/auth/profile/primary-address",
        { addressId },
        { headers: getAuthHeaders() },
      );
      return data?.data ?? data ?? null;
    },
    onSuccess: async () => {
      await refreshProfile();
    },
  });

  const uploadProfilePicMutation = useMutation({
    mutationFn: async (formData) => {
      const { data } = await axiosInstance.post("/auth/profile/picture", formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });
      return data?.data ?? data ?? null;
    },
    onSuccess: async () => {
      await refreshProfile();
    },
  });

  const userProfile = profileQuery.data || null;

  return {
    userProfile,
    userProfileById: userProfile,
    isUserProfileLoading: profileQuery.isLoading,
    isUserProfileByIdLoading: profileQuery.isLoading,
    updateProfile: updateProfileMutation,
    isUpdatingProfile: updateProfileMutation.isPending,
    setPrimaryAddress: setPrimaryAddressMutation,
    isSettingPrimaryAddress: setPrimaryAddressMutation.isPending,
    uploadProfilePic: uploadProfilePicMutation,
    isUploadingProfilePic: uploadProfilePicMutation.isPending,
    fetchProfile: profileQuery.refetch,
  };
};
