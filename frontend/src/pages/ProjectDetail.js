import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SkillTag from '../components/SkillTag';
import MatchScore from '../components/MatchScore';

const TYPE_ICON  = { certificate:'📜', project:'💻', internship:'🏢', publication:'📄', award:'🏆', course:'📚', other:'⭐' };
const TYPE_COLOR = { certificate:'#6c63ff', project:'#00d4aa', internship:'#ffb347', publication:'#ff6b9d', award:'#ffd700', course:'#4ade80', other:'#9aa3bf' };

export default function ProjectDetail() {
  const { id } = useParams();
  const { user, API } = useAuth();
  const navigate = useNavigate();

  const [project, setProject]       = useState(null);
  const [requests, setRequests]     = useState([]);
  const [myRequest, setMyRequest]   = useState(null);
  const [message, setMessage]       = useState('');
  const [loading, setLoading]       = useState(true);
  const [applying, setApplying]     = useState(false);
  const [showApply, setShowApply]   = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg]     = useState('');

  // For viewing student achievements in modal
  const [viewStudent, setViewStudent]           = useState(null);
  const [studentAchievements, setStudentAchievements] = useState([]);
  const [loadingAch, setLoadingAch]             = useState(false);

  const load = async () => {
    try {
      const pRes = await axios.get(`${API}/projects/${id}`, { timeout: 15000 });
      setProject(pRes.data);

      if (user.role === 'staff' || user.role === 'admin') {
        const rRes = await axios.get(`${API}/requests/project/${id}`, { timeout: 15000 });
        setRequests(rRes.data);
      } else {
        const rRes = await axios.get(`${API}/requests/my`, { timeout: 15000 });
        const found = rRes.data.find(r => r.project?._id === id || r.project === id);
        setMyRequest(found || null);
      }
    } catch (err) {
      setErrorMsg('Failed to load project. Please go back and try again.');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id, API, user.role]);

  const calcMatch = (skills) => {
    if (!user.skills || !skills || skills.length === 0) return 0;
    const s = user.skills.map(x => x.toLowerCase());
    const r = skills.map(x => x.toLowerCase());
    const matched = r.filter(skill => s.some(ss => ss.includes(skill) || skill.includes(ss)));
    return Math.round((matched.length / r.length) * 100);
  };

  const handleApply = async () => {
    if (!message.trim()) { setErrorMsg('Please write a message before applying.'); return; }
    setApplying(true);
    setErrorMsg('');
    try {
      await axios.post(`${API}/requests`, { projectId: id, message }, { timeout: 15000 });
      setShowApply(false);
      setSuccessMsg('✅ Application sent successfully! Faculty will review it.');
      setTimeout(() => setSuccessMsg(''), 4000);
      await load();
    } catch (err) {
      setErrorMsg('❌ ' + (err.response?.data?.message || 'Failed to apply. Try again.'));
    }
    setApplying(false);
  };

  const handleRequest = async (reqId, status, facultyNote = '') => {
    setActionLoading(reqId + status);
    setErrorMsg('');
    try {
      await axios.put(`${API}/requests/${reqId}`, { status, facultyNote }, { timeout: 15000 });
      setSuccessMsg(`✅ Student ${status === 'accepted' ? 'accepted' : 'rejected'} successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      // Refresh both requests and project
      const [rRes, pRes] = await Promise.all([
        axios.get(`${API}/requests/project/${id}`, { timeout: 15000 }),
        axios.get(`${API}/projects/${id}`, { timeout: 15000 }),
      ]);
      setRequests(rRes.data);
      setProject(pRes.data);
    } catch (err) {
      setErrorMsg('❌ ' + (err.response?.data?.message || 'Action failed. Try again.'));
    }
    setActionLoading('');
  };

  const openStudentProfile = async (student) => {
    setViewStudent(student);
    setStudentAchievements([]);
    setLoadingAch(true);
    try {
      const { data } = await axios.get(`${API}/achievements/user/${student._id}`, { timeout: 15000 });
      setStudentAchievements(data);
    } catch {}
    setLoadingAch(false);
  };

  if (loading) return (
    <div style={{padding:'3rem',textAlign:'center'}}>
      <div style={{fontSize:'2rem',marginBottom:'1rem'}}>⏳</div>
      <div style={{color:'#6c63ff'}}>Loading project...</div>
    </div>
  );

  if (!project) return (
    <div style={{padding:'3rem',textAlign:'center'}}>
      <div style={{color:'#ff5757',marginBottom:'1rem'}}>{errorMsg || 'Project not found'}</div>
      <button onClick={()=>navigate(-1)} style={{padding:'10px 24px',background:'transparent',border:'1px solid #252d47',borderRadius:10,color:'#9aa3bf',cursor:'pointer'}}>← Go Back</button>
    </div>
  );

  const match = user.role === 'student' ? calcMatch(project.requiredSkills) : null;
  const isFull = project.acceptedStudents?.length >= project.maxStudents;

  return (
    <div style={{padding:'2rem',maxWidth:900,margin:'0 auto'}}>
      <button onClick={()=>navigate(-1)} style={{background:'transparent',border:'none',color:'#9aa3bf',cursor:'pointer',marginBottom:'1.5rem',fontSize:'0.9rem'}}>← Back</button>

      {successMsg && <div style={{background:'rgba(74,222,128,0.1)',border:'1px solid #4ade8040',borderRadius:10,padding:'12px',marginBottom:'1rem',color:'#4ade80',fontSize:'0.875rem'}}>{successMsg}</div>}
      {errorMsg   && <div style={{background:'rgba(255,87,87,0.1)',border:'1px solid #ff575740',borderRadius:10,padding:'12px',marginBottom:'1rem',color:'#ff5757',fontSize:'0.875rem'}}>{errorMsg}</div>}

      {/* Project Info */}
      <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,padding:'2rem',marginBottom:'1.5rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1rem',flexWrap:'wrap',gap:'0.75rem'}}>
          <h1 style={{fontWeight:800,fontSize:'1.5rem',flex:1,marginRight:'1rem'}}>{project.title}</h1>
          <span style={{background:project.status==='open'?'rgba(0,212,170,0.15)':'rgba(255,87,87,0.15)',color:project.status==='open'?'#00d4aa':'#ff5757',border:`1px solid ${project.status==='open'?'#00d4aa40':'#ff575740'}`,borderRadius:99,padding:'4px 14px',fontWeight:600,whiteSpace:'nowrap'}}>
            {project.status} {isFull && '· Full'}
          </span>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'1.25rem'}}>
          <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,#6c63ff,#ff6b9d)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'0.85rem',flexShrink:0}}>
            {project.faculty?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
          </div>
          <div>
            <div style={{fontWeight:700}}>{project.faculty?.name}</div>
            <div style={{color:'#9aa3bf',fontSize:'0.875rem'}}>{project.faculty?.department} · {project.faculty?.designation}</div>
          </div>
        </div>

        <p style={{color:'#9aa3bf',lineHeight:1.7,marginBottom:'1.5rem'}}>{project.description}</p>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
          {[
            {label:'Students', value:`${project.acceptedStudents?.length||0} / ${project.maxStudents}`},
            {label:'Duration', value:project.duration||'Not specified'},
            {label:'Stipend',  value:project.stipend ||'Not specified'},
          ].map(item => (
            <div key={item.label} style={{background:'#0f1320',borderRadius:10,padding:'0.75rem 1rem'}}>
              <div style={{color:'#5c6580',fontSize:'0.75rem',marginBottom:'0.25rem'}}>{item.label}</div>
              <div style={{fontWeight:600,fontSize:'0.9rem',color:'#e8eaf0'}}>{item.value}</div>
            </div>
          ))}
        </div>

        {project.prerequisites && (
          <div style={{background:'rgba(255,179,71,0.08)',border:'1px solid rgba(255,179,71,0.2)',borderRadius:10,padding:'0.75rem 1rem',marginBottom:'1rem'}}>
            <div style={{color:'#ffb347',fontSize:'0.8rem',fontWeight:600,marginBottom:'0.25rem'}}>Prerequisites</div>
            <div style={{fontSize:'0.875rem',color:'#e8eaf0'}}>{project.prerequisites}</div>
          </div>
        )}

        <div style={{marginBottom:'1.25rem'}}>
          <div style={{color:'#5c6580',fontSize:'0.8rem',fontWeight:600,marginBottom:'0.5rem'}}>REQUIRED SKILLS</div>
          <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
            {project.requiredSkills?.map(s => <SkillTag key={s} skill={s} size="lg" />)}
          </div>
        </div>

        {match !== null && (
          <div style={{background:'#0f1320',borderRadius:10,padding:'1rem',marginBottom:'1.25rem'}}>
            <div style={{color:'#9aa3bf',fontSize:'0.8rem',fontWeight:600,marginBottom:'0.5rem'}}>YOUR SKILL MATCH</div>
            <MatchScore score={match} />
          </div>
        )}

        {/* APPLY BUTTON — Students only */}
        {user.role === 'student' && (
          <>
            {myRequest ? (
              <div style={{background:myRequest.status==='accepted'?'rgba(74,222,128,0.1)':myRequest.status==='rejected'?'rgba(255,87,87,0.1)':'rgba(255,179,71,0.1)',border:`1px solid ${myRequest.status==='accepted'?'#4ade8040':myRequest.status==='rejected'?'#ff575740':'#ffb34740'}`,borderRadius:12,padding:'1.25rem'}}>
                <div style={{fontWeight:700,fontSize:'1rem',color:myRequest.status==='accepted'?'#4ade80':myRequest.status==='rejected'?'#ff5757':'#ffb347',marginBottom:'0.25rem'}}>
                  {myRequest.status==='accepted'?'🎉 Application Accepted! You are part of this project.':myRequest.status==='rejected'?'❌ Application Not Accepted':'⏳ Application Pending — Waiting for faculty review'}
                </div>
                {myRequest.facultyNote && <div style={{color:'#9aa3bf',fontSize:'0.875rem',marginTop:'0.25rem'}}>Faculty note: {myRequest.facultyNote}</div>}
              </div>
            ) : project.status !== 'open' ? (
              <div style={{background:'rgba(255,87,87,0.1)',border:'1px solid #ff575740',borderRadius:10,padding:'1rem',color:'#ff5757',fontSize:'0.875rem'}}>
                This project is closed and not accepting applications.
              </div>
            ) : isFull ? (
              <div style={{background:'rgba(255,87,87,0.1)',border:'1px solid #ff575740',borderRadius:10,padding:'1rem',color:'#ff5757',fontSize:'0.875rem'}}>
                This project is full and not accepting more applications.
              </div>
            ) : (
              <button
                onClick={() => { setShowApply(true); setErrorMsg(''); }}
                style={{padding:'13px 32px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',borderRadius:12,color:'#fff',fontWeight:700,cursor:'pointer',fontSize:'1rem',width:'100%'}}
              >
                📬 Apply for this Project
              </button>
            )}
          </>
        )}
      </div>

      {/* ACCEPTED STUDENTS — shown to all */}
      {project.acceptedStudents?.length > 0 && (
        <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,padding:'1.5rem',marginBottom:'1.5rem'}}>
          <h2 style={{fontWeight:700,fontSize:'1rem',marginBottom:'1rem'}}>✅ Team Members ({project.acceptedStudents.length})</h2>
          <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
            {project.acceptedStudents.map(s => (
              <div key={s._id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 14px',background:'rgba(74,222,128,0.08)',border:'1px solid #4ade8030',borderRadius:10}}>
                <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#4ade80,#00d4aa)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'0.7rem',flexShrink:0}}>
                  {s.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div>
                  <div style={{fontWeight:600,fontSize:'0.85rem',color:'#e8eaf0'}}>{s.name}</div>
                  <div style={{fontSize:'0.7rem',color:'#9aa3bf'}}>{s.department}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STUDENT APPLICATIONS — Faculty view */}
      {(user.role === 'staff' || user.role === 'admin') && (
        <div>
          <h2 style={{fontWeight:700,fontSize:'1.1rem',marginBottom:'1rem'}}>
            📬 Applications ({requests.length})
            {requests.filter(r=>r.status==='pending').length > 0 && (
              <span style={{marginLeft:'0.5rem',padding:'2px 10px',borderRadius:99,background:'rgba(255,179,71,0.15)',border:'1px solid #ffb34740',color:'#ffb347',fontSize:'0.75rem'}}>{requests.filter(r=>r.status==='pending').length} pending</span>
            )}
          </h2>

          {requests.length === 0 ? (
            <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'3rem',textAlign:'center',color:'#5c6580'}}>
              <div style={{fontSize:'2rem',marginBottom:'0.75rem'}}>📭</div>
              <div>No applications yet. Share this project with students!</div>
            </div>
          ) : requests.map(r => (
            <div key={r._id} style={{background:'#161c2e',border:`1px solid ${r.status==='accepted'?'#4ade8030':r.status==='rejected'?'#ff575730':'#252d47'}`,borderRadius:14,padding:'1.5rem',marginBottom:'1rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1rem',flexWrap:'wrap',gap:'0.5rem'}}>
                <div>
                  <div style={{fontWeight:700,fontSize:'1rem',marginBottom:'0.25rem'}}>{r.student?.name}</div>
                  <div style={{color:'#9aa3bf',fontSize:'0.8rem'}}>{r.student?.department} · {r.student?.year} · GPA: {r.student?.gpa||'N/A'}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                  <div style={{fontFamily:'monospace',fontWeight:700,fontSize:'1rem',color:r.skillMatchScore>=70?'#4ade80':r.skillMatchScore>=40?'#ffb347':'#ff5757'}}>{r.skillMatchScore}% match</div>
                  <span style={{padding:'4px 12px',borderRadius:99,fontSize:'0.75rem',fontWeight:700,background:r.status==='accepted'?'rgba(74,222,128,0.15)':r.status==='rejected'?'rgba(255,87,87,0.15)':'rgba(255,179,71,0.15)',color:r.status==='accepted'?'#4ade80':r.status==='rejected'?'#ff5757':'#ffb347',border:`1px solid ${r.status==='accepted'?'#4ade8040':r.status==='rejected'?'#ff575740':'#ffb34740'}`}}>{r.status}</span>
                </div>
              </div>

              {/* Student Skills */}
              {r.student?.skills?.length > 0 && (
                <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'0.75rem'}}>
                  {r.student.skills.map(s => <SkillTag key={s} skill={s} />)}
                </div>
              )}

              {/* Application message */}
              <div style={{background:'#0f1320',borderRadius:8,padding:'0.75rem',marginBottom:'0.75rem',color:'#9aa3bf',fontSize:'0.875rem',fontStyle:'italic',lineHeight:1.6}}>
                "{r.message}"
              </div>

              {/* Action buttons */}
              <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',alignItems:'center'}}>
                <button
                  onClick={() => openStudentProfile(r.student)}
                  style={{padding:'7px 14px',borderRadius:8,border:'1px solid #252d47',background:'transparent',color:'#9aa3bf',fontSize:'0.8rem',cursor:'pointer'}}
                >
                  👤 View Full Profile
                </button>
                {r.student?.github && (
                  <a href={r.student.github} target="_blank" rel="noreferrer" style={{padding:'7px 14px',borderRadius:8,border:'1px solid #252d47',color:'#9aa3bf',fontSize:'0.8rem',textDecoration:'none'}}>
                    GitHub
                  </a>
                )}
                {r.student?.portfolio && (
                  <a href={r.student.portfolio} target="_blank" rel="noreferrer" style={{padding:'7px 14px',borderRadius:8,border:'1px solid #252d47',color:'#9aa3bf',fontSize:'0.8rem',textDecoration:'none'}}>
                    Portfolio
                  </a>
                )}
                {r.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleRequest(r._id, 'accepted')}
                      disabled={!!actionLoading || isFull}
                      style={{padding:'7px 20px',borderRadius:8,background:isFull?'#252d47':'rgba(74,222,128,0.1)',border:`1px solid ${isFull?'#252d47':'#4ade8040'}`,color:isFull?'#5c6580':'#4ade80',fontWeight:700,cursor:isFull?'not-allowed':'pointer',fontSize:'0.875rem'}}
                    >
                      {actionLoading===r._id+'accepted' ? '...' : isFull ? 'Project Full' : '✓ Accept'}
                    </button>
                    <button
                      onClick={() => handleRequest(r._id, 'rejected')}
                      disabled={!!actionLoading}
                      style={{padding:'7px 20px',borderRadius:8,background:'rgba(255,87,87,0.1)',border:'1px solid #ff575740',color:'#ff5757',fontWeight:700,cursor:'pointer',fontSize:'0.875rem'}}
                    >
                      {actionLoading===r._id+'rejected' ? '...' : '✗ Reject'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {showApply && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem'}}>
          <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,padding:'2rem',width:'100%',maxWidth:500}}>
            <h2 style={{fontWeight:800,marginBottom:'0.5rem'}}>Apply for Project</h2>
            <p style={{color:'#9aa3bf',fontSize:'0.875rem',marginBottom:'1.5rem'}}>{project.title}</p>

            {errorMsg && <div style={{background:'rgba(255,87,87,0.1)',border:'1px solid #ff575740',borderRadius:8,padding:'10px',marginBottom:'1rem',color:'#ff5757',fontSize:'0.875rem'}}>{errorMsg}</div>}

            <div style={{marginBottom:'1.5rem'}}>
              <label style={{display:'block',marginBottom:'6px',fontSize:'0.875rem',fontWeight:600,color:'#9aa3bf'}}>Your Message to Faculty *</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tell the professor why you're interested in this project, your relevant experience, and what you hope to contribute..."
                rows={5}
                style={{width:'100%',padding:'12px',background:'#0f1320',border:'1px solid #252d47',borderRadius:10,color:'#e8eaf0',fontSize:'0.9rem',outline:'none',resize:'vertical',boxSizing:'border-box'}}
              />
              <div style={{color:'#5c6580',fontSize:'0.75rem',marginTop:'4px'}}>{message.length} characters</div>
            </div>

            <div style={{display:'flex',gap:'0.75rem'}}>
              <button onClick={()=>{setShowApply(false);setErrorMsg('');}} style={{flex:1,padding:'12px',background:'transparent',border:'1px solid #252d47',borderRadius:10,color:'#9aa3bf',fontWeight:600,cursor:'pointer'}}>Cancel</button>
              <button onClick={handleApply} disabled={applying} style={{flex:2,padding:'12px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,cursor:'pointer',fontSize:'0.95rem'}}>
                {applying ? '⏳ Sending...' : '📬 Send Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Modal (for faculty) */}
      {viewStudent && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1001,padding:'1rem'}} onClick={()=>setViewStudent(null)}>
          <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,width:'100%',maxWidth:580,maxHeight:'85vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'1.5rem',borderBottom:'1px solid #252d47',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <h2 style={{fontWeight:800,fontSize:'1.2rem',marginBottom:'0.2rem'}}>{viewStudent.name}</h2>
                <div style={{color:'#9aa3bf',fontSize:'0.85rem'}}>{viewStudent.department} · {viewStudent.year} · GPA: {viewStudent.gpa||'N/A'}</div>
              </div>
              <button onClick={()=>setViewStudent(null)} style={{background:'transparent',border:'none',color:'#9aa3bf',fontSize:'1.5rem',cursor:'pointer'}}>✕</button>
            </div>
            <div style={{padding:'1.5rem'}}>
              {viewStudent.bio && <p style={{color:'#9aa3bf',fontSize:'0.875rem',marginBottom:'1.25rem',lineHeight:1.6}}>{viewStudent.bio}</p>}
              {viewStudent.skills?.length > 0 && (
                <div style={{marginBottom:'1.25rem'}}>
                  <div style={{color:'#5c6580',fontSize:'0.75rem',fontWeight:600,marginBottom:'0.5rem'}}>SKILLS</div>
                  <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                    {viewStudent.skills.map(sk => <SkillTag key={sk} skill={sk} />)}
                  </div>
                </div>
              )}
              <div style={{color:'#5c6580',fontSize:'0.75rem',fontWeight:600,marginBottom:'0.75rem'}}>ACHIEVEMENTS</div>
              {loadingAch ? (
                <div style={{textAlign:'center',padding:'1.5rem',color:'#6c63ff',fontSize:'0.875rem'}}>Loading achievements...</div>
              ) : studentAchievements.length === 0 ? (
                <div style={{textAlign:'center',padding:'1.5rem',background:'#0f1320',borderRadius:10,color:'#5c6580',fontSize:'0.875rem'}}>No achievements added yet</div>
              ) : studentAchievements.map(a => {
                const color = TYPE_COLOR[a.type]||'#9aa3bf';
                const icon  = TYPE_ICON[a.type] ||'⭐';
                return (
                  <div key={a._id} style={{background:'#0f1320',borderRadius:10,padding:'0.75rem',marginBottom:'0.75rem',border:`1px solid ${color}20`}}>
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
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
