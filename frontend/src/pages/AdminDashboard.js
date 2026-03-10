import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function AdminDashboard() {
  const { API } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [sRes, uRes, pRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/admin/projects`)
      ]);
      setStats(sRes.data); setUsers(uRes.data); setProjects(pRes.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [API]);

  const toggleUser = async (id) => {
    await axios.put(`${API}/admin/users/${id}/toggle`);
    load();
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await axios.delete(`${API}/admin/users/${id}`);
    load();
  };

  if (loading) return <div style={{padding:'3rem',textAlign:'center',color:'#6c63ff'}}>Loading...</div>;

  const statCards = [
    { label:'Total Users', value:stats.totalUsers, icon:'👥', color:'#6c63ff' },
    { label:'Students', value:stats.totalStudents, icon:'🎓', color:'#00d4aa' },
    { label:'Faculty', value:stats.totalStaff, icon:'👨‍🏫', color:'#ff6b9d' },
    { label:'Projects', value:stats.totalProjects, icon:'🗂', color:'#ffb347' },
    { label:'Open Projects', value:stats.openProjects, icon:'✅', color:'#4ade80' },
    { label:'Pending Requests', value:stats.pendingRequests, icon:'📬', color:'#ff5757' },
  ];

  return (
    <div style={{padding:'2rem',maxWidth:1200,margin:'0 auto'}}>
      <h1 style={{fontWeight:800,fontSize:'1.75rem',marginBottom:'2rem'}}>Admin Dashboard</h1>

      <div style={{display:'grid',gridTemplateColumns:'repeat(6, 1fr)',gap:'1rem',marginBottom:'2rem'}}>
        {statCards.map((s, i) => (
          <div key={i} style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'1rem',textAlign:'center'}}>
            <div style={{fontSize:'1.25rem'}}>{s.icon}</div>
            <div style={{fontSize:'1.75rem',fontWeight:800,color:s.color,fontFamily:'Space Mono, monospace'}}>{s.value}</div>
            <div style={{color:'#9aa3bf',fontSize:'0.75rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.5rem'}}>
        {['overview','users','projects'].map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{padding:'8px 20px',borderRadius:8,border:`1px solid ${tab===t?'#6c63ff':'#252d47'}`,background:tab===t?'rgba(108,99,255,0.15)':'transparent',color:tab===t?'#6c63ff':'#9aa3bf',fontWeight:600,cursor:'pointer',textTransform:'capitalize'}}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid #252d47'}}>
                {['Name','Email','Role','Department','Status','Actions'].map(h => (
                  <th key={h} style={{padding:'12px 16px',textAlign:'left',color:'#9aa3bf',fontSize:'0.8rem',fontWeight:600}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{borderBottom:'1px solid #1c2340'}}>
                  <td style={{padding:'12px 16px',fontWeight:600,fontSize:'0.875rem'}}>{u.name}</td>
                  <td style={{padding:'12px 16px',color:'#9aa3bf',fontSize:'0.8rem'}}>{u.email}</td>
                  <td style={{padding:'12px 16px'}}>
                    <span style={{padding:'2px 10px',borderRadius:99,fontSize:'0.75rem',fontWeight:600,background:u.role==='admin'?'rgba(255,107,157,0.15)':u.role==='staff'?'rgba(108,99,255,0.15)':'rgba(0,212,170,0.15)',color:u.role==='admin'?'#ff6b9d':u.role==='staff'?'#6c63ff':'#00d4aa'}}>{u.role}</span>
                  </td>
                  <td style={{padding:'12px 16px',color:'#9aa3bf',fontSize:'0.8rem'}}>{u.department || '-'}</td>
                  <td style={{padding:'12px 16px'}}>
                    <span style={{padding:'2px 10px',borderRadius:99,fontSize:'0.75rem',fontWeight:600,background:u.isActive?'rgba(74,222,128,0.15)':'rgba(255,87,87,0.15)',color:u.isActive?'#4ade80':'#ff5757'}}>{u.isActive?'Active':'Inactive'}</span>
                  </td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex',gap:'0.5rem'}}>
                      <button onClick={()=>toggleUser(u._id)} style={{padding:'4px 12px',borderRadius:6,border:'1px solid #252d47',background:'transparent',color:'#9aa3bf',fontSize:'0.75rem',cursor:'pointer'}}>{u.isActive?'Deactivate':'Activate'}</button>
                      <button onClick={()=>deleteUser(u._id)} style={{padding:'4px 12px',borderRadius:6,border:'1px solid #ff575740',background:'rgba(255,87,87,0.1)',color:'#ff5757',fontSize:'0.75rem',cursor:'pointer'}}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'projects' && (
        <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid #252d47'}}>
                {['Title','Faculty','Department','Status','Students'].map(h => (
                  <th key={h} style={{padding:'12px 16px',textAlign:'left',color:'#9aa3bf',fontSize:'0.8rem',fontWeight:600}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p._id} style={{borderBottom:'1px solid #1c2340'}}>
                  <td style={{padding:'12px 16px',fontWeight:600,fontSize:'0.875rem'}}>{p.title}</td>
                  <td style={{padding:'12px 16px',color:'#9aa3bf',fontSize:'0.8rem'}}>{p.faculty?.name}</td>
                  <td style={{padding:'12px 16px',color:'#9aa3bf',fontSize:'0.8rem'}}>{p.faculty?.department}</td>
                  <td style={{padding:'12px 16px'}}>
                    <span style={{padding:'2px 10px',borderRadius:99,fontSize:'0.75rem',fontWeight:600,background:p.status==='open'?'rgba(0,212,170,0.15)':'rgba(255,87,87,0.15)',color:p.status==='open'?'#00d4aa':'#ff5757'}}>{p.status}</span>
                  </td>
                  <td style={{padding:'12px 16px',fontFamily:'Space Mono',fontSize:'0.875rem',color:'#6c63ff'}}>{p.acceptedStudents?.length || 0}/{p.maxStudents}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'overview' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2rem'}}>
          <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'1.5rem'}}>
            <h3 style={{fontWeight:700,marginBottom:'1rem'}}>Recent Users</h3>
            {users.slice(0,5).map(u => (
              <div key={u._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #1c2340'}}>
                <div>
                  <div style={{fontWeight:600,fontSize:'0.875rem'}}>{u.name}</div>
                  <div style={{color:'#9aa3bf',fontSize:'0.75rem'}}>{u.email}</div>
                </div>
                <span style={{padding:'2px 10px',borderRadius:99,fontSize:'0.75rem',fontWeight:600,background:u.role==='staff'?'rgba(108,99,255,0.15)':'rgba(0,212,170,0.15)',color:u.role==='staff'?'#6c63ff':'#00d4aa'}}>{u.role}</span>
              </div>
            ))}
          </div>
          <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'1.5rem'}}>
            <h3 style={{fontWeight:700,marginBottom:'1rem'}}>Recent Projects</h3>
            {projects.slice(0,5).map(p => (
              <div key={p._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #1c2340'}}>
                <div>
                  <div style={{fontWeight:600,fontSize:'0.875rem'}}>{p.title}</div>
                  <div style={{color:'#9aa3bf',fontSize:'0.75rem'}}>{p.faculty?.name}</div>
                </div>
                <span style={{padding:'2px 10px',borderRadius:99,fontSize:'0.75rem',fontWeight:600,background:p.status==='open'?'rgba(0,212,170,0.15)':'rgba(255,87,87,0.15)',color:p.status==='open'?'#00d4aa':'#ff5757'}}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
