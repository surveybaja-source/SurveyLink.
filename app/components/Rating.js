'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Rating({ missionId, expertId, insurerId, onRated }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    if (!rating) return
    setSubmitting(true)
    await supabase.from('ratings').insert({
      mission_id: missionId,
      expert_id: expertId,
      insurer_id: insurerId,
      rating,
      comment,
    })
    const { data: ratings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('expert_id', expertId)
    if (ratings) {
      const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      await supabase.from('profiles').update({
        average_rating: Math.round(avg * 10) / 10,
        total_ratings: ratings.length,
      }).eq('id', expertId)
    }
    setDone(true)
    setSubmitting(false)
    if (onRated) onRated()
  }

  if (done) return (
    <div style={{background:'rgba(46,125,50,0.1)',border:'1px solid #2e7d32',borderRadius:8,padding:'12px 16px',textAlign:'center'}}>
      <div style={{color:'#2e7d32',fontWeight:700,fontSize:13}}>v Thank you for your rating!</div>
    </div>
  )

  return (
    <div style={{background:'#0f1e2e',border:'1px solid #f0a500',borderRadius:8,padding:'16px'}}>
      <div style={{color:'#f0a500',fontWeight:700,fontSize:13,marginBottom:4}}>Rate this Surveyor</div>
      <div style={{color:'#4a6880',fontSize:11,marginBottom:12}}>Mission completed — share your experience</div>

      <div style={{display:'flex',gap:6,marginBottom:12}}>
        {[1,2,3,4,5].map(star=>(
          <span key={star}
            onClick={()=>setRating(star)}
            onMouseEnter={()=>setHover(star)}
            onMouseLeave={()=>setHover(0)}
            style={{fontSize:28,cursor:'pointer',color:(hover||rating)>=star?'#f0a500':'#1e3a52',transition:'color 0.15s'}}>
            ★
          </span>
        ))}
        {rating>0&&<span style={{color:'#f0a500',fontSize:12,alignSelf:'center',marginLeft:6,fontWeight:700}}>
          {['','Poor','Fair','Good','Very Good','Excellent'][rating]}
        </span>}
      </div>

      <textarea placeholder="Comment (optional) — describe your experience with this surveyor..." value={comment} onChange={e=>setComment(e.target.value)} rows={2}
        style={{width:'100%',background:'#0a1520',border:'1px solid #1e3a52',borderRadius:6,padding:'8px 12px',color:'#fff',boxSizing:'border-box',fontSize:12,resize:'vertical',marginBottom:10,outline:'none'}}/>

      <button onClick={handleSubmit} disabled={!rating||submitting}
        style={{width:'100%',background:(!rating||submitting)?'rgba(240,165,0,0.45)':'#f0a500',color:'#000',border:'none',borderRadius:7,padding:'10px',cursor:(!rating||submitting)?'not-allowed':'pointer',fontWeight:700,fontSize:12}}>
        {submitting?'Submitting...':'Submit Rating'}
      </button>
    </div>
  )
}
