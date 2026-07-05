'use client'
import { useRouter } from 'next/navigation'

const BASE = 'https://bcjnbmqrtdibhqtrjaye.supabase.co/storage/v1/object/public/public-assets'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh',fontFamily:'Arial, sans-serif'}}>

      {/* NAVBAR */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(12,26,39,0.92)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(30,58,82,0.5)',padding:'0 48px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{color:'#fff',fontWeight:900,fontSize:24,letterSpacing:'0.08em',fontFamily:'var(--font-raleway)'}}>
          INSPE<span style={{color:'#dd2e1e'}}>LINK</span>
        </span>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <button onClick={()=>router.push('/auth')}
            style={{background:'transparent',color:'#8fa8c0',border:'1px solid rgba(30,58,82,0.8)',borderRadius:7,padding:'8px 20px',cursor:'pointer',fontWeight:600,fontSize:13}}>
            Sign In
          </button>
          <button onClick={()=>router.push('/register/insurer')}
            style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'8px 20px',cursor:'pointer',fontWeight:700,fontSize:13}}>
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{position:'relative',height:'100vh',minHeight:600,display:'flex',alignItems:'center',overflow:'hidden'}}>
        {/* Background photo */}
        <div style={{
          position:'absolute',inset:0,
          backgroundImage:`url(${BASE}/Hero.jpeg)`,
          backgroundSize:'cover',
          backgroundPosition:'center 40%',
          filter:'brightness(0.35)',
        }}/>
        {/* Gradient overlay */}
        <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,rgba(12,26,39,0.95) 45%,rgba(12,26,39,0.3) 100%)'}}/>

        <div style={{position:'relative',maxWidth:1100,margin:'0 auto',padding:'0 48px',width:'100%'}}>
          <div style={{maxWidth:620}}>
            <div style={{display:'inline-block',background:'rgba(221,46,30,0.12)',border:'1px solid rgba(221,46,30,0.35)',borderRadius:4,padding:'5px 14px',marginBottom:24}}>
              <span style={{color:'#dd2e1e',fontSize:11,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase'}}>
                Marine Cargo Survey Platform
              </span>
            </div>

            <h1 style={{color:'#fff',fontSize:58,fontWeight:900,lineHeight:1.08,marginBottom:20,letterSpacing:'-0.02em',fontFamily:'var(--font-raleway)'}}>
              Find a certified<br/>
              surveyor at<br/>
              <span style={{color:'#dd2e1e'}}>any port, any time.</span>
            </h1>

            <p style={{color:'#8fa8c0',fontSize:17,lineHeight:1.75,maxWidth:520,marginBottom:36}}>
              From draft surveys in Rotterdam to damage assessments in Abidjan — INSPELINK connects marine cargo insurers and P&I correspondents with independent certified surveyors worldwide.
            </p>

            <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
              <button onClick={()=>router.push('/register/insurer')}
                style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:8,padding:'14px 32px',cursor:'pointer',fontWeight:700,fontSize:15,letterSpacing:'0.02em'}}>
                I need a surveyor
              </button>
              <button onClick={()=>router.push('/register/expert')}
                style={{background:'transparent',color:'#fff',border:'1px solid rgba(255,255,255,0.25)',borderRadius:8,padding:'14px 32px',cursor:'pointer',fontWeight:600,fontSize:15}}>
                I am a surveyor
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{position:'absolute',bottom:32,left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
          <div style={{width:1,height:40,background:'linear-gradient(180deg,transparent,rgba(221,46,30,0.6))'}}/>
          <div style={{width:5,height:5,borderRadius:'50%',background:'#dd2e1e'}}/>
        </div>
      </div>

      {/* STATS */}
      <div style={{background:'#0f1e2e',borderTop:'1px solid #1e3a52',borderBottom:'1px solid #1e3a52',padding:'36px 48px'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:32,textAlign:'center'}}>
          {[
            ['60+','Countries covered'],
            ['< 4h','Average response time'],
            ['1%','Commission — no monthly fee'],
          ].map(([val,label])=>(
            <div key={label} style={{padding:'8px 0'}}>
              <div style={{color:'#dd2e1e',fontSize:40,fontWeight:900,fontFamily:'var(--font-raleway)',letterSpacing:'-0.02em'}}>{val}</div>
              <div style={{color:'#8fa8c0',fontSize:13,marginTop:6,letterSpacing:'0.02em'}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{maxWidth:1100,margin:'0 auto',padding:'88px 48px'}}>
        <div style={{marginBottom:56}}>
          <h2 style={{color:'#fff',fontSize:38,fontWeight:900,margin:'0 0 16px',fontFamily:'var(--font-raleway)',letterSpacing:'-0.01em'}}>
            From nomination to final report<br/>
            <span style={{color:'#dd2e1e'}}>in one platform.</span>
          </h2>
          <p style={{color:'#8fa8c0',fontSize:15,lineHeight:1.7,maxWidth:520,margin:0}}>
            No more calls at midnight to find a correspondent. No more chasing invoices 60 days later.
          </p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2}}>
          {[
            {
              num:'01',
              title:'Submit your mission',
              desc:'Describe the cargo, location and nature of the survey — pre-shipment inspection, damage assessment, draft survey, on-hire/off-hire. Upload your LOI or existing documentation.',
              photo:`${BASE}/Warehouse.jpeg`,
              color:'#dd2e1e'
            },
            {
              num:'02',
              title:'Receive competitive quotes',
              desc:'Certified surveyors in your area respond within hours with their fee, proposed date and credentials. CESAM, Lloyd\'s accredited, IFIA members — you choose.',
              photo:`${BASE}/Reefer.jpeg`,
              color:'#f0a500'
            },
            {
              num:'03',
              title:'Survey completed, report delivered',
              desc:'Accept the quote, pay a 20% deposit to confirm the mission. The balance is charged automatically when the final report is uploaded to the platform.',
              photo:`${BASE}/Damage.jpeg`,
              color:'#2e7d32'
            },
          ].map((s,i)=>(
            <div key={s.num} style={{position:'relative',overflow:'hidden',borderRadius: i===0?'12px 0 0 12px':i===2?'0 12px 12px 0':'0'}}>
              <div style={{
                position:'absolute',inset:0,
                backgroundImage:`url(${s.photo})`,
                backgroundSize:'cover',
                backgroundPosition:'center',
                filter:'brightness(0.25)',
              }}/>
              <div style={{position:'absolute',inset:0,background:`linear-gradient(180deg,transparent 30%,rgba(12,26,39,0.95) 100%)`}}/>
              <div style={{position:'relative',padding:'180px 28px 32px'}}>
                <div style={{color:s.color,fontFamily:'var(--font-raleway)',fontWeight:900,fontSize:48,letterSpacing:'-0.02em',marginBottom:12,opacity:0.4}}>{s.num}</div>
                <div style={{width:32,height:3,background:s.color,borderRadius:2,marginBottom:16}}/>
                <h3 style={{color:'#fff',fontWeight:800,fontSize:17,marginBottom:10,marginTop:0,lineHeight:1.3}}>{s.title}</h3>
                <p style={{color:'#8fa8c0',fontSize:13,lineHeight:1.7,margin:0}}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOR WHO */}
      <div style={{background:'#0f1e2e',borderTop:'1px solid #1e3a52',borderBottom:'1px solid #1e3a52',padding:'88px 48px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{marginBottom:56}}>
            <h2 style={{color:'#fff',fontSize:38,fontWeight:900,margin:'0 0 16px',fontFamily:'var(--font-raleway)',letterSpacing:'-0.01em'}}>
              Whether you need a surveyor<br/>
              <span style={{color:'#dd2e1e'}}>or you are one.</span>
            </h2>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'5fr 4fr',gap:24}}>

            {/* INSURER — larger */}
            <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,overflow:'hidden'}}>
              <div style={{
                height:220,
                backgroundImage:`url(${BASE}/Hero.jpeg)`,
                backgroundSize:'cover',
                backgroundPosition:'center 55%',
                position:'relative',
              }}>
                <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,transparent 30%,rgba(19,32,48,1) 100%)'}}/>
                <div style={{position:'absolute',bottom:20,left:28}}>
                  <div style={{color:'#4a6880',fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:4}}>For Insurers & P&I</div>
                  <div style={{color:'#fff',fontWeight:800,fontSize:22,fontFamily:'var(--font-raleway)'}}>You need it done right,<br/>tonight.</div>
                </div>
              </div>
              <div style={{padding:'24px 28px 28px'}}>
                <p style={{color:'#8fa8c0',fontSize:14,lineHeight:1.75,marginBottom:24}}>
                  A general average case in Antwerp. A reefer claim in Singapore. A pre-shipment in Abidjan on a Monday morning. Stop making calls — post your mission and let certified surveyors come to you.
                </p>
                <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
                  {[
                    'Post a mission in under 5 minutes',
                    'Receive quotes from CESAM & Lloyd\'s accredited experts',
                    'Full document trail — LOI, reports, timestamps',
                    'Secure escrow payments via Stripe',
                    'Rate and build a network of trusted surveyors',
                  ].map(item=>(
                    <div key={item} style={{display:'flex',alignItems:'flex-start',gap:10}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginTop:2,flexShrink:0}}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span style={{color:'#8fa8c0',fontSize:13,lineHeight:1.5}}>{item}</span>
                    </div>
                  ))}
                </div>
                <button onClick={()=>router.push('/register/insurer')}
                  style={{width:'100%',background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'13px',cursor:'pointer',fontWeight:700,fontSize:14}}>
                  Register as Insurer / P&I
                </button>
              </div>
            </div>

            {/* SURVEYOR — smaller */}
            <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,overflow:'hidden'}}>
              <div style={{
                height:220,
                backgroundImage:`url(${BASE}/Reefer.jpeg)`,
                backgroundSize:'cover',
                backgroundPosition:'center',
                position:'relative',
              }}>
                <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,transparent 30%,rgba(19,32,48,1) 100%)'}}/>
                <div style={{position:'absolute',bottom:20,left:28}}>
                  <div style={{color:'#4a6880',fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:4}}>For Cargo Surveyors</div>
                  <div style={{color:'#fff',fontWeight:800,fontSize:22,fontFamily:'var(--font-raleway)'}}>Missions come<br/>to you.</div>
                </div>
              </div>
              <div style={{padding:'24px 28px 28px'}}>
                <p style={{color:'#8fa8c0',fontSize:13,lineHeight:1.75,marginBottom:24}}>
                  No more prospecting. No more 60-day payment terms. Receive qualified missions matching your expertise and geography, and get paid automatically.
                </p>
                <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
                  {[
                    'Missions matched to your coverage zone',
                    '20% deposit on mission start',
                    '80% on final report upload — automatic',
                    'Build your reputation with verified ratings',
                  ].map(item=>(
                    <div key={item} style={{display:'flex',alignItems:'flex-start',gap:10}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginTop:2,flexShrink:0}}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span style={{color:'#8fa8c0',fontSize:13,lineHeight:1.5}}>{item}</span>
                    </div>
                  ))}
                </div>
                <button onClick={()=>router.push('/register/expert')}
                  style={{width:'100%',background:'transparent',color:'#fff',border:'1px solid #1e3a52',borderRadius:7,padding:'13px',cursor:'pointer',fontWeight:700,fontSize:14}}>
                  Register as Surveyor
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{maxWidth:1100,margin:'0 auto',padding:'88px 48px'}}>
        <div style={{
          position:'relative',
          borderRadius:16,
          overflow:'hidden',
          padding:'72px 64px',
          background:'#132030',
          border:'1px solid #1e3a52',
        }}>
          <div style={{position:'absolute',inset:0,backgroundImage:`url(${BASE}/Hero.jpeg)`,backgroundSize:'cover',backgroundPosition:'center 60%',opacity:0.08}}/>
          <div style={{position:'relative',maxWidth:560}}>
            <h2 style={{color:'#fff',fontSize:42,fontWeight:900,marginBottom:16,fontFamily:'var(--font-raleway)',letterSpacing:'-0.01em',lineHeight:1.1}}>
              No subscription.<br/>
              No lock-in.<br/>
              <span style={{color:'#dd2e1e'}}>Just sign up.</span>
            </h2>
            <p style={{color:'#8fa8c0',fontSize:16,lineHeight:1.75,maxWidth:420,marginBottom:36}}>
              INSPELINK takes a 1% commission when a mission is completed. That's it. Free to join, free to browse, free to quote.
            </p>
            <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
              <button onClick={()=>router.push('/register/insurer')}
                style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:8,padding:'14px 32px',cursor:'pointer',fontWeight:700,fontSize:15}}>
                I need a surveyor
              </button>
              <button onClick={()=>router.push('/register/expert')}
                style={{background:'transparent',color:'#fff',border:'1px solid rgba(255,255,255,0.2)',borderRadius:8,padding:'14px 32px',cursor:'pointer',fontWeight:600,fontSize:15}}>
                I am a surveyor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{background:'#0f1e2e',borderTop:'1px solid #1e3a52',padding:'32px 48px'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <span style={{color:'#fff',fontWeight:900,fontSize:20,letterSpacing:'0.08em',fontFamily:'var(--font-raleway)'}}>
            INSPE<span style={{color:'#dd2e1e'}}>LINK</span>
          </span>
          <span style={{color:'#4a6880',fontSize:12}}>© 2026 INSPELINK — Marine Cargo Survey Platform</span>
          <div style={{display:'flex',gap:20}}>
            <button onClick={()=>router.push('/auth')} style={{background:'none',border:'none',color:'#8fa8c0',cursor:'pointer',fontSize:13}}>Sign In</button>
            <button onClick={()=>router.push('/register/insurer')} style={{background:'none',border:'none',color:'#8fa8c0',cursor:'pointer',fontSize:13}}>Register</button>
          </div>
        </div>
      </div>

    </div>
  )
}
