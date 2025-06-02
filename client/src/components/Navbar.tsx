import { AppBar, Box, Button, Typography, Toolbar, IconButton, type SvgIconTypeMap } from "@mui/material";
import { Brightness3, Brightness7 } from "@mui/icons-material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectTheme, toggleTheme, type ThemeType } from "../features/themeSlice";
import { NAV_ITEMS } from "../pages/routes";
import SearchInput from "./Search";

const themeIcons: Record<ThemeType, OverridableComponent<SvgIconTypeMap<object, "svg">>> = {
  dark: Brightness7,
  light: Brightness3,
}

function Navbar() {
  const dispatch = useDispatch();
  const currentTheme = useSelector(selectTheme);
  const IconComponent = themeIcons[currentTheme];
  
  return (
    <Box 
      sx={{ flexGrow: 1 }}
    >
      <AppBar
        position="static"
      >
        <Toolbar>
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
          <Button 
            color="inherit"
            component={Link}
            to={'/login'}
          >
            Login
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;