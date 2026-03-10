import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SkillTag from '../components/SkillTag';
import MatchScore from '../components/MatchScore';

export default function MyRequests() {
  const { user, API } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/requests/my`);
      setRequests(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [API]);

  const handleRequest = async (reqId, status) => {
    try {
      await axios.put(`${API}/requests/${reqId}`, { status });
      load();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const statusColor = { pending:'#ffb347', accepted:'#4ade80', rejected:'#ff5757' };

  if (loading) return <div style={{padding:'3rem',textAlign:'center',color:'#6c63ff'}}>Loading...</div>;

  return (
    <div style={{padding:'2rem',maxWidth:900,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <h1 style={{fontWeight:800,fontSize:'1.75rem'}}>{user.role === 'student' ? 'My Applications' : 'Student Requests'}</h1>
        <span style={{color:'#9aa3bf',fontSize:'0.875rem'}}>{filtered.length} requests</span>
      </div>

      <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.5rem'}}>
        {['all','pending','accepted','rejected'].map(f => (
          <button key={f} onClick={()=>setFilter(f)} style={{padding:'8px 18px',borderRadius:8,border:`1px solid ${filter===f?statusColor[f]||'#6c63ff':'#252d47'}`,background:filter===f?`${statusColor[f]||'#6c63ff'}15`:'transparent',color:filter===f?statusColor[f]||'#6c63ff':'#9aa3bf',fontWeight:600,cursor:'pointer',textTransform:'capitalize',fontSize:'0.875rem'}}>
            {f} {filter!==f && <span style={{color:'#5c6580'}}>({requests.filter(r=>f==='all'||r.status===f).length})</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,padding:'4rem',textAlign:'center',color:'#5c6580'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>📭</div>
          <div>No {filter === 'all' ? '' : filter} requests</div>
          {user.role === 'student' && <Link to="/projects" style={{color:'#6c63ff',display:'block',marginTop:'0.75rem',fontSize:'0.875rem'}}>Browse Projects →</Link>}
        </div>
      ) : filtered.map(r => (
        <div key={r._id} style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'1.5rem',marginBottom:'1rem'}}>
          {user.role === 'student' ? (
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.75rem'}}>
                <div>
                  <Link to={`/projects/${r.project?._id}`} style={{fontWeight:700,fontSize:'1rem',color:'#e8eaf0',textDecoration:'none'}}>{r.project?.title}</Link>
                  <div style={{color:'#9aa3bf',fontSize:'0.8rem',marginTop:'0.25rem'}}>by {r.faculty?.name} · {r.faculty?.department}</div>
                </div>
                <span style={{padding:'4px 14px',borderRadius:99,fontSize:'0.8rem',fontWeight:600,background:`${statusColor[r.status]}15`,color:statusColor[r.status],border:`1px solid ${statusColor[r.status]}40`}}>
                  {r.status}
                </span>
              </div>
              <div style={{marginBottom:'0.75rem'}}>
                <div style={{fontSize:'0.75rem',color:'#5c6580',marginBottom:'4px'}}>Skill Match</div>
                <MatchScore score={r.skillMatchScore} />
              </div>
              <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'0.75rem'}}>
                {r.project?.requiredSkills?.slice(0,5).map(s=><SkillTag key={s} skill={s} />)}
              </div>
              <div style={{background:'#0f1320',borderRadius:8,padding:'0.75rem',fontSize:'0.875rem',color:'#9aa3bf',fontStyle:'italic'}}>"{r.message}"</div>
              {r.facultyNote && <div style={{marginTop:'0.75rem',padding:'0.75rem',background:'rgba(255,179,71,0.08)',borderRadius:8,fontSize:'0.875rem',color:'#ffb347'}}>Faculty note: {r.facultyNote}</div>}
            </>
          ) : (
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.75rem'}}>
                <div>
                  <div style={{fontWeight:700,fontSize:'1rem'}}>{r.student?.name}</div>
                  <div style={{color:'#9aa3bf',fontSize:'0.8rem'}}>{r.student?.department} · {r.student?.year} · GPA: {r.student?.gpa || 'N/A'}</div>
                  <div style={{color:'#6c63ff',fontSize:'0.8rem',marginTop:'0.25rem'}}>For: {r.project?.title}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                  <span style={{fontFamily:'Space Mono',fontWeight:700,color:r.skillMatchScore>=70?'#4ade80':r.skillMatchScore>=40?'#ffb347':'#ff5757',fontSize:'0.9rem'}}>{r.skillMatchScore}% match</span>
                  <span style={{padding:'4px 14px',borderRadius:99,fontSize:'0.8rem',fontWeight:600,background:`${statusColor[r.status]}15`,color:statusColor[r.status],border:`1px solid ${statusColor[r.status]}40`}}>{r.status}</span>
                </div>
              </div>
              <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'0.75rem'}}>
                {r.student?.skills?.slice(0,5).map(s=><SkillTag key={s} skill={s} />)}
              </div>
              <div style={{background:'#0f1320',borderRadius:8,padding:'0.75rem',fontSize:'0.875rem',color:'#9aa3bf',fontStyle:'italic',marginBottom:'0.75rem'}}>"{r.message}"</div>
              {r.status === 'pending' && (
                <div style={{display:'flex',gap:'0.5rem'}}>
                  {r.student?.github && <a href={r.student.github} target="_blank" rel="noreferrer" style={{padding:'7px 14px',borderRadius:8,border:'1px solid #252d47',color:'#9aa3bf',fontSize:'0.8rem',textDecoration:'none'}}>GitHub</a>}
                  <button onClick={()=>handleRequest(r._id,'accepted')} style={{padding:'7px 18px',borderRadius:8,background:'rgba(74,222,128,0.1)',border:'1px solid #4ade8040',color:'#4ade80',fontWeight:600,cursor:'pointer',fontSize:'0.875rem'}}>✓ Accept</button>
                  <button onClick={()=>handleRequest(r._id,'rejected')} style={{padding:'7px 18px',borderRadius:8,background:'rgba(255,87,87,0.1)',border:'1px solid #ff575740',color:'#ff5757',fontWeight:600,cursor:'pointer',fontSize:'0.875rem'}}>✗ Reject</button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
