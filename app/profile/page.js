'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { COUNTRIES } from '../../lib/locations'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [profile, setProfile] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUser(user)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) { setProfile(data); setRole(data.role) }
    }
    load()
  }, [])

  if (!profile) return (
    <div style={{background:'#0c1a27',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:'#8fa8c0'}}>Loading...</p>
    </div>
  )

  if (role === 'insurer') return <InsurerProfile profile={profile} user={user}/>
  return <ExpertProfile profile={profile} user={user}/>
}

function InsurerProfile({profile, user}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [f, setF] = useState({
    company: profile.company || '',
    city: profile.city || '',
    country: profile.country || '',
    phone: profile.phone || '',
    iban: profile.iban || '',
    bic: profile.bic || '',
    bank_name: profile.bank_name || '',
  })

  const u = k => v => setF(p => ({...p,[k]:v}))
  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),3000) }

  const save = async () => {
    setLoading(true)
    await supabase.from('profiles').update(f).eq('id', user.id)
    setLoading(false)
    showToast('Profile updated successfully!')
  }

  const Inp = ({label,ph,val,set,type='text'}) => (
    <div style={{marginBottom:14}}>
      <label style={{display:'block',color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>{label}</label>
      <input type={type} placeholder={ph} value={val} onChange={e=>set(e.target.value)}
        style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13}}/>
    </div>
  )

  const SecT = ({text}) => (
    <div style={{color:'#fff',fontWeight:700,fontSize:13,letterSpacing:'0.08em',textTransform:'uppercase',margin:'20px 0 12px',paddingBottom:8,borderBottom:'1px solid #1e3a52'}}>{text}</div>
  )

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh'}}>
      {toast&&<div style={{position:'fixed',top:70,left:'50%',transform:'translateX(-50%)',background:'#2e7d32',color:'#fff',padding:'12px 24px',borderRadius:8,fontWeight:700,zIndex:999,fontSize:13}}>{toast}</div>}
      <nav style={{background:'#0f1e2e',borderBottom:'1px solid #1e3a52',padding:'0 32px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <span style={{color:'#fff',fontWeight:900,fontSize:22}}>SurveyLink</span>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>router.push('/dashboard')} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 16px',cursor:'pointer',fontSize:12}}>
            Back to Dashboard
          </button>
          <button onClick={()=>supabase.auth.signOut().then(()=>router.push('/auth'))} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 16px',cursor:'pointer'}}>
            Sign Out
          </button>
        </div>
      </nav>
      <div style={{maxWidth:700,margin:'0 auto',padding:'32px 24px'}}>
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:32,padding:24,background:'#132030',border:'1px solid #1e3a52',borderRadius:12}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,#182e44,#dd2e1e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:800,color:'#fff'}}>
            🏢
          </div>
          <div>
            <div style={{color:'#fff',fontWeight:800,fontSize:22}}>{profile.company||'Your Company'}</div>
            <div style={{color:'#8fa8c0',fontSize:13,marginTop:2}}>{profile.email}</div>
            <div style={{marginTop:6}}>
              <span style={{background:profile.verified?'rgba(46,125,50,0.12)':'rgba(240,165,0,0.12)',border:`1px solid ${profile.verified?'#2e7d32':'#f0a500'}`,color:profile.verified?'#81c784':'#f0a500',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700}}>
                {profile.verified?'VERIFIED':'PENDING VERIFICATION'}
              </span>
            </div>
          </div>
        </div>

        <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:28}}>
          <SecT text="Company Information"/>
          <Inp label="Company Name" ph="Company name" val={f.company} set={u('company')}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div style={{marginBottom:14}}>
              <label style={{display:'block',color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>Country</label>
              <select value={f.country} onChange={e=>u('country')(e.target.value)}
                style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:f.country?'#fff':'#4a6880',boxSizing:'border-box',fontSize:13}}>
                <option value="">Select...</option>
                {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Inp label="City" ph="City" val={f.city} set={u('city')}/>
          </div>
          <Inp label="Phone" ph="Phone number" val={f.phone} set={u('phone')}/>

          <SecT text="Banking Information"/>
          <Inp label="IBAN" ph="IBAN" val={f.iban} set={u('iban')}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Inp label="BIC / SWIFT" ph="BIC / SWIFT" val={f.bic} set={u('bic')}/>
            <Inp label="Bank Name" ph="Bank name" val={f.bank_name} set={u('bank_name')}/>
          </div>

          <div style={{marginTop:8}}>
            <div style={{background:'rgba(221,46,30,0.08)',border:'1px solid #700300',borderRadius:8,padding:'11px 14px',marginBottom:16,display:'flex',gap:10}}>
              <span>ℹ️</span>
              <span style={{color:'#8fa8c0',fontSize:11,lineHeight:1.5}}>To update your email address or legal documents, please contact support@surveylink.io</span>
            </div>
            <button onClick={save} disabled={loading}
              style={{width:'100%',background:loading?'rgba(46,125,50,0.45)':'#2e7d32',color:'#fff',border:'none',borderRadius:7,padding:'14px',cursor:'pointer',fontWeight:700,fontSize:14}}>
              {loading?'Saving...':'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ExpertProfile({profile, user}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('personal')
  const [f, setF] = useState({
    company: profile.company || '',
    city: profile.city || '',
    country: profile.country || '',
    phone: profile.phone || '',
    bio: profile.bio || '',
    day_rate: profile.day_rate || '',
    currency: profile.currency || 'EUR',
    iban: profile.iban || '',
    bic: profile.bic || '',
    bank_name: profile.bank_name || '',
  })
  const [languages, setLanguages] = useState(profile.languages || [])
  const [certifications, setCertifications] = useState(profile.certifications || [])
  const [specialties, setSpecialties] = useState(profile.specialties || [])
  const [commodities, setCommodities] = useState(profile.commodities || [])
  const [equipment, setEquipment] = useState(profile.equipment || [])
  const [coverage, setCoverage] = useState(profile.coverage_countries || [])

  const u = k => v => setF(p => ({...p,[k]:v}))
  const tog = setter => item => setter(p => p.includes(item)?p.filter(x=>x!==item):[...p,item])
  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),3000) }

  const LANGUAGES = ['English','French','Spanish','Dutch','German','Italian','Portuguese','Arabic','Mandarin','Japanese','Russian','Other']
  const CERTIFICATIONS = ['CESAM','Lloyds Accredited','IFIA','FOSFA','GAFTA','ISO 17020','Bureau Veritas','SGS','Intertek','P&I Club Panel','IMO IMSBC','STCW']
  const SPECIALTIES = ['Bulk Cargo Surveys','Container FCL Surveys','Container LCL Surveys','Reefer / Cold Chain Surveys','Tanker / Liquid Bulk Surveys','Petroleum & Oil Surveys','Chemical Tanker Surveys','Heavy Lift Surveys','Project Cargo Surveys','Dangerous Goods (IMDG)','RoRo Cargo Surveys','Breakbulk Surveys','Fumigation Supervision','Sampling & Analysis','Draft / Weight Surveys','On-Hire / Off-Hire Surveys']
  const COMMODITIES = ['Wheat','Corn / Maize','Soybean','Rice','Sugar','Coffee & Cocoa','Vegetable Oils','Fertilizers','Coal','Iron Ore & Steel','Cement','Petroleum Products','Fresh Produce','Frozen Meat & Poultry','Dairy Products','Pharmaceuticals','Chemicals','Cotton & Natural Fibres','Timber & Lumber','Scrap Metal']
  const EQUIPMENT = ['Digital Thermometer','Infrared Thermometer','Temperature Data Logger','Brix Refractometer','Digital Hygrometer','Silver Nitrate Test Kit','pH Meter','Grain Moisture Meter','Drager Gas Detector','Portable O2 Analyser','Photographic Drone','Reefer Data Retriever','Ultrasonic Thickness Gauge','Lux Meter','UV Lamp','Portable Microscope']

  const save = async () => {
    setLoading(true)
    await supabase.from('profiles').update({
      ...f,
      languages,
      certifications,
      specialties,
      commodities,
      equipment,
      coverage_countries: coverage,
    }).eq('id', user.id)
    setLoading(false)
    showToast('Profile updated successfully!')
  }

  const Inp = ({label,ph,val,set,type='text'}) => (
    <div style={{marginBottom:14}}>
      <label style={{display:'block',color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>{label}</label>
      <input type={type} placeholder={ph} value={val} onChange={e=>set(e.target.value)}
        style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13}}/>
    </div>
  )

  const SecT = ({text}) => (
    <div style={{color:'#fff',fontWeight:700,fontSize:13,letterSpacing:'0.08em',textTransform:'uppercase',margin:'20px 0 12px',paddingBottom:8,borderBottom:'1px solid #1e3a52'}}>{text}</div>
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

  const TABS = [
    {k:'personal',l:'Personal'},
    {k:'expertise',l:'Expertise'},
    {k:'coverage',l:'Coverage'},
    {k:'banking',l:'Banking'},
  ]

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh'}}>
      {toast&&<div style={{position:'fixed',top:70,left:'50%',transform:'translateX(-50%)',background:'#2e7d32',color:'#fff',padding:'12px 24px',borderRadius:8,fontWeight:700,zIndex:999,fontSize:13}}>{toast}</div>}
      <nav style={{background:'#0f1e2e',borderBottom:'1px solid #1e3a52',padding:'0 32px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <span style={{color:'#fff',fontWeight:900,fontSize:22}}>SurveyLink</span>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>router.push('/dashboard')} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 16px',cursor:'pointer',fontSize:12}}>
            Back to Dashboard
          </button>
          <button onClick={()=>supabase.auth.signOut().then(()=>router.push('/auth'))} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 16px',cursor:'pointer'}}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{maxWidth:700,margin:'0 auto',padding:'32px 24px'}}>
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:32,padding:24,background:'#132030',border:'1px solid #1e3a52',borderRadius:12}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,#182e44,#dd2e1e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,color:'#fff',fontWeight:800}}>
            {profile.first_name?.[0]}{profile.last_name?.[0]}
          </div>
          <div style={{flex:1}}>
            <div style={{color:'#fff',fontWeight:800,fontSize:22}}>{profile.first_name} {profile.last_name}</div>
            <div style={{color:'#8fa8c0',fontSize:13,marginTop:2}}>{profile.company} — {profile.city}, {profile.country}</div>
            <div style={{color:'#4a6880',fontSize:12,marginTop:2}}>{profile.email}</div>
            <div style={{marginTop:6}}>
              <span style={{background:profile.verified?'rgba(46,125,50,0.12)':'rgba(240,165,0,0.12)',border:`1px solid ${profile.verified?'#2e7d32':'#f0a500'}`,color:profile.verified?'#81c784':'#f0a500',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700}}>
                {profile.verified?'VERIFIED EXPERT':'PENDING VERIFICATION'}
              </span>
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{color:'#4a6880',fontSize:9,marginBottom:2}}>COVERAGE</div>
            <div style={{color:'#f0a500',fontWeight:800,fontSize:20}}>{coverage.length}</div>
            <div style={{color:'#4a6880',fontSize:9}}>countries</div>
          </div>
        </div>

        <div style={{display:'flex',gap:4,marginBottom:20}}>
          {TABS.map(tab=>(
            <button key={tab.k} onClick={()=>setActiveTab(tab.k)}
              style={{background:activeTab===tab.k?'#dd2e1e':'transparent',color:activeTab===tab.k?'#fff':'#8fa8c0',border:`1px solid ${activeTab===tab.k?'#dd2e1e':'#1e3a52'}`,borderRadius:6,padding:'7px 16px',fontSize:12,cursor:'pointer',fontWeight:700}}>
              {tab.l}
            </button>
          ))}
        </div>

        <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:28}}>
          {activeTab==='personal'&&(
            <div>
              <SecT text="Personal Information"/>
              <Inp label="Company / Trading Name" ph="Company name" val={f.company} set={u('company')}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div style={{marginBottom:14}}>
                  <label style={{display:'block',color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>Country</label>
                  <select value={f.country} onChange={e=>u('country')(e.target.value)}
                    style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:f.country?'#fff':'#4a6880',boxSizing:'border-box',fontSize:13}}>
                    <option value="">Select...</option>
                    {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <Inp label="City" ph="City" val={f.city} set={u('city')}/>
              </div>
              <Inp label="Phone / WhatsApp" ph="Phone number" val={f.phone} set={u('phone')}/>
              <SecT text="Professional Profile"/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp label="Standard Day Rate" ph="e.g. 1200" val={f.day_rate} set={u('day_rate')}/>
                <div style={{marginBottom:14}}>
                  <label style={{display:'block',color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>Currency</label>
                  <select value={f.currency} onChange={e=>u('currency')(e.target.value)}
                    style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13}}>
                    {['EUR','USD','GBP','SGD','AED','CHF'].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <label style={{display:'block',color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>Professional Bio</label>
                <textarea placeholder="Describe your background and expertise..." value={f.bio} onChange={e=>u('bio')(e.target.value)} rows={4}
                  style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13,resize:'vertical'}}/>
              </div>
              <SecT text="Languages"/>
              <Chk items={LANGUAGES} selected={languages} toggle={tog(setLanguages)}/>
            </div>
          )}

          {activeTab==='expertise'&&(
            <div>
              <SecT text="Survey Specialties"/>
              <Chk items={SPECIALTIES} selected={specialties} toggle={tog(setSpecialties)}/>
              <SecT text="Certifications"/>
              <Chk items={CERTIFICATIONS} selected={certifications} toggle={tog(setCertifications)}/>
              <SecT text="Commodities Expertise"/>
              <Chk items={COMMODITIES} selected={commodities} toggle={tog(setCommodities)}/>
              <SecT text="Equipment & Testing Kit"/>
              <Chk items={EQUIPMENT} selected={equipment} toggle={tog(setEquipment)}/>
            </div>
          )}

          {activeTab==='coverage'&&(
            <div>
              <SecT text="Geographic Coverage"/>
              <p style={{color:'#8fa8c0',fontSize:12,marginBottom:16,lineHeight:1.6}}>
                Select all countries where you are available to conduct surveys. You will only receive mission requests for these countries.
              </p>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                <span style={{color:'#4a6880',fontSize:11}}>{coverage.length} countries selected</span>
                <button onClick={()=>setCoverage([])} style={{background:'transparent',color:'#dd2e1e',border:'none',cursor:'pointer',fontSize:11}}>Clear all</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,maxHeight:400,overflowY:'auto'}}>
                {COUNTRIES.map(country=>{
                  const a = coverage.includes(country)
                  return (
                    <div key={country} onClick={()=>tog(setCoverage)(country)}
                      style={{background:a?'rgba(46,125,50,0.15)':'#0f1e2e',border:a?'1px solid #2e7d32':'1px solid #1e3a52',borderRadius:6,padding:'7px 10px',cursor:'pointer',color:a?'#a5d6a7':'#8fa8c0',fontSize:11,display:'flex',alignItems:'center',gap:6,userSelect:'none'}}>
                      <span style={{fontSize:10,color:a?'#2e7d32':'#4a6880'}}>✓</span>{country}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab==='banking'&&(
            <div>
              <SecT text="Banking Information"/>
              <Inp label="IBAN" ph="IBAN" val={f.iban} set={u('iban')}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp label="BIC / SWIFT" ph="BIC / SWIFT" val={f.bic} set={u('bic')}/>
                <Inp label="Bank Name" ph="Bank name" val={f.bank_name} set={u('bank_name')}/>
              </div>
              <div style={{background:'rgba(221,46,30,0.08)',border:'1px solid #700300',borderRadius:8,padding:'11px 14px',marginBottom:14,display:'flex',gap:10}}>
                <span>ℹ️</span>
                <span style={{color:'#8fa8c0',fontSize:11,lineHeight:1.5}}>To update your email address or legal documents, please contact support@surveylink.io</span>
              </div>
            </div>
          )}

          <div style={{marginTop:20,paddingTop:20,borderTop:'1px solid #1e3a52'}}>
            <button onClick={save} disabled={loading}
              style={{width:'100%',background:loading?'rgba(46,125,50,0.45)':'#2e7d32',color:'#fff',border:'none',borderRadius:7,padding:'14px',cursor:'pointer',fontWeight:700,fontSize:14}}>
              {loading?'Saving...':'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
