import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SkillTag from '../components/SkillTag';

const roleColor = { student:'#00d4aa', staff:'#6c63ff', admin:'#ff6b9d' };
const initials  = (name) => name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'?';

export default function Friends() {
  const { user, API } = useAuth();
  const [tab, setTab]         = useState('friends');
  const [myData, setMyData]   = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [msg, setMsg]         = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [frRes, sRes, fRes] = await Promise.all([
        axios.get(`${API}/friends/my`, { timeout: 15000 }),
        axios.get(`${API}/users/students`, { timeout: 15000 }),
        axios.get(`${API}/users/faculty`,  { timeout: 15000 }),
      ]);
      setMyData(frRes.data);
      const others = [...sRes.data, ...fRes.data].filter(u => u._id !== user._id);
      setAllUsers(others);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [API]);

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const handleSendRequest = async (receiverId) => {
    setActionLoading(receiverId);
    try {
      await axios.post(`${API}/friends/request`, { receiverId }, { timeout: 15000 });
      showMsg('✅ Friend request sent!');
      await load();
    } catch (err) { showMsg('❌ ' + (err.response?.data?.message || 'Failed')); }
    setActionLoading('');
  };

  const handleRespond = async (id, status) => {
    setActionLoading(id + status);
    try {
      await axios.put(`${API}/friends/${id}`, { status }, { timeout: 15000 });
      showMsg(status === 'accepted' ? '✅ Friend request accepted!' : '❌ Request rejected');
      await load();
    } catch (err) { showMsg('❌ Failed'); }
    setActionLoading('');
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this connection?')) return;
    setActionLoading(id);
    try {
      await axios.delete(`${API}/friends/${id}`, { timeout: 15000 });
      showMsg('Removed');
      await load();
    } catch {}
    setActionLoading('');
  };

  // Categorize
  const friends  = myData.filter(f => f.status === 'accepted');
  const incoming = myData.filter(f => f.status === 'pending' && f.receiver._id === user._id);
  const outgoing = myData.filter(f => f.status === 'pending' && f.sender._id === user._id);

  // For "Discover" tab — show users not yet connected
  const connectedIds = new Set(myData.map(f =>
    f.sender._id === user._id ? f.receiver._id : f.sender._id
  ));
  const discover = allUsers.filter(u =>
    !connectedIds.has(u._id) &&
    (u.name?.toLowerCase().includes(search.toLowerCase()) ||
     u.department?.toLowerCase().includes(search.toLowerCase()) ||
     u.role?.toLowerCase().includes(search.toLowerCase()) ||
     u.skills?.some(s => s.toLowerCase().includes(search.toLowerCase())))
  );

  const getFriend = (f) => f.sender._id === user._id ? f.receiver : f.sender;

  const tabs = [
    { key:'friends',  label:`👥 Friends (${friends.length})` },
    { key:'requests', label:`📬 Requests (${incoming.length})`, badge: incoming.length },
    { key:'discover', label:'🔍 Discover' },
  ];

  return (
    <div style={{padding:'2rem',maxWidth:1000,margin:'0 auto'}}>
      <h1 style={{fontWeight:800,fontSize:'1.75rem',marginBottom:'0.5rem'}}>Connections</h1>
      <p style={{color:'#9aa3bf',marginBottom:'2rem',fontSize:'0.875rem'}}>Connect with students and faculty across SIST</p>

      {msg && <div style={{background:msg.includes('✅')?'rgba(74,222,128,0.1)':'rgba(255,87,87,0.1)',border:`1px solid ${msg.includes('✅')?'#4ade8040':'#ff575740'}`,borderRadius:10,padding:'12px',marginBottom:'1rem',color:msg.includes('✅')?'#4ade80':'#ff5757',fontSize:'0.875rem'}}>{msg}</div>}

      {/* Tabs */}
      <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.5rem'}}>
        {tabs.map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)} style={{padding:'8px 20px',borderRadius:8,border:`1px solid ${tab===t.key?'#6c63ff':'#252d47'}`,background:tab===t.key?'rgba(108,99,255,0.15)':'transparent',color:tab===t.key?'#6c63ff':'#9aa3bf',fontWeight:600,cursor:'pointer',position:'relative'}}>
            {t.label}
            {t.badge > 0 && <span style={{marginLeft:'6px',background:'#ff6b9d',color:'#fff',borderRadius:99,padding:'1px 6px',fontSize:'0.65rem',fontWeight:700}}>{t.badge}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:'3rem',color:'#6c63ff'}}>Loading...</div>
      ) : (
        <>
          {/* FRIENDS TAB */}
          {tab === 'friends' && (
            friends.length === 0 ? (
              <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'3rem',textAlign:'center',color:'#5c6580'}}>
                <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>👥</div>
                <div style={{color:'#9aa3bf',marginBottom:'0.5rem'}}>No connections yet</div>
                <button onClick={()=>setTab('discover')} style={{color:'#6c63ff',background:'transparent',border:'none',cursor:'pointer',fontSize:'0.875rem'}}>Discover people to connect with →</button>
              </div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1rem'}}>
                {friends.map(f => {
                  const person = getFriend(f);
                  const color  = roleColor[person.role]||'#6c63ff';
                  return (
                    <div key={f._id} style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'1.25rem',textAlign:'center'}}>
                      <div style={{width:56,height:56,borderRadius:'50%',background:`linear-gradient(135deg,${color}80,${color})`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 0.75rem',color:'#fff',fontWeight:800,fontSize:'1.1rem'}}>{initials(person.name)}</div>
                      <div style={{fontWeight:700,fontSize:'0.95rem',marginBottom:'0.2rem'}}>{person.name}</div>
                      <div style={{color,fontSize:'0.75rem',fontWeight:600,textTransform:'capitalize',marginBottom:'0.25rem'}}>{person.role}</div>
                      <div style={{color:'#9aa3bf',fontSize:'0.8rem',marginBottom:'1rem'}}>{person.department}</div>
                      <div style={{display:'flex',gap:'0.5rem',justifyContent:'center'}}>
                        <button
                          onClick={() => window.location.href = '/messages'}
                          style={{padding:'6px 16px',borderRadius:8,background:'rgba(108,99,255,0.1)',border:'1px solid #6c63ff40',color:'#6c63ff',fontSize:'0.8rem',fontWeight:600,cursor:'pointer'}}
                        >💬 Message</button>
                        <button
                          onClick={() => handleRemove(f._id)}
                          style={{padding:'6px 12px',borderRadius:8,border:'1px solid #252d47',background:'transparent',color:'#9aa3bf',fontSize:'0.8rem',cursor:'pointer'}}
                        >Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* REQUESTS TAB */}
          {tab === 'requests' && (
            <div>
              {incoming.length > 0 && (
                <>
                  <h3 style={{fontWeight:700,marginBottom:'1rem',color:'#9aa3bf',fontSize:'0.85rem',letterSpacing:'0.05em'}}>INCOMING REQUESTS ({incoming.length})</h3>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
                    {incoming.map(f => {
                      const person = f.sender;
                      const color  = roleColor[person.role]||'#6c63ff';
                      return (
                        <div key={f._id} style={{background:'#161c2e',border:'1px solid #6c63ff30',borderRadius:14,padding:'1.25rem',display:'flex',gap:'1rem',alignItems:'center'}}>
                          <div style={{width:48,height:48,borderRadius:'50%',background:`linear-gradient(135deg,${color}80,${color})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,flexShrink:0}}>{initials(person.name)}</div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:'0.9rem'}}>{person.name}</div>
                            <div style={{color,fontSize:'0.75rem',fontWeight:600,textTransform:'capitalize'}}>{person.role}</div>
                            <div style={{color:'#9aa3bf',fontSize:'0.75rem'}}>{person.department}</div>
                          </div>
                          <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
                            <button onClick={()=>handleRespond(f._id,'accepted')} disabled={!!actionLoading} style={{padding:'6px 14px',borderRadius:7,background:'rgba(74,222,128,0.1)',border:'1px solid #4ade8040',color:'#4ade80',fontWeight:700,cursor:'pointer',fontSize:'0.8rem'}}>
                              {actionLoading===f._id+'accepted'?'...':'✓ Accept'}
                            </button>
                            <button onClick={()=>handleRespond(f._id,'rejected')} disabled={!!actionLoading} style={{padding:'6px 14px',borderRadius:7,background:'rgba(255,87,87,0.1)',border:'1px solid #ff575740',color:'#ff5757',fontWeight:700,cursor:'pointer',fontSize:'0.8rem'}}>
                              {actionLoading===f._id+'rejected'?'...':'✗ Reject'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {outgoing.length > 0 && (
                <>
                  <h3 style={{fontWeight:700,marginBottom:'1rem',color:'#9aa3bf',fontSize:'0.85rem',letterSpacing:'0.05em'}}>SENT REQUESTS ({outgoing.length})</h3>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'1rem'}}>
                    {outgoing.map(f => {
                      const person = f.receiver;
                      const color  = roleColor[person.role]||'#6c63ff';
                      return (
                        <div key={f._id} style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'1.25rem',display:'flex',gap:'1rem',alignItems:'center'}}>
                          <div style={{width:48,height:48,borderRadius:'50%',background:`linear-gradient(135deg,${color}80,${color})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,flexShrink:0}}>{initials(person.name)}</div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:'0.9rem'}}>{person.name}</div>
                            <div style={{color,fontSize:'0.75rem',fontWeight:600,textTransform:'capitalize'}}>{person.role}</div>
                            <div style={{color:'#9aa3bf',fontSize:'0.75rem'}}>{person.department}</div>
                          </div>
                          <div>
                            <span style={{padding:'4px 12px',borderRadius:99,background:'rgba(255,179,71,0.1)',border:'1px solid #ffb34740',color:'#ffb347',fontSize:'0.75rem',fontWeight:600}}>⏳ Pending</span>
                            <button onClick={()=>handleRemove(f._id)} style={{display:'block',marginTop:'0.4rem',padding:'4px 12px',borderRadius:7,border:'1px solid #252d47',background:'transparent',color:'#9aa3bf',fontSize:'0.75rem',cursor:'pointer',width:'100%'}}>Cancel</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {incoming.length === 0 && outgoing.length === 0 && (
                <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'3rem',textAlign:'center',color:'#5c6580'}}>
                  <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>📬</div>
                  <div>No pending requests</div>
                </div>
              )}
            </div>
          )}

          {/* DISCOVER TAB */}
          {tab === 'discover' && (
            <div>
              <input
                value={search}
                onChange={e=>setSearch(e.target.value)}
                placeholder="🔍 Search by name, department, role, or skill..."
                style={{width:'100%',padding:'12px 16px',background:'#161c2e',border:'1px solid #252d47',borderRadius:12,color:'#e8eaf0',fontSize:'0.9rem',outline:'none',marginBottom:'1.5rem',boxSizing:'border-box'}}
              />
              {discover.length === 0 ? (
                <div style={{textAlign:'center',padding:'3rem',color:'#5c6580'}}>
                  <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>✅</div>
                  <div>You are connected with everyone!</div>
                </div>
              ) : (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1rem'}}>
                  {discover.map(u => {
                    const color = roleColor[u.role]||'#6c63ff';
                    return (
                      <div key={u._id} style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'1.25rem',textAlign:'center'}}>
                        <div style={{width:56,height:56,borderRadius:'50%',background:`linear-gradient(135deg,${color}80,${color})`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 0.75rem',color:'#fff',fontWeight:800,fontSize:'1.1rem'}}>{initials(u.name)}</div>
                        <div style={{fontWeight:700,fontSize:'0.95rem',marginBottom:'0.2rem'}}>{u.name}</div>
                        <div style={{color,fontSize:'0.75rem',fontWeight:600,textTransform:'capitalize',marginBottom:'0.25rem'}}>{u.role}</div>
                        <div style={{color:'#9aa3bf',fontSize:'0.8rem',marginBottom:'0.5rem'}}>{u.department}</div>
                        {u.role === 'student' && u.year && <div style={{color:'#5c6580',fontSize:'0.75rem',marginBottom:'0.5rem'}}>{u.year}</div>}
                        {u.skills?.length > 0 && (
                          <div style={{display:'flex',gap:'0.3rem',flexWrap:'wrap',justifyContent:'center',marginBottom:'0.75rem'}}>
                            {u.skills.slice(0,3).map(s => <span key={s} style={{padding:'2px 8px',borderRadius:99,background:'rgba(108,99,255,0.1)',border:'1px solid #6c63ff30',color:'#9aa3bf',fontSize:'0.7rem'}}>{s}</span>)}
                          </div>
                        )}
                        <button
                          onClick={() => handleSendRequest(u._id)}
                          disabled={actionLoading===u._id}
                          style={{width:'100%',padding:'8px',borderRadius:8,background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',color:'#fff',fontWeight:700,cursor:'pointer',fontSize:'0.85rem'}}
                        >
                          {actionLoading===u._id ? '...' : '+ Connect'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
