'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { sendEmail } from '../../lib/emails'

const ADMIN_EMAILS = ['survey.baja@gmail.com']

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [docUrls, setDocUrls] = useState({})
  const [toast, setToast] = useState(null)
  const router = useRouter()

  const showToast = (msg, color='#2e7d32') => { setToast({msg,color}); setTimeout(()=>setToast(null),3000) }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !ADMIN_EMAILS.includes(user.email)) {
        router.push('/auth')
        return
      }
      setUser(user)
      setAuthorized(true)
      loadProfiles()
    }
    init()
  }, [])

  const loadProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setProfiles(data || [])
    setLoading(false)
  }

  const loadDocUrls = async (profile) => {
    if (!profile.certification_docs?.length) return
    const urls = {}
    for (const path of profile.certification_docs) {
      const { data } = await supabase.storage
        .from('expert-docs')
        .createSignedUrl(path, 3600)
      if (data?.signedUrl) urls[path] = data.signedUrl
    }
    setDocUrls(urls)
  }

  const selectProfile = (p) => {
    setSelectedProfile(p)
    loadDocUrls(p)
  }

  const approve = async (profile) => {
    await supabase.from('profiles').update({ verified: true }).eq('id', profile.id)
    const subject = `INSPELINK — Your account has been approved`
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:32px;">
        <div style="background:#0f1e2e;padding:20px 24px;border-radius:8px 8px 0 0;">
          <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:0.05em;">INSPE<span style="color:#dd2e1e;">LINK</span></span>
        </div>
        <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
          <h2 style="color:#2e7d32;margin:0 0 16px;">Your Account is Now Active!</h2>
          <p style="color:#555;line-height:1.6;">Hello ${profile.first_name},</p>
          <p style="color:#555;line-height:1.6;">Your INSPELINK account has been verified and activated. You can now log in and start receiving survey missions.</p>
          <a href="https://inspelink.com/auth"
            style="display:inline-block;background:#2e7d32;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700;margin-top:16px;">
            Log In to INSPELINK
          </a>
          <p style="color:#999;font-size:12px;margin-top:24px;">INSPELINK — Marine Cargo Survey Platform</p>
        </div>
      </div>
    `
    await sendEmail(profile.email, subject, html)
    showToast(`✓ ${profile.first_name} approved — email sent`)
    setSelectedProfile(null)
    loadProfiles()
  }

  const reject = async (profile) => {
    await supabase.from('profiles').update({ verified: false, rejected: true }).eq('id', profile.id)
    const subject = `INSPELINK — Your application could not be approved`
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:32px;">
        <div style="background:#0f1e2e;padding:20px 24px;border-radius:8px 8px 0 0;">
          <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:0.05em;">INSPE<span style="color:#dd2e1e;">LINK</span></span>
        </div>
        <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
          <h2 style="color:#dd2e1e;margin:0 0 16px;">Application Not Approved</h2>
          <p style="color:#555;line-height:1.6;">Hello ${profile.first_name},</p>
          <p style="color:#555;line-height:1.6;">After reviewing your application, we are unable to approve your account at this time. This may be due to missing or incomplete certification documents.</p>
          <p style="color:#555;line-height:1.6;">Please contact us at <a href="mailto:support@inspelink.com">support@inspelink.com</a> for more information.</p>
          <p style="color:#999;font-size:12px;margin-top:24px;">INSPELINK — Marine Cargo Survey Platform</p>
        </div>
      </div>
    `
    await sendEmail(profile.email, subject, html)
    showToast(`✗ ${profile.first_name} rejected — email sent`, '#dd2e1e')
    setSelectedProfile(null)
    loadProfiles()
  }

  const pending = profiles.filter(p => !p.verified && !p.rejected)
  const approved = profiles.filter(p => p.verified)
  const rejected = profiles.filter(p => p.rejected)
  const allProfiles = activeTab === 'pending' ? pending : activeTab === 'approved' ? approved : rejected

  if (!authorized) return (
    <div style={{background:'#0c1a27',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:'#8fa8c0'}}>Checking access...</p>
    </div>
  )

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh'}}>
      {toast&&<div style={{position:'fixed',top:70,left:'50%',transform:'translateX(-50%)',background:toast.color,color:'#fff',padding:'12px 24px',borderRadius:8,fontWeight:700,zIndex:999,fontSize:13,boxShadow:'0 4px 24px rgba(0,0,0,0.3)'}}>{toast.msg}</div>}

      <nav style={{background:'#0f1e2e',borderBottom:'1px solid #1e3a52',padding:'0 32px',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <span style={{color:'#fff',fontWeight:900,fontSize:22,letterSpacing:'0.08em',fontFamily:'var(--font-raleway)'}}>INSPE<span style={{color:'#dd2e1e'}}>LINK</span></span>
          <span style={{background:'rgba(221,46,30,0.15)',border:'1px solid #dd2e1e',color:'#dd2e1e',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700}}>ADMIN</span>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>router.push('/dashboard')} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 16px',cursor:'pointer',fontSize:12}}>
            Dashboard
          </button>
          <button onClick={()=>supabase.auth.signOut().then(()=>router.push('/auth'))} style={{background:'transparent',color:'#8fa8c0',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 16px',cursor:'pointer',fontSize:12}}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'32px 24px'}}>

        {/* STATS */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:32}}>
          {[
            ['Pending Review', pending.length, '#f0a500'],
            ['Approved', approved.length, '#2e7d32'],
            ['Rejected', rejected.length, '#dd2e1e'],
          ].map(([label,val,color])=>(
            <div key={label} style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:'16px 20px'}}>
              <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>{label}</div>
              <div style={{color,fontSize:26,fontWeight:800}}>{val}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{display:'flex',gap:4,marginBottom:24}}>
          {[
            {k:'pending',l:`Pending (${pending.length})`},
            {k:'approved',l:`Approved (${approved.length})`},
            {k:'rejected',l:`Rejected (${rejected.length})`},
          ].map(tab=>(
            <button key={tab.k} onClick={()=>{setActiveTab(tab.k);setSelectedProfile(null)}}
              style={{background:activeTab===tab.k?'#dd2e1e':'transparent',color:activeTab===tab.k?'#fff':'#8fa8c0',border:`1px solid ${activeTab===tab.k?'#dd2e1e':'#1e3a52'}`,borderRadius:6,padding:'7px 18px',fontSize:12,cursor:'pointer',fontWeight:700}}>
              {tab.l}
            </button>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:selectedProfile?'1fr 1fr':'1fr',gap:24}}>

          {/* LIST */}
          <div>
            {loading&&<p style={{color:'#8fa8c0'}}>Loading...</p>}
            {!loading&&allProfiles.length===0&&(
              <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:36,textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:12}}>📭</div>
                <div style={{color:'#8fa8c0',fontSize:14}}>No profiles in this category</div>
              </div>
            )}
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {allProfiles.map(p=>(
                <div key={p.id} onClick={()=>selectProfile(p)}
                  style={{background:'#132030',border:selectedProfile?.id===p.id?'1px solid #dd2e1e':'1px solid #1e3a52',borderRadius:12,padding:18,cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='#dd2e1e'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=selectedProfile?.id===p.id?'#dd2e1e':'#1e3a52'}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,#182e44,#dd2e1e)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:14}}>
                      {p.first_name?.[0]}{p.last_name?.[0]}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{color:'#fff',fontWeight:700,fontSize:15}}>{p.first_name} {p.last_name}</div>
                      <div style={{color:'#8fa8c0',fontSize:12,marginTop:2}}>{p.email}</div>
                      <div style={{color:'#4a6880',fontSize:11,marginTop:2}}>{p.company} — {p.city}, {p.country}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <span style={{background:p.role==='expert'?'rgba(90,158,255,0.12)':'rgba(240,165,0,0.12)',border:`1px solid ${p.role==='expert'?'#5a9eff':'#f0a500'}`,color:p.role==='expert'?'#5a9eff':'#f0a500',padding:'2px 10px',borderRadius:4,fontSize:10,fontWeight:700,textTransform:'uppercase'}}>
                        {p.role}
                      </span>
                      {p.certification_docs?.length>0&&(
                        <div style={{color:'#f0a500',fontSize:10,marginTop:4}}>📎 {p.certification_docs.length} doc(s)</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DETAIL */}
          {selectedProfile&&(
            <div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                <h2 style={{color:'#fff',fontSize:20,fontWeight:800,margin:0}}>Profile Review</h2>
                <button onClick={()=>setSelectedProfile(null)} style={{background:'none',border:'none',color:'#8fa8c0',cursor:'pointer',fontSize:20}}>x</button>
              </div>

              <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:24,marginBottom:16,boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}}>

                {/* IDENTITY */}
                <div style={{color:'#4a6880',fontSize:9,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12}}>IDENTITY</div>
                {[
                  ['Full Name', `${selectedProfile.first_name} ${selectedProfile.last_name}`],
                  ['Email', selectedProfile.email],
                  ['Company', selectedProfile.company||'—'],
                  ['Phone', selectedProfile.phone||'—'],
                  ['Location', `${selectedProfile.city}, ${selectedProfile.country}`],
                  ['Role', selectedProfile.role?.toUpperCase()],
                  ['Registered', new Date(selectedProfile.created_at).toLocaleDateString('en-GB')],
                ].map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #1e3a52'}}>
                    <span style={{color:'#8fa8c0',fontSize:12}}>{k}</span>
                    <span style={{color:'#fff',fontSize:12,textAlign:'right',maxWidth:'60%'}}>{v}</span>
                  </div>
                ))}

                {/* EXPERTISE */}
                {selectedProfile.role==='expert'&&(
                  <div style={{marginTop:16}}>
                    <div style={{color:'#4a6880',fontSize:9,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12}}>EXPERTISE</div>
                    {selectedProfile.certifications?.length>0&&(
                      <div style={{marginBottom:10}}>
                        <div style={{color:'#8fa8c0',fontSize:11,marginBottom:6}}>Certifications</div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                          {selectedProfile.certifications.map(c=>(
                            <span key={c} style={{background:'rgba(90,158,255,0.12)',border:'1px solid #5a9eff',color:'#5a9eff',padding:'2px 8px',borderRadius:4,fontSize:10}}>{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedProfile.specialties?.length>0&&(
                      <div style={{marginBottom:10}}>
                        <div style={{color:'#8fa8c0',fontSize:11,marginBottom:6}}>Specialties</div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                          {selectedProfile.specialties.map(s=>(
                            <span key={s} style={{background:'rgba(46,125,50,0.12)',border:'1px solid #2e7d32',color:'#81c784',padding:'2px 8px',borderRadius:4,fontSize:10}}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedProfile.coverage_countries?.length>0&&(
                      <div style={{marginBottom:10}}>
                        <div style={{color:'#8fa8c0',fontSize:11,marginBottom:4}}>Coverage — {selectedProfile.coverage_countries.length} countries</div>
                        <div style={{color:'#4a6880',fontSize:11}}>{selectedProfile.coverage_countries.slice(0,5).join(', ')}{selectedProfile.coverage_countries.length>5?` +${selectedProfile.coverage_countries.length-5} more`:''}</div>
                      </div>
                    )}
                    {selectedProfile.bio&&(
                      <div>
                        <div style={{color:'#8fa8c0',fontSize:11,marginBottom:4}}>Bio</div>
                        <div style={{color:'#4a6880',fontSize:12,lineHeight:1.5}}>{selectedProfile.bio}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* DOCUMENTS */}
                <div style={{marginTop:16}}>
                  <div style={{color:'#4a6880',fontSize:9,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12}}>CERTIFICATION DOCUMENTS</div>
                  {selectedProfile.certification_docs?.length>0?(
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {selectedProfile.certification_docs.map((path,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'center',gap:8,background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'8px 12px'}}>
                          <span>📄</span>
                          <span style={{color:'#8fa8c0',fontSize:12,flex:1}}>{path.split('/').pop()}</span>
                          {docUrls[path]?(
                            <a href={docUrls[path]} target="_blank" rel="noreferrer"
                              style={{color:'#5a9eff',fontSize:11,textDecoration:'underline',cursor:'pointer'}}>
                              View
                            </a>
                          ):(
                            <span style={{color:'#4a6880',fontSize:11}}>Loading...</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ):(
                    <div style={{background:'rgba(240,165,0,0.08)',border:'1px solid #f0a500',borderRadius:6,padding:'10px 14px'}}>
                      <span style={{color:'#f0a500',fontSize:12}}>⚠️ No documents uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              {!selectedProfile.verified&&!selectedProfile.rejected&&(
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <button onClick={()=>reject(selectedProfile)}
                    style={{background:'transparent',color:'#dd2e1e',border:'1px solid #dd2e1e',borderRadius:8,padding:'14px',cursor:'pointer',fontWeight:700,fontSize:14}}>
                    ✗ Reject
                  </button>
                  <button onClick={()=>approve(selectedProfile)}
                    style={{background:'#2e7d32',color:'#fff',border:'none',borderRadius:8,padding:'14px',cursor:'pointer',fontWeight:700,fontSize:14}}>
                    ✓ Approve
                  </button>
                </div>
              )}

              {selectedProfile.verified&&(
                <div style={{background:'rgba(46,125,50,0.08)',border:'1px solid #2e7d32',borderRadius:8,padding:'14px',textAlign:'center'}}>
                  <span style={{color:'#2e7d32',fontWeight:700,fontSize:14}}>✓ Account Approved</span>
                </div>
              )}

              {selectedProfile.rejected&&(
                <div style={{background:'rgba(221,46,30,0.08)',border:'1px solid #dd2e1e',borderRadius:8,padding:'14px',textAlign:'center'}}>
                  <span style={{color:'#dd2e1e',fontWeight:700,fontSize:14}}>✗ Account Rejected</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
