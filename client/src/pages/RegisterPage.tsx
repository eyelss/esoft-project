import { Button, Paper, Link, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import { Link as ReactLink } from "react-router-dom";
import * as yup from "yup";
import useAuthedRedirect from "../hooks/useAuthedRedirect";

const validationSchema = yup.object({
  login: yup
    .string()
    .required('Login is required.'),
  password: yup
    .string()
    .min(8)
    .required('Password is required.'),
  confirmPassword: yup
    .string()
    .min(8)
    .required('Confirm password')
    .oneOf([yup.ref('password'), ''], 'Paswords must match'),
});

function Register() {
  useAuthedRedirect();

  const formik = useFormik({
    initialValues: {
      login: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: ({ login, password }) => {
      fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password })
      }).then(result => result.json())
        .then(json => console.log(json));
    }
  });

  return (
  <Paper
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 4,
        p: 3,
        pt: 1,
      }}
      elevation={3}
      component="div"
    >
      <h2>
        Sign-up
      </h2>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="login"
          label="Login"
          type="login"
          name="login"
          value={formik.values.login}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.login && Boolean(formik.errors.login)}
          helperText={formik.touched.login && formik.errors.login}
          sx={{ mb: 1 }}
        />
        <TextField
          fullWidth
          id="password"
          label="Password"
          type="password"
          name="password"
          placeholder="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          sx={{ mb: 1 }}
        />
        <TextField
          fullWidth
          id="confirmPassword"
          label="Confirm password"
          type="password"
          name="confirmPassword"
          placeholder="Conform password"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
          helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          sx={{ mb: 1 }}
        />
        <Typography 
          variant="body2"
          align="center"
          my={3}
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
          color="primary"
          variant="contained"
          fullWidth
          type="submit"
        >
          Submit
        </Button>
      </form>
    </Paper>
  )
}

export default Register;