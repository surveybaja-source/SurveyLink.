'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function NewMission() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const [cargo, setCargo] = useState('')
  const [damages, setDamages] = useState([])
  const [client, setClient] = useState('')
  const [contact, setContact] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [location, setLocation] = useState('')
  const [urgency, setUrgency] = useState('normal')
  const [notes, setNotes] = useState('')

  const STEPS = ['Cargo','Location','Details','Review']

  const CARGO_TYPES = [
    {id:'bulk_grain',label:'Bulk — Grain',icon:'🌾',sub:'Wheat, corn, soybean, rice'},
    {id:'bulk_liquid',label:'Bulk — Liquid',icon:'🛢️',sub:'Oil, chemicals, fuel'},
    {id:'bulk_mineral',label:'Bulk — Mineral',icon:'⛏️',sub:'Coal, ore, sand, cement'},
    {id:'container_fcl',label:'Container FCL',icon:'📦',sub:'Full container load'},
    {id:'container_lcl',label:'Container LCL',icon:'🗃️',sub:'Less than container load'},
    {id:'reefer',label:'Reefer',icon:'❄️',sub:'Temperature-controlled cargo'},
    {id:'breakbulk',label:'Breakbulk',icon:'🚢',sub:'Non-containerised cargo'},
    {id:'roro',label:'RoRo',icon:'🚗',sub:'Roll-on / Roll-off vehicles'},
    {id:'tanker',label:'Tanker',icon:'🛳️',sub:'Liquid bulk / chemical tanker'},
    {id:'project',label:'Project Cargo',icon:'🏗️',sub:'Heavy lift / oversized cargo'},
  ]

  const DMG_TYPES = ['Water damage','Fire damage','Contamination','Mechanical damage','Shortage / Missing','Collision damage','Overheating','Condensation','Theft','Packaging damage']

  const URGENCY = [
    {id:'normal',label:'Normal',time:'Response within 4 hours',color:'#2e7d32',bg:'rgba(46,125,50,0.1)',border:'#2e7d32'},
    {id:'urgent',label:'Urgent',time:'Response within 1 hour',color:'#f0a500',bg:'rgba(240,165,0,0.1)',border:'#f0a500'},
    {id:'critical',label:'Critical',time:'Response within 15 min',color:'#dd2e1e',bg:'rgba(221,46,30,0.15)',border:'#dd2e1e'},
  ]

  const togDmg = d => setDamages(p => p.includes(d)?p.filter(x=>x!==d):[...p,d])

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    const ref = 'SL-' + Date.now()
    const { error } = await supabase.from('missions').insert({
      reference: ref,
      insurer_id: user.id,
      cargo_type: cargo,
      damage_types: damages,
      client_name: client,
      location_text: location,
      urgency: urgency,
      status: 'searching',
      notes: notes
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    setLoading(false)
  }

  const SecT = ({text}) => (
    <div style={{color:'#fff',fontWeight:700,fontSize:13,letterSpacing:'0.08em',textTransform:'uppercase',margin:'20px 0 12px',paddingBottom:8,borderBottom:'1px solid #1e3a52'}}>{text}</div>
  )

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh',padding:'32px 24px'}}>
      <div style={{maxWidth:680,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
          <button onClick={()=>step>0?setStep(s=>s-1):router.push('/dashboard')}
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
          {step===0&&(
            <div>
              <h2 style={{color:'#fff',fontWeight:800,fontSize:22,marginBottom:6,marginTop:0}}>Cargo Type & Damage</h2>
              <p style={{color:'#8fa8c0',fontSize:12,marginBottom:20}}>Select the type of cargo involved in this survey request.</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
                {CARGO_TYPES.map(c=>(
                  <div key={c.id} onClick={()=>setCargo(c.id)}
                    style={{background:cargo===c.id?'rgba(221,46,30,0.1)':'#0f1e2e',border:cargo===c.id?'2px solid #dd2e1e':'2px solid #1e3a52',borderRadius:10,padding:'12px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:12}}>
                    <span style={{fontSize:22}}>{c.icon}</span>
                    <div>
                      <div style={{color:cargo===c.id?'#dd2e1e':'#fff',fontWeight:700,fontSize:13}}>{c.label}</div>
                      <div style={{color:'#4a6880',fontSize:10,marginTop:2}}>{c.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              <SecT text="Type of Damage"/>
              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:20}}>
                {DMG_TYPES.map(d=>(
                  <div key={d} onClick={()=>togDmg(d)}
                    style={{background:damages.includes(d)?'rgba(221,46,30,0.1)':'transparent',border:damages.includes(d)?'1px solid #dd2e1e':'1px solid #1e3a52',color:damages.includes(d)?'#dd2e1e':'#8fa8c0',borderRadius:20,padding:'6px 14px',cursor:'pointer',fontSize:12}}>
                    {d}
                  </div>
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'flex-end'}}>
                <button onClick={()=>setStep(1)} disabled={!cargo}
                  style={{background:!cargo?'rgba(221,46,30,0.45)':'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step===1&&(
            <div>
              <h2 style={{color:'#fff',fontWeight:800,fontSize:22,marginBottom:16,marginTop:0}}>Cargo Location</h2>
              <div style={{marginBottom:12}}>
                <input id="location" placeholder="Port / Terminal / Address" value={location} onChange={e=>setLocation(e.target.value)}
                  style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13}}/>
              </div>
              <SecT text="Urgency Level"/>
              <div style={{display:'flex',gap:10,marginBottom:20}}>
                {URGENCY.map(u=>(
                  <div key={u.id} onClick={()=>setUrgency(u.id)}
                    style={{flex:1,background:urgency===u.id?u.bg:'transparent',border:urgency===u.id?`1px solid ${u.border}`:'1px solid #1e3a52',borderRadius:8,padding:'12px 8px',cursor:'pointer',textAlign:'center'}}>
                    <div style={{color:urgency===u.id?u.color:'#8fa8c0',fontWeight:700,fontSize:13,textTransform:'uppercase'}}>{u.label}</div>
                    <div style={{color:urgency===u.id?u.color:'#4a6880',fontSize:10,marginTop:4}}>{u.time}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <button onClick={()=>setStep(0)} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Back</button>
                <button onClick={()=>setStep(2)} disabled={!location}
                  style={{background:!location?'rgba(221,46,30,0.45)':'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step===2&&(
            <div>
              <h2 style={{color:'#fff',fontWeight:800,fontSize:22,marginBottom:16,marginTop:0}}>Mission Details</h2>
              <div style={{marginBottom:12}}>
                <input id="client" placeholder="Client / Assured Name" value={client} onChange={e=>setClient(e.target.value)}
                  style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13}}/>
              </div>
              <SecT text="On-Site Contact"/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <input id="contact" placeholder="Contact Name" value={contact} onChange={e=>setContact(e.target.value)}
                  style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13}}/>
                <input id="contactPhone" placeholder="Contact Phone / WhatsApp" value={contactPhone} onChange={e=>setContactPhone(e.target.value)}
                  style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13}}/>
              </div>
              <div style={{marginBottom:12}}>
                <textarea id="notes" placeholder="Describe the circumstances, extent of damage, access conditions, special instructions..." value={notes} onChange={e=>setNotes(e.target.value)} rows={4}
                  style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13,resize:'vertical'}}/>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
                <button onClick={()=>setStep(1)} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Back</button>
                <button onClick={()=>setStep(3)} disabled={!client}
                  style={{background:!client?'rgba(221,46,30,0.45)':'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>
                  Review
                </button>
              </div>
            </div>
          )}

          {step===3&&(
            <div>
              <h2 style={{color:'#fff',fontWeight:800,fontSize:22,marginBottom:16,marginTop:0}}>Review & Submit</h2>
              {[
                ['Cargo Type',CARGO_TYPES.find(c=>c.id===cargo)?.label||''],
                ['Damage Types',damages.join(', ')||'Not specified'],
                ['Location',location],
                ['Urgency',urgency.toUpperCase()],
                ['Client / Assured',client],
                ['On-Site Contact',contact||'Not specified'],
                ['Contact Phone',contactPhone||'Not specified'],
                ['Notes',notes||'None'],
              ].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #1e3a52'}}>
                  <span style={{color:'#8fa8c0',fontSize:12}}>{k}</span>
                  <span style={{color:'#fff',fontSize:12,textAlign:'right',maxWidth:'60%'}}>{v}</span>
                </div>
              ))}
              <div style={{marginTop:14,padding:'12px 16px',background:'rgba(240,165,0,0.12)',border:'1px solid #f0a500',borderRadius:8,display:'flex',gap:10}}>
                <span>⚡</span>
                <div>
                  <div style={{color:'#f0a500',fontWeight:700,fontSize:13}}>Surveyors available nearby</div>
                  <div style={{color:'#8fa8c0',fontSize:11,marginTop:3}}>First quote expected {urgency==='critical'?'within 15 min':urgency==='urgent'?'within 1 hour':'within 4 hours'}.</div>
                </div>
              </div>
              {error&&<p style={{color:'#dd2e1e',fontSize:12,marginTop:12}}>{error}</p>}
              <div style={{display:'flex',justifyContent:'space-between',marginTop:14}}>
                <button onClick={()=>setStep(2)} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Back</button>
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
