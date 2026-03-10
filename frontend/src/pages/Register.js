import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  'Aerospace Engineering','Biomedical Engineering','Biotechnology',
  'Chemical Engineering','Civil Engineering','Computer Science and Engineering',
  'Computer Science (AI & ML)','Computer Science (Data Science)','Cyber Security',
  'Electrical and Electronics Engineering','Electronics and Communication Engineering',
  'Information Technology','Marine Engineering','Mechanical Engineering',
  'Robotics and Automation','Other'
];

const DESIGNATIONS = [
  'Assistant Professor','Associate Professor','Professor',
  'Senior Professor','Head of Department','Dean','Director','Research Scholar'
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name:'', email:'', password:'', confirmPassword:'', role:'student',
    department:'', year:'', designation:'', skills:'', regNumber:''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const s = (k, v) => setForm(f => ({...f, [k]: v}));

  const validateStep1 = () => {
    if (!form.name.trim()) return 'Please enter your full name';
    if (!form.email.trim()) return 'Please enter your email';
    if (!form.email.includes('@')) return 'Please enter a valid email';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!form.department) { setError('Please select your department'); return; }
    setError(''); setLoading(true);
    try {
      const payload = {
        name: form.name, email: form.email, password: form.password,
        role: form.role, department: form.department,
        year: form.role === 'student' ? form.year : undefined,
        designation: form.role === 'staff' ? form.designation : undefined,
        skills: form.role === 'student' ? form.skills.split(',').map(s=>s.trim()).filter(Boolean) : [],
        expertise: form.role === 'staff' ? form.skills.split(',').map(s=>s.trim()).filter(Boolean) : [],
      };
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg, #0a0d14 0%, #0f1320 50%, #141826 100%)',padding:'2rem'}}>
      <div style={{width:'100%',maxWidth:480}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{width:60,height:60,borderRadius:16,background:'linear-gradient(135deg, #6c63ff, #00d4aa)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem',fontSize:'1.5rem'}}>⟡</div>
          <h1 style={{fontWeight:900,fontSize:'1.5rem',marginBottom:'0.25rem'}}>
            <span style={{color:'#6c63ff'}}>SIST</span> SkillConnect
          </h1>
          <p style={{color:'#9aa3bf',fontSize:'0.875rem'}}>Create your account — Step {step} of 2</p>
          {/* Progress bar */}
          <div style={{width:'100%',height:4,background:'#252d47',borderRadius:99,marginTop:'1rem'}}>
            <div style={{width:step===1?'50%':'100%',height:'100%',background:'linear-gradient(90deg, #6c63ff, #00d4aa)',borderRadius:99,transition:'width 0.3s ease'}} />
          </div>
        </div>

        <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,padding:'2rem'}}>
          {error && <div style={{background:'#ff575720',border:'1px solid #ff5757',borderRadius:8,padding:'12px',marginBottom:'1rem',color:'#ff5757',fontSize:'0.875rem'}}>{error}</div>}

          {step === 1 && (
            <>
              <Field label="Full Name" value={form.name} onChange={v=>s('name',v)} placeholder="e.g. Arjun Mehta" />
              <Field label="College Email" type="email" value={form.email} onChange={v=>s('email',v)} placeholder="yourname@sathyabama.ac.in" />
              <Field label="Password" type="password" value={form.password} onChange={v=>s('password',v)} placeholder="Min 6 characters" />
              <Field label="Confirm Password" type="password" value={form.confirmPassword} onChange={v=>s('confirmPassword',v)} placeholder="Re-enter password" />
              
              <div style={{marginBottom:'1.25rem'}}>
                <label style={labelStyle}>I am a...</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                  {[{val:'student',icon:'🎓',label:'Student'},{val:'staff',icon:'👨‍🏫',label:'Faculty / Staff'}].map(r => (
                    <button key={r.val} onClick={()=>s('role',r.val)} style={{padding:'14px',borderRadius:10,border:`2px solid ${form.role===r.val?'#6c63ff':'#252d47'}`,background:form.role===r.val?'rgba(108,99,255,0.1)':'transparent',color:form.role===r.val?'#6c63ff':'#9aa3bf',fontWeight:600,cursor:'pointer',fontSize:'0.9rem'}}>
                      <div style={{fontSize:'1.5rem',marginBottom:'4px'}}>{r.icon}</div>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleNext} style={btnStyle}>Next →</button>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{marginBottom:'1rem'}}>
                <label style={labelStyle}>Department</label>
                <select value={form.department} onChange={e=>s('department',e.target.value)} style={{...inputStyle,width:'100%'}}>
                  <option value="">Select your department</option>
                  {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {form.role === 'student' && (
                <>
                  <div style={{marginBottom:'1rem'}}>
                    <label style={labelStyle}>Year of Study</label>
                    <select value={form.year} onChange={e=>s('year',e.target.value)} style={{...inputStyle,width:'100%'}}>
                      <option value="">Select year</option>
                      {['1st Year','2nd Year','3rd Year','4th Year'].map(y=><option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <Field label="Your Skills (comma separated)" value={form.skills} onChange={v=>s('skills',v)} placeholder="Python, Machine Learning, React, Java" />
                </>
              )}

              {form.role === 'staff' && (
                <>
                  <div style={{marginBottom:'1rem'}}>
                    <label style={labelStyle}>Designation</label>
                    <select value={form.designation} onChange={e=>s('designation',e.target.value)} style={{...inputStyle,width:'100%'}}>
                      <option value="">Select designation</option>
                      {DESIGNATIONS.map(d=><option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <Field label="Areas of Expertise (comma separated)" value={form.skills} onChange={v=>s('skills',v)} placeholder="AI, Deep Learning, Computer Vision" />
                </>
              )}

              <div style={{background:'rgba(108,99,255,0.08)',border:'1px solid rgba(108,99,255,0.2)',borderRadius:10,padding:'12px',marginBottom:'1rem',fontSize:'0.8rem',color:'#9aa3bf'}}>
                ℹ️ After registration, your profile will be visible to faculty/students. You can complete your profile from the Profile page.
              </div>

              <div style={{display:'flex',gap:'0.75rem'}}>
                <button onClick={()=>{setStep(1);setError('');}} style={{...btnStyle,background:'transparent',border:'1px solid #252d47',color:'#9aa3bf',flex:0.4}}>← Back</button>
                <button onClick={handleSubmit} disabled={loading} style={{...btnStyle,flex:1}}>{loading?'Creating Account...':'Create Account 🚀'}</button>
              </div>
            </>
          )}
        </div>

        <p style={{textAlign:'center',marginTop:'1.5rem',color:'#9aa3bf',fontSize:'0.875rem'}}>
          Already have an account? <Link to="/login" style={{color:'#6c63ff',fontWeight:600}}>Sign in</Link>
        </p>
        <p style={{textAlign:'center',marginTop:'0.5rem',color:'#5c6580',fontSize:'0.75rem'}}>
          © 2026 Sathyabama Institute of Science and Technology
        </p>
      </div>
    </div>
  );
}

function Field({ label, type='text', value, onChange, placeholder }) {
  return (
    <div style={{marginBottom:'1rem'}}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{...inputStyle,width:'100%',boxSizing:'border-box'}} />
    </div>
  );
}

const labelStyle = {display:'block',marginBottom:'6px',fontSize:'0.875rem',fontWeight:600,color:'#9aa3bf'};
const inputStyle = {padding:'11px 14px',background:'#0f1320',border:'1px solid #252d47',borderRadius:8,color:'#e8eaf0',fontSize:'0.9rem',outline:'none'};
const btnStyle = {width:'100%',padding:'13px',background:'linear-gradient(135deg, #6c63ff, #8b85ff)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:'1rem',cursor:'pointer'};
