'use client'
import { useState, useMemo } from 'react'
import { LOCATIONS } from '../../lib/locations'

export default function LocationPicker({ value, onChange }) {
  const [search, setSearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(value?.country || '')
  const [selectedType, setSelectedType] = useState(value?.type || '')

  const countries = useMemo(() => Object.keys(LOCATIONS).sort(), [])

  const types = useMemo(() => {
    if (!selectedCountry || !LOCATIONS[selectedCountry]) return []
    return Object.keys(LOCATIONS[selectedCountry]).sort()
  }, [selectedCountry])

  const places = useMemo(() => {
    if (!selectedCountry || !selectedType || !LOCATIONS[selectedCountry]?.[selectedType]) return []
    const all = LOCATIONS[selectedCountry][selectedType]
    if (!search) return all
    return all.filter(p => p.toLowerCase().includes(search.toLowerCase()))
  }, [selectedCountry, selectedType, search])

  const handleCountry = (country) => {
    setSelectedCountry(country)
    setSelectedType('')
    setSearch('')
    onChange({ country, type: '', place: '', detail: '' })
  }

  const handleType = (type) => {
    setSelectedType(type)
    setSearch('')
    onChange({ ...value, type, place: '', detail: '' })
  }

  const handlePlace = (place) => {
    onChange({ ...value, place })
  }

  const handleDetail = (detail) => {
    onChange({ ...value, detail })
  }

  const sel = {
    width: '100%',
    background: '#f5f2ee',
    border: '1px solid #d8d4ce',
    borderRadius: 7,
    padding: '11px 14px',
    color: '#1a1410',
    fontSize: 13,
    boxSizing: 'border-box',
    marginBottom: 12,
  }

  const inp = {
    width: '100%',
    background: '#f5f2ee',
    border: '1px solid #d8d4ce',
    borderRadius: 7,
    padding: '11px 14px',
    color: '#1a1410',
    fontSize: 13,
    boxSizing: 'border-box',
    marginBottom: 12,
    outline: 'none',
  }

  const lbl = {
    display: 'block',
    color: '#6a6460',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 6,
  }

  return (
    <div>
      <div>
        <label style={lbl}>Country *</label>
        <select value={selectedCountry} onChange={e=>handleCountry(e.target.value)} style={sel}>
          <option value="">Select country...</option>
          {countries.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {selectedCountry && types.length > 0 && (
        <div>
          <label style={lbl}>Location Type *</label>
          <select value={selectedType} onChange={e=>handleType(e.target.value)} style={sel}>
            <option value="">Select type...</option>
            {types.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}

      {selectedType && (
        <div>
          <label style={lbl}>Search {selectedType} *</label>
          <input
            type="text"
            placeholder={`Search ${selectedType.toLowerCase()}...`}
            value={search}
            onChange={e=>setSearch(e.target.value)}
            style={inp}
          />
          {places.length > 0 && (
            <div style={{background:'#EDE9E4',border:'1px solid #d8d4ce',borderRadius:8,maxHeight:200,overflowY:'auto',marginBottom:12}}>
              {places.map(place=>(
                <div key={place}
                  onClick={()=>{ handlePlace(place); setSearch(place) }}
                  style={{padding:'9px 14px',cursor:'pointer',color:value?.place===place?'#C4503A':'#1a1410',background:value?.place===place?'rgba(196,80,58,0.08)':'transparent',fontSize:13,borderBottom:'1px solid #d8d4ce'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(196,80,58,0.06)'}
                  onMouseLeave={e=>e.currentTarget.style.background=value?.place===place?'rgba(196,80,58,0.08)':'transparent'}>
                  {place}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {value?.place && (
        <div>
          <label style={lbl}>Terminal / Warehouse / Detail</label>
          <input
            type="text"
            placeholder="Terminal name, berth, warehouse..."
            value={value?.detail || ''}
            onChange={e=>handleDetail(e.target.value)}
            style={inp}
          />
        </div>
      )}

      {value?.place && (
        <div style={{background:'rgba(74,122,90,0.08)',border:'1px solid #4a7a5a',borderRadius:8,padding:'10px 14px',marginBottom:12}}>
          <div style={{color:'#9a9490',fontSize:9,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.1em'}}>Selected Location</div>
          <div style={{color:'#1a1410',fontSize:13,fontWeight:600}}>
            📍 {value.place}{value.detail?` — ${value.detail}`:''}, {value.country}
          </div>
        </div>
      )}
    </div>
  )
}
