'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ExpertRegister() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const [f, setF] = useState({
    company:'',country:'',city:'',zip:'',address:'',regNum:'',vatNum:'',
    firstName:'',lastName:'',email:'',phone:'',password:'',password2:'',
    experience:'',bio:'',dayRate:'',currency:'EUR',
    iban:'',bic:'',bankName:'',accountHolder:'',agreed:false
  })
  const [languages, setLanguages] = useState([])
  const [certifications, setCertifications] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [commodities, setCommodities] = useState([])
  const [equipment, setEquipment] = useState([])
  const [coverage, setCoverage] = useState([])

  const u = k => v => setF(p => ({...p,[k]:v}))
  const tog = setter => item => setter(p => p.includes(item)?p.filter(x=>x!==item):[...p,item])

  const STEPS = ['Societe','Profil','Expertise','Equipement','Banque']
  const COUNTRIES = ['France','Belgique','Pays-Bas','Allemagne','Royaume-Uni','Espagne','Italie','Singapour','Autre']
  const LANGUAGES = ['Anglais','Francais','Espagnol','Neerlandais','Allemand','Italien','Portugais','Arabe','Mandarin','Russe','Autre']
  const CERTIFICATIONS = ['CESAM','Lloyds Accredited','IFIA','FOSFA','GAFTA','ISO 17020','Bureau Veritas','SGS','Intertek','P&I Club Panel','IMO IMSBC','STCW']
  const SPECIALTIES = ['Bulk Cargo','Container FCL','Container LCL','Reefer','Tanker Liquide','Petrole','Chimique','Heavy Lift','Projet Cargo','Marchandises Dangereuses','RoRo','Breakbulk','Fumigation','Echantillonnage']
  const COMMODITIES = ['Ble','Mais','Soja','Riz','Sucre','Cafe','Huiles Vegetales','Engrais','Charbon','Minerai de Fer','Ciment','Produits Petroliers','Produits Frais','Viande Congelee','Produits Laitiers']
  const EQUIPMENT = ['Thermometre Digital','Hygrometre','Refractometre Brix','pH-metre','Detecteur Gaz','Analyseur O2','Drone','Recuperateur Reefer','Jauge Ultrasons','Luxmetre']
  const GEO = ['Europe Nord-Ouest','Mediterranee','Afrique Ouest','Afrique Est','Moyen-Orient','Asie du Sud','Asie du Sud-Est','Extreme-Orient','Amerique du Nord','Amerique du Sud']

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({email:f.email,password:f.password})
    if (error) { setError(error.message); setLoading(false); return }
    await supabase.from('profiles').insert({
      id:data.user.id,role:'expert',email:f.email,
      company:f.company,first_name:f.firstName,last_name:f.lastName,
      phone:f.phone,country:f.country,city:f.city,
      iban:f.iban,bic:f.bic,bank_name:f.bankName,verified:false
    })
    router.push('/pending')
    setLoading(false)
  }

  const Inp = ({id,ph,val,set,type='text'}) => (
    <div style={{marginBottom:12}}>
      <input id={id} name={id} type={type} placeholder={ph} value={val} onChange={e=>set(e.target.value)}
        style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13}}/>
    </div>
  )

  const Sel = ({id,opts,val,set}) => (
    <div style={{marginBottom:12}}>
      <select id={id} value={val} onChange={e=>set(e.target.value)}
        style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:val?'#fff':'#4a6880',boxSizing:'border-box',fontSize:13}}>
        <option value="">Selectionner...</option>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  const Chk = ({items,selected,toggle}) => (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:16}}>
      {items.map(item=>{
        const a = selected.includes(item)
        return (
          <div key={item} onClick={()=>toggle(item)}
            style={{background:a?'rgba(46,125,50,0.15)':'#0f1e2e',border:a?'1px solid #2e7d32':'1px solid #1e3a52',borderRadius:6,padding:'7px 10px',cursor:'pointer',color:a?'#a5d6a7':'#8fa8c0',fontSize:11,display:'flex',alignItems:'center',gap:6,userSelect:'none'}}>
            <span style={{fontSize:10,color:a?'#2e7d32':'#4a6880'}}>✓</span>{item}
          </div>
        )
      })}
    </div>
  )

  const SecT = ({text}) => (
    <div style={{color:'#fff',fontWeight:700,fontSize:13,letterSpacing:'0.08em',textTransform:'uppercase',margin:'20px 0 12px',paddingBottom:8,borderBottom:'1px solid #1e3a52'}}>{text}</div>
  )

  const btnBg = disabled => disabled ? 'rgba(221,46,30,0.45)' : '#dd2e1e'

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh',padding:'32px 24px'}}>
      <div style={{maxWidth:700,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
          <button onClick={()=>step>0?setStep(s=>s-1):router.push('/auth')}
            style={{background:'none',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 12px',color:'#8fa8c0',cursor:'pointer',fontSize:11}}>
            Retour
          </button>
          <div>
            <div style={{color:'#4a6880',fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase'}}>Inscription - Cargo Surveyor</div>
            <div style={{color:'#fff',fontWeight:800,fontSize:22}}>Creer votre profil expert</div>
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
              <SecT text="Informations Societe"/>
              <Inp id="company" ph="Nom de la societe" val={f.company} set={u('company')}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Sel id="country" opts={COUNTRIES} val={f.country} set={u('country')}/>
                <Inp id="city" ph="Ville" val={f.city} set={u('city')}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp id="regNum" ph="No. Enregistrement" val={f.regNum} set={u('regNum')}/>
                <Inp id="vatNum" ph="Numero TVA" val={f.vatNum} set={u('vatNum')}/>
              </div>
              <SecT text="Informations Personnelles"/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp id="firstName" ph="Prenom" val={f.firstName} set={u('firstName')}/>
                <Inp id="lastName" ph="Nom" val={f.lastName} set={u('lastName')}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp id="email" ph="Email" val={f.email} set={u('email')} type="email"/>
                <Inp id="phone" ph="Telephone" val={f.phone} set={u('phone')}/>
              </div>
              <SecT text="Securite"/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp id="pw" ph="Mot de passe" val={f.password} set={u('password')} type="password"/>
                <Inp id="pw2" ph="Confirmer" val={f.password2} set={u('password2')} type="password"/>
              </div>
              {f.password&&f.password2&&f.password!==f.password2&&(
                <p style={{color:'#dd2e1e',fontSize:11,marginBottom:12}}>Les mots de passe ne correspondent pas</p>
              )}
              <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
                <button onClick={()=>setStep(1)} style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>
                  Suivant
                </button>
              </div>
            </div>
          )}

          {step===1&&(
            <div>
              <SecT text="Profil Professionnel"/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Sel id="exp" opts={['Moins de 2 ans','2 a 5 ans','5 a 10 ans','10 a 20 ans','Plus de 20 ans']} val={f.experience} set={u('experience')}/>
                <Sel id="currency" opts={['EUR','USD','GBP','SGD','AED','CHF']} val={f.currency} set={u('currency')}/>
              </div>
              <Inp id="rate" ph="Tarif journalier (ex: 1200)" val={f.dayRate} set={u('dayRate')}/>
              <div style={{marginBottom:12}}>
                <textarea id="bio" placeholder="Decrivez votre parcours et expertise..." value={f.bio} onChange={e=>u('bio')(e.target.value)} rows={4}
                  style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13,resize:'vertical'}}/>
              </div>
              <SecT text="Langues Parlees"/>
              <Chk items={LANGUAGES} selected={languages} toggle={tog(setLanguages)}/>
              <SecT text="Certifications"/>
              <Chk items={CERTIFICATIONS} selected={certifications} toggle={tog(setCertifications)}/>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
                <button onClick={()=>setStep(0)} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Retour</button>
                <button onClick={()=>setStep(2)} style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>Suivant</button>
              </div>
            </div>
          )}

          {step===2&&(
            <div>
              <SecT text="Specialites d Expertise"/>
              <Chk items={SPECIALTIES} selected={specialties} toggle={tog(setSpecialties)}/>
              <SecT text="Matieres Premieres"/>
              <Chk items={COMMODITIES} selected={commodities} toggle={tog(setCommodities)}/>
              <SecT text="Couverture Geographique"/>
              <Chk items={GEO} selected={coverage} toggle={tog(setCoverage)}/>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
                <button onClick={()=>setStep(1)} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Retour</button>
                <button onClick={()=>setStep(3)} style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>Suivant</button>
              </div>
            </div>
          )}

          {step===3&&(
            <div>
              <SecT text="Equipement et Kit de Test"/>
              <Chk items={EQUIPMENT} selected={equipment} toggle={tog(setEquipment)}/>
              <SecT text="Documents Professionnels"/>
              {['Assurance RC Professionnelle','Piece d identite','Photo de profil'].map(doc=>(
                <div key={doc} style={{marginBottom:10,background:'#0f1e2e',border:'2px dashed #1e3a52',borderRadius:8,padding:'12px 16px',display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>
                  <span style={{fontSize:18}}>📎</span>
                  <div>
                    <div style={{color:'#8fa8c0',fontSize:12}}>{doc}</div>
                    <div style={{color:'#4a6880',fontSize:10,marginTop:2}}>PDF, JPG ou PNG - max 5 Mo</div>
                  </div>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
                <button onClick={()=>setStep(2)} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Retour</button>
                <button onClick={()=>setStep(4)} style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>Suivant</button>
              </div>
            </div>
          )}

          {step===4&&(
            <div>
              <SecT text="Coordonnees Bancaires"/>
              <Inp id="holder" ph="Titulaire du compte" val={f.accountHolder} set={u('accountHolder')}/>
              <Inp id="iban" ph="IBAN" val={f.iban} set={u('iban')}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Inp id="bic" ph="BIC / SWIFT" val={f.bic} set={u('bic')}/>
                <Inp id="bankName" ph="Nom de la banque" val={f.bankName} set={u('bankName')}/>
              </div>
              <div style={{background:'rgba(46,125,50,0.1)',border:'1px solid #2e7d32',borderRadius:10,padding:'14px 18px',marginBottom:14}}>
                <div style={{color:'#2e7d32',fontWeight:700,fontSize:12,marginBottom:10}}>RESUME DE VOTRE PROFIL</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                  {[['Specialites',specialties.length],['Matieres',commodities.length],['Equipements',equipment.length],['Certifications',certifications.length],['Regions',coverage.length],['Langues',languages.length]].map(([k,v])=>(
                    <div key={k} style={{textAlign:'center',background:'rgba(46,125,50,0.1)',borderRadius:6,padding:'8px 4px'}}>
                      <div style={{color:'#2e7d32',fontWeight:800,fontSize:20}}>{v}</div>
                      <div style={{color:'#4a6880',fontSize:9,textTransform:'uppercase'}}>{k}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{background:'rgba(221,46,30,0.08)',border:'1px solid #700300',borderRadius:8,padding:'11px 14px',marginBottom:14,display:'flex',gap:10}}>
                <span>🔒</span>
                <span style={{color:'#8fa8c0',fontSize:11,lineHeight:1.5}}>
                  Paiements via Stripe Connect. SurveyLink retient 1% par mission validee. Virements sous 3 a 5 jours ouvrables.
                </span>
              </div>
              <div onClick={()=>setF(p=>({...p,agreed:!p.agreed}))}
                style={{display:'flex',alignItems:'flex-start',gap:12,cursor:'pointer',marginBottom:20,padding:'12px 16px',borderRadius:8,background:f.agreed?'rgba(46,125,50,0.1)':'transparent',border:f.agreed?'1px solid #2e7d32':'1px solid #1e3a52'}}>
                <div style={{width:18,height:18,borderRadius:4,flexShrink:0,marginTop:1,background:f.agreed?'#2e7d32':'transparent',border:f.agreed?'2px solid #2e7d32':'2px solid #1e3a52',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {f.agreed&&<span style={{color:'#fff',fontSize:11,fontWeight:900}}>v</span>}
                </div>
                <span style={{color:'#8fa8c0',fontSize:11,lineHeight:1.6}}>
                  J accepte les Conditions Generales et le Code de Conduite SurveyLink.
                </span>
              </div>
              {error&&<p style={{color:'#dd2e1e',fontSize:12,marginBottom:12}}>{error}</p>}
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <button onClick={()=>setStep(3)} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Retour</button>
                <button onClick={handleSubmit} disabled={!f.iban||!f.bic||!f.accountHolder||!f.agreed||loading}
                  style={{background:(!f.iban||!f.bic||!f.accountHolder||!f.agreed||loading)?'rgba(46,125,50,0.45)':'#2e7d32',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>
                  {loading?'Envoi...':'Soumettre mon profil'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
