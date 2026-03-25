import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { useToast } from "../context/ToastContext";

export const useColleges = (collegeId = null) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  // ─── Register College ───────────────────────────
  const registerCollegeMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post("/colleges/register", payload);
      return res.data;
    },
    onSuccess: () => {
      toast("College registered successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
    },
    onError: (err) => toast(err?.response?.data?.message || "Registration failed", "error"),
  });

  // ─── Activate College ───────────────────────────
  const activateCollegeMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await axiosInstance.post(`/colleges/${id}/activate`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast("College activated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["colleges"] });

      if (collegeId) {
        queryClient.invalidateQueries({ queryKey: ["college", collegeId] });
      }
    },
    onError: (err) => toast(err?.response?.data?.message || "Activation failed", "error"),
  });

  // ─── Reject College ─────────────────────────────
  const rejectCollegeMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await axiosInstance.post(`/colleges/${id}/reject`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast("College rejected", "warning");
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
    },
    onError: (err) => toast(err?.response?.data?.message || "Rejection failed", "error"),
  });

  // ─── Delete College ─────────────────────────────
  const deleteCollegeMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(`/colleges/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast("College deleted", "warning");
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
    },
    onError: (err) => toast(err?.response?.data?.message || "Delete failed", "error"),
  });

  // ─── Toggle Interest ────────────────────────────
  const toggleInterestMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.post(`/colleges/${id}/interest`);
      return res.data;
    },
    onSuccess: () => {
      toast("Interest updated", "info");
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
    },
    onError: (err) => toast(err?.response?.data?.message || "Failed to update interest", "error"),
  });

  // ─── Update College ─────────────────────────────
  const updateCollegeMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await axiosInstance.put(`/colleges/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast("College updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["colleges"] });

      if (collegeId) {
        queryClient.invalidateQueries({ queryKey: ["college", collegeId] });
      }
    },
    onError: (err) => toast(err?.response?.data?.message || "Update failed", "error"),
  });

  // ─── Get Colleges ───────────────────────────────
  const {
    data: collegesData,
    isLoading: isLoadingColleges,
    isError: isCollegesError,
    refetch: fetchColleges,
  } = useQuery({
    queryKey: ["colleges"],
    queryFn: async () => {
      const res = await axiosInstance.get("/colleges");

      // 🔥 SAFE HANDLE
      return res.data?.data || res.data;
    },
  });

  // ─── Get Stats ──────────────────────────────────
  const {
    data: stats,
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: ["collegeStats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/colleges/stats");
      return res.data?.data || res.data;
    },
  });

  // ─── Get Single College ─────────────────────────
  const {
    data: college,
    isLoading: isCollegeLoading,
    isError: isCollegeError,
  } = useQuery({
    queryKey: ["college", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const res = await axiosInstance.get(`/colleges/${collegeId}`);

      console.log("Single College API:", res.data);

      // 🔥 MAIN FIX (your issue here)
      return res.data?.data || res.data;
    },
  });

  return {
    // mutations
    registerCollege: registerCollegeMutation.mutate,
    isRegisteringCollege: registerCollegeMutation.isPending,

    activateCollege: activateCollegeMutation.mutate,
    isActivatingCollege: activateCollegeMutation.isPending,

    rejectCollege: rejectCollegeMutation.mutate,
    isRejectingCollege: rejectCollegeMutation.isPending,

    deleteCollege: deleteCollegeMutation.mutate,
    isDeletingCollege: deleteCollegeMutation.isPending,

    toggleInterest: toggleInterestMutation.mutate,
    isTogglingInterest: toggleInterestMutation.isPending,

    updateCollege: updateCollegeMutation.mutate,
    isUpdatingCollege: updateCollegeMutation.isPending,

    // queries
    colleges: collegesData || [],
    total: collegesData?.length || 0,
    isLoadingColleges,
    isCollegesError,
    fetchColleges,

    stats,
    isLoadingStats,

    college,
    isCollegeLoading,
    isCollegeError,
  };
};