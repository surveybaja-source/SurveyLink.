'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { sendEmail, emailTemplates } from '../../lib/emails'
import FileUpload from '../components/FileUpload'
import Convocation from '../components/Convocation'
import Rating from '../components/Rating'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUser(user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile) setRole(profile.role)
      else setRole('insurer')
    }
    getUser()
  }, [])

  if (!user || !role) return (
    <div style={{background:'#0c1a27',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:'#8fa8c0'}}>Loading...</p>
    </div>
  )

  if (role === 'insurer') return <InsurerDashboard user={user}/>
  return <ExpertDashboard user={user}/>
}

function InsurerDashboard({user}) {
  const router = useRouter()
  const [missions, setMissions] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [quotes, setQuotes] = useState([])
  const [negotiateId, setNegotiateId] = useState(null)
  const [counterText, setCounterText] = useState('')
  const [declineId, setDeclineId] = useState(null)
  const [toast, setToast] = useState(null)
  const [ratedMissions, setRatedMissions] = useState([])
  const [activeTab, setActiveTab] = useState('missions')

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),3000) }

  useEffect(() => {
    getMissions()
    loadHistory()
    loadRatings()
    const channel = supabase
      .channel('missions-insurer')
      .on('postgres_changes', {event:'*',schema:'public',table:'missions'}, getMissions)
      .on('postgres_changes', {event:'*',schema:'public',table:'quotes'}, ()=>selected&&loadQuotes(selected.id))
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const getMissions = async () => {
    const { data } = await supabase
      .from('missions')
      .select('*')
      .eq('insurer_id', user.id)
      .not('status', 'in', '("completed","cancelled")')
      .order('created_at', {ascending: false})
    setMissions(data || [])
    setLoading(false)
  }

  const loadHistory = async () => {
    const { data } = await supabase
      .from('missions')
      .select('*, quotes(amount, status)')
      .eq('insurer_id', user.id)
      .in('status', ['completed','cancelled'])
      .order('created_at', {ascending: false})
    setHistory(data || [])
  }

  const loadRatings = async () => {
    const { data } = await supabase
      .from('ratings')
      .select('mission_id')
      .eq('insurer_id', user.id)
    setRatedMissions((data||[]).map(r=>r.mission_id))
  }

  const loadQuotes = async (missionId) => {
    const { data } = await supabase
      .from('quotes')
      .select('*, profiles(first_name, last_name, city, country, average_rating, total_ratings)')
      .eq('mission_id', missionId)
      .order('created_at', {ascending: false})
    setQuotes(data || [])
  }

  const selectMission = (m) => {
    setSelected(m)
    loadQuotes(m.id)
    setNegotiateId(null)
    setDeclineId(null)
  }

  const acceptQuote = async (quoteId, missionId) => {
    await supabase.from('quotes').update({status:'accepted'}).eq('id', quoteId)
    await supabase.from('quotes').update({status:'declined'}).neq('id', quoteId).eq('mission_id', missionId)
    await supabase.from('missions').update({status:'accepted'}).eq('id', missionId)
    const quote = quotes.find(q=>q.id===quoteId)
    if (quote) {
      const { data: expertProfile } = await supabase.from('profiles').select('email').eq('id', quote.expert_id).single()
      if (expertProfile?.email) {
        const tmpl = emailTemplates.quoteAccepted(selected.reference, selected.cargo_type, selected.location_text)
        await sendEmail(expertProfile.email, tmpl.subject, tmpl.html)
      }
    }
    loadQuotes(missionId)
    getMissions()
    showToast('Quote accepted — surveyor notified by email')
  }

  const declineQuote = async (quoteId, reason) => {
    await supabase.from('quotes').update({status:'declined', decline_reason: reason}).eq('id', quoteId)
    const quote = quotes.find(q=>q.id===quoteId)
    if (quote) {
      const { data: expertProfile } = await supabase.from('profiles').select('email').eq('id', quote.expert_id).single()
      if (expertProfile?.email) {
        const tmpl = emailTemplates.quoteDeclined(selected.reference, reason)
        await sendEmail(expertProfile.email, tmpl.subject, tmpl.html)
      }
    }
    setDeclineId(null)
    loadQuotes(selected.id)
    showToast('Quote declined — surveyor notified by email')
  }

  const sendCounter = async (quoteId, missionId) => {
    if (!counterText) return
    await supabase.from('quotes').update({status:'negotiating', counter_proposal: counterText}).eq('id', quoteId)
    await supabase.from('missions').update({status:'quoting'}).eq('id', missionId)
    const quote = quotes.find(q=>q.id===quoteId)
    if (quote) {
      const { data: expertProfile } = await supabase.from('profiles').select('email').eq('id', quote.expert_id).single()
      if (expertProfile?.email) {
        const tmpl = emailTemplates.counterProposal(selected.reference, counterText, quote.amount)
        await sendEmail(expertProfile.email, tmpl.subject, tmpl.html)
      }
    }
    setNegotiateId(null)
    setCounterText('')
    loadQuotes(missionId)
    showToast('Counter-proposal sent by email')
  }

  const cancelMission = async (missionId) => {
    await supabase.from('missions').update({cancelled: true, status: 'cancelled'}).eq('id', missionId)
    setSelected(null)
    getMissions()
    showToast('Mission cancelled')
  }

  const sLabel = {searching:'Searching...',quoting:'Quotes received',accepted:'Surveyor assigned',completed:'Completed',cancelled:'Cancelled'}
  const sColor = {searching:'#8fa8c0',quoting:'#f0a500',accepted:'#2e7d32',completed:'#5a9eff',cancelled:'#dd2e1e'}
  const DECLINE_REASONS = ['Mission cancelled','Price too high','Quote already validated with another provider']

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh'}}>
      {toast&&<div style={{position:'fixed',top:70,left:'50%',transform:'translateX(-50%)',background:'#2e7d32',color:'#fff',padding:'12px 24px',borderRadius:8,fontWeight:700,zIndex:999,fontSize:13,boxShadow:'0 4px 24px rgba(0,0,0,0.3)'}}>{toast}</div>}

      <nav style={{background:'#0f1e2e',borderBottom:'1px solid #1e3a52',padding:'0 32px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:20}}>
          <span style={{color:'#fff',fontWeight:900,fontSize:22}}>INSPE<span style={{color:'#dd2e1e'}}>LINK</span></span>
          <button onClick={()=>router.push('/missions/new')} style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,cursor:'pointer',fontWeight:700}}>
            + New Request
          </button>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>router.push('/profile')} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 16px',cursor:'pointer',fontSize:12}}>
            My Profile
          </button>
          <button onClick={()=>supabase.auth.signOut().then(()=>router.push('/auth'))}
            style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 16px',cursor:'pointer'}}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'32px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:32}}>
          {[
            ['Active Requests',missions.filter(m=>m.status!=='completed'&&m.status!=='cancelled').length,'','#f0a500'],
            ['Quotes Received',missions.filter(m=>m.status==='quoting').length,'awaiting review','#5a9eff'],
            ['Surveyors Assigned',missions.filter(m=>m.status==='accepted').length,'in progress','#2e7d32'],
            ['Completed',history.filter(m=>m.status==='completed').length,'all time','#8fa8c0']
          ].map(([label,val,sub,color])=>(
            <div key={label} style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:'16px 20px'}}>
              <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>{label}</div>
              <div style={{color,fontSize:26,fontWeight:800}}>{val}</div>
              <div style={{color:'#4a6880',fontSize:11,marginTop:4}}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:4,marginBottom:24}}>
          {[
            {k:'missions',l:'Active Missions'},
            {k:'history',l:`History (${history.length})`},
          ].map(tab=>(
            <button key={tab.k} onClick={()=>{setActiveTab(tab.k);setSelected(null)}}
              style={{background:activeTab===tab.k?'#dd2e1e':'transparent',color:activeTab===tab.k?'#fff':'#8fa8c0',border:`1px solid ${activeTab===tab.k?'#dd2e1e':'#1e3a52'}`,borderRadius:6,padding:'7px 18px',fontSize:12,cursor:'pointer',fontWeight:700}}>
              {tab.l}
            </button>
          ))}
        </div>

        {activeTab==='missions'&&(
          <div style={{display:'grid',gridTemplateColumns:selected?'1fr 1fr':'1fr',gap:24}}>
            <div>
              <h2 style={{color:'#fff',fontSize:22,fontWeight:800,marginBottom:16}}>My Requests</h2>
              {loading&&<p style={{color:'#8fa8c0'}}>Loading...</p>}
              {!loading&&missions.length===0&&(
                <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:36,textAlign:'center'}}>
                  <div style={{fontSize:32,marginBottom:12}}>📋</div>
                  <div style={{color:'#8fa8c0',fontSize:14}}>No active requests</div>
                  <button onClick={()=>router.push('/missions/new')} style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700,marginTop:16}}>
                    + New Request
                  </button>
                </div>
              )}
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {missions.map(m=>(
                  <div key={m.id} onClick={()=>selectMission(m)}
                    style={{background:'#132030',border:selected?.id===m.id?'1px solid #dd2e1e':'1px solid #1e3a52',borderRadius:12,padding:18,cursor:'pointer'}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='#dd2e1e'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=selected?.id===m.id?'#dd2e1e':'#1e3a52'}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                      <div>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                          <span style={{color:'#4a6880',fontSize:10}}>{m.reference}</span>
                          <span style={{background:m.urgency==='critical'?'rgba(221,46,30,0.12)':m.urgency==='urgent'?'rgba(240,165,0,0.12)':'rgba(26,108,240,0.12)',color:m.urgency==='critical'?'#dd2e1e':m.urgency==='urgent'?'#f0a500':'#5a9eff',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700,textTransform:'uppercase'}}>{m.urgency}</span>
                          <span style={{background:'#1e3a52',color:sColor[m.status]||'#8fa8c0',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700}}>{sLabel[m.status]||m.status}</span>
                        </div>
                        <div style={{color:'#fff',fontWeight:700,fontSize:18}}>{m.cargo_type}</div>
                        <div style={{color:'#8fa8c0',fontSize:12,marginTop:2}}>{m.damage_types?.join(', ')} - {m.client_name}</div>
                      </div>
                      <span style={{color:'#4a6880',fontSize:11}}>{new Date(m.created_at).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div style={{color:'#8fa8c0',fontSize:12}}>📍 {m.location_text}</div>
                  </div>
                ))}
              </div>
            </div>

            {selected&&(
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                  <h2 style={{color:'#fff',fontSize:20,fontWeight:800,margin:0}}>Quotes - {selected.reference}</h2>
                  <div style={{display:'flex',gap:8}}>
                    {!selected.cancelled&&selected.status!=='completed'&&(
                      <button onClick={()=>{if(window.confirm('Cancel this mission?'))cancelMission(selected.id)}}
                        style={{background:'transparent',color:'#dd2e1e',border:'1px solid #dd2e1e',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:11,fontWeight:700}}>
                        Cancel
                      </button>
                    )}
                    <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',color:'#8fa8c0',cursor:'pointer',fontSize:20}}>x</button>
                  </div>
                </div>

                <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:8,padding:'10px 14px',marginBottom:14}}>
                  <div style={{color:'#4a6880',fontSize:9,marginBottom:2}}>LOCATION</div>
                  <div style={{color:'#8fa8c0',fontSize:12}}>📍 {selected.location_text}</div>
                </div>

                {selected.documents&&selected.documents.length>0&&(
                  <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:8,padding:'10px 14px',marginBottom:14}}>
                    <div style={{color:'#4a6880',fontSize:9,marginBottom:8,letterSpacing:'0.1em',textTransform:'uppercase'}}>MISSION DOCUMENTS</div>
                    <div style={{display:'flex',flexDirection:'column',gap:6}}>
                      {selected.documents.map((path,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}
                          onClick={async()=>{
                            const {data} = await supabase.storage.from('mission-docs').createSignedUrl(path,3600)
                            if(data?.signedUrl) window.open(data.signedUrl,'_blank')
                          }}>
                          <span>📄</span>
                          <span style={{color:'#5a9eff',fontSize:12,textDecoration:'underline'}}>{path.split('/').pop()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {quotes.length===0&&(
                  <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:36,textAlign:'center'}}>
                    <div style={{fontSize:32,marginBottom:12}}>⏳</div>
                    <div style={{color:'#8fa8c0',fontSize:13}}>Notifying nearby surveyors...</div>
                  </div>
                )}

                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {quotes.map(q=>(
                    <div key={q.id} style={{background:'#132030',border:q.status==='accepted'?'1px solid #2e7d32':q.status==='declined'?'1px solid #700300':q.status==='negotiating'?'1px solid #f0a500':'1px solid #1e3a52',borderRadius:12,padding:16}}>
                      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                        <div style={{width:42,height:42,borderRadius:'50%',background:'linear-gradient(135deg,#182e44,#dd2e1e)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:13}}>
                          {q.profiles?.first_name?.[0]}{q.profiles?.last_name?.[0]}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{color:'#fff',fontWeight:700}}>{q.profiles?.first_name} {q.profiles?.last_name}</div>
                          <div style={{display:'flex',alignItems:'center',gap:10,marginTop:2}}>
                            <span style={{color:'#4a6880',fontSize:11}}>{q.profiles?.city}, {q.profiles?.country}</span>
                            {q.profiles?.average_rating>0?(
                              <span style={{display:'flex',alignItems:'center',gap:4}}>
                                <span style={{color:'#f0a500',fontSize:12}}>★</span>
                                <span style={{color:'#f0a500',fontSize:12,fontWeight:700}}>{q.profiles.average_rating.toFixed(1)}</span>
                                <span style={{color:'#4a6880',fontSize:10}}>({q.profiles.total_ratings})</span>
                              </span>
                            ):(
                              <span style={{color:'#4a6880',fontSize:10,fontStyle:'italic'}}>No rating yet</span>
                            )}
                          </div>
                        </div>
                        {q.status==='accepted'&&(
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <span style={{background:'rgba(46,125,50,0.12)',border:'1px solid #2e7d32',color:'#81c784',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700}}>ACCEPTED</span>
                            {!q.deposit_paid&&(
                              <button onClick={(e)=>{e.stopPropagation();router.push(`/payment?quote=${q.id}`)}}
                                style={{background:'#f0a500',color:'#000',border:'none',borderRadius:6,padding:'4px 12px',cursor:'pointer',fontSize:11,fontWeight:700}}>
                                Pay Deposit 20%
                              </button>
                            )}
                            {q.deposit_paid&&(
                              <span style={{background:'rgba(240,165,0,0.12)',border:'1px solid #f0a500',color:'#f0a500',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700}}>DEPOSIT PAID</span>
                            )}
                          </div>
                        )}
                        {q.status==='declined'&&<span style={{background:'rgba(221,46,30,0.12)',border:'1px solid #dd2e1e',color:'#ef9a9a',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700}}>DECLINED</span>}
                        {q.status==='negotiating'&&<span style={{background:'rgba(240,165,0,0.12)',border:'1px solid #f0a500',color:'#f0a500',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700}}>NEGOTIATING</span>}
                        {q.status==='pending'&&<span style={{background:'rgba(107,127,163,0.1)',border:'1px solid #1e3a52',color:'#8fa8c0',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700}}>PENDING</span>}
                      </div>

                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                        <div style={{background:'#0f1e2e',borderRadius:8,padding:'10px 14px'}}>
                          <div style={{color:'#4a6880',fontSize:9,marginBottom:3}}>QUOTED RATE</div>
                          <div style={{color:'#f0a500',fontSize:20,fontWeight:800}}>{q.currency} {q.amount?.toLocaleString()}</div>
                        </div>
                        <div style={{background:'#0f1e2e',borderRadius:8,padding:'10px 14px'}}>
                          <div style={{color:'#4a6880',fontSize:9,marginBottom:3}}>PROPOSED DATE</div>
                          <div style={{color:'#fff',fontSize:13,fontWeight:700}}>{q.proposed_datetime?new Date(q.proposed_datetime).toLocaleString('en-GB'):'Not specified'}</div>
                        </div>
                      </div>

                      {q.status==='accepted'&&q.deposit_paid&&(
                        <div style={{background:'rgba(240,165,0,0.08)',border:'1px solid #f0a500',borderRadius:8,padding:'10px 14px',marginBottom:10}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                            <span style={{color:'#f0a500',fontSize:11,fontWeight:700}}>Deposit paid (20%)</span>
                            <span style={{color:'#2e7d32',fontSize:11,fontWeight:700}}>EUR {Math.round(q.amount*0.20).toLocaleString()} ✓</span>
                          </div>
                          <div style={{display:'flex',justifyContent:'space-between'}}>
                            <span style={{color:'#8fa8c0',fontSize:11}}>Balance on final report (80%)</span>
                            <span style={{color:'#8fa8c0',fontSize:11}}>EUR {Math.round(q.amount*0.80).toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      {q.note&&(
                        <div style={{background:'#0f1e2e',borderRadius:6,padding:'8px 12px',marginBottom:10}}>
                          <div style={{color:'#4a6880',fontSize:9,marginBottom:2}}>NOTE FROM SURVEYOR</div>
                          <div style={{color:'#8fa8c0',fontSize:12,lineHeight:1.5}}>{q.note}</div>
                        </div>
                      )}

                      {q.counter_proposal&&(
                        <div style={{background:'rgba(240,165,0,0.08)',border:'1px solid #f0a500',borderRadius:6,padding:'8px 12px',marginBottom:10}}>
                          <div style={{color:'#f0a500',fontSize:9,marginBottom:2,fontWeight:700}}>YOUR COUNTER-PROPOSAL</div>
                          <div style={{color:'#8fa8c0',fontSize:12,lineHeight:1.5}}>{q.counter_proposal}</div>
                        </div>
                      )}

                      {q.decline_reason&&(
                        <div style={{background:'rgba(221,46,30,0.08)',border:'1px solid #700300',borderRadius:6,padding:'8px 12px',marginBottom:10}}>
                          <div style={{color:'#dd2e1e',fontSize:9,marginBottom:2,fontWeight:700}}>DECLINE REASON</div>
                          <div style={{color:'#8fa8c0',fontSize:12}}>{q.decline_reason}</div>
                        </div>
                      )}

                      {selected.status==='completed'&&q.status==='accepted'&&!ratedMissions.includes(selected.id)&&(
                        <div style={{marginTop:10}}>
                          <Rating missionId={selected.id} expertId={q.expert_id} insurerId={user.id} onRated={()=>{loadRatings();showToast('Rating submitted!')}}/>
                        </div>
                      )}

                      {selected.status==='completed'&&q.status==='accepted'&&ratedMissions.includes(selected.id)&&(
                        <div style={{marginTop:10,background:'rgba(46,125,50,0.08)',border:'1px solid #2e7d32',borderRadius:8,padding:'10px 14px',textAlign:'center'}}>
                          <span style={{color:'#2e7d32',fontSize:12,fontWeight:700}}>✓ Mission rated — thank you!</span>
                        </div>
                      )}

                      {q.status==='pending'&&negotiateId!==q.id&&declineId!==q.id&&(
                        <div style={{display:'flex',gap:8}}>
                          <button onClick={()=>{setDeclineId(q.id);setNegotiateId(null)}} style={{flex:1,background:'transparent',color:'#dd2e1e',border:'1px solid #dd2e1e',borderRadius:7,padding:'9px',cursor:'pointer',fontWeight:700,fontSize:12}}>Decline</button>
                          <button onClick={()=>{setNegotiateId(q.id);setDeclineId(null)}} style={{flex:1,background:'transparent',color:'#f0a500',border:'1px solid #f0a500',borderRadius:7,padding:'9px',cursor:'pointer',fontWeight:700,fontSize:12}}>Negotiate</button>
                          <button onClick={()=>acceptQuote(q.id, selected.id)} style={{flex:1,background:'#2e7d32',color:'#fff',border:'none',borderRadius:7,padding:'9px',cursor:'pointer',fontWeight:700,fontSize:12}}>Accept</button>
                        </div>
                      )}

                      {declineId===q.id&&(
                        <div style={{marginTop:8}}>
                          <div style={{color:'#8fa8c0',fontSize:11,marginBottom:8,fontWeight:700}}>Select reason for declining:</div>
                          {DECLINE_REASONS.map(r=>(
                            <button key={r} onClick={()=>declineQuote(q.id, r)}
                              style={{display:'block',width:'100%',background:'rgba(221,46,30,0.08)',color:'#ef9a9a',border:'1px solid #700300',borderRadius:6,padding:'9px 14px',cursor:'pointer',marginBottom:6,textAlign:'left',fontSize:12}}>
                              {r}
                            </button>
                          ))}
                          <button onClick={()=>setDeclineId(null)} style={{background:'transparent',color:'#8fa8c0',border:'none',cursor:'pointer',fontSize:11,marginTop:4}}>Cancel</button>
                        </div>
                      )}

                      {negotiateId===q.id&&(
                        <div style={{marginTop:8}}>
                          <div style={{color:'#8fa8c0',fontSize:11,marginBottom:8,fontWeight:700}}>Your counter-proposal:</div>
                          <textarea placeholder="Explain your counter-proposal..." value={counterText} onChange={e=>setCounterText(e.target.value)} rows={3}
                            style={{width:'100%',background:'#0f1e2e',border:'1px solid #f0a500',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:12,resize:'vertical',marginBottom:8}}/>
                          <div style={{display:'flex',gap:8}}>
                            <button onClick={()=>{setNegotiateId(null);setCounterText('')}} style={{flex:1,background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:6,padding:'8px',cursor:'pointer',fontSize:12}}>Cancel</button>
                            <button onClick={()=>sendCounter(q.id, selected.id)} disabled={!counterText}
                              style={{flex:2,background:!counterText?'rgba(240,165,0,0.45)':'#f0a500',color:'#000',border:'none',borderRadius:6,padding:'8px',cursor:'pointer',fontWeight:700,fontSize:12}}>
                              Send Counter-Proposal
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab==='history'&&(
          <div>
            <h2 style={{color:'#fff',fontSize:22,fontWeight:800,marginBottom:16}}>Mission History</h2>
            {history.length===0&&(
              <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:36,textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:12}}>📂</div>
                <div style={{color:'#8fa8c0',fontSize:14}}>No completed missions yet</div>
              </div>
            )}
            {history.length>0&&(
              <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{background:'#0f1e2e'}}>
                      {['Reference','Date','Client','Cargo','Location','Amount','Status'].map(h=>(
                        <th key={h} style={{padding:'10px 14px',color:'#4a6880',fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',textAlign:'left',borderBottom:'1px solid #1e3a52'}}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((m,i)=>{
                      const acceptedQuote = m.quotes?.find(q=>q.status==='accepted')
                      return (
                        <tr key={m.id} style={{borderBottom:'1px solid #1e3a52',background:i%2===0?'transparent':'rgba(255,255,255,0.01)'}}>
                          <td style={{padding:'10px 14px',color:'#5a9eff',fontSize:12,fontFamily:'monospace'}}>{m.reference}</td>
                          <td style={{padding:'10px 14px',color:'#8fa8c0',fontSize:12}}>{new Date(m.created_at).toLocaleDateString('en-GB')}</td>
                          <td style={{padding:'10px 14px',color:'#fff',fontSize:12,fontWeight:600}}>{m.client_name||'—'}</td>
                          <td style={{padding:'10px 14px',color:'#8fa8c0',fontSize:12}}>{m.cargo_type||'—'}</td>
                          <td style={{padding:'10px 14px',color:'#8fa8c0',fontSize:12}}>{m.location_place||m.location_text?.split(',')[0]||'—'}</td>
                          <td style={{padding:'10px 14px',color:'#f0a500',fontSize:12,fontWeight:700}}>{acceptedQuote?`EUR ${acceptedQuote.amount?.toLocaleString()}`:'—'}</td>
                          <td style={{padding:'10px 14px'}}>
                            <span style={{background:m.status==='completed'?'rgba(46,125,50,0.12)':'rgba(221,46,30,0.12)',border:`1px solid ${m.status==='completed'?'#2e7d32':'#dd2e1e'}`,color:m.status==='completed'?'#81c784':'#ef9a9a',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700,textTransform:'uppercase'}}>
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ExpertDashboard({user}) {
  const router = useRouter()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [myQuotes, setMyQuotes] = useState([])
  const [history, setHistory] = useState([])
  const [quoting, setQuoting] = useState(null)
  const [amount, setAmount] = useState('')
  const [proposedDatetime, setProposedDatetime] = useState('')
  const [note, setNote] = useState('')
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('available')

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),3000) }

  useEffect(() => {
    loadAll()
    const channel = supabase
      .channel('expert-dashboard')
      .on('postgres_changes', {event:'INSERT',schema:'public',table:'missions'}, loadAll)
      .on('postgres_changes', {event:'UPDATE',schema:'public',table:'quotes'}, loadAll)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const loadAll = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('coverage_countries')
      .eq('id', user.id)
      .single()

    const countries = profile?.coverage_countries || []

    let query = supabase
      .from('missions')
      .select('*')
      .in('status', ['searching','quoting'])
      .eq('cancelled', false)
      .order('created_at', {ascending: false})

    if (countries.length > 0) {
      query = query.in('location_country', countries)
    }

    const { data: avail } = await query
    setMissions(avail || [])

    const { data: myQ } = await supabase
      .from('quotes')
      .select('*, missions(*, survey_reports(*))')
      .eq('expert_id', user.id)
      .order('created_at', {ascending: false})
    setMyQuotes(myQ || [])

    const { data: hist } = await supabase
      .from('quotes')
      .select('*, missions(*)')
      .eq('expert_id', user.id)
      .eq('status', 'accepted')
      .order('created_at', {ascending: false})
    setHistory((hist||[]).filter(q=>q.missions?.status==='completed'))

    setLoading(false)
  }

  const submitQuote = async (missionId) => {
    if (!amount) return
    const { error } = await supabase.from('quotes').insert({
      mission_id: missionId,
      expert_id: user.id,
      amount: parseFloat(amount),
      currency: 'EUR',
      proposed_datetime: proposedDatetime||null,
      note: note,
      status: 'pending'
    })
    if (!error) {
      await supabase.from('missions').update({status:'quoting'}).eq('id', missionId)
      const mission = missions.find(m=>m.id===missionId)
      if (mission) {
        const { data: insurerProfile } = await supabase.from('profiles').select('email').eq('id', mission.insurer_id).single()
        const { data: expertProfile } = await supabase.from('profiles').select('email, first_name, last_name').eq('id', user.id).single()
        if (insurerProfile?.email && expertProfile) {
          const surveyorName = `${expertProfile.first_name} ${expertProfile.last_name}`
          const tmpl = emailTemplates.newQuoteReceived(mission.reference, surveyorName, parseFloat(amount))
          await sendEmail(insurerProfile.email, tmpl.subject, tmpl.html)
        }
      }
      setQuoting(null)
      setAmount('')
      setProposedDatetime('')
      setNote('')
      showToast('Quote submitted — insurer notified by email!')
      loadAll()
    }
  }

  const respondToCounter = async (quoteId, accept) => {
    await supabase.from('quotes').update({
      status: accept ? 'accepted' : 'declined',
      counter_status: accept ? 'accepted' : 'declined'
    }).eq('id', quoteId)
    if (accept) {
      const quote = myQuotes.find(q=>q.id===quoteId)
      if (quote) await supabase.from('missions').update({status:'accepted'}).eq('id', quote.mission_id)
    }
    showToast(accept ? 'Counter-proposal accepted!' : 'Counter-proposal declined')
    loadAll()
  }

  const alreadyQuotedIds = myQuotes.map(q=>q.mission_id)
  const availableMissions = missions.filter(m=>!alreadyQuotedIds.includes(m.id))
  const acceptedQuotes = myQuotes.filter(q=>q.status==='accepted'&&q.missions?.status!=='completed')
  const pendingQuotes = myQuotes.filter(q=>q.status==='pending'||q.status==='negotiating')

  const statusColor = {pending:'#8fa8c0',negotiating:'#f0a500',accepted:'#2e7d32',declined:'#dd2e1e'}
  const statusLabel = {pending:'Pending',negotiating:'Counter-Proposal Received',accepted:'Accepted',declined:'Declined'}

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh'}}>
      {toast&&<div style={{position:'fixed',top:70,left:'50%',transform:'translateX(-50%)',background:'#2e7d32',color:'#fff',padding:'12px 24px',borderRadius:8,fontWeight:700,zIndex:999,fontSize:13,boxShadow:'0 4px 24px rgba(0,0,0,0.3)'}}>{toast}</div>}

      <nav style={{background:'#0f1e2e',borderBottom:'1px solid #1e3a52',padding:'0 32px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:20}}>
          <span style={{color:'#fff',fontWeight:900,fontSize:22}}>INSPE<span style={{color:'#dd2e1e'}}>LINK</span></span>
          <div style={{display:'flex',gap:4}}>
            {[
              {k:'available',l:'Available Missions'},
              {k:'myquotes',l:pendingQuotes.length>0?`My Quotes (${pendingQuotes.length})`:'My Quotes'},
              {k:'active',l:acceptedQuotes.length>0?`Active Missions (${acceptedQuotes.length})`:'Active Missions'},
              {k:'history',l:history.length>0?`History (${history.length})`:'History'},
            ].map(tab=>(
              <button key={tab.k} onClick={()=>setActiveTab(tab.k)}
                style={{background:activeTab===tab.k?'#dd2e1e':'transparent',color:activeTab===tab.k?'#fff':'#8fa8c0',border:`1px solid ${activeTab===tab.k?'#dd2e1e':'#1e3a52'}`,borderRadius:6,padding:'5px 12px',fontSize:11,cursor:'pointer',fontWeight:700}}>
                {tab.l}
              </button>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>router.push('/profile')} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 16px',cursor:'pointer',fontSize:12}}>
            My Profile
          </button>
          <button onClick={()=>supabase.auth.signOut().then(()=>router.push('/auth'))}
            style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 16px',cursor:'pointer'}}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'32px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:32}}>
          {[
            ['Available',availableMissions.length,'new requests','#f0a500'],
            ['Quotes Sent',myQuotes.filter(q=>q.status==='pending').length,'awaiting response','#5a9eff'],
            ['Active Missions',acceptedQuotes.length,'in progress','#2e7d32'],
            ['Completed',history.length,'all time','#8fa8c0']
          ].map(([label,val,sub,color])=>(
            <div key={label} style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:'16px 20px'}}>
              <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>{label}</div>
              <div style={{color,fontSize:26,fontWeight:800}}>{val}</div>
              <div style={{color:'#4a6880',fontSize:11,marginTop:4}}>{sub}</div>
            </div>
          ))}
        </div>

        {activeTab==='available'&&(
          <div style={{display:'grid',gridTemplateColumns:quoting?'1fr 1fr':'1fr',gap:24}}>
            <div>
              <h2 style={{color:'#fff',fontSize:22,fontWeight:800,marginBottom:16}}>Available Requests</h2>
              {loading&&<p style={{color:'#8fa8c0'}}>Loading...</p>}
              {!loading&&availableMissions.length===0&&(
                <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:36,textAlign:'center'}}>
                  <div style={{fontSize:32,marginBottom:12}}>📭</div>
                  <div style={{color:'#8fa8c0',fontSize:14}}>No requests available at the moment</div>
                </div>
              )}
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {availableMissions.map(m=>(
                  <div key={m.id} style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:20}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                      <div>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                          <span style={{color:'#4a6880',fontSize:10}}>{m.reference}</span>
                          <span style={{background:m.urgency==='critical'?'rgba(221,46,30,0.12)':m.urgency==='urgent'?'rgba(240,165,0,0.12)':'rgba(26,108,240,0.12)',color:m.urgency==='critical'?'#dd2e1e':m.urgency==='urgent'?'#f0a500':'#5a9eff',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700,textTransform:'uppercase'}}>{m.urgency}</span>
                        </div>
                        <div style={{color:'#fff',fontWeight:700,fontSize:18}}>{m.cargo_type}</div>
                        <div style={{color:'#8fa8c0',fontSize:12,marginTop:2}}>{m.damage_types?.join(', ')}</div>
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
                      <div style={{background:'#0f1e2e',borderRadius:7,padding:'8px 12px'}}>
                        <div style={{color:'#4a6880',fontSize:9,marginBottom:2}}>PORT / CITY</div>
                        <div style={{color:'#e8edf5',fontSize:11}}>{m.location_place||m.location_text?.split(',')[0]||m.location_text}</div>
                      </div>
                      <div style={{background:'#0f1e2e',borderRadius:7,padding:'8px 12px'}}>
                        <div style={{color:'#4a6880',fontSize:9,marginBottom:2}}>LOADING UNIT</div>
                        <div style={{color:'#e8edf5',fontSize:11}}>{m.loading_unit?`${m.loading_unit}${m.tc_type?` - ${m.tc_type}`:''}${m.loading_quantity?` - ${m.loading_quantity}`:''}`:'-'}</div>
                      </div>
                    </div>
                    <button onClick={()=>{setQuoting(m);setAmount('');setProposedDatetime('');setNote('');}}
                      style={{width:'100%',background:'#2e7d32',color:'#fff',border:'none',borderRadius:7,padding:'10px',cursor:'pointer',fontWeight:700}}>
                      Submit a Quote
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {quoting&&(
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                  <h2 style={{color:'#fff',fontSize:22,fontWeight:800,margin:0}}>Submit Quote</h2>
                  <button onClick={()=>setQuoting(null)} style={{background:'none',border:'none',color:'#8fa8c0',cursor:'pointer',fontSize:20}}>x</button>
                </div>
                <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:24}}>
                  <div style={{background:'#0f1e2e',borderRadius:7,padding:'10px 14px',marginBottom:18}}>
                    <div style={{color:'#4a6880',fontSize:9,marginBottom:3}}>MISSION</div>
                    <div style={{color:'#dd2e1e',fontWeight:700}}>{quoting.reference}</div>
                    <div style={{color:'#8fa8c0',fontSize:12,marginTop:2}}>{quoting.cargo_type} - {quoting.location_place||quoting.location_text?.split(',')[0]}</div>
                  </div>
                  <div style={{marginBottom:16}}>
                    <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>Lump Sum Fee (EUR) *</div>
                    <div style={{position:'relative'}}>
                      <div style={{position:'absolute',left:0,top:0,bottom:0,width:50,background:'#1e3a52',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'6px 0 0 6px',color:'#8fa8c0',fontWeight:700,fontSize:13}}>EUR</div>
                      <input type="number" placeholder="0" value={amount} onChange={e=>setAmount(e.target.value)}
                        style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:7,padding:'14px 14px 14px 64px',color:'#f0a500',fontSize:26,fontWeight:800,outline:'none',boxSizing:'border-box'}}/>
                    </div>
                  </div>
                  <div style={{marginBottom:12}}>
                    <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>Proposed Date & Time *</div>
                    <input type="datetime-local" value={proposedDatetime} onChange={e=>setProposedDatetime(e.target.value)}
                      style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13}}/>
                  </div>
                  <div style={{marginBottom:12}}>
                    <textarea placeholder="Note to insurer..." value={note} onChange={e=>setNote(e.target.value)} rows={3}
                      style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13,resize:'vertical'}}/>
                  </div>
                  {amount&&(
                    <div style={{marginBottom:14,padding:'10px 14px',background:'rgba(240,165,0,0.12)',border:'1px solid #f0a500',borderRadius:7}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                        <span style={{color:'#8fa8c0',fontSize:12}}>Total Quote</span>
                        <span style={{color:'#f0a500',fontWeight:800,fontSize:20}}>EUR {parseInt(amount).toLocaleString()}</span>
                      </div>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{color:'#4a6880',fontSize:11}}>Deposit (20%) — on acceptance</span>
                        <span style={{color:'#4a6880',fontSize:11}}>EUR {Math.round(parseInt(amount)*0.20).toLocaleString()}</span>
                      </div>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{color:'#4a6880',fontSize:11}}>Balance (80%) — on final report</span>
                        <span style={{color:'#4a6880',fontSize:11}}>EUR {Math.round(parseInt(amount)*0.80).toLocaleString()}</span>
                      </div>
                      <div style={{display:'flex',justifyContent:'space-between'}}>
                        <span style={{color:'#4a6880',fontSize:11}}>Platform fee (1%)</span>
                        <span style={{color:'#4a6880',fontSize:11}}>- EUR {Math.round(parseInt(amount)*0.01).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  <button onClick={()=>submitQuote(quoting.id)} disabled={!amount||!proposedDatetime}
                    style={{width:'100%',background:(!amount||!proposedDatetime)?'rgba(221,46,30,0.45)':'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'14px',cursor:'pointer',fontWeight:700,fontSize:14}}>
                    Send Quote
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab==='myquotes'&&(
          <div>
            <h2 style={{color:'#fff',fontSize:22,fontWeight:800,marginBottom:16}}>My Quotes</h2>
            {myQuotes.filter(q=>q.missions?.status!=='completed').length===0&&(
              <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:36,textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:12}}>📝</div>
                <div style={{color:'#8fa8c0',fontSize:14}}>No quotes submitted yet</div>
              </div>
            )}
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {myQuotes.filter(q=>q.missions?.status!=='completed').map(q=>(
                <div key={q.id} style={{background:'#132030',border:q.status==='accepted'?'1px solid #2e7d32':q.status==='negotiating'?'1px solid #f0a500':q.status==='declined'?'1px solid #700300':'1px solid #1e3a52',borderRadius:12,padding:20}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <div>
                      <div style={{color:'#4a6880',fontSize:10,marginBottom:4}}>{q.missions?.reference}</div>
                      <div style={{color:'#fff',fontWeight:700,fontSize:16}}>{q.missions?.cargo_type}</div>
                      <div style={{color:'#8fa8c0',fontSize:12,marginTop:2}}>{q.missions?.location_place||q.missions?.location_text?.split(',')[0]}</div>
                    </div>
                    <span style={{background:'#1e3a52',color:statusColor[q.status]||'#8fa8c0',padding:'3px 12px',borderRadius:4,fontSize:10,fontWeight:700,textTransform:'uppercase'}}>
                      {statusLabel[q.status]||q.status}
                    </span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                    <div style={{background:'#0f1e2e',borderRadius:7,padding:'8px 12px'}}>
                      <div style={{color:'#4a6880',fontSize:9,marginBottom:2}}>YOUR QUOTE</div>
                      <div style={{color:'#f0a500',fontSize:16,fontWeight:800}}>EUR {q.amount?.toLocaleString()}</div>
                    </div>
                    <div style={{background:'#0f1e2e',borderRadius:7,padding:'8px 12px'}}>
                      <div style={{color:'#4a6880',fontSize:9,marginBottom:2}}>PROPOSED DATE</div>
                      <div style={{color:'#fff',fontSize:11}}>{q.proposed_datetime?new Date(q.proposed_datetime).toLocaleString('en-GB'):'Not specified'}</div>
                    </div>
                  </div>

                  {q.status==='accepted'&&(
                    <div style={{background:'rgba(240,165,0,0.08)',border:'1px solid #f0a500',borderRadius:8,padding:'10px 14px',marginBottom:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{color:'#f0a500',fontSize:11,fontWeight:700}}>Deposit (20%)</span>
                        <span style={{color:q.deposit_paid?'#2e7d32':'#f0a500',fontSize:11,fontWeight:700}}>
                          EUR {Math.round(q.amount*0.20).toLocaleString()} {q.deposit_paid?'✓ Received':'— Pending'}
                        </span>
                      </div>
                      <div style={{display:'flex',justifyContent:'space-between'}}>
                        <span style={{color:'#8fa8c0',fontSize:11}}>Balance (80%)</span>
                        <span style={{color:'#8fa8c0',fontSize:11}}>EUR {Math.round(q.amount*0.80).toLocaleString()} — on final report</span>
                      </div>
                    </div>
                  )}

                  {q.status==='negotiating'&&q.counter_proposal&&(
                    <div style={{background:'rgba(240,165,0,0.08)',border:'1px solid #f0a500',borderRadius:8,padding:'12px 14px',marginBottom:12}}>
                      <div style={{color:'#f0a500',fontSize:10,fontWeight:700,marginBottom:6}}>COUNTER-PROPOSAL FROM INSURER</div>
                      <div style={{color:'#8fa8c0',fontSize:12,lineHeight:1.5,marginBottom:12}}>{q.counter_proposal}</div>
                      <div style={{display:'flex',gap:8}}>
                        <button onClick={()=>respondToCounter(q.id, false)} style={{flex:1,background:'transparent',color:'#dd2e1e',border:'1px solid #dd2e1e',borderRadius:6,padding:'9px',cursor:'pointer',fontWeight:700,fontSize:12}}>Decline</button>
                        <button onClick={()=>respondToCounter(q.id, true)} style={{flex:1,background:'#2e7d32',color:'#fff',border:'none',borderRadius:6,padding:'9px',cursor:'pointer',fontWeight:700,fontSize:12}}>Accept Counter-Proposal</button>
                      </div>
                    </div>
                  )}

                  {q.status==='declined'&&q.decline_reason&&(
                    <div style={{background:'rgba(221,46,30,0.08)',border:'1px solid #700300',borderRadius:6,padding:'8px 12px'}}>
                      <div style={{color:'#dd2e1e',fontSize:9,fontWeight:700,marginBottom:2}}>REASON FOR DECLINE</div>
                      <div style={{color:'#8fa8c0',fontSize:12}}>{q.decline_reason}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab==='active'&&(
          <div>
            <h2 style={{color:'#fff',fontSize:22,fontWeight:800,marginBottom:16}}>Active Missions</h2>
            {acceptedQuotes.length===0&&(
              <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:36,textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:12}}>🗂️</div>
                <div style={{color:'#8fa8c0',fontSize:14}}>No active missions yet</div>
              </div>
            )}
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {acceptedQuotes.map(q=>(
                <div key={q.id} style={{background:'#132030',border:'1px solid #2e7d32',borderRadius:12,padding:24}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                    <div>
                      <div style={{color:'#2e7d32',fontSize:10,fontWeight:700,marginBottom:4}}>MISSION ACCEPTED</div>
                      <div style={{color:'#fff',fontWeight:700,fontSize:20}}>{q.missions?.cargo_type}</div>
                      <div style={{color:'#8fa8c0',fontSize:12,marginTop:2}}>{q.missions?.reference}</div>
                    </div>
                    <span style={{background:'rgba(46,125,50,0.12)',border:'1px solid #2e7d32',color:'#81c784',padding:'3px 12px',borderRadius:4,fontSize:10,fontWeight:700}}>IN PROGRESS</span>
                  </div>

                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
                    {[
                      ['Full Address',q.missions?.location_text||'-'],
                      ['Client / Assured',q.missions?.client_name||'-'],
                      ['Expertise Type',q.missions?.expertise_type==='cargo'?`Cargo - ${q.missions?.expertise_subtype||''}`:q.missions?.expertise_subtype||'-'],
                      ['Loading Unit',q.missions?.loading_unit?(q.missions.loading_unit+(q.missions.tc_type?` - ${q.missions.tc_type}`:'')):'—'],
                      ['Quantity',q.missions?.loading_quantity||'-'],
                      ['Cargo Category',q.missions?.cargo_category||'-'],
                      ['Subcategory',q.missions?.cargo_subcategory||q.missions?.oog_description||'-'],
                      ['Damage Types',q.missions?.damage_types?.join(', ')||'-'],
                      ['On-Site Contact',q.missions?.contact_name||'-'],
                      ['Contact Phone',q.missions?.contact_phone||'-'],
                      ['Contact Job',q.missions?.contact_job||'-'],
                      ['Your Fee',`EUR ${q.amount?.toLocaleString()}`],
                    ].map(([k,v])=>(
                      <div key={k} style={{background:'#0f1e2e',borderRadius:7,padding:'8px 12px'}}>
                        <div style={{color:'#4a6880',fontSize:9,marginBottom:2}}>{k}</div>
                        <div style={{color:'#e8edf5',fontSize:11}}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {q.missions?.documents&&q.missions.documents.length>0&&(
                    <div style={{background:'#0f1e2e',borderRadius:7,padding:'10px 14px',marginBottom:16}}>
                      <div style={{color:'#4a6880',fontSize:9,marginBottom:8,letterSpacing:'0.1em',textTransform:'uppercase'}}>MISSION DOCUMENTS</div>
                      <div style={{display:'flex',flexDirection:'column',gap:6}}>
                        {q.missions.documents.map((path,i)=>(
                          <div key={i} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}
                            onClick={async()=>{
                              const {data} = await supabase.storage.from('mission-docs').createSignedUrl(path,3600)
                              if(data?.signedUrl) window.open(data.signedUrl,'_blank')
                            }}>
                            <span>📄</span>
                            <span style={{color:'#5a9eff',fontSize:12,textDecoration:'underline'}}>{path.split('/').pop()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {q.missions?.notes&&(
                    <div style={{background:'#0f1e2e',borderRadius:7,padding:'10px 14px',marginBottom:16}}>
                      <div style={{color:'#4a6880',fontSize:9,marginBottom:4}}>NOTES FROM INSURER</div>
                      <div style={{color:'#8fa8c0',fontSize:12,lineHeight:1.5}}>{q.missions.notes}</div>
                    </div>
                  )}

                  <div style={{borderTop:'1px solid #1e3a52',paddingTop:16}}>
                    <div style={{color:'#fff',fontWeight:700,fontSize:12,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:12}}>Survey Reports</div>
                    <div style={{display:'flex',flexDirection:'column',gap:12}}>
                      {[
                        {type:'memo',label:'Memo Report',sub:'Within 24h — photos, observations, preliminary findings',color:'#f0a500'},
                        {type:'preliminary',label:'Preliminary Report',sub:'Detailed preliminary assessment',color:'#5a9eff'},
                        {type:'final',label:'Final Report',sub:'Closes the file — triggers final payment',color:'#2e7d32'},
                      ].map(r=>{
                        const existingReport = q.missions?.survey_reports?.find(sr=>sr.report_type===r.type)
                        return (
                          <div key={r.type} style={{background:'#0f1e2e',border:`1px solid ${existingReport?r.color:'#1e3a52'}`,borderRadius:8,padding:'12px 16px'}}>
                            <div style={{marginBottom:8}}>
                              <div style={{display:'flex',alignItems:'center',gap:8}}>
                                <div style={{color:r.color,fontWeight:700,fontSize:13}}>{r.label}</div>
                                {existingReport&&<span style={{background:'rgba(46,125,50,0.12)',border:'1px solid #2e7d32',color:'#81c784',padding:'1px 8px',borderRadius:4,fontSize:9,fontWeight:700}}>UPLOADED</span>}
                              </div>
                              <div style={{color:'#4a6880',fontSize:11,marginTop:2}}>{r.sub}</div>
                            </div>
                            {existingReport&&(
                              <div style={{marginBottom:8,display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}
                                onClick={async()=>{
                                  const {data} = await supabase.storage.from('survey-reports').createSignedUrl(existingReport.file_url,3600)
                                  if(data?.signedUrl) window.open(data.signedUrl,'_blank')
                                }}>
                                <span>📄</span>
                                <span style={{color:'#5a9eff',fontSize:12,textDecoration:'underline'}}>View uploaded report</span>
                              </div>
                            )}
                            <FileUpload
                              bucket="survey-reports"
                              folder={`${q.missions?.reference}/${r.type}`}
                              label=""
                              hint="PDF, DOC, JPG — max 10 MB"
                              multiple={false}
                              onUpload={async(files)=>{
                                if(files.length>0){
                                  await supabase.from('survey_reports').upsert({
                                    mission_id: q.mission_id,
                                    expert_id: user.id,
                                    report_type: r.type,
                                    file_url: files[0].path,
                                  })
                                  const { data: expertProfile } = await supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single()
                                  const { data: insurerProfile } = await supabase.from('profiles').select('email').eq('id', q.missions?.insurer_id).single()
                                  const surveyorName = `${expertProfile?.first_name} ${expertProfile?.last_name}`
                                  if(insurerProfile?.email){
                                    if(r.type==='final'){
                                      await supabase.from('missions').update({status:'completed'}).eq('id', q.mission_id)
                                      const { data: quoteData } = await supabase.from('quotes').select('amount, currency').eq('id', q.id).single()
                                      if(quoteData){
                                        const balance = Math.round(quoteData.amount * 0.80)
                                        const response = await fetch('/api/stripe/create-payment', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            amount: balance,
                                            currency: quoteData.currency?.toLowerCase() || 'eur',
                                            missionRef: q.missions?.reference,
                                            insurerEmail: insurerProfile.email,
                                            expertEmail: null,
                                          })
                                        })
                                        const paymentData = await response.json()
                                        if(!paymentData.error){
                                          await supabase.from('transactions').insert({
                                            mission_id: q.mission_id,
                                            quote_id: q.id,
                                            total_amount: balance,
                                            commission_amount: 0,
                                            expert_payout: balance,
                                            stripe_payment_intent: paymentData.paymentIntentId,
                                            status: 'paid',
                                            payment_type: 'balance',
                                            percentage: 80
                                          })
                                        }
                                      }
                                      const tmpl = emailTemplates.finalReportUploaded(q.missions?.reference, surveyorName)
                                      await sendEmail(insurerProfile.email, tmpl.subject, tmpl.html)
                                    } else {
                                      const tmpl = emailTemplates.reportUploaded(q.missions?.reference, r.label, surveyorName)
                                      await sendEmail(insurerProfile.email, tmpl.subject, tmpl.html)
                                    }
                                  }
                                  loadAll()
                                }
                              }}
                            />
                          </div>
                        )
                      })}
                    </div>
                    <Convocation quote={q} user={user}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab==='history'&&(
          <div>
            <h2 style={{color:'#fff',fontSize:22,fontWeight:800,marginBottom:16}}>Mission History</h2>
            {history.length===0&&(
              <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:36,textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:12}}>📂</div>
                <div style={{color:'#8fa8c0',fontSize:14}}>No completed missions yet</div>
              </div>
            )}
            {history.length>0&&(
              <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{background:'#0f1e2e'}}>
                      {['Reference','Date','Cargo','Location','Amount received'].map(h=>(
                        <th key={h} style={{padding:'10px 14px',color:'#4a6880',fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',textAlign:'left',borderBottom:'1px solid #1e3a52'}}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((q,i)=>(
                      <tr key={q.id} style={{borderBottom:'1px solid #1e3a52',background:i%2===0?'transparent':'rgba(255,255,255,0.01)'}}>
                        <td style={{padding:'10px 14px',color:'#5a9eff',fontSize:12,fontFamily:'monospace'}}>{q.missions?.reference}</td>
                        <td style={{padding:'10px 14px',color:'#8fa8c0',fontSize:12}}>{new Date(q.missions?.created_at).toLocaleDateString('en-GB')}</td>
                        <td style={{padding:'10px 14px',color:'#fff',fontSize:12,fontWeight:600}}>{q.missions?.cargo_type||'—'}</td>
                        <td style={{padding:'10px 14px',color:'#8fa8c0',fontSize:12}}>{q.missions?.location_place||q.missions?.location_text?.split(',')[0]||'—'}</td>
                        <td style={{padding:'10px 14px',color:'#2e7d32',fontSize:12,fontWeight:700}}>EUR {Math.round(q.amount*0.99).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
