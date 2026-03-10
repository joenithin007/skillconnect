import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import SkillTag from '../components/SkillTag';
import { Link } from 'react-router-dom';

const DEPARTMENTS = [
  'Aerospace Engineering','Biomedical Engineering','Biotechnology',
  'Chemical Engineering','Civil Engineering','Computer Science and Engineering',
  'Computer Science (AI & ML)','Computer Science (Data Science)','Cyber Security',
  'Electrical and Electronics Engineering','Electronics and Communication Engineering',
  'Information Technology','Marine Engineering','Mechanical Engineering',
  'Robotics and Automation','Other'
];

const TYPE_ICON  = { certificate:'📜', project:'💻', internship:'🏢', publication:'📄', award:'🏆', course:'📚', other:'⭐' };
const TYPE_COLOR = { certificate:'#6c63ff', project:'#00d4aa', internship:'#ffb347', publication:'#ff6b9d', award:'#ffd700', course:'#4ade80', other:'#9aa3bf' };

export default function Profile() {
  const { user, updateUser, API } = useAuth();
  const [editing, setEditing]   = useState(false);
  const [tab, setTab]           = useState('profile');
  const [achievements, setAchievements] = useState([]);
  const [myProjects, setMyProjects]     = useState([]);
  const [loadingData, setLoadingData]   = useState(true);

  const [form, setForm] = useState({
    ...user,
    skills: user.skills?.join(', ') || '',
    expertise: user.expertise?.join(', ') || '',
    researchInterests: user.researchInterests?.join(', ') || ''
  });
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState('');
  const [msgType, setMsgType] = useState('success');

  useEffect(() => {
    const loadAll = async () => {
      setLoadingData(true);
      try {
        const promises = [
          axios.get(`${API}/achievements/my`, { timeout: 15000 }),
        ];
        // Load projects for faculty/staff
        if (user.role === 'staff' || user.role === 'admin') {
          promises.push(axios.get(`${API}/projects/my`, { timeout: 15000 }));
        }
        const results = await Promise.all(promises);
        setAchievements(results[0].data);
        if (results[1]) setMyProjects(results[1].data);
      } catch {}
      setLoadingData(false);
    };
    loadAll();
  }, [API, user.role]);

  const s  = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const sp = (k, v) => setPwForm(f => ({ ...f, [k]: v }));

  const showMsg = (text, type = 'success') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 3500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        skills: form.skills ? form.skills.split(',').map(x => x.trim()).filter(Boolean) : [],
        expertise: form.expertise ? form.expertise.split(',').map(x => x.trim()).filter(Boolean) : [],
        researchInterests: form.researchInterests ? form.researchInterests.split(',').map(x => x.trim()).filter(Boolean) : [],
      };
      const { data } = await axios.put(`${API}/users/me`, payload);
      updateUser(data);
      setEditing(false);
      showMsg('✅ Profile updated successfully!');
    } catch (err) { showMsg('❌ ' + (err.response?.data?.message || 'Failed to save'), 'error'); }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) { showMsg('❌ Passwords do not match', 'error'); return; }
    if (pwForm.newPassword.length < 6) { showMsg('❌ Password must be at least 6 characters', 'error'); return; }
    setSaving(true);
    try {
      await axios.post(`${API}/auth/change-password`, { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword:'', newPassword:'', confirmPassword:'' });
      showMsg('✅ Password changed successfully!');
    } catch (err) { showMsg('❌ ' + (err.response?.data?.message || 'Failed'), 'error'); }
    setSaving(false);
  };

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Build tabs based on role
  const tabs = [
    { key:'profile', label:'👤 Profile' },
    ...(user.role === 'staff' || user.role === 'admin'
      ? [{ key:'projects', label:`🗂 My Projects (${myProjects.length})` }]
      : [{ key:'achievements', label:`🏆 Achievements (${achievements.length})` }]
    ),
    { key:'security', label:'🔒 Security' },
  ];

  return (
    <div style={{padding:'2rem',maxWidth:800,margin:'0 auto'}}>
      <h1 style={{fontWeight:800,fontSize:'1.75rem',marginBottom:'2rem'}}>My Profile</h1>

      {msg && <div style={{background:msgType==='success'?'rgba(74,222,128,0.1)':'rgba(255,87,87,0.1)',border:`1px solid ${msgType==='success'?'#4ade8040':'#ff575740'}`,borderRadius:10,padding:'12px',marginBottom:'1rem',color:msgType==='success'?'#4ade80':'#ff5757',fontSize:'0.875rem'}}>{msg}</div>}

      {/* Profile Card */}
      <div style={{background:'linear-gradient(135deg,#161c2e,#1c2340)',border:'1px solid #252d47',borderRadius:16,padding:'2rem',marginBottom:'1.5rem',textAlign:'center'}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,#ff6b9d,#6c63ff)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem',color:'#fff',fontWeight:800,fontSize:'1.5rem'}}>{initials}</div>
        <h2 style={{fontWeight:800,fontSize:'1.4rem',marginBottom:'0.25rem'}}>{user.name}</h2>
        <div style={{color:'#6c63ff',fontWeight:600,marginBottom:'0.25rem'}}>{user.designation || user.year}</div>
        <div style={{color:'#9aa3bf',marginBottom:'0.25rem'}}>{user.department}</div>
        <div style={{color:'#5c6580',fontSize:'0.8rem',marginBottom:'1rem'}}>{user.email}</div>
        <div style={{display:'flex',justifyContent:'center',gap:'0.75rem',flexWrap:'wrap'}}>
          <span style={{padding:'4px 16px',background:user.role==='student'?'rgba(0,212,170,0.15)':'rgba(108,99,255,0.15)',border:`1px solid ${user.role==='student'?'#00d4aa40':'#6c63ff40'}`,borderRadius:99,color:user.role==='student'?'#00d4aa':'#6c63ff',fontSize:'0.8rem',fontWeight:600,textTransform:'uppercase'}}>{user.role}</span>
          {user.gpa && <span style={{padding:'4px 16px',background:'rgba(0,212,170,0.1)',border:'1px solid #00d4aa40',borderRadius:99,color:'#00d4aa',fontSize:'0.8rem',fontWeight:600}}>GPA: {user.gpa}</span>}
          {user.role === 'staff' && myProjects.length > 0 && <span style={{padding:'4px 16px',background:'rgba(108,99,255,0.1)',border:'1px solid #6c63ff40',borderRadius:99,color:'#6c63ff',fontSize:'0.8rem',fontWeight:600}}>🗂 {myProjects.length} Project{myProjects.length>1?'s':''}</span>}
          {user.role === 'student' && achievements.length > 0 && <span style={{padding:'4px 16px',background:'rgba(255,215,0,0.1)',border:'1px solid rgba(255,215,0,0.3)',borderRadius:99,color:'#ffd700',fontSize:'0.8rem',fontWeight:600}}>🏆 {achievements.length} Achievement{achievements.length>1?'s':''}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.5rem',flexWrap:'wrap'}}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{padding:'8px 20px',borderRadius:8,border:`1px solid ${tab===t.key?'#6c63ff':'#252d47'}`,background:tab===t.key?'rgba(108,99,255,0.15)':'transparent',color:tab===t.key?'#6c63ff':'#9aa3bf',fontWeight:600,cursor:'pointer'}}>{t.label}</button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {tab === 'profile' && (
        <>
          {!editing ? (
            <>
              {user.bio && <Section title="BIO"><p style={{color:'#e8eaf0',lineHeight:1.7}}>{user.bio}</p></Section>}

              <Section title="SKILLS & EXPERTISE">
                <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                  {(user.skills?.length ? user.skills : user.expertise || []).map(s => <SkillTag key={s} skill={s} />)}
                  {!user.skills?.length && !user.expertise?.length && <span style={{color:'#5c6580',fontSize:'0.875rem'}}>No skills added. Click Edit Profile to add.</span>}
                </div>
              </Section>

              {user.role === 'staff' && user.researchInterests?.length > 0 && (
                <Section title="RESEARCH INTERESTS">
                  <p style={{color:'#e8eaf0'}}>{user.researchInterests.join(', ')}</p>
                </Section>
              )}

              <Section title="CONTACT & DETAILS">
                {[
                  { label:'Email',       value: user.email },
                  { label:'Department',  value: user.department },
                  ...(user.role==='student' ? [
                    { label:'Year',      value: user.year },
                    { label:'GPA',       value: user.gpa, mono: true },
                    { label:'GitHub',    value: user.github, link: true },
                    { label:'Portfolio', value: user.portfolio, link: true },
                  ] : [
                    { label:'Designation', value: user.designation },
                  ]),
                ].filter(i => i.value).map(item => (
                  <div key={item.label} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #1c2340'}}>
                    <span style={{color:'#9aa3bf',fontSize:'0.875rem'}}>{item.label}</span>
                    {item.link
                      ? <a href={item.value} target="_blank" rel="noreferrer" style={{color:'#6c63ff',fontSize:'0.875rem'}}>{item.value}</a>
                      : <span style={{color:'#e8eaf0',fontSize:'0.875rem',fontFamily:item.mono?'monospace':''}}>{item.value}</span>}
                  </div>
                ))}
              </Section>

              <button onClick={() => setEditing(true)} style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:'1rem',cursor:'pointer',marginTop:'0.5rem'}}>✏️ Edit Profile</button>
            </>
          ) : (
            <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,padding:'2rem'}}>
              <h3 style={{fontWeight:700,marginBottom:'1.5rem'}}>Edit Your Profile</h3>
              {[
                { label:'Full Name', key:'name' },
                { label:'Department', key:'department', select: DEPARTMENTS },
                ...(user.role==='student' ? [
                  { label:'Year', key:'year', select:['1st Year','2nd Year','3rd Year','4th Year'] },
                  { label:'GPA', key:'gpa', type:'number' },
                  { label:'Bio', key:'bio', multi:true },
                  { label:'Skills (comma separated)', key:'skills' },
                  { label:'GitHub URL', key:'github' },
                  { label:'Portfolio URL', key:'portfolio' },
                ] : [
                  { label:'Designation', key:'designation', select:['Assistant Professor','Associate Professor','Professor','Senior Professor','Head of Department','Dean','Director','Research Scholar'] },
                  { label:'Bio', key:'bio', multi:true },
                  { label:'Expertise (comma separated)', key:'expertise' },
                  { label:'Research Interests (comma separated)', key:'researchInterests' },
                ]),
              ].map(f => (
                <div key={f.key} style={{marginBottom:'1rem'}}>
                  <label style={{display:'block',marginBottom:'6px',fontSize:'0.875rem',fontWeight:600,color:'#9aa3bf'}}>{f.label}</label>
                  {f.select
                    ? <select value={form[f.key]||''} onChange={e=>s(f.key,e.target.value)} style={inputStyle}>
                        <option value="">Select...</option>
                        {f.select.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    : f.multi
                    ? <textarea value={form[f.key]||''} onChange={e=>s(f.key,e.target.value)} rows={3} style={{...inputStyle,resize:'vertical'}} />
                    : <input type={f.type||'text'} value={form[f.key]||''} onChange={e=>s(f.key,e.target.value)} style={inputStyle} />
                  }
                </div>
              ))}
              <div style={{display:'flex',gap:'0.75rem',marginTop:'0.5rem'}}>
                <button onClick={()=>setEditing(false)} style={{flex:1,padding:'12px',background:'transparent',border:'1px solid #252d47',borderRadius:10,color:'#9aa3bf',fontWeight:600,cursor:'pointer'}}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{flex:2,padding:'12px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,cursor:'pointer'}}>{saving?'Saving...':'Save Changes'}</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── PROJECTS TAB (faculty) ── */}
      {tab === 'projects' && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
            <p style={{color:'#9aa3bf',fontSize:'0.875rem'}}>All projects you have posted — visible to students</p>
            <Link to="/dashboard" style={{padding:'8px 16px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',borderRadius:8,color:'#fff',fontSize:'0.8rem',fontWeight:700,textDecoration:'none'}}>+ Create New Project</Link>
          </div>

          {loadingData ? (
            <div style={{textAlign:'center',padding:'2rem',color:'#6c63ff'}}>Loading projects...</div>
          ) : myProjects.length === 0 ? (
            <div style={{background:'#161c2e',border:'2px dashed #252d47',borderRadius:14,padding:'3rem',textAlign:'center',color:'#5c6580'}}>
              <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>📋</div>
              <div style={{marginBottom:'0.5rem',color:'#9aa3bf'}}>No projects yet</div>
              <Link to="/dashboard" style={{color:'#6c63ff',fontSize:'0.875rem'}}>Go to Dashboard to create →</Link>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:'1rem'}}>
              {myProjects.map(p => (
                <Link key={p._id} to={`/projects/${p._id}`} style={{textDecoration:'none'}}>
                  <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'1.25rem',cursor:'pointer'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
                      <h3 style={{fontWeight:700,fontSize:'0.95rem',color:'#e8eaf0',flex:1,marginRight:'0.75rem'}}>{p.title}</h3>
                      <span style={{padding:'3px 10px',borderRadius:99,fontSize:'0.7rem',fontWeight:600,background:p.status==='open'?'rgba(0,212,170,0.15)':'rgba(255,87,87,0.15)',color:p.status==='open'?'#00d4aa':'#ff5757',border:`1px solid ${p.status==='open'?'#00d4aa40':'#ff575740'}`,whiteSpace:'nowrap'}}>{p.status}</span>
                    </div>
                    <p style={{color:'#9aa3bf',fontSize:'0.8rem',marginBottom:'0.75rem',lineHeight:1.5}}>{p.description?.substring(0,100)}...</p>
                    <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'0.5rem'}}>
                      {p.requiredSkills?.slice(0,3).map(s => <SkillTag key={s} skill={s} />)}
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',paddingTop:'0.5rem',borderTop:'1px solid #252d47'}}>
                      <span style={{color:'#9aa3bf',fontSize:'0.75rem'}}>👥 {p.acceptedStudents?.length||0}/{p.maxStudents||5} students</span>
                      <span style={{color:'#6c63ff',fontSize:'0.75rem',fontWeight:600}}>View Details →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ACHIEVEMENTS TAB (students) ── */}
      {tab === 'achievements' && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
            <p style={{color:'#9aa3bf',fontSize:'0.875rem'}}>Visible to faculty when reviewing your applications</p>
            <Link to="/achievements" style={{padding:'8px 16px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',borderRadius:8,color:'#fff',fontSize:'0.8rem',fontWeight:700,textDecoration:'none'}}>+ Add / Manage</Link>
          </div>

          {loadingData ? (
            <div style={{textAlign:'center',padding:'2rem',color:'#6c63ff'}}>Loading achievements...</div>
          ) : achievements.length === 0 ? (
            <div style={{background:'#161c2e',border:'2px dashed #252d47',borderRadius:14,padding:'3rem',textAlign:'center',color:'#5c6580'}}>
              <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>🏆</div>
              <div style={{marginBottom:'0.5rem',color:'#9aa3bf'}}>No achievements added yet</div>
              <Link to="/achievements" style={{color:'#6c63ff',fontSize:'0.875rem'}}>Go to Achievements page to add →</Link>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'1rem'}}>
              {achievements.map(a => {
                const color = TYPE_COLOR[a.type]||'#9aa3bf';
                const icon  = TYPE_ICON[a.type] ||'⭐';
                return (
                  <div key={a._id} style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,overflow:'hidden'}}>
                    {a.imageBase64 && <div style={{height:130,overflow:'hidden'}}><img src={a.imageBase64} alt={a.title} style={{width:'100%',height:'100%',objectFit:'cover'}} /></div>}
                    <div style={{padding:'1rem'}}>
                      <span style={{padding:'2px 10px',borderRadius:99,fontSize:'0.7rem',fontWeight:700,background:`${color}15`,color,border:`1px solid ${color}30`}}>{icon} {a.type}</span>
                      <div style={{fontWeight:700,fontSize:'0.95rem',marginTop:'0.5rem',color:'#e8eaf0'}}>{a.title}</div>
                      {a.issuer && <div style={{color:'#9aa3bf',fontSize:'0.8rem'}}>{a.issuer}</div>}
                      {a.date   && <div style={{color:'#5c6580',fontSize:'0.75rem'}}>{a.date}</div>}
                      {a.description && <p style={{color:'#9aa3bf',fontSize:'0.8rem',marginTop:'0.5rem',lineHeight:1.5}}>{a.description}</p>}
                      {a.skills?.length > 0 && <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginTop:'0.5rem'}}>{a.skills.map(sk => <SkillTag key={sk} skill={sk} />)}</div>}
                      {a.url && <a href={a.url} target="_blank" rel="noreferrer" style={{display:'block',marginTop:'0.5rem',color:'#6c63ff',fontSize:'0.8rem',fontWeight:600}}>🔗 View Certificate</a>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SECURITY TAB ── */}
      {tab === 'security' && (
        <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,padding:'2rem'}}>
          <h3 style={{fontWeight:700,marginBottom:'1.5rem'}}>🔒 Change Password</h3>
          {[
            {label:'Current Password', key:'currentPassword'},
            {label:'New Password',     key:'newPassword'},
            {label:'Confirm New Password', key:'confirmPassword'},
          ].map(f => (
            <div key={f.key} style={{marginBottom:'1rem'}}>
              <label style={{display:'block',marginBottom:'6px',fontSize:'0.875rem',fontWeight:600,color:'#9aa3bf'}}>{f.label}</label>
              <input type="password" value={pwForm[f.key]} onChange={e=>sp(f.key,e.target.value)} style={inputStyle} />
            </div>
          ))}
          <button onClick={handleChangePassword} disabled={saving} style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#6c63ff,#8b85ff)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,cursor:'pointer'}}>{saving?'Changing...':'Change Password'}</button>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:14,padding:'1.5rem',marginBottom:'1rem'}}>
      <h3 style={{fontWeight:700,marginBottom:'0.75rem',fontSize:'0.8rem',color:'#9aa3bf',letterSpacing:'0.08em'}}>{title}</h3>
      {children}
    </div>
  );
}

const inputStyle = {width:'100%',padding:'10px 14px',background:'#0f1320',border:'1px solid #252d47',borderRadius:8,color:'#e8eaf0',fontSize:'0.9rem',outline:'none',boxSizing:'border-box'};
