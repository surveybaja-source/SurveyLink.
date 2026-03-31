'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PaymentPage() {
  const [quote, setQuote] = useState(null)
  const [mission, setMission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const quoteId = searchParams.get('quote')

  const deposit = quote ? Math.round(quote.amount * 0.20) : 0
  const commission = quote ? Math.round(quote.amount * 0.01) : 0
  const surveyorDeposit = deposit - commission
  const balance = quote ? quote.amount - deposit : 0

  useEffect(() => {
    if (!quoteId) return
    const load = async () => {
      const { data: q } = await supabase
        .from('quotes')
        .select('*, missions(*), profiles(first_name, last_name, email, city, country)')
        .eq('id', quoteId)
        .single()
      if (q) { setQuote(q); setMission(q.missions) }
      setLoading(false)
    }
    load()
  }, [quoteId])

  const handlePayment = async () => {
    setPaying(true)
    setError(null)
    try {
      const { data: insurerProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', mission.insurer_id)
        .single()

      const response = await fetch('/api/stripe/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: deposit,
          currency: quote.currency?.toLowerCase() || 'eur',
          missionRef: mission.reference,
          insurerEmail: insurerProfile?.email,
          expertEmail: quote.profiles?.email,
        })
      })

      const data = await response.json()
      if (data.error) { setError(data.error); setPaying(false); return }

      await supabase.from('transactions').insert({
        mission_id: mission.id,
        quote_id: quote.id,
        total_amount: deposit,
        commission_amount: commission,
        expert_payout: surveyorDeposit,
        stripe_payment_intent: data.paymentIntentId,
        status: 'paid',
        payment_type: 'deposit',
        percentage: 20
      })

      await supabase.from('quotes').update({deposit_paid: true}).eq('id', quote.id)
      setPaid(true)
      setPaying(false)

    } catch (err) {
      setError(err.message)
      setPaying(false)
    }
  }

  if (loading) return (
    <div style={{background:'#4a4640',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:'#9a9490'}}>Loading...</p>
    </div>
  )

  if (!quote) return (
    <div style={{background:'#4a4640',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:'#C4503A'}}>Quote not found</p>
    </div>
  )

  if (paid) return (
    <div style={{background:'#4a4640',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{maxWidth:480,textAlign:'center'}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(74,122,90,0.2)',border:'2px solid #4a7a5a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,margin:'0 auto 24px'}}>
          ✓
        </div>
        <div style={{color:'#fff',fontWeight:900,fontSize:28,letterSpacing:'0.05em',marginBottom:8}}>
          INSPE<span style={{color:'#C4503A'}}>LINK</span>
        </div>
        <h2 style={{color:'#EDE9E4',fontSize:28,fontWeight:900,marginBottom:12}}>Deposit Confirmed!</h2>
        <p style={{color:'#9a9490',fontSize:14,lineHeight:1.75,marginBottom:16}}>
          Your deposit of EUR {deposit.toLocaleString()} for mission {mission.reference} has been processed.
        </p>
        <div style={{background:'#EDE9E4',border:'1px solid #8B6F47',borderRadius:10,padding:'14px 20px',marginBottom:24,textAlign:'left'}}>
          <div style={{color:'#8B6F47',fontWeight:700,fontSize:13,marginBottom:8}}>Payment Schedule</div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{color:'#6a6460',fontSize:12}}>Deposit paid (20%)</span>
            <span style={{color:'#4a7a5a',fontSize:12,fontWeight:700}}>EUR {deposit.toLocaleString()} ✓</span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{color:'#6a6460',fontSize:12}}>Balance due on final report (80%)</span>
            <span style={{color:'#8B6F47',fontSize:12,fontWeight:700}}>EUR {balance.toLocaleString()}</span>
          </div>
        </div>
        <button onClick={()=>router.push('/dashboard')}
          style={{background:'#4a7a5a',color:'#fff',border:'none',borderRadius:7,padding:'14px 32px',cursor:'pointer',fontWeight:700,fontSize:14}}>
          Back to Dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div style={{background:'#4a4640',minHeight:'100vh',padding:'32px 24px'}}>
      <div style={{maxWidth:560,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
          <button onClick={()=>router.push('/dashboard')}
            style={{background:'none',border:'1px solid #5a5450',borderRadius:6,padding:'6px 12px',color:'#9a9490',cursor:'pointer',fontSize:11}}>
            Back
          </button>
          <div>
            <div style={{color:'#9a9490',fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase'}}>Insurer Portal</div>
            <div style={{color:'#fff',fontWeight:900,fontSize:22,letterSpacing:'0.05em'}}>INSPE<span style={{color:'#C4503A'}}>LINK</span></div>
          </div>
        </div>

        <div style={{background:'#EDE9E4',border:'1px solid #d8d4ce',borderRadius:12,padding:28,marginBottom:20,boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}}>
          <div style={{color:'#9a9490',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:16}}>Mission Summary</div>
          {[
            ['Reference', mission.reference],
            ['Cargo Type', mission.cargo_type],
            ['Location', mission.location_text],
            ['Surveyor', `${quote.profiles?.first_name} ${quote.profiles?.last_name}`],
            ['Surveyor Location', `${quote.profiles?.city}, ${quote.profiles?.country}`],
            ['Proposed Date', quote.proposed_datetime?new Date(quote.proposed_datetime).toLocaleString('en-GB'):'Not specified'],
          ].map(([k,v])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #d8d4ce'}}>
              <span style={{color:'#6a6460',fontSize:12}}>{k}</span>
              <span style={{color:'#1a1410',fontSize:12,textAlign:'right',maxWidth:'60%'}}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{background:'#EDE9E4',border:'1px solid #d8d4ce',borderRadius:12,padding:28,marginBottom:20,boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}}>
          <div style={{color:'#9a9490',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:16}}>Payment Schedule</div>

          <div style={{background:'rgba(196,80,58,0.08)',border:'1px solid #C4503A',borderRadius:8,padding:'14px 16px',marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{color:'#C4503A',fontWeight:700,fontSize:13}}>Deposit — Due Now (20%)</div>
                <div style={{color:'#9a9490',fontSize:11,marginTop:3}}>Paid to surveyor upon mission start</div>
              </div>
              <div style={{color:'#8B6F47',fontWeight:900,fontSize:20}}>EUR {deposit.toLocaleString()}</div>
            </div>
            <div style={{marginTop:10,paddingTop:10,borderTop:'1px solid rgba(196,80,58,0.2)'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{color:'#9a9490',fontSize:11}}>Platform commission (1% of total)</span>
                <span style={{color:'#9a9490',fontSize:11}}>- EUR {commission.toLocaleString()}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{color:'#6a6460',fontSize:11,fontWeight:700}}>Surveyor receives</span>
                <span style={{color:'#4a7a5a',fontSize:11,fontWeight:700}}>EUR {surveyorDeposit.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div style={{background:'#f5f2ee',border:'1px solid #d8d4ce',borderRadius:8,padding:'14px 16px',marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{color:'#6a6460',fontWeight:700,fontSize:13}}>Balance — Due on Final Report (80%)</div>
                <div style={{color:'#9a9490',fontSize:11,marginTop:3}}>Charged automatically when final report is uploaded</div>
              </div>
              <div style={{color:'#6a6460',fontWeight:900,fontSize:20}}>EUR {balance.toLocaleString()}</div>
            </div>
          </div>

          <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0 0',borderTop:'1px solid #d8d4ce'}}>
            <span style={{color:'#1a1410',fontSize:14,fontWeight:700}}>Total Quote</span>
            <span style={{color:'#C4503A',fontSize:20,fontWeight:900}}>EUR {quote.amount?.toLocaleString()}</span>
          </div>
        </div>

        <div style={{background:'rgba(196,80,58,0.08)',border:'1px solid #C4503A',borderRadius:8,padding:'11px 14px',marginBottom:20,display:'flex',gap:10}}>
          <span>🔒</span>
          <span style={{color:'#6a6460',fontSize:11,lineHeight:1.5}}>
            Secure payment via Stripe. The 80% balance will be charged automatically when the surveyor uploads the final report.
          </span>
        </div>

        {error&&<p style={{color:'#C4503A',fontSize:12,marginBottom:16}}>{error}</p>}

        <button onClick={handlePayment} disabled={paying}
          style={{width:'100%',background:paying?'rgba(196,80,58,0.45)':'#C4503A',color:'#fff',border:'none',borderRadius:7,padding:'16px',cursor:'pointer',fontWeight:700,fontSize:16,marginBottom:12}}>
          {paying?'Processing...':'Pay Deposit — EUR ' + deposit.toLocaleString()}
        </button>

        <p style={{color:'#9a9490',fontSize:11,textAlign:'center'}}>
          By proceeding you agree to the INSPELINK Terms of Service
        </p>
      </div>
    </div>
  )
}
