import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Bell, CheckCheck, Sparkles, Clock } from 'lucide-react';

export const NotificationsPage = () => {
  const { notifications, markNotifAsRead, markAllNotifsAsRead } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Notifications Center</h1>
          <p className="text-xs text-slate-400">Real-time alerts regarding your vehicle wash bookings</p>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllNotifsAsRead}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:underline"
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
              className={`glass-card p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                n.read ? 'border-slate-800 opacity-80' : 'border-cyan-500/40 bg-cyan-500/5 shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${!n.read ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400'}`}>
                  <Bell className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold ${!n.read ? 'text-white' : 'text-slate-200'}`}>{n.title}</h4>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {n.time}
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
          description="You are all caught up! No recent alerts."
        />
      )}
    </div>
  );
};
