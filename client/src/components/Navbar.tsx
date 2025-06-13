import { AppBar, Box, Button, Typography, Toolbar, IconButton, type SvgIconTypeMap } from "@mui/material";
import { Brightness3, Brightness7, Logout } from "@mui/icons-material";
import RamenDiningIcon from '@mui/icons-material/RamenDining';
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectTheme, toggleTheme, type ThemeType } from "../features/themeSlice";
import { NAV_ITEMS } from "../pages/routes";
import SearchInput from "./Search";
import { logout, selectUser } from "../features/authSlice";
import { useAppDispatch } from "../store";
// import useAuth from "../features/auth/useAuth";

const themeIcons: Record<ThemeType, OverridableComponent<SvgIconTypeMap<object, "svg">>> = {
  dark: Brightness7,
  light: Brightness3,
}

function Navbar() {

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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {Object.entries(NAV_ITEMS).map(([pageName, route]) => (
              <Button 
                component={Link}
                key={pageName}
                to={route.pathUrl} 
                color="inherit"
              >
                {pageName}
              </Button>
            ))}
          </Typography>
          <SearchInput/>
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