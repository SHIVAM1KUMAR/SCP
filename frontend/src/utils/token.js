export const setToken = (token) => {
    localStorage.setItem("token", token);
  };
  
  export const getToken = () => {
    return localStorage.getItem("token");
  };
  
  export const removeToken = () => {
    localStorage.removeItem("token");
  };
  
  export const setRole = (role) => {
    localStorage.setItem("role", role);
  };
  
  export const getRole = () => {
    return localStorage.getItem("role");
  };