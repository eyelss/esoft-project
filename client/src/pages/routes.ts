import type { JSX } from "react";
import Home from "./HomePage";
import Login from "./LoginPage";
import NotFound from "./404";
import Register from "./RegisterPage";
import Profile from "./ProfilePage";

type RouteType = {
  pathUrl: string;
  component: (props: unknown) => JSX.Element;
};

type RouteConfig = { 
  [name: string]: RouteType 
};

function getNavItems<
  T extends RouteConfig, 
  K extends ReadonlyArray<keyof T>
>(
  obj: T, 
  keys: K
): Pick<T, K[number]> {
  return keys.reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {} as Pick<T, K[number]>);
}


// !ALL APP ROUTES
const ROUTES = {
  'home': { pathUrl: '/', component: Home },
  'login': { pathUrl: '/login', component: Login },
  'register': { pathUrl: '/register', component: Register },
  'profile': {pathUrl: '/profile', component: Profile},
  'notFound': { pathUrl: '/404', component: NotFound },
} as const satisfies RouteConfig;
type RouteNameType = keyof typeof ROUTES;

// !DRAIN ROUTE (REPLACES NON-EXSITENT PATH)
const DRAIN_ROUTE = 'notFound' as const satisfies RouteNameType;

// !VISIBLE ROUTES ON NAVIGATION BAR
const NAV_ROUTES_NAMES = [
  'home',
] as const satisfies RouteNameType[];

// !DRAIN FOR NON-AUTH USERS 
const NON_AUTH_DRIAN = 'login' as const satisfies RouteNameType;

// !DRAIN FOR NON-AUTH USERS 
const AUTH_DRIAN = 'home' as const satisfies RouteNameType;

const NAV_ITEMS = getNavItems(ROUTES, NAV_ROUTES_NAMES);

export { NAV_ITEMS, DRAIN_ROUTE, NON_AUTH_DRIAN, AUTH_DRIAN };

export default ROUTES;