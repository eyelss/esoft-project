import useNonAuthedRedirect from "../hooks/useNonAuthedRedirect";

function Profile() {
  useNonAuthedRedirect();

  return (
    <>
      <h2>Profile</h2>
    </>
  );
}

export default Profile;