import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

export default function StudentDashboard() {
  const { user, API } = useAuth();
  const { dark } = useTheme();
  const navigate  = useNavigate();
  const [projects, setProjects]   = useState([]);
  const [requests, setRequests]   = useState([]);
  const [notifs, setNotifs]       = useState([]);
  const [loading, setLoading]     = useState(true);

  const bg=dark?'#0a0d14':'#f4f6fb', card=dark?'#161c2e':'#fff', border=dark?'#252d47':'#e2e8f0';
  const tx=dark?'#e8eaf0':'#1a1a2e', mu=dark?'#9aa3bf':'#64748b', sb=dark?'#5c6580':'#94a3b8';
  const h=()=>({headers:{Authorization:`Bearer ${localStorage.getItem('token')}`},timeout:15000});

  useEffect(()=>{
    const load=async()=>{
      try {
        const [pRes,rRes,nRes]=await Promise.all([
          axios.get(`${API}/projects?status=open`,h()),
          axios.get(`${API}/requests/my`,h()),
          axios.get(`${API}/notifications`,h()),
        ]);
        const calcMatch=(skills)=>{
          if(!user.skills?.length||!skills?.length) return 0;
          const s=user.skills.map(x=>x.toLowerCase());
          return Math.round((skills.filter(sk=>s.some(ss=>ss.includes(sk.toLowerCase())||sk.toLowerCase().includes(ss))).length/skills.length)*100);
        };
        setProjects([...pRes.data].map(p=>({...p,match:calcMatch(p.requiredSkills)})).sort((a,b)=>b.match-a.match).slice(0,4));
        setRequests(rRes.data);
        setNotifs(nRes.data.filter(n=>!n.read).slice(0,4));
      } catch {}
      setLoading(false);
    };
    load();
  },[API]);

  const accepted=requests.filter(r=>r.status==='accepted');
  const pending =requests.filter(r=>r.status==='pending');

  if(loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',color:'#6c63ff'}}>Loading...</div>;

  return (
    <div style={{minHeight:'100vh',background:bg,padding:'1.5rem 1rem',fontFamily:'system-ui,sans-serif'}}>
      <div style={{maxWidth:900,margin:'0 auto'}}>

        {/* Greeting */}
        <div style={{marginBottom:'1.25rem'}}>
          <h1 style={{fontWeight:800,fontSize:'1.35rem',color:tx,marginBottom:'0.15rem'}}>Hi, {user.name.split(' ')[0]} 👋</h1>
          <p style={{color:mu,fontSize:'0.83rem'}}>{user.department} · {user.year}</p>
        </div>

        {/* Unread notifications */}
        {notifs.length>0 && (
          <div style={{background:dark?'rgba(108,99,255,0.07)':'#f5f3ff',border:`1px solid ${dark?'#6c63ff25':'#c4b5fd'}`,borderRadius:12,padding:'0.875rem',marginBottom:'1.25rem'}}>
            <div style={{fontWeight:700,fontSize:'0.8rem',color:'#6c63ff',marginBottom:'0.5rem'}}>🔔 New Notifications</div>
            {notifs.map(n=>(
              <div key={n._id} onClick={()=>navigate('/notifications')} style={{fontSize:'0.83rem',color:tx,padding:'0.3rem 0',borderBottom:`1px solid ${dark?'#6c63ff15':'#ede9fe'}`,cursor:'pointer'}}>• {n.message}</div>
            ))}
            <div onClick={()=>navigate('/notifications')} style={{fontSize:'0.78rem',color:'#6c63ff',fontWeight:600,marginTop:'0.5rem',cursor:'pointer'}}>View all →</div>
          </div>
        )}

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.65rem',marginBottom:'1.25rem'}}>
          {[
            {l:'Applied',  v:requests.length, c:'#6c63ff', to:'/requests'},
            {l:'Accepted', v:accepted.length, c:'#22c55e', to:'/requests'},
            {l:'Pending',  v:pending.length,  c:'#f59e0b', to:'/requests'},
            {l:'Achievements', v:0,           c:'#00d4aa', to:'/achievements'},
          ].map((s,i)=>(
            <div key={i} onClick={()=>navigate(s.to)} style={{background:card,border:`1px solid ${border}`,borderRadius:12,padding:'0.875rem 0.75rem',textAlign:'center',cursor:'pointer'}}>
              <div style={{fontSize:'1.5rem',fontWeight:800,color:s.c,lineHeight:1}}>{s.v}</div>
              <div style={{fontSize:'0.72rem',color:mu,marginTop:'0.25rem'}}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:'1rem'}}>

          {/* Project feed preview */}
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.65rem'}}>
              <span style={{fontWeight:700,fontSize:'0.9rem',color:tx}}>🎯 Best Matches For You</span>
              <span onClick={()=>navigate('/projects')} style={{fontSize:'0.78rem',color:'#6c63ff',fontWeight:600,cursor:'pointer'}}>Browse all →</span>
            </div>
            {projects.length===0 ? (
              <div style={{background:card,border:`1px solid ${border}`,borderRadius:12,padding:'2rem',textAlign:'center',color:sb,fontSize:'0.83rem'}}>No open projects yet</div>
            ) : projects.map(p=>{
              const mc=p.match>=70?'#22c55e':p.match>=40?'#f59e0b':'#ef4444';
              return (
                <div key={p._id} onClick={()=>navigate(`/projects/${p._id}`)} style={{background:card,border:`1px solid ${border}`,borderRadius:12,padding:'1rem',marginBottom:'0.6rem',cursor:'pointer'}}>
                  <div style={{fontWeight:700,fontSize:'0.875rem',color:tx,marginBottom:'0.2rem'}}>{p.title}</div>
                  <div style={{fontSize:'0.75rem',color:mu,marginBottom:'0.5rem'}}>{p.faculty?.name||p.postedBy?.name} · {p.faculty?.department||p.postedBy?.department}</div>
                  <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                    <div style={{flex:1,height:4,background:border,borderRadius:99,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${p.match}%`,background:mc,borderRadius:99}} />
                    </div>
                    <span style={{fontSize:'0.7rem',color:mc,fontWeight:700,minWidth:32}}>{p.match}%</span>
                  </div>
                </div>
              );
            })}

            {/* Post idea button */}
            <div onClick={()=>navigate('/projects')} style={{background:dark?'rgba(0,212,170,0.05)':'#f0fdf4',border:`1px dashed ${dark?'#00d4aa30':'#86efac'}`,borderRadius:12,padding:'1rem',textAlign:'center',cursor:'pointer',marginTop:'0.25rem'}}>
              <div style={{fontSize:'1.1rem',marginBottom:'0.2rem'}}>💡</div>
              <div style={{fontSize:'0.82rem',fontWeight:600,color:'#00d4aa'}}>Post Your Own Project Idea</div>
              <div style={{fontSize:'0.75rem',color:mu,marginTop:'0.2rem'}}>Find teammates or get faculty guidance</div>
            </div>
          </div>

          {/* Right column */}
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>

            {/* Accepted projects */}
            <div style={{background:card,border:`1px solid ${border}`,borderRadius:12,padding:'0.875rem'}}>
              <div style={{fontWeight:700,fontSize:'0.83rem',color:tx,marginBottom:'0.6rem'}}>✅ Accepted Projects</div>
              {accepted.length===0 ? (
                <div style={{color:sb,fontSize:'0.78rem',textAlign:'center',padding:'0.75rem 0'}}>None yet</div>
              ) : accepted.map(r=>(
                <div key={r._id} onClick={()=>navigate(`/projects/${r.project?._id}`)} style={{padding:'0.45rem 0',borderBottom:`1px solid ${border}`,cursor:'pointer'}}>
                  <div style={{fontWeight:600,fontSize:'0.8rem',color:tx,lineHeight:1.3}}>{r.project?.title}</div>
                  <div style={{fontSize:'0.7rem',color:'#22c55e'}}>by {r.faculty?.name}</div>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div style={{background:card,border:`1px solid ${border}`,borderRadius:12,padding:'0.875rem'}}>
              <div style={{fontWeight:700,fontSize:'0.83rem',color:tx,marginBottom:'0.6rem'}}>⚡ Quick Actions</div>
              {[
                {e:'🔍',l:'Browse Projects',   to:'/projects'},
                {e:'🏆',l:'My Achievements',   to:'/achievements'},
                {e:'📄',l:'Build Resume',       to:'/resume'},
                {e:'🤝',l:'Connections',        to:'/friends'},
                {e:'🏅',l:'Leaderboard',        to:'/leaderboard'},
                {e:'💬',l:'Messages',           to:'/messages'},
              ].map(a=>(
                <div key={a.to} onClick={()=>navigate(a.to)} style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.4rem 0',borderBottom:`1px solid ${border}`,cursor:'pointer',fontSize:'0.82rem',color:tx}}>
                  <span style={{width:18}}>{a.e}</span><span>{a.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
