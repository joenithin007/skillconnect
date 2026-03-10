import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SkillTag from '../components/SkillTag';

export default function FacultyDashboard() {
  const { user, API } = useAuth();
  const [projects, setProjects]   = useState([]);
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState('');
  const [form, setForm] = useState({
    title:'', description:'', requiredSkills:'', tags:'',
    duration:'', stipend:'', prerequisites:'', maxStudents: 5
  });

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, rRes] = await Promise.all([
        axios.get(`${API}/projects/my`, { timeout: 15000 }),
        axios.get(`${API}/requests/my`, { timeout: 15000 }),
      ]);
      setProjects(pRes.data);
      setRequests(rRes.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [API]);

  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) { setMsg('Title and description are required'); return; }
    setSaving(true);
    try {
      await axios.post(`${API}/projects`, {
        ...form,
        requiredSkills: form.requiredSkills.split(',').map(x => x.trim()).filter(Boolean),
        tags: form.tags.split(',').map(x => x.trim()).filter(Boolean),
        maxStudents: Number(form.maxStudents) || 5,
      }, { timeout: 15000 });
      setShowForm(false);
      setForm({ title:'', description:'', requiredSkills:'', tags:'', duration:'', stipend:'', prerequisites:'', maxStudents:5 });
      setMsg('✅ Project created successfully!');
      setTimeout(() => setMsg(''), 3000);
      load();
    } catch (err) { setMsg('❌ ' + (err.response?.data?.message || 'Failed to create')); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try {
      await axios.delete(`${API}/projects/${id}`, { timeout: 15000 });
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch { alert('Failed to delete'); }
  };

  const handleToggleStatus = async (p) => {
    try {
      const newStatus = p.status === 'open' ? 'closed' : 'open';
      await axios.put(`${API}/projects/${p._id}`, { status: newStatus }, { timeout: 15000 });
      setProjects(prev => prev.map(proj => proj._id === p._id ? { ...proj, status: newStatus } : proj));
    } catch { alert('Failed to update status'); }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const stats = [
    { label: 'My Projects',    value: projects.length,                                         icon: '🗂', color: '#6c63ff' },
    { label: 'Open Projects',  value: projects.filter(p => p.status === 'open').length,         icon: '✅', color: '#00d4aa' },
    { label: 'Pending Requests', value: pendingRequests.length,                                 icon: '📬', color: '#ffb347' },
    { label: 'Total Students', value: projects.reduce((a,p) => a + (p.acceptedStudents?.length||0), 0), icon: '🎓', color: '#ff6b9d' },
  ];

  if (loading) return (
    <div style={{padding:'3rem',textAlign:'center'}}>
      <div style={{fontSize:'2rem',marginBottom:'1rem'}}>⏳</div>
      <div style={{color:'#6c63ff'}}>Loading your dashboard...</div>
    </div>
  );

  return (
    <div style={{padding:'2rem',maxWidth:1100,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'2rem',flexWrap:'wrap',gap:'1rem'}}>
        <div>
          <h1 style={{fontWeight:800,fontSize:'1.75rem',marginBottom:'0.25rem'}}>Welcome, {user.name.split(' ')[0]} 👋</h1>
          <p style={{color:'#9aa3bf'}}>{user.designation} · {user.department}</p>
        </div>
        <div style={{display:'flex',gap:'0.75rem'}}>
          <button onClick={load} style={{padding:'10px 16px',borderRadius:10,border:'1px solid #252d47',background:'transparent',color:'#9aa3bf',cursor:'pointer',fontSize:'0.875rem'}}>🔄 Refresh</button>
          <button onClick={() => setShowForm(true)} style={{padding:'10px 20px',background:'linear-gradient(135deg, #6c63ff, #8b85ff)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,cursor:'pointer'}}>+ New Project</button>
        </div>
      </div>

      {msg && <div style={{background:msg.includes('✅')?'rgba(74,222,128,0.1)':'rgba(255,87,87,0.1)',border:`1px solid ${msg.includes('✅')?'#4ade8040':'#ff575740'}`,borderRadius:10,padding:'12px',marginBottom:'1.5rem',color:msg.includes('✅')?'#4ade80':'#ff5757',fontSize:'0.875rem'}}>{msg}</div>}

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'2rem'}}>
        {stats.map((s,i) => (
          <div key={i} style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'1.25rem'}}>
            <div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>{s.icon}</div>
            <div style={{fontSize:'2rem',fontWeight:800,color:s.color,fontFamily:'Space Mono,monospace'}}>{s.value}</div>
            <div style={{color:'#9aa3bf',fontSize:'0.875rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* My Projects */}
      <div style={{marginBottom:'2rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <h2 style={{fontWeight:700,fontSize:'1.1rem'}}>🗂 My Research Projects</h2>
          <Link to="/projects" style={{color:'#6c63ff',fontSize:'0.875rem',fontWeight:600}}>View all →</Link>
        </div>

        {projects.length === 0 ? (
          <div style={{background:'#161c2e',border:'2px dashed #252d47',borderRadius:14,padding:'3rem',textAlign:'center',color:'#5c6580'}}>
            <div style={{fontSize:'3rem',marginBottom:'1rem'}}>📋</div>
            <div style={{fontSize:'1rem',color:'#9aa3bf',marginBottom:'0.5rem'}}>No projects yet</div>
            <div style={{fontSize:'0.875rem',marginBottom:'1.5rem'}}>Create your first research project for students to apply!</div>
            <button onClick={() => setShowForm(true)} style={{padding:'10px 24px',background:'linear-gradient(135deg, #6c63ff, #8b85ff)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,cursor:'pointer'}}>+ Create First Project</button>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(420px,1fr))',gap:'1rem'}}>
            {projects.map(p => (
              <div key={p._id} style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'1.5rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.75rem'}}>
                  <h3 style={{fontWeight:700,fontSize:'0.95rem',color:'#e8eaf0',flex:1,marginRight:'0.75rem'}}>{p.title}</h3>
                  <span style={{padding:'3px 10px',borderRadius:99,fontSize:'0.7rem',fontWeight:600,background:p.status==='open'?'rgba(0,212,170,0.15)':'rgba(255,87,87,0.15)',color:p.status==='open'?'#00d4aa':'#ff5757',border:`1px solid ${p.status==='open'?'#00d4aa40':'#ff575740'}`,whiteSpace:'nowrap'}}>{p.status}</span>
                </div>
                <p style={{color:'#9aa3bf',fontSize:'0.8rem',marginBottom:'0.75rem',lineHeight:1.5}}>{p.description?.substring(0,120)}...</p>
                <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'0.75rem'}}>
                  {p.requiredSkills?.slice(0,4).map(s => <SkillTag key={s} skill={s} />)}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'0.75rem',borderTop:'1px solid #252d47'}}>
                  <span style={{color:'#9aa3bf',fontSize:'0.8rem'}}>👥 {p.acceptedStudents?.length||0}/{p.maxStudents||5} students</span>
                  <div style={{display:'flex',gap:'0.5rem'}}>
                    <button onClick={() => handleToggleStatus(p)} style={{padding:'5px 12px',borderRadius:7,border:'1px solid #252d47',background:'transparent',color:'#9aa3bf',fontSize:'0.75rem',cursor:'pointer'}}>
                      {p.status==='open'?'Close':'Reopen'}
                    </button>
                    <Link to={`/projects/${p._id}`} style={{padding:'5px 12px',borderRadius:7,border:'1px solid #6c63ff40',background:'rgba(108,99,255,0.1)',color:'#6c63ff',fontSize:'0.75rem',textDecoration:'none',fontWeight:600}}>Manage →</Link>
                    <button onClick={() => handleDelete(p._id)} style={{padding:'5px 10px',borderRadius:7,border:'1px solid #ff575740',background:'rgba(255,87,87,0.1)',color:'#ff5757',fontSize:'0.75rem',cursor:'pointer'}}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
            <h2 style={{fontWeight:700,fontSize:'1.1rem'}}>📬 Pending Student Requests ({pendingRequests.length})</h2>
            <Link to="/requests" style={{color:'#6c63ff',fontSize:'0.875rem',fontWeight:600}}>Manage all →</Link>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(320px,1fr))',gap:'1rem'}}>
            {pendingRequests.slice(0,4).map(r => (
              <div key={r._id} style={{background:'#161c2e',border:'1px solid #ffb34740',borderRadius:14,padding:'1.25rem'}}>
                <div style={{fontWeight:700,fontSize:'0.9rem',color:'#e8eaf0',marginBottom:'0.25rem'}}>{r.student?.name}</div>
                <div style={{color:'#9aa3bf',fontSize:'0.8rem',marginBottom:'0.25rem'}}>{r.student?.department} · {r.student?.year}</div>
                <div style={{color:'#6c63ff',fontSize:'0.8rem',marginBottom:'0.75rem'}}>Applied for: {r.project?.title}</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{color:'#ffb347',fontSize:'0.75rem',fontWeight:600}}>⏳ Pending</span>
                  <Link to={`/projects/${r.project?._id}`} style={{padding:'5px 12px',borderRadius:7,background:'rgba(108,99,255,0.1)',border:'1px solid #6c63ff40',color:'#6c63ff',fontSize:'0.75rem',fontWeight:600,textDecoration:'none'}}>Review →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem'}}>
          <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,padding:'2rem',width:'100%',maxWidth:560,maxHeight:'90vh',overflowY:'auto'}}>
            <h2 style={{fontWeight:800,marginBottom:'1.5rem'}}>+ Create New Project</h2>
            {[
              {label:'Project Title *', key:'title', placeholder:'e.g. AI-based Disease Detection System'},
              {label:'Description *', key:'description', multi:true, placeholder:'Describe the project goals, what students will do...'},
              {label:'Required Skills (comma separated)', key:'requiredSkills', placeholder:'Python, TensorFlow, Machine Learning'},
              {label:'Tags (comma separated)', key:'tags', placeholder:'AI, Healthcare, Research'},
              {label:'Duration', key:'duration', placeholder:'e.g. 3 months, 1 semester'},
              {label:'Stipend (optional)', key:'stipend', placeholder:'e.g. ₹5000/month or Unpaid'},
              {label:'Prerequisites', key:'prerequisites', placeholder:'e.g. Knowledge of Python basics'},
            ].map(f => (
              <div key={f.key} style={{marginBottom:'1rem'}}>
                <label style={{display:'block',marginBottom:'6px',fontSize:'0.875rem',fontWeight:600,color:'#9aa3bf'}}>{f.label}</label>
                {f.multi
                  ? <textarea value={form[f.key]} onChange={e=>s(f.key,e.target.value)} placeholder={f.placeholder} rows={3} style={{width:'100%',padding:'10px 14px',background:'#0f1320',border:'1px solid #252d47',borderRadius:8,color:'#e8eaf0',fontSize:'0.9rem',outline:'none',resize:'vertical',boxSizing:'border-box'}} />
                  : <input value={form[f.key]} onChange={e=>s(f.key,e.target.value)} placeholder={f.placeholder} style={{width:'100%',padding:'10px 14px',background:'#0f1320',border:'1px solid #252d47',borderRadius:8,color:'#e8eaf0',fontSize:'0.9rem',outline:'none',boxSizing:'border-box'}} />
                }
              </div>
            ))}
            <div style={{marginBottom:'1.5rem'}}>
              <label style={{display:'block',marginBottom:'6px',fontSize:'0.875rem',fontWeight:600,color:'#9aa3bf'}}>Max Students</label>
              <select value={form.maxStudents} onChange={e=>s('maxStudents',e.target.value)} style={{width:'100%',padding:'10px 14px',background:'#0f1320',border:'1px solid #252d47',borderRadius:8,color:'#e8eaf0',fontSize:'0.9rem',outline:'none'}}>
                {[1,2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} students</option>)}
              </select>
            </div>
            {msg && <div style={{background:'rgba(255,87,87,0.1)',border:'1px solid #ff575740',borderRadius:8,padding:'10px',marginBottom:'1rem',color:'#ff5757',fontSize:'0.875rem'}}>{msg}</div>}
            <div style={{display:'flex',gap:'0.75rem'}}>
              <button onClick={()=>{setShowForm(false);setMsg('');}} style={{flex:1,padding:'12px',background:'transparent',border:'1px solid #252d47',borderRadius:10,color:'#9aa3bf',fontWeight:600,cursor:'pointer'}}>Cancel</button>
              <button onClick={handleCreate} disabled={saving} style={{flex:2,padding:'12px',background:'linear-gradient(135deg, #6c63ff, #8b85ff)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,cursor:'pointer'}}>{saving?'Creating...':'Create Project'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
