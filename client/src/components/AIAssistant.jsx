import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { sendAssistantMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function workerLine(w) {
  const bits = [];
  if (w.rating != null) bits.push(`⭐ ${w.rating}${w.totalRatings != null ? ` (${w.totalRatings})` : ''}`);
  if (w.city) bits.push(`📍 ${w.city}`);
  if (w.availability) bits.push(w.availability);
  if (w.startingPrice != null) bits.push(`₹${w.startingPrice}+`);
  return bits.join(' · ');
}

export default function AIAssistant() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const welcome = t('assistant.welcome');
  const quickActions = [
    { label: t('assistant.findPlumber'), message: 'I need a plumber' },
    { label: t('assistant.findElectrician'), message: 'I need an electrician' },
    { label: t('assistant.acRepair'), message: 'I need AC repair' },
    { label: t('assistant.findCleaner'), message: 'I need a cleaner' }
  ];
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'assistant', content: welcome, welcome: true }
  ]);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending, open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    setMessages((previous) => previous.length === 1 && previous[0].welcome
      ? [{ ...previous[0], content: welcome }]
      : previous);
  }, [welcome]);

  const historyForApi = messages
    .filter((m) => !m.welcome && (m.role === 'user' || m.role === 'assistant') && m.content)
    .map((m) => ({ role: m.role, content: m.content }));

  const send = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || sending) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const { data } = await sendAssistantMessage({
        message: trimmed,
        history: historyForApi,
        language: i18n.language === 'hi' ? 'hi' : 'en'
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          workers: data.workers || [],
          action: data.action || null
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: 'assistant', content: !err.response ? t('assistant.networkError') : (err.response.data?.message || t('assistant.error')), error: true }
      ]);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const showQuick = messages.length === 1 && messages[0].welcome && !sending;

  return (
    <div className="ai-widget">
      {open && (
        <div className="ai-panel" role="dialog" aria-label="ActiveSetu AI Assistant">
          <div className="ai-panel-header">
            <span>🤖 ActiveSetu AI Assistant</span>
            <button type="button" className="ai-panel-close" onClick={() => setOpen(false)} aria-label={t('assistant.close')}>
              ×
            </button>
          </div>

          <div className="ai-panel-messages" ref={listRef}>
            {messages.map((m) => (
              <div key={m.id} className={`ai-row ${m.role === 'user' ? 'ai-row-user' : 'ai-row-bot'}`}>
                {m.role !== 'user' && <div className="ai-chat-avatar bot-av">🤖</div>}
                <div>
                  <div className={`ai-bubble ${m.role === 'user' ? 'ai-bubble-user' : 'ai-bubble-bot'}`}>
                    {m.content}
                  </div>
                  {m.workers?.length > 0 && (
                    <div className="ai-worker-list">
                      {m.workers.map((w) => (
                        <div className="ai-worker-chip" key={w.id}>
                          <div className="ai-worker-chip-name">{w.name || t('common.worker')}</div>
                          <div className="ai-worker-chip-meta">
                            {[w.primarySkill, workerLine(w)].filter(Boolean).join(' · ')}
                          </div>
                          {user?.role === 'customer' && w.id && (
                            <Link to={`/book/${w.id}`} className="ai-chip-link" onClick={() => setOpen(false)}>
                              {t('assistant.book')}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {m.action?.to && (
                    <Link
                      to={m.action.to}
                      className="btn btn-primary btn-sm ai-action-btn"
                      onClick={() => setOpen(false)}
                    >
                      {m.action.label || t('assistant.viewResults')}
                    </Link>
                  )}
                </div>
                {m.role === 'user' && <div className="ai-chat-avatar user-av">👤</div>}
              </div>
            ))}

            {showQuick && (
              <div className="ai-quick-actions">
                {quickActions.map((q) => (
                  <button key={q.label} type="button" className="ai-quick-btn" onClick={() => send(q.message)}>
                    {q.label}
                  </button>
                ))}
              </div>
            )}

            {sending && (
              <div className="ai-row ai-row-bot">
                <div className="ai-chat-avatar bot-av">🤖</div>
                <div className="ai-bubble ai-bubble-bot ai-typing" aria-label="Assistant is typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          <form
            className="ai-panel-input"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t('assistant.typeMessage')}
              disabled={sending}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={sending || !input.trim()}>
              {t('assistant.send')}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className={`ai-fab ${open ? 'ai-fab-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? `✕ ${t('assistant.close')}` : '🤖 Ask ActiveSetu'}
      </button>
    </div>
  );
}
