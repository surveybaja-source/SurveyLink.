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
    company:'', country:'', city:'', zip:'', address:'', regNum:'', vatNum:'',
    firstName:'', lastName:'', email:'', phone:'', password:'', password2:'',
    experience:'', bio:'', dayRate:'', currency:'EUR',
    iban:'', bic:'', bankName:'', accountHolder:'', agreed:false
  })
  const [languages, setLanguages] = useState([])
  const [certifications, setCertifications] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [commodities, setCommodities] = useState([])
  const [equipment, setEquipment] = useState([])
  const [coverage, setCoverage] = useState([])

  const u = k => v => setF(p => ({...p, [k]: v}))
  const tog = setter => item => setter(p => p.includes(item) ? p.filter(x => x !== item) : [...p, item])

  const STEPS = ['Societe', 'Profil', 'Expertise', 'Equipement', 'Banque']
  const COUNTRIES = ['France','Belgique','Pays-Bas','Allemagne','Royaume-Uni','Espagne','Italie','Singapour','Emirats Arabes Unis','Chine','Etats-Unis','Autre']
  const LANGUAGES = ['Anglais','Francais','Espagnol','Neerlandais','Allemand','Italien','Portugais','Arabe','Mandarin','Japonais','Russe','Autre']
  const CERTIFICATIONS = ['CESAM','Lloyds Accredited','IFIA','FOSFA','GAFTA','ISO 17020','Bureau Veritas','SGS','Intertek','P&I Club Panel','IMO IMSBC','STCW']
  const SPECIALTIES = ['Bulk Cargo','Container FCL','Container LCL','Reefer','Tanker Liquide','Petrole','Chimique','Heavy Lift','Projet Cargo','Marchandises Dangereuses','RoRo','Breakbulk','Fumigation','Echantillonnage']
  const COMMODITIES = ['Ble','Mais','Soja','Riz','Sucre','Cafe','Huiles Vegetales','Engrais','Charbon','Minerai de Fer','Ciment','Produits Petroliers','Produits Frais','Viande Congelee','Produits Laitiers','Produits Pharmaceutiques']
  const EQUIPMENT = ['Thermometre Digital','Hygrometre','Refractometre Brix','pH-metre','Detecteur Gaz Drager','Analyseur O2','Drone','Recuperateur Donnees Reefer','Jauge Ultrasons','Luxmetre']
  const GEO = ['Europe Nord-Ouest','Mediterranee','Afrique Ouest','Afrique Est','Moyen-Orient','Asie du Sud','Asie du Sud-Est','Extreme-Orient','Amerique du Nord','Amerique du Sud']

  const regLabel = {'France':'KBIS / SIREN','Belgique':'BCE / CBE','Pays-Bas':'KVK','Royaume-Uni':'Companies House','Allemagne':'Handelsregister'}[f.country] || 'No. Enregistrement'

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({ email: f.email, password: f.password })
    if (error) { setError(error.message); setLoading(false); return }
    await supabase.from('profiles').insert({
      id: data.user.id,
      role: 'expert',
      email: f.email,
      company: f.company,
      first_name: f.firstName,
      last_name: f.lastName,
      phone: f.phone,
      country: f.country,
      city: f.city,
      iban: f.iban,
      bic: f.bic,
      bank_name: f.bankName,
      verified: false
    })
    router.push('/pending')
    setLoading(false)
  }

  const inp = (id, ph, val, set, type='text') => (
    <div style={{marginBottom:12}}>
      <input id={id} name={id} type={type} placeholder={ph} value={val} onChange={e=>set(e.target.value)}
        style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13}}/>
    </div>
  )

  const lbl = text => <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>{text}</div>

  const sel = (id, opts, val, set) => (
    <div style={{marginBottom:12}}>
      <select id={id} value={val} onChange={e=>set(e.target.value)}
        style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:val?'#fff':'#4a6880',boxSizing:'border-box',fontSize:13}}>
        <option value="">Selectionner...</option>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  const chk = (items, selected, toggle, cols=2) => (
    <div style={{display:'grid',gridTemplateColumns:'repeat(${cols},1fr)',gap:6,marginBottom:16}}>
      {items.map(item => {
        const active = selected.includes(item)
        return (
          <div key={item} onClick={()=>toggle(item)}
style={{background:active?'rgba(46,125,50,0.15)':'#0f1e2e',border:active?'1px solid #2e7d32':'1px solid #1e3a52',borderRadius:6,padding:'7px 10px',cursor:'pointer',color:active?'#a5d6a7':'#8fa8c0',fontSize:11,display:'flex',alignItems:'center',gap:6,userSelect:'none'}}>
                 <span style={{fontSize:10,color:active?'#2e7d32':'#4a6880'}}>✓</span>{item}
          </div>
        )
      })}
    </div>
  )

  const secTitle = text => (
    <div style={{color:'#fff',fontWeight:700,fontSize:13,letterSpacing:'0.08em',textTransform:'uppercase',margin:'20px 0 12px',paddingBottom:8,borderBottom:'1px solid #1e3a52'}}>{text}</div>
  )

  const grid2 = children => <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>{children}</div>

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
          {STEPS.map((s,i) => (
            <div key={i} style={{display:'flex',alignItems:'center',flex:i<STEPS.length-1?1:0}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:i<step?'#2e7d32':i===step?'#dd2e1e':'#132030',border:i<step?'2px solid #2e7d32':i===step?'2px solid #dd2e1e':'2px solid #1e3a52',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff'}}>
                     {i<step?'✓':i+1}
                </div>
                <span style={{fontSize:9,color:i===step?'#dd2e1e':'#4a6880',textTransform:'uppercase',whiteSpace:'nowrap'}}>{s}</span>
              </div>
              {i<STEPS.length-1&&<div style={{flex:1,height:2,margin:'0 6px',marginTop:-16,background:i<step?'#2e7d32':'#1e3a52'}}/>}
            </div>
          ))}
        </div>

        <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:28}}>
          {step===0&&<>
            {secTitle('Informations Societe')}
            {inp('company','Nom de la societe / cabinet',f.company,u('company'))}
            {grid2(<>
              {sel('country',COUNTRIES,f.country,u('country'))}
              {inp('city','Ville',f.city,u('city'))}
            </>)}
            {grid2(<>
              {inp('zip','Code postal',f.zip,u('zip'))}
              {inp('address','Adresse',f.address,u('address'))}
            </>)}
            {grid2(<>
              {inp('regNum',regLabel,f.regNum,u('regNum'))}
              {inp('vatNum','Numero TVA',f.vatNum,u('vatNum'))}
            </>)}
            {secTitle('Informations Personnelles')}
            {grid2(<>
              {inp('firstName','Prenom',f.firstName,u('firstName'))}
              {inp('lastName','Nom',f.lastName,u('lastName'))}
            </>)}
            {grid2(<>
              {inp('email','Email professionnel',f.email,u('email'),'email')}
              {inp('phone','Telephone / WhatsApp',f.phone,u('phone'))}
            </>)}
            {secTitle('Securite')}
            {grid2(<>
              {inp('password','Mot de passe (min. 6 car.)',f.password,u('password'),'password')}
              {inp('password2','Confirmer mot de passe',f.password2,u('password2'),'password')}
            </>)}
            {f.password&&f.password2&&f.password!==f.password2&&<p style={{color:'#dd2e1e',fontSize:11,marginTop:-8,marginBottom:12}}>Les mots de passe ne correspondent pas</p>}
            <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
              <button onClick={()=>setStep(1)} disabled={!f.company||!f.country||!f.city||!f.firstName||!f.lastName||!f.email||!f.password||f.password!==f.password2}
                style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700,opacity:(!f.company||!f.country||!f.city||!f.firstName||!f.lastName||!f.email||!f.password||f.password!==f.password2)?0.45:1}}>
                Suivant
              </button>
            </div>
          </>}

          {step===1&&<>
            {secTitle('Profil Professionnel')}
            {grid2(<>
              {sel('exp',['Moins de 2 ans','2 a 5 ans','5 a 10 ans','10 a 20 ans','Plus de 20 ans'],f.experience,u('experience'))}
              {sel('currency',['EUR','USD','GBP','SGD','AED','CHF'],f.currency,u('currency'))}
            </>)}
            {inp('rate','Tarif journalier (ex: 1200)',f.dayRate,u('dayRate'))}
            <div style={{marginBottom:12}}>
              <textarea id="bio" placeholder="Decrivez votre parcours, expertise, types de missions..." value={f.bio} onChange={e=>u('bio')(e.target.value)} rows={4}
                style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'10px 14px',color:'#fff',boxSizing:'border-box',fontSize:13,resize:'vertical'}}/>
            </div>
            {secTitle('Langues Parlees')}
            {chk(LANGUAGES,languages,tog(setLanguages),3)}
            {secTitle('Certifications et Accreditations')}
            {chk(CERTIFICATIONS,certifications,tog(setCertifications),2)}
            <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
              <button onClick={()=>setStep(0)} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Retour</button>
              <button onClick={()=>setStep(2)} disabled={!f.experience}
                style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700,opacity:!f.experience?0.45:1}}>
                Suivant
              </button>
            </div>
          </>}

          {step===2&&<>
            {secTitle('Specialites d Expertise')}
            {chk(SPECIALTIES,specialties,tog(setSpecialties),2)}
            {secTitle('Matieres Premieres')}
            {chk(COMMODITIES,commodities,tog(setCommodities),2)}
            {secTitle('Couverture Geographique')}
            {chk(GEO,coverage,tog(setCoverage),2)}
            <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
              <button onClick={()=>setStep(1)} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Retour</button>
              <button onClick={()=>setStep(3)} disabled={specialties.length===0}
                style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700,opacity:specialties.length===0?0.45:1}}>
                Suivant
              </button>
            </div>
          </>}

          {step===3&&<>
            {secTitle('Equipement et Kit de Test')}
            {chk(EQUIPMENT,equipment,tog(setEquipment),2)}
            {secTitle('Documents Professionnels')}
            {['Assurance Responsabilite Civile Professionnelle','Piece d identite / Passeport','Photo de profil'].map(doc=>(
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
              <button onClick={()=>setStep(4)}
                style={{background:'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700}}>
                Suivant
              </button>
            </div>
          </>}

          {step===4&&<>
            {secTitle('Coordonnees Bancaires')}
            {inp('holder','Titulaire du compte',f.accountHolder,u('accountHolder'))}
            {inp('iban','IBAN',f.iban,u('iban'))}
            {grid2(<>
              {inp('bic','BIC / SWIFT',f.bic,u('bic'))}
              {inp('bankName','Nom de la banque',f.bankName,u('bankName'))}
            </>)}
            {sel('payoutCurrency',['EUR','USD','GBP','SGD','AED','CHF'],f.currency,u('currency'))}
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
              style={{display:'flex',alignItems:'flex-start',gap:12,cursor:'pointer',marginBottom:20,padding:'12px 16px',borderRadius:8,background:f.agreed?'rgba(46,125,50,0.1)':'transparent',border:1px solid ${f.agreed?'#2e7d32':'#1e3a52'}}}>
              <div style={{width:18,height:18,borderRadius:4,flexShrink:0,marginTop:1,background:f.agreed?'#2e7d32':'transparent',border:2px solid ${f.agreed?'#2e7d32':'#1e3a52'},display:'flex',alignItems:'center',justifyContent:'center'}}>
                {f.agreed&&<span style={{color:'#fff',fontSize:11,fontWeight:900}}>✓</span>}
              </div>
              <span style={{color:'#8fa8c0',fontSize:11,lineHeight:1.6}}>
                J accepte les Conditions Generales et le Code de Conduite SurveyLink. Je confirme que mes informations sont exactes.
              </span>
            </div>
            {error&&<p style={{color:'#dd2e1e',fontSize:12,marginBottom:12}}>{error}</p>}
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <button onClick={()=>setStep(3)} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:7,padding:'11px 24px',cursor:'pointer',fontWeight:700}}>Retour</button>
              <button onClick={handleSubmit} disabled={!f.iban||!f.bic||!f.accountHolder||!f.agreed||loading}
                style={{background:'#2e7d32',color:'#fff',border:'none',borderRadius:7,padding:'11px 28px',cursor:'pointer',fontWeight:700,opacity:(!f.iban||!f.bic||!f.accountHolder||!f.agreed||loading)?0.45:1}}>
                {loading?'Envoi...':'Soumettre mon profil'}
              </button>
            </div>
          </>}
        </div>
      </div>
    </div>
  )
}
