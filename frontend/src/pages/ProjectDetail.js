import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user, API } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [project, setProject]   = useState(null);
  const [questions, setQuestions] = useState([]);
  const [myRequest, setMyRequest] = useState(null);
  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('overview');
  const [qText, setQText]         = useState('');
  const [answerMap, setAnswerMap] = useState({});
  const [applying, setApplying]   = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApply, setShowApply] = useState(false);
  const [msg, setMsg]             = useState('');
  const [inviteSearch, setInviteSearch] = useState('');

  const bg=dark?'#0a0d14':'#f4f6fb', card=dark?'#161c2e':'#ffffff', border=dark?'#252d47':'#e2e8f0';
  const tx=dark?'#e8eaf0':'#1a1a2e', mu=dark?'#9aa3bf':'#64748b', sb=dark?'#5c6580':'#94a3b8';
  const h=()=>({headers:{Authorization:`Bearer ${localStorage.getItem('token')}`},timeout:15000});

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, qRes] = await Promise.all([
        axios.get(`${API}/projects/${id}`, h()),
        axios.get(`${API}/questions/project/${id}`, h()),
      ]);
      setProject(pRes.data);
      setQuestions(qRes.data);
      if (user.role==='student') {
        const rRes = await axios.get(`${API}/requests/my`, h());
        setMyRequest(rRes.data.find(r=>r.project?._id===id)||null);
      }
    } catch {}
    setLoading(false);
  };

  const loadStudents = async () => {
    try {
      const res = await axios.get(`${API}/admin/users`, h());
      setStudents(res.data.filter(u=>u.role==='student'));
    } catch {}
  };

  useEffect(()=>{ load(); if(user.role==='staff'||user.role==='admin') loadStudents(); },[id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await axios.post(`${API}/requests`,{projectId:id,message:coverLetter},h());
      setMsg('✅ Application sent!');
      setShowApply(false);
      load();
    } catch(err){ setMsg('❌ '+(err.response?.data?.message||'Failed')); }
    setApplying(false);
    setTimeout(()=>setMsg(''),3000);
  };

  const handleAcceptReject = async (reqId, status) => {
    try {
      await axios.put(`${API}/requests/${reqId}`,{status},h());
      load();
    } catch { alert('Failed'); }
  };

  const handleAskQuestion = async () => {
    if (!qText.trim()) return;
    try {
      const res = await axios.post(`${API}/questions`,{projectId:id,question:qText},h());
      setQuestions(prev=>[res.data,...prev]);
      setQText('');
    } catch {}
  };

  const handleAnswer = async (qId) => {
    const a = answerMap[qId];
    if (!a?.trim()) return;
    try {
      const res = await axios.post(`${API}/questions/${qId}/answer`,{answer:a},h());
      setQuestions(prev=>prev.map(q=>q._id===qId?res.data:q));
      setAnswerMap(m=>({...m,[qId]:''}));
    } catch {}
  };

  const handleInvite = async (studentId) => {
    try {
      await axios.post(`${API}/projects/${id}/invite`,{studentId},h());
      setMsg('✅ Invitation sent!');
      setTimeout(()=>setMsg(''),2500);
    } catch { alert('Failed'); }
  };

  const handleToggleStatus = async () => {
    const ns = project.status==='open'?'closed':'open';
    try {
      await axios.put(`${API}/projects/${id}`,{status:ns},h());
      setProject(p=>({...p,status:ns}));
    } catch { alert('Failed'); }
  };

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',color:'#6c63ff'}}>Loading...</div>;
  if (!project) return <div style={{textAlign:'center',padding:'4rem',color:mu}}>Project not found</div>;

  const isOwner  = project.faculty?._id===user._id || project.postedBy?._id===user._id;
  const poster   = project.postedByRole==='staff' ? project.faculty : project.postedBy;
  const pendingReqs  = project.acceptedStudents ? [] : [];
  const calcMatch = (skills) => {
    if (!user.skills?.length||!skills?.length) return 0;
    const s=user.skills.map(x=>x.toLowerCase());
    return Math.round((skills.filter(sk=>s.some(ss=>ss.includes(sk.toLowerCase())||sk.toLowerCase().includes(ss))).length/skills.length)*100);
  };
  const match = calcMatch(project.requiredSkills);

  const filteredStudents = students.filter(s=>{
    if (!inviteSearch) return true;
    return s.name.toLowerCase().includes(inviteSearch.toLowerCase())||s.skills?.some(sk=>sk.toLowerCase().includes(inviteSearch.toLowerCase()));
  });

  const tabs = [
    {k:'overview',l:'Overview'},
    {k:'questions',l:`Q&A (${questions.length})`},
    ...(isOwner||user.role==='admin' ? [{k:'applications',l:'Applications'}] : []),
    ...(isOwner&&(user.role==='staff'||user.role==='admin') ? [{k:'invite',l:'Invite Students'}] : []),
  ];

  return (
    <div style={{minHeight:'100vh',background:bg,fontFamily:'system-ui,sans-serif'}}>
      <div style={{maxWidth:800,margin:'0 auto',padding:'1.5rem 1rem'}}>

        {/* Back */}
        <button onClick={()=>navigate('/projects')} style={{background:'transparent',border:'none',color:mu,cursor:'pointer',fontSize:'0.85rem',marginBottom:'1rem',padding:'4px 0',display:'flex',alignItems:'center',gap:'0.3rem'}}>← Back to Projects</button>

        {msg && <div style={{background:msg.includes('✅')?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',border:`1px solid ${msg.includes('✅')?'#22c55e40':'#ef444440'}`,borderRadius:9,padding:'10px 14px',marginBottom:'1rem',color:msg.includes('✅')?'#22c55e':'#ef4444',fontSize:'0.85rem'}}>{msg}</div>}

        {/* Hero card */}
        <div style={{background:card,border:`1px solid ${border}`,borderRadius:16,padding:'1.5rem',marginBottom:'1rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1rem',flexWrap:'wrap',gap:'0.75rem'}}>
            <div style={{display:'flex',gap:'0.875rem',alignItems:'flex-start',flex:1}}>
              <div style={{width:48,height:48,borderRadius:13,background:project.postedByRole==='staff'?'linear-gradient(135deg,#6c63ff,#8b85ff)':'linear-gradient(135deg,#00d4aa,#00b894)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,flexShrink:0}}>
                {poster?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)||'?'}
              </div>
              <div>
                <div style={{fontWeight:700,color:tx}}>{poster?.name}</div>
                <div style={{fontSize:'0.78rem',color:mu}}>{poster?.department}{poster?.designation?` · ${poster.designation}`:poster?.year?` · ${poster.year}`:''}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
              <span style={{padding:'4px 12px',borderRadius:99,fontSize:'0.72rem',fontWeight:700,background:project.status==='open'?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',color:project.status==='open'?'#22c55e':'#ef4444',border:`1px solid ${project.status==='open'?'#22c55e40':'#ef444440'}`}}>{project.status==='open'?'Open':'Closed'}</span>
              {isOwner && <button onClick={handleToggleStatus} style={{padding:'4px 12px',borderRadius:99,background:'transparent',border:`1px solid ${border}`,color:mu,fontSize:'0.72rem',cursor:'pointer'}}>{project.status==='open'?'Close it':'Reopen'}</button>}
            </div>
          </div>

          <h1 style={{fontWeight:800,fontSize:'1.3rem',color:tx,marginBottom:'0.75rem',lineHeight:1.3}}>{project.title}</h1>
          <p style={{color:mu,fontSize:'0.875rem',lineHeight:1.7,marginBottom:'1rem'}}>{project.description}</p>

          {/* Meta info */}
          <div style={{display:'flex',gap:'1.25rem',flexWrap:'wrap',marginBottom:'1rem',fontSize:'0.82rem',color:mu}}>
            {project.duration   && <span>⏱ {project.duration}</span>}
            {project.stipend    && <span>💰 {project.stipend}</span>}
            <span>👥 {project.acceptedStudents?.length||0} / {project.maxStudents||5} members</span>
          </div>

          {/* Skills */}
          {project.requiredSkills?.length>0 && (
            <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'1rem'}}>
              {project.requiredSkills.map(s=>(
                <span key={s} style={{padding:'4px 11px',borderRadius:99,background:dark?'rgba(108,99,255,0.1)':'#ede9fe',border:`1px solid ${dark?'#6c63ff30':'#c4b5fd'}`,color:dark?'#a78bfa':'#7c3aed',fontSize:'0.78rem',fontWeight:500}}>{s}</span>
              ))}
            </div>
          )}

          {/* Match + Apply */}
          {user.role==='student' && project.status==='open' && (
            <div style={{display:'flex',alignItems:'center',gap:'1rem',paddingTop:'1rem',borderTop:`1px solid ${border}`,flexWrap:'wrap'}}>
              {match>0 && (
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  <span style={{fontSize:'0.8rem',color:mu}}>Your match:</span>
                  <div style={{width:80,height:6,background:border,borderRadius:99,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${match}%`,background:match>=70?'#22c55e':match>=40?'#f59e0b':'#ef4444',borderRadius:99}} />
                  </div>
                  <span style={{fontWeight:700,fontSize:'0.82rem',color:match>=70?'#22c55e':match>=40?'#f59e0b':'#ef4444'}}>{match}%</span>
                </div>
              )}
              {!myRequest ? (
                <button onClick={()=>setShowApply(true)} style={{padding:'9px 22px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',borderRadius:9,color:'#fff',fontWeight:700,cursor:'pointer',fontSize:'0.875rem'}}>Apply to Join</button>
              ) : (
                <span style={{padding:'8px 16px',borderRadius:9,background:myRequest.status==='accepted'?'rgba(34,197,94,0.1)':myRequest.status==='rejected'?'rgba(239,68,68,0.1)':'rgba(245,158,11,0.1)',color:myRequest.status==='accepted'?'#22c55e':myRequest.status==='rejected'?'#ef4444':'#f59e0b',fontWeight:700,fontSize:'0.82rem'}}>
                  {myRequest.status==='accepted'?'✅ Accepted':myRequest.status==='rejected'?'❌ Rejected':'⏳ Application Pending'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:'0.4rem',marginBottom:'1rem',background:card,border:`1px solid ${border}`,borderRadius:12,padding:'4px'}}>
          {tabs.map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{flex:1,padding:'8px 12px',borderRadius:9,border:'none',background:tab===t.k?dark?'rgba(108,99,255,0.2)':'#ede9fe':'transparent',color:tab===t.k?'#6c63ff':mu,fontWeight:tab===t.k?700:500,cursor:'pointer',fontSize:'0.82rem'}}>
              {t.l}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab==='overview' && (
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:'1.25rem'}}>
            {project.prerequisites && (
              <div style={{marginBottom:'1rem'}}>
                <div style={{fontWeight:700,fontSize:'0.85rem',color:tx,marginBottom:'0.4rem'}}>Prerequisites</div>
                <p style={{color:mu,fontSize:'0.83rem',lineHeight:1.6}}>{project.prerequisites}</p>
              </div>
            )}
            <div>
              <div style={{fontWeight:700,fontSize:'0.85rem',color:tx,marginBottom:'0.75rem'}}>Team Members ({project.acceptedStudents?.length||0})</div>
              {project.acceptedStudents?.length===0 ? (
                <div style={{color:sb,fontSize:'0.83rem'}}>No members yet — be the first to join!</div>
              ) : project.acceptedStudents?.map(s=>(
                <div key={s._id} style={{display:'flex',alignItems:'center',gap:'0.6rem',padding:'0.5rem 0',borderBottom:`1px solid ${border}`}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#00d4aa,#00b894)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'0.7rem',fontWeight:700}}>{s.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                  <div>
                    <div style={{fontWeight:600,fontSize:'0.83rem',color:tx}}>{s.name}</div>
                    <div style={{fontSize:'0.72rem',color:mu}}>{s.department} · {s.year}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Q&A TAB */}
        {tab==='questions' && (
          <div>
            {/* Ask box */}
            <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:'1.1rem',marginBottom:'1rem'}}>
              <textarea value={qText} onChange={e=>setQText(e.target.value)} placeholder="Ask a question about this project..." rows={2} style={{width:'100%',padding:'9px 12px',background:bg,border:`1px solid ${border}`,borderRadius:8,color:tx,fontSize:'0.875rem',outline:'none',boxSizing:'border-box',resize:'none',fontFamily:'system-ui,sans-serif'}} />
              <div style={{display:'flex',justifyContent:'flex-end',marginTop:'0.6rem'}}>
                <button onClick={handleAskQuestion} disabled={!qText.trim()} style={{padding:'7px 18px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',borderRadius:8,color:'#fff',fontWeight:700,cursor:'pointer',fontSize:'0.82rem',opacity:!qText.trim()?0.5:1}}>Ask Question</button>
              </div>
            </div>

            {questions.length===0 ? (
              <div style={{textAlign:'center',padding:'3rem',color:sb,background:card,border:`1px solid ${border}`,borderRadius:14}}>
                <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>❓</div>
                <div>No questions yet — be the first to ask!</div>
              </div>
            ) : questions.map(q=>(
              <div key={q._id} style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:'1.1rem',marginBottom:'0.75rem'}}>
                <div style={{display:'flex',gap:'0.6rem',marginBottom:'0.75rem'}}>
                  <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'0.7rem',fontWeight:700,flexShrink:0}}>
                    {q.askedBy?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:'0.82rem',color:tx}}>{q.askedBy?.name} <span style={{color:mu,fontWeight:400}}>· {q.askedBy?.department}</span></div>
                    <div style={{color:tx,fontSize:'0.875rem',marginTop:'0.2rem',lineHeight:1.5}}>{q.question}</div>
                  </div>
                </div>
                {/* Answers */}
                {q.answers?.map((a,i)=>(
                  <div key={i} style={{marginLeft:'2.5rem',background:dark?'rgba(255,255,255,0.03)':'#f8fafc',border:`1px solid ${border}`,borderRadius:9,padding:'0.75rem',marginBottom:'0.4rem'}}>
                    <div style={{fontWeight:700,fontSize:'0.78rem',color:'#6c63ff',marginBottom:'0.2rem'}}>{a.answeredBy?.name} <span style={{color:mu,fontWeight:400}}>· {a.answeredBy?.designation||a.answeredBy?.role}</span></div>
                    <div style={{color:tx,fontSize:'0.83rem',lineHeight:1.5}}>{a.answer}</div>
                  </div>
                ))}
                {/* Answer input */}
                <div style={{marginLeft:'2.5rem',marginTop:'0.5rem',display:'flex',gap:'0.5rem'}}>
                  <input value={answerMap[q._id]||''} onChange={e=>setAnswerMap(m=>({...m,[q._id]:e.target.value}))} placeholder="Write an answer..." style={{flex:1,padding:'7px 11px',background:bg,border:`1px solid ${border}`,borderRadius:7,color:tx,fontSize:'0.8rem',outline:'none'}} />
                  <button onClick={()=>handleAnswer(q._id)} disabled={!answerMap[q._id]?.trim()} style={{padding:'7px 14px',background:'rgba(108,99,255,0.1)',border:'1px solid #6c63ff30',borderRadius:7,color:'#6c63ff',fontWeight:700,fontSize:'0.78rem',cursor:'pointer',opacity:!answerMap[q._id]?.trim()?0.5:1}}>Answer</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {tab==='applications' && (
          <div>
            {/* Fetch requests for this project */}
            <ProjectApplications projectId={id} dark={dark} card={card} border={border} tx={tx} mu={mu} sb={sb} bg={bg} API={API} onAction={load} />
          </div>
        )}

        {/* INVITE TAB */}
        {tab==='invite' && (
          <div>
            <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:'1.1rem',marginBottom:'1rem'}}>
              <input value={inviteSearch} onChange={e=>setInviteSearch(e.target.value)} placeholder="Search students by name or skill..." style={{width:'100%',padding:'9px 12px',background:bg,border:`1px solid ${border}`,borderRadius:8,color:tx,fontSize:'0.875rem',outline:'none',boxSizing:'border-box'}} />
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              {filteredStudents.slice(0,15).map(s=>{
                const m = calcMatch(s.skills||[]);
                const invited = project.invitedStudents?.some(i=>i._id===s._id||i===s._id);
                const joined  = project.acceptedStudents?.some(i=>i._id===s._id||i===s._id);
                return (
                  <div key={s._id} style={{background:card,border:`1px solid ${border}`,borderRadius:12,padding:'1rem',display:'flex',alignItems:'center',gap:'0.875rem'}}>
                    <div style={{width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,#00d4aa,#00b894)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'0.75rem',flexShrink:0}}>{s.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:'0.875rem',color:tx}}>{s.name}</div>
                      <div style={{fontSize:'0.72rem',color:mu}}>{s.department} · {s.year}</div>
                      {s.skills?.length>0 && <div style={{fontSize:'0.7rem',color:sb,marginTop:'2px'}}>{s.skills.slice(0,4).join(', ')}</div>}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'0.3rem'}}>
                      {m>0 && <span style={{fontSize:'0.7rem',fontWeight:700,color:m>=70?'#22c55e':m>=40?'#f59e0b':'#ef4444'}}>{m}% match</span>}
                      {joined ? (
                        <span style={{fontSize:'0.72rem',color:'#22c55e',fontWeight:600}}>✓ Joined</span>
                      ) : invited ? (
                        <span style={{fontSize:'0.72rem',color:mu}}>Invited</span>
                      ) : (
                        <button onClick={()=>handleInvite(s._id)} style={{padding:'5px 12px',borderRadius:7,background:'rgba(108,99,255,0.1)',border:'1px solid #6c63ff30',color:'#6c63ff',fontSize:'0.75rem',fontWeight:600,cursor:'pointer'}}>Invite</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApply && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem'}}>
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:16,padding:'1.75rem',width:'100%',maxWidth:460}}>
            <h2 style={{fontWeight:800,fontSize:'1.1rem',color:tx,marginBottom:'0.5rem'}}>Apply to Join</h2>
            <p style={{color:mu,fontSize:'0.83rem',marginBottom:'1rem'}}>Tell {poster?.name} why you want to join this project.</p>
            <textarea value={coverLetter} onChange={e=>setCoverLetter(e.target.value)} placeholder="Describe your interest and relevant skills..." rows={4} style={{width:'100%',padding:'10px 12px',background:bg,border:`1px solid ${border}`,borderRadius:9,color:tx,fontSize:'0.875rem',outline:'none',boxSizing:'border-box',resize:'none',marginBottom:'1rem',fontFamily:'system-ui,sans-serif'}} />
            <div style={{display:'flex',gap:'0.6rem'}}>
              <button onClick={()=>setShowApply(false)} style={{flex:1,padding:'10px',background:'transparent',border:`1px solid ${border}`,borderRadius:9,color:mu,cursor:'pointer'}}>Cancel</button>
              <button onClick={handleApply} disabled={applying} style={{flex:2,padding:'10px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',borderRadius:9,color:'#fff',fontWeight:700,cursor:'pointer',opacity:applying?0.7:1}}>{applying?'Sending...':'Send Application'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectApplications({ projectId, dark, card, border, tx, mu, sb, bg, API, onAction }) {
  const [reqs, setReqs] = useState([]);
  const h=()=>({headers:{Authorization:`Bearer ${localStorage.getItem('token')}`},timeout:15000});
  useEffect(()=>{
    axios.get(`${API}/requests/project/${projectId}`,h()).then(r=>setReqs(r.data)).catch(()=>{});
  },[projectId]);
  const handle = async (id,status)=>{
    try { await axios.put(`${API}/requests/${id}`,{status},h()); onAction(); setReqs(prev=>prev.map(r=>r._id===id?{...r,status}:r)); } catch { alert('Failed'); }
  };
  const pending  = reqs.filter(r=>r.status==='pending');
  const others   = reqs.filter(r=>r.status!=='pending');
  if (reqs.length===0) return <div style={{textAlign:'center',padding:'3rem',color:sb,background:card,border:`1px solid ${border}`,borderRadius:14}}>No applications yet</div>;
  return (
    <div>
      {pending.length>0 && <div style={{fontWeight:700,fontSize:'0.85rem',color:tx,marginBottom:'0.5rem'}}>⏳ Pending ({pending.length})</div>}
      {[...pending,...others].map(r=>(
        <div key={r._id} style={{background:card,border:`1px solid ${r.status==='pending'?'#f59e0b30':border}`,borderRadius:12,padding:'1rem',marginBottom:'0.5rem',display:'flex',alignItems:'center',gap:'0.875rem',flexWrap:'wrap'}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#00d4aa,#00b894)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'0.7rem',fontWeight:700,flexShrink:0}}>{r.student?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:'0.875rem',color:tx}}>{r.student?.name}</div>
            <div style={{fontSize:'0.75rem',color:mu}}>{r.student?.department} · {r.student?.year}</div>
            {r.message && <div style={{fontSize:'0.78rem',color:mu,marginTop:'0.2rem',fontStyle:'italic'}}>"{r.message?.slice(0,80)}"</div>}
          </div>
          <div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>
            {r.status==='pending' ? (
              <>
                <button onClick={()=>handle(r._id,'accepted')} style={{padding:'6px 13px',borderRadius:7,background:'rgba(34,197,94,0.1)',border:'1px solid #22c55e40',color:'#22c55e',fontWeight:700,fontSize:'0.78rem',cursor:'pointer'}}>✓ Accept</button>
                <button onClick={()=>handle(r._id,'rejected')} style={{padding:'6px 13px',borderRadius:7,background:'rgba(239,68,68,0.1)',border:'1px solid #ef444440',color:'#ef4444',fontWeight:700,fontSize:'0.78rem',cursor:'pointer'}}>✗ Reject</button>
              </>
            ) : (
              <span style={{padding:'4px 10px',borderRadius:99,fontSize:'0.72rem',fontWeight:700,background:r.status==='accepted'?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',color:r.status==='accepted'?'#22c55e':'#ef4444'}}>{r.status}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
