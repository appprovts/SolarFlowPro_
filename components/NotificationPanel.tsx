
import React from 'react';
import { Notification } from '../types';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onClose,
  onMarkAsRead,
  onClearAll,
  onAction
}: NotificationPanelProps & { onAction?: (notification: Notification) => void }) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    if (diff < 1) return 'Agora mesmo';
    if (diff < 60) return `Há ${diff} min`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `Há ${hours} h`;
    return date.toLocaleDateString();
  };

  return (
    <div className="absolute top-16 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden flex flex-col max-h-[500px]">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
        <h3 className="font-bold text-slate-800 dark:text-white">Notificações</h3>
        <div className="flex gap-2">
          <button
            onClick={onClearAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Limpar tudo
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <i className="fas fa-bell-slash text-2xl mb-2 opacity-20"></i>
            <p className="text-sm">Nenhuma notificação nova.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer relative ${!n.isRead ? 'bg-blue-50/30 dark:bg-blue-900/20' : ''}`}
                onClick={() => onMarkAsRead(n.id)}
              >
                {!n.isRead && (
                  <span className="absolute top-5 right-4 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                    n.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                    <i className={`fas ${n.type === 'success' ? 'fa-check' :
                      n.type === 'warning' ? 'fa-exclamation' :
                        'fa-info'
                      } text-xs`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{n.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{formatTime(n.timestamp)}</p>

                    {n.action === 'accept_survey' && (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction?.(n);
                          }}
                          className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition font-bold shadow-sm"
                        >
                          Aceitar Vistoria
                        </button>
                        <a
                          href={n.actionData?.whatsappLink || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition font-bold"
                        >
                          <i className="fab fa-whatsapp mr-1"></i>WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 text-center">
        <button className="text-xs font-bold text-slate-500 hover:text-slate-800">
          Ver todas as atividades
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel;
