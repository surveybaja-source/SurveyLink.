'use client'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh',fontFamily:'Arial, sans-serif'}}>

      {/* NAVBAR */}
      <nav style={{background:'#0f1e2e',borderBottom:'1px solid #1e3a52',padding:'0 48px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <span style={{color:'#fff',fontWeight:900,fontSize:24,letterSpacing:'0.08em',fontFamily:'var(--font-raleway)'}}>
          INSPE<span style={{color:'#dd2e1e'}}>LINK</span>
        </span>
        <div style={{display:'flex',gap:12}}>
          <button onClick={()=>router.push('/auth')}
            style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'8px 20px',cursor:'pointer',fontWeight:600,fontSize:13}}>
            Sign In
          </button>
          <button onClick={()=>router.push('/register/insurer')}
            style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'8px 20px',cursor:'pointer',fontWeight:700,fontSize:13}}>
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{maxWidth:1100,margin:'0 auto',padding:'100px 48px 80px',textAlign:'center'}}>
        <div style={{display:'inline-block',background:'rgba(221,46,30,0.1)',border:'1px solid rgba(221,46,30,0.3)',borderRadius:20,padding:'6px 16px',marginBottom:24}}>
          <span style={{color:'#dd2e1e',fontSize:12,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase'}}>Now Live — 60+ Countries</span>
        </div>
        <h1 style={{color:'#fff',fontSize:56,fontWeight:900,lineHeight:1.15,marginBottom:24,letterSpacing:'-0.02em',fontFamily:'var(--font-raleway)'}}>
          The Marine Cargo Survey<br/>
          <span style={{color:'#dd2e1e'}}>Marketplace</span>
        </h1>
        <p style={{color:'#8fa8c0',fontSize:20,lineHeight:1.7,maxWidth:640,margin:'0 auto 40px'}}>
          Connecting marine cargo insurers with certified independent surveyors worldwide. Find the right expert in under 4 hours — from Rotterdam to Lagos to Dubai.
        </p>
        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={()=>router.push('/register/insurer')}
            style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:8,padding:'14px 32px',cursor:'pointer',fontWeight:700,fontSize:16}}>
            I'm an Insurer / P&I
          </button>
          <button onClick={()=>router.push('/register/expert')}
            style={{background:'transparent',color:'#fff',border:'1px solid #1e3a52',borderRadius:8,padding:'14px 32px',cursor:'pointer',fontWeight:700,fontSize:16}}>
            I'm a Cargo Surveyor
          </button>
        </div>
      </div>

      {/* STATS */}
      <div style={{background:'#0f1e2e',borderTop:'1px solid #1e3a52',borderBottom:'1px solid #1e3a52',padding:'40px 48px'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:32,textAlign:'center'}}>
          {[
            ['60+','Countries covered'],
            ['< 4h','Average response time'],
            ['0','Subscription fee'],
            ['1%','Commission only'],
          ].map(([val,label])=>(
            <div key={label}>
              <div style={{color:'#dd2e1e',fontSize:36,fontWeight:900,fontFamily:'var(--font-raleway)'}}>{val}</div>
              <div style={{color:'#8fa8c0',fontSize:13,marginTop:6}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{maxWidth:1100,margin:'0 auto',padding:'80px 48px'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <div style={{color:'#dd2e1e',fontSize:11,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:12}}>Simple & Fast</div>
          <h2 style={{color:'#fff',fontSize:36,fontWeight:900,margin:0,fontFamily:'var(--font-raleway)'}}>How It Works</h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
          {[
            {num:'01',title:'Post Your Mission',desc:'Create a survey request in 5 minutes. Describe the cargo, location, urgency and upload any relevant documents.',color:'#dd2e1e'},
            {num:'02',title:'Receive Quotes',desc:'Certified surveyors in your zone respond with competitive quotes, proposed dates and their credentials.',color:'#f0a500'},
            {num:'03',title:'Survey & Report',desc:'Accept the best quote, pay a 20% deposit and receive your reports directly on the platform. Balance paid on final report.',color:'#2e7d32'},
          ].map(s=>(
            <div key={s.num} style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:28,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:20,right:24,color:'#1e3a52',fontSize:48,fontWeight:900,fontFamily:'var(--font-raleway)'}}>{s.num}</div>
              <div style={{width:40,height:4,background:s.color,borderRadius:2,marginBottom:20}}/>
              <h3 style={{color:'#fff',fontWeight:800,fontSize:18,marginBottom:12,marginTop:0}}>{s.title}</h3>
              <p style={{color:'#8fa8c0',fontSize:14,lineHeight:1.7,margin:0}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOR WHO */}
      <div style={{background:'#0f1e2e',borderTop:'1px solid #1e3a52',borderBottom:'1px solid #1e3a52',padding:'80px 48px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{color:'#dd2e1e',fontSize:11,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:12}}>Two Sides, One Platform</div>
            <h2 style={{color:'#fff',fontSize:36,fontWeight:900,margin:0,fontFamily:'var(--font-raleway)'}}>Built for Everyone in the Chain</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>

            {/* INSURER */}
            <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:32}}>
              <div style={{fontSize:32,marginBottom:16}}>🏢</div>
              <h3 style={{color:'#fff',fontWeight:800,fontSize:22,marginBottom:8,marginTop:0}}>For Insurers & P&I</h3>
              <p style={{color:'#8fa8c0',fontSize:14,lineHeight:1.7,marginBottom:24}}>Stop spending hours on the phone trying to find a certified surveyor. Get qualified quotes in under 4 hours, anywhere in the world.</p>
              {[
                'Post a mission in 5 minutes',
                'Receive quotes from certified experts',
                'Track files and reports online',
                'Secure payments via Stripe',
                'Rate surveyors after each mission',
              ].map(item=>(
                <div key={item} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <span style={{color:'#2e7d32',fontSize:14,fontWeight:700}}>✓</span>
                  <span style={{color:'#8fa8c0',fontSize:13}}>{item}</span>
                </div>
              ))}
              <button onClick={()=>router.push('/register/insurer')}
                style={{width:'100%',background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'12px',cursor:'pointer',fontWeight:700,fontSize:14,marginTop:16}}>
                Register as Insurer
              </button>
            </div>

            {/* SURVEYOR */}
            <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:32}}>
              <div style={{fontSize:32,marginBottom:16}}>🔍</div>
              <h3 style={{color:'#fff',fontWeight:800,fontSize:22,marginBottom:8,marginTop:0}}>For Cargo Surveyors</h3>
              <p style={{color:'#8fa8c0',fontSize:14,lineHeight:1.7,marginBottom:24}}>Receive qualified missions directly — no prospecting, no cold calls. Get paid automatically with no more 60-day invoices.</p>
              {[
                'Receive missions matching your expertise',
                'No prospecting or cold calls needed',
                '20% deposit on mission start',
                '80% balance on final report delivery',
                'Build your reputation with ratings',
              ].map(item=>(
                <div key={item} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <span style={{color:'#2e7d32',fontSize:14,fontWeight:700}}>✓</span>
                  <span style={{color:'#8fa8c0',fontSize:13}}>{item}</span>
                </div>
              ))}
              <button onClick={()=>router.push('/register/expert')}
                style={{width:'100%',background:'transparent',color:'#fff',border:'1px solid #1e3a52',borderRadius:7,padding:'12px',cursor:'pointer',fontWeight:700,fontSize:14,marginTop:16}}>
                Register as Surveyor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{maxWidth:1100,margin:'0 auto',padding:'80px 48px',textAlign:'center'}}>
        <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:16,padding:'60px 48px'}}>
          <h2 style={{color:'#fff',fontSize:40,fontWeight:900,marginBottom:16,fontFamily:'var(--font-raleway)'}}>
            Ready to Get Started?
          </h2>
          <p style={{color:'#8fa8c0',fontSize:18,lineHeight:1.7,maxWidth:500,margin:'0 auto 32px'}}>
            No subscription. No monthly fee. Just sign up — it's free. We only take a small commission when a mission is completed.
          </p>
          <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
            <button onClick={()=>router.push('/register/insurer')}
              style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:8,padding:'14px 32px',cursor:'pointer',fontWeight:700,fontSize:16}}>
              Register as Insurer
            </button>
            <button onClick={()=>router.push('/register/expert')}
              style={{background:'transparent',color:'#fff',border:'1px solid #1e3a52',borderRadius:8,padding:'14px 32px',cursor:'pointer',fontWeight:700,fontSize:16}}>
              Register as Surveyor
            </button>
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
