import { Button, FormControl, FormLabel, Link, Paper, TextField } from "@mui/material";

function Login() {

  return (
    <>
      <Paper
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 4,
          px: 3,
          py: 3,
          pt: 1,
        }}
        component="form"
      >
        <h2>
          Sign in
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
        <Link
          component="button"
          type="button"
          onClick={() => alert("change pwd")}
          variant="body2"
          sx={{ alignSelf: 'center' }}
        >
          Forgot your password?
        </Link>
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

export default Login;