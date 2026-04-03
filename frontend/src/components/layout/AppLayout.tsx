import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="min-h-screen" style={{ background: '#f8f9fb' }}>
      <Sidebar />

      {/* Main content */}
      <main
        className="min-h-screen"
        style={{
          marginLeft: 250,
          padding: '28px 36px',
          background: '#f8f9fb',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
