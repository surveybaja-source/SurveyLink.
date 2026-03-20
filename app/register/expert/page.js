'use client'
import { COUNTRIES } from '../../../lib/locations'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ExpertRegister() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const [f, setF] = useState({
    company:'',country:'',city:'',zip:'',address:'',regNum:'',vatNum:'',
    firstName:'',lastName:'',email:'',phone:'',password:'',password2:'',
    experience:'',bio:'',dayRate:'',currency:'EUR',
    iban:'',bic:'',bankName:'',accountHolder:'',agreed:false
  })
  const [languages, setLanguages] = useState([])
  const [certifications, setCertifications] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [commodities, setCommodities] = useState([])
  const [equipment, setEquipment] = useState([])
  const [coverage, setCoverage] = useState([])

  const u = k => v => setF(p => ({...p,[k]:v}))
  const tog = setter => item => setter(p => p.includes(item)?p.filter(x=>x!==item):[...p,item])

  const STEPS = ['Company','Profile','Expertise','Equipment','Banking']
  const COUNTRIES = ['France','Belgium','Netherlands','Germany','United Kingdom','Spain','Italy','Singapore','UAE','China','United States','Other']
  const LANGUAGES = ['English','French','Spanish','Dutch','German','Italian','Portuguese','Arabic','Mandarin','Japanese','Russian','Other']
  const CERTIFICATIONS = ['CESAM','Lloyds Accredited','IFIA','FOSFA','GAFTA','ISO 17020','Bureau Veritas','SGS','Intertek','P&I Club Panel','IMO IMSBC','STCW']
  const SPECIALTIES = ['Bulk Cargo Surveys','Container FCL Surveys','Container LCL Surveys','Reefer / Cold Chain Surveys','Tanker / Liquid Bulk Surveys','Petroleum & Oil Surveys','Chemical Tanker Surveys','Heavy Lift Surveys','Project Cargo Surveys','Dangerous Goods (IMDG)','RoRo Cargo Surveys','Breakbulk Surveys','Fumigation Supervision','Sampling & Analysis','Draft / Weight Surveys','On-Hire / Off-Hire Surveys']
  const COMMODITIES = ['Wheat','Corn / Maize','Soybean','Rice','Sugar','Coffee & Cocoa','Vegetable Oils','Fertilizers','Coal','Iron Ore & Steel','Cement','Petroleum Products','Fresh Produce','Frozen Meat & Poultry','Dairy Products','Pharmaceuticals','Chemicals','Cotton & Natural Fibres','Timber & Lumber','Scrap Metal']
  const EQUIPMENT = ['Digital Thermometer','Infrared Thermometer','Temperature Data Logger','Brix Refractometer','Digital Hygrometer','Silver Nitrate Test Kit','pH Meter','Grain Moisture Meter','Drager Gas Detector','Portable O2 Analyser','Photographic Drone','Reefer Data Retriever','Ultrasonic Thickness Gauge','Lux Meter','UV Lamp','Portable Microscope']
const GEO = COUNTRIES


  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({email:f.email,password:f.password})
    if (error) { setError(error.message); setLoading(false); return }
    await supabase.from('profiles').insert({
      id:data.user.id,role:'expert',email:f.email,
      company:f.company,first_name:f.firstName,last_name:f.lastName,
      phone:f.phone,country:f.country,city:f.city,
      iban:f.iban,bic:f.bic,bank_name:f.bankName,verified:false
    })
    router.push('/pending')
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

  const Chk = ({items,selected,toggle}) => (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:16}}>
      {items.map(item=>{
        const a = selected.includes(item)
        return (
          <div key={item} onClick={()=>toggle(item)}
            style={{background:a?'rgba(46,125,50,0.15)':'#0f1e2e',border:a?'1px solid #2e7d32':'1px solid #1e3a52',borderRadius:6,padding:'7px 10px',cursor:'pointer',color:a?'#a5d6a7':'#8fa8c0',fontSize:11,display:'flex',alignItems:'center',gap:6,userSelect:'none'}}>
            <span style={{fontSize:10,color:a?'#2e7d32':'#4a6880'}}>✓</span>{item}
          </div>
        )
      })}
    </div>
  )

  const SecT = ({text}) => (
    <div style={{color:'#fff',fontWeight:700,fontSize:13,letterSpacing:'0.08em',textTransform:'uppercase',margin:'20px 0 12px',paddingBottom:8,borderBottom:'1px solid #1e3a52'}}>{text}</div>
  )

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh',padding:'32px 24px'}}>
      <div style={{maxWidth:700,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
          <button onClick={()=>step>0?setStep(s=>s-1):router.push('/auth')}
            style={{background:'none',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 12px',color:'#8fa8c0',cursor:'pointer',fontSize:11}}>
            Back
          </button>
          <div>
            <div style={{color:'#4a6880',fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase'}}>Registration - Cargo Surveyor</div>
            <div style={{color:'#fff',fontWeight:800,fontSize:22}}>Create your expert profile</div>
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
              <Inp id="company" ph="Company / Trading Name" val={f.company} set={u('company')}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Sel id="country" opts={COUNTRIES} val={f.country} set={u('country')}/>
                <Inp id="city" ph="City" val={f.city} set={u('city')}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp id="regNum" ph="Company Registration No." val={f.regNum} set={u('regNum')}/>
                <Inp id="vatNum" ph="VAT Number" val={f.vatNum} set={u('vatNum')}/>
              </div>
              <SecT text="Personal Information"/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp id="firstName" ph="First Name" val={f.firstName} set={u('firstName')}/>
                <Inp id="lastName" ph="Last Name" val={f.lastName} set={u('lastName')}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp id="email" ph="Professional Email" val={f.email} set={u('email')} type="email"/>
                <Inp id="phone" ph="Phone / WhatsApp" val={f.phone} set={u('phone')}/>
              </div>
              <SecT text="Account Security"/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp id="pw" ph="Password (min. 6 chars)" val={f.password} set={u('password')} type="password"/>
                <Inp id="pw2" ph="Confirm Password" val={f.password2} set={u('password2')} type="password"/>
              </div>
              {f.password&&f.password2&&f.password!==f.password2&&(
                <p style={{color:'#dd2e1e',fontSize:11,marginBottom:12}}>Passwords do not match</p>
              )}
              <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
                <button onClick={()=>setStep(1)} style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step===1&&(
            <div>
              <SecT text="Professional Profile"/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Sel id="exp" opts={['Less than 2 years','2 to 5 years','5 to 10 years','10 to 20 years','More than 20 years']} val={f.experience} set={u('experience')}/>
                <Sel id="currency" opts={['EUR','USD','GBP','SGD','AED','CHF']} val={f.currency} set={u('currency')}/>
              </div>
              <Inp id="rate" ph="Standard Day Rate (e.g. 1200)" val={f.dayRate} set={u('dayRate')}/>
              <div style={{marginBottom:12}}>
                <textarea id="bio" placeholder="Describe your background, expertise and typical survey types..." value={f.bio} onChange={e=>u('bio')(e.target.value)} rows={4}
                  style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13,resize:'vertical'}}/>
              </div>
              <SecT text="Languages Spoken"/>
              <Chk items={LANGUAGES} selected={languages} toggle={tog(setLanguages)}/>
              <SecT text="Certifications & Accreditations"/>
              <Chk items={CERTIFICATIONS} selected={certifications} toggle={tog(setCertifications)}/>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
                <button onClick={()=>setStep(0)} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Back</button>
                <button onClick={()=>setStep(2)} disabled={!f.experience}
                  style={{background:!f.experience?'rgba(221,46,30,0.45)':'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step===2&&(
            <div>
              <SecT text="Survey Specialties"/>
              <Chk items={SPECIALTIES} selected={specialties} toggle={tog(setSpecialties)}/>
              <SecT text="Commodities Expertise"/>
              <Chk items={COMMODITIES} selected={commodities} toggle={tog(setCommodities)}/>
              <SecT text="Geographic Coverage"/>
              <Chk items={GEO} selected={coverage} toggle={tog(setCoverage)}/>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
                <button onClick={()=>setStep(1)} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Back</button>
                <button onClick={()=>setStep(3)} disabled={specialties.length===0}
                  style={{background:specialties.length===0?'rgba(221,46,30,0.45)':'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step===3&&(
            <div>
              <SecT text="Equipment & Testing Kit"/>
              <Chk items={EQUIPMENT} selected={equipment} toggle={tog(setEquipment)}/>
              <SecT text="Professional Documents"/>
              {['Professional Indemnity Insurance Certificate','ID / Passport','Profile Photo'].map(doc=>(
                <div key={doc} style={{marginBottom:10,background:'#0f1e2e',border:'2px dashed #1e3a52',borderRadius:8,padding:'12px 16px',display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>
                  <span style={{fontSize:18}}>📎</span>
                  <div>
                    <div style={{color:'#8fa8c0',fontSize:12}}>{doc}</div>
                    <div style={{color:'#4a6880',fontSize:10,marginTop:2}}>PDF, JPG or PNG - max 5 MB</div>
                  </div>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
                <button onClick={()=>setStep(2)} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Back</button>
                <button onClick={()=>setStep(4)} style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>Next</button>
              </div>
            </div>
          )}

          {step===4&&(
            <div>
              <SecT text="Banking & Payment Details"/>
              <Inp id="holder" ph="Account Holder Name" val={f.accountHolder} set={u('accountHolder')}/>
              <Inp id="iban" ph="IBAN" val={f.iban} set={u('iban')}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp id="bic" ph="BIC / SWIFT Code" val={f.bic} set={u('bic')}/>
                <Inp id="bankName" ph="Bank Name" val={f.bankName} set={u('bankName')}/>
              </div>
              <div style={{background:'rgba(46,125,50,0.1)',border:'1px solid #2e7d32',borderRadius:10,padding:'14px 18px',marginBottom:14}}>
                <div style={{color:'#2e7d32',fontWeight:700,fontSize:12,marginBottom:10}}>YOUR PROFILE SUMMARY</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                  {[['Specialties',specialties.length],['Commodities',commodities.length],['Equipment',equipment.length],['Certifications',certifications.length],['Regions',coverage.length],['Languages',languages.length]].map(([k,v])=>(
                    <div key={k} style={{textAlign:'center',background:'rgba(46,125,50,0.1)',borderRadius:6,padding:'8px 4px'}}>
                      <div style={{color:'#2e7d32',fontWeight:800,fontSize:20}}>{v}</div>
                      <div style={{color:'#4a6880',fontSize:9,textTransform:'uppercase'}}>{k}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{background:'rgba(221,46,30,0.08)',border:'1px solid #700300',borderRadius:8,padding:'11px 14px',marginBottom:14,display:'flex',gap:10}}>
                <span>🔒</span>
                <span style={{color:'#8fa8c0',fontSize:11,lineHeight:1.5}}>
                  Payments via Stripe Connect. SurveyLink retains a 1% fee per validated mission. Payouts within 3 to 5 business days.
                </span>
              </div>
              <div onClick={()=>setF(p=>({...p,agreed:!p.agreed}))}
                style={{display:'flex',alignItems:'flex-start',gap:12,cursor:'pointer',marginBottom:20,padding:'12px 16px',borderRadius:8,background:f.agreed?'rgba(46,125,50,0.1)':'transparent',border:f.agreed?'1px solid #2e7d32':'1px solid #1e3a52'}}>
                <div style={{width:18,height:18,borderRadius:4,flexShrink:0,marginTop:1,background:f.agreed?'#2e7d32':'transparent',border:f.agreed?'2px solid #2e7d32':'2px solid #1e3a52',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {f.agreed&&<span style={{color:'#fff',fontSize:11,fontWeight:900}}>v</span>}
                </div>
                <span style={{color:'#8fa8c0',fontSize:11,lineHeight:1.6}}>
                  I agree to the SurveyLink Terms of Service and Code of Conduct. I confirm that my information is accurate and all credentials are genuine.
                </span>
              </div>
              {error&&<p style={{color:'#dd2e1e',fontSize:12,marginBottom:12}}>{error}</p>}
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <button onClick={()=>setStep(3)} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Back</button>
                <button onClick={handleSubmit} disabled={!f.iban||!f.bic||!f.accountHolder||!f.agreed||loading}
                  style={{background:(!f.iban||!f.bic||!f.accountHolder||!f.agreed||loading)?'rgba(46,125,50,0.45)':'#2e7d32',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>
                  {loading?'Submitting...':'Submit Profile for Review'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
