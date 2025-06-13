import { Typography } from "@mui/material";

function Home() {
  return (
    <div className="home-page">
      <h2>This is home!</h2>
      <p>I mean</p>
      <p>It's actually your home!</p>
      <Typography
        sx={{ py: 2 }}
        component="div"
      >
        <p>Can you imagine it?</p>
        <p>I cannot...</p>
      </Typography>
    </div>
  );
}

export default Home;