import { Button, FormControl, FormLabel, Paper, Link, TextField, Typography } from "@mui/material";
import { Link as ReactLink } from "react-router-dom";

function Register() {

  return (
    <>
      <Paper
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 4,
          p: 3,
          pt: 1,
        }}
        elevation={3}
        component="form"
      >
        <h2>
          Sign-up
        </h2>
        <FormControl>
          <FormLabel htmlFor="login">Login</FormLabel>
          <TextField
            error={false}
            // helperText={"errorMessage"}
            id="login"
            type="login"
            name="login"
            // placeholder="login"
            autoComplete="email"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color="primary"
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="password">Password</FormLabel>
          <TextField
            error={false}
            // helperText={"errorMessage"}
            id="password"
            type="password"
            name="password"
            // placeholder="Password"
            autoComplete="password"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color="primary"
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="verify-password">Verify password</FormLabel>
          <TextField
            error={false}
            // helperText={"errorMessage"}
            id="verify-password"
            type="password"
            name="verify-password"
            // placeholder="Password"
            autoComplete="password"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color="primary"
          />
        </FormControl>
        <Typography 
          variant="body2"  
          align="center"
        >
            Already have account?{' '}
          <Link 
            component={ReactLink}
            type="button"
            to="/login"
            variant="body2"
          >
            Sign-in
          </Link>
        </Typography>
        <Button
          type="submit"
          onSubmit={() => console.log('submited')}
        >
          Submit
        </Button>
      </Paper>
    </>
  )
}

export default Register;