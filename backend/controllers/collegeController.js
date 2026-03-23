import College from "../models/college.js";
import Student from "../models/student.js";

export const getColleges = async (req, res) => {
  try {
    const colleges = await College.find();
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleInterest = async (req, res) => {
  const { id } = req.params; 
  const { studentEmail } = req.body; 

  try {
    const student = await Student.findOne({ email: studentEmail });
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (!student.interestedColleges) {
      student.interestedColleges = [];
    }

    const index = student.interestedColleges.indexOf(id);
    if (index === -1) {
      student.interestedColleges.push(id);
    } else {
      student.interestedColleges.splice(index, 1);
    }
    
    await student.save();
    res.json({ message: index === -1 ? "Interest added" : "Interest removed", interestedColleges: student.interestedColleges });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
