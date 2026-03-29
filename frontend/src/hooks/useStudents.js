import { useEffect, useState } from "react";
import {
  getStudents,
  getStudentById,
  addStudent,
  updateStudent,
  deleteStudent as apiDeleteStudent,
  activateStudent as apiActivateStudent,
  approveStudent as apiApproveStudent,
  rejectStudent as apiRejectStudent,
} from "../api/studentApi";

export function useStudents(studentId = null, toast = () => {}) {
  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [activating, setActivating] = useState(null);
  const [approving, setApproving] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  const isDetailMode = !!studentId;
  const extractId = (value) => (value && typeof value === "object" ? value.id || value._id : value);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(Array.isArray(data) ? data : data?.data || []);
      return data;
    } catch (error) {
      toast("Error fetching students", "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchStudent = async (id = studentId) => {
    if (!id) return null;
    setStudentLoading(true);
    try {
      const data = await getStudentById(id);
      const record = data?.data?.data || data?.data || data?.student || data || null;
      setStudent(record);
      return record;
    } catch (error) {
      setStudent(null);
      return null;
    } finally {
      setStudentLoading(false);
    }
  };

  useEffect(() => {
    if (isDetailMode) {
      fetchStudent(studentId);
    } else {
      fetchStudents();
    }
  }, [studentId]);

  const handleSave = async (form, editData) => {
    setSaving(true);
    try {
      if (editData?._id) {
        await updateStudent(editData._id, form);
        toast(`"${form.studentName}" updated successfully.`, "success");
      } else {
        await addStudent(form);
        toast(`"${form.studentName}" added successfully.`, "success");
      }
      await fetchStudents();
      if (isDetailMode) {
        await fetchStudent(studentId);
      }
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Something went wrong. Try again.";
      toast(msg, "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const registerStudent = async (studentData) => {
    const data = await addStudent(studentData);
    return data;
  };

  const updateStudentRecord = async ({ id, payload } = {}) => {
    const targetId = extractId(id);
    if (!targetId) {
      throw new Error("Student ID is required");
    }
    const data = await updateStudent(targetId, payload);
    return data;
  };

  const deleteStudentAsync = async (id) => {
    const targetId = extractId(id);
    setDeleting(targetId);
    try {
      const data = await apiDeleteStudent(targetId);
      toast(data?.message || "Student deleted", "warning");
      await fetchStudents();
      if (studentId && String(studentId) === String(targetId)) {
        setStudent(null);
      }
      return true;
    } catch (err) {
      toast(err?.response?.data?.message || err?.message || "Failed to delete", "error");
      return false;
    } finally {
      setDeleting(null);
    }
  };

  const handleDelete = async (studentRecord) => {
    if (!studentRecord?._id) return false;
    return deleteStudentAsync(studentRecord._id);
  };

  const activateStudentAsync = async (id) => {
    const targetId = extractId(id);
    setActivating(targetId);
    try {
      const data = await apiActivateStudent(targetId);
      toast(data?.message || "Student activated", "success");
      await fetchStudents();
      if (isDetailMode) {
        await fetchStudent(studentId);
      }
      return data;
    } catch (err) {
      toast(err?.response?.data?.message || err?.message || "Failed to activate", "error");
      return null;
    } finally {
      setActivating(null);
    }
  };

  const approveStudentAsync = async (id) => {
    const targetId = extractId(id);
    setApproving(targetId);
    try {
      const data = await apiApproveStudent(targetId);
      toast(data?.message || "Student approved", "success");
      await fetchStudents();
      if (isDetailMode) {
        await fetchStudent(studentId);
      }
      return data;
    } catch (err) {
      toast(err?.response?.data?.message || err?.message || "Failed to approve", "error");
      return null;
    } finally {
      setApproving(null);
    }
  };

  const rejectStudentAsync = async (id) => {
    const targetId = extractId(id);
    setRejecting(targetId);
    try {
      const data = await apiRejectStudent(targetId);
      toast(data?.message || "Student rejected", "warning");
      await fetchStudents();
      if (isDetailMode) {
        await fetchStudent(studentId);
      }
      return data;
    } catch (err) {
      toast(err?.response?.data?.message || err?.message || "Failed to reject", "error");
      return null;
    } finally {
      setRejecting(null);
    }
  };

  return {
    students,
    student,
    loading,
    studentLoading,
    saving,
    deleting,
    activating,
    approving,
    rejecting,
    isLoadingStudents: loading,
    isStudentLoading: studentLoading,
    isDeletingStudent: !!deleting,
    isActivatingStudent: !!activating,
    isApprovingStudent: !!approving,
    isRejectingStudent: !!rejecting,
    fetchStudents,
    fetchStudent,
    handleSave,
    handleDelete,
    registerStudent,
    updateStudent: updateStudentRecord,
    deleteStudent: deleteStudentAsync,
    deleteStudentAsync,
    activateStudent: activateStudentAsync,
    activateStudentAsync,
    approveStudentAsync,
    rejectStudentAsync,
  };
}
