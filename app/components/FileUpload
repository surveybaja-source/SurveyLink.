'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function FileUpload({ bucket, folder, onUpload, label, hint, multiple=true }) {
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState([])
  const [error, setError] = useState(null)

  const handleUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (!selectedFiles.length) return

    setUploading(true)
    setError(null)

    const uploaded = []

    for (const file of selectedFiles) {
      const ext = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file)

      if (error) {
        setError(`Failed to upload ${file.name}`)
        continue
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      uploaded.push({
        name: file.name,
        size: (file.size / 1024).toFixed(0) + ' KB',
        path: fileName,
        url: urlData.publicUrl,
      })
    }

    const newFiles = [...files, ...uploaded]
    setFiles(newFiles)
    if (onUpload) onUpload(newFiles)
    setUploading(false)
  }

  const removeFile = async (index) => {
    const file = files[index]
    await supabase.storage.from(bucket).remove([file.path])
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    if (onUpload) onUpload(newFiles)
  }

  const getSignedUrl = async (path) => {
    const { data } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  return (
    <div style={{marginBottom:16}}>
      {label&&<div style={{color:'#8fa8c0',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8}}>{label}</div>}

      <label style={{display:'block',background:'#0f1e2e',border:'2px dashed #1e3a52',borderRadius:8,padding:20,textAlign:'center',cursor:'pointer'}}
        onMouseEnter={e=>e.currentTarget.style.borderColor='#2a4f6e'}
        onMouseLeave={e=>e.currentTarget.style.borderColor='#1e3a52'}>
        <input type="file" multiple={multiple} onChange={handleUpload} style={{display:'none'}}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"/>
        {uploading ? (
          <div>
            <div style={{fontSize:24,marginBottom:6}}>⏳</div>
            <div style={{color:'#8fa8c0',fontSize:12}}>Uploading...</div>
          </div>
        ) : (
          <div>
            <div style={{fontSize:24,marginBottom:6}}>📎</div>
            <div style={{color:'#8fa8c0',fontSize:12}}>Drop files or <span style={{color:'#dd2e1e'}}>click to upload</span></div>
            <div style={{color:'#4a6880',fontSize:10,marginTop:4}}>{hint||'PDF, JPG, PNG, DOC, XLS — max 10 MB'}</div>
          </div>
        )}
      </label>

      {error&&<div style={{color:'#dd2e1e',fontSize:11,marginTop:6}}>{error}</div>}

      {files.length>0&&(
        <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:10}}>
          {files.map((f,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:6,padding:'8px 12px'}}>
              <span style={{fontSize:16}}>
                {f.name.endsWith('.pdf')?'📄':f.name.match(/\.(jpg|jpeg|png)$/i)?'🖼️':'📎'}
              </span>
              <span onClick={()=>getSignedUrl(f.path)}
                style={{color:'#5a9eff',fontSize:12,flex:1,cursor:'pointer',textDecoration:'underline'}}>
                {f.name}
              </span>
              <span style={{color:'#4a6880',fontSize:11}}>{f.size}</span>
              <button onClick={()=>removeFile(i)} style={{background:'none',border:'none',color:'#dd2e1e',cursor:'pointer',fontSize:16}}>x</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
