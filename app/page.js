'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    router.push('/auth')
  }, [])
  return (
    <div style={{minHeight:'100vh',background:'#0c1a27',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:'#8fa8c0'}}>Chargement...</p>
    </div>
  )
}
