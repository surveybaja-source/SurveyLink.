'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Rating({ missionId, expertId, insurerId, onRated }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

    const { data: allRatings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('expert_id', expertId)

    if (allRatings && allRatings.length > 0) {
      const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
      await supabase.from('profiles').update({
        average_rating: Math.round(avg * 10) / 10,
        total_ratings: allRatings.length,
      }).eq('id', expertId)
    }

    setSubmitting(false)
    if (onRated) onRated()
  }

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

  return (
    <div style={{background:'#f5f2ee',border:'1px solid #d8d4ce',borderRadius:12,padding:'16px 20px'}}>
      <div style={{color:'#1a1410',fontWeight:700,fontSize:13,marginBottom:4}}>Rate this Surveyor</div>
      <div style={{color:'#8a8480',fontSize:11,marginBottom:14}}>Mission completed — share your experience</div>

      <div style={{display:'flex',alignItems:'center',gap:4,marginBottom:12}}>
        {[1,2,3,4,5].map(star=>(
          <span key={star}
            onClick={()=>setRating(star)}
            onMouseEnter={()=>setHover(star)}
            onMouseLeave={()=>setHover(0)}
            style={{fontSize:32,cursor:'pointer',color:(hover||rating)>=star?'#8B6F47':'#d8d4ce',transition:'color 0.1s'}}>
            ★
          </span>
        ))}
        {(hover||rating)>0&&(
          <span style={{color:'#8B6F47',fontSize:12,fontWeight:700,marginLeft:8}}>
            {labels[hover||rating]}
          </span>
        )}
      </div>

      <textarea
        placeholder="Share your experience with this surveyor (optional)..."
        value={comment}
        onChange={e=>setComment(e.target.value)}
        rows={2}
        style={{width:'100%',background:'#EDE9E4',border:'1px solid #d8d4ce',borderRadius:6,padding:'9px 12px',color:'#1a1410',fontSize:12,boxSizing:'border-box',resize:'vertical',marginBottom:10}}
      />

      <button
        onClick={handleSubmit}
        disabled={!rating||submitting}
        style={{width:'100%',background:(!rating||submitting)?'rgba(196,80,58,0.45)':'#C4503A',color:'#fff',border:'none',borderRadius:7,padding:'10px',cursor:'pointer',fontWeight:700,fontSize:13}}>
        {submitting?'Submitting...':'Submit Rating'}
      </button>
    </div>
  )
}
