import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SkillTag from '../components/SkillTag';

const TYPE_CONFIG = {
  certificate: { icon: '📜', label: 'Certificate', color: '#6c63ff' },
  project:     { icon: '💻', label: 'Project',     color: '#00d4aa' },
  internship:  { icon: '🏢', label: 'Internship',  color: '#ffb347' },
  publication: { icon: '📄', label: 'Publication', color: '#ff6b9d' },
  award:       { icon: '🏆', label: 'Award',       color: '#ffd700' },
  course:      { icon: '📚', label: 'Course',      color: '#4ade80' },
  other:       { icon: '⭐', label: 'Other',       color: '#9aa3bf' },
};

export default function Achievements() {
  const { API } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title:'', type:'certificate', issuer:'', description:'',
    skills:'', date:'', url:'', imageBase64:''
  });
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`${API}/achievements/my`, { timeout: 15000 });
      setAchievements(data);
    } catch (err) {
      setError('Failed to load. Check your connection and try again.');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [API]);

  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('File too large! Max 2MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => s('imageBase64', ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setMsg('Title is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, skills: form.skills.split(',').map(x => x.trim()).filter(Boolean) };
      if (editing) {
        await axios.put(`${API}/achievements/${editing._id}`, payload, { timeout: 15000 });
      } else {
        await axios.post(`${API}/achievements`, payload, { timeout: 15000 });
      }
      setShowForm(false);
      setEditing(null);
      setForm({ title:'', type:'certificate', issuer:'', description:'', skills:'', date:'', url:'', imageBase64:'' });
      setMsg('✅ Saved successfully!');
      setTimeout(() => setMsg(''), 3000);
      await load();
    } catch (err) {
      setMsg('❌ Failed to save. Try again.');
    }
    setSaving(false);
  };

  const handleEdit = (a) => {
    setEditing(a);
    setForm({ ...a, skills: a.skills?.join(', ') || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await axios.delete(`${API}/achievements/${id}`, { timeout: 15000 });
      setAchievements(prev => prev.filter(a => a._id !== id));
    } catch { alert('Failed to delete'); }
  };

  const openForm = () => {
    setEditing(null);
    setForm({ title:'', type:'certificate', issuer:'', description:'', skills:'', date:'', url:'', imageBase64:'' });
    setShowForm(true);
  };

  return (
    <div style={{padding:'2rem',maxWidth:900,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2rem'}}>
        <div>
          <h1 style={{fontWeight:800,fontSize:'1.75rem',marginBottom:'0.25rem'}}>🏆 My Achievements</h1>
          <p style={{color:'#9aa3bf',fontSize:'0.875rem'}}>Certificates, projects, awards — visible to faculty when you apply</p>
        </div>
        <div style={{display:'flex',gap:'0.75rem'}}>
          <button onClick={load} style={{padding:'8px 16px',borderRadius:8,border:'1px solid #252d47',background:'transparent',color:'#9aa3bf',fontSize:'0.8rem',cursor:'pointer'}}>🔄 Refresh</button>
          <button onClick={openForm} style={{padding:'10px 20px',background:'linear-gradient(135deg, #6c63ff, #8b85ff)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,cursor:'pointer',fontSize:'0.9rem'}}>+ Add Achievement</button>
        </div>
      </div>

      {msg && (
        <div style={{background:msg.includes('✅')?'rgba(74,222,128,0.1)':'rgba(255,87,87,0.1)',border:`1px solid ${msg.includes('✅')?'#4ade8040':'#ff575740'}`,borderRadius:10,padding:'12px',marginBottom:'1rem',color:msg.includes('✅')?'#4ade80':'#ff5757',fontSize:'0.875rem'}}>{msg}</div>
      )}

      {loading ? (
        <div style={{textAlign:'center',padding:'4rem'}}>
          <div style={{fontSize:'2rem',marginBottom:'1rem'}}>⏳</div>
          <div style={{color:'#6c63ff',marginBottom:'0.5rem'}}>Loading achievements...</div>
          <div style={{color:'#5c6580',fontSize:'0.875rem'}}>Please wait...</div>
        </div>
      ) : error ? (
        <div style={{background:'rgba(255,87,87,0.1)',border:'1px solid #ff575740',borderRadius:14,padding:'2rem',textAlign:'center'}}>
          <div style={{fontSize:'2rem',marginBottom:'0.75rem'}}>⚠️</div>
          <div style={{color:'#ff5757',marginBottom:'1rem'}}>{error}</div>
          <button onClick={load} style={{padding:'10px 24px',background:'linear-gradient(135deg, #6c63ff, #8b85ff)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,cursor:'pointer'}}>Try Again</button>
        </div>
      ) : achievements.length === 0 ? (
        <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,padding:'4rem',textAlign:'center',color:'#5c6580'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🏆</div>
          <div style={{fontSize:'1.1rem',marginBottom:'0.5rem',color:'#9aa3bf'}}>No achievements yet</div>
          <div style={{fontSize:'0.875rem',marginBottom:'1.5rem'}}>Add your certificates, projects, internships and more!</div>
          <button onClick={openForm} style={{padding:'10px 24px',background:'linear-gradient(135deg, #6c63ff, #8b85ff)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,cursor:'pointer'}}>+ Add First Achievement</button>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(380px, 1fr))',gap:'1.25rem'}}>
          {achievements.map(a => {
            const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.other;
            return (
              <div key={a._id} style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,overflow:'hidden'}}>
                {a.imageBase64 && (
                  <div style={{height:160,overflow:'hidden',background:'#0f1320'}}>
                    <img src={a.imageBase64} alt={a.title} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  </div>
                )}
                <div style={{padding:'1.25rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.75rem'}}>
                    <div style={{flex:1}}>
                      <div style={{marginBottom:'0.4rem'}}>
                        <span style={{padding:'2px 10px',borderRadius:99,fontSize:'0.7rem',fontWeight:700,background:`${cfg.color}15`,color:cfg.color,border:`1px solid ${cfg.color}30`}}>{cfg.icon} {cfg.label}</span>
                      </div>
                      <h3 style={{fontWeight:700,fontSize:'1rem',color:'#e8eaf0',marginBottom:'0.25rem'}}>{a.title}</h3>
                      {a.issuer && <div style={{color:'#9aa3bf',fontSize:'0.8rem'}}>by {a.issuer}</div>}
                      {a.date && <div style={{color:'#5c6580',fontSize:'0.75rem'}}>{a.date}</div>}
                    </div>
                    <div style={{display:'flex',gap:'0.4rem'}}>
                      <button onClick={()=>handleEdit(a)} style={{padding:'5px 10px',borderRadius:7,border:'1px solid #252d47',background:'transparent',color:'#9aa3bf',fontSize:'0.75rem',cursor:'pointer'}}>Edit</button>
                      <button onClick={()=>handleDelete(a._id)} style={{padding:'5px 10px',borderRadius:7,border:'1px solid #ff575740',background:'rgba(255,87,87,0.1)',color:'#ff5757',fontSize:'0.75rem',cursor:'pointer'}}>Delete</button>
                    </div>
                  </div>
                  {a.description && <p style={{color:'#9aa3bf',fontSize:'0.85rem',marginBottom:'0.75rem',lineHeight:1.5}}>{a.description}</p>}
                  {a.skills?.length > 0 && (
                    <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'0.75rem'}}>
                      {a.skills.map(sk => <SkillTag key={sk} skill={sk} />)}
                    </div>
                  )}
                  {a.url && (
                    <a href={a.url} target="_blank" rel="noreferrer" style={{color:'#6c63ff',fontSize:'0.8rem',fontWeight:600,textDecoration:'none'}}>🔗 View Certificate / Link</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem'}}>
          <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,padding:'2rem',width:'100%',maxWidth:540,maxHeight:'90vh',overflowY:'auto'}}>
            <h2 style={{fontWeight:800,marginBottom:'1.5rem'}}>{editing?'Edit Achievement':'+ Add Achievement'}</h2>

            <div style={{marginBottom:'1rem'}}>
              <label style={labelStyle}>Type</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.5rem'}}>
                {Object.entries(TYPE_CONFIG).map(([key,cfg]) => (
                  <button key={key} onClick={()=>s('type',key)} style={{padding:'8px 4px',borderRadius:8,border:`2px solid ${form.type===key?cfg.color:'#252d47'}`,background:form.type===key?`${cfg.color}15`:'transparent',color:form.type===key?cfg.color:'#9aa3bf',fontWeight:600,cursor:'pointer',fontSize:'0.7rem',textAlign:'center'}}>
                    <div style={{fontSize:'1.1rem'}}>{cfg.icon}</div>
                    <div>{cfg.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <Field label="Title *" value={form.title} onChange={v=>s('title',v)} placeholder="e.g. Python for Data Science - Coursera" />
            <Field label="Issued by" value={form.issuer} onChange={v=>s('issuer',v)} placeholder="e.g. Coursera, NPTEL, Google" />
            <Field label="Date" value={form.date} onChange={v=>s('date',v)} placeholder="e.g. March 2026" />
            <div style={{marginBottom:'1rem'}}>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description} onChange={e=>s('description',e.target.value)} placeholder="What you learned or achieved..." rows={3} style={{width:'100%',padding:'10px 14px',background:'#0f1320',border:'1px solid #252d47',borderRadius:8,color:'#e8eaf0',fontSize:'0.9rem',outline:'none',resize:'vertical',boxSizing:'border-box'}} />
            </div>
            <Field label="Skills gained (comma separated)" value={form.skills} onChange={v=>s('skills',v)} placeholder="Python, Data Analysis, Pandas" />
            <Field label="Certificate URL / Project Link (optional)" value={form.url} onChange={v=>s('url',v)} placeholder="https://..." />

            <div style={{marginBottom:'1.5rem'}}>
              <label style={labelStyle}>Upload Certificate Image (optional, max 2MB)</label>
              <div style={{border:'2px dashed #252d47',borderRadius:10,padding:'1.5rem',textAlign:'center',cursor:'pointer',background:'#0f1320'}} onClick={()=>fileRef.current.click()}>
                {form.imageBase64 ? (
                  <div>
                    <img src={form.imageBase64} alt="preview" style={{maxHeight:120,borderRadius:8,marginBottom:'0.5rem'}} />
                    <div style={{color:'#4ade80',fontSize:'0.8rem'}}>✓ Image uploaded</div>
                  </div>
                ) : (
                  <div>
                    <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>📸</div>
                    <div style={{color:'#9aa3bf',fontSize:'0.875rem'}}>Click to upload certificate image</div>
                    <div style={{color:'#5c6580',fontSize:'0.75rem'}}>JPG, PNG — Max 2MB</div>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:'none'}} />
              </div>
              {form.imageBase64 && <button onClick={()=>s('imageBase64','')} style={{marginTop:'0.5rem',padding:'4px 12px',borderRadius:6,border:'1px solid #ff575740',background:'transparent',color:'#ff5757',fontSize:'0.75rem',cursor:'pointer'}}>Remove image</button>}
            </div>

            <div style={{display:'flex',gap:'0.75rem'}}>
              <button onClick={()=>{setShowForm(false);setEditing(null);}} style={{flex:1,padding:'12px',background:'transparent',border:'1px solid #252d47',borderRadius:10,color:'#9aa3bf',fontWeight:600,cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSubmit} disabled={saving} style={{flex:2,padding:'12px',background:'linear-gradient(135deg, #6c63ff, #8b85ff)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,cursor:'pointer'}}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Achievement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div style={{marginBottom:'1rem'}}>
      <label style={labelStyle}>{label}</label>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:'100%',padding:'10px 14px',background:'#0f1320',border:'1px solid #252d47',borderRadius:8,color:'#e8eaf0',fontSize:'0.9rem',outline:'none',boxSizing:'border-box'}} />
    </div>
  );
}

const labelStyle = {display:'block',marginBottom:'6px',fontSize:'0.875rem',fontWeight:600,color:'#9aa3bf'};
