import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SkillTag from '../components/SkillTag';
import MatchScore from '../components/MatchScore';

export default function StudentDashboard() {
  const { user, API } = useAuth();
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, rRes, aRes] = await Promise.all([
          axios.get(`${API}/projects?status=open`, { timeout: 15000 }),
          axios.get(`${API}/requests/my`, { timeout: 15000 }),
          axios.get(`${API}/achievements/my`, { timeout: 15000 }),
        ]);
        setProjects(pRes.data.slice(0, 4));
        setRequests(rRes.data);
        setAchievements(aRes.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, [API]);

  const calcMatch = (skills) => {
    if (!user.skills || !skills || skills.length === 0) return 0;
    const s = user.skills.map(x => x.toLowerCase());
    const r = skills.map(x => x.toLowerCase());
    const matched = r.filter(skill => s.some(ss => ss.includes(skill) || skill.includes(ss)));
    return Math.round((matched.length / r.length) * 100);
  };

  const appliedIds = requests.map(r => r.project?._id);

  const stats = [
    { label: 'Applied Projects', value: requests.length, icon: '📬', color: '#6c63ff' },
    { label: 'Accepted', value: requests.filter(r => r.status === 'accepted').length, icon: '✅', color: '#4ade80' },
    { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, icon: '⏳', color: '#ffb347' },
    { label: 'Achievements', value: achievements.length, icon: '🏆', color: '#00d4aa' },
  ];

  const TYPE_ICON = { certificate:'📜', project:'💻', internship:'🏢', publication:'📄', award:'🏆', course:'📚', other:'⭐' };
  const TYPE_COLOR = { certificate:'#6c63ff', project:'#00d4aa', internship:'#ffb347', publication:'#ff6b9d', award:'#ffd700', course:'#4ade80', other:'#9aa3bf' };

  if (loading) return (
    <div style={{padding:'3rem',textAlign:'center'}}>
      <div style={{fontSize:'2rem',marginBottom:'1rem'}}>⏳</div>
      <div style={{color:'#6c63ff'}}>Loading your dashboard...</div>
    </div>
  );

  return (
    <div style={{padding:'2rem',maxWidth:1200,margin:'0 auto'}}>
      {/* Header */}
      <div style={{marginBottom:'2rem'}}>
        <h1 style={{fontWeight:800,fontSize:'1.75rem',marginBottom:'0.25rem'}}>
          Welcome back, {user.name.split(' ')[0]} 👋
        </h1>
        <p style={{color:'#9aa3bf'}}>{user.department} · {user.year}</p>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'2rem'}}>
        {stats.map((s, i) => (
          <div key={i} style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'1.25rem'}}>
            <div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>{s.icon}</div>
            <div style={{fontSize:'2rem',fontWeight:800,color:s.color,fontFamily:'Space Mono,monospace'}}>{s.value}</div>
            <div style={{color:'#9aa3bf',fontSize:'0.875rem',marginTop:'0.25rem'}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'2rem',marginBottom:'2rem'}}>
        {/* Recommended Projects */}
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
            <h2 style={{fontWeight:700,fontSize:'1.1rem'}}>🗂 Recommended Projects</h2>
            <Link to="/projects" style={{color:'#6c63ff',fontSize:'0.875rem',fontWeight:600}}>View all →</Link>
          </div>
          {projects.length === 0 ? (
            <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'2rem',textAlign:'center',color:'#5c6580'}}>
              <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>📭</div>
              <div>No open projects yet</div>
            </div>
          ) : projects.map(p => (
            <Link key={p._id} to={`/projects/${p._id}`} style={{textDecoration:'none'}}>
              <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'1.25rem',marginBottom:'1rem',cursor:'pointer'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
                  <h3 style={{fontWeight:700,fontSize:'0.95rem',color:'#e8eaf0',flex:1,marginRight:'0.75rem'}}>{p.title}</h3>
                  <span style={{background:appliedIds.includes(p._id)?'rgba(74,222,128,0.15)':'rgba(0,212,170,0.15)',color:appliedIds.includes(p._id)?'#4ade80':'#00d4aa',border:`1px solid ${appliedIds.includes(p._id)?'#4ade8040':'#00d4aa40'}`,borderRadius:99,padding:'2px 10px',fontSize:'0.7rem',fontWeight:600,whiteSpace:'nowrap'}}>
                    {appliedIds.includes(p._id) ? '✓ Applied' : 'Open'}
                  </span>
                </div>
                <div style={{color:'#5c6580',fontSize:'0.8rem',marginBottom:'0.5rem'}}>{p.faculty?.name} · {p.faculty?.department}</div>
                <div style={{marginBottom:'0.5rem'}}>
                  <div style={{fontSize:'0.7rem',color:'#5c6580',marginBottom:'3px'}}>Skill Match</div>
                  <MatchScore score={calcMatch(p.requiredSkills)} />
                </div>
                <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                  {p.requiredSkills?.slice(0, 4).map(s => <SkillTag key={s} skill={s} />)}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* My Applications */}
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
            <h2 style={{fontWeight:700,fontSize:'1.1rem'}}>📬 My Applications</h2>
            <Link to="/requests" style={{color:'#6c63ff',fontSize:'0.875rem',fontWeight:600}}>View all →</Link>
          </div>
          {requests.length === 0 ? (
            <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'2rem',textAlign:'center',color:'#5c6580'}}>
              <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>📭</div>
              <div style={{fontSize:'0.875rem'}}>No applications yet</div>
              <Link to="/projects" style={{color:'#6c63ff',fontSize:'0.8rem',marginTop:'0.5rem',display:'block'}}>Browse Projects →</Link>
            </div>
          ) : requests.slice(0, 5).map(r => (
            <div key={r._id} style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'1rem',marginBottom:'0.75rem'}}>
              <div style={{fontWeight:600,fontSize:'0.875rem',color:'#e8eaf0',marginBottom:'0.25rem'}}>{r.project?.title}</div>
              <div style={{fontSize:'0.75rem',color:'#9aa3bf',marginBottom:'0.5rem'}}>{r.faculty?.name}</div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{padding:'3px 10px',borderRadius:99,fontSize:'0.7rem',fontWeight:600,background:r.status==='accepted'?'#4ade8020':r.status==='rejected'?'#ff575720':'#ffb34720',color:r.status==='accepted'?'#4ade80':r.status==='rejected'?'#ff5757':'#ffb347',border:`1px solid ${r.status==='accepted'?'#4ade8040':r.status==='rejected'?'#ff575740':'#ffb34740'}`}}>{r.status}</span>
                <span style={{color:'#5c6580',fontSize:'0.7rem'}}>{r.skillMatchScore}% match</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Achievements */}
      <div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <h2 style={{fontWeight:700,fontSize:'1.1rem'}}>🏆 My Achievements</h2>
          <Link to="/achievements" style={{color:'#6c63ff',fontSize:'0.875rem',fontWeight:600}}>
            {achievements.length === 0 ? '+ Add Achievement' : 'View all →'}
          </Link>
        </div>
        {achievements.length === 0 ? (
          <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'2rem',textAlign:'center',color:'#5c6580'}}>
            <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>🏆</div>
            <div style={{fontSize:'0.875rem',marginBottom:'0.75rem'}}>No achievements added yet</div>
            <Link to="/achievements" style={{padding:'8px 20px',background:'linear-gradient(135deg, #6c63ff, #8b85ff)',borderRadius:8,color:'#fff',fontSize:'0.8rem',fontWeight:700,textDecoration:'none'}}>+ Add Certificate or Project</Link>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',gap:'1rem'}}>
            {achievements.slice(0, 4).map(a => {
              const color = TYPE_COLOR[a.type] || '#9aa3bf';
              const icon = TYPE_ICON[a.type] || '⭐';
              return (
                <div key={a._id} style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,overflow:'hidden'}}>
                  {a.imageBase64 && <div style={{height:100,overflow:'hidden'}}><img src={a.imageBase64} alt={a.title} style={{width:'100%',height:'100%',objectFit:'cover'}} /></div>}
                  <div style={{padding:'1rem'}}>
                    <span style={{padding:'2px 10px',borderRadius:99,fontSize:'0.7rem',fontWeight:700,background:`${color}15`,color,border:`1px solid ${color}30`}}>{icon} {a.type}</span>
                    <div style={{fontWeight:700,fontSize:'0.9rem',marginTop:'0.5rem',color:'#e8eaf0'}}>{a.title}</div>
                    {a.issuer && <div style={{color:'#9aa3bf',fontSize:'0.75rem'}}>{a.issuer}</div>}
                    {a.date && <div style={{color:'#5c6580',fontSize:'0.7rem'}}>{a.date}</div>}
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

const TYPE_ICON = { certificate:'📜', project:'💻', internship:'🏢', publication:'📄', award:'🏆', course:'📚', other:'⭐' };
const TYPE_COLOR = { certificate:'#6c63ff', project:'#00d4aa', internship:'#ffb347', publication:'#ff6b9d', award:'#ffd700', course:'#4ade80', other:'#9aa3bf' };
