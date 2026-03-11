import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

export default function AdminDashboard() {
  const { API } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const bg=dark?'#0a0d14':'#f4f6fb', card=dark?'#161c2e':'#ffffff', border=dark?'#252d47':'#e2e8f0';
  const text=dark?'#e8eaf0':'#1a1a2e', muted=dark?'#9aa3bf':'#64748b';
  const h=()=>({headers:{Authorization:`Bearer ${localStorage.getItem('token')}`},timeout:15000});

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, uRes, nRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, h()),
        axios.get(`${API}/admin/users`, h()),
        axios.get(`${API}/notifications`, h()),
      ]);
      setStats(sRes.data);
      setUsers(uRes.data);
      setNotifs(nRes.data.filter(n=>!n.read).slice(0,3));
    } catch {}
    setLoading(false);
  };

  useEffect(()=>{ load(); },[API]);

  const handleToggle = async (id) => {
    try {
      const res = await axios.put(`${API}/admin/users/${id}/toggle`,{},h());
      setUsers(prev=>prev.map(u=>u._id===id?{...u,isActive:res.data.isActive}:u));
    } catch { alert('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await axios.delete(`${API}/admin/users/${id}`,h()); setUsers(prev=>prev.filter(u=>u._id!==id)); } catch { alert('Failed'); }
  };

  const roleColor={student:'#00d4aa',staff:'#6c63ff',admin:'#ff6b9d'};
  const initials=(name)=>name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'?';

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',color:'#6c63ff'}}>Loading...</div>;

  return (
    <div style={{minHeight:'100vh',background:bg,padding:'1.5rem',fontFamily:'system-ui,sans-serif'}}>
      <div style={{maxWidth:1000,margin:'0 auto'}}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap',gap:'0.75rem'}}>
          <div>
            <h1 style={{fontWeight:800,fontSize:'1.4rem',color:text,marginBottom:'0.2rem'}}>🛡 Admin Panel</h1>
            <p style={{color:muted,fontSize:'0.85rem'}}>SIST SkillConnect Management</p>
          </div>
          <div style={{display:'flex',gap:'0.5rem'}}>
            <button onClick={load} style={{padding:'7px 14px',borderRadius:8,border:`1px solid ${border}`,background:'transparent',color:muted,cursor:'pointer',fontSize:'0.8rem'}}>🔄</button>
            <Link to="/announcements" style={{padding:'8px 16px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',borderRadius:8,color:'#fff',fontWeight:700,textDecoration:'none',fontSize:'0.85rem'}}>📢 Post Notice</Link>
          </div>
        </div>

        {/* Alerts */}
        {notifs.length>0 && (
          <div style={{marginBottom:'1.5rem'}}>
            {notifs.map(n=>(
              <div key={n._id} onClick={()=>navigate('/notifications')} style={{background:dark?'rgba(108,99,255,0.08)':'#f0eeff',border:`1px solid ${dark?'#6c63ff30':'#c4bbff'}`,borderRadius:9,padding:'0.7rem 1rem',marginBottom:'0.4rem',cursor:'pointer',display:'flex',gap:'0.75rem',alignItems:'center'}}>
                <span>🔔</span><span style={{fontSize:'0.85rem',color:text,flex:1}}>{n.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:'0.75rem',marginBottom:'1.5rem'}}>
          {stats && [
            {label:'Total Users',    value:stats.totalUsers||0,       color:'#6c63ff'},
            {label:'Students',       value:stats.students||0,         color:'#00d4aa'},
            {label:'Faculty',        value:stats.faculty||0,          color:'#f59e0b'},
            {label:'Projects',       value:stats.totalProjects||0,    color:'#ff6b9d'},
            {label:'Open Projects',  value:stats.openProjects||0,     color:'#22c55e'},
            {label:'Total Requests', value:stats.totalRequests||0,    color:'#60a5fa'},
          ].map((s,i)=>(
            <div key={i} style={{background:card,border:`1px solid ${border}`,borderRadius:12,padding:'1rem',textAlign:'center'}}>
              <div style={{fontSize:'1.5rem',fontWeight:800,color:s.color,lineHeight:1}}>{s.value}</div>
              <div style={{fontSize:'0.72rem',color:muted,marginTop:'0.3rem'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.25rem'}}>
          {[{k:'overview',l:'Quick Actions'},{k:'users',l:`Users (${users.length})`}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:'7px 16px',borderRadius:8,border:`1px solid ${tab===t.k?'#6c63ff':border}`,background:tab===t.k?'rgba(108,99,255,0.1)':'transparent',color:tab===t.k?'#6c63ff':muted,fontWeight:600,cursor:'pointer',fontSize:'0.82rem'}}>{t.l}</button>
          ))}
        </div>

        {/* Overview */}
        {tab==='overview' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'0.75rem'}}>
            {[
              {icon:'👥',label:'Manage Users',    desc:'Activate or deactivate',  action:()=>setTab('users')},
              {icon:'🗂',label:'All Projects',    desc:'Browse all projects',      action:()=>navigate('/projects')},
              {icon:'📢',label:'Announcements',  desc:'Post college notices',     action:()=>navigate('/announcements')},
              {icon:'🏆',label:'Leaderboard',    desc:'Top students ranking',     action:()=>navigate('/leaderboard')},
              {icon:'🔍',label:'Search',         desc:'Find anyone fast',         action:()=>navigate('/search')},
              {icon:'👨‍🎓',label:'Students',     desc:'View student profiles',    action:()=>navigate('/students')},
            ].map((a,i)=>(
              <div key={i} onClick={a.action} style={{background:card,border:`1px solid ${border}`,borderRadius:12,padding:'1.1rem',cursor:'pointer',transition:'border-color 0.15s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#6c63ff50'}
                onMouseLeave={e=>e.currentTarget.style.borderColor=border}
              >
                <div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>{a.icon}</div>
                <div style={{fontWeight:700,fontSize:'0.875rem',color:text,marginBottom:'0.2rem'}}>{a.label}</div>
                <div style={{fontSize:'0.75rem',color:muted}}>{a.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* Users */}
        {tab==='users' && (
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            {users.map(u=>(
              <div key={u._id} style={{background:card,border:`1px solid ${border}`,borderRadius:11,padding:'0.875rem',display:'flex',alignItems:'center',gap:'0.875rem',flexWrap:'wrap'}}>
                <div style={{width:38,height:38,borderRadius:'50%',background:`linear-gradient(135deg,${roleColor[u.role]||'#6c63ff'}60,${roleColor[u.role]||'#6c63ff'})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'0.78rem',flexShrink:0}}>{initials(u.name)}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:'0.875rem',color:text}}>{u.name}</div>
                  <div style={{fontSize:'0.72rem',color:muted}}>{u.email} · <span style={{color:roleColor[u.role],fontWeight:600,textTransform:'capitalize'}}>{u.role}</span></div>
                </div>
                <div style={{display:'flex',gap:'0.4rem'}}>
                  <button onClick={()=>handleToggle(u._id)} style={{padding:'5px 11px',borderRadius:6,background:u.isActive?'rgba(239,68,68,0.1)':'rgba(34,197,94,0.1)',border:`1px solid ${u.isActive?'#ef444430':'#22c55e30'}`,color:u.isActive?'#ef4444':'#22c55e',fontSize:'0.72rem',fontWeight:600,cursor:'pointer'}}>
                    {u.isActive?'Deactivate':'Activate'}
                  </button>
                  {u.role!=='admin'&&<button onClick={()=>handleDeleteUser(u._id)} style={{padding:'5px 11px',borderRadius:6,background:'transparent',border:`1px solid ${border}`,color:muted,fontSize:'0.72rem',cursor:'pointer'}}>Delete</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  function handleDeleteUser(id) { handleDelete(id); }
}
