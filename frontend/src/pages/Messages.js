import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Messages() {
  const { user, API } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers]           = useState([]);
  const [selected, setSelected]           = useState(null);
  const [messages, setMessages]           = useState([]);
  const [text, setText]                   = useState('');
  const [loading, setLoading]             = useState(true);
  const [sending, setSending]             = useState(false);
  const [search, setSearch]               = useState('');
  const [showNew, setShowNew]             = useState(false);
  const bottomRef = useRef();
  const pollRef   = useRef();

  const loadConversations = async () => {
    try {
      const { data } = await axios.get(`${API}/messages/conversations`, { timeout: 15000 });
      setConversations(data);
    } catch {}
    setLoading(false);
  };

  const loadAllUsers = async () => {
    try {
      const [sRes, fRes] = await Promise.all([
        axios.get(`${API}/users/students`, { timeout: 15000 }),
        axios.get(`${API}/users/faculty`,  { timeout: 15000 }),
      ]);
      const others = [...sRes.data, ...fRes.data].filter(u => u._id !== user._id);
      setAllUsers(others);
    } catch {}
  };

  const loadMessages = async (otherUser) => {
    try {
      const { data } = await axios.get(`${API}/messages/${otherUser._id}`, { timeout: 15000 });
      setMessages(data);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 100);
      // Refresh conversations to clear unread badge
      loadConversations();
    } catch {}
  };

  useEffect(() => {
    loadConversations();
    loadAllUsers();
  }, [API]);

  // Poll messages every 5 seconds when chat is open
  useEffect(() => {
    if (!selected) return;
    pollRef.current = setInterval(() => loadMessages(selected), 5000);
    return () => clearInterval(pollRef.current);
  }, [selected]);

  const openChat = (otherUser) => {
    setSelected(otherUser);
    setShowNew(false);
    setMessages([]);
    loadMessages(otherUser);
  };

  const handleSend = async () => {
    if (!text.trim() || !selected) return;
    setSending(true);
    try {
      const { data } = await axios.post(`${API}/messages`, {
        receiverId: selected._id,
        text: text.trim()
      }, { timeout: 15000 });
      setMessages(prev => [...prev, data]);
      setText('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 50);
      loadConversations();
    } catch (err) { alert(err.response?.data?.message || 'Failed to send'); }
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filteredUsers = allUsers.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = { student:'#00d4aa', staff:'#6c63ff', admin:'#ff6b9d' };
  const initials  = (name) => name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || '?';

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    }
    return d.toLocaleDateString([], { month:'short', day:'numeric' });
  };

  return (
    <div style={{display:'flex',height:'calc(100vh - 60px)',background:'#0a0d14'}}>

      {/* LEFT — Conversations */}
      <div style={{width:300,borderRight:'1px solid #252d47',display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:'1rem',borderBottom:'1px solid #252d47'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
            <h2 style={{fontWeight:800,fontSize:'1rem'}}>💬 Messages</h2>
            <button onClick={()=>setShowNew(true)} style={{padding:'5px 12px',borderRadius:8,background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',color:'#fff',fontSize:'0.75rem',fontWeight:700,cursor:'pointer'}}>+ New</button>
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto'}}>
          {loading ? (
            <div style={{padding:'2rem',textAlign:'center',color:'#5c6580',fontSize:'0.875rem'}}>Loading...</div>
          ) : conversations.length === 0 ? (
            <div style={{padding:'2rem',textAlign:'center',color:'#5c6580',fontSize:'0.875rem'}}>
              <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>💬</div>
              No conversations yet<br/>
              <button onClick={()=>setShowNew(true)} style={{marginTop:'0.75rem',color:'#6c63ff',background:'transparent',border:'none',cursor:'pointer',fontSize:'0.875rem'}}>Start a new chat →</button>
            </div>
          ) : conversations.map(c => (
            <div
              key={c.user._id}
              onClick={() => openChat(c.user)}
              style={{padding:'0.85rem 1rem',cursor:'pointer',borderBottom:'1px solid #161c2e',background:selected?._id===c.user._id?'rgba(108,99,255,0.12)':'transparent',display:'flex',gap:'0.75rem',alignItems:'center'}}
            >
              <div style={{width:40,height:40,borderRadius:'50%',background:`linear-gradient(135deg,${roleColor[c.user.role]||'#6c63ff'}80,${roleColor[c.user.role]||'#6c63ff'})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'0.8rem',flexShrink:0,position:'relative'}}>
                {initials(c.user.name)}
                {c.unread > 0 && <div style={{position:'absolute',top:-3,right:-3,width:16,height:16,borderRadius:'50%',background:'#ff6b9d',fontSize:'0.6rem',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>{c.unread}</div>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontWeight:c.unread>0?700:600,fontSize:'0.875rem',color:'#e8eaf0'}}>{c.user.name}</span>
                  <span style={{color:'#5c6580',fontSize:'0.7rem'}}>{formatTime(c.lastTime)}</span>
                </div>
                <div style={{color:c.unread>0?'#9aa3bf':'#5c6580',fontSize:'0.75rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',fontWeight:c.unread>0?600:'normal'}}>{c.lastMessage}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Chat Window */}
      <div style={{flex:1,display:'flex',flexDirection:'column'}}>
        {!selected ? (
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',color:'#5c6580'}}>
            <div style={{fontSize:'3rem',marginBottom:'1rem'}}>💬</div>
            <div style={{fontSize:'1rem',color:'#9aa3bf',marginBottom:'0.5rem'}}>Select a conversation</div>
            <div style={{fontSize:'0.875rem'}}>or start a new chat</div>
            <button onClick={()=>setShowNew(true)} style={{marginTop:'1rem',padding:'10px 24px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,cursor:'pointer'}}>+ New Message</button>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{padding:'1rem 1.5rem',borderBottom:'1px solid #252d47',display:'flex',alignItems:'center',gap:'0.75rem',background:'#0f1320'}}>
              <div style={{width:40,height:40,borderRadius:'50%',background:`linear-gradient(135deg,${roleColor[selected.role]||'#6c63ff'}80,${roleColor[selected.role]||'#6c63ff'})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'0.85rem',flexShrink:0}}>{initials(selected.name)}</div>
              <div>
                <div style={{fontWeight:700,fontSize:'0.95rem'}}>{selected.name}</div>
                <div style={{fontSize:'0.75rem',color:roleColor[selected.role]||'#9aa3bf',fontWeight:600,textTransform:'capitalize'}}>{selected.role} · {selected.department}</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{flex:1,overflowY:'auto',padding:'1.5rem',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              {messages.length === 0 ? (
                <div style={{textAlign:'center',color:'#5c6580',marginTop:'3rem'}}>
                  <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>👋</div>
                  <div>Say hi to {selected.name}!</div>
                </div>
              ) : messages.map(m => {
                const isMe = m.sender._id === user._id || m.sender === user._id;
                return (
                  <div key={m._id} style={{display:'flex',justifyContent:isMe?'flex-end':'flex-start'}}>
                    <div style={{maxWidth:'70%'}}>
                      {!isMe && <div style={{fontSize:'0.7rem',color:'#5c6580',marginBottom:'3px',marginLeft:'4px'}}>{m.sender.name}</div>}
                      <div style={{padding:'10px 14px',borderRadius:isMe?'16px 16px 4px 16px':'16px 16px 16px 4px',background:isMe?'linear-gradient(135deg,#6c63ff,#8b85ff)':'#161c2e',border:isMe?'none':'1px solid #252d47',color:'#e8eaf0',fontSize:'0.9rem',lineHeight:1.5,wordBreak:'break-word'}}>
                        {m.text}
                      </div>
                      <div style={{fontSize:'0.65rem',color:'#5c6580',marginTop:'3px',textAlign:isMe?'right':'left',marginLeft:isMe?0:'4px',marginRight:isMe?'4px':0}}>{formatTime(m.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Message Input */}
            <div style={{padding:'1rem 1.5rem',borderTop:'1px solid #252d47',display:'flex',gap:'0.75rem',alignItems:'flex-end',background:'#0f1320'}}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKey}
                placeholder={`Message ${selected.name}... (Enter to send)`}
                rows={1}
                style={{flex:1,padding:'10px 14px',background:'#161c2e',border:'1px solid #252d47',borderRadius:12,color:'#e8eaf0',fontSize:'0.9rem',outline:'none',resize:'none',fontFamily:'inherit',lineHeight:1.5}}
              />
              <button
                onClick={handleSend}
                disabled={sending || !text.trim()}
                style={{padding:'10px 20px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,cursor:'pointer',fontSize:'0.9rem',flexShrink:0,opacity:!text.trim()?0.5:1}}
              >
                {sending ? '...' : '➤'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* New Message Modal */}
      {showNew && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem'}} onClick={()=>setShowNew(false)}>
          <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,width:'100%',maxWidth:420,maxHeight:'70vh',overflow:'hidden',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'1.25rem',borderBottom:'1px solid #252d47',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3 style={{fontWeight:700}}>New Message</h3>
              <button onClick={()=>setShowNew(false)} style={{background:'transparent',border:'none',color:'#9aa3bf',fontSize:'1.3rem',cursor:'pointer'}}>✕</button>
            </div>
            <div style={{padding:'0.75rem 1rem',borderBottom:'1px solid #252d47'}}>
              <input
                value={search}
                onChange={e=>setSearch(e.target.value)}
                placeholder="🔍 Search by name, department, role..."
                autoFocus
                style={{width:'100%',padding:'8px 12px',background:'#0f1320',border:'1px solid #252d47',borderRadius:8,color:'#e8eaf0',fontSize:'0.875rem',outline:'none',boxSizing:'border-box'}}
              />
            </div>
            <div style={{overflowY:'auto',flex:1}}>
              {filteredUsers.length === 0 ? (
                <div style={{padding:'2rem',textAlign:'center',color:'#5c6580',fontSize:'0.875rem'}}>No users found</div>
              ) : filteredUsers.map(u => (
                <div
                  key={u._id}
                  onClick={() => openChat(u)}
                  style={{padding:'0.75rem 1rem',cursor:'pointer',display:'flex',gap:'0.75rem',alignItems:'center',borderBottom:'1px solid #0f1320'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(108,99,255,0.08)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  <div style={{width:38,height:38,borderRadius:'50%',background:`linear-gradient(135deg,${roleColor[u.role]||'#6c63ff'}80,${roleColor[u.role]||'#6c63ff'})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'0.8rem',flexShrink:0}}>{initials(u.name)}</div>
                  <div>
                    <div style={{fontWeight:600,fontSize:'0.875rem',color:'#e8eaf0'}}>{u.name}</div>
                    <div style={{fontSize:'0.75rem',color:roleColor[u.role]||'#9aa3bf',fontWeight:600,textTransform:'capitalize'}}>{u.role} · {u.department}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
