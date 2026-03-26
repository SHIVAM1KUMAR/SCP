// src/hooks/useUserProfile.js
import { useEffect, useState } from "react";

export const useUserProfile = (userMasterId) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!userMasterId) return;

    // TODO: replace with real API
    setData({
      name: "Demo User",
      email: "demo@email.com",
    });
  }, [userMasterId]);

  return { data };
};