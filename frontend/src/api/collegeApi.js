import axiosInstance from "./axiosInstance";

export const getColleges = async () => {
  const { data } = await axiosInstance.get("/colleges");
  return data;
};

export const toggleInterest = async (id, studentEmail) => {
  const { data } = await axiosInstance.post(`/colleges/${id}/interest`, { studentEmail });
  return data;
};
