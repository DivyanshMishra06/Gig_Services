import { useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { createConversationFromProvider, mockConversations } from '../../data/mockChat';
import { useTranslation } from 'react-i18next';

const currentTime = () => new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date());

export default function Chat() {
  const { t } = useTranslation();
  const { providerId } = useParams();
  const location = useLocation();
  const attachmentInput = useRef(null);
  const initialConversations = useMemo(() => {
    const list = mockConversations.map((conversation) => ({ ...conversation, messages: [...conversation.messages] }));
    const provider = location.state?.provider;
    if (provider && !list.some((conversation) => conversation.providerId === provider._id)) list.unshift(createConversationFromProvider(provider));
    if (providerId && !list.some((conversation) => conversation.providerId === providerId)) {
      list.unshift({ providerId, providerName: t('chat.serviceProvider'), providerSkill: t('chat.gigServices'), phone: '9876543210', lastMessage: t('chat.startPrompt'), updatedAt: 'New', messages: [] });
    }
    return list;
  }, [location.state, providerId, t]);
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(providerId || initialConversations[0]?.providerId);
  const [draft, setDraft] = useState('');
  const [attachment, setAttachment] = useState('');
  const selected = conversations.find((conversation) => conversation.providerId === selectedId) || conversations[0];

  const sendMessage = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text && !attachment) return;
    const message = { id: `local-${Date.now()}`, sender: 'customer', text: text || `Attachment: ${attachment}`, timestamp: currentTime() };
    setConversations((list) => list.map((conversation) => conversation.providerId === selected.providerId ? { ...conversation, messages: [...conversation.messages, message], lastMessage: message.text, updatedAt: 'Now' } : conversation));
    setDraft('');
    setAttachment('');
  };

  if (!selected) return <main className="chat-page"><div className="empty-state"><h3>{t('chat.noConversations')}</h3><Link className="btn btn-primary" to="/workers">{t('chat.findProvider')}</Link></div></main>;

  return (
    <main className="chat-page">
      <div className="page-header"><h1>{t('chat.title')}</h1><p>{t('chat.subtitle')}</p></div>
      <section className="chat-layout">
        <aside className="conversation-list" aria-label={t('chat.conversations')}>
          <div className="conversation-list-title">{t('chat.conversations')}</div>
          {conversations.map((conversation) => <button type="button" className={`conversation-item ${conversation.providerId === selected.providerId ? 'active' : ''}`} key={conversation.providerId} onClick={() => setSelectedId(conversation.providerId)}>
            <div className="conversation-avatar">{conversation.providerName.charAt(0)}</div>
            <div className="conversation-copy"><strong>{conversation.providerName}</strong><span>{conversation.lastMessage}</span></div><time>{conversation.updatedAt}</time>
          </button>)}
        </aside>
        <div className="chat-panel">
          <header className="chat-header"><div className="conversation-avatar">{selected.providerName.charAt(0)}</div><div><h2>{selected.providerName}</h2><p>{selected.providerSkill}</p></div><a className="chat-call" href={`tel:${selected.phone}`} aria-label={`Call ${selected.providerName}`} title={`Call ${selected.phone}`}>📞</a></header>
          <div className="message-list" aria-live="polite">
            {selected.messages.length ? selected.messages.map((message) => <div className={`message-row ${message.sender === 'customer' ? 'sent' : 'received'}`} key={message.id}><div className="message-bubble">{message.text}<time>{message.timestamp}</time></div></div>) : <p className="chat-empty">{t('chat.startConversation', { name: selected.providerName })}</p>}
          </div>
          <form className="message-composer" onSubmit={sendMessage}>
            <input ref={attachmentInput} type="file" hidden onChange={(event) => setAttachment(event.target.files?.[0]?.name || '')} />
            <button type="button" className="attachment-button" onClick={() => attachmentInput.current?.click()} aria-label={t('chat.attachFile')} title={t('chat.attachFile')}>📎</button>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={attachment ? t('chat.attached', { name: attachment }) : t('chat.placeholder')} aria-label={t('chat.title')} />
            <button className="btn btn-primary btn-sm" type="submit">{t('chat.send')}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
