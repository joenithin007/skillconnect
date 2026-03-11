import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function ResumeBuilder() {
  const { user, API } = useAuth();
  const [profile, setProfile]       = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [projects, setProjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token');
      const h = { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 };
      try {
        const [pRes, aRes, prRes] = await Promise.all([
          axios.get(`${API}/users/me`, h),
          axios.get(`${API}/achievements/my`, h),
          axios.get(`${API}/projects/user/${user._id}`, h),
        ]);
        setProfile(pRes.data);
        setAchievements(aRes.data);
        setProjects(prRes.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, [API, user._id]);

  const generateResume = () => {
    setGenerating(true);
    setTimeout(() => {
      const content = buildResumeHTML(profile, achievements, projects);
      const blob = new Blob([content], { type: 'text/html' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${profile?.name?.replace(/ /g,'_')}_Resume.html`;
      a.click();
      URL.revokeObjectURL(url);
      setGenerating(false);
    }, 1000);
  };

  const buildResumeHTML = (p, achs, projs) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${p?.name} - Resume</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', sans-serif; color: #1a1a2e; background: #fff; }
  .header { background: linear-gradient(135deg, #6c63ff, #00d4aa); color: white; padding: 2rem; }
  .header h1 { font-size: 2rem; font-weight: 800; }
  .header p { opacity: 0.9; margin-top: 0.25rem; }
  .contact { display: flex; gap: 1.5rem; margin-top: 0.75rem; font-size: 0.875rem; flex-wrap: wrap; }
  .badge { background: rgba(255,255,255,0.2); padding: 3px 10px; border-radius: 99px; font-size: 0.8rem; }
  .body { padding: 2rem; max-width: 800px; }
  .section { margin-bottom: 1.75rem; }
  .section h2 { font-size: 1rem; font-weight: 700; color: #6c63ff; border-bottom: 2px solid #6c63ff30; padding-bottom: 0.4rem; margin-bottom: 1rem; letter-spacing: 0.05em; text-transform: uppercase; }
  .skills { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .skill { background: #6c63ff15; border: 1px solid #6c63ff30; color: #6c63ff; padding: 4px 12px; border-radius: 99px; font-size: 0.8rem; font-weight: 600; }
  .item { margin-bottom: 1rem; padding: 0.75rem; border-left: 3px solid #6c63ff; background: #f8f9ff; border-radius: 0 8px 8px 0; }
  .item h3 { font-weight: 700; font-size: 0.95rem; }
  .item p { color: #666; font-size: 0.85rem; margin-top: 0.25rem; }
  .item .tag { display:inline-block; background:#00d4aa20; color:#00d4aa; padding:2px 8px; border-radius:99px; font-size:0.75rem; font-weight:600; margin-top:0.25rem; }
  .footer { text-align: center; padding: 1rem; color: #999; font-size: 0.75rem; border-top: 1px solid #eee; margin-top: 2rem; }
</style>
</head>
<body>
<div class="header">
  <h1>${p?.name || ''}</h1>
  <p>${p?.department || ''} · ${p?.year || ''}</p>
  <div class="contact">
    <span>📧 ${p?.email || ''}</span>
    ${p?.phone ? `<span>📞 ${p.phone}</span>` : ''}
    <span class="badge">SIST SkillConnect</span>
  </div>
</div>
<div class="body">
  ${p?.bio ? `<div class="section"><h2>About</h2><p style="color:#444;line-height:1.7">${p.bio}</p></div>` : ''}
  
  ${p?.skills?.length ? `
  <div class="section">
    <h2>Skills</h2>
    <div class="skills">${p.skills.map(s=>`<span class="skill">${s}</span>`).join('')}</div>
  </div>` : ''}

  ${projs?.length ? `
  <div class="section">
    <h2>Research Projects</h2>
    ${projs.map(pr=>`
    <div class="item">
      <h3>${pr.title}</h3>
      <p>${pr.description?.slice(0,150) || ''}...</p>
      ${pr.skillsRequired?.length ? `<span class="tag">${pr.skillsRequired.slice(0,3).join(', ')}</span>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${achs?.length ? `
  <div class="section">
    <h2>Achievements & Certifications</h2>
    ${achs.map(a=>`
    <div class="item">
      <h3>${a.title}</h3>
      <p>${a.description || ''}</p>
      <span class="tag">${a.type}</span>
      ${a.date ? `<span style="color:#999;font-size:0.75rem;margin-left:8px">${new Date(a.date).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}</span>` : ''}
    </div>`).join('')}
  </div>` : ''}

  <div class="footer">Generated from SIST SkillConnect · Sathyabama Institute of Science and Technology</div>
</div>
</body>
</html>`;

  if (loading) return <div style={{padding:'3rem',textAlign:'center',color:'#6c63ff'}}>Loading your profile...</div>;

  return (
    <div style={{padding:'2rem',maxWidth:800,margin:'0 auto'}}>
      <h1 style={{fontWeight:800,fontSize:'1.75rem',marginBottom:'0.5rem'}}>📄 Resume Builder</h1>
      <p style={{color:'#9aa3bf',fontSize:'0.875rem',marginBottom:'2rem'}}>Auto-generate your resume from your SIST SkillConnect profile</p>

      {/* Preview Card */}
      <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,overflow:'hidden',marginBottom:'2rem'}}>
        {/* Header preview */}
        <div style={{background:'linear-gradient(135deg,#6c63ff,#00d4aa)',padding:'1.5rem'}}>
          <div style={{fontWeight:800,fontSize:'1.3rem',color:'#fff'}}>{profile?.name}</div>
          <div style={{color:'rgba(255,255,255,0.85)',fontSize:'0.875rem',marginTop:'0.25rem'}}>{profile?.department} · {profile?.year}</div>
          <div style={{color:'rgba(255,255,255,0.75)',fontSize:'0.8rem',marginTop:'0.25rem'}}>📧 {profile?.email}</div>
        </div>

        <div style={{padding:'1.5rem',display:'flex',flexDirection:'column',gap:'1.25rem'}}>
          {/* Skills */}
          {profile?.skills?.length > 0 && (
            <div>
              <div style={{fontWeight:700,color:'#6c63ff',fontSize:'0.8rem',letterSpacing:'0.05em',marginBottom:'0.5rem'}}>⚡ SKILLS</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem'}}>
                {profile.skills.map(s=><span key={s} style={{padding:'3px 10px',borderRadius:99,background:'rgba(108,99,255,0.1)',border:'1px solid #6c63ff30',color:'#9aa3bf',fontSize:'0.75rem'}}>{s}</span>)}
              </div>
            </div>
          )}

          {/* Projects */}
          <div>
            <div style={{fontWeight:700,color:'#00d4aa',fontSize:'0.8rem',letterSpacing:'0.05em',marginBottom:'0.5rem'}}>🗂 PROJECTS ({projects.length})</div>
            {projects.length === 0 ? <div style={{color:'#5c6580',fontSize:'0.875rem'}}>No projects yet</div> :
              projects.slice(0,3).map(p=><div key={p._id} style={{color:'#9aa3bf',fontSize:'0.85rem',padding:'4px 0',borderBottom:'1px solid #252d47'}}>• {p.title}</div>)
            }
          </div>

          {/* Achievements */}
          <div>
            <div style={{fontWeight:700,color:'#ffb347',fontSize:'0.8rem',letterSpacing:'0.05em',marginBottom:'0.5rem'}}>🏆 ACHIEVEMENTS ({achievements.length})</div>
            {achievements.length === 0 ? <div style={{color:'#5c6580',fontSize:'0.875rem'}}>No achievements yet</div> :
              achievements.slice(0,3).map(a=><div key={a._id} style={{color:'#9aa3bf',fontSize:'0.85rem',padding:'4px 0',borderBottom:'1px solid #252d47'}}>• {a.title}</div>)
            }
          </div>
        </div>
      </div>

      <div style={{background:'rgba(108,99,255,0.08)',border:'1px solid #6c63ff30',borderRadius:12,padding:'1rem',marginBottom:'1.5rem',fontSize:'0.875rem',color:'#9aa3bf'}}>
        💡 Your resume is auto-generated from your profile. To improve it — add more skills in Profile, upload achievements, and join more projects!
      </div>

      <button
        onClick={generateResume}
        disabled={generating}
        style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,#6c63ff,#00d4aa)',border:'none',borderRadius:12,color:'#fff',fontWeight:800,fontSize:'1rem',cursor:'pointer'}}
      >
        {generating ? '⏳ Generating Resume...' : '⬇️ Download Resume (HTML)'}
      </button>

      <div style={{textAlign:'center',color:'#5c6580',fontSize:'0.75rem',marginTop:'0.75rem'}}>
        Opens in browser → Press Ctrl+P → Save as PDF
      </div>
    </div>
  );
}
