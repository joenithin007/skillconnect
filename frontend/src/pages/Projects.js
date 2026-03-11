import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

export default function Projects() {
  const { user, API } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [projects, setProjects]     = useState([]);
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [search, setSearch]         = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm] = useState({ title:'', description:'', requiredSkills:'', duration:'', maxStudents:5 });

  const bg=dark?'#0a0d14':'#f4f6fb', card=dark?'#161c2e':'#ffffff', border=dark?'#252d47':'#e2e8f0';
  const tx=dark?'#e8eaf0':'#1a1a2e', mu=dark?'#9aa3bf':'#64748b', sb=dark?'#5c6580':'#94a3b8';
  const h=()=>({headers:{Authorization:`Bearer ${localStorage.getItem('token')}`},timeout:15000});

  const calcMatch = (skills) => {
    if (!user.skills?.length || !skills?.length) return 0;
    const s = user.skills.map(x=>x.toLowerCase());
    return Math.round((skills.filter(sk=>s.some(ss=>ss.includes(sk.toLowerCase())||sk.toLowerCase().includes(ss))).length/skills.length)*100);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, rRes] = await Promise.all([
        axios.get(`${API}/projects`, h()),
        user.role==='student' ? axios.get(`${API}/requests/my`, h()) : Promise.resolve({data:[]}),
      ]);
      setProjects(pRes.data.map(p=>({...p, match: calcMatch(p.requiredSkills)})));
      setRequests(rRes.data);
    } catch {}
    setLoading(false);
  };

  useEffect(()=>{ load(); },[API]);

  const appliedIds = new Set(requests.map(r=>r.project?._id));

  const filtered = projects.filter(p => {
    if (filter==='staff')   return p.postedByRole==='staff';
    if (filter==='student') return p.postedByRole==='student';
    if (filter==='mine')    return p.postedBy?._id===user._id || p.faculty?._id===user._id;
    return true;
  }).filter(p =>
    !search ||
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.requiredSkills?.some(s=>s.toLowerCase().includes(search.toLowerCase())) ||
    p.faculty?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.postedBy?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handlePost = async () => {
    if (!form.title.trim()||!form.description.trim()) return;
    setSaving(true);
    try {
      await axios.post(`${API}/projects`, {
        ...form,
        requiredSkills: form.requiredSkills.split(',').map(x=>x.trim()).filter(Boolean),
        maxStudents: Number(form.maxStudents)||5,
      }, h());
      setShowPostForm(false);
      setForm({title:'',description:'',requiredSkills:'',duration:'',maxStudents:5});
      load();
    } catch {}
    setSaving(false);
  };

  const timeAgo = (date) => {
    const d = Math.floor((Date.now()-new Date(date))/1000);
    if (d<3600)  return `${Math.floor(d/60)}m ago`;
    if (d<86400) return `${Math.floor(d/3600)}h ago`;
    return `${Math.floor(d/86400)}d ago`;
  };

  const filters = [
    { key:'all',     label:'All Projects' },
    { key:'staff',   label:'🎓 By Faculty' },
    { key:'student', label:'💡 By Students' },
    { key:'mine',    label:'My Posts' },
  ];

  return (
    <div style={{minHeight:'100vh',background:bg,fontFamily:'system-ui,sans-serif'}}>
      {/* Top bar */}
      <div style={{background:card,borderBottom:`1px solid ${border}`,padding:'1rem 1.5rem',position:'sticky',top:0,zIndex:10}}>
        <div style={{maxWidth:900,margin:'0 auto',display:'flex',gap:'0.75rem',alignItems:'center',flexWrap:'wrap'}}>
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="🔍  Search projects, skills, faculty..."
            style={{flex:1,minWidth:200,padding:'9px 14px',background:bg,border:`1px solid ${border}`,borderRadius:9,color:tx,fontSize:'0.875rem',outline:'none'}}
          />
          <button onClick={()=>setShowPostForm(true)} style={{padding:'9px 18px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',borderRadius:9,color:'#fff',fontWeight:700,cursor:'pointer',fontSize:'0.85rem',whiteSpace:'nowrap'}}>
            {user.role==='student'?'💡 Post Idea':'+ Post Project'}
          </button>
        </div>
        {/* Filter tabs */}
        <div style={{maxWidth:900,margin:'0.75rem auto 0',display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
          {filters.map(f=>(
            <button key={f.key} onClick={()=>setFilter(f.key)} style={{padding:'5px 14px',borderRadius:99,border:`1px solid ${filter===f.key?'#6c63ff':border}`,background:filter===f.key?'rgba(108,99,255,0.12)':'transparent',color:filter===f.key?'#6c63ff':mu,fontWeight:filter===f.key?700:500,cursor:'pointer',fontSize:'0.8rem'}}>
              {f.label}
            </button>
          ))}
          <span style={{marginLeft:'auto',fontSize:'0.78rem',color:sb,alignSelf:'center'}}>{filtered.length} projects</span>
        </div>
      </div>

      {/* Feed */}
      <div style={{maxWidth:700,margin:'0 auto',padding:'1.5rem 1rem'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'4rem',color:'#6c63ff'}}>Loading projects...</div>
        ) : filtered.length===0 ? (
          <div style={{textAlign:'center',padding:'4rem',color:sb}}>
            <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>📭</div>
            <div style={{color:mu}}>No projects found</div>
          </div>
        ) : filtered.map(p => {
          const isStaffProject = p.postedByRole==='staff';
          const applied = appliedIds.has(p._id);
          const isMine  = p.postedBy?._id===user._id || p.faculty?._id===user._id;
          const poster  = isStaffProject ? p.faculty : p.postedBy;
          const matchColor = p.match>=70?'#22c55e':p.match>=40?'#f59e0b':'#ef4444';

          return (
            <div key={p._id} onClick={()=>navigate(`/projects/${p._id}`)}
              style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:'1.25rem',marginBottom:'1rem',cursor:'pointer',transition:'box-shadow 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow=dark?'0 4px 24px rgba(108,99,255,0.12)':'0 4px 24px rgba(0,0,0,0.08)'}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='none'}}
            >
              {/* Header */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.75rem'}}>
                <div style={{display:'flex',gap:'0.75rem',alignItems:'flex-start',flex:1}}>
                  {/* Avatar */}
                  <div style={{width:42,height:42,borderRadius:12,background:isStaffProject?'linear-gradient(135deg,#6c63ff,#8b85ff)':'linear-gradient(135deg,#00d4aa,#00b894)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'0.85rem',flexShrink:0}}>
                    {poster?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)||'?'}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:'0.875rem',color:tx}}>{poster?.name}</div>
                    <div style={{fontSize:'0.75rem',color:mu}}>{poster?.department}{poster?.year ? ` · ${poster.year}` : poster?.designation ? ` · ${poster.designation}`:''}</div>
                    <div style={{fontSize:'0.7rem',color:sb,marginTop:'1px'}}>{timeAgo(p.createdAt)}</div>
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'0.3rem'}}>
                  <span style={{padding:'3px 10px',borderRadius:99,fontSize:'0.68rem',fontWeight:700,background:isStaffProject?'rgba(108,99,255,0.12)':'rgba(0,212,170,0.12)',color:isStaffProject?'#6c63ff':'#00d4aa',border:`1px solid ${isStaffProject?'#6c63ff30':'#00d4aa30'}`}}>
                    {isStaffProject?'Faculty Project':'Student Idea'}
                  </span>
                  {p.status==='closed' && <span style={{padding:'2px 8px',borderRadius:99,fontSize:'0.65rem',fontWeight:700,background:'rgba(239,68,68,0.1)',color:'#ef4444',border:'1px solid #ef444430'}}>Closed</span>}
                </div>
              </div>

              {/* Title & Description */}
              <h3 style={{fontWeight:800,fontSize:'1rem',color:tx,marginBottom:'0.4rem',lineHeight:1.3}}>{p.title}</h3>
              <p style={{color:mu,fontSize:'0.83rem',lineHeight:1.6,marginBottom:'0.875rem',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{p.description}</p>

              {/* Skills */}
              {p.requiredSkills?.length>0 && (
                <div style={{display:'flex',gap:'0.35rem',flexWrap:'wrap',marginBottom:'0.875rem'}}>
                  {p.requiredSkills.slice(0,5).map(s=>(
                    <span key={s} style={{padding:'3px 9px',borderRadius:99,background:dark?'rgba(255,255,255,0.05)':'#f1f5f9',border:`1px solid ${border}`,color:mu,fontSize:'0.72rem',fontWeight:500}}>{s}</span>
                  ))}
                  {p.requiredSkills.length>5 && <span style={{padding:'3px 9px',borderRadius:99,background:'transparent',color:sb,fontSize:'0.72rem'}}>+{p.requiredSkills.length-5}</span>}
                </div>
              )}

              {/* Footer */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.5rem'}}>
                <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
                  {p.duration && <span style={{fontSize:'0.75rem',color:mu}}>⏱ {p.duration}</span>}
                  <span style={{fontSize:'0.75rem',color:mu}}>👥 {p.acceptedStudents?.length||0}/{p.maxStudents||5}</span>
                </div>
                <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                  {user.role==='student' && p.match>0 && (
                    <div style={{display:'flex',alignItems:'center',gap:'0.3rem'}}>
                      <div style={{width:50,height:4,background:border,borderRadius:99,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${p.match}%`,background:matchColor,borderRadius:99}} />
                      </div>
                      <span style={{fontSize:'0.7rem',color:matchColor,fontWeight:700}}>{p.match}%</span>
                    </div>
                  )}
                  {applied && <span style={{fontSize:'0.72rem',color:'#22c55e',fontWeight:700}}>✓ Applied</span>}
                  {isMine  && <span style={{fontSize:'0.72rem',color:'#6c63ff',fontWeight:700}}>Your Post</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Post Form Modal */}
      {showPostForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem'}}>
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:16,padding:'1.75rem',width:'100%',maxWidth:500,maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
              <h2 style={{fontWeight:800,fontSize:'1.1rem',color:tx}}>{user.role==='student'?'💡 Post Your Project Idea':'+ Post Research Project'}</h2>
              <button onClick={()=>setShowPostForm(false)} style={{background:'transparent',border:'none',color:mu,fontSize:'1.4rem',cursor:'pointer',lineHeight:1}}>×</button>
            </div>
            {user.role==='student' && <p style={{color:mu,fontSize:'0.82rem',marginBottom:'1rem',background:dark?'rgba(0,212,170,0.07)':'#f0fdf4',border:`1px solid ${dark?'#00d4aa20':'#bbf7d0'}`,borderRadius:8,padding:'0.6rem 0.875rem'}}>💡 Share your project idea — find teammates or get guidance from faculty!</p>}
            {[
              {l:'Title *',k:'title',ph:user.role==='student'?'What is your project idea?':'Research project title'},
              {l:'Description *',k:'description',ph:'Describe the project, goals and what kind of help you need...',area:true},
              {l:'Skills Needed (comma separated)',k:'requiredSkills',ph:'Python, React, Arduino...'},
              {l:'Duration',k:'duration',ph:'e.g. 2 months, 1 semester'},
            ].map(f=>(
              <div key={f.k} style={{marginBottom:'0.875rem'}}>
                <label style={{display:'block',marginBottom:'5px',fontSize:'0.8rem',fontWeight:600,color:mu}}>{f.l}</label>
                {f.area
                  ? <textarea value={form[f.k]} onChange={e=>setForm(x=>({...x,[f.k]:e.target.value}))} placeholder={f.ph} rows={3} style={inp(bg,border,tx)} />
                  : <input   value={form[f.k]} onChange={e=>setForm(x=>({...x,[f.k]:e.target.value}))} placeholder={f.ph}    style={inp(bg,border,tx)} />
                }
              </div>
            ))}
            <div style={{marginBottom:'1.25rem'}}>
              <label style={{display:'block',marginBottom:'5px',fontSize:'0.8rem',fontWeight:600,color:mu}}>Max Teammates</label>
              <input type="number" min={1} max={10} value={form.maxStudents} onChange={e=>setForm(x=>({...x,maxStudents:e.target.value}))} style={inp(bg,border,tx)} />
            </div>
            <div style={{display:'flex',gap:'0.6rem'}}>
              <button onClick={()=>setShowPostForm(false)} style={{flex:1,padding:'10px',background:'transparent',border:`1px solid ${border}`,borderRadius:9,color:mu,cursor:'pointer',fontSize:'0.85rem'}}>Cancel</button>
              <button onClick={handlePost} disabled={saving||!form.title.trim()||!form.description.trim()} style={{flex:2,padding:'10px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',borderRadius:9,color:'#fff',fontWeight:700,cursor:'pointer',fontSize:'0.85rem',opacity:saving?0.7:1}}>
                {saving?'Posting...':'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
const inp=(bg,border,tx)=>({width:'100%',padding:'9px 12px',background:bg,border:`1px solid ${border}`,borderRadius:8,color:tx,fontSize:'0.875rem',outline:'none',boxSizing:'border-box',resize:'vertical',fontFamily:'system-ui,sans-serif'});
