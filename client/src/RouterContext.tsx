import { useEffect, type PropsWithChildren } from "react";
import { useLocation, type Location } from "react-router-dom";

type Props = {
  onRouteChange: (location: Location) => void;
}

const RouterContext = ({ onRouteChange, children }: PropsWithChildren<Props>) => {
  const location = useLocation();

  useEffect(() => {
    onRouteChange(location);
  }, [onRouteChange, location])
  
  return (
    <>
    { children }
    </>
  );
}

export default RouterContext;