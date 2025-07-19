import { useSelector } from "react-redux";
import { RequireAuth } from "../components/ProtectedRoute";
import { selectUser } from "../features/authSlice";
import { Link, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Profile() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  return (
    <RequireAuth>
      <Typography variant="h3">
        Hello,{' '}
        <Link
          component="button"
          onClick={() => {
            navigate({
              pathname: '/',
              search: '?a=' + user?.login,
            })
          }}>
          {user?.login}
        </Link>
        !
      </Typography>
      <Link variant="h6">
          Change login?
      </Link>
    </RequireAuth>
  );
}

export default Profile;