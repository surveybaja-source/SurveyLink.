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
      <p style={{color:'#8fa8c0'}}>Chargement...</p>
    </div>
  )

  if (role === 'insurer') return <InsurerDashboard user={user}/>
  return <ExpertDashboard user={user}/>
}

function InsurerDashboard({user}) {
  const router = useRouter()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [quotes, setQuotes] = useState([])

  useEffect(() => {
    const getMissions = async () => {
      const { data } = await supabase
        .from('missions')
        .select('*')
        .eq('insurer_id', user.id)
        .order('created_at', {ascending: false})
      setMissions(data || [])
      setLoading(false)
    }
    getMissions()

    const channel = supabase
      .channel('missions')
      .on('postgres_changes', {event:'*',schema:'public',table:'missions'}, ()=>getMissions())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const loadQuotes = async (missionId) => {
    const { data } = await supabase
      .from('quotes')
      .select('*, profiles(first_name, last_name, city, country)')
      .eq('mission_id', missionId)
    setQuotes(data || [])
  }

  const selectMission = (m) => {
    setSelected(m)
    loadQuotes(m.id)
  }

  const acceptQuote = async (quoteId, missionId) => {
    await supabase.from('quotes').update({status:'accepted'}).eq('id', quoteId)
    await supabase.from('quotes').update({status:'declined'}).neq('id', quoteId).eq('mission_id', missionId)
    await supabase.from('missions').update({status:'accepted'}).eq('id', missionId)
    loadQuotes(missionId)
    const { data } = await supabase.from('missions').select('*').eq('insurer_id', user.id).order('created_at',{ascending:false})
    setMissions(data || [])
  }

  const sLabel = {searching:'Recherche...',quoting:'Devis recus',accepted:'Expert assigne',completed:'Termine'}

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh'}}>
      <nav style={{background:'#0f1e2e',borderBottom:'1px solid #1e3a52',padding:'0 32px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:20}}>
          <span style={{color:'#fff',fontWeight:900,fontSize:22}}>SurveyLink</span>
          <div style={{display:'flex',gap:8}}>
            <button style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:6,padding:'6px 14px',fontSize:12,cursor:'pointer',fontWeight:700}} onClick={()=>router.push('/missions/new')}>
              + Nouvelle Demande
            </button>
          </div>
        </div>
        <button onClick={()=>supabase.auth.signOut().then(()=>router.push('/auth'))}
          style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 16px',cursor:'pointer'}}>
          Se deconnecter
        </button>
      </nav>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'32px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:32}}>
          {[
            ['Demandes Actives',missions.filter(m=>m.status!=='completed').length,'','#f0a500'],
            ['Devis Recus',missions.filter(m=>m.status==='quoting').length,'en attente','#5a9eff'],
            ['Experts Assignes',missions.filter(m=>m.status==='accepted').length,'missions en cours','#2e7d32'],
            ['Total Missions',missions.length,'toutes missions','#8fa8c0']
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
            <h2 style={{color:'#fff',fontSize:22,fontWeight:800,marginBottom:16}}>Mes Demandes</h2>
            {loading&&<p style={{color:'#8fa8c0'}}>Chargement...</p>}
            {!loading&&missions.length===0&&(
              <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:36,textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:12}}>📋</div>
                <div style={{color:'#8fa8c0',fontSize:14}}>Aucune demande pour l instant</div>
                <div style={{color:'#4a6880',fontSize:12,marginTop:6,marginBottom:20}}>Cliquez sur Nouvelle Demande pour commencer</div>
                <button onClick={()=>router.push('/missions/new')} style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>
                  + Nouvelle Demande
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
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                        <span style={{color:'#4a6880',fontSize:10}}>{m.reference}</span>
                        <span style={{background:m.urgency==='critical'?'rgba(221,46,30,0.12)':m.urgency==='urgent'?'rgba(240,165,0,0.12)':'rgba(26,108,240,0.12)',color:m.urgency==='critical'?'#dd2e1e':m.urgency==='urgent'?'#f0a500':'#5a9eff',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700,textTransform:'uppercase'}}>{m.urgency}</span>
                        <span style={{background:'#1e3a52',color:'#8fa8c0',padding:'2px 10px',borderRadius:4,fontSize:10}}>{sLabel[m.status]||m.status}</span>
                      </div>
                      <div style={{color:'#fff',fontWeight:700,fontSize:18}}>{m.cargo_type}</div>
                      <div style={{color:'#8fa8c0',fontSize:12,marginTop:2}}>{m.damage_types?.join(', ')} - {m.client_name}</div>
                    </div>
                    <span style={{color:'#4a6880',fontSize:11}}>{new Date(m.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div style={{color:'#8fa8c0',fontSize:12}}>📍 {m.location_text}</div>
                </div>
              ))}
            </div>
          </div>

          {selected&&(
            <div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                <h2 style={{color:'#fff',fontSize:22,fontWeight:800,margin:0}}>Devis - {selected.reference}</h2>
                <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',color:'#8fa8c0',cursor:'pointer',fontSize:20}}>x</button>
              </div>
              <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:8,padding:'10px 14px',marginBottom:14}}>
                <div style={{color:'#4a6880',fontSize:9,marginBottom:2}}>LOCALISATION</div>
                <div style={{color:'#8fa8c0',fontSize:12}}>📍 {selected.location_text}</div>
              </div>
              {quotes.length===0&&(
                <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:36,textAlign:'center'}}>
                  <div style={{fontSize:32,marginBottom:12}}>⏳</div>
                  <div style={{color:'#8fa8c0',fontSize:13}}>Notification des experts en cours...</div>
                  <div style={{color:'#4a6880',fontSize:11,marginTop:6}}>Premier devis attendu dans 15 min</div>
                </div>
              )}
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {quotes.map(q=>(
                  <div key={q.id} style={{background:'#132030',border:q.status==='accepted'?'1px solid #2e7d32':q.status==='declined'?'1px solid #700300':'1px solid #1e3a52',borderRadius:12,padding:16}}>
                    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                      <div style={{width:42,height:42,borderRadius:'50%',background:'linear-gradient(135deg,#182e44,#dd2e1e)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:13}}>
                        {q.profiles?.first_name?.[0]}{q.profiles?.last_name?.[0]}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{color:'#fff',fontWeight:700}}>{q.profiles?.first_name} {q.profiles?.last_name}</div>
                        <div style={{color:'#4a6880',fontSize:11}}>{q.profiles?.city}, {q.profiles?.country}</div>
                      </div>
                      {q.status==='accepted'&&<span style={{background:'rgba(46,125,50,0.12)',border:'1px solid #2e7d32',color:'#81c784',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700}}>ACCEPTE</span>}
                      {q.status==='declined'&&<span style={{background:'rgba(221,46,30,0.12)',border:'1px solid #dd2e1e',color:'#ef9a9a',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700}}>DECLINE</span>}
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                      <div style={{background:'#0f1e2e',borderRadius:8,padding:'10px 14px'}}>
                        <div style={{color:'#4a6880',fontSize:9,marginBottom:3}}>TARIF PROPOSE</div>
                        <div style={{color:'#f0a500',fontSize:20,fontWeight:800}}>{q.currency} {q.amount?.toLocaleString()}</div>
                      </div>
                      <div style={{background:'#0f1e2e',borderRadius:8,padding:'10px 14px'}}>
                        <div style={{color:'#4a6880',fontSize:9,marginBottom:3}}>DELAI D INTERVENTION</div>
                        <div style={{color:'#fff',fontSize:20,fontWeight:800}}>{q.eta}</div>
                      </div>
                    </div>
                    {q.note&&(
                      <div style={{background:'#0f1e2e',borderRadius:6,padding:'8px 12px',marginBottom:10}}>
                        <div style={{color:'#4a6880',fontSize:9,marginBottom:2}}>NOTE DE L EXPERT</div>
                        <div style={{color:'#8fa8c0',fontSize:12,lineHeight:1.5}}>{q.note}</div>
                      </div>
                    )}
                    {q.status==='pending'&&(
                      <div style={{display:'flex',gap:8}}>
                        <button style={{flex:1,background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'10px',cursor:'pointer',fontWeight:700}}>
                          Decliner
                        </button>
                        <button onClick={()=>acceptQuote(q.id, selected.id)} style={{flex:1,background:'#2e7d32',color:'#fff',border:'none',borderRadius:7,padding:'10px',cursor:'pointer',fontWeight:700}}>
                          Accepter le Devis
                        </button>
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

function ExpertDashboard({user}) {
  const router = useRouter()
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [quoting, setQuoting] = useState(null)
  const [amount, setAmount] = useState('')
  const [eta, setEta] = useState('')
  const [note, setNote] = useState('')
  const [myQuotes, setMyQuotes] = useState([])
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const getMissions = async () => {
      const { data } = await supabase
        .from('missions')
        .select('*')
        .in('status', ['searching','quoting'])
        .order('created_at', {ascending: false})
      setMissions(data || [])
      setLoading(false)
    }

    const getMyQuotes = async () => {
      const { data } = await supabase
        .from('quotes')
        .select('mission_id')
        .eq('expert_id', user.id)
      setMyQuotes((data||[]).map(q=>q.mission_id))
    }

    getMissions()
    getMyQuotes()

    const channel = supabase
      .channel('missions-expert')
      .on('postgres_changes', {event:'INSERT',schema:'public',table:'missions'}, ()=>getMissions())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const submitQuote = async (missionId) => {
    if (!amount) return
    const { error } = await supabase.from('quotes').insert({
      mission_id: missionId,
      expert_id: user.id,
      amount: parseFloat(amount),
      currency: 'EUR',
      eta: eta,
      note: note,
      status: 'pending'
    })
    if (!error) {
      await supabase.from('missions').update({status:'quoting'}).eq('id', missionId)
      setMyQuotes(p=>[...p, missionId])
      setQuoting(null)
      setAmount('')
      setEta('')
      setNote('')
      setToast('Devis envoye avec succes !')
      setTimeout(()=>setToast(null), 3000)
    }
  }

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh'}}>
      {toast&&<div style={{position:'fixed',top:70,left:'50%',transform:'translateX(-50%)',background:'#2e7d32',color:'#fff',padding:'12px 24px',borderRadius:8,fontWeight:700,zIndex:999,fontSize:13}}>
        {toast}
      </div>}
      <nav style={{background:'#0f1e2e',borderBottom:'1px solid #1e3a52',padding:'0 32px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <span style={{color:'#fff',fontWeight:900,fontSize:22}}>SurveyLink</span>
        <button onClick={()=>supabase.auth.signOut().then(()=>router.push('/auth'))}
          style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 16px',cursor:'pointer'}}>
          Se deconnecter
        </button>
      </nav>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'32px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:32}}>
          {[
            ['Missions Dispo',missions.length,'a proximite','#f0a500'],
            ['Devis Envoyes',myQuotes.length,'en attente','#5a9eff'],
            ['Missions Actives','0','en cours','#2e7d32'],
            ['Taux Acceptation','--','pas encore de donnees','#8fa8c0']
          ].map(([label,val,sub,color])=>(
            <div key={label} style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:'16px 20px'}}>
              <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>{label}</div>
              <div style={{color,fontSize:26,fontWeight:800}}>{val}</div>
              <div style={{color:'#4a6880',fontSize:11,marginTop:4}}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:quoting?'1fr 1fr':'1fr',gap:24}}>
          <div>
            <h2 style={{color:'#fff',fontSize:22,fontWeight:800,marginBottom:16}}>Demandes Disponibles</h2>
            {loading&&<p style={{color:'#8fa8c0'}}>Chargement...</p>}
            {!loading&&missions.length===0&&(
              <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:36,textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:12}}>📭</div>
                <div style={{color:'#8fa8c0',fontSize:14}}>Aucune demande disponible pour l instant</div>
                <div style={{color:'#4a6880',fontSize:12,marginTop:6}}>Vous serez notifie des nouvelles demandes</div>
              </div>
            )}
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {missions.map(m=>{
                const alreadyQuoted = myQuotes.includes(m.id)
                return (
                  <div key={m.id} style={{background:'#132030',border:alreadyQuoted?'1px solid #2e7d32':'1px solid #1e3a52',borderRadius:12,padding:20}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
                      <div>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                          <span style={{color:'#4a6880',fontSize:10}}>{m.reference}</span>
                          <span style={{background:m.urgency==='critical'?'rgba(221,46,30,0.12)':m.urgency==='urgent'?'rgba(240,165,0,0.12)':'rgba(26,108,240,0.12)',color:m.urgency==='critical'?'#dd2e1e':m.urgency==='urgent'?'#f0a500':'#5a9eff',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700,textTransform:'uppercase'}}>{m.urgency}</span>
                          {alreadyQuoted&&<span style={{background:'rgba(46,125,50,0.12)',border:'1px solid #2e7d32',color:'#81c784',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700}}>DEVIS ENVOYE</span>}
                        </div>
                        <div style={{color:'#fff',fontWeight:700,fontSize:20}}>{m.cargo_type}</div>
                        <div style={{color:'#8fa8c0',fontSize:12,marginTop:2}}>{m.damage_types?.join(', ')}</div>
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
                      {[['Localisation',m.location_text],['Client',m.client_name]].map(([k,v])=>(
                        <div key={k} style={{background:'#0f1e2e',borderRadius:7,padding:'8px 12px'}}>
                          <div style={{color:'#4a6880',fontSize:9,marginBottom:2}}>{k}</div>
                          <div style={{color:'#e8edf5',fontSize:11}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {!alreadyQuoted&&(
                      <button onClick={()=>setQuoting(m)} style={{width:'100%',background:'#2e7d32',color:'#fff',border:'none',borderRadius:7,padding:'10px',cursor:'pointer',fontWeight:700}}>
                        Soumettre un Devis
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {quoting&&(
            <div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                <h2 style={{color:'#fff',fontSize:22,fontWeight:800,margin:0}}>Soumettre un Devis</h2>
                <button onClick={()=>setQuoting(null)} style={{background:'none',border:'none',color:'#8fa8c0',cursor:'pointer',fontSize:20}}>x</button>
              </div>
              <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:24}}>
                <div style={{background:'#0f1e2e',borderRadius:7,padding:'10px 14px',marginBottom:18}}>
                  <div style={{color:'#4a6880',fontSize:9,marginBottom:3}}>MISSION</div>
                  <div style={{color:'#dd2e1e',fontWeight:700}}>{quoting.reference}</div>
                  <div style={{color:'#8fa8c0',fontSize:12,marginTop:2}}>{quoting.cargo_type} - {quoting.location_text}</div>
                </div>
                <div style={{marginBottom:16}}>
                  <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>Votre tarif (EUR)</div>
                  <div style={{position:'relative'}}>
                    <div style={{position:'absolute',left:0,top:0,bottom:0,width:50,background:'#1e3a52',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'6px 0 0 6px',color:'#8fa8c0',fontWeight:700,fontSize:13}}>EUR</div>
                    <input type="number" placeholder="0" value={amount} onChange={e=>setAmount(e.target.value)}
                      style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:7,padding:'14px 14px 14px 64px',color:'#f0a500',fontSize:26,fontWeight:800,outline:'none',boxSizing:'border-box'}}/>
                  </div>
                </div>
                <div style={{marginBottom:12}}>
                  <input placeholder="Delai d intervention (ex: 45 min, 2h)" value={eta} onChange={e=>setEta(e.target.value)}
                    style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13}}/>
                </div>
                <div style={{marginBottom:12}}>
                  <textarea placeholder="Note pour l assureur (disponibilite, conditions, remarques...)" value={note} onChange={e=>setNote(e.target.value)} rows={3}
                    style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13,resize:'vertical'}}/>
                </div>
                {amount&&(
                  <div style={{marginBottom:14,padding:'10px 14px',background:'rgba(240,165,0,0.12)',border:'1px solid #f0a500',borderRadius:7}}>
                    <div style={{display:'flex',justifyContent:'space-between'}}>
                      <span style={{color:'#8fa8c0',fontSize:12}}>Total Devis</span>
                      <span style={{color:'#f0a500',fontWeight:800,fontSize:20}}>EUR {parseInt(amount).toLocaleString()}</span>
                    </div>
                    <div style={{color:'#4a6880',fontSize:10,marginTop:3}}>
                      Commission plateforme (1%): EUR {Math.round(parseInt(amount)*0.01).toLocaleString()} - Vous recevez: EUR {Math.round(parseInt(amount)*0.99).toLocaleString()}
                    </div>
                  </div>
                )}
                <button onClick={()=>submitQuote(quoting.id)} disabled={!amount}
                  style={{width:'100%',background:!amount?'rgba(221,46,30,0.45)':'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'14px',cursor:'pointer',fontWeight:700,fontSize:14}}>
                  Envoyer le Devis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
