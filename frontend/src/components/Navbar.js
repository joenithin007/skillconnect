import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Navbar() {
  const { user, logout, API } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [unreadMsg,   setUnreadMsg]   = useState(0);
  const [friendReqs,  setFriendReqs]  = useState(0);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [nRes, mRes, frRes] = await Promise.all([
          axios.get(`${API}/notifications`, { timeout: 10000 }),
          axios.get(`${API}/messages/unread/count`, { timeout: 10000 }),
          axios.get(`${API}/friends/my`, { timeout: 10000 }),
        ]);
        setUnreadNotif(nRes.data.filter(n => !n.read).length);
        setUnreadMsg(mRes.data.count || 0);
        setFriendReqs(frRes.data.filter(f => f.status === 'pending' && f.receiver._id === user._id).length);
      } catch {}
    };
    fetchBadges();
    const interval = setInterval(fetchBadges, 20000);
    return () => clearInterval(interval);
  }, [API, user._id]);

  const nav = [
    { path:'/dashboard',     label:'Dashboard',    icon:'⊞' },
    { path:'/projects',      label:'Projects',     icon:'🗂' },
    ...(user?.role==='student' ? [{ path:'/achievements', label:'Achievements', icon:'🏆' }] : []),
    ...(user?.role!=='student' ? [{ path:'/students',     label:'Students',     icon:'👥' }] : []),
    { path:'/requests',      label:'Requests',     icon:'📬' },
    { path:'/friends',       label:'Connections',  icon:'🤝', badge: friendReqs },
    { path:'/messages',      label:'Messages',     icon:'💬', badge: unreadMsg },
    { path:'/notifications', label:'Alerts',       icon:'🔔', badge: unreadNotif },
    { path:'/profile',       label:'Profile',      icon:'👤' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <nav style={{display:'flex',alignItems:'center',padding:'0 1rem',height:'56px',background:'#0f1320',borderBottom:'1px solid #252d47',position:'sticky',top:0,zIndex:100,gap:'0.25rem',overflowX:'auto'}}>
      <Link to="/dashboard" style={{display:'flex',alignItems:'center',gap:'8px',textDecoration:'none',flexShrink:0,marginRight:'0.5rem'}}>
        <div style={{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#6c63ff,#00d4aa)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'1rem',flexShrink:0}}>⟡</div>
        <div style={{display:'flex',flexDirection:'column',lineHeight:1}}>
          <span style={{fontWeight:900,fontSize:'0.75rem',color:'#6c63ff',letterSpacing:'0.05em'}}>SIST</span>
          <span style={{fontWeight:700,fontSize:'0.75rem',color:'#e8eaf0'}}>SkillConnect</span>
        </div>
      </Link>

      <div style={{display:'flex',gap:'0.1rem',flex:1,overflowX:'auto'}}>
        {nav.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{display:'flex',alignItems:'center',gap:'4px',padding:'5px 10px',borderRadius:7,color:active?'#6c63ff':'#9aa3bf',background:active?'rgba(108,99,255,0.15)':'transparent',fontSize:'0.78rem',fontWeight:500,textDecoration:'none',position:'relative',whiteSpace:'nowrap',flexShrink:0}}>
              <span style={{fontSize:'0.85rem'}}>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && <span style={{background:'#ff6b9d',color:'#fff',borderRadius:99,padding:'1px 5px',fontSize:'0.6rem',fontWeight:700,minWidth:14,textAlign:'center'}}>{item.badge}</span>}
            </Link>
          );
        })}
      </div>

      <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexShrink:0,marginLeft:'0.5rem'}}>
        <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#ff6b9d,#6c63ff)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'0.7rem',flexShrink:0}}>{initials}</div>
        <div style={{display:'none'}}>
          <div style={{fontWeight:600,fontSize:'0.75rem',color:'#e8eaf0'}}>{user?.name}</div>
          <div style={{fontSize:'0.6rem',color:'#6c63ff',fontWeight:600}}>{user?.role?.toUpperCase()}</div>
        </div>
        <button onClick={handleLogout} style={{padding:'4px 10px',borderRadius:6,border:'1px solid #252d47',background:'transparent',color:'#9aa3bf',fontSize:'0.75rem',cursor:'pointer',whiteSpace:'nowrap'}}>Logout</button>
      </div>
    </nav>
  );
}
