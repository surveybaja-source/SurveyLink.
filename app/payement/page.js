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

  useEffect(() => {
    if (!quoteId) return
    const load = async () => {
      const { data: q } = await supabase
        .from('quotes')
        .select('*, missions(*), profiles(first_name, last_name, email, city, country)')
        .eq('id', quoteId)
        .single()
      if (q) {
        setQuote(q)
        setMission(q.missions)
      }
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
          amount: quote.amount,
          currency: quote.currency?.toLowerCase() || 'eur',
          missionRef: mission.reference,
          insurerEmail: insurerProfile?.email,
          expertEmail: quote.profiles?.email,
        })
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setPaying(false)
        return
      }

      await supabase.from('transactions').insert({
        mission_id: mission.id,
        quote_id: quote.id,
        total_amount: quote.amount,
        commission_amount: Math.round(quote.amount * 0.01),
        expert_payout: Math.round(quote.amount * 0.99),
        stripe_payment_intent: data.paymentIntentId,
        status: 'pending'
      })

      setPaid(true)
      setPaying(false)

    } catch (err) {
      setError(err.message)
      setPaying(false)
    }
  }

  if (loading) return (
    <div style={{background:'#0c1a27',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:'#8fa8c0'}}>Loading...</p>
    </div>
  )

  if (!quote) return (
    <div style={{background:'#0c1a27',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:'#dd2e1e'}}>Quote not found</p>
    </div>
  )

  if (paid) return (
    <div style={{background:'#0c1a27',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{maxWidth:480,textAlign:'center'}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(46,125,50,0.1)',border:'2px solid #2e7d32',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,margin:'0 auto 24px'}}>
          ✓
        </div>
        <h2 style={{color:'#fff',fontSize:36,fontWeight:900,marginBottom:12}}>Payment Confirmed!</h2>
        <p style={{color:'#8fa8c0',fontSize:14,lineHeight:1.75,marginBottom:32}}>
          Your payment of EUR {quote.amount?.toLocaleString()} for mission {mission.reference} has been processed successfully.
        </p>
        <button onClick={()=>router.push('/dashboard')}
          style={{background:'#2e7d32',color:'#fff',border:'none',borderRadius:7,padding:'14px 32px',cursor:'pointer',fontWeight:700,fontSize:14}}>
          Back to Dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div style={{background:'#0c1a27',minHeight:'100vh',padding:'32px 24px'}}>
      <div style={{maxWidth:560,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
          <button onClick={()=>router.push('/dashboard')}
            style={{background:'none',border:'1px solid #1e3a52',borderRadius:6,padding:'6px 12px',color:'#8fa8c0',cursor:'pointer',fontSize:11}}>
            Back
          </button>
          <div>
            <div style={{color:'#4a6880',fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase'}}>Insurer Portal</div>
            <div style={{color:'#fff',fontWeight:800,fontSize:22}}>Payment</div>
          </div>
        </div>

        <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:28,marginBottom:20}}>
          <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:16}}>Mission Summary</div>
          {[
            ['Reference', mission.reference],
            ['Cargo Type', mission.cargo_type],
            ['Location', mission.location_text],
            ['Surveyor', `${quote.profiles?.first_name} ${quote.profiles?.last_name}`],
            ['Surveyor Location', `${quote.profiles?.city}, ${quote.profiles?.country}`],
            ['Proposed Date', quote.proposed_datetime?new Date(quote.proposed_datetime).toLocaleString('en-GB'):'Not specified'],
          ].map(([k,v])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #1e3a52'}}>
              <span style={{color:'#8fa8c0',fontSize:12}}>{k}</span>
              <span style={{color:'#fff',fontSize:12,textAlign:'right',maxWidth:'60%'}}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{background:'#132030',border:'1px solid #1e3a52',borderRadius:12,padding:28,marginBottom:20}}>
          <div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:16}}>Payment Breakdown</div>
          {[
            ['Survey Fee', `EUR ${quote.amount?.toLocaleString()}`],
            ['Platform Commission (1%)', `EUR ${Math.round(quote.amount*0.01).toLocaleString()}`],
            ['Surveyor Payout', `EUR ${Math.round(quote.amount*0.99).toLocaleString()}`],
          ].map(([k,v])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #1e3a52'}}>
              <span style={{color:'#8fa8c0',fontSize:12}}>{k}</span>
              <span style={{color:k==='Survey Fee'?'#f0a500':'#8fa8c0',fontSize:12,fontWeight:k==='Survey Fee'?800:400}}>{v}</span>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',padding:'16px 0 0',marginTop:8}}>
            <span style={{color:'#fff',fontSize:16,fontWeight:800}}>Total to Pay</span>
            <span style={{color:'#f0a500',fontSize:24,fontWeight:900}}>EUR {quote.amount?.toLocaleString()}</span>
          </div>
        </div>

        <div style={{background:'rgba(221,46,30,0.08)',border:'1px solid #700300',borderRadius:8,padding:'11px 14px',marginBottom:20,display:'flex',gap:10}}>
          <span>🔒</span>
          <span style={{color:'#8fa8c0',fontSize:11,lineHeight:1.5}}>
            Secure payment via Stripe. Your card details are never stored on our servers.
          </span>
        </div>

        {error&&<p style={{color:'#dd2e1e',fontSize:12,marginBottom:16}}>{error}</p>}

        <button onClick={handlePayment} disabled={paying}
          style={{width:'100%',background:paying?'rgba(221,46,30,0.45)':'#dd2e1e',color:'#fff',border:'none',borderRadius:7,padding:'16px',cursor:'pointer',fontWeight:700,fontSize:16,marginBottom:12}}>
          {paying?'Processing...':'Pay EUR ' + quote.amount?.toLocaleString()}
        </button>

        <p style={{color:'#4a6880',fontSize:11,textAlign:'center'}}>
          By proceeding you agree to the SurveyLink Terms of Service
        </p>
      </div>
    </div>
  )
}
