'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { sendEmail, emailTemplates } from '../../lib/emails'

export default function Convocation({ quote, user }) {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [caseDesc, setCaseDesc] = useState('')
  const [goodsDesc, setGoodsDesc] = useState('')
  const [surveyDate, setSurveyDate] = useState('')
  const [surveyLocation, setSurveyLocation] = useState(quote.missions?.location_text || '')
  const [recipients, setRecipients] = useState([
    {company:'',contact:'',email:'',reference:''},
    {company:'',contact:'',email:'',reference:''},
    {company:'',contact:'',email:'',reference:''},
  ])

  const updateRecipient = (i, field, value) => {
    setRecipients(p => p.map((r,idx) => idx===i ? {...r,[field]:value} : r))
  }

  const addRecipient = () => {
    if (recipients.length < 5) setRecipients(p => [...p, {company:'',contact:'',email:'',reference:''}])
  }

  const removeRecipient = (i) => {
    if (recipients.length > 1) setRecipients(p => p.filter((_,idx) => idx!==i))
  }

  const handleSend = async () => {
    setSending(true)
    try {
      const { data: expertProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone, company')
        .eq('id', user.id)
        .single()

      const validRecipients = recipients.filter(r => r.email)

      const data = {
        reference: quote.missions?.reference,
        date: new Date().toLocaleDateString('en-GB', {day:'2-digit',month:'long',year:'numeric'}),
        caseDescription: caseDesc,
        goodsDescription: goodsDesc,
        surveyorName: `${expertProfile.first_name} ${expertProfile.last_name}`,
        surveyorEmail: expertProfile.email,
        surveyorPhone: expertProfile.phone || 'N/A',
        surveyorCompany: expertProfile.company || '',
        clientName: quote.missions?.client_name || '',
        surveyDateFormatted: surveyDate ? new Date(surveyDate).toLocaleString('en-GB', {
          weekday:'long',day:'2-digit',month:'long',year:'numeric',
          hour:'2-digit',minute:'2-digit'
        }) : 'To be confirmed',
        surveyLocation: surveyLocation,
        recipients: validRecipients,
      }

      const tmpl = emailTemplates.convocation(data)

      for (const r of validRecipients) {
        await sendEmail(r.email, tmpl.subject, tmpl.html)
      }

      await supabase.from('convocations').insert({
        mission_id: quote.mission_id,
        expert_id: user.id,
        case_description: caseDesc,
        goods_description: goodsDesc,
        survey_date: surveyDate || null,
        survey_location: surveyLocation,
        recipients: validRecipients,
      })

      setSent(true)
    } catch (err) {
      console.error(err)
    }
    setSending(false)
  }

  const handlePrint = () => {
    const printContent = document.getElementById('convocation-preview')
    const w = window.open('', '_blank')
    w.document.write(`
      <html>
        <head>
          <title>Convocation - ${quote.missions?.reference}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; font-size: 13px; }
            h2 { text-align: center; font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background: #f0f0f0; }
            .header-table td { border: none; }
            p { line-height: 1.8; }
            .center { text-align: center; font-weight: bold; font-size: 15px; margin: 16px 0; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `)
    w.document.close()
    w.print()
  }

  const C = '#5a6a8a'
  const today = new Date().toLocaleDateString('en-GB', {day:'2-digit',month:'long',year:'numeric'})
  const surveyDateFormatted = surveyDate ? new Date(surveyDate).toLocaleString('en-GB', {
    weekday:'long',day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'
  }) : 'To be confirmed'

  const inp = {
    width:'100%',background:'#0a1520',border:'1px solid #2a3a52',borderRadius:6,
    padding:'8px 12px',color:'#fff',boxSizing:'border-box',fontSize:12,outline:'none'
  }

  return (
    <div style={{background:'#0f1e2e',border:`1px solid ${C}`,borderRadius:8,padding:'12px 16px',marginTop:8}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}
        onClick={()=>setOpen(o=>!o)}>
        <div>
          <div style={{color:C,fontWeight:700,fontSize:13}}>Survey Meeting Notice</div>
          <div style={{color:'#4a6880',fontSize:11,marginTop:2}}>Send formal convocation to all parties</div>
        </div>
        <span style={{color:C,fontSize:18}}>{open?'▲':'▼'}</span>
      </div>

      {open&&(
        <div style={{marginTop:16}}>
          {sent&&(
            <div style={{background:'rgba(46,125,50,0.1)',border:'1px solid #2e7d32',borderRadius:8,padding:'12px 16px',marginBottom:16,textAlign:'center'}}>
              <div style={{color:'#2e7d32',fontWeight:700,fontSize:13}}>✓ Convocation sent to all parties!</div>
            </div>
          )}

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <div>
              <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:4}}>Case Description *</div>
              <textarea placeholder="Describe the case..." value={caseDesc} onChange={e=>setCaseDesc(e.target.value)} rows={2}
                style={{...inp,resize:'vertical'}}/>
            </div>
            <div>
              <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:4}}>Goods Description *</div>
              <textarea placeholder="e.g. 3 x 40HC containers — Electronic components" value={goodsDesc} onChange={e=>setGoodsDesc(e.target.value)} rows={2}
                style={{...inp,resize:'vertical'}}/>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <div>
              <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:4}}>Survey Date & Time *</div>
              <input type="datetime-local" value={surveyDate} onChange={e=>setSurveyDate(e.target.value)} style={inp}/>
            </div>
            <div>
              <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:4}}>Survey Location *</div>
              <input placeholder="e.g. Rotterdam Port, Terminal 7" value={surveyLocation} onChange={e=>setSurveyLocation(e.target.value)} style={inp}/>
            </div>
          </div>

          <div style={{marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
              <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase'}}>Recipients</div>
              {recipients.length<5&&(
                <button onClick={addRecipient}
                  style={{background:'transparent',color:C,border:`1px solid ${C}`,borderRadius:5,padding:'3px 10px',cursor:'pointer',fontSize:11,fontWeight:700}}>
                  + Add
                </button>
              )}
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
                <thead>
                  <tr>
                    {['','Company','Contact','E-mail','Reference',''].map((h,i)=>(
                      <th key={i} style={{background:'#0a1520',border:'1px solid #1e3a52',padding:'6px 8px',color:'#4a6880',textAlign:'left',fontWeight:700,fontSize:10,letterSpacing:'0.08em',textTransform:'uppercase'}}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((r,i)=>(
                    <tr key={i}>
                      <td style={{border:'1px solid #1e3a52',padding:'4px 8px',color:'#8fa8c0',fontWeight:700,fontSize:11,whiteSpace:'nowrap'}}>
                        {i===0?'To':''}
                      </td>
                      {['company','contact','email','reference'].map(field=>(
                        <td key={field} style={{border:'1px solid #1e3a52',padding:4}}>
                          <input placeholder={field.charAt(0).toUpperCase()+field.slice(1)} value={r[field]} onChange={e=>updateRecipient(i,field,e.target.value)}
                            style={{...inp,padding:'5px 8px',borderRadius:4,border:'none'}}/>
                        </td>
                      ))}
                      <td style={{border:'1px solid #1e3a52',padding:'4px 8px',textAlign:'center'}}>
                        {recipients.length>1&&(
                          <button onClick={()=>removeRecipient(i)}
                            style={{background:'none',border:'none',color:'#dd2e1e',cursor:'pointer',fontSize:14}}>x</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div id="convocation-preview" style={{display:'none'}}>
            <h2 style={{textAlign:'center',fontSize:'18px',fontWeight:900,borderBottom:'2px solid #333',paddingBottom:'12px',marginBottom:'24px'}}>
              NOTIFICATION TO SURVEY MEETING
            </h2>
            <table style={{width:'100%',marginBottom:'20px',fontSize:'13px',borderCollapse:'collapse'}}>
              <tbody>
                <tr>
                  <td style={{width:'50%',verticalAlign:'top',paddingRight:'20px',border:'none'}}>
                    <p style={{margin:'0 0 8px'}}><strong>Date:</strong> {today}</p>
                    <p style={{margin:'0 0 8px'}}><strong>Case:</strong> {caseDesc}</p>
                    <p style={{margin:'0 0 8px'}}><strong>Goods:</strong> {goodsDesc}</p>
                  </td>
                  <td style={{width:'50%',verticalAlign:'top',border:'none'}}>
                    <p style={{margin:'0 0 8px'}}><strong>Reference:</strong> {quote.missions?.reference}</p>
                  </td>
                </tr>
              </tbody>
            </table>
            <table style={{width:'100%',borderCollapse:'collapse',marginBottom:'24px',fontSize:'13px'}}>
              <thead>
                <tr style={{background:'#f0f0f0'}}>
                  <th style={{border:'1px solid #ccc',padding:'8px',textAlign:'left',width:'80px'}}></th>
                  <th style={{border:'1px solid #ccc',padding:'8px',textAlign:'left'}}>Company</th>
                  <th style={{border:'1px solid #ccc',padding:'8px',textAlign:'left'}}>Contact</th>
                  <th style={{border:'1px solid #ccc',padding:'8px',textAlign:'left'}}>E-mail</th>
                  <th style={{border:'1px solid #ccc',padding:'8px',textAlign:'left'}}>Reference</th>
                </tr>
              </thead>
              <tbody>
                {recipients.filter(r=>r.company||r.contact||r.email).map((r,i)=>(
                  <tr key={i}>
                    <td style={{border:'1px solid #ccc',padding:'8px',fontWeight:700}}>{i===0?'To':''}</td>
                    <td style={{border:'1px solid #ccc',padding:'8px'}}>{r.company}</td>
                    <td style={{border:'1px solid #ccc',padding:'8px'}}>{r.contact}</td>
                    <td style={{border:'1px solid #ccc',padding:'8px'}}>{r.email}</td>
                    <td style={{border:'1px solid #ccc',padding:'8px'}}>{r.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{fontSize:'13px',lineHeight:'1.8'}}>
              <p>Dear Sirs,</p>
              <p>Following the above-mentioned case, we inform you that we have been appointed, without prejudice to the right of the parties, on the request of the company <strong>{quote.missions?.client_name}</strong> and their insurer.</p>
              <p>We inform you that we will proceed to survey operations, on:</p>
              <p style={{textAlign:'center',fontWeight:'bold',fontSize:'15px',margin:'16px 0'}}>{surveyDateFormatted}</p>
              <p>In the premises of the company:</p>
              <p style={{textAlign:'center',fontWeight:'bold',fontSize:'15px',margin:'16px 0'}}>{surveyLocation}</p>
              <p>We invite you to be present and/or represented to this survey and to convoke to this meeting your subcontractors or any other third party implied. Failing that, the conclusions of the survey will be considered as effective against parties.</p>
              <br/>
              <p>Kind regards.</p>
              <p><em>Issued without prejudice to the right of the parties.</em></p>
            </div>
          </div>

          <div style={{display:'flex',gap:10,marginTop:8}}>
            <button onClick={handlePrint}
              style={{flex:1,background:'transparent',color:C,border:`1px solid ${C}`,borderRadius:7,padding:'10px',cursor:'pointer',fontWeight:700,fontSize:12}}>
              📄 Download PDF
            </button>
            <button onClick={handleSend} disabled={sending||!caseDesc||!goodsDesc||!surveyDate||!surveyLocation||!recipients.some(r=>r.email)}​​​​​​​​​​​​​​​​
