import { AppBar, Box, Button, Typography, Toolbar, IconButton, type SvgIconTypeMap } from "@mui/material";
import { Brightness3, Brightness7, Logout } from "@mui/icons-material";
import RamenDiningIcon from '@mui/icons-material/RamenDining';
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { selectTheme, toggleTheme, type ThemeType } from "../features/themeSlice";
import SearchInput from "./Search";
import { logout, selectUser } from "../features/authSlice";
import { useAppDispatch } from "../store";
// import useAuth from "../features/auth/useAuth";

const themeIcons: Record<ThemeType, OverridableComponent<SvgIconTypeMap<object, "svg">>> = {
  dark: Brightness7,
  light: Brightness3,
}

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentTheme = useSelector(selectTheme);
  const IconComponent = themeIcons[currentTheme];
  const user = useSelector(selectUser);
  
  return (
    <Box 
      sx={{ flexGrow: 1 }}
    >
      <AppBar
        position="static"
      >
        <Toolbar>
          <RamenDiningIcon sx={{ mr: 2 }} />
          <SearchInput onSearch={query => navigate({
            pathname: '/',
            search: query === undefined ? '?' : `?query=${query}`
          })}/>
          <Box sx={{ flexGrow: 1 }}/>
          <IconButton onClick={() => dispatch(toggleTheme())}>
            <IconComponent/>
          </IconButton>
          {user === null ?
            (<Button 
              color="inherit"
              component={Link}
              to={'/login'}
            >
              Login
            </Button>) :
            <>
              <Button
                color="inherit"
                component={Link}
                to={'/profile'}
              >
                {user.login}
              </Button>
              <IconButton
                onClick={() => dispatch(logout())}
              >
                <Logout/>
              </IconButton>
            </>
          }
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;