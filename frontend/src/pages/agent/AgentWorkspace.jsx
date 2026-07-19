import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { dashboardService, secretAgentService } from '../../services/api'
import { useTranslation } from 'react-i18next'
import { 
  Terminal, ShieldAlert, CheckCircle2, Lock,
  AlertTriangle, Send, RefreshCw, FileText, Inbox, Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AgentWorkspace({ mode = 'command' }) {
  const { t } = useTranslation();
  const [data, setData] = useState({ unread_messages: 0, urgent_messages: 0, active_missions: 0 });
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [urgent, setUrgent] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, agentRes] = await Promise.all([
        dashboardService.get().catch(() => ({ data: {} })),
        secretAgentService.inbox().catch(() => ({ data: [] }))
      ]);
      setData(dashRes.data || { unread_messages: 0, urgent_messages: 0, active_missions: 0 });
      setMessages(agentRes.data || []);
    } catch (err) {
      setError(t('agentWorkspace.error.loadFailed', 'Secure connection interrupted. Could not load data.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const send = async () => {
    if (!body.trim()) return;
    setSending(true);
    try {
      await secretAgentService.sendMessage({ body, urgent });
      setBody('');
      setUrgent(false);
      await load();
    } catch (err) {
      console.error(err);
      setError(t('agentWorkspace.error.sendFailed', 'Failed to transmit message. Retrying...'));
    } finally {
      setSending(false);
    }
  };

  const title = mode === 'chat' 
    ? t('agentWorkspace.title.chat', 'Secure Comm Channel') 
    : mode === 'missions' 
      ? t('agentWorkspace.title.missions', 'Active Missions') 
      : mode === 'urgent' 
        ? t('agentWorkspace.title.urgent', 'Urgent Directives') 
        : mode === 'timeline' 
          ? t('agentWorkspace.title.timeline', 'Operational Timeline') 
          : t('agentWorkspace.title.command', 'Command Hub');

  const filteredMessages = messages.filter(m => mode !== 'urgent' || m.is_urgent);

  return (
    <AppLayout 
      title={t('agentWorkspace.appLayout.title', 'Agent Workspace')} 
      subtitle={t('agentWorkspace.appLayout.subtitle', 'Restricted Access Protocol')}
    >
      <div className="p-md md:p-lg space-y-lg max-w-7xl mx-auto font-body-md">
        <header className="flex items-center space-x-md mb-lg border-b border-primary/20 pb-md">
          <Terminal className="text-primary w-8 h-8" />
          <h2 className="font-display-lg-mobile text-primary uppercase drop-shadow-md">
            {title}
          </h2>
        </header>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="p-md bg-error-container/30 border-l-4 border-error text-error flex items-center space-x-md rounded-r-lg"
          >
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <p className="font-title-sm">{error}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <StatCard 
            label={t('agentWorkspace.stats.unread', 'Unread Intel')} 
            value={data.unread_messages} 
            icon={<Inbox className="text-primary w-6 h-6" />} 
            loading={loading} 
          />
          <StatCard 
            label={t('agentWorkspace.stats.urgent', 'Urgent Alerts')} 
            value={data.urgent_messages} 
            icon={<ShieldAlert className="text-error w-6 h-6" />} 
            loading={loading} 
            highlight
          />
          <StatCard 
            label={t('agentWorkspace.stats.missions', 'Active Missions')} 
            value={data.active_missions} 
            icon={<CheckCircle2 className="text-secondary w-6 h-6" />} 
            loading={loading} 
          />
        </div>

        {mode !== 'timeline' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-container-high border border-outline-variant rounded-xl p-md shadow-lg relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center space-x-sm mb-md text-on-surface-variant">
              <Lock className="w-4 h-4" />
              <span className="font-label-caps tracking-widest uppercase">Encrypted Transmission</span>
            </div>

            <textarea 
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-md text-on-surface font-mono-data placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none h-32"
              value={body} 
              onChange={e => setBody(e.target.value)} 
              placeholder={t('agentWorkspace.input.placeholder', 'Enter directive or intelligence report...')} 
            />
            
            <div className="flex flex-col sm:flex-row items-center justify-between mt-md space-y-md sm:space-y-0">
              <label className="flex items-center space-x-sm cursor-pointer group/label">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={urgent} 
                    onChange={e => setUrgent(e.target.checked)} 
                    className="appearance-none w-5 h-5 border-2 border-outline-variant rounded bg-transparent checked:bg-error checked:border-error transition-colors"
                  />
                  {urgent && <CheckCircle2 className="w-3 h-3 text-on-error absolute pointer-events-none" />}
                </div>
                <span className={`font-label-caps uppercase tracking-wider transition-colors ${urgent ? 'text-error' : 'text-on-surface-variant group-hover/label:text-primary'}`}>
                  {t('agentWorkspace.input.markUrgent', 'Flag as High Priority')}
                </span>
              </label>
              
              <button 
                onClick={send} 
                disabled={!body.trim() || sending}
                className="w-full sm:w-auto px-lg py-sm bg-primary hover:bg-primary-container text-on-primary font-title-sm rounded-lg transition-all flex items-center justify-center space-x-sm disabled:opacity-50 disabled:cursor-not-allowed group/btn relative overflow-hidden shadow-lg cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-in-out" />
                {sending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                <span className="relative">{t('agentWorkspace.input.transmit', 'Transmit')}</span>
              </button>
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-md"
        >
          <div className="flex items-center justify-between mb-md">
            <h3 className="font-headline-md text-on-surface flex items-center space-x-sm">
              <FileText className="w-6 h-6 text-primary" />
              <span>{t('agentWorkspace.logs.title', 'Operation Logs')}</span>
            </h3>
            <button onClick={load} className="p-sm text-outline-variant hover:text-primary transition-colors rounded-full hover:bg-primary/10 cursor-pointer">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <motion.div 
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-lg bg-surface-container border border-outline-variant rounded-xl animate-pulse flex flex-col space-y-sm"
                >
                  <div className="h-5 bg-surface-variant rounded w-1/3" />
                  <div className="h-4 bg-surface-variant rounded w-full" />
                  <div className="h-4 bg-surface-variant rounded w-5/6" />
                  <div className="h-3 bg-surface-container-highest rounded w-1/4 mt-md" />
                </motion.div>
              ))
            ) : filteredMessages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-xl bg-surface-container-low border border-dashed border-outline-variant rounded-xl text-center space-y-md shadow-inner"
              >
                <div className="w-20 h-20 rounded-full bg-surface-variant flex items-center justify-center mb-sm shadow-lg">
                  <ShieldAlert className={`w-10 h-10 ${mode === 'urgent' ? 'text-error' : 'text-primary'}`} />
                </div>
                <h4 className="font-title-sm text-on-surface">
                  {mode === 'urgent' ? t('agentWorkspace.empty.urgent', 'No Urgent Directives') : t('agentWorkspace.empty.general', 'No Active Communications')}
                </h4>
                <p className="text-on-surface-variant max-w-md font-body-sm">
                  {t('agentWorkspace.empty.description', 'Your channel is secure and quiet. Await further instructions or transmit a new report above.')}
                </p>
              </motion.div>
            ) : (
              filteredMessages.map((m, i) => (
                <motion.div 
                  key={m.id || i} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-lg rounded-xl border relative overflow-hidden group ${
                    m.is_urgent 
                      ? 'bg-error-container/10 border-error/30 shadow-[0_0_15px_rgba(var(--color-error),0.1)]' 
                      : 'bg-surface-container border-outline-variant hover:border-primary/50'
                  } transition-colors`}
                >
                  {m.is_urgent && (
                    <div className="absolute top-0 right-0 px-md py-xs bg-error text-on-error font-label-caps uppercase tracking-wider rounded-bl-lg shadow-md">
                      Priority: Crimson
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-sm pr-24">
                    <b className={`font-title-sm tracking-wide ${m.is_urgent ? 'text-error' : 'text-primary'}`}>
                      {m.subject || t('agentWorkspace.message.defaultSubject', 'Encrypted Directive')}
                    </b>
                  </div>
                  
                  <p className="text-on-surface-variant font-mono-data leading-relaxed mb-md whitespace-pre-wrap">
                    {m.body}
                  </p>
                  
                  <div className="flex items-center font-label-caps text-outline font-mono-data mt-sm pt-sm border-t border-surface-variant">
                    <Activity className="w-4 h-4 mr-sm text-primary/50" />
                    <span>Logged: {new Date(m.created_at || Date.now()).toLocaleString()}</span>
                    {m.id && <span className="ml-md opacity-50">ID: {m.id.substring(0,8)}</span>}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AppLayout>
  );
}

function StatCard({ label, value, icon, loading, highlight }) {
  return (
    <div className={`p-md rounded-xl border relative overflow-hidden ${highlight ? 'bg-error-container/10 border-error/20' : 'bg-surface-container-high border-outline-variant'}`}>
      <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none transform scale-[2] text-current">
        {icon}
      </div>
      <div className="flex items-center space-x-sm mb-sm text-on-surface-variant">
        <div className={`p-sm rounded-lg ${highlight ? 'bg-error-container text-on-error-container' : 'bg-surface-variant text-primary'}`}>
          {icon}
        </div>
        <span className="font-label-caps uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-sm">
        {loading ? (
          <div className="h-10 w-24 bg-surface-variant animate-pulse rounded" />
        ) : (
          <span className={`font-display-lg-mobile tracking-tight ${highlight ? 'text-error' : 'text-on-surface'}`}>
            {value !== undefined ? value : 0}
          </span>
        )}
      </div>
    </div>
  )
}
