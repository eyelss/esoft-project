import { Typography } from "@mui/material";

function Home() {
  return (
    <div className="home-page">
      <h2>This is home!</h2>
      <p>I mean</p>
      <p>It's actually your home!</p>
      <Typography
        sx={{ py: 2 }}
      >
        <p>Can you imagine it?</p>
        <a>I cannot...</a>
      </Typography>
    </div>
  );
}

export default Home;