'use client'
import { useState, useRef, useEffect } from 'react'
import { COUNTRIES, getLocationsForCountry } from '../../lib/locations'

export default function LocationPicker({ value, onChange }) {
  const [country, setCountry] = useState(value?.country || '')
  const [locationType, setLocationType] = useState(value?.type || '')
  const [selectedPlace, setSelectedPlace] = useState(value?.place || '')
  const [detail, setDetail] = useState(value?.detail || '')
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredPlaces, setFilteredPlaces] = useState([])
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (country && locationType) {
      const data = getLocationsForCountry(country)
      const places = locationType === 'port' ? data.ports :
                     locationType === 'airport' ? data.airports : []
      setFilteredPlaces(places)
      setSelectedPlace('')
      setSearch('')
    }
  }, [country, locationType])

  useEffect(() => {
    if (search.length > 0 && filteredPlaces.length > 0) {
      setShowDropdown(true)
    }
  }, [search])

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place)
    setSearch(place)
    setShowDropdown(false)
    notifyChange(country, locationType, place, detail)
  }

  const notifyChange = (c, t, p, d) => {
    if (onChange) {
      const locationText = p ? `${p}, ${c}${d ? ' — ' + d : ''}` : ''
      onChange({
        country: c,
        type: t,
        place: p,
        detail: d,
        locationText,
      })
    }
  }

  const filtered = filteredPlaces.filter(p =>
    search.length === 0 || p.toLowerCase().includes(search.toLowerCase())
  )

  const inp = {
    width: '100%',
    background: '#0f1e2e',
    border: '1px solid #1e3a52',
    borderRadius: 6,
    padding: '10px 14px',
    color: '#fff',
    boxSizing: 'border-box',
    fontSize: 13,
    outline: 'none',
  }

  const lbl = {
    color: '#8fa8c0',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 6,
    display: 'block',
  }

  return (
    <div>
      <div style={{marginBottom:12}}>
        <label style={lbl}>Country *</label>
        <select value={country} onChange={e=>{setCountry(e.target.value);setLocationType('');setSelectedPlace('');setSearch('');notifyChange(e.target.value,'','','');}}
          style={{...inp,color:country?'#fff':'#4a6880'}}>
          <option value="">Select a country...</option>
          {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {country&&(
        <div style={{marginBottom:12}}>
          <label style={lbl}>Location Type *</label>
          <div style={{display:'flex',gap:8}}>
            {[
              {id:'port',label:'Port',icon:'⚓'},
              {id:'airport',label:'Airport',icon:'✈️'},
              {id:'warehouse',label:'Warehouse / Other',icon:'🏭'},
            ].map(t=>(
              <div key={t.id} onClick={()=>{setLocationType(t.id);setSelectedPlace('');setSearch('');notifyChange(country,t.id,'',detail);}}
                style={{flex:1,background:locationType===t.id?'rgba(221,46,30,0.1)':'#0f1e2e',border:locationType===t.id?'1px solid #dd2e1e':'1px solid #1e3a52',borderRadius:8,padding:'10px 8px',cursor:'pointer',textAlign:'center'}}>
                <div style={{fontSize:18,marginBottom:4}}>{t.icon}</div>
                <div style={{color:locationType===t.id?'#dd2e1e':'#8fa8c0',fontSize:11,fontWeight:700}}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {country&&locationType&&locationType!=='warehouse'&&(
        <div style={{marginBottom:12,position:'relative'}} ref={dropdownRef}>
          <label style={lbl}>{locationType==='port'?'Port':'Airport'} *</label>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14}}>
              {locationType==='port'?'⚓':'✈️'}
            </span>
            <input
              placeholder={`Search ${locationType==='port'?'port':'airport'}...`}
              value={search}
              onChange={e=>{setSearch(e.target.value);setShowDropdown(true);}}
              onFocus={()=>setShowDropdown(true)}
              style={{...inp,paddingLeft:36}}
            />
          </div>
          {showDropdown&&filtered.length>0&&(
            <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#132030',border:'1px solid #1e3a52',borderRadius:8,zIndex:100,maxHeight:200,overflowY:'auto',marginTop:4}}>
              {filtered.map(place=>(
                <div key={place} onClick={()=>handlePlaceSelect(place)}
                  style={{padding:'10px 14px',cursor:'pointer',color:'#e8edf5',fontSize:13,borderBottom:'1px solid #1e3a52'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#1e3a52'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  {locationType==='port'?'⚓':'✈️'} {place}
                </div>
              ))}
            </div>
          )}
          {selectedPlace&&(
            <div style={{marginTop:6,display:'flex',alignItems:'center',gap:8,padding:'6px 10px',background:'rgba(46,125,50,0.1)',border:'1px solid #2e7d32',borderRadius:6}}>
              <span style={{color:'#2e7d32',fontSize:12}}>✓</span>
              <span style={{color:'#81c784',fontSize:12}}>{selectedPlace}</span>
              <button onClick={()=>{setSelectedPlace('');setSearch('');notifyChange(country,locationType,'',detail);}}
                style={{background:'none',border:'none',color:'#dd2e1e',cursor:'pointer',marginLeft:'auto',fontSize:14}}>x</button>
            </div>
          )}
        </div>
      )}

      {country&&locationType&&(
        <div style={{marginBottom:12}}>
          <label style={lbl}>
            {locationType==='warehouse'?'Warehouse / Facility Name *':'Terminal / Berth / Detail (optional)'}
          </label>
          <input
            placeholder={
              locationType==='warehouse'?'e.g. ABC Logistics Warehouse, Zone Industrielle...':
              locationType==='port'?'e.g. Terminal 2, Berth 7, Gate B...':
              'e.g. Cargo Terminal 3, Hangar 12...'
            }
            value={detail}
            onChange={e=>{setDetail(e.target.value);notifyChange(country,locationType,selectedPlace,e.target.value);}}
            style={inp}
          />
        </div>
      )}

      {country&&locationType&&(selectedPlace||locationType==='warehouse')&&(
        <div style={{padding:'10px 14px',background:'#0f1e2e',border:'1px solid #1e3a52',borderRadius:8,marginTop:4}}>
          <div style={{color:'#4a6880',fontSize:9,marginBottom:4,letterSpacing:'0.1em',textTransform:'uppercase'}}>Location Summary</div>
          <div style={{color:'#e8edf5',fontSize:12}}>
            📍 {selectedPlace||detail}{detail&&selectedPlace?` — ${detail}`:''}, {country}
          </div>
        </div>
      )}
    </div>
  )
}
