'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:420}}>

        <div style={{color:'#fff',fontWeight:900,fontSize:42,letterSpacing:'0.08em',fontFamily:'var(--font-raleway)'}}>
  INSPE<span style={{color:'#dd2e1e'}}>LINK</span>
</div>

          <div style={{color:'#8fa8c0',fontSize:14,marginTop:8}}>Marine Cargo Survey Platform</div>
        </div>

        <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:16,padding:32,boxShadow:'0 8px 32px rgba(0,0,0,0.3)'}}>
          <h2 style={{color:'#fff',fontWeight:800,fontSize:22,marginBottom:6,marginTop:0}}>Sign in</h2>
          <p style={{color:'#8fa8c0',fontSize:13,marginBottom:24}}>Access your INSPELINK account</p>

          {error&&<div style={{background:'rgba(221,46,30,0.1)',border:'1px solid #dd2e1e',borderRadius:8,padding:'10px 14px',marginBottom:16,color:'#dd2e1e',fontSize:13}}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div style={{marginBottom:14}}>
              <label style={{display:'block',color:'#8fa8c0',fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>Email</label>
              <input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} required
                style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 14px',color:'#fff',fontSize:14,boxSizing:'border-box',outline:'none'}}/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{display:'block',color:'#8fa8c0',fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required
                style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 14px',color:'#fff',fontSize:14,boxSizing:'border-box',outline:'none'}}/>
            </div>
            <button type="submit" disabled={loading}
              style={{width:'100%',background:loading?'rgba(221,46,30,0.5)':'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'13px',cursor:'pointer',fontWeight:700,fontSize:14}}>
              {loading?'Signing in...':'Sign In'}
            </button>
          </form>

          <div style={{marginTop:24,paddingTop:20,borderTop:'1px solid #1e3a52'}}>
            <p style={{color:'#8fa8c0',fontSize:13,textAlign:'center',marginBottom:12}}>Don't have an account?</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <button onClick={()=>router.push('/register/insurer')}
                style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'10px',cursor:'pointer',fontWeight:700,fontSize:12,textAlign:'center'}}>
                Register as Insurer
              </button>
              <button onClick={()=>router.push('/register/expert')}
                style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'10px',cursor:'pointer',fontWeight:700,fontSize:12,textAlign:'center'}}>
                Register as Surveyor
              </button>
            </div>
          </div>
        </div>

        <p style={{color:'#4a6880',fontSize:11,textAlign:'center',marginTop:20}}>
          © 2026 INSPELINK — Marine Cargo Survey Platform
        </p>
      </div>
    </div>
  )
}
