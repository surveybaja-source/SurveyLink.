'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  const handleRegister = async () => {
    if (!role) { setError('Veuillez choisir un role'); return }
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    await supabase.from('profiles').insert({ id: data.user.id, email, role })
    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0c1a27',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:32,width:400}}>
        <h2 style={{color:'#fff',fontFamily:'sans-serif',marginBottom:4,fontSize:26,fontWeight:900}}>
          SurveyLink
        </h2>
        <p style={{color:'#4a6880',fontSize:11,marginBottom:24}}>Marine Cargo Survey Platform</p>
        {error && <p style={{color:'#dd2e1e',fontSize:13,marginBottom:12}}>{error}</p>}
        {mode === 'login' ? (
          <div>
            <input id="email" name="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
              style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',marginBottom:12,boxSizing:'border-box'}}/>
            <input id="password" name="password" type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)}
              style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',marginBottom:16,boxSizing:'border-box'}}/>
            <button onClick={handleLogin} disabled={loading}
              style={{width:'100%',background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px',marginBottom:8,cursor:'pointer',fontWeight:700}}>
              {loading ? 'Chargement...' : 'Se connecter'}
            </button>
            <div style={{textAlign:'center',marginTop:16}}>
              <span style={{color:'#4a6880',fontSize:12}}>Pas de compte ? </span>
              <span onClick={()=>setMode('register')} style={{color:'#dd2e1e',fontSize:12,cursor:'pointer',fontWeight:700}}>Creer un compte</span>
            </div>
          </div>
        ) : (
          <div>
            <p style={{color:'#8fa8c0',fontSize:13,marginBottom:16}}>Je rejoins en tant que...</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div onClick={()=>setRole('insurer')} style={{background:role==='insurer'?'rgba(221,46,30,0.1)':'#0f1e2e',border:role==='insurer'?'2px solid #dd2e1e':'2px solid #1e3a52',borderRadius:10,padding:16,cursor:'pointer',textAlign:'center'}}>
                <div style={{fontSize:28,marginBottom:8}}>🏢</div>
                <div style={{color:'#fff',fontWeight:700,fontSize:13}}>Insurer</div>
              </div>
              <div onClick={()=>setRole('expert')} style={{background:role==='expert'?'rgba(221,46,30,0.1)':'#0f1e2e',border:role==='expert'?'2px solid #dd2e1e':'2px solid #1e3a52',borderRadius:10,padding:16,cursor:'pointer',textAlign:'center'}}>
                <div style={{fontSize:28,marginBottom:8}}>🔍</div>
                <div style={{color:'#fff',fontWeight:700,fontSize:13}}>Surveyor</div>
              </div>
            </div>
            <input id="email2" name="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
              style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',marginBottom:12,boxSizing:'border-box'}}/>
            <input id="password2" name="password" type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)}
              style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',marginBottom:16,boxSizing:'border-box'}}/>
            <button onClick={handleRegister} disabled={loading}
              style={{width:'100%',background:'#2e7d32',color:'#fff',border:'none',borderRadius:7,padding:'11px',cursor:'pointer',fontWeight:700}}>
              {loading ? 'Creation...' : 'Creer mon compte'}
            </button>
            <div style={{textAlign:'center',marginTop:12}}>
              <span onClick={()=>setMode('login')} style={{color:'#4a6880',fontSize:12,cursor:'pointer'}}>Retour connexion</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
