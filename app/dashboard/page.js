'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

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

// ─── INSURER DASHBOARD ────────────────────────────────────────────────────────
function InsurerDashboard({user}) {
  const router = useRouter()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [quotes, setQuotes] = useState([])
  const [negotiateId, setNegotiateId] = useState(null)
  const [counterText, setCounterText] = useState('')
  const [declineId, setDeclineId] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),3000) }

  useEffect(() => {
    getMissions()
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
      .order('created_at', {ascending: false})
    setMissions(data || [])
    setLoading(false)
  }

  const loadQuotes = async (missionId) => {
    const { data } = await supabase
      .from('quotes')
      .select('*, profiles(first_name, last_name, city, country)')
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
    loadQuotes(missionId)
    getMissions()
    showToast('Quote accepted — surveyor has been notified')
  }

  const declineQuote = async (quoteId, reason) => {
    await supabase.from('quotes').update({status:'declined', decline_reason: reason}).eq('id', quoteId)
    setDeclineId(null)
    loadQuotes(selected.id)
    showToast('Quote declined')
  }

  const sendCounter = async (quoteId, missionId) => {
    if (!counterText) return
    await supabase.from('quotes').update({status:'negotiating', counter_proposal: counterText}).eq('id', quoteId)
    await supabase.from('missions').update({status:'quoting'}).eq('id', missionId)
    setNegotiateId(null)
    setCounterText('')
    loadQuotes(missionId)
    showToast('Counter-proposal sent to surveyor')
  }

  const cancelMission = async (missionId, reason) => {
    await supabase.from('missions').update({cancelled: true, cancel_reason: reason, status: 'cancelled'}).eq('id', missionId)
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
          <span style={{color:'#fff',fontWeight:900,fontSize:22}}>SurveyLink</span>
          <button onClick={()=>router.push('/missions/new')} style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,cursor:'pointer',fontWeight:700}}>
            + New Request
          </button>
        </div>
        <button onClick={()=>supabase.auth.signOut().then(()=>router.push('/auth'))}
          style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 16px',cursor:'pointer'}}>
          Sign Out
        </button>
      </nav>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'32px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:32}}>
          {[
            ['Active Requests',missions.filter(m=>m.status!=='completed'&&m.status!=='cancelled').length,'','#f0a500'],
            ['Quotes Received',missions.filter(m=>m.status==='quoting').length,'awaiting review','#5a9eff'],
            ['Surveyors Assigned',missions.filter(m=>m.status==='accepted').length,'in progress','#2e7d32'],
            ['Total Missions',missions.length,'all time','#8fa8c0']
          ].map(([label,val,sub,color])=>(
            <div key={label} style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:'16px 20px'}}>
              <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>{label}</div>
              <div style={{color,fontSize:26,fontWeight:800}}>{val}</div>
              <div style={{color:'#4a6880',fontSize:11,marginTop:4}}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:selected?'1fr 1fr':'1fr',gap:24}}>
          <div>
            <h2 style={{color:'#fff',fontSize:22,fontWeight:800,marginBottom:16}}>My Requests</h2>
            {loading&&<p style={{color:'#8fa8c0'}}>Loading...</p>}
            {!loading&&missions.length===0&&(
              <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:36,textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:12}}>📋</div>
                <div style={{color:'#8fa8c0',fontSize:14}}>No requests yet</div>
                <button onClick={()=>router.push('/missions/new')} style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700,marginTop:16}}>
                  + New Request
                </button>
              </div>
            )}
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {missions.map(m=>(
                <div key={m.id} onClick={()=>selectMission(m)}
                  style={{background:'#132030',border:selected?.id===m.id?'1px solid #dd2e1e':'1px solid #1e3a52',borderRadius:12,padding:18,cursor:'pointer',opacity:m.cancelled?0.6:1}}
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
                      <div style={{color:'#8fa8c0',fontSize:12,marginTop:2}}>{m.damage_types?.join(', ')} — {m.client_name}</div>
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
                <h2 style={{color:'#fff',fontSize:20,fontWeight:800,margin:0}}>Quotes — {selected.reference}</h2>
                <div style={{display:'flex',gap:8}}>
                  {!selected.cancelled&&selected.status!=='completed'&&(
                    <button onClick={()=>{
                      if(window.confirm('Cancel this mission?')) cancelMission(selected.id, 'Cancelled by insurer')
                    }} style={{background:'transparent',color:'#dd2e1e',border:'1px solid #dd2e1e',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:11,fontWeight:700}}>
                      Cancel Mission
                    </button>
                  )}
                  <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',color:'#8fa8c0',cursor:'pointer',fontSize:20}}>x</button>
                </div>
              </div>

              <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:8,padding:'10px 14px',marginBottom:14}}>
                <div style={{color:'#4a6880',fontSize:9,marginBottom:2}}>LOCATION</div>
                <div style={{color:'#8fa8c0',fontSize:12}}>📍 {selected.location_text}</div>
              </div>

              {quotes.length===0&&(
                <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:36,textAlign:'center'}}>
                  <div style={{fontSize:32,marginBottom:12}}>⏳</div>
                  <div style={{color:'#8fa8c0',fontSize:13}}>Notifying nearby surveyors...</div>
                  <div style={{color:'#4a6880',fontSize:11,marginTop:6}}>First quote expected within 15 min</div>
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
                        <div style={{color:'#4a6880',fontSize:11}}>{q.profiles?.city}, {q.profiles?.country}</div>
                      </div>
                      {q.status==='accepted'&&<span style={{background:'rgba(46,125,50,0.12)',border:'1px solid #2e7d32',color:'#81c784',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700}}>ACCEPTED</span>}
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

                    {q.status==='pending'&&negotiateId!==q.id&&declineId!==q.id&&(
                      <div style={{display:'flex',gap:8}}>
                        <button onClick={()=>{setDeclineId(q.id);setNegotiateId(null)}} style={{flex:1,background:'transparent',color:'#dd2e1e',border:'1px solid #dd2e1e',borderRadius:7,padding:'9px',cursor:'pointer',fontWeight:700,fontSize:12}}>
                          Decline
                        </button>
                        <button onClick={()=>{setNegotiateId(q.id);setDeclineId(null)}} style={{flex:1,background:'transparent',color:'#f0a500',border:'1px solid #f0a500',borderRadius:7,padding:'9px',cursor:'pointer',fontWeight:700,fontSize:12}}>
                          Negotiate
                        </button>
                        <button onClick={()=>acceptQuote(q.id, selected.id)} style={{flex:1,background:'#2e7d32',color:'#fff',border:'none',borderRadius:7,padding:'9px',cursor:'pointer',fontWeight:700,fontSize:12}}>
                          Accept
                        </button>
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
                        <textarea placeholder="Explain your counter-proposal (e.g. We can offer EUR 1,500 for this survey...)" value={counterText} onChange={e=>setCounterText(e.target.value)} rows={3}
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
      </div>
    </div>
  )
}

// ─── EXPERT DASHBOARD ─────────────────────────────────────────────────────────
function ExpertDashboard({user}) {
  const router = useRouter()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [myQuotes, setMyQuotes] = useState([])
  const [selectedMission, setSelectedMission] = useState(null)
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
    const { data: avail } = await supabase
      .from('missions')
      .select('*')
      .in('status', ['searching','quoting'])
      .eq('cancelled', false)
      .order('created_at', {ascending: false})
    setMissions(avail || [])

    const { data: myQ } = await supabase
      .from('quotes')
      .select('*, missions(*)')
      .eq('expert_id', user.id)
      .order('created_at', {ascending: false})
    setMyQuotes(myQ || [])

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
      setQuoting(null)
      setAmount('')
      setProposedDatetime('')
      setNote('')
      showToast('Quote submitted successfully!')
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
  const acceptedQuotes = myQuotes.filter(q=>q.status==='accepted')
  const pendingQuotes = myQuotes.filter(q=>q.status==='pending'||q.status==='negotiating')

  const statusColor = {pending:'#8fa8c0',negotiating:'#f0a500',accepted:'#2e7d32',declined:'#dd2e1e'}
  const statusLabel = {pending:'Pending',negotiating:'Counter-Proposal Received',accepted:'Accepted',declined:'Declined'}

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh'}}>
      {toast&&<div style={{position:'fixed',top:70,left:'50%',transform:'translateX(-50%)',background:'#2e7d32',color:'#fff',padding:'12px 24px',borderRadius:8,fontWeight:700,zIndex:999,fontSize:13,boxShadow:'0 4px 24px rgba(0,0,0,0.3)'}}>{toast}</div>}

      <nav style={{background:'#0f1e2e',borderBottom:'1px solid #1e3a52',padding:'0 32px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:20}}>
          <span style={{color:'#fff',fontWeight:900,fontSize:22}}>SurveyLink</span>
          <div style={{display:'flex',gap:4}}>
            {[
              {k:'available',l:'Available Missions'},
              {k:'myquotes',l:`My Quotes ${pendingQuotes.length>0?`(${pendingQuotes.length})`:''}`.trim()},
              {k:'active',l:`Active Missions ${acceptedQuotes.length>0?`(${acceptedQuotes.length})`:''}`.trim()},
            ].map(tab=>(
              <button key={tab.k} onClick={()=>setActiveTab(tab.k)}
                style={{background:activeTab===tab.k?'#dd2e1e':'transparent',color:activeTab===tab.k?'#fff':'#8fa8c0',border:`1px solid ${activeTab===tab.k?'#dd2e1e':'#1e3a52'}`,borderRadius:6,padding:'5px 12px',fontSize:11,cursor:'pointer',fontWeight:700}}>
                {tab.l}
              </button>
            ))}
          </div>
        </div>
        <button onClick={()=>supabase.auth.signOut().then(()=>router.push('/auth'))}
          style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 16px',cursor:'pointer'}}>
          Sign Out
        </button>
      </nav>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'32px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:32}}>
          {[
            ['Available',availableMissions.length,'new requests','#f0a500'],
            ['Quotes Sent',myQuotes.filter(q=>q.status==='pending').length,'awaiting response','#5a9eff'],
            ['Active Missions',acceptedQuotes.length,'in progress','#2e7d32'],
            ['Completed','0','all time','#8fa8c0']
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
                  <div style={{color:'#4a6880',fontSize:12,marginTop:6}}>You will be notified when new requests come in</div>
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
                        <div style={{color:'#e8edf5',fontSize:11}}>{m.location_text?.split(',')[0]||m.location_text}</div>
                      </div>
                      <div style={{background:'#0f1e2e',borderRadius:7,padding:'8px 12px'}}>
                        <div style={{color:'#4a6880',fontSize:9,marginBottom:2}}>URGENCY</div>
                        <div style={{color:m.urgency==='critical'?'#dd2e1e':m.urgency==='urgent'?'#f0a500':'#2e7d32',fontSize:11,fontWeight:700,textTransform:'uppercase'}}>{m.urgency}</div>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:10}}>
                      <button onClick={()=>{setQuoting(m);setAmount('');setProposedDatetime('');setNote('');}}
                        style={{flex:1,background:'#2e7d32',color:'#fff',border:'none',borderRadius:7,padding:'10px',cursor:'pointer',fontWeight:700}}>
                        Submit a Quote
                      </button>
                    </div>
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
                    <div style={{color:'#8fa8c0',fontSize:12,marginTop:2}}>{quoting.cargo_type} — {quoting.location_text?.split(',')[0]}</div>
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
                    <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>Proposed Date & Time of Intervention *</div>
                    <input type="datetime-local" value={proposedDatetime} onChange={e=>setProposedDatetime(e.target.value)}
                      style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13}}/>
                  </div>
                  <div style={{marginBottom:12}}>
                    <textarea placeholder="Note to insurer (availability, conditions, remarks...)" value={note} onChange={e=>setNote(e.target.value)} rows={3}
                      style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13,resize:'vertical'}}/>
                  </div>
                  {amount&&(
                    <div style={{marginBottom:14,padding:'10px 14px',background:'rgba(240,165,0,0.12)',border:'1px solid #f0a500',borderRadius:7}}>
                      <div style={{display:'flex',justifyContent:'space-between'}}>
                        <span style={{color:'#8fa8c0',fontSize:12}}>Total Quote</span>
                        <span style={{color:'#f0a500',fontWeight:800,fontSize:20}}>EUR {parseInt(amount).toLocaleString()}</span>
                      </div>
                      <div style={{color:'#4a6880',fontSize:10,marginTop:3}}>
                        Platform fee (1%): EUR {Math.round(parseInt(amount)*0.01).toLocaleString()} — You receive: EUR {Math.round(parseInt(amount)*0.99).toLocaleString()}
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
            {myQuotes.length===0&&(
              <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:36,textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:12}}>📝</div>
                <div style={{color:'#8fa8c0',fontSize:14}}>No quotes submitted yet</div>
              </div>
            )}
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {myQuotes.map(q=>(
                <div key={q.id} style={{background:'#132030',border:q.status==='accepted'?'1px solid #2e7d32':q.status==='negotiating'?'1px solid #f0a500':q.status==='declined'?'1px solid #700300':'1px solid #1e3a52',borderRadius:12,padding:20}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <div>
                      <div style={{color:'#4a6880',fontSize:10,marginBottom:4}}>{q.missions?.reference}</div>
                      <div style={{color:'#fff',fontWeight:700,fontSize:16}}>{q.missions?.cargo_type}</div>
                      <div style={{color:'#8fa8c0',fontSize:12,marginTop:2}}>{q.missions?.location_text?.split(',')[0]}</div>
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

                  {q.status==='negotiating'&&q.counter_proposal&&(
                    <div style={{background:'rgba(240,165,0,0.08)',border:'1px solid #f0a500',borderRadius:8,padding:'12px 14px',marginBottom:12}}>
                      <div style={{color:'#f0a500',fontSize:10,fontWeight:700,marginBottom:6}}>COUNTER-PROPOSAL FROM INSURER</div>
                      <div style={{color:'#8fa8c0',fontSize:12,lineHeight:1.5,marginBottom:12}}>{q.counter_proposal}</div>
                      <div style={{display:'flex',gap:8}}>
                        <button onClick={()=>respondToCounter(q.id, false)}
                          style={{flex:1,background:'transparent',color:'#dd2e1e',border:'1px solid #dd2e1e',borderRadius:6,padding:'9px',cursor:'pointer',fontWeight:700,fontSize:12}}>
                          Decline
                        </button>
                        <button onClick={()=>respondToCounter(q.id, true)}
                          style={{flex:1,background:'#2e7d32',color:'#fff',border:'none',borderRadius:6,padding:'9px',cursor:'pointer',fontWeight:700,fontSize:12}}>
                          Accept Counter-Proposal
                        </button>
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
                <div style={{color:'#4a6880',fontSize:12,marginTop:6}}>Accepted quotes will appear here</div>
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
    ['Full Address',q.missions?.location_text||'—'],
    ['Client / Assured',q.missions?.client_name||'—'],
    ['Expertise Type',q.missions?.expertise_type==='cargo'?`Cargo - ${q.missions?.expertise_subtype||''}`:q.missions?.expertise_subtype||'—'],
    ['Loading Unit',q.missions?.loading_unit?(q.missions.loading_unit+(q.missions.tc_type?` - ${q.missions.tc_type}`:'')):'—'],
    ['Quantity',q.missions?.loading_quantity||'—'],
    ['Cargo Category',q.missions?.cargo_category||'—'],
    ['Subcategory',q.missions?.cargo_subcategory||q.missions?.oog_description||'—'],
    ['Damage Types',q.missions?.damage_types?.join(', ')||'—'],
    ['On-Site Contact',q.missions?.contact_name||'—'],
    ['Contact Phone',q.missions?.contact_phone||'—'],
    ['Contact Job',q.missions?.contact_job||'—'],
    ['Your Fee',`EUR ${q.amount?.toLocaleString()}`],
  ].map(([k,v])=>(
                      <div key={k} style={{background:'#0f1e2e',borderRadius:7,padding:'8px 12px'}}>
                        <div style={{color:'#4a6880',fontSize:9,marginBottom:2}}>{k}</div>
                        <div style={{color:'#e8edf5',fontSize:11}}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {q.missions?.notes&&(
                    <div style={{background:'#0f1e2e',borderRadius:7,padding:'10px 14px',marginBottom:16}}>
                      <div style={{color:'#4a6880',fontSize:9,marginBottom:4}}>NOTES FROM INSURER</div>
                      <div style={{color:'#8fa8c0',fontSize:12,lineHeight:1.5}}>{q.missions.notes}</div>
                    </div>
                  )}

                  <div style={{borderTop:'1px solid #1e3a52',paddingTop:16}}>
                    <div style={{color:'#fff',fontWeight:700,fontSize:12,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:12}}>Survey Reports</div>
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {[
                        {type:'memo',label:'Memo Report',sub:'Within 24h — photos, observations, preliminary findings',color:'#f0a500'},
                        {type:'preliminary',label:'Preliminary Report',sub:'Detailed preliminary assessment',color:'#5a9eff'},
                        {type:'final',label:'Final Report',sub:'Closes the file',color:'#2e7d32'},
                      ].map(r=>(
                        <div key={r.type} style={{background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:8,padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <div>
                            <div style={{color:r.color,fontWeight:700,fontSize:13}}>{r.label}</div>
                            <div style={{color:'#4a6880',fontSize:11,marginTop:2}}>{r.sub}</div>
                          </div>
                          <button style={{background:'transparent',color:r.color,border:`1px solid ${r.color}`,borderRadius:6,padding:'6px 14px',cursor:'pointer',fontSize:11,fontWeight:700}}>
                            Upload
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
