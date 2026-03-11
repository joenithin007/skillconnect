import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

export default function FacultyDashboard() {
  const { user, API } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [projects, setProjects]   = useState([]);
  const [requests, setRequests]   = useState([]);
  const [notifs, setNotifs]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState('');
  const [form, setForm] = useState({title:'',description:'',requiredSkills:'',duration:'',maxStudents:5});

  const bg=dark?'#0a0d14':'#f4f6fb', card=dark?'#161c2e':'#fff', border=dark?'#252d47':'#e2e8f0';
  const tx=dark?'#e8eaf0':'#1a1a2e', mu=dark?'#9aa3bf':'#64748b', sb=dark?'#5c6580':'#94a3b8';
  const h=()=>({headers:{Authorization:`Bearer ${localStorage.getItem('token')}`},timeout:15000});

  const load=async()=>{
    setLoading(true);
    try {
      const [pRes,rRes,nRes]=await Promise.all([
        axios.get(`${API}/projects/my`,h()),
        axios.get(`${API}/requests/my`,h()),
        axios.get(`${API}/notifications`,h()),
      ]);
      setProjects(pRes.data);
      setRequests(rRes.data);
      setNotifs(nRes.data.filter(n=>!n.read).slice(0,4));
    } catch {}
    setLoading(false);
  };
  useEffect(()=>{ load(); },[API]);

  const handleCreate=async()=>{
    if(!form.title.trim()||!form.description.trim()){setMsg('❌ Title and description required');return;}
    setSaving(true);
    try {
      await axios.post(`${API}/projects`,{...form,requiredSkills:form.requiredSkills.split(',').map(x=>x.trim()).filter(Boolean),maxStudents:Number(form.maxStudents)||5},h());
      setShowForm(false); setForm({title:'',description:'',requiredSkills:'',duration:'',maxStudents:5});
      setMsg('✅ Project created!'); setTimeout(()=>setMsg(''),3000); load();
    } catch(e){setMsg('❌ '+(e.response?.data?.message||'Failed'));}
    setSaving(false);
  };

  const handleToggle=async(p)=>{
    try { const ns=p.status==='open'?'closed':'open'; await axios.put(`${API}/projects/${p._id}`,{status:ns},h()); setProjects(prev=>prev.map(x=>x._id===p._id?{...x,status:ns}:x)); } catch{alert('Failed');}
  };

  const handleReq=async(id,status)=>{
    try { await axios.put(`${API}/requests/${id}`,{status},h()); setRequests(prev=>prev.map(r=>r._id===id?{...r,status}:r)); load(); } catch{alert('Failed');}
  };

  const pending =requests.filter(r=>r.status==='pending');
  const accepted=requests.filter(r=>r.status==='accepted');

  if(loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',color:'#6c63ff'}}>Loading...</div>;

  return (
    <div style={{minHeight:'100vh',background:bg,padding:'1.5rem 1rem',fontFamily:'system-ui,sans-serif'}}>
      <div style={{maxWidth:900,margin:'0 auto'}}>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem',flexWrap:'wrap',gap:'0.75rem'}}>
          <div>
            <h1 style={{fontWeight:800,fontSize:'1.35rem',color:tx,marginBottom:'0.15rem'}}>Hi, {user.name.split(' ')[0]} 👋</h1>
            <p style={{color:mu,fontSize:'0.83rem'}}>{user.designation||'Faculty'} · {user.department}</p>
          </div>
          <div style={{display:'flex',gap:'0.5rem'}}>
            <button onClick={()=>navigate('/students')} style={{padding:'8px 15px',background:'transparent',border:`1px solid ${border}`,borderRadius:8,color:mu,cursor:'pointer',fontSize:'0.82rem'}}>🔍 Find Students</button>
            <button onClick={()=>setShowForm(true)} style={{padding:'8px 16px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',borderRadius:8,color:'#fff',fontWeight:700,cursor:'pointer',fontSize:'0.85rem'}}>+ Post Project</button>
          </div>
        </div>

        {msg && <div style={{background:msg.includes('✅')?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',border:`1px solid ${msg.includes('✅')?'#22c55e40':'#ef444440'}`,borderRadius:9,padding:'10px',marginBottom:'1rem',color:msg.includes('✅')?'#22c55e':'#ef4444',fontSize:'0.85rem'}}>{msg}</div>}

        {/* Notifications */}
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
            {l:'My Projects', v:projects.length,                              c:'#6c63ff'},
            {l:'Open',        v:projects.filter(p=>p.status==='open').length, c:'#22c55e'},
            {l:'Pending',     v:pending.length,                               c:'#f59e0b'},
            {l:'Accepted',    v:accepted.length,                              c:'#00d4aa'},
          ].map((s,i)=>(
            <div key={i} style={{background:card,border:`1px solid ${border}`,borderRadius:12,padding:'0.875rem',textAlign:'center'}}>
              <div style={{fontSize:'1.5rem',fontWeight:800,color:s.c,lineHeight:1}}>{s.v}</div>
              <div style={{fontSize:'0.72rem',color:mu,marginTop:'0.25rem'}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Pending applications — most important */}
        {pending.length>0 && (
          <div style={{marginBottom:'1.25rem'}}>
            <div style={{fontWeight:700,fontSize:'0.9rem',color:tx,marginBottom:'0.6rem'}}>
              📬 Pending Applications
              <span style={{background:'#f59e0b',color:'#fff',borderRadius:99,padding:'1px 7px',fontSize:'0.72rem',marginLeft:'7px'}}>{pending.length}</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              {pending.map(r=>(
                <div key={r._id} style={{background:card,border:`1px solid #f59e0b30`,borderRadius:12,padding:'0.875rem',display:'flex',alignItems:'center',gap:'0.75rem',flexWrap:'wrap'}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#00d4aa,#00b894)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'0.72rem',flexShrink:0}}>
                    {r.student?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:'0.875rem',color:tx}}>{r.student?.name}</div>
                    <div style={{fontSize:'0.73rem',color:mu}}>{r.student?.department} · {r.student?.year}</div>
                    <div style={{fontSize:'0.75rem',color:'#6c63ff',marginTop:'1px'}}>for: {r.project?.title}</div>
                  </div>
                  <div style={{display:'flex',gap:'0.4rem'}}>
                    <button onClick={()=>navigate(`/projects/${r.project?._id}`)} style={{padding:'5px 10px',borderRadius:7,background:'transparent',border:`1px solid ${border}`,color:mu,fontSize:'0.75rem',cursor:'pointer'}}>View</button>
                    <button onClick={()=>handleReq(r._id,'accepted')} style={{padding:'5px 13px',borderRadius:7,background:'rgba(34,197,94,0.1)',border:'1px solid #22c55e40',color:'#22c55e',fontWeight:700,fontSize:'0.75rem',cursor:'pointer'}}>✓</button>
                    <button onClick={()=>handleReq(r._id,'rejected')} style={{padding:'5px 13px',borderRadius:7,background:'rgba(239,68,68,0.1)',border:'1px solid #ef444440',color:'#ef4444',fontWeight:700,fontSize:'0.75rem',cursor:'pointer'}}>✗</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Projects */}
        <div>
          <div style={{fontWeight:700,fontSize:'0.9rem',color:tx,marginBottom:'0.6rem'}}>🗂 My Projects</div>
          {projects.length===0 ? (
            <div style={{background:card,border:`1px dashed ${border}`,borderRadius:12,padding:'2.5rem',textAlign:'center'}}>
              <div style={{color:sb,fontSize:'0.875rem',marginBottom:'0.75rem'}}>No projects yet — post your first research project!</div>
              <button onClick={()=>setShowForm(true)} style={{padding:'9px 22px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',borderRadius:9,color:'#fff',fontWeight:700,cursor:'pointer',fontSize:'0.85rem'}}>+ Post Project</button>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'0.7rem'}}>
              {projects.map(p=>{
                const pp=requests.filter(r=>r.project?._id===p._id&&r.status==='pending').length;
                return (
                  <div key={p._id} style={{background:card,border:`1px solid ${pp>0?'#f59e0b40':border}`,borderRadius:12,padding:'1rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
                      <h3 style={{fontWeight:700,fontSize:'0.875rem',color:tx,flex:1,lineHeight:1.3,marginRight:'0.4rem'}}>{p.title}</h3>
                      <span style={{padding:'2px 7px',borderRadius:99,fontSize:'0.62rem',fontWeight:700,background:p.status==='open'?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',color:p.status==='open'?'#22c55e':'#ef4444',flexShrink:0}}>{p.status}</span>
                    </div>
                    {pp>0 && <div style={{fontSize:'0.73rem',color:'#f59e0b',fontWeight:600,marginBottom:'0.5rem'}}>⏳ {pp} new application{pp>1?'s':''}</div>}
                    <div style={{fontSize:'0.72rem',color:mu,marginBottom:'0.6rem'}}>👥 {p.acceptedStudents?.length||0}/{p.maxStudents||5} members</div>
                    <div style={{display:'flex',gap:'0.35rem',flexWrap:'wrap'}}>
                      <button onClick={()=>navigate(`/projects/${p._id}`)} style={{padding:'5px 11px',borderRadius:6,background:'rgba(108,99,255,0.1)',border:'1px solid #6c63ff25',color:'#6c63ff',fontSize:'0.72rem',fontWeight:600,cursor:'pointer'}}>Manage</button>
                      <button onClick={()=>handleToggle(p)} style={{padding:'5px 11px',borderRadius:6,background:'transparent',border:`1px solid ${border}`,color:mu,fontSize:'0.72rem',cursor:'pointer'}}>{p.status==='open'?'Close':'Open'}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem'}}>
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:16,padding:'1.75rem',width:'100%',maxWidth:480,maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
              <h2 style={{fontWeight:800,fontSize:'1.1rem',color:tx}}>+ Post Research Project</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'transparent',border:'none',color:mu,fontSize:'1.4rem',cursor:'pointer'}}>×</button>
            </div>
            {[
              {l:'Title *',k:'title',ph:'e.g. Smart Agriculture using IoT'},
              {l:'Description *',k:'description',ph:'What is this project about? What will students learn?',area:true},
              {l:'Skills Needed',k:'requiredSkills',ph:'Python, Arduino, ML...'},
              {l:'Duration',k:'duration',ph:'e.g. 3 months'},
            ].map(f=>(
              <div key={f.k} style={{marginBottom:'0.875rem'}}>
                <label style={{display:'block',marginBottom:'4px',fontSize:'0.78rem',fontWeight:600,color:mu}}>{f.l}</label>
                {f.area
                  ? <textarea value={form[f.k]} onChange={e=>setForm(x=>({...x,[f.k]:e.target.value}))} placeholder={f.ph} rows={3} style={{width:'100%',padding:'9px 12px',background:bg,border:`1px solid ${border}`,borderRadius:8,color:tx,fontSize:'0.875rem',outline:'none',boxSizing:'border-box',resize:'vertical',fontFamily:'system-ui'}} />
                  : <input   value={form[f.k]} onChange={e=>setForm(x=>({...x,[f.k]:e.target.value}))} placeholder={f.ph}    style={{width:'100%',padding:'9px 12px',background:bg,border:`1px solid ${border}`,borderRadius:8,color:tx,fontSize:'0.875rem',outline:'none',boxSizing:'border-box'}} />
                }
              </div>
            ))}
            <div style={{marginBottom:'1.25rem'}}>
              <label style={{display:'block',marginBottom:'4px',fontSize:'0.78rem',fontWeight:600,color:mu}}>Max Students</label>
              <input type="number" min={1} max={10} value={form.maxStudents} onChange={e=>setForm(x=>({...x,maxStudents:e.target.value}))} style={{width:'100%',padding:'9px 12px',background:bg,border:`1px solid ${border}`,borderRadius:8,color:tx,fontSize:'0.875rem',outline:'none',boxSizing:'border-box'}} />
            </div>
            <div style={{display:'flex',gap:'0.6rem'}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,padding:'10px',background:'transparent',border:`1px solid ${border}`,borderRadius:9,color:mu,cursor:'pointer',fontSize:'0.85rem'}}>Cancel</button>
              <button onClick={handleCreate} disabled={saving} style={{flex:2,padding:'10px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',borderRadius:9,color:'#fff',fontWeight:700,cursor:'pointer',fontSize:'0.85rem',opacity:saving?0.7:1}}>{saving?'Posting...':'Post Project'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
