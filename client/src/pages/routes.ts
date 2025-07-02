import type { JSX } from "react";
import Home from "./HomePage";
import Login from "./LoginPage";
import NotFound from "./404";
import Register from "./RegisterPage";
import Profile from "./ProfilePage";
import Recipe from "./RecipePage";

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
const routes = {
  'home': { pathUrl: '/', component: Home },
  'login': { pathUrl: '/login', component: Login },
  'register': { pathUrl: '/register', component: Register },
  'profile': { pathUrl: '/profile', component: Profile },
  'recipe': { pathUrl: '/recipe', component: Recipe },
  'recipeId': { pathUrl: '/recipe/:recipeId', component: Recipe },
  'notFound': { pathUrl: '/404', component: NotFound },
} as const satisfies RouteConfig;
type RouteNameType = keyof typeof routes;

// !DRAIN ROUTE (REPLACES NON-EXSITENT PATH)
const drainRoute = routes['notFound'];// as const satisfies RouteNameType;

// !VISIBLE ROUTES ON NAVIGATION BAR
const navRoutesNames = [
  'home',
  'recipe',
] as const satisfies RouteNameType[];

// !DRAIN FOR NON-AUTH USERS 
const nonAuthDrain = 'login' as const satisfies RouteNameType;

// !DRAIN FOR NON-AUTH USERS 
const authDrain = 'home' as const satisfies RouteNameType;

const navItems = getNavItems(routes, navRoutesNames);

export { navItems, drainRoute, nonAuthDrain, authDrain };

export default routes;