import { Button, Paper, Link, TextField, Typography } from "@mui/material";
import { Link as ReactLink } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { verifySession } from "../features/authSlice";
import { useAppDispatch } from "../store";
import { RequireNoAuth } from "../components/ProtectedRoute";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import { fetchApi } from "../utils/simple";

const validationSchema = yup.object({
  login: yup
    .string()
    .min(6)
    .max(16)
    .required('Login is required.'),
  password: yup
    .string()
    .min(8)
    .max(25)
    .required('Password is required.'),
});

function Login() {
  const dispatch = useAppDispatch();
  const { loading } = useAuthRedirect();

  const formik = useFormik({
    initialValues: {
      login: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      fetchApi('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: values.login,
          password: values.password,
        }),
        credentials: 'include',
        mode: 'no-cors',
      }).then(response => {
        if (response.ok) {
          dispatch(verifySession());
        }
      })
    }
  });

  return (
    <RequireNoAuth>
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
          Sign-in
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
          <Typography 
            variant="body2"  
            align="center"
            my={3}
          >
              Don't have account?{' '}
            <Link 
              component={ReactLink}
              type="button"
              to="/register"
              variant="body2"
            >
              Sign-up
            </Link>
          </Typography>
          <Button
            color="primary"
            variant="contained"
            fullWidth
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Submit'}
          </Button>
        </form>
      </Paper>
    </RequireNoAuth>
  )
}

export default Login;