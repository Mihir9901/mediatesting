import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const AppLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        /* This container must be flex-row to keep Sidebar on the left from top-to-bottom */
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
            
            {/* SIDEBAR: Occupies the full height from the top */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={closeSidebar} />

            {/* MAIN AREA: Everything to the right of the sidebar */}
            <div className="flex flex-col flex-1 min-w-0">
                
                {/* NAVBAR: Starts ONLY after the sidebar width */}
                <Navbar toggleSidebar={toggleSidebar} />
                
                {/* PAGE CONTENT */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;