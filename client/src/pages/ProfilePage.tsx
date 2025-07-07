import { useSelector } from "react-redux";
import { RequireAuth } from "../components/ProtectedRoute";
import { selectUser } from "../features/authSlice";

function Profile() {
  const user = useSelector(selectUser);

  return (
    <RequireAuth>
      <h2>Hello, {user?.login}!</h2>
    </RequireAuth>
  );
}

export default Profile;