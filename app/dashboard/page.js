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
  return (
    <div style={{background:'#0c1a27',minHeight:'100vh'}}>
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
            ['Demandes Actives','3','2 en attente','#f0a500'],
            ['Reseau Experts','48','12 pays','#5a9eff'],
            ['Temps Moyen','23m','30 derniers jours','#2e7d32'],
            ['Total Mois','41k EUR','couts expertise','#8fa8c0']
          ].map(([label,val,sub,color])=>(
            <div key={label} style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:'16px 20px'}}>
              <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>{label}</div>
              <div style={{color,fontSize:26,fontWeight:800}}>{val}</div>
              <div style={{color:'#4a6880',fontSize:11,marginTop:4}}>{sub}</div>
            </div>
          ))}
        </div>
        <h2 style={{color:'#fff',fontSize:22,fontWeight:800,marginBottom:16}}>Demandes Actives</h2>
        {[
          {id:'SL-2024-0892',cargo:'Container FCL',damage:'Water damage',client:'Maersk Line',urgency:'urgent',status:'Quotes recus',location:'Port of Rotterdam'},
          {id:'SL-2024-0891',cargo:'Reefer',damage:'Overheating',client:'Dole Fresh Fruit',urgency:'normal',status:'Expert assigne',location:'Amsterdam Seaport'},
          {id:'SL-2024-0890',cargo:'Bulk Grain',damage:'Contamination',client:'Cargill International',urgency:'critical',status:'Recherche...',location:'Europoort Terminal'},
        ].map(m=>(
          <div key={m.id} style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:18,marginBottom:12,cursor:'pointer'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                  <span style={{color:'#4a6880',fontSize:10}}>{m.id}</span>
                  <span style={{background:'#1e3a52',color:'#8fa8c0',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700,textTransform:'uppercase'}}>{m.urgency}</span>
                  <span style={{background:'#1e3a52',color:'#8fa8c0',padding:'2px 10px',borderRadius:4,fontSize:10}}>{m.status}</span>
                </div>
                <div style={{color:'#fff',fontWeight:700,fontSize:18}}>{m.cargo}</div>
                <div style={{color:'#8fa8c0',fontSize:12,marginTop:2}}>{m.damage} - {m.client}</div>
              </div>
            </div>
            <div style={{color:'#8fa8c0',fontSize:12}}>📍 {m.location}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ExpertDashboard({user}) {
  const router = useRouter()
  return (
    <div style={{background:'#0c1a27',minHeight:'100vh'}}>
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
            ['Ce Mois','8400 EUR','Revenus','#f0a500'],
            ['En Attente','3250 EUR','3 expertises','#f0a500'],
            ['Missions Actives','5','En cours','#2e7d32'],
            ['Taux Acceptation','94%','90 derniers jours','#5a9eff']
          ].map(([label,val,sub,color])=>(
            <div key={label} style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:'16px 20px'}}>
              <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>{label}</div>
              <div style={{color,fontSize:26,fontWeight:800}}>{val}</div>
              <div style={{color:'#4a6880',fontSize:11,marginTop:4}}>{sub}</div>
            </div>
          ))}
        </div>
        <h2 style={{color:'#fff',fontSize:22,fontWeight:800,marginBottom:16}}>Demandes Entrantes</h2>
        {[
          {id:'SL-2024-0892',cargo:'Container FCL',damage:'Water damage',client:'Maersk Line',insurer:'Axa Marine',location:'Port of Rotterdam',urgency:'urgent',distance:'2.1 km'},
          {id:'SL-2024-0889',cargo:'Bulk Grain',damage:'Contamination',client:'Cargill International',insurer:'Lloyds of London',location:'Europoort Terminal',urgency:'normal',distance:'5.4 km'},
        ].map(m=>(
          <div key={m.id} style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:20,marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                  <span style={{color:'#4a6880',fontSize:10}}>{m.id}</span>
                  <span style={{background:'#1e3a52',color:'#8fa8c0',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700,textTransform:'uppercase'}}>{m.urgency}</span>
                </div>
                <div style={{color:'#fff',fontWeight:700,fontSize:20}}>{m.cargo}</div>
                <div style={{color:'#8fa8c0',fontSize:12,marginTop:2}}>{m.damage}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{color:'#dd2e1e',fontWeight:800,fontSize:16}}>{m.distance}</div>
                <div style={{color:'#4a6880',fontSize:10}}>de vous</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
              {[['Location',m.location],['Assureur',m.insurer],['Client',m.client],['Docs','2 fichiers']].map(([k,v])=>(
                <div key={k} style={{background:'#0f1e2e',borderRadius:7,padding:'8px 12px'}}>
                  <div style={{color:'#4a6880',fontSize:9,marginBottom:2}}>{k}</div>
                  <div style={{color:'#e8edf5',fontSize:11}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'10px',cursor:'pointer',fontWeight:700}}>Decliner</button>
              <button style={{flex:1,background:'#2e7d32',color:'#fff',border:'none',borderRadius:7,padding:'10px',cursor:'pointer',fontWeight:700}}>Accepter et Coter</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
