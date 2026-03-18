'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function InsurerRegister() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const [f, setF] = useState({
    company:'',country:'',city:'',zip:'',address:'',regNum:'',vatNum:'',website:'',activityType:'',
    firstName:'',lastName:'',email:'',phone:'',jobTitle:'',password:'',password2:'',
    iban:'',bic:'',bankName:'',accountHolder:'',agreed:false
  })

  const u = k => v => setF(p => ({...p,[k]:v}))

  const STEPS = ['Company','Contact','Documents','Banking']
  const COUNTRIES = ['France','Belgium','Netherlands','Germany','United Kingdom','Spain','Italy','Singapore','UAE','China','United States','Other']
  const ACTIVITIES = ['Marine Insurer','P&I Club','Lloyd\'s Syndicate','Insurance Broker','Reinsurer','Average Adjuster','Other']

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({email:f.email,password:f.password})
    if (error) { setError(error.message); setLoading(false); return }
    await supabase.from('profiles').insert({
      id:data.user.id,role:'insurer',email:f.email,
      company:f.company,first_name:f.firstName,last_name:f.lastName,
      phone:f.phone,country:f.country,city:f.city,
      iban:f.iban,bic:f.bic,bank_name:f.bankName,verified:false
    })
    router.push('/pending-insurer')
    setLoading(false)
  }

  const Inp = ({id,ph,val,set,type='text'}) => (
    <div style={{marginBottom:12}}>
      <input id={id} name={id} type={type} placeholder={ph} value={val} onChange={e=>set(e.target.value)}
        style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13}}/>
    </div>
  )

  const Sel = ({id,opts,val,set}) => (
    <div style={{marginBottom:12}}>
      <select id={id} value={val} onChange={e=>set(e.target.value)}
        style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:val?'#fff':'#4a6880',boxSizing:'border-box',fontSize:13}}>
        <option value="">Select...</option>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  const SecT = ({text}) => (
    <div style={{color:'#fff',fontWeight:700,fontSize:13,letterSpacing:'0.08em',textTransform:'uppercase',margin:'20px 0 12px',paddingBottom:8,borderBottom:'1px solid #1e3a52'}}>{text}</div>
  )

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh',padding:'32px 24px'}}>
      <div style={{maxWidth:640,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
          <button onClick={()=>step>0?setStep(s=>s-1):router.push('/auth')}
            style={{background:'none',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 12px',color:'#8fa8c0',cursor:'pointer',fontSize:11}}>
            Back
          </button>
          <div>
            <div style={{color:'#4a6880',fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase'}}>Registration - Insurer / Broker</div>
            <div style={{color:'#fff',fontWeight:800,fontSize:22}}>Create your company account</div>
          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',marginBottom:28}}>
          {STEPS.map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',flex:i<STEPS.length-1?1:0}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:i<step?'#2e7d32':i===step?'#dd2e1e':'#132030',border:i<step?'2px solid #2e7d32':i===step?'2px solid #dd2e1e':'2px solid #1e3a52',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff'}}>
                  {i<step?'v':i+1}
                </div>
                <span style={{fontSize:9,color:i===step?'#dd2e1e':'#4a6880',textTransform:'uppercase',whiteSpace:'nowrap'}}>{s}</span>
              </div>
              {i<STEPS.length-1&&<div style={{flex:1,height:2,margin:'0 6px',marginTop:-16,background:i<step?'#2e7d32':'#1e3a52'}}/>}
            </div>
          ))}
        </div>

        <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:28}}>
          {step===0&&(
            <div>
              <SecT text="Company Information"/>
              <Inp id="company" ph="Company / Firm Name" val={f.company} set={u('company')}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Sel id="country" opts={COUNTRIES} val={f.country} set={u('country')}/>
                <Inp id="city" ph="City" val={f.city} set={u('city')}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'120px 1fr',gap:12}}>
                <Inp id="zip" ph="Postal Code" val={f.zip} set={u('zip')}/>
                <Inp id="address" ph="Street Address" val={f.address} set={u('address')}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp id="regNum" ph="Company Registration No." val={f.regNum} set={u('regNum')}/>
                <Inp id="vatNum" ph="VAT Number" val={f.vatNum} set={u('vatNum')}/>
              </div>
              <Inp id="website" ph="Website (e.g. https://www.company.com)" val={f.website} set={u('website')}/>
              <Sel id="activity" opts={ACTIVITIES} val={f.activityType} set={u('activityType')}/>
              <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
                <button onClick={()=>setStep(1)} disabled={!f.company||!f.country||!f.city}
                  style={{background:(!f.company||!f.country||!f.city)?'rgba(221,46,30,0.45)':'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step===1&&(
            <div>
              <SecT text="Contact Person"/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp id="firstName" ph="First Name" val={f.firstName} set={u('firstName')}/>
                <Inp id="lastName" ph="Last Name" val={f.lastName} set={u('lastName')}/>
              </div>
              <Inp id="jobTitle" ph="Job Title (e.g. Claims Manager)" val={f.jobTitle} set={u('jobTitle')}/>
              <Inp id="email" ph="Professional Email" val={f.email} set={u('email')} type="email"/>
              <Inp id="phone" ph="Phone Number" val={f.phone} set={u('phone')}/>
              <SecT text="Account Security"/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp id="pw" ph="Password (min. 6 chars)" val={f.password} set={u('password')} type="password"/>
                <Inp id="pw2" ph="Confirm Password" val={f.password2} set={u('password2')} type="password"/>
              </div>
              {f.password&&f.password2&&f.password!==f.password2&&(
                <p style={{color:'#dd2e1e',fontSize:11,marginBottom:12}}>Passwords do not match</p>
              )}
              <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
                <button onClick={()=>setStep(0)} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Back</button>
                <button onClick={()=>setStep(2)} disabled={!f.firstName||!f.lastName||!f.email||!f.password||f.password!==f.password2}
                  style={{background:(!f.firstName||!f.lastName||!f.email||!f.password||f.password!==f.password2)?'rgba(221,46,30,0.45)':'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step===2&&(
            <div>
              <SecT text="Legal Documents"/>
              <p style={{color:'#8fa8c0',fontSize:12,marginBottom:16,lineHeight:1.6}}>
                Required for account verification. PDF, JPG, PNG - max 5 MB each.
              </p>
              {['Company Registration Certificate','Insurance License / Regulatory Authorization','ID / Passport of Contact Person'].map(doc=>(
                <div key={doc} style={{marginBottom:10,background:'#0f1e2e',border:'2px dashed #1e3a52',borderRadius:8,padding:'12px 16px',display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>
                  <span style={{fontSize:18}}>📎</span>
                  <div>
                    <div style={{color:'#8fa8c0',fontSize:12}}>{doc}</div>
                    <div style={{color:'#4a6880',fontSize:10,marginTop:2}}>PDF, JPG or PNG - max 5 MB</div>
                  </div>
                </div>
              ))}
              <div style={{background:'rgba(221,46,30,0.08)',border:'1px solid #700300',borderRadius:8,padding:'11px 14px',marginTop:8,display:'flex',gap:10}}>
                <span>ℹ️</span>
                <span style={{color:'#8fa8c0',fontSize:11,lineHeight:1.5}}>Documents reviewed by our compliance team within 24 to 48 hours.</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
                <button onClick={()=>setStep(1)} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Back</button>
                <button onClick={()=>setStep(3)} style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>Next</button>
              </div>
            </div>
          )}

          {step===3&&(
            <div>
              <SecT text="Banking Information"/>
              <Inp id="holder" ph="Account Holder Name" val={f.accountHolder} set={u('accountHolder')}/>
              <Inp id="iban" ph="IBAN" val={f.iban} set={u('iban')}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp id="bic" ph="BIC / SWIFT Code" val={f.bic} set={u('bic')}/>
                <Inp id="bankName" ph="Bank Name" val={f.bankName} set={u('bankName')}/>
              </div>
              <div style={{background:'rgba(221,46,30,0.08)',border:'1px solid #700300',borderRadius:8,padding:'11px 14px',marginBottom:14,display:'flex',gap:10}}>
                <span>🔒</span>
                <span style={{color:'#8fa8c0',fontSize:11,lineHeight:1.5}}>
                  A 1% platform commission is applied to each validated mission. Payments via Stripe Connect.
                </span>
              </div>
              <div onClick={()=>setF(p=>({...p,agreed:!p.agreed}))}
                style={{display:'flex',alignItems:'flex-start',gap:12,cursor:'pointer',marginBottom:20,padding:'12px 16px',borderRadius:8,background:f.agreed?'rgba(46,125,50,0.1)':'transparent',border:f.agreed?'1px solid #2e7d32':'1px solid #1e3a52'}}>
                <div style={{width:18,height:18,borderRadius:4,flexShrink:0,marginTop:1,background:f.agreed?'#2e7d32':'transparent',border:f.agreed?'2px solid #2e7d32':'2px solid #1e3a52',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {f.agreed&&<span style={{color:'#fff',fontSize:11,fontWeight:900}}>v</span>}
                </div>
                <span style={{color:'#8fa8c0',fontSize:11,lineHeight:1.6}}>
                  I agree to the SurveyLink Terms of Service and Privacy Policy, and acknowledge the 1% platform commission.
                </span>
              </div>
              {error&&<p style={{color:'#dd2e1e',fontSize:12,marginBottom:12}}>{error}</p>}
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <button onClick={()=>setStep(2)} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Back</button>
                <button onClick={handleSubmit} disabled={!f.iban||!f.bic||!f.accountHolder||!f.agreed||loading}
                  style={{background:(!f.iban||!f.bic||!f.accountHolder||!f.agreed||loading)?'rgba(46,125,50,0.45)':'#2e7d32',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>
                  {loading?'Creating...':'Create Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
