import axiosInstance from "../api/axiosInstance";

export const loginSuperAdmin = async (data) => {

  const response = await axiosInstance.post(
    "/auth/superadmin/login",
    data
  );

  return response.data;

};