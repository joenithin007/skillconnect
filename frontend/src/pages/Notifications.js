import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TYPE_CFG = {
  new_request:      { icon:'📬', color:'#f59e0b', label:'New Application' },
  request_accepted: { icon:'✅', color:'#22c55e', label:'Application Accepted' },
  request_rejected: { icon:'❌', color:'#ef4444', label:'Application Rejected' },
  friend_request:   { icon:'🤝', color:'#6c63ff', label:'Connection Request' },
  message:          { icon:'💬', color:'#00d4aa', label:'New Message' },
  announcement:     { icon:'📢', color:'#f59e0b', label:'Announcement' },
  general:          { icon:'🔔', color:'#9aa3bf', label:'Notification' },
};

export default function Notifications() {
  const { API } = useAuth();
  const { dark } = useTheme();
  const navigate  = useNavigate();
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  const bg=dark?'#0a0d14':'#f4f6fb', card=dark?'#161c2e':'#fff', border=dark?'#252d47':'#e2e8f0';
  const tx=dark?'#e8eaf0':'#1a1a2e', mu=dark?'#9aa3bf':'#64748b', sb=dark?'#5c6580':'#94a3b8';
  const h=()=>({headers:{Authorization:`Bearer ${localStorage.getItem('token')}`},timeout:15000});

  const load=async()=>{ setLoading(true); try{ const {data}=await axios.get(`${API}/notifications`,h()); setNotifs(data); }catch{} setLoading(false); };
  useEffect(()=>{ load(); },[API]);

  const markRead=async(id)=>{ try{ await axios.put(`${API}/notifications/${id}/read`,{},h()); setNotifs(prev=>prev.map(n=>n._id===id?{...n,read:true}:n)); }catch{} };
  const markAll =async()=>  { try{ await axios.put(`${API}/notifications/read-all`,{},h());  setNotifs(prev=>prev.map(n=>({...n,read:true}))); }catch{} };

  const handleClick=(n)=>{
    markRead(n._id);
    if(n.relatedId) navigate(`/projects/${n.relatedId}`);
    else if(n.type==='message') navigate('/messages');
    else if(n.type==='friend_request') navigate('/friends');
    else if(n.type==='announcement') navigate('/announcements');
  };

  const timeAgo=(d)=>{
    const s=Math.floor((Date.now()-new Date(d))/1000);
    if(s<60) return 'just now'; if(s<3600) return `${Math.floor(s/60)}m ago`;
    if(s<86400) return `${Math.floor(s/3600)}h ago`;
    return new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  };

  const unread  = notifs.filter(n=>!n.read);
  const display = filter==='unread' ? unread : notifs;

  return (
    <div style={{minHeight:'100vh',background:bg,padding:'1.5rem 1rem',fontFamily:'system-ui,sans-serif'}}>
      <div style={{maxWidth:650,margin:'0 auto'}}>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
          <div>
            <h1 style={{fontWeight:800,fontSize:'1.35rem',color:tx,marginBottom:'0.15rem'}}>🔔 Notifications</h1>
            <p style={{color:mu,fontSize:'0.83rem'}}>{unread.length>0?`${unread.length} unread`:'All caught up!'}</p>
          </div>
          {unread.length>0 && <button onClick={markAll} style={{padding:'7px 14px',borderRadius:8,border:`1px solid ${border}`,background:'transparent',color:'#6c63ff',fontSize:'0.8rem',fontWeight:600,cursor:'pointer'}}>Mark all read</button>}
        </div>

        {/* Filter */}
        <div style={{display:'flex',gap:'0.4rem',marginBottom:'1.1rem'}}>
          {[{k:'all',l:`All (${notifs.length})`},{k:'unread',l:`Unread (${unread.length})`}].map(f=>(
            <button key={f.k} onClick={()=>setFilter(f.k)} style={{padding:'5px 15px',borderRadius:99,border:`1px solid ${filter===f.k?'#6c63ff':border}`,background:filter===f.k?'rgba(108,99,255,0.1)':'transparent',color:filter===f.k?'#6c63ff':mu,fontWeight:600,cursor:'pointer',fontSize:'0.8rem'}}>{f.l}</button>
          ))}
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:'4rem',color:'#6c63ff'}}>Loading...</div>
        ) : display.length===0 ? (
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:'4rem',textAlign:'center'}}>
            <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>🔔</div>
            <div style={{color:mu,fontSize:'0.9rem'}}>{filter==='unread'?'No unread notifications':'No notifications yet'}</div>
            <div style={{color:sb,fontSize:'0.8rem',marginTop:'0.4rem'}}>You'll be notified when someone accepts your request, messages you, or posts an announcement</div>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'0.45rem'}}>
            {display.map(n=>{
              const cfg=TYPE_CFG[n.type]||TYPE_CFG.general;
              return (
                <div key={n._id} onClick={()=>handleClick(n)} style={{background:n.read?card:dark?'rgba(108,99,255,0.06)':'#faf5ff',border:`1px solid ${n.read?border:'#c4b5fd50'}`,borderRadius:11,padding:'0.875rem',cursor:'pointer',display:'flex',gap:'0.75rem',alignItems:'flex-start'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='#6c63ff40'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=n.read?border:'#c4b5fd50'}
                >
                  <div style={{width:38,height:38,borderRadius:10,background:`${cfg.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',flexShrink:0}}>{cfg.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:n.read?500:700,fontSize:'0.875rem',color:tx,lineHeight:1.4}}>{n.message}</div>
                    <div style={{fontSize:'0.72rem',color:cfg.color,fontWeight:600,marginTop:'0.15rem'}}>{cfg.label}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'0.25rem',flexShrink:0}}>
                    <span style={{fontSize:'0.68rem',color:sb}}>{timeAgo(n.createdAt)}</span>
                    {!n.read && <div style={{width:7,height:7,borderRadius:'50%',background:'#6c63ff'}} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
