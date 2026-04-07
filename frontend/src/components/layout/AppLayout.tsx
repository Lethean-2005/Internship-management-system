import { Outlet } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { CongratulationsOverlay } from '../ui/CongratulationsOverlay';
import client from '../../api/client';

interface PassedInterview {
  id: number;
  company_name: string;
  employment_type: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    avatar: string | null;
    company_name: string | null;
    position: string | null;
    generation: string | null;
    role: string | null;
  } | null;
}

export function AppLayout() {
  const [passedQueue, setPassedQueue] = useState<PassedInterview[]>([]);
  const [current, setCurrent] = useState<PassedInterview | null>(null);

  // Fetch unseen passed interviews on first load
  useEffect(() => {
    const fetchPassed = async () => {
      try {
        const res = await client.get('/passed-interviews');
        const interviews: PassedInterview[] = res.data.data || [];
        if (interviews.length > 0) {
          setPassedQueue(interviews);
        }
      } catch {
        // silently fail
      }
    };

    fetchPassed();
  }, []);

  // Show next in queue
  useEffect(() => {
    if (!current && passedQueue.length > 0) {
      setCurrent(passedQueue[0]);
    }
  }, [passedQueue, current]);

  const handleClose = useCallback(() => {
    if (current) {
      // Mark as seen on backend
      client.post(`/passed-interviews/${current.id}/seen`).catch(() => {});

      setPassedQueue((prev) => prev.filter((iv) => iv.id !== current.id));
      setCurrent(null);
    }
  }, [current]);

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Sidebar />

      {/* Main content */}
      <main className="min-h-screen bg-[#f8f9fb] pt-[72px] px-4 pb-6 sm:px-6 md:px-8 lg:pt-7 lg:ml-[250px] lg:px-9">
        <Outlet />
      </main>

      {/* Congratulations overlay */}
      {current && (
        <CongratulationsOverlay interview={current} onClose={handleClose} />
      )}
    </div>
  );
}
