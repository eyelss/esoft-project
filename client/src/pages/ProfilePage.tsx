import { RequireAuth } from "../components/ProtectedRoute";

function Profile() {
  return (
    <RequireAuth>
      <>
        <h2>Profile</h2>
      </>
    </RequireAuth>
  );
}

export default Profile;