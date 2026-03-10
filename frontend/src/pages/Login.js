import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [roleHint, setRoleHint] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your email and password.');
    }
    setLoading(false);
  };

  const roles = [
    {
      icon: '🎓',
      title: 'Student',
      desc: 'Browse and apply for research projects',
      color: '#00d4aa',
      hint: 'student'
    },
    {
      icon: '👨‍🏫',
      title: 'Faculty / Staff',
      desc: 'Post projects and manage student requests',
      color: '#6c63ff',
      hint: 'staff'
    },
    {
      icon: '⚙️',
      title: 'Admin',
      desc: 'Manage all users and projects',
      color: '#ff6b9d',
      hint: 'admin'
    },
  ];

  return (
    <div style={{minHeight:'100vh',display:'flex',background:'#0a0d14'}}>

      {/* Left Panel - Branding */}
      <div style={{flex:'0 0 420px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'linear-gradient(160deg, #0f1320 0%, #141826 100%)',borderRight:'1px solid #252d47',padding:'3rem',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-80,left:-80,width:350,height:350,borderRadius:'50%',background:'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)'}} />
        <div style={{position:'absolute',bottom:-60,right:-60,width:280,height:280,borderRadius:'50%',background:'radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)'}} />

        <div style={{textAlign:'center',zIndex:1,width:'100%'}}>
          {/* Logo */}
          <div style={{width:90,height:90,borderRadius:24,background:'linear-gradient(135deg, #6c63ff, #00d4aa)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.5rem',fontSize:'2.5rem',boxShadow:'0 8px 40px rgba(108,99,255,0.35)'}}>⟡</div>
          
          <div style={{marginBottom:'2rem'}}>
            <div style={{fontWeight:900,fontSize:'2.2rem',color:'#6c63ff',letterSpacing:'0.05em',lineHeight:1}}>SIST</div>
            <div style={{fontWeight:800,fontSize:'1.6rem',color:'#e8eaf0',letterSpacing:'-0.5px',lineHeight:1.2}}>SkillConnect</div>
            <div style={{color:'#5c6580',fontSize:'0.8rem',marginTop:'0.5rem',letterSpacing:'0.03em'}}>SATHYABAMA INSTITUTE OF SCIENCE AND TECHNOLOGY</div>
          </div>

          <div style={{width:'100%',height:'1px',background:'linear-gradient(90deg, transparent, #252d47, transparent)',marginBottom:'2rem'}} />

          {/* Role Cards */}
          <div style={{marginBottom:'2rem'}}>
            <p style={{color:'#9aa3bf',fontSize:'0.85rem',marginBottom:'1rem',fontWeight:500}}>This platform is for:</p>
            {roles.map((r, i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 16px',background:roleHint===r.hint?`${r.color}10`:'rgba(255,255,255,0.02)',borderRadius:12,border:`1px solid ${roleHint===r.hint?r.color+'40':'rgba(255,255,255,0.05)'}`,marginBottom:'0.6rem',textAlign:'left',transition:'all 0.2s',cursor:'pointer'}} onClick={()=>setRoleHint(r.hint)}>
                <div style={{width:40,height:40,borderRadius:10,background:`${r.color}15`,border:`1px solid ${r.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0}}>{r.icon}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:'0.875rem',color:roleHint===r.hint?r.color:'#e8eaf0'}}>{r.title}</div>
                  <div style={{fontSize:'0.75rem',color:'#5c6580'}}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <p style={{color:'#5c6580',fontSize:'0.75rem'}}>© 2026 Sathyabama Institute of Science and Technology</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'3rem'}}>
        <div style={{width:'100%',maxWidth:400}}>
          
          <div style={{marginBottom:'2rem'}}>
            <h2 style={{fontWeight:800,fontSize:'2rem',marginBottom:'0.5rem'}}>Sign In</h2>
            <p style={{color:'#9aa3bf'}}>
              {roleHint === 'student' && '🎓 Signing in as Student'}
              {roleHint === 'staff' && '👨‍🏫 Signing in as Faculty/Staff'}
              {roleHint === 'admin' && '⚙️ Signing in as Admin'}
              {!roleHint && 'Welcome back to SIST SkillConnect'}
            </p>
          </div>

          {/* How to login info box */}
          <div style={{background:'rgba(108,99,255,0.06)',border:'1px solid rgba(108,99,255,0.15)',borderRadius:12,padding:'1rem',marginBottom:'1.5rem'}}>
            <div style={{fontWeight:700,fontSize:'0.8rem',color:'#6c63ff',marginBottom:'0.5rem'}}>ℹ️ How to login:</div>
            <div style={{fontSize:'0.8rem',color:'#9aa3bf',lineHeight:1.8}}>
              <div>🎓 <strong style={{color:'#e8eaf0'}}>Students & Faculty</strong> — Register first, then login</div>
              <div>⚙️ <strong style={{color:'#e8eaf0'}}>Admin</strong> — Use your admin credentials</div>
              <div style={{marginTop:'0.5rem',padding:'8px',background:'rgba(0,0,0,0.2)',borderRadius:8,fontSize:'0.75rem'}}>
                New user? Click <strong style={{color:'#6c63ff'}}>"Create Account"</strong> below to register
              </div>
            </div>
          </div>

          <div style={{background:'#161c2e',border:'1px solid #252d47',borderRadius:16,padding:'2rem'}}>
            {error && (
              <div style={{background:'#ff575720',border:'1px solid #ff5757',borderRadius:8,padding:'12px',marginBottom:'1rem',color:'#ff5757',fontSize:'0.875rem'}}>
                ⚠️ {error}
              </div>
            )}

            <div style={{marginBottom:'1.25rem'}}>
              <label style={labelStyle}>Your College Email</label>
              <input
                value={form.email}
                onChange={e=>setForm({...form,email:e.target.value})}
                type="email"
                placeholder="yourname@sathyabama.ac.in"
                style={inputStyle}
                onKeyDown={e=>e.key==='Enter'&&handleSubmit(e)}
              />
            </div>

            <div style={{marginBottom:'1.5rem'}}>
              <label style={labelStyle}>Password</label>
              <input
                value={form.password}
                onChange={e=>setForm({...form,password:e.target.value})}
                type="password"
                placeholder="Enter your password"
                style={inputStyle}
                onKeyDown={e=>e.key==='Enter'&&handleSubmit(e)}
              />
            </div>

            <button onClick={handleSubmit} disabled={loading} style={btnStyle}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </div>

          {/* Register links */}
          <div style={{marginTop:'1.5rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
            <Link to="/register" style={{display:'block',padding:'12px',background:'rgba(0,212,170,0.08)',border:'1px solid rgba(0,212,170,0.2)',borderRadius:12,textAlign:'center',textDecoration:'none'}}>
              <div style={{fontSize:'1.2rem',marginBottom:'4px'}}>🎓</div>
              <div style={{fontWeight:700,fontSize:'0.8rem',color:'#00d4aa'}}>Student Register</div>
              <div style={{fontSize:'0.7rem',color:'#5c6580'}}>New student? Sign up</div>
            </Link>
            <Link to="/register" style={{display:'block',padding:'12px',background:'rgba(108,99,255,0.08)',border:'1px solid rgba(108,99,255,0.2)',borderRadius:12,textAlign:'center',textDecoration:'none'}}>
              <div style={{fontSize:'1.2rem',marginBottom:'4px'}}>👨‍🏫</div>
              <div style={{fontWeight:700,fontSize:'0.8rem',color:'#6c63ff'}}>Faculty Register</div>
              <div style={{fontSize:'0.7rem',color:'#5c6580'}}>New faculty? Sign up</div>
            </Link>
          </div>

          <p style={{textAlign:'center',marginTop:'1rem',color:'#5c6580',fontSize:'0.75rem'}}>
            © 2026 Sathyabama Institute of Science and Technology
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {display:'block',marginBottom:'6px',fontSize:'0.875rem',fontWeight:600,color:'#9aa3bf'};
const inputStyle = {width:'100%',padding:'11px 14px',background:'#0f1320',border:'1px solid #252d47',borderRadius:8,color:'#e8eaf0',fontSize:'0.9rem',outline:'none',boxSizing:'border-box'};
const btnStyle = {width:'100%',padding:'13px',background:'linear-gradient(135deg, #6c63ff, #8b85ff)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:'1rem',cursor:'pointer'};
