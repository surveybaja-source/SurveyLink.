'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import { COUNTRIES } from '../../../lib/locations'

const Inp = ({label, ph, val, set, type='text'}) => (
  <div style={{marginBottom:14}}>
    <label style={{display:'block',color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>{label}</label>
    <input type={type} placeholder={ph} value={val} onChange={e=>set(e.target.value)}
      style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 14px',color:'#fff',fontSize:14,boxSizing:'border-box',outline:'none'}}/>
  </div>
)

const Chk = ({items, selected, toggle}) => (
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:8}}>
    {items.map(item=>{
      const a = selected.includes(item)
      return (
        <div key={item} onClick={()=>toggle(item)}
          style={{background:a?'rgba(46,125,50,0.12)':'#0f1e2e',border:a?'1px solid #2e7d32':'1px solid #1e3a52',borderRadius:6,padding:'7px 10px',cursor:'pointer',color:a?'#81c784':'#8fa8c0',fontSize:11,display:'flex',alignItems:'center',gap:6,userSelect:'none'}}>
          <span style={{fontSize:10,color:a?'#2e7d32':'#4a6880'}}>✓</span>{item}
        </div>
      )
    })}
  </div>
)

export default function RegisterExpert() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadedDocs, setUploadedDocs] = useState([])
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    email: '', password: '', confirm: '',
    first_name: '', last_name: '', company: '',
    country: '', city: '', phone: '',
    bio: '', day_rate: '', currency: 'EUR',
    iban: '', bic: '', bank_name: '',
  })

  const [languages, setLanguages] = useState([])
  const [certifications, setCertifications] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [coverage, setCoverage] = useState([])

  const u = k => v => setForm(p => ({...p,[k]:v}))
  const tog = setter => item => setter(p => p.includes(item)?p.filter(x=>x!==item):[...p,item])

  const LANGUAGES = ['English','French','Spanish','Dutch','German','Italian','Portuguese','Arabic','Mandarin','Japanese','Russian','Other']
  const CERTIFICATIONS = ['CESAM','Lloyds Accredited','IFIA','FOSFA','GAFTA','ISO 17020','Bureau Veritas','SGS','Intertek','P&I Club Panel','IMO IMSBC','STCW']
  const SPECIALTIES = ['Bulk Cargo Surveys','Container FCL Surveys','Container LCL Surveys','Reefer / Cold Chain Surveys','Tanker / Liquid Bulk Surveys','Petroleum & Oil Surveys','Chemical Tanker Surveys','Heavy Lift Surveys','Project Cargo Surveys','Dangerous Goods (IMDG)','RoRo Cargo Surveys','Breakbulk Surveys','Fumigation Supervision','Sampling & Analysis','Draft / Weight Surveys','On-Hire / Off-Hire Surveys']

  const handleDocUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    const results = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const filename = `pending/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error: uploadError } = await supabase.storage
        .from('expert-docs')
        .upload(filename, file, { cacheControl: '3600', upsert: false })
      if (!uploadError) {
        results.push({ path: data.path, name: file.name })
      }
    }
    setUploadedDocs(p => [...p, ...results])
    setUploading(false)
  }

  const handleRegister = async () => {
    setLoading(true)
    setError(null)
    const { data, error: signUpError } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        role: 'expert',
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        company: form.company,
        country: form.country,
        city: form.city,
        phone: form.phone,
        bio: form.bio,
        day_rate: form.day_rate ? parseFloat(form.day_rate) : null,
        currency: form.currency,
        iban: form.iban,
        bic: form.bic,
        bank_name: form.bank_name,
        languages,
        certifications,
        specialties,
        coverage_countries: coverage,
        verified: false,
        average_rating: 0,
        total_ratings: 0,
        certification_docs: uploadedDocs.map(d => d.path),
      })
      router.push('/pending')
    }
    setLoading(false)
  }

  const steps = ['Account','Identity','Expertise','Coverage','Banking','Documents']

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:520}}>

        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{color:'#fff',fontWeight:900,fontSize:36,letterSpacing:'0.08em',fontFamily:'var(--font-raleway)'}}>
            INSPE<span style={{color:'#dd2e1e'}}>LINK</span>
          </div>
          <div style={{color:'#8fa8c0',fontSize:13,marginTop:6}}>Register as Cargo Surveyor</div>
        </div>

        <div style={{display:'flex',gap:4,marginBottom:24,justifyContent:'center',flexWrap:'wrap'}}>
          {steps.map((s,i)=>(
            <div key={s} style={{display:'flex',alignItems:'center',gap:4}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:step>i+1?'#2e7d32':step===i+1?'#dd2e1e':'#1e3a52',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff'}}>
                {step>i+1?'✓':i+1}
              </div>
              <span style={{color:step===i+1?'#fff':'#4a6880',fontSize:10,fontWeight:step===i+1?700:400}}>{s}</span>
              {i<steps.length-1&&<div style={{width:12,height:1,background:'#1e3a52',margin:'0 2px'}}/>}
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
              <Inp label="Company / Trading Name" ph="Your company or full name" val={form.company} set={u('company')}/>
              <Inp label="Phone / WhatsApp" ph="+1 234 567 8900" val={form.phone} set={u('phone')}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div style={{marginBottom:14}}>
                  <label style={{display:'block',color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>Country</label>
                  <select value={form.country} onChange={e=>u('country')(e.target.value)}
                    style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 14px',color:form.country?'#fff':'#4a6880',fontSize:14,boxSizing:'border-box'}}>
                    <option value="">Select...</option>
                    {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <Inp label="City" ph="City" val={form.city} set={u('city')}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:12}}>
                <Inp label="Standard Day Rate" ph="e.g. 1200" val={form.day_rate} set={u('day_rate')}/>
                <div style={{marginBottom:14}}>
                  <label style={{display:'block',color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>Currency</label>
                  <select value={form.currency} onChange={e=>u('currency')(e.target.value)}
                    style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 14px',color:'#fff',fontSize:14,boxSizing:'border-box'}}>
                    {['EUR','USD','GBP','SGD','AED','CHF'].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <label style={{display:'block',color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>Professional Bio</label>
                <textarea placeholder="Describe your background and expertise..." value={form.bio} onChange={e=>u('bio')(e.target.value)} rows={3}
                  style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 14px',color:'#fff',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/>
              </div>
            </div>
          )}

          {step===3&&(
            <div>
              <h3 style={{color:'#fff',fontWeight:800,fontSize:18,marginTop:0,marginBottom:6}}>Expertise</h3>
              <p style={{color:'#8fa8c0',fontSize:12,marginBottom:16}}>Select all that apply</p>
              <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8}}>Survey Specialties</div>
              <Chk items={SPECIALTIES} selected={specialties} toggle={tog(setSpecialties)}/>
              <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8,marginTop:16}}>Certifications</div>
              <Chk items={CERTIFICATIONS} selected={certifications} toggle={tog(setCertifications)}/>
              <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8,marginTop:16}}>Languages</div>
              <Chk items={LANGUAGES} selected={languages} toggle={tog(setLanguages)}/>
            </div>
          )}

          {step===4&&(
            <div>
              <h3 style={{color:'#fff',fontWeight:800,fontSize:18,marginTop:0,marginBottom:6}}>Geographic Coverage</h3>
              <p style={{color:'#8fa8c0',fontSize:12,marginBottom:16}}>Select all countries where you are available to conduct surveys.</p>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                <span style={{color:'#4a6880',fontSize:11}}>{coverage.length} countries selected</span>
                <button onClick={()=>setCoverage([])} style={{background:'transparent',color:'#dd2e1e',border:'none',cursor:'pointer',fontSize:11}}>Clear all</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,maxHeight:320,overflowY:'auto'}}>
                {COUNTRIES.map(country=>{
                  const a = coverage.includes(country)
                  return (
                    <div key={country} onClick={()=>tog(setCoverage)(country)}
                      style={{background:a?'rgba(46,125,50,0.12)':'#0f1e2e',border:a?'1px solid #2e7d32':'1px solid #1e3a52',borderRadius:6,padding:'6px 10px',cursor:'pointer',color:a?'#81c784':'#8fa8c0',fontSize:11,display:'flex',alignItems:'center',gap:6,userSelect:'none'}}>
                      <span style={{fontSize:10,color:a?'#2e7d32':'#4a6880'}}>✓</span>{country}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {step===5&&(
            <div>
              <h3 style={{color:'#fff',fontWeight:800,fontSize:18,marginTop:0,marginBottom:8}}>Banking Information</h3>
              <p style={{color:'#8fa8c0',fontSize:12,marginBottom:20,lineHeight:1.6}}>Required for receiving payments. Your banking details are encrypted and secure.</p>
              <Inp label="IBAN" ph="IBAN" val={form.iban} set={u('iban')}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp label="BIC / SWIFT" ph="BIC" val={form.bic} set={u('bic')}/>
                <Inp label="Bank Name" ph="Bank" val={form.bank_name} set={u('bank_name')}/>
              </div>
              <div style={{background:'rgba(46,125,50,0.08)',border:'1px solid #2e7d32',borderRadius:8,padding:'11px 14px',marginTop:8}}>
                <div style={{color:'#2e7d32',fontSize:11,fontWeight:700,marginBottom:4}}>Payment Schedule</div>
                <div style={{color:'#8fa8c0',fontSize:11,lineHeight:1.6}}>
                  20% deposit when a quote is accepted — 80% balance when the final report is uploaded. Automatic and secure via Stripe.
                </div>
              </div>
            </div>
          )}

          {step===6&&(
            <div>
              <h3 style={{color:'#fff',fontWeight:800,fontSize:18,marginTop:0,marginBottom:8}}>Certification Documents</h3>
              <p style={{color:'#8fa8c0',fontSize:12,marginBottom:20,lineHeight:1.6}}>
                Upload your certifications, licenses and any professional documents. Our team will review them to activate your account.
              </p>

              <div style={{background:'rgba(240,165,0,0.08)',border:'1px solid #f0a500',borderRadius:8,padding:'11px 14px',marginBottom:20,display:'flex',gap:10}}>
                <span>ℹ️</span>
                <span style={{color:'#8fa8c0',fontSize:11,lineHeight:1.5}}>
                  Accepted formats: PDF, JPG, PNG — Max 10MB per file. Examples: CESAM certificate, Lloyd's accreditation, IFIA membership, ID document.
                </span>
              </div>

              <label style={{
                display:'flex',alignItems:'center',justifyContent:'center',gap:10,
                background:'#0f1e2e',border:'2px dashed #1e3a52',borderRadius:8,
                padding:'20px 16px',cursor:'pointer',marginBottom:16,
              }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#dd2e1e'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='#1e3a52'}>
                <input type="file" multiple onChange={handleDocUpload} style={{display:'none'}}
                  accept=".pdf,.jpg,.jpeg,.png"/>
                <span style={{fontSize:24}}>{uploading?'⏳':'📎'}</span>
                <div>
                  <div style={{color:'#fff',fontSize:13,fontWeight:700}}>{uploading?'Uploading...':'Click to upload documents'}</div>
                  <div style={{color:'#4a6880',fontSize:11,marginTop:2}}>PDF, JPG, PNG — max 10MB each</div>
                </div>
              </label>

              {uploadedDocs.length > 0 && (
                <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:16}}>
                  {uploadedDocs.map((doc, i) => (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:8,background:'rgba(46,125,50,0.08)',border:'1px solid #2e7d32',borderRadius:6,padding:'8px 12px'}}>
                      <span>📄</span>
                      <span style={{color:'#81c784',fontSize:12,fontWeight:600,flex:1}}>{doc.name}</span>
                      <span style={{color:'#2e7d32',fontSize:10,fontWeight:700}}>✓ Uploaded</span>
                    </div>
                  ))}
                </div>
              )}

              {uploadedDocs.length === 0 && (
                <div style={{background:'rgba(221,46,30,0.08)',border:'1px solid #1e3a52',borderRadius:8,padding:'11px 14px',textAlign:'center'}}>
                  <span style={{color:'#8fa8c0',fontSize:12}}>No documents uploaded yet — you can skip this step and add them later from your profile.</span>
                </div>
              )}
            </div>
          )}

          <div style={{display:'flex',gap:10,marginTop:20}}>
            {step>1&&(
              <button onClick={()=>setStep(s=>s-1)}
                style={{flex:1,background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'12px',cursor:'pointer',fontWeight:600,fontSize:14}}>
                Back
              </button>
            )}
            {step<6?(
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
