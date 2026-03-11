import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

export default function Navbar() {
  const { user, logout, API } = useAuth();
  const { dark, toggle } = useTheme();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [unreadMsg,   setUnreadMsg]   = useState(0);
  const [friendReqs,  setFriendReqs]  = useState(0);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const token = localStorage.getItem('token');
        const h = { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 };
        const [nRes, mRes, frRes] = await Promise.all([
          axios.get(`${API}/notifications`, h),
          axios.get(`${API}/messages/unread/count`, h),
          axios.get(`${API}/friends/my`, h),
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

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Main nav — always visible
  const mainNav = [
    { path:'/dashboard',     label:'Dashboard',   icon:'⊞' },
    { path:'/projects',      label:'Projects',    icon:'🗂' },
    { path:'/announcements', label:'Notices',     icon:'📢' },
    { path:'/search',        label:'Search',      icon:'🔍' },
    { path:'/messages',      label:'Messages',    icon:'💬', badge: unreadMsg },
    { path:'/notifications', label:'Alerts',      icon:'🔔', badge: unreadNotif },
  ];

  // More menu — in dropdown
  const moreNav = [
    { path:'/leaderboard',  label:'Leaderboard',  icon:'🏆' },
    { path:'/friends',      label:'Connections',  icon:'🤝', badge: friendReqs },
    { path:'/requests',     label:'Requests',     icon:'📬' },
    ...(user?.role==='student' ? [
      { path:'/achievements', label:'Achievements', icon:'🎖' },
      { path:'/resume',       label:'Resume Builder', icon:'📄' },
    ] : []),
    ...(user?.role!=='student' ? [{ path:'/students', label:'Students', icon:'👥' }] : []),
    { path:'/profile',      label:'Profile',      icon:'👤' },
  ];

  const totalMoreBadge = friendReqs;
  const isMoreActive = moreNav.some(n => n.path === location.pathname);

  const handleLogout = () => { logout(); navigate('/login'); setMenuOpen(false); };
  const initials = user?.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'U';

  const bg = dark ? '#0f1320' : '#ffffff';
  const border = dark ? '#252d47' : '#e2e8f0';
  const textColor = dark ? '#9aa3bf' : '#64748b';
  const activeColor = '#6c63ff';

  return (
    <nav style={{display:'flex',alignItems:'center',padding:'0 1rem',height:'56px',background:bg,borderBottom:`1px solid ${border}`,position:'sticky',top:0,zIndex:100,gap:'0.25rem'}}>
      
      {/* Logo */}
      <Link to="/dashboard" style={{display:'flex',alignItems:'center',gap:'8px',textDecoration:'none',flexShrink:0,marginRight:'0.75rem'}}>
        <div style={{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#6c63ff,#00d4aa)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'1rem'}}>⟡</div>
        <div style={{display:'flex',flexDirection:'column',lineHeight:1}}>
          <span style={{fontWeight:900,fontSize:'0.75rem',color:'#6c63ff',letterSpacing:'0.05em'}}>SIST</span>
          <span style={{fontWeight:700,fontSize:'0.75rem',color:dark?'#e8eaf0':'#1a1a2e'}}>SkillConnect</span>
        </div>
      </Link>

      {/* Main nav */}
      <div style={{display:'flex',gap:'0.1rem',flex:1}}>
        {mainNav.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{display:'flex',alignItems:'center',gap:'4px',padding:'6px 10px',borderRadius:7,color:active?activeColor:textColor,background:active?'rgba(108,99,255,0.15)':'transparent',fontSize:'0.8rem',fontWeight:active?700:500,textDecoration:'none',whiteSpace:'nowrap',position:'relative'}}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && <span style={{background:'#ff6b9d',color:'#fff',borderRadius:99,padding:'1px 5px',fontSize:'0.6rem',fontWeight:700,minWidth:14,textAlign:'center'}}>{item.badge}</span>}
            </Link>
          );
        })}
      </div>

      {/* Right side */}
      <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexShrink:0}}>
        
        {/* Dark/Light toggle */}
        <button onClick={toggle} title={dark?'Light mode':'Dark mode'} style={{width:32,height:32,borderRadius:8,border:`1px solid ${border}`,background:'transparent',cursor:'pointer',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {dark ? '☀️' : '🌙'}
        </button>

        {/* More menu */}
        <div ref={menuRef} style={{position:'relative'}}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{display:'flex',alignItems:'center',gap:'6px',padding:'6px 12px',borderRadius:8,border:`1px solid ${menuOpen||isMoreActive?activeColor:border}`,background:menuOpen||isMoreActive?'rgba(108,99,255,0.1)':'transparent',color:menuOpen||isMoreActive?activeColor:textColor,cursor:'pointer',fontSize:'0.8rem',fontWeight:600,position:'relative'}}
          >
            <span>{initials}</span>
            <span>More</span>
            {totalMoreBadge > 0 && <span style={{background:'#ff6b9d',color:'#fff',borderRadius:99,padding:'1px 5px',fontSize:'0.6rem',fontWeight:700}}>{totalMoreBadge}</span>}
            <span style={{fontSize:'0.7rem'}}>{menuOpen?'▲':'▼'}</span>
          </button>

          {menuOpen && (
            <div style={{position:'absolute',right:0,top:'calc(100% + 8px)',background:dark?'#161c2e':'#ffffff',border:`1px solid ${border}`,borderRadius:12,padding:'0.5rem',width:210,boxShadow:'0 8px 32px rgba(0,0,0,0.3)',zIndex:200}}>
              {/* User info */}
              <div style={{padding:'0.75rem',borderBottom:`1px solid ${border}`,marginBottom:'0.25rem'}}>
                <div style={{fontWeight:700,fontSize:'0.875rem',color:dark?'#e8eaf0':'#1a1a2e'}}>{user?.name}</div>
                <div style={{fontSize:'0.75rem',color:activeColor,fontWeight:600,textTransform:'capitalize'}}>{user?.role} · {user?.department}</div>
              </div>

              {moreNav.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 12px',borderRadius:8,color:active?activeColor:dark?'#9aa3bf':'#64748b',background:active?'rgba(108,99,255,0.1)':'transparent',textDecoration:'none',fontSize:'0.875rem',fontWeight:active?700:400,marginBottom:'2px'}}
                    onMouseEnter={e=>{ if(!active) e.currentTarget.style.background = dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)'; }}
                    onMouseLeave={e=>{ if(!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{fontSize:'1rem'}}>{item.icon}</span>
                    <span style={{flex:1}}>{item.label}</span>
                    {item.badge > 0 && <span style={{background:'#ff6b9d',color:'#fff',borderRadius:99,padding:'1px 6px',fontSize:'0.65rem',fontWeight:700}}>{item.badge}</span>}
                  </Link>
                );
              })}

              <div style={{borderTop:`1px solid ${border}`,marginTop:'0.25rem',paddingTop:'0.25rem'}}>
                <button
                  onClick={handleLogout}
                  style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 12px',borderRadius:8,color:'#ff5757',background:'transparent',border:'none',width:'100%',cursor:'pointer',fontSize:'0.875rem',fontWeight:600}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,87,87,0.1)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
