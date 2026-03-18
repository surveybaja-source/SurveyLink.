'use client'
import { useRouter } from 'next/navigation'

export default function PendingInsurer() {
  const router = useRouter()
  return (
    <div style={{background:'#0c1a27',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{maxWidth:480,textAlign:'center'}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(46,125,50,0.1)',border:'2px solid #2e7d32',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,margin:'0 auto 24px'}}>
          ✓
        </div>
        <h2 style={{color:'#fff',fontSize:36,fontWeight:900,marginBottom:12}}>
          Account Created!
        </h2>
        <p style={{color:'#8fa8c0',fontSize:14,lineHeight:1.75,marginBottom:32}}>
          Your insurer account is under review. Our team will verify your documents within 24 to 48 hours. You will receive a confirmation email once your account is activated.
        </p>
        <div style={{background:'rgba(46,125,50,0.1)',border:'1px solid #2e7d32',borderRadius:10,padding:'14px 20px',marginBottom:24}}>
          <div style={{color:'#2e7d32',fontWeight:700,fontSize:13}}>Next Steps</div>
          <div style={{color:'#8fa8c0',fontSize:12,marginTop:6,lineHeight:1.6}}>
            1. Document verification<br/>
            2. Insurance license validation<br/>
            3. Account activation<br/>
            4. Access to insurer portal
          </div>
        </div>
        <button onClick={()=>router.push('/auth')}
          style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>
          Back to Sign In
        </button>
      </div>
    </div>
  )
}
