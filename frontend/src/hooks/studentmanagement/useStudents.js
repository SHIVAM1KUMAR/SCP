import { useState, useEffect } from "react";
import { getStudents, addStudent, updateStudent, deleteStudent, activateStudent } from "../../api/studentApi";

export function useStudents(toast) {
  const [students, setStudents]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [saving, setSaving]             = useState(false);
  const [activating, setActivating]     = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      toast("Error fetching students", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

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
      return true; // success
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Something went wrong. Try again.";
      toast(msg, "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (student) => {
    try {
      await deleteStudent(student._id);
      toast(`"${student.studentName}" deleted.`, "warning");
      await fetchStudents();
      return true;
    } catch {
      toast("Failed to delete", "error");
      return false;
    }
  };

  const handleActivate = async (id) => {
    setActivating(id);
    try {
      const data = await activateStudent(id);
      toast(data.message || "Student activated", "success");
      await fetchStudents();
    } catch (err) {
      toast(err.response?.data?.message || err.message || "Failed to activate", "error");
    } finally {
      setActivating(null);
    }
  };

  return {
    students,
    loading,
    saving,
    activating,
    fetchStudents,
    handleSave,
    handleDelete,
    handleActivate
  };
}
