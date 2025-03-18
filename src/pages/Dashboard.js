import { getToken } from "../auth/auth";
import LogoutButton from "../components/LogoutButton";

const Dashboard = () => {
  if (!getToken()) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div>
      <h2>Trang Dashboard</h2>
      <LogoutButton />
    </div>
  );
};

export default Dashboard;
