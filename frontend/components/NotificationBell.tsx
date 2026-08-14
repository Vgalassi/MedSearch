"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "./appConfig";
import { useAuth } from "@/context/AuthContext";

type Notification = {
  id: string;
  type: "APPOINTMENT_REMINDER" | "CLINIC_INVITATION" | "CLINIC_INVITATION_RESPONSE";
  title: string;
  message: string;
  data: { invitationId?: string } | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    const response = await fetch(`${API_BASE_URL}/notifications`, { credentials: "include" });
    if (response.ok) {
      const data = await response.json();
      setNotifications(data.notifications ?? []);
    }
  }, [user]);

  useEffect(() => {
    void loadNotifications();
    const timer = window.setInterval(() => void loadNotifications(), 30_000);
    return () => window.clearInterval(timer);
  }, [loadNotifications]);

  async function markRead(notification: Notification) {
    if (notification.readAt) return;
    await fetch(`${API_BASE_URL}/notifications/${notification.id}/read`, { method: "PATCH", credentials: "include" });
    setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item));
  }

  async function respond(notification: Notification, accept: boolean) {
    const invitationId = notification.data?.invitationId;
    if (!invitationId) return;
    setBusyId(notification.id);
    try {
      const response = await fetch(`${API_BASE_URL}/clinic-invitations/${invitationId}/respond`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept }),
      });
      if (!response.ok) throw new Error("Não foi possível responder à solicitação");
      await loadNotifications();
    } finally {
      setBusyId(null);
    }
  }

  if (!user) return null;
  const unread = notifications.filter((item) => !item.readAt).length;

  return (
    <div className="relative">
      <button aria-expanded={open} aria-label="Abrir notificacoes" className="relative grid size-10 place-items-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 cursor-pointer" onClick={() => setOpen((value) => !value)} type="button">
        <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {unread > 0 && <span className="absolute right-0 top-0 grid min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-xs font-bold text-white">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-950">Notificacoes</div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && <p className="px-4 py-6 text-center text-sm text-slate-500">Nenhuma notificacao por enquanto.</p>}
            {notifications.map((notification) => (
              <article className={`border-b border-slate-100 px-4 py-3 last:border-0 ${notification.readAt ? "bg-white" : "bg-teal-50/60"}`} key={notification.id} onClick={() => void markRead(notification)}>
                <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                <p className="mt-1 text-sm leading-5 text-slate-600">{notification.message}</p>
                {notification.type === "CLINIC_INVITATION" && user.role === "DOCTOR" && notification.data?.invitationId && (
                  <div className="mt-3 flex gap-2" onClick={(event) => event.stopPropagation()}>
                    <button className="btn-primary px-3 py-1.5 text-sm" disabled={busyId === notification.id} onClick={() => void respond(notification, true)} type="button">Aceitar</button>
                    <button className="btn-danger px-3 py-1.5 text-sm" disabled={busyId === notification.id} onClick={() => void respond(notification, false)} type="button">Recusar</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
