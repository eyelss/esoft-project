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
        </Link>{' '}
        {new Date().getFullYear()}
      </Typography>
    </Box>
  );
}

export default Footer;