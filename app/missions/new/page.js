'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function NewMission() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [expertiseType, setExpertiseType] = useState('')
  const [expertiseSubtype, setExpertiseSubtype] = useState('')
  const [loadingUnit, setLoadingUnit] = useState('')
  const [tcType, setTcType] = useState('')
  const [quantity, setQuantity] = useState('')
  const [cargoCategory, setCargoCategory] = useState('')
  const [cargoSubcategory, setCargoSubcategory] = useState('')
  const [oogDescription, setOogDescription] = useState('')
  const [damages, setDamages] = useState([])
  const [location, setLocation] = useState('')
  const [urgency, setUrgency] = useState('normal')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactJob, setContactJob] = useState('')
  const [client, setClient] = useState('')
  const [notes, setNotes] = useState('')
  const [docs, setDocs] = useState([])

  const STEPS = expertiseType === 'vessel'
    ? ['Expertise','Location','Details','Review']
    : ['Expertise','Loading Unit','Cargo','Damage','Location','Details','Review']

  const VESSEL_TYPES = [
    {id:'pre_purchase',label:'Pre-Purchase Survey',icon:'🔍',sub:'Vessel condition before purchase'},
    {id:'pre_insurance',label:'Pre-Insurance Survey',icon:'🛡️',sub:'Condition report for underwriters'},
    {id:'claim_damage',label:'Claim & Damage Survey',icon:'⚠️',sub:'Assessment of damage or loss'},
    {id:'annual_maintenance',label:'Annual Maintenance Survey',icon:'🔧',sub:'Periodic condition inspection'},
  ]

  const CARGO_EXPERTISE = [
    {id:'IQC',label:'IQC',sub:'Incoming Quality Control'},
    {id:'IPQC',label:'IPQC',sub:'In-Process Quality Control'},
    {id:'OQC',label:'OQC',sub:'Outgoing Quality Control'},
    {id:'FQC',label:'FQC',sub:'Final Quality Control'},
  ]

  const LOADING_UNITS = [
    {id:'tc',label:'TC (Container)',icon:'📦'},
    {id:'pallets',label:'Pallets',icon:'🪵'},
    {id:'bulk',label:'Bulk',icon:'⛏️'},
    {id:'other',label:'Other',icon:'📋'},
  ]

  const TC_TYPES = ["20'","40'","40'HC","Open Top (OT)"]

  const CARGO_CATEGORIES = [
    {id:'general',label:'General Cargo',icon:'📦',subs:['Clothing / Textiles','Mechanical Parts','Electronic Components','Electrical / Electronic Appliances','Furniture / Objects','Other']},
    {id:'bulk',label:'Bulk Cargo',icon:'⛏️',subs:['Dry Bulk - Coal','Dry Bulk - Grain','Dry Bulk - Ore','Dry Bulk - Fertilizers','Dry Bulk - Other','Liquid Bulk - Petroleum','Liquid Bulk - Chemicals','Liquid Bulk - Other']},
    {id:'perishable',label:'Perishable',icon:'❄️',subs:['Meat / Fish','Fruits / Vegetables','Pharmaceuticals','Other']},
    {id:'adr',label:'ADR - Dangerous Goods',icon:'☢️',subs:['Class 1 - Explosives','Class 2 - Gases','Class 3 - Flammable Liquids','Class 4 - Flammable Solids','Class 5 - Oxidizing / Peroxides','Class 6 - Toxic / Infectious','Class 7 - Radioactive','Class 8 - Corrosives','Class 9 - Miscellaneous']},
    {id:'oog',label:'Out of Gauge',icon:'🏗️',subs:[]},
    {id:'roro',label:'RoRo',icon:'🚗',subs:['Car(s)','Truck(s)','Heavy Equipment']},
  ]

  const DMG_TYPES = ['Wetting','Contamination','Mechanical Damage','Shortage / Theft','Accident','Temperature','Other']

  const URGENCY = [
    {id:'normal',label:'Normal',time:'Response within 48 hours',color:'#2e7d32',bg:'rgba(46,125,50,0.1)',border:'#2e7d32'},
    {id:'urgent',label:'Urgent',time:'Response within 24 hours',color:'#f0a500',bg:'rgba(240,165,0,0.1)',border:'#f0a500'},
    {id:'critical',label:'Critical',time:'Response within 12 hours',color:'#dd2e1e',bg:'rgba(221,46,30,0.15)',border:'#dd2e1e'},
  ]

  const togDmg = d => setDamages(p => p.includes(d)?p.filter(x=>x!==d):[...p,d])

  const nextStep = () => setStep(s => s+1)
  const prevStep = () => setStep(s => s-1)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    const ref = 'SL-' + Date.now()
    const { error } = await supabase.from('missions').insert({
      reference: ref,
      insurer_id: user.id,
      expertise_type: expertiseType,
      expertise_subtype: expertiseSubtype,
      loading_unit: loadingUnit,
      loading_quantity: quantity,
      tc_type: tcType,
      cargo_type: expertiseType === 'vessel' ? expertiseSubtype : cargoCategory,
      cargo_category: cargoCategory,
      cargo_subcategory: cargoSubcategory,
      oog_description: oogDescription,
      damage_types: damages,
      client_name: client,
      location_text: location,
      contact_name: contactName,
      contact_phone: contactPhone,
      contact_job: contactJob,
      urgency: urgency,
      status: 'searching',
      notes: notes,
      cancelled: false
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    setLoading(false)
  }

  const SecT = ({text}) => (
    <div style={{color:'#fff',fontWeight:700,fontSize:13,letterSpacing:'0.08em',textTransform:'uppercase',margin:'20px 0 12px',paddingBottom:8,borderBottom:'1px solid #1e3a52'}}>{text}</div>
  )

  const selectedCategory = CARGO_CATEGORIES.find(c => c.id === cargoCategory)

  const getContent = () => {
    if (step === 0) return 'expertise'
    if (expertiseType === 'vessel') {
      if (step === 1) return 'location'
      if (step === 2) return 'details'
      if (step === 3) return 'review'
    } else {
      if (step === 1) return 'loading'
      if (step === 2) return 'cargo'
      if (step === 3) return 'damage'
      if (step === 4) return 'location'
      if (step === 5) return 'details'
      if (step === 6) return 'review'
    }
  }

  const content = getContent()

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh',padding:'32px 24px'}}>
      <div style={{maxWidth:700,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
          <button onClick={()=>step>0?prevStep():router.push('/dashboard')}
            style={{background:'none',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 12px',color:'#8fa8c0',cursor:'pointer',fontSize:11}}>
            Back
          </button>
          <div>
            <div style={{color:'#4a6880',fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase'}}>Insurer Portal</div>
            <div style={{color:'#fff',fontWeight:800,fontSize:22}}>New Survey Request</div>
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

          {content==='expertise'&&(
            <div>
              <h2 style={{color:'#fff',fontWeight:800,fontSize:22,marginBottom:6,marginTop:0}}>Type of Expertise</h2>
              <p style={{color:'#8fa8c0',fontSize:12,marginBottom:20}}>Select the type of survey you need.</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24}}>
                {[
                  {id:'cargo',icon:'📦',label:'Cargo Survey',sub:'IQC, IPQC, OQC, FQC'},
                  {id:'vessel',icon:'🚢',label:'Vessel Survey',sub:'Pre-purchase, Pre-insurance, Claim, Maintenance'},
                ].map(t=>(
                  <div key={t.id} onClick={()=>{setExpertiseType(t.id);setExpertiseSubtype('');}}
                    style={{background:expertiseType===t.id?'rgba(221,46,30,0.1)':'#0f1e2e',border:expertiseType===t.id?'2px solid #dd2e1e':'2px solid #1e3a52',borderRadius:12,padding:20,cursor:'pointer',textAlign:'center'}}>
                    <div style={{fontSize:32,marginBottom:8}}>{t.icon}</div>
                    <div style={{color:expertiseType===t.id?'#dd2e1e':'#fff',fontWeight:700,fontSize:15}}>{t.label}</div>
                    <div style={{color:'#4a6880',fontSize:11,marginTop:4}}>{t.sub}</div>
                  </div>
                ))}
              </div>

              {expertiseType==='cargo'&&(
                <>
                  <SecT text="Quality Control Type"/>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
                    {CARGO_EXPERTISE.map(c=>(
                      <div key={c.id} onClick={()=>setExpertiseSubtype(c.id)}
                        style={{background:expertiseSubtype===c.id?'rgba(221,46,30,0.1)':'#0f1e2e',border:expertiseSubtype===c.id?'2px solid #dd2e1e':'2px solid #1e3a52',borderRadius:10,padding:14,cursor:'pointer'}}>
                        <div style={{color:expertiseSubtype===c.id?'#dd2e1e':'#fff',fontWeight:800,fontSize:18}}>{c.label}</div>
                        <div style={{color:'#4a6880',fontSize:11,marginTop:3}}>{c.sub}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {expertiseType==='vessel'&&(
                <>
                  <SecT text="Survey Type"/>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
                    {VESSEL_TYPES.map(v=>(
                      <div key={v.id} onClick={()=>setExpertiseSubtype(v.id)}
                        style={{background:expertiseSubtype===v.id?'rgba(221,46,30,0.1)':'#0f1e2e',border:expertiseSubtype===v.id?'2px solid #dd2e1e':'2px solid #1e3a52',borderRadius:10,padding:14,cursor:'pointer',display:'flex',alignItems:'center',gap:12}}>
                        <span style={{fontSize:22}}>{v.icon}</span>
                        <div>
                          <div style={{color:expertiseSubtype===v.id?'#dd2e1e':'#fff',fontWeight:700,fontSize:13}}>{v.label}</div>
                          <div style={{color:'#4a6880',fontSize:10,marginTop:2}}>{v.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div style={{display:'flex',justifyContent:'flex-end'}}>
                <button onClick={nextStep} disabled={!expertiseType||!expertiseSubtype}
                  style={{background:(!expertiseType||!expertiseSubtype)?'rgba(221,46,30,0.45)':'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>
                  Next
                </button>
              </div>
            </div>
          )}

          {content==='loading'&&(
            <div>
              <h2 style={{color:'#fff',fontWeight:800,fontSize:22,marginBottom:6,marginTop:0}}>Loading Unit</h2>
              <p style={{color:'#8fa8c0',fontSize:12,marginBottom:20}}>Select the type of loading unit and specify the quantity.</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
                {LOADING_UNITS.map(u=>(
                  <div key={u.id} onClick={()=>{setLoadingUnit(u.id);setTcType('');setQuantity('');}}
                    style={{background:loadingUnit===u.id?'rgba(221,46,30,0.1)':'#0f1e2e',border:loadingUnit===u.id?'2px solid #dd2e1e':'2px solid #1e3a52',borderRadius:10,padding:14,cursor:'pointer',display:'flex',alignItems:'center',gap:12}}>
                    <span style={{fontSize:22}}>{u.icon}</span>
                    <div style={{color:loadingUnit===u.id?'#dd2e1e':'#fff',fontWeight:700,fontSize:14}}>{u.label}</div>
                  </div>
                ))}
              </div>

              {loadingUnit==='tc'&&(
                <>
                  <SecT text="Container Type"/>
                  <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
                    {TC_TYPES.map(t=>(
                      <div key={t} onClick={()=>setTcType(t)}
                        style={{background:tcType===t?'rgba(221,46,30,0.1)':'transparent',border:tcType===t?'1px solid #dd2e1e':'1px solid #1e3a52',color:tcType===t?'#dd2e1e':'#8fa8c0',borderRadius:20,padding:'6px 16px',cursor:'pointer',fontSize:12,fontWeight:700}}>
                        {t}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {loadingUnit&&(
                <>
                  <SecT text="Quantity"/>
                  <input placeholder="e.g. 3 containers, 150 pallets, 500 MT..." value={quantity} onChange={e=>setQuantity(e.target.value)}
                    style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13,marginBottom:16}}/>
                </>
              )}

              <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
                <button onClick={prevStep} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Back</button>
                <button onClick={nextStep} disabled={!loadingUnit||!quantity||(loadingUnit==='tc'&&!tcType)}
                  style={{background:(!loadingUnit||!quantity||(loadingUnit==='tc'&&!tcType))?'rgba(221,46,30,0.45)':'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>
                  Next
                </button>
              </div>
            </div>
          )}

          {content==='cargo'&&(
            <div>
              <h2 style={{color:'#fff',fontWeight:800,fontSize:22,marginBottom:6,marginTop:0}}>Cargo Category</h2>
              <p style={{color:'#8fa8c0',fontSize:12,marginBottom:20}}>Select the cargo category and subcategory.</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
                {CARGO_CATEGORIES.map(c=>(
                  <div key={c.id} onClick={()=>{setCargoCategory(c.id);setCargoSubcategory('');setOogDescription('');}}
                    style={{background:cargoCategory===c.id?'rgba(221,46,30,0.1)':'#0f1e2e',border:cargoCategory===c.id?'2px solid #dd2e1e':'2px solid #1e3a52',borderRadius:10,padding:'12px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:20}}>{c.icon}</span>
                    <div style={{color:cargoCategory===c.id?'#dd2e1e':'#fff',fontWeight:700,fontSize:13}}>{c.label}</div>
                  </div>
                ))}
              </div>

              {cargoCategory&&cargoCategory!=='oog'&&selectedCategory&&selectedCategory.subs.length>0&&(
                <>
                  <SecT text="Subcategory"/>
                  <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16}}>
                    {selectedCategory.subs.map(s=>(
                      <div key={s} onClick={()=>setCargoSubcategory(s)}
                        style={{background:cargoSubcategory===s?'rgba(221,46,30,0.1)':'transparent',border:cargoSubcategory===s?'1px solid #dd2e1e':'1px solid #1e3a52',color:cargoSubcategory===s?'#dd2e1e':'#8fa8c0',borderRadius:20,padding:'6px 14px',cursor:'pointer',fontSize:12}}>
                        {s}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {cargoCategory==='oog'&&(
                <>
                  <SecT text="Describe the Specifics"/>
                  <textarea placeholder="Describe dimensions, weight, special handling requirements..." value={oogDescription} onChange={e=>setOogDescription(e.target.value)} rows={3}
                    style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13,resize:'vertical',marginBottom:16}}/>
                </>
              )}

              <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
                <button onClick={prevStep} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Back</button>
                <button onClick={nextStep} disabled={!cargoCategory||(cargoCategory!=='oog'&&selectedCategory&&selectedCategory.subs.length>0&&!cargoSubcategory)||(cargoCategory==='oog'&&!oogDescription)}
                  style={{background:(!cargoCategory||(cargoCategory!=='oog'&&selectedCategory&&selectedCategory.subs.length>0&&!cargoSubcategory)||(cargoCategory==='oog'&&!oogDescription))?'rgba(221,46,30,0.45)':'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>
                  Next
                </button>
              </div>
            </div>
          )}

          {content==='damage'&&(
            <div>
              <h2 style={{color:'#fff',fontWeight:800,fontSize:22,marginBottom:6,marginTop:0}}>Type of Damage</h2>
              <p style={{color:'#8fa8c0',fontSize:12,marginBottom:20}}>Select all that apply.</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:24}}>
                {DMG_TYPES.map(d=>(
                  <div key={d} onClick={()=>togDmg(d)}
                    style={{background:damages.includes(d)?'rgba(221,46,30,0.1)':'transparent',border:damages.includes(d)?'1px solid #dd2e1e':'1px solid #1e3a52',color:damages.includes(d)?'#dd2e1e':'#8fa8c0',borderRadius:20,padding:'8px 16px',cursor:'pointer',fontSize:12,fontWeight:damages.includes(d)?700:400}}>
                    {d}
                  </div>
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <button onClick={prevStep} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Back</button>
                <button onClick={nextStep} style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>Next</button>
              </div>
            </div>
          )}

          {content==='location'&&(
            <div>
              <h2 style={{color:'#fff',fontWeight:800,fontSize:22,marginBottom:16,marginTop:0}}>Location & Urgency</h2>
              <input placeholder="Port / Terminal / Full Address" value={location} onChange={e=>setLocation(e.target.value)}
                style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13,marginBottom:16}}/>

              <SecT text="On-Site Contact"/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <input placeholder="Contact Name" value={contactName} onChange={e=>setContactName(e.target.value)}
                  style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13}}/>
                <input placeholder="Job Title" value={contactJob} onChange={e=>setContactJob(e.target.value)}
                  style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13}}/>
              </div>
              <input placeholder="Phone / WhatsApp" value={contactPhone} onChange={e=>setContactPhone(e.target.value)}
                style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13,marginBottom:16}}/>

              <SecT text="Urgency Level"/>
              <div style={{display:'flex',gap:10,marginBottom:8}}>
                {URGENCY.map(u=>(
                  <div key={u.id} onClick={()=>setUrgency(u.id)}
                    style={{flex:1,background:urgency===u.id?u.bg:'transparent',border:urgency===u.id?`1px solid ${u.border}`:'1px solid #1e3a52',borderRadius:8,padding:'12px 8px',cursor:'pointer',textAlign:'center'}}>
                    <div style={{color:urgency===u.id?u.color:'#8fa8c0',fontWeight:700,fontSize:13,textTransform:'uppercase'}}>{u.label}</div>
                    <div style={{color:urgency===u.id?u.color:'#4a6880',fontSize:10,marginTop:4}}>{u.time}</div>
                  </div>
                ))}
              </div>

              <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
                <button onClick={prevStep} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Back</button>
                <button onClick={nextStep} disabled={!location}
                  style={{background:!location?'rgba(221,46,30,0.45)':'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>
                  Next
                </button>
              </div>
            </div>
          )}

          {content==='details'&&(
            <div>
              <h2 style={{color:'#fff',fontWeight:800,fontSize:22,marginBottom:16,marginTop:0}}>Mission Details</h2>
              <input placeholder="Client / Assured Name" value={client} onChange={e=>setClient(e.target.value)}
                style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13,marginBottom:12}}/>

              <SecT text="Documents"/>
              <div style={{background:'#0f1e2e',border:'2px dashed #1e3a52',borderRadius:8,padding:20,textAlign:'center',cursor:'pointer',marginBottom:12}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#2a4f6e'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='#1e3a52'}
                onClick={()=>setDocs(p=>[...p,{name:`document_${p.length+1}.pdf`,size:'1.2 MB'}])}>
                <div style={{fontSize:24,marginBottom:6}}>📎</div>
                <div style={{color:'#8fa8c0',fontSize:12}}>Drop files or <span style={{color:'#dd2e1e'}}>click to attach</span></div>
                <div style={{color:'#4a6880',fontSize:10,marginTop:4}}>Packing List, Bill of Lading, CMR, Photos, Other</div>
              </div>
              {docs.length>0&&(
                <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:12}}>
                  {docs.map((d,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:10,background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'8px 12px'}}>
                      <span>📄</span>
                      <span style={{color:'#fff',fontSize:12,flex:1}}>{d.name}</span>
                      <span style={{color:'#4a6880',fontSize:11}}>{d.size}</span>
                      <button onClick={()=>setDocs(p=>p.filter((_,idx)=>idx!==i))} style={{background:'none',border:'none',color:'#dd2e1e',cursor:'pointer',fontSize:16}}>x</button>
                    </div>
                  ))}
                </div>
              )}

              <textarea placeholder="Additional notes, access conditions, special instructions..." value={notes} onChange={e=>setNotes(e.target.value)} rows={3}
                style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13,resize:'vertical',marginBottom:16}}/>

              <div style={{display:'flex',justifyContent:'space-between'}}>
                <button onClick={prevStep} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Back</button>
                <button onClick={nextStep} disabled={!client}
                  style={{background:!client?'rgba(221,46,30,0.45)':'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>
                  Review
                </button>
              </div>
            </div>
          )}

          {content==='review'&&(
            <div>
              <h2 style={{color:'#fff',fontWeight:800,fontSize:22,marginBottom:16,marginTop:0}}>Review & Submit</h2>
              {[
                ['Expertise Type', expertiseType==='cargo'?'Cargo Survey':'Vessel Survey'],
                ['Survey Subtype', expertiseType==='cargo'?expertiseSubtype:VESSEL_TYPES.find(v=>v.id===expertiseSubtype)?.label||''],
                ...(expertiseType==='cargo'?[
                  ['Loading Unit', loadingUnit+(tcType?` - ${tcType}`:'')],
                  ['Quantity', quantity],
                  ['Cargo Category', selectedCategory?.label||''],
                  ['Subcategory', cargoSubcategory||oogDescription||'Not specified'],
                  ['Damage Types', damages.join(', ')||'Not specified'],
                ]:[]),
                ['Location', location],
                ['Urgency', urgency.toUpperCase()],
                ['Client / Assured', client],
                ['On-Site Contact', contactName?`${contactName} - ${contactJob} - ${contactPhone}`:'Not specified'],
                ['Documents', `${docs.length} file(s) attached`],
                ['Notes', notes||'None'],
              ].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #1e3a52'}}>
                  <span style={{color:'#8fa8c0',fontSize:12,minWidth:140}}>{k}</span>
                  <span style={{color:'#fff',fontSize:12,textAlign:'right',maxWidth:'55%'}}>{v}</span>
                </div>
              ))}
              <div style={{marginTop:14,padding:'12px 16px',background:'rgba(240,165,0,0.12)',border:'1px solid #f0a500',borderRadius:8,display:'flex',gap:10}}>
                <span>⚡</span>
                <div>
                  <div style={{color:'#f0a500',fontWeight:700,fontSize:13}}>Surveyors available nearby</div>
                  <div style={{color:'#8fa8c0',fontSize:11,marginTop:3}}>First quote expected {urgency==='critical'?'within 12 hours':urgency==='urgent'?'within 24 hours':'within 48 hours'}.</div>
                </div>
              </div>
              {error&&<p style={{color:'#dd2e1e',fontSize:12,marginTop:12}}>{error}</p>}
              <div style={{display:'flex',justifyContent:'space-between',marginTop:14}}>
                <button onClick={prevStep} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Back</button>
                <button onClick={handleSubmit} disabled={loading}
                  style={{background:loading?'rgba(221,46,30,0.45)':'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'14px 32px',cursor:'pointer',fontWeight:700,fontSize:14}}>
                  {loading?'Sending...':'Send Request'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
