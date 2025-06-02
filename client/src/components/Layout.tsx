import type React from "react"
import Navbar from "./Navbar";
import Footer from "./Footer";

type LayoutProps = React.PropsWithChildren & {
  
};

function Layout({ children }: LayoutProps) {
  return (
    <>
      <Navbar/>
      <div className="page">
        {children}
      </div>
      <Footer/>
    </>
  );
}

export default Layout;