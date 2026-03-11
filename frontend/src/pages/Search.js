import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const roleColor = { student:'#00d4aa', staff:'#6c63ff', admin:'#ff6b9d' };
const initials = (name) => name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'?';

export default function Search() {
  const { API } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounce = useRef();

  const handleSearch = async (q) => {
    setQuery(q);
    clearTimeout(debounce.current);
    if (q.trim().length < 2) { setResults(null); return; }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API}/search?q=${encodeURIComponent(q)}`, {
          headers: { Authorization: `Bearer ${token}` }, timeout: 15000
        });
        setResults(data);
      } catch {}
      setLoading(false);
    }, 400);
  };

  const total = results ? (results.users?.length + results.projects?.length + results.announcements?.length) : 0;

  return (
    <div style={{padding:'2rem',maxWidth:800,margin:'0 auto'}}>
      <h1 style={{fontWeight:800,fontSize:'1.75rem',marginBottom:'0.5rem'}}>🔍 Global Search</h1>
      <p style={{color:'#9aa3bf',fontSize:'0.875rem',marginBottom:'2rem'}}>Search students, faculty, projects and announcements</p>

      <div style={{position:'relative',marginBottom:'2rem'}}>
        <span style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',fontSize:'1.1rem'}}>🔍</span>
        <input
          value={query}
          onChange={e=>handleSearch(e.target.value)}
          placeholder="Search anything — name, skill, project, department..."
          autoFocus
          style={{width:'100%',padding:'14px 16px 14px 46px',background:'#161c2e',border:'2px solid #6c63ff40',borderRadius:14,color:'#e8eaf0',fontSize:'1rem',outline:'none',boxSizing:'border-box',transition:'border-color 0.2s'}}
          onFocus={e=>e.target.style.borderColor='#6c63ff'}
          onBlur={e=>e.target.style.borderColor='#6c63ff40'}
        />
        {loading && <span style={{position:'absolute',right:16,top:'50%',transform:'translateY(-50%)',color:'#6c63ff',fontSize:'0.8rem'}}>Searching...</span>}
      </div>

      {!results && !loading && (
        <div style={{textAlign:'center',padding:'4rem',color:'#5c6580'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🔍</div>
          <div style={{color:'#9aa3bf'}}>Type at least 2 characters to search</div>
          <div style={{fontSize:'0.875rem',marginTop:'0.5rem'}}>Search students, faculty, projects, skills, announcements</div>
        </div>
      )}

      {results && total === 0 && (
        <div style={{textAlign:'center',padding:'4rem',color:'#5c6580'}}>
          <div style={{fontSize:'2.5rem',marginBottom:'1rem'}}>😕</div>
          <div style={{color:'#9aa3bf'}}>No results found for "{query}"</div>
        </div>
      )}

      {results && total > 0 && (
        <div style={{display:'flex',flexDirection:'column',gap:'2rem'}}>

          {/* People */}
          {results.users?.length > 0 && (
            <div>
              <h3 style={{fontWeight:700,color:'#9aa3bf',fontSize:'0.8rem',letterSpacing:'0.08em',marginBottom:'0.75rem'}}>👤 PEOPLE ({results.users.length})</h3>
              <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                {results.users.map(u => (
                  <div key={u._id} style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:12,padding:'1rem',display:'flex',gap:'0.75rem',alignItems:'center'}}>
                    <div style={{width:42,height:42,borderRadius:'50%',background:`linear-gradient(135deg,${roleColor[u.role]||'#6c63ff'}80,${roleColor[u.role]||'#6c63ff'})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,flexShrink:0}}>{initials(u.name)}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:'0.95rem'}}>{u.name}</div>
                      <div style={{color:roleColor[u.role]||'#6c63ff',fontSize:'0.75rem',fontWeight:600,textTransform:'capitalize'}}>{u.role} · {u.department}</div>
                      {u.skills?.length > 0 && (
                        <div style={{display:'flex',gap:'0.25rem',flexWrap:'wrap',marginTop:'0.35rem'}}>
                          {u.skills.slice(0,4).map(s=><span key={s} style={{padding:'1px 7px',borderRadius:99,background:'rgba(108,99,255,0.1)',border:'1px solid #6c63ff30',color:'#9aa3bf',fontSize:'0.7rem'}}>{s}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {results.projects?.length > 0 && (
            <div>
              <h3 style={{fontWeight:700,color:'#9aa3bf',fontSize:'0.8rem',letterSpacing:'0.08em',marginBottom:'0.75rem'}}>🗂 PROJECTS ({results.projects.length})</h3>
              <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                {results.projects.map(p => (
                  <div key={p._id} onClick={()=>navigate(`/projects/${p._id}`)} style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:12,padding:'1rem',cursor:'pointer'}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='#6c63ff40'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor='#252d47'}
                  >
                    <div style={{fontWeight:700,fontSize:'0.95rem',marginBottom:'0.25rem'}}>{p.title}</div>
                    <div style={{color:'#9aa3bf',fontSize:'0.8rem',marginBottom:'0.4rem'}}>{p.description?.slice(0,100)}...</div>
                    <div style={{color:'#6c63ff',fontSize:'0.75rem'}}>by {p.faculty?.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Announcements */}
          {results.announcements?.length > 0 && (
            <div>
              <h3 style={{fontWeight:700,color:'#9aa3bf',fontSize:'0.8rem',letterSpacing:'0.08em',marginBottom:'0.75rem'}}>📢 ANNOUNCEMENTS ({results.announcements.length})</h3>
              <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                {results.announcements.map(a => (
                  <div key={a._id} onClick={()=>navigate('/announcements')} style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:12,padding:'1rem',cursor:'pointer'}}>
                    <div style={{fontWeight:700,fontSize:'0.95rem',marginBottom:'0.25rem'}}>{a.title}</div>
                    <div style={{color:'#9aa3bf',fontSize:'0.8rem'}}>{a.content?.slice(0,100)}...</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
