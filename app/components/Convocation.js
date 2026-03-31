'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { sendEmail, emailTemplates } from '../../lib/emails'

export default function Convocation({ quote, user }) {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    caseDescription: '',
    goodsDescription: '',
    surveyDate: '',
    surveyLocation: '',
  })
  const [recipients, setRecipients] = useState([
    { company: '', contact: '', email: '', reference: '' }
  ])

  const u = k => v => setForm(p => ({...p,[k]:v}))

  const addRecipient = () => setRecipients(p => [...p, { company: '', contact: '', email: '', reference: '' }])
  const removeRecipient = i => setRecipients(p => p.filter((_,idx)=>idx!==i))
  const updateRecipient = (i, k, v) => setRecipients(p => p.map((r,idx)=>idx===i?{...r,[k]:v}:r))

  const handleSend = async () => {
    setSending(true)
    try {
      const { data: expertProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone, company')
        .eq('id', user.id)
        .single()

      const surveyDateFormatted = form.surveyDate
        ? new Date(form.surveyDate).toLocaleString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })
        : ''

      const convocationData = {
        reference: quote.missions?.reference,
        date: new Date().toLocaleDateString('en-GB'),
        caseDescription: form.caseDescription,
        goodsDescription: form.goodsDescription,
        surveyorName: `${expertProfile.first_name} ${expertProfile.last_name}`,
        surveyorEmail: expertProfile.email,
        surveyorPhone: expertProfile.phone || '',
        surveyorCompany: expertProfile.company || 'INSPELINK',
        clientName: quote.missions?.client_name || '',
        surveyDateFormatted,
        surveyLocation: form.surveyLocation,
        recipients,
      }

      await supabase.from('convocations').insert({
        mission_id: quote.mission_id,
        expert_id: user.id,
        case_description: form.caseDescription,
        goods_description: form.goodsDescription,
        survey_date: form.surveyDate,
        survey_location: form.surveyLocation,
        recipients,
      })

      const tmpl = emailTemplates.convocation(convocationData)
      for (const r of recipients) {
        if (r.email) {
          await sendEmail(r.email, tmpl.subject, tmpl.html)
        }
      }

      setSent(true)
    } catch (err) {
      console.error(err)
    }
    setSending(false)
  }

  const Inp = ({label,ph,val,set,type='text'}) => (
    <div style={{marginBottom:12}}>
      <label style={{display:'block',color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:4}}>{label}</label>
      <input type={type} placeholder={ph} value={val} onChange={e=>set(e.target.value)}
        style={{width:'100%',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'9px 12px',color:'#fff',fontSize:13,boxSizing:'border-box'}}/>
    </div>
  )

  if (sent) return (
    <div style={{marginTop:12,background:'rgba(46,125,50,0.08)',border:'1px solid #2e7d32',borderRadius:8,padding:'12px 16px',textAlign:'center'}}>
      <div style={{color:'#2e7d32',fontWeight:700,fontSize:13}}>✓ Survey Meeting Notice sent successfully</div>
      <div style={{color:'#4a6880',fontSize:11,marginTop:4}}>All parties have been notified by email</div>
    </div>
  )

  return (
    <div style={{marginTop:12}}>
      <div onClick={()=>setOpen(o=>!o)}
        style={{background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:8,padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}>
        <div>
          <div style={{color:'#8fa8c0',fontWeight:700,fontSize:13}}>Survey Meeting Notice</div>
          <div style={{color:'#4a6880',fontSize:11,marginTop:2}}>Send formal convocation to all parties</div>
        </div>
        <span style={{color:'#4a6880',fontSize:14,transform:open?'rotate(180deg)':'none',transition:'0.2s'}}>▼</span>
      </div>

      {open&&(
        <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:8,padding:20,marginTop:4}}>
          <Inp label="Case Description" ph="e.g. Container damage survey" val={form.caseDescription} set={u('caseDescription')}/>
          <Inp label="Goods Description" ph="e.g. 20x40' containers, electronics" val={form.goodsDescription} set={u('goodsDescription')}/>
          <Inp label="Survey Date & Time" ph="" val={form.surveyDate} set={u('surveyDate')} type="datetime-local"/>
          <Inp label="Survey Location" ph="Full address of survey location" val={form.surveyLocation} set={u('surveyLocation')}/>

          <div style={{marginTop:16,marginBottom:8}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase'}}>Recipients</div>
              <button onClick={addRecipient}
                style={{background:'transparent',color:'#dd2e1e',border:'1px solid #dd2e1e',borderRadius:5,padding:'4px 10px',cursor:'pointer',fontSize:11,fontWeight:700}}>
                + Add
              </button>
            </div>
            {recipients.map((r,i)=>(
              <div key={i} style={{background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:8,padding:12,marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span style={{color:'#f0a500',fontSize:11,fontWeight:700}}>Recipient {i+1}</span>
                  {i>0&&<button onClick={()=>removeRecipient(i)} style={{background:'transparent',border:'none',color:'#dd2e1e',cursor:'pointer',fontSize:11}}>Remove</button>}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[['Company','company'],['Contact','contact'],['Email','email'],['Reference','reference']].map(([l,k])=>(
                    <div key={k}>
                      <label style={{display:'block',color:'#4a6880',fontSize:9,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:3}}>{l}</label>
                      <input type={k==='email'?'email':'text'} placeholder={l} value={r[k]} onChange={e=>updateRecipient(i,k,e.target.value)}
                        style={{width:'100%',background:'#132030',border:'1px solid #1e3a52',borderRadius:5,padding:'7px 10px',color:'#fff',fontSize:12,boxSizing:'border-box'}}/>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleSend} disabled={sending||!form.caseDescription||!form.surveyDate||!form.surveyLocation}
            style={{width:'100%',background:(sending||!form.caseDescription||!form.surveyDate||!form.surveyLocation)?'rgba(221,46,30,0.45)':'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'12px',cursor:'pointer',fontWeight:700,fontSize:13,marginTop:4}}>
            {sending?'Sending...':'Send Survey Meeting Notice'}
          </button>
        </div>
      )}
    </div>
  )
}
