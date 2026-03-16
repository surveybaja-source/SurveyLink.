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
          Compte cree !
        </h2>
        <p style={{color:'#8fa8c0',fontSize:14,lineHeight:1.75,marginBottom:32}}>
          Votre compte insurer est en cours de verification. Notre equipe va examiner vos documents dans les 24 a 48 heures. Vous recevrez un email de confirmation.
        </p>
        <div style={{background:'rgba(46,125,50,0.1)',border:'1px solid #2e7d32',borderRadius:10,padding:'14px 20px',marginBottom:24}}>
          <div style={{color:'#2e7d32',fontWeight:700,fontSize:13}}>Prochaines etapes</div>
          <div style={{color:'#8fa8c0',fontSize:12,marginTop:6,lineHeight:1.6}}>
            1. Verification de vos documents<br/>
            2. Validation de votre licence assurance<br/>
            3. Activation de votre compte<br/>
            4. Acces au portail insurer
          </div>
        </div>
        <button onClick={()=>router.push('/auth')}
          style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>
          Retour a la connexion
        </button>
      </div>
    </div>
  )
}
