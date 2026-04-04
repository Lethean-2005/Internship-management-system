import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Sidebar />

      {/* Main content - top padding on mobile for the top bar */}
      <main className="min-h-screen bg-[#f8f9fb] pt-[72px] px-4 pb-6 sm:px-6 md:px-8 lg:pt-7 lg:ml-[250px] lg:px-9">
        <Outlet />
      </main>
    </div>
  );
}
