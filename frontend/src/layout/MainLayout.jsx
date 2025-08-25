import React from 'react';
import NavBar from './NavBar';

function MainLayout({ children }) {
    return (
        <div className="flex">
            <NavBar />
            <main className="flex-1 p-6 bg-gray-100 ">
                {children}
            </main>
        </div>
    );
}

export default MainLayout;