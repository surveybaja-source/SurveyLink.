'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function FileUpload({ bucket, folder, label, hint, multiple = true, onUpload }) {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState([])
  const [error, setError] = useState(null)

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    setError(null)
    const results = []

    for (const file of files) {
      const ext = file.name.split('.').pop()
      const filename = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filename, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        setError(uploadError.message)
      } else {
        results.push({ path: data.path, name: file.name })
      }
    }

    setUploaded(p => [...p, ...results])
    setUploading(false)
    if (onUpload) onUpload(results)
  }

  return (
    <div>
      {label && (
        <label style={{display:'block',color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6}}>
          {label}
        </label>
      )}

      <label style={{
        display:'flex',alignItems:'center',justifyContent:'center',gap:8,
        background:'#0f1e2e',border:'1px dashed #1e3a52',borderRadius:8,
        padding:'10px 16px',cursor:'pointer',
        transition:'border-color 0.2s',
      }}
        onMouseEnter={e=>e.currentTarget.style.borderColor='#dd2e1e'}
        onMouseLeave={e=>e.currentTarget.style.borderColor='#1e3a52'}>
        <input type="file" multiple={multiple} onChange={handleUpload} style={{display:'none'}}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"/>
        <span style={{fontSize:16}}>{uploading ? '⏳' : '📎'}</span>
        <span style={{color:'#8fa8c0',fontSize:12}}>
          {uploading ? 'Uploading...' : 'Click to upload'}
        </span>
        {hint && <span style={{color:'#4a6880',fontSize:11}}>— {hint}</span>}
      </label>

      {error && (
        <div style={{color:'#dd2e1e',fontSize:11,marginTop:6}}>{error}</div>
      )}

      {uploaded.length > 0 && (
        <div style={{marginTop:8,display:'flex',flexDirection:'column',gap:4}}>
          {uploaded.map((f, i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:6,background:'rgba(46,125,50,0.08)',border:'1px solid #2e7d32',borderRadius:6,padding:'6px 10px'}}>
              <span style={{fontSize:12}}>📄</span>
              <span style={{color:'#81c784',fontSize:12,fontWeight:600}}>{f.name}</span>
              <span style={{color:'#4a6880',fontSize:10,marginLeft:'auto'}}>✓ Uploaded</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
