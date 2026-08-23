import React from 'react';
import { useAuth } from '@shared/context/AuthContext';
import { Button } from '@shared/components/Button';
import { EmptyState } from '@shared/components/EmptyState';
import { Bell, CheckCheck, Sparkles, Clock } from 'lucide-react';

export const NotificationsPage = () => {
  const { notifications, markNotifAsRead, markAllNotifsAsRead } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10213F]">Notifications Center</h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Real-time alerts regarding your vehicle wash bookings</p>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllNotifsAsRead}
            className="flex items-center gap-1 text-xs font-bold text-[#1264F5] hover:underline cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotifAsRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                n.read
                  ? 'bg-white border-[#E6ECF5] opacity-80'
                  : 'bg-[#F0F6FF] border-[#BFDBFE] shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${!n.read ? 'bg-[#1264F5] text-white' : 'bg-[#F8FAFC] text-[#1264F5] border border-[#E6ECF5]'}`}>
                  <Bell className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold ${!n.read ? 'text-[#10213F]' : 'text-[#64748B]'}`}>{n.title}</h4>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#1264F5] animate-pulse" />}
                  </div>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-[#94A3B8] mt-1 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-[#94A3B8]" /> {n.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description="You're all caught up! Booking updates and special offers will appear here."
        />
      )}
    </div>
  );
};
