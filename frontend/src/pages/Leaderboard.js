import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const DEPT_COLORS = ['#6c63ff','#00d4aa','#ffb347','#ff6b9d','#ff5757','#4ade80','#60a5fa','#a78bfa'];

export default function Leaderboard() {
  const { user, API } = useAuth();
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [depts, setDepts]       = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }, timeout: 15000
      });
      setData(data);
      const d = [...new Set(data.map(s=>s.department).filter(Boolean))];
      setDepts(d);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [API]);

  const filtered = filter === 'all' ? data : data.filter(s => s.department === filter);
  const initials = (name) => name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'?';
  const isMe = (id) => id === user._id;

  const medalColors = ['#FFD700','#C0C0C0','#CD7F32'];

  return (
    <div style={{padding:'2rem',maxWidth:900,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2rem'}}>
        <div>
          <h1 style={{fontWeight:800,fontSize:'1.75rem',marginBottom:'0.25rem'}}>🏆 Leaderboard</h1>
          <p style={{color:'#9aa3bf',fontSize:'0.875rem'}}>Top students by achievements, projects and skills</p>
        </div>
        <button onClick={load} style={{padding:'8px 16px',borderRadius:8,border:'1px solid #252d47',background:'transparent',color:'#9aa3bf',fontSize:'0.8rem',cursor:'pointer'}}>🔄 Refresh</button>
      </div>

      {/* Top 3 podium */}
      {!loading && filtered.length >= 3 && (
        <div style={{display:'flex',justifyContent:'center',alignItems:'flex-end',gap:'1rem',marginBottom:'2rem',padding:'1.5rem',background:'#161c2e',borderRadius:16,border:'1px solid #252d47'}}>
          {[filtered[1], filtered[0], filtered[2]].map((s, i) => {
            const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
            const height = rank === 1 ? 120 : rank === 2 ? 90 : 75;
            return (
              <div key={s._id} style={{textAlign:'center',flex:1}}>
                <div style={{fontSize: rank===1?'2.5rem':'1.8rem',marginBottom:'0.25rem'}}>{rank===1?'👑':rank===2?'🥈':'🥉'}</div>
                <div style={{width:50,height:50,borderRadius:'50%',background:`linear-gradient(135deg,${medalColors[rank-1]}80,${medalColors[rank-1]})`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 0.5rem',color:'#fff',fontWeight:800,fontSize:'1rem',border:`2px solid ${medalColors[rank-1]}`}}>{initials(s.name)}</div>
                <div style={{fontWeight:700,fontSize:'0.85rem',color:'#e8eaf0',marginBottom:'0.2rem'}}>{s.name.split(' ')[0]}</div>
                <div style={{fontSize:'0.7rem',color:'#9aa3bf',marginBottom:'0.5rem'}}>{s.department}</div>
                <div style={{background:`${medalColors[rank-1]}20`,border:`1px solid ${medalColors[rank-1]}40`,borderRadius:8,padding:'4px 8px',display:'inline-block'}}>
                  <span style={{color:medalColors[rank-1],fontWeight:800,fontSize:'0.9rem'}}>{s.score}</span>
                  <span style={{color:'#9aa3bf',fontSize:'0.65rem',marginLeft:'3px'}}>pts</span>
                </div>
                <div style={{height,background:`${medalColors[rank-1]}20`,borderRadius:'8px 8px 0 0',marginTop:'0.5rem',border:`1px solid ${medalColors[rank-1]}30`,display:'flex',alignItems:'center',justifyContent:'center',color:medalColors[rank-1],fontWeight:800,fontSize:'1.2rem'}}>#{rank}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Department filter */}
      <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'1.5rem'}}>
        <button onClick={()=>setFilter('all')} style={{padding:'6px 14px',borderRadius:8,border:`1px solid ${filter==='all'?'#6c63ff':'#252d47'}`,background:filter==='all'?'rgba(108,99,255,0.15)':'transparent',color:filter==='all'?'#6c63ff':'#9aa3bf',fontWeight:600,cursor:'pointer',fontSize:'0.8rem'}}>All Departments</button>
        {depts.map((d,i) => (
          <button key={d} onClick={()=>setFilter(d)} style={{padding:'6px 14px',borderRadius:8,border:`1px solid ${filter===d?DEPT_COLORS[i%DEPT_COLORS.length]:'#252d47'}`,background:filter===d?`${DEPT_COLORS[i%DEPT_COLORS.length]}15`:'transparent',color:filter===d?DEPT_COLORS[i%DEPT_COLORS.length]:'#9aa3bf',fontWeight:600,cursor:'pointer',fontSize:'0.8rem'}}>{d}</button>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:'4rem',color:'#6c63ff'}}>Loading leaderboard...</div>
      ) : filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:'4rem',color:'#5c6580'}}>No students found</div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
          {filtered.map((s, idx) => (
            <div key={s._id} style={{background: isMe(s._id)?'rgba(108,99,255,0.08)':'#161c2e',border:`1px solid ${isMe(s._id)?'#6c63ff40':'#252d47'}`,borderRadius:12,padding:'1rem',display:'flex',alignItems:'center',gap:'1rem'}}>
              <div style={{width:36,height:36,borderRadius:8,background:idx<3?`${medalColors[idx]}20`:'#252d47',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:idx<3?medalColors[idx]:'#9aa3bf',fontSize:'0.9rem',flexShrink:0}}>#{idx+1}</div>
              <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#6c63ff80,#6c63ff)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,flexShrink:0}}>{initials(s.name)}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:'0.9rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  {s.name}
                  {isMe(s._id) && <span style={{padding:'1px 8px',borderRadius:99,background:'rgba(108,99,255,0.15)',color:'#6c63ff',fontSize:'0.65rem',fontWeight:700}}>YOU</span>}
                </div>
                <div style={{color:'#9aa3bf',fontSize:'0.75rem'}}>{s.department} · {s.year}</div>
              </div>
              <div style={{display:'flex',gap:'1.5rem',textAlign:'center'}}>
                <div>
                  <div style={{fontWeight:700,color:'#ffb347',fontSize:'0.95rem'}}>{s.achievements}</div>
                  <div style={{color:'#5c6580',fontSize:'0.65rem'}}>Achievements</div>
                </div>
                <div>
                  <div style={{fontWeight:700,color:'#00d4aa',fontSize:'0.95rem'}}>{s.projects}</div>
                  <div style={{color:'#5c6580',fontSize:'0.65rem'}}>Projects</div>
                </div>
                <div>
                  <div style={{fontWeight:700,color:'#60a5fa',fontSize:'0.95rem'}}>{s.skills.length}</div>
                  <div style={{color:'#5c6580',fontSize:'0.65rem'}}>Skills</div>
                </div>
                <div style={{background:'rgba(108,99,255,0.1)',border:'1px solid #6c63ff30',borderRadius:8,padding:'4px 12px'}}>
                  <div style={{fontWeight:800,color:'#6c63ff',fontSize:'1rem'}}>{s.score}</div>
                  <div style={{color:'#5c6580',fontSize:'0.65rem'}}>Score</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Score info */}
      <div style={{marginTop:'2rem',background:'#161c2e',border:'1px solid #252d47',borderRadius:12,padding:'1rem',display:'flex',gap:'2rem',flexWrap:'wrap'}}>
        <div style={{color:'#9aa3bf',fontSize:'0.8rem',fontWeight:600}}>How scores work:</div>
        <div style={{color:'#ffb347',fontSize:'0.8rem'}}>🏆 Achievement = 10 pts</div>
        <div style={{color:'#00d4aa',fontSize:'0.8rem'}}>📁 Project = 20 pts</div>
        <div style={{color:'#60a5fa',fontSize:'0.8rem'}}>⚡ Skill = 2 pts</div>
      </div>
    </div>
  );
}
