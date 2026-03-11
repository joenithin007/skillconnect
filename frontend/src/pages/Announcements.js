import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TYPE_CONFIG = {
  general:   { icon: '📢', label: 'General',   color: '#6c63ff' },
  event:     { icon: '🎉', label: 'Event',     color: '#00d4aa' },
  hackathon: { icon: '💻', label: 'Hackathon', color: '#ffb347' },
  deadline:  { icon: '⏰', label: 'Deadline',  color: '#ff5757' },
  urgent:    { icon: '🚨', label: 'Urgent',    color: '#ff6b9d' },
};

export default function Announcements() {
  const { user, API } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');
  const [form, setForm] = useState({
    title:'', content:'', type:'general', pinned: false
  });

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 };
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/announcements`, getHeaders());
      setAnnouncements(data);
    } catch(err) {
      console.error('Load error:', err.response?.data);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [API]);

  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) { showMsg('❌ Title and content required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`${API}/announcements/${editing._id}`, form, getHeaders());
      } else {
        await axios.post(`${API}/announcements`, form, getHeaders());
      }
      setShowForm(false);
      setEditing(null);
      setForm({ title:'', content:'', type:'general', pinned:false });
      showMsg('✅ Announcement saved!');
      load();
    } catch (err) {
      console.error('Submit error:', err.response?.data);
      showMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await axios.delete(`${API}/announcements/${id}`, getHeaders());
      setAnnouncements(prev => prev.filter(a => a._id !== id));
    } catch { showMsg('❌ Failed to delete'); }
  };

  const handleEdit = (a) => {
    setEditing(a);
    setForm({ title: a.title, content: a.content, type: a.type, pinned: a.pinned });
    setShowForm(true);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
    day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'
  });

  return (
    <div style={{padding:'2rem',maxWidth:860,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2rem'}}>
        <div>
          <h1 style={{fontWeight:800,fontSize:'1.75rem',marginBottom:'0.25rem'}}>📢 Announcements</h1>
          <p style={{color:'#9aa3bf',fontSize:'0.875rem'}}>College notices, events and updates</p>
        </div>
        <div style={{display:'flex',gap:'0.75rem'}}>
          <button onClick={load} style={{padding:'8px 16px',borderRadius:8,border:'1px solid #252d47',background:'transparent',color:'#9aa3bf',fontSize:'0.8rem',cursor:'pointer'}}>🔄 Refresh</button>
          {user.role === 'admin' && (
            <button onClick={()=>{setShowForm(true);setEditing(null);setForm({title:'',content:'',type:'general',pinned:false});}} style={{padding:'10px 20px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,cursor:'pointer'}}>+ Post Announcement</button>
          )}
        </div>
      </div>

      {msg && <div style={{background:msg.includes('✅')?'rgba(74,222,128,0.1)':'rgba(255,87,87,0.1)',border:`1px solid ${msg.includes('✅')?'#4ade8040':'#ff575740'}`,borderRadius:10,padding:'12px',marginBottom:'1rem',color:msg.includes('✅')?'#4ade80':'#ff5757',fontSize:'0.875rem'}}>{msg}</div>}

      {loading ? (
        <div style={{textAlign:'center',padding:'4rem'}}>
          <div style={{fontSize:'2rem',marginBottom:'1rem'}}>⏳</div>
          <div style={{color:'#6c63ff'}}>Loading announcements...</div>
        </div>
      ) : announcements.length === 0 ? (
        <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,padding:'4rem',textAlign:'center',color:'#5c6580'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>📢</div>
          <div style={{color:'#9aa3bf',marginBottom:'0.5rem'}}>No announcements yet</div>
          {user.role === 'admin' && <div style={{fontSize:'0.875rem'}}>Post the first announcement!</div>}
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          {announcements.map(a => {
            const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.general;
            return (
              <div key={a._id} style={{background:'#161c2e',border:`1px solid ${a.pinned?cfg.color+'40':'#252d47'}`,borderRadius:16,padding:'1.5rem',position:'relative'}}>
                {a.pinned && (
                  <div style={{position:'absolute',top:12,right:12,padding:'2px 10px',borderRadius:99,background:`${cfg.color}15`,border:`1px solid ${cfg.color}40`,color:cfg.color,fontSize:'0.7rem',fontWeight:700}}>📌 Pinned</div>
                )}
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.75rem'}}>
                  <div style={{width:40,height:40,borderRadius:10,background:`${cfg.color}15`,border:`1px solid ${cfg.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0}}>{cfg.icon}</div>
                  <div>
                    <span style={{padding:'2px 10px',borderRadius:99,fontSize:'0.7rem',fontWeight:700,background:`${cfg.color}15`,color:cfg.color,border:`1px solid ${cfg.color}30`}}>{cfg.label}</span>
                    <h3 style={{fontWeight:700,fontSize:'1.05rem',color:'#e8eaf0',marginTop:'0.25rem'}}>{a.title}</h3>
                  </div>
                </div>
                <p style={{color:'#9aa3bf',lineHeight:1.7,marginBottom:'1rem',fontSize:'0.9rem'}}>{a.content}</p>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'0.75rem',borderTop:'1px solid #252d47'}}>
                  <div style={{color:'#5c6580',fontSize:'0.75rem'}}>
                    Posted by <span style={{color:'#9aa3bf',fontWeight:600}}>{a.postedBy?.name}</span> · {formatDate(a.createdAt)}
                  </div>
                  {user.role === 'admin' && (
                    <div style={{display:'flex',gap:'0.5rem'}}>
                      <button onClick={()=>handleEdit(a)} style={{padding:'5px 12px',borderRadius:7,border:'1px solid #252d47',background:'transparent',color:'#9aa3bf',fontSize:'0.75rem',cursor:'pointer'}}>Edit</button>
                      <button onClick={()=>handleDelete(a._id)} style={{padding:'5px 12px',borderRadius:7,border:'1px solid #ff575740',background:'rgba(255,87,87,0.1)',color:'#ff5757',fontSize:'0.75rem',cursor:'pointer'}}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem'}}>
          <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,padding:'2rem',width:'100%',maxWidth:540,maxHeight:'90vh',overflowY:'auto'}}>
            <h2 style={{fontWeight:800,marginBottom:'1.5rem'}}>{editing?'Edit Announcement':'+ Post Announcement'}</h2>
            <div style={{marginBottom:'1rem'}}>
              <label style={labelStyle}>Type</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'0.5rem'}}>
                {Object.entries(TYPE_CONFIG).map(([key,cfg]) => (
                  <button key={key} onClick={()=>s('type',key)} style={{padding:'8px 4px',borderRadius:8,border:`2px solid ${form.type===key?cfg.color:'#252d47'}`,background:form.type===key?`${cfg.color}15`:'transparent',color:form.type===key?cfg.color:'#9aa3bf',fontWeight:600,cursor:'pointer',fontSize:'0.7rem',textAlign:'center'}}>
                    <div style={{fontSize:'1.1rem'}}>{cfg.icon}</div>
                    <div>{cfg.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:'1rem'}}>
              <label style={labelStyle}>Title *</label>
              <input value={form.title} onChange={e=>s('title',e.target.value)} placeholder="e.g. Hackathon Registration Open!" style={inputStyle} />
            </div>
            <div style={{marginBottom:'1rem'}}>
              <label style={labelStyle}>Content *</label>
              <textarea value={form.content} onChange={e=>s('content',e.target.value)} placeholder="Write the full announcement details here..." rows={5} style={{...inputStyle,resize:'vertical'}} />
            </div>
            <div style={{marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'0.75rem'}}>
              <input type="checkbox" id="pinned" checked={form.pinned} onChange={e=>s('pinned',e.target.checked)} style={{width:16,height:16,cursor:'pointer'}} />
              <label htmlFor="pinned" style={{color:'#9aa3bf',fontSize:'0.875rem',cursor:'pointer'}}>📌 Pin this announcement</label>
            </div>
            <div style={{display:'flex',gap:'0.75rem'}}>
              <button onClick={()=>{setShowForm(false);setEditing(null);}} style={{flex:1,padding:'12px',background:'transparent',border:'1px solid #252d47',borderRadius:10,color:'#9aa3bf',fontWeight:600,cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSubmit} disabled={saving} style={{flex:2,padding:'12px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,cursor:'pointer'}}>
                {saving?'Saving...':editing?'Save Changes':'Post Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = {display:'block',marginBottom:'6px',fontSize:'0.875rem',fontWeight:600,color:'#9aa3bf'};
const inputStyle = {width:'100%',padding:'10px 14px',background:'#0f1320',border:'1px solid #252d47',borderRadius:8,color:'#e8eaf0',fontSize:'0.9rem',outline:'none',boxSizing:'border-box'};
