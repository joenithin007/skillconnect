import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SkillTag from '../components/SkillTag';
import MatchScore from '../components/MatchScore';

export default function Projects() {
  const { user, API } = useAuth();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [myRequests, setMyRequests] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, rRes] = await Promise.all([
        axios.get(`${API}/projects`, { timeout: 15000 }),
        user.role === 'student' ? axios.get(`${API}/requests/my`, { timeout: 15000 }) : Promise.resolve({ data: [] })
      ]);
      setProjects(pRes.data);
      setMyRequests(rRes.data);
    } catch (err) {
      setError('Failed to load projects. Please refresh the page.');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [API]);

  const calcMatch = (skills) => {
    if (!user.skills || !skills || skills.length === 0) return 0;
    const s = user.skills.map(x => x.toLowerCase());
    const r = skills.map(x => x.toLowerCase());
    const matched = r.filter(skill => s.some(ss => ss.includes(skill) || skill.includes(ss)));
    return Math.round((matched.length / r.length) * 100);
  };

  const appliedIds = myRequests.map(r => r.project?._id);

  const filtered = projects.filter(p => {
    const matchesFilter = filter === 'all' || p.status === filter;
    const matchesSearch = !search || 
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.requiredSkills?.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
      p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
      p.faculty?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{padding:'2rem',maxWidth:1200,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <h1 style={{fontWeight:800,fontSize:'1.75rem'}}>Research Projects</h1>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <span style={{color:'#9aa3bf',fontSize:'0.875rem'}}>{filtered.length} projects</span>
          <button onClick={load} style={{padding:'6px 14px',borderRadius:8,border:'1px solid #252d47',background:'transparent',color:'#9aa3bf',fontSize:'0.8rem',cursor:'pointer'}}>🔄 Refresh</button>
        </div>
      </div>

      <div style={{display:'flex',gap:'1rem',marginBottom:'2rem',flexWrap:'wrap'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Search projects, skills, faculty..." style={{flex:1,minWidth:280,padding:'10px 16px',background:'#161c2e',border:'1px solid #252d47',borderRadius:10,color:'#e8eaf0',fontSize:'0.9rem',outline:'none'}} />
        <div style={{display:'flex',gap:'0.5rem'}}>
          {['all','open','closed'].map(f => (
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'10px 20px',borderRadius:10,border:`1px solid ${filter===f?'#6c63ff':'#252d47'}`,background:filter===f?'rgba(108,99,255,0.15)':'transparent',color:filter===f?'#6c63ff':'#9aa3bf',fontWeight:600,cursor:'pointer',textTransform:'capitalize'}}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:'4rem'}}>
          <div style={{fontSize:'2rem',marginBottom:'1rem'}}>⏳</div>
          <div style={{color:'#6c63ff',fontSize:'1rem',marginBottom:'0.5rem'}}>Loading projects...</div>
          <div style={{color:'#5c6580',fontSize:'0.875rem'}}>Connecting to database...</div>
        </div>
      ) : error ? (
        <div style={{background:'rgba(255,87,87,0.1)',border:'1px solid #ff575740',borderRadius:14,padding:'2rem',textAlign:'center'}}>
          <div style={{fontSize:'2rem',marginBottom:'0.75rem'}}>⚠️</div>
          <div style={{color:'#ff5757',marginBottom:'1rem'}}>{error}</div>
          <button onClick={load} style={{padding:'10px 24px',background:'linear-gradient(135deg, #6c63ff, #8b85ff)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,cursor:'pointer'}}>Try Again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,padding:'4rem',textAlign:'center',color:'#5c6580'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>📭</div>
          <div style={{fontSize:'1rem',color:'#9aa3bf',marginBottom:'0.5rem'}}>No projects found</div>
          {user.role === 'staff' && <div style={{fontSize:'0.875rem'}}>Create your first project from the Dashboard!</div>}
          {user.role === 'student' && <div style={{fontSize:'0.875rem'}}>Check back later or clear your search filter.</div>}
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(460px, 1fr))',gap:'1.25rem'}}>
          {filtered.map(p => {
            const match = user.role === 'student' ? calcMatch(p.requiredSkills) : null;
            const applied = appliedIds.includes(p._id);
            return (
              <div key={p._id} style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,padding:'1.5rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.75rem'}}>
                  <Link to={`/projects/${p._id}`} style={{fontWeight:700,fontSize:'1rem',color:'#e8eaf0',textDecoration:'none',flex:1,marginRight:'1rem'}}>{p.title}</Link>
                  <span style={{background:p.status==='open'?'rgba(0,212,170,0.15)':'rgba(255,87,87,0.15)',color:p.status==='open'?'#00d4aa':'#ff5757',border:`1px solid ${p.status==='open'?'#00d4aa40':'#ff575740'}`,borderRadius:99,padding:'3px 12px',fontSize:'0.75rem',fontWeight:600,whiteSpace:'nowrap'}}>{p.status}</span>
                </div>

                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'0.75rem'}}>
                  <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg, #6c63ff, #ff6b9d)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'0.7rem',flexShrink:0}}>
                    {p.faculty?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <div style={{fontWeight:600,fontSize:'0.8rem',color:'#e8eaf0'}}>{p.faculty?.name}</div>
                    <div style={{color:'#5c6580',fontSize:'0.75rem'}}>{p.faculty?.department}</div>
                  </div>
                </div>

                <p style={{color:'#9aa3bf',fontSize:'0.85rem',marginBottom:'0.75rem',lineHeight:1.5}}>{p.description?.substring(0,130)}...</p>

                {match !== null && (
                  <div style={{marginBottom:'0.75rem'}}>
                    <div style={{fontSize:'0.75rem',color:'#5c6580',marginBottom:'4px'}}>Your Skill Match</div>
                    <MatchScore score={match} />
                  </div>
                )}

                <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'1rem'}}>
                  {p.requiredSkills?.slice(0,5).map(s=><SkillTag key={s} skill={s} />)}
                </div>

                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'0.75rem',borderTop:'1px solid #252d47'}}>
                  <span style={{color:'#9aa3bf',fontSize:'0.8rem'}}>👥 {p.acceptedStudents?.length || 0}/{p.maxStudents} students</span>
                  <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                    {applied && <span style={{padding:'4px 12px',borderRadius:8,fontSize:'0.75rem',fontWeight:600,background:'rgba(74,222,128,0.1)',border:'1px solid #4ade8040',color:'#4ade80'}}>✓ Applied</span>}
                    <Link to={`/projects/${p._id}`} style={{padding:'6px 16px',borderRadius:8,background:'rgba(108,99,255,0.1)',border:'1px solid #6c63ff40',color:'#6c63ff',fontSize:'0.8rem',fontWeight:600,textDecoration:'none'}}>View →</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
