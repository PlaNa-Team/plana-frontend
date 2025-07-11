import React from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="layout">
            <Header />
            <main className="layout__content">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;