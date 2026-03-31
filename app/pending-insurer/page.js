'use client'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function PendingInsurer() {
  const router = useRouter()

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:480,textAlign:'center'}}>

        <div style={{marginBottom:32}}>
          <div style={{color:'#fff',fontWeight:900,fontSize:36,letterSpacing:'0.05em'}}>
            INSPE<span style={{color:'#dd2e1e'}}>LINK</span>
          </div>
        </div>

        <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:16,padding:36,boxShadow:'0 8px 32px rgba(0,0,0,0.3)'}}>
          <div style={{fontSize:48,marginBottom:20}}>⏳</div>
          <h2 style={{color:'#fff',fontWeight:800,fontSize:22,marginBottom:12,marginTop:0}}>Application Under Review</h2>
          <p style={{color:'#8fa8c0',fontSize:14,lineHeight:1.7,marginBottom:24}}>
            Thank you for registering as an insurer on INSPELINK. Your application is currently being reviewed by our team.
          </p>
          <div style={{background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:10,padding:'16px 20px',marginBottom:24,textAlign:'left'}}>
            <div style={{color:'#f0a500',fontWeight:700,fontSize:13,marginBottom:8}}>What happens next?</div>
            <div style={{color:'#8fa8c0',fontSize:13,lineHeight:1.7}}>
              Our team will verify your company details and professional background. You will receive an email confirmation once your account is activated — usually within 24-48 hours.
            </div>
          </div>
          <button onClick={()=>supabase.auth.signOut().then(()=>router.push('/auth'))}
            style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'12px 28px',cursor:'pointer',fontWeight:700,fontSize:14}}>
            Back to Sign In
          </button>
        </div>

        <p style={{color:'#4a6880',fontSize:11,marginTop:20}}>
          Questions? Contact us at <span style={{color:'#dd2e1e'}}>support@inspelink.com</span>
        </p>
      </div>
    </div>
  )
}
