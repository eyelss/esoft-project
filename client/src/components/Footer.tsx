import { Box, Link, Typography } from "@mui/material";

function Footer() {
  return (
    <Box
      component="footer"
    >
      <Typography 
        variant="body2" 
        color="text.secondary" 
        align="center"
      >
          {'© '}
        <Link color="inherit" href="https://github.com/eyelss/">
          eyelss
        </Link>{' 2025'}
      </Typography>
    </Box>
  );
}

export default Footer;