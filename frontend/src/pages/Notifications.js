import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const typeIcon = { request_received:'📬', request_accepted:'🎉', request_rejected:'😞', project_closed:'🔒', general:'🔔' };
const typeColor = { request_received:'#6c63ff', request_accepted:'#4ade80', request_rejected:'#ff5757', project_closed:'#ffb347', general:'#9aa3bf' };

export default function Notifications() {
  const { API } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/notifications`);
      setNotifications(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [API]);

  const markRead = async (id) => {
    await axios.put(`${API}/notifications/${id}/read`);
    setNotifications(ns => ns.map(n => n._id === id ? {...n, read: true} : n));
  };

  const markAllRead = async () => {
    await axios.put(`${API}/notifications/read-all`);
    setNotifications(ns => ns.map(n => ({...n, read: true})));
  };

  const unread = notifications.filter(n => !n.read).length;
  const timeAgo = (date) => {
    const d = Math.floor((Date.now() - new Date(date)) / 1000);
    if (d < 60) return 'just now';
    if (d < 3600) return `${Math.floor(d/60)}m ago`;
    if (d < 86400) return `${Math.floor(d/3600)}h ago`;
    return `${Math.floor(d/86400)}d ago`;
  };

  if (loading) return <div style={{padding:'3rem',textAlign:'center',color:'#6c63ff'}}>Loading...</div>;

  return (
    <div style={{padding:'2rem',maxWidth:700,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2rem'}}>
        <div>
          <h1 style={{fontWeight:800,fontSize:'1.75rem'}}>Notifications</h1>
          {unread > 0 && <p style={{color:'#ffb347',fontSize:'0.875rem'}}>{unread} unread</p>}
        </div>
        {unread > 0 && <button onClick={markAllRead} style={{padding:'8px 16px',background:'transparent',border:'1px solid #252d47',borderRadius:8,color:'#9aa3bf',cursor:'pointer',fontSize:'0.875rem'}}>Mark all read</button>}
      </div>

      {notifications.length === 0 ? (
        <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,padding:'4rem',textAlign:'center',color:'#5c6580'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🔔</div>
          <div style={{fontSize:'1rem'}}>No notifications yet</div>
        </div>
      ) : notifications.map(n => (
        <div key={n._id} onClick={()=>!n.read && markRead(n._id)} style={{background:n.read?'#161c2e':'#1c2340',border:`1px solid ${n.read?'#252d47':'#2e3855'}`,borderRadius:14,padding:'1.25rem',marginBottom:'0.75rem',cursor:n.read?'default':'pointer',transition:'all 0.15s'}}>
          <div style={{display:'flex',gap:'1rem',alignItems:'flex-start'}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:`${typeColor[n.type]}20`,border:`1px solid ${typeColor[n.type]}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',flexShrink:0}}>{typeIcon[n.type]}</div>
            <div style={{flex:1}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.25rem'}}>
                <div style={{fontWeight:n.read?500:700,fontSize:'0.9rem'}}>{n.title}</div>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  {!n.read && <div style={{width:8,height:8,borderRadius:'50%',background:'#6c63ff'}} />}
                  <span style={{color:'#5c6580',fontSize:'0.75rem'}}>{timeAgo(n.createdAt)}</span>
                </div>
              </div>
              <p style={{color:'#9aa3bf',fontSize:'0.875rem',lineHeight:1.5}}>{n.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
