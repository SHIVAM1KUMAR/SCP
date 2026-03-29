import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import { useToast } from "../context/ToastContext";

export const useColleges = (collegeId = null) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const refreshCollegeData = async ({ skipSingle = false } = {}) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["colleges"] }),
      queryClient.invalidateQueries({ queryKey: ["payments"] }),
      !skipSingle && collegeId
        ? queryClient.invalidateQueries({ queryKey: ["college", collegeId] })
        : Promise.resolve(),
    ]);
  };

  // ─── Register College ───────────────────────────
  const registerCollegeMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post("/colleges/register", payload);
      return res.data;
    },
    onSuccess: () => toast("College registered successfully", "success"),
    onError: (err) => toast(err?.response?.data?.message || "Registration failed", "error"),
  });

  // ─── Activate College ───────────────────────────
  const activateCollegeMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await axiosInstance.post(`/colleges/${id}/activate`, payload);
      return res.data;
    },
    onSuccess: () => toast("College activated successfully", "success"),
    onError: (err) => toast(err?.response?.data?.message || "Activation failed", "error"),
  });

  // ─── Reject College ─────────────────────────────
  const rejectCollegeMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await axiosInstance.post(`/colleges/${id}/reject`, payload);
      return res.data;
    },
    onSuccess: () => toast("College rejected", "warning"),
    onError: (err) => toast(err?.response?.data?.message || "Rejection failed", "error"),
  });

  // ─── Delete College ─────────────────────────────
  const deleteCollegeMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(`/colleges/${id}`);
      return res.data;
    },
    onSuccess: () => toast("College deleted", "warning"),
    onError: (err) => toast(err?.response?.data?.message || "Delete failed", "error"),
  });

  // ─── Toggle Interest ────────────────────────────
  const toggleInterestMutation = useMutation({
    mutationFn: async ({ id, studentEmail }) => {
      const res = await axiosInstance.post(`/colleges/${id}/interest`, { studentEmail });
      return res.data;
    },
    onSuccess: () => toast("College application updated", "info"),
    onError: (err) => toast(err?.response?.data?.message || "Failed to update interest", "error"),
  });

  // ─── Update College ──────────────────────────────
  const updateCollegeMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await axiosInstance.put(`/colleges/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => toast("College updated successfully", "success"),
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
      return res.data?.data || res.data;
    },
  });

  // ─── Get Stats ──────────────────────────────────
  const { data: stats, isLoading: isLoadingStats } = useQuery({
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
    refetch: collegeRefetch,
  } = useQuery({
    queryKey: ["college", collegeId],
    enabled: !!collegeId,
    queryFn: async () => {
      const res = await axiosInstance.get(`/colleges/${collegeId}`);
      return res.data?.data || res.data;
    },
    // ✅ Never retry on 404 — record was deleted
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
    staleTime: 30_000,
  });

  // ─── Get Payments ───────────────────────────────
  const {
    data: payments,
    isLoading: isLoadingPayments,
    isError: isPaymentsError,
  } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await axiosInstance.get("/colleges/payments");
      return res.data?.data || res.data;
    },
  });

  // ─── Verify Payment ─────────────────────────────
  const verifyPaymentMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await axiosInstance.patch(`/colleges/payments/${id}/verify`, payload);
      return res.data;
    },
    onSuccess: () => toast("Payment verified successfully", "success"),
    onError: (err) => toast(err?.response?.data?.message || "Verification failed", "error"),
  });

  // ─── Safe delete — NEVER refetches the deleted ID ──────────────────────────
  const _doDelete = async (id) => {
    // ✅ Cancel any in-flight GET for this id BEFORE the DELETE fires
    await queryClient.cancelQueries({ queryKey: ["college", id] });

    const result = await deleteCollegeMutation.mutateAsync(id);

    // ✅ Wipe from cache so no observer can trigger a refetch
    queryClient.removeQueries({ queryKey: ["college", id] });

    // ✅ Only refresh the list and payments — never touch the deleted single
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["colleges"] }),
      queryClient.invalidateQueries({ queryKey: ["payments"] }),
    ]);

    return result;
  };

  return {
    // ─── Mutations ──────────────────────────────────
    registerCollege: async (payload) => {
      const result = await registerCollegeMutation.mutateAsync(payload);
      await refreshCollegeData();
      return result;
    },
    isRegisteringCollege: registerCollegeMutation.isPending,

    activateCollege: async (args) => {
      const result = await activateCollegeMutation.mutateAsync(args);
      await refreshCollegeData();
      return result;
    },
    activateCollegeAsync: async (args) => {
      const result = await activateCollegeMutation.mutateAsync(args);
      await refreshCollegeData();
      return result;
    },
    isActivatingCollege: activateCollegeMutation.isPending,

    rejectCollege: async (args) => {
      const result = await rejectCollegeMutation.mutateAsync(args);
      await refreshCollegeData();
      return result;
    },
    rejectCollegeAsync: async (args) => {
      const result = await rejectCollegeMutation.mutateAsync(args);
      await refreshCollegeData();
      return result;
    },
    isRejectingCollege: rejectCollegeMutation.isPending,

    // ✅ Both table and detail page use the same safe delete
    deleteCollege: _doDelete,
    deleteCollegeAsync: _doDelete,
    isDeletingCollege: deleteCollegeMutation.isPending,

    toggleInterest: async (args) => {
      const result = await toggleInterestMutation.mutateAsync(args);
      await refreshCollegeData();
      return result;
    },
    toggleInterestAsync: async (args) => {
      const result = await toggleInterestMutation.mutateAsync(args);
      await refreshCollegeData();
      return result;
    },
    isTogglingInterest: toggleInterestMutation.isPending,

    updateCollege: async (args) => {
      const result = await updateCollegeMutation.mutateAsync(args);
      await refreshCollegeData();
      return result;
    },
    isUpdatingCollege: updateCollegeMutation.isPending,

    verifyPayment: async (args) => {
      const result = await verifyPaymentMutation.mutateAsync(args);
      await refreshCollegeData();
      return result;
    },
    verifyPaymentAsync: async (args) => {
      const result = await verifyPaymentMutation.mutateAsync(args);
      await refreshCollegeData();
      return result;
    },
    isVerifyingPayment: verifyPaymentMutation.isPending,

    // ─── Queries ────────────────────────────────────
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
    fetchCollege: collegeRefetch,

    payments: payments || [],
    isLoadingPayments,
    isPaymentsError,
  };
};
