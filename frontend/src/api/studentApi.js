import axiosInstance from "./axiosInstance";

export const getStudents = async () => {
  const { data } = await axiosInstance.get("/students");
  return data;
};

export const getStudentById = async (id) => {
  const { data } = await axiosInstance.get(`/students/${id}`);
  return data;
};

export const addStudent = async (studentData) => {
  const { data } = await axiosInstance.post("/students", studentData);
  return data;
};

export const updateStudent = async (id, studentData) => {
  const { data } = await axiosInstance.put(`/students/${id}`, studentData);
  return data;
};

export const deleteStudent = async (id) => {
  const { data } = await axiosInstance.delete(`/students/${id}`);
  return data;
};

export const activateStudent = async (id) => {
  const { data } = await axiosInstance.post(`/students/${id}/activate`);
  return data;
};

export const approveStudent = async (id) => {
  const { data } = await axiosInstance.post(`/students/${id}/approve`);
  return data;
};

export const rejectStudent = async (id) => {
  const { data } = await axiosInstance.post(`/students/${id}/reject`);
  return data;
};
