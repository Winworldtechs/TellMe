import { Navigate } from "react-router-dom";

const Protected = ({ children }) => {
  const token = localStorage.getItem("access");

  return token ? children : <Navigate to="/login" />;
};

export default Protected;
