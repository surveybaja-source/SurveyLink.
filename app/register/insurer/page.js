'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import { COUNTRIES } from '../../../lib/locations'

export default function RegisterInsurer() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    email: '', password: '', confirm: '',
    first_name: '', last_name: '', company: '',
    country: '', city: '', phone: '',
    iban: '', bic: '', bank_name: '',
  })

  const u = k => v => setForm(p => ({...p,[k]:v}))

  const handleRegister = async () => {
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError(null)
    const { data, error: signUpError } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        role: 'insurer',
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        company: form.company,
        country: form.country,
        city: form.city,
        phone: form.phone,
        iban: form.iban,
        bic: form.bic,
        bank_name: form.bank_name,
        verified: false,
      })
      router.push('/pending-insurer')
    }
    setLoading(false)
  }

  const Inp = ({label,ph,val,set,type='text'}) => (
    <div style={{marginBottom:14}}>
      <label style={{display:'block',color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>{label}</label>
      <input type={type} placeholder={ph} value={val} onChange={e=>set(e.target.value)}
        style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 14px',color:'#fff',fontSize:14,boxSizing:'border-box',outline:'none'}}/>
    </div>
  )

  const steps = ['Account','Identity','Location','Banking']

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:480}}>

        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{color:'#fff',fontWeight:900,fontSize:36,letterSpacing:'0.08em',fontFamily:'var(--font-raleway)'}}>
            INSPE<span style={{color:'#dd2e1e'}}>LINK</span>
          </div>
          <div style={{color:'#8fa8c0',fontSize:13,marginTop:6}}>Register as Insurer / P&I</div>
        </div>

        <div style={{display:'flex',gap:4,marginBottom:24,justifyContent:'center'}}>
          {steps.map((s,i)=>(
            <div key={s} style={{display:'flex',alignItems:'center',gap:4}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:step>i+1?'#2e7d32':step===i+1?'#dd2e1e':'#1e3a52',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff'}}>
                {step>i+1?'✓':i+1}
              </div>
              <span style={{color:step===i+1?'#fff':'#4a6880',fontSize:10,fontWeight:step===i+1?700:400}}>{s}</span>
              {i<steps.length-1&&<div style={{width:20,height:1,background:'#1e3a52',margin:'0 4px'}}/>}
            </div>
          ))}
        </div>

        <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:16,padding:28,boxShadow:'0 8px 32px rgba(0,0,0,0.3)'}}>
          {error&&<div style={{background:'rgba(221,46,30,0.1)',border:'1px solid #dd2e1e',borderRadius:8,padding:'10px 14px',marginBottom:16,color:'#dd2e1e',fontSize:13}}>{error}</div>}

          {step===1&&(
            <div>
              <h3 style={{color:'#fff',fontWeight:800,fontSize:18,marginTop:0,marginBottom:20}}>Account Details</h3>
              <Inp label="Email" ph="your@email.com" val={form.email} set={u('email')} type="email"/>
              <Inp label="Password" ph="Min. 8 characters" val={form.password} set={u('password')} type="password"/>
              <Inp label="Confirm Password" ph="Repeat password" val={form.confirm} set={u('confirm')} type="password"/>
            </div>
          )}

          {step===2&&(
            <div>
              <h3 style={{color:'#fff',fontWeight:800,fontSize:18,marginTop:0,marginBottom:20}}>Your Identity</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp label="First Name" ph="John" val={form.first_name} set={u('first_name')}/>
                <Inp label="Last Name" ph="Smith" val={form.last_name} set={u('last_name')}/>
              </div>
              <Inp label="Company Name" ph="Your company" val={form.company} set={u('company')}/>
              <Inp label="Phone / WhatsApp" ph="+1 234 567 8900" val={form.phone} set={u('phone')}/>
            </div>
          )}

          {step===3&&(
            <div>
              <h3 style={{color:'#fff',fontWeight:800,fontSize:18,marginTop:0,marginBottom:20}}>Location</h3>
              <div style={{marginBottom:14}}>
                <label style={{display:'block',color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>Country</label>
                <select value={form.country} onChange={e=>u('country')(e.target.value)}
                  style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 14px',color:form.country?'#fff':'#4a6880',fontSize:14,boxSizing:'border-box'}}>
                  <option value="">Select country...</option>
                  {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Inp label="City" ph="City" val={form.city} set={u('city')}/>
            </div>
          )}

          {step===4&&(
            <div>
              <h3 style={{color:'#fff',fontWeight:800,fontSize:18,marginTop:0,marginBottom:8}}>Banking Information</h3>
              <p style={{color:'#8fa8c0',fontSize:12,marginBottom:20,lineHeight:1.6}}>Optional — used for potential refunds or platform transactions.</p>
              <Inp label="IBAN" ph="IBAN (optional)" val={form.iban} set={u('iban')}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp label="BIC / SWIFT" ph="BIC" val={form.bic} set={u('bic')}/>
                <Inp label="Bank Name" ph="Bank" val={form.bank_name} set={u('bank_name')}/>
              </div>
            </div>
          )}

          <div style={{display:'flex',gap:10,marginTop:20}}>
            {step>1&&(
              <button onClick={()=>setStep(s=>s-1)}
                style={{flex:1,background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'12px',cursor:'pointer',fontWeight:600,fontSize:14}}>
                Back
              </button>
            )}
            {step<4?(
              <button onClick={()=>{setError(null);setStep(s=>s+1)}}
                style={{flex:2,background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'12px',cursor:'pointer',fontWeight:700,fontSize:14}}>
                Continue
              </button>
            ):(
              <button onClick={handleRegister} disabled={loading}
                style={{flex:2,background:loading?'rgba(46,125,50,0.45)':'#2e7d32',color:'#fff',border:'none',borderRadius:7,padding:'12px',cursor:'pointer',fontWeight:700,fontSize:14}}>
                {loading?'Creating account...':'Create Account'}
              </button>
            )}
          </div>

          <div style={{marginTop:20,paddingTop:16,borderTop:'1px solid #1e3a52',textAlign:'center'}}>
            <span style={{color:'#8fa8c0',fontSize:12}}>Already have an account? </span>
            <button onClick={()=>router.push('/auth')} style={{background:'none',border:'none',color:'#dd2e1e',cursor:'pointer',fontSize:12,fontWeight:700}}>Sign In</button>
          </div>
        </div>

        <p style={{color:'#4a6880',fontSize:11,textAlign:'center',marginTop:16}}>
          © 2026 INSPELINK — Marine Cargo Survey Platform
        </p>
      </div>
    </div>
  )
}
