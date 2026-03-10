import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SkillTag from '../components/SkillTag';

const TYPE_ICON  = { certificate:'📜', project:'💻', internship:'🏢', publication:'📄', award:'🏆', course:'📚', other:'⭐' };
const TYPE_COLOR = { certificate:'#6c63ff', project:'#00d4aa', internship:'#ffb347', publication:'#ff6b9d', award:'#ffd700', course:'#4ade80', other:'#9aa3bf' };

export default function Students() {
  const { API } = useAuth();
  const [students, setStudents]         = useState([]);
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${API}/users/students`, { timeout: 15000 });
        setStudents(data);
      } catch {}
      setLoading(false);
    };
    load();
  }, [API]);

  const openProfile = async (student) => {
    setSelected(student);
    setAchievements([]);
    setLoadingProfile(true);
    try {
      const { data } = await axios.get(`${API}/achievements/user/${student._id}`, { timeout: 15000 });
      setAchievements(data);
    } catch {}
    setLoadingProfile(false);
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase()) ||
    s.skills?.some(sk => sk.toLowerCase().includes(search.toLowerCase()))
  );

  const colors = ['#6c63ff','#ff6b9d','#00d4aa','#ffb347','#4ade80'];

  if (loading) return (
    <div style={{padding:'3rem',textAlign:'center'}}>
      <div style={{fontSize:'2rem',marginBottom:'1rem'}}>⏳</div>
      <div style={{color:'#6c63ff'}}>Loading students...</div>
    </div>
  );

  return (
    <div style={{padding:'2rem',maxWidth:1200,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <h1 style={{fontWeight:800,fontSize:'1.75rem'}}>👥 Students</h1>
        <span style={{color:'#9aa3bf',fontSize:'0.875rem'}}>{filtered.length} students</span>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍  Search by name, department, or skill..."
        style={{width:'100%',padding:'12px 16px',background:'#161c2e',border:'1px solid #252d47',borderRadius:12,color:'#e8eaf0',fontSize:'0.9rem',outline:'none',marginBottom:'2rem',boxSizing:'border-box'}}
      />

      {filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:'3rem',color:'#5c6580'}}>
          <div style={{fontSize:'2rem',marginBottom:'0.75rem'}}>🔍</div>
          <div>No students found for "{search}"</div>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',gap:'1.25rem'}}>
          {filtered.map(s => {
            const initials = s.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
            const color = colors[s.name.charCodeAt(0) % colors.length];
            return (
              <div key={s._id} style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,padding:'1.5rem',textAlign:'center',cursor:'pointer',transition:'border-color 0.2s'}}
                onClick={() => openProfile(s)}
                onMouseEnter={e => e.currentTarget.style.borderColor='#6c63ff'}
                onMouseLeave={e => e.currentTarget.style.borderColor='#252d47'}
              >
                <div style={{width:64,height:64,borderRadius:'50%',background:`linear-gradient(135deg, ${color}80, ${color})`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem',color:'#fff',fontWeight:800,fontSize:'1.2rem'}}>{initials}</div>
                <h3 style={{fontWeight:700,fontSize:'1rem',marginBottom:'0.25rem'}}>{s.name}</h3>
                <div style={{color:'#6c63ff',fontSize:'0.8rem',fontWeight:600,marginBottom:'0.25rem'}}>{s.year}</div>
                <div style={{color:'#9aa3bf',fontSize:'0.8rem',marginBottom:'0.75rem'}}>{s.department}</div>
                {s.gpa && <div style={{fontFamily:'monospace',fontSize:'0.8rem',color:'#00d4aa',marginBottom:'0.75rem'}}>GPA: {s.gpa}</div>}
                <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',justifyContent:'center',marginBottom:'0.75rem'}}>
                  {s.skills?.slice(0,3).map(skill => <SkillTag key={skill} skill={skill} />)}
                  {s.skills?.length > 3 && <span style={{fontSize:'0.7rem',color:'#5c6580',padding:'2px 8px',background:'#0f1320',borderRadius:99}}>+{s.skills.length-3} more</span>}
                </div>
                <div style={{color:'#6c63ff',fontSize:'0.75rem',fontWeight:600}}>View Full Profile →</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Student Profile Modal */}
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem'}} onClick={()=>setSelected(null)}>
          <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,width:'100%',maxWidth:620,maxHeight:'85vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>

            {/* Header */}
            <div style={{padding:'1.5rem',borderBottom:'1px solid #252d47',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
                <div style={{width:60,height:60,borderRadius:'50%',background:`linear-gradient(135deg, ${colors[selected.name.charCodeAt(0)%colors.length]}80, ${colors[selected.name.charCodeAt(0)%colors.length]})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:'1.2rem',flexShrink:0}}>
                  {selected.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
                </div>
                <div>
                  <h2 style={{fontWeight:800,fontSize:'1.2rem',marginBottom:'0.2rem'}}>{selected.name}</h2>
                  <div style={{color:'#6c63ff',fontSize:'0.85rem',fontWeight:600}}>{selected.year}</div>
                  <div style={{color:'#9aa3bf',fontSize:'0.8rem'}}>{selected.department}</div>
                </div>
              </div>
              <button onClick={()=>setSelected(null)} style={{background:'transparent',border:'none',color:'#9aa3bf',fontSize:'1.5rem',cursor:'pointer',lineHeight:1}}>✕</button>
            </div>

            <div style={{padding:'1.5rem'}}>
              {/* Info */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'1.5rem'}}>
                {[
                  {label:'Email', value:selected.email},
                  {label:'GPA', value:selected.gpa, mono:true},
                  {label:'GitHub', value:selected.github, link:true},
                  {label:'Portfolio', value:selected.portfolio, link:true},
                ].filter(i=>i.value).map(item => (
                  <div key={item.label} style={{background:'#0f1320',borderRadius:8,padding:'0.75rem'}}>
                    <div style={{color:'#5c6580',fontSize:'0.7rem',marginBottom:'0.25rem'}}>{item.label}</div>
                    {item.link
                      ? <a href={item.value} target="_blank" rel="noreferrer" style={{color:'#6c63ff',fontSize:'0.8rem',wordBreak:'break-all'}}>{item.value}</a>
                      : <div style={{color:'#e8eaf0',fontSize:'0.875rem',fontFamily:item.mono?'monospace':''}}>{item.value}</div>
                    }
                  </div>
                ))}
              </div>

              {/* Bio */}
              {selected.bio && (
                <div style={{marginBottom:'1.5rem'}}>
                  <div style={{color:'#5c6580',fontSize:'0.75rem',fontWeight:600,marginBottom:'0.5rem',letterSpacing:'0.05em'}}>BIO</div>
                  <p style={{color:'#9aa3bf',fontSize:'0.875rem',lineHeight:1.6}}>{selected.bio}</p>
                </div>
              )}

              {/* Skills */}
              {selected.skills?.length > 0 && (
                <div style={{marginBottom:'1.5rem'}}>
                  <div style={{color:'#5c6580',fontSize:'0.75rem',fontWeight:600,marginBottom:'0.5rem',letterSpacing:'0.05em'}}>SKILLS</div>
                  <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                    {selected.skills.map(sk => <SkillTag key={sk} skill={sk} />)}
                  </div>
                </div>
              )}

              {/* Achievements */}
              <div>
                <div style={{color:'#5c6580',fontSize:'0.75rem',fontWeight:600,marginBottom:'0.75rem',letterSpacing:'0.05em'}}>
                  ACHIEVEMENTS & CERTIFICATIONS
                </div>
                {loadingProfile ? (
                  <div style={{textAlign:'center',padding:'1.5rem',color:'#6c63ff',fontSize:'0.875rem'}}>Loading achievements...</div>
                ) : achievements.length === 0 ? (
                  <div style={{textAlign:'center',padding:'1.5rem',background:'#0f1320',borderRadius:10,color:'#5c6580',fontSize:'0.875rem'}}>No achievements added yet</div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                    {achievements.map(a => {
                      const color = TYPE_COLOR[a.type]||'#9aa3bf';
                      const icon  = TYPE_ICON[a.type] ||'⭐';
                      return (
                        <div key={a._id} style={{background:'#0f1320',borderRadius:10,overflow:'hidden',border:`1px solid ${color}25`}}>
                          {a.imageBase64 && <div style={{height:100,overflow:'hidden'}}><img src={a.imageBase64} alt={a.title} style={{width:'100%',height:'100%',objectFit:'cover'}} /></div>}
                          <div style={{padding:'0.75rem'}}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                              <div>
                                <span style={{padding:'2px 8px',borderRadius:99,fontSize:'0.65rem',fontWeight:700,background:`${color}15`,color,border:`1px solid ${color}30`}}>{icon} {a.type}</span>
                                <div style={{fontWeight:700,fontSize:'0.9rem',marginTop:'0.4rem',color:'#e8eaf0'}}>{a.title}</div>
                                {a.issuer && <div style={{color:'#9aa3bf',fontSize:'0.75rem'}}>{a.issuer}</div>}
                                {a.date   && <div style={{color:'#5c6580',fontSize:'0.7rem'}}>{a.date}</div>}
                              </div>
                              {a.url && <a href={a.url} target="_blank" rel="noreferrer" style={{color:'#6c63ff',fontSize:'0.75rem',fontWeight:600,flexShrink:0,marginLeft:'0.5rem'}}>🔗 View</a>}
                            </div>
                            {a.description && <p style={{color:'#9aa3bf',fontSize:'0.8rem',marginTop:'0.4rem',lineHeight:1.5}}>{a.description}</p>}
                            {a.skills?.length > 0 && <div style={{display:'flex',gap:'0.3rem',flexWrap:'wrap',marginTop:'0.5rem'}}>{a.skills.map(sk=><SkillTag key={sk} skill={sk} />)}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
