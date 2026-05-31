import { useState, useEffect, useCallback } from 'react'
import { loadProgress, saveProgress } from './firebase.js'

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  bg:      '#0d0d12',
  surface: '#13131a',
  card:    '#1a1a24',
  border:  '#252535',
  text:    '#e2e2ee',
  muted:   '#5a5a72',
  esp:     '#3b82f6',
  bas:     '#06b6d4',
  val:     '#22c55e',
  com:     '#f97316',
  des:     '#a855f7',
  s: ['#f43f5e','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899'],
}

const TYPE_COLOR = { esp: C.esp, bas: C.bas, val: C.val, com: C.com }
const TYPE_LABEL = {
  esp: 'Especialidad',
  bas: 'Básicas y Empleabilidad',
  val: 'Formación Valórica',
  com: 'Formación Complementaria',
}

// ─── MALLA DATA ───────────────────────────────────────────────────────────────
const SUBJECTS = [
  // SEM 1
  { id:'s1_01', code:'DIN-101', name:'Taller de Representación',            sem:1, type:'esp', credits:8,  prereqs:[] },
  { id:'s1_02', code:'DIN-102', name:'Técnicas de Maquetación',             sem:1, type:'esp', credits:6,  prereqs:[] },
  { id:'s1_03', code:'DIN-103', name:'Dibujo Técnico de Productos',         sem:1, type:'esp', credits:6,  prereqs:[] },
  { id:'s1_04', code:'HNU-101', name:'Habilidades Numéricas',               sem:1, type:'bas', credits:4,  prereqs:[] },
  { id:'s1_05', code:'HCO-101', name:'Habilidades Básicas de Comunicación', sem:1, type:'bas', credits:4,  prereqs:[] },
  { id:'s1_06', code:'DIN-104', name:'Cultura del Diseño',                  sem:1, type:'esp', credits:4,  prereqs:[] },

  // SEM 2
  { id:'s2_01', code:'DIN-201', name:'Taller de Diseño para la Manufactura',      sem:2, type:'esp', credits:10, prereqs:['s1_01'] },
  { id:'s2_02', code:'DIN-202', name:'Materiales y Procesos para la Manufactura', sem:2, type:'esp', credits:6,  prereqs:['s1_02'] },
  { id:'s2_03', code:'DIN-203', name:'Modelado 3D de Productos',                  sem:2, type:'esp', credits:6,  prereqs:['s1_03'] },
  { id:'s2_04', code:'HMA-201', name:'Habilidades del Lenguaje Matemático',       sem:2, type:'bas', credits:4,  prereqs:['s1_04'] },
  { id:'s2_05', code:'HCE-201', name:'Habilidades de Comunicación Efectiva',      sem:2, type:'bas', credits:4,  prereqs:['s1_05'] },
  { id:'s2_06', code:'ING-201', name:'Inglés Básico I',                           sem:2, type:'bas', credits:4,  prereqs:[] },

  // SEM 3
  { id:'s3_01', code:'DIN-301', name:'Taller de Producto Centrado en el Usuario', sem:3, type:'esp', credits:10, prereqs:['s2_01'] },
  { id:'s3_02', code:'DIN-302', name:'Prototipado Rápido y Series Cortas',        sem:3, type:'esp', credits:6,  prereqs:['s2_02'] },
  { id:'s3_03', code:'DIN-303', name:'Representación de Productos',               sem:3, type:'esp', credits:6,  prereqs:['s2_03'] },
  { id:'s3_04', code:'ING-301', name:'Inglés Básico II',                          sem:3, type:'bas', credits:4,  prereqs:['s2_06'] },
  { id:'s3_05', code:'FAN-301', name:'Fundamentos de Antropología',               sem:3, type:'val', credits:4,  prereqs:[] },
  { id:'s3_06', code:'ING-302', name:'Inglés Elemental I',                        sem:3, type:'bas', credits:4,  prereqs:['s2_06'] },

  // SEM 4
  { id:'s4_01', code:'DIN-401', name:'Taller de Producto Centrado en el Entorno', sem:4, type:'esp', credits:10, prereqs:['s3_01'], desafio:true },
  { id:'s4_02', code:'DIN-402', name:'Diseño y Sustentabilidad',                  sem:4, type:'esp', credits:6,  prereqs:['s3_02'] },
  { id:'s4_03', code:'DIN-403', name:'Presentación de Proyecto',                  sem:4, type:'esp', credits:6,  prereqs:['s3_03'] },
  { id:'s4_04', code:'EMP-401', name:'Mentalidad Emprendedora',                   sem:4, type:'bas', credits:4,  prereqs:['s2_05'] },
  { id:'s4_05', code:'ETI-401', name:'Ética para el Trabajo',                     sem:4, type:'val', credits:4,  prereqs:['s3_05'] },
  { id:'s4_06', code:'FCR-401', name:'Curso de Formación Cristiana',              sem:4, type:'val', credits:4,  prereqs:[] },

  // SEM 5
  { id:'s5_01', code:'DIN-501', name:'Diseño de Servicio',       sem:5, type:'esp', credits:10, prereqs:['s4_01'], desafio:true },
  { id:'s5_02', code:'DIN-502', name:'Narrativa de Proyectos',   sem:5, type:'esp', credits:6,  prereqs:['s4_03'] },
  { id:'s5_03', code:'ING-501', name:'Inglés Elemental II',      sem:5, type:'bas', credits:4,  prereqs:['s3_06'] },
  { id:'s5_04', code:'PRL-501', name:'Práctica Laboral',         sem:5, type:'bas', credits:8,  prereqs:['s4_01','s4_02','s4_03','s4_04'] },
  { id:'s5_05', code:'FCO-501', name:'Formación Complementaria', sem:5, type:'com', credits:4,  prereqs:[] },

  // SEM 6
  { id:'s6_01', code:'DIN-601', name:'Diseño de Experiencias',          sem:6, type:'esp', credits:10, prereqs:['s5_01'], desafio:true },
  { id:'s6_02', code:'DIN-602', name:'Estrategias de Comercialización', sem:6, type:'esp', credits:6,  prereqs:['s5_02'] },
  { id:'s6_03', code:'ING-601', name:'Inglés Intermedio I',             sem:6, type:'bas', credits:4,  prereqs:['s5_03'] },

  // SEM 7
  { id:'s7_01', code:'DIN-701', name:'Proyecto Profesional',   sem:7, type:'esp', credits:12, prereqs:['s6_01'], desafio:true },
  { id:'s7_02', code:'DIN-702', name:'Empresa y Diseño',       sem:7, type:'esp', credits:6,  prereqs:['s6_02'] },
  { id:'s7_03', code:'ING-701', name:'Inglés Intermedio II',   sem:7, type:'bas', credits:4,  prereqs:['s6_03'] },
  { id:'s7_04', code:'CSK-701', name:'Communication Skills',   sem:7, type:'bas', credits:4,  prereqs:['s5_04'] },
  { id:'s7_05', code:'ETI-701', name:'Ética Profesional',      sem:7, type:'val', credits:4,  prereqs:['s4_05'] },

  // SEM 8
  { id:'s8_01', code:'PTF-801', name:'Portafolio de Título',   sem:8, type:'esp', credits:10, prereqs:['s7_01','s7_02'] },
  { id:'s8_02', code:'PRP-801', name:'Práctica Profesional',   sem:8, type:'esp', credits:16, prereqs:['s7_01','s7_02','s7_04'] },
]

const BY_SEM = {}
for (let s = 1; s <= 8; s++) BY_SEM[s] = SUBJECTS.filter(x => x.sem === s)
const MAX_ROWS = Math.max(...Object.values(BY_SEM).map(a => a.length))
const TOTAL_CR = SUBJECTS.reduce((a, s) => a + s.credits, 0)

// ─── SUBJECT CARD ─────────────────────────────────────────────────────────────
function SubjectCard({ subject, approved, locked, onClick }) {
  const col     = TYPE_COLOR[subject.type]
  const isDone  = approved.has(subject.id)
  const missing = subject.prereqs
    .filter(p => !approved.has(p))
    .map(id => SUBJECTS.find(s => s.id === id)?.name)
    .filter(Boolean)

  return (
    <div
      onClick={() => !locked && onClick(subject.id)}
      title={locked ? `Requiere aprobar: ${missing.join(', ')}` : isDone ? 'Clic para desmarcar' : 'Clic para marcar como aprobado'}
      style={{
        position: 'relative',
        borderRadius: 8,
        border: subject.desafio
          ? `1.5px dashed ${isDone ? col : locked ? '#3a3a50' : '#7c3aed'}`
          : `1.5px solid ${isDone ? col : locked ? '#1e1e2a' : '#2e2e42'}`,
        background: isDone ? `${col}18` : locked ? '#0f0f16' : C.card,
        cursor: locked ? 'not-allowed' : 'pointer',
        transition: 'all .15s ease',
        overflow: 'hidden',
        opacity: locked ? 0.4 : 1,
        boxShadow: isDone ? `0 0 16px ${col}28` : 'none',
        minHeight: 90,
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
      }}
    >
      {/* left color bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: locked ? '#3a3a50' : col,
        borderRadius: '8px 0 0 8px',
      }} />

      {/* top: code + sem number */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '7px 8px 3px 11px',
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.58rem', fontWeight: 700,
          color: locked ? C.muted : col,
          letterSpacing: '0.03em',
        }}>{subject.code}</span>
        <span style={{
          width: 18, height: 18, borderRadius: '50%',
          background: isDone ? col : locked ? '#252535' : '#222230',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.55rem', fontWeight: 700,
          color: isDone ? '#fff' : C.muted,
          flexShrink: 0,
        }}>{subject.sem}</span>
      </div>

      {/* name */}
      <div style={{
        padding: '2px 10px 4px 11px',
        fontSize: '0.69rem',
        fontWeight: 500,
        lineHeight: 1.35,
        color: locked ? '#3d3d55' : C.text,
        flex: 1,
      }}>{subject.name}</div>

      {/* bottom: prereqs count + credits */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '3px 8px 7px 11px',
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          border: `1.5px solid ${locked ? '#3a3a50' : isDone ? col : '#3a3a52'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.55rem', fontWeight: 700,
          color: locked ? '#3a3a50' : isDone ? col : C.muted,
        }}>{subject.prereqs.length}</div>
        <div style={{
          background: isDone ? `${col}22` : locked ? '#181822' : '#222230',
          borderRadius: 4, padding: '2px 6px',
          fontSize: '0.6rem', fontWeight: 600,
          color: locked ? '#3a3a50' : isDone ? col : C.muted,
        }}>{subject.credits} cr</div>
      </div>

      {/* done checkmark */}
      {isDone && (
        <div style={{
          position: 'absolute', top: 5, right: 26,
          width: 14, height: 14,
          background: col, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.5rem', color: '#fff', fontWeight: 800,
        }}>✓</div>
      )}

      {/* locked icon */}
      {locked && (
        <div style={{ position: 'absolute', bottom: 6, right: 8, fontSize: '0.65rem' }}>🔒</div>
      )}
    </div>
  )
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleLogin = async () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return
    if (!trimmed.includes('@')) { setError('Ingresa un correo válido'); return }
    setError('')
    setLoading(true)
    await onLogin(trimmed)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", padding: 20,
    }}>
      <div style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: '52px 44px',
        width: '100%', maxWidth: 420,
        textAlign: 'center',
      }}>
        {/* Logo/icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: `${C.esp}18`,
          border: `1.5px solid ${C.esp}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', margin: '0 auto 24px',
        }}>📐</div>

        <div style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '0.6rem', fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: C.muted, marginBottom: 8,
        }}>Duoc UC · Escuela de Diseño</div>

        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '1.75rem', fontWeight: 800,
          color: C.text, letterSpacing: '-0.03em',
          marginBottom: 6,
        }}>Malla Interactiva</h1>

        <p style={{ fontSize: '0.8rem', color: C.muted, marginBottom: 36 }}>
          Diseño Industrial · 8 semestres · 412 créditos
        </p>

        <div style={{ textAlign: 'left', marginBottom: 12 }}>
          <label style={{ fontSize: '0.72rem', color: C.muted, display: 'block', marginBottom: 6 }}>
            Correo institucional
          </label>
          <input
            type="email"
            placeholder="alumno@duocuc.cl"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', padding: '11px 14px',
              background: '#0a0a10',
              border: `1px solid ${error ? '#ef4444' : C.border}`,
              borderRadius: 8, color: C.text,
              fontSize: '0.88rem',
              outline: 'none',
              transition: 'border .2s',
            }}
          />
          {error && <p style={{ fontSize: '0.68rem', color: '#ef4444', marginTop: 5 }}>{error}</p>}
        </div>

        <button
          onClick={handleLogin}
          disabled={loading || !email.trim()}
          style={{
            width: '100%', padding: '12px',
            background: email.trim() ? C.esp : '#1e1e2e',
            border: 'none', borderRadius: 8,
            color: email.trim() ? '#fff' : C.muted,
            fontSize: '0.88rem', fontWeight: 600,
            cursor: email.trim() ? 'pointer' : 'not-allowed',
            transition: 'all .2s',
          }}
        >
          {loading ? 'Cargando progreso...' : 'Entrar →'}
        </button>

        <p style={{
          fontSize: '0.65rem', color: C.muted,
          marginTop: 22, lineHeight: 1.7,
        }}>
          Tu progreso se guarda automáticamente en la nube.<br />
          Cada correo tiene su propio registro independiente.
        </p>
      </div>
    </div>
  )
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,      setUser]      = useState(null)
  const [approved,  setApproved]  = useState(new Set())
  const [saving,    setSaving]    = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [saveError, setSaveError] = useState(false)

  const handleLogin = useCallback(async (email) => {
    const saved = await loadProgress(email)
    setApproved(new Set(saved))
    setUser(email)
  }, [])

  const isLocked = useCallback((subject) => {
    return subject.prereqs.some(p => !approved.has(p))
  }, [approved])

  const toggle = useCallback((id) => {
    setApproved(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        // cascade-uncheck dependents
        const toRemove = new Set([id])
        let changed = true
        while (changed) {
          changed = false
          SUBJECTS.forEach(s => {
            if (!toRemove.has(s.id) && s.prereqs.some(p => toRemove.has(p))) {
              toRemove.add(s.id)
              changed = true
            }
          })
        }
        toRemove.forEach(r => next.delete(r))
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Auto-save debounced
  useEffect(() => {
    if (!user) return
    setSaving(true)
    setSaveError(false)
    const t = setTimeout(async () => {
      try {
        await saveProgress(user, approved)
        setLastSaved(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }))
        setSaveError(false)
      } catch {
        setSaveError(true)
      } finally {
        setSaving(false)
      }
    }, 900)
    return () => clearTimeout(t)
  }, [approved, user])

  if (!user) return <LoginScreen onLogin={handleLogin} />

  const doneCr = SUBJECTS.filter(s => approved.has(s.id)).reduce((a, s) => a + s.credits, 0)
  const pct    = Math.round(doneCr / TOTAL_CR * 100)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{
        padding: '14px 24px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
        position: 'sticky', top: 0,
        background: 'rgba(13,13,18,0.97)',
        backdropFilter: 'blur(12px)',
        zIndex: 50,
      }}>
        <div>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontSize: '0.58rem',
            fontWeight: 700, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: C.muted, marginBottom: 2,
          }}>Duoc UC · Diseño Industrial</div>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontSize: '1.05rem',
            fontWeight: 800, color: C.text, letterSpacing: '-0.02em',
          }}>Malla Interactiva</div>
        </div>

        {/* stats */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            ['Ramos', `${approved.size} / ${SUBJECTS.length}`],
            ['Créditos', `${doneCr} / ${TOTAL_CR}`],
            ['Avance', `${pct}%`],
          ].map(([lbl, val]) => (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '1rem', fontWeight: 700, color: C.esp,
              }}>{val}</div>
              <div style={{ fontSize: '0.6rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{lbl}</div>
            </div>
          ))}
          <div style={{ width: 90, height: 4, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: `linear-gradient(90deg, ${C.esp}, ${C.des})`,
              transition: 'width .4s',
            }} />
          </div>
        </div>

        {/* user + save status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', color: saveError ? '#ef4444' : C.muted }}>
              {saving ? '⏳ Guardando...' : saveError ? '⚠ Error al guardar' : lastSaved ? `✓ Guardado ${lastSaved}` : ''}
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.62rem', color: C.esp,
            }}>{user}</div>
          </div>
          <button
            onClick={() => { setUser(null); setApproved(new Set()) }}
            style={{
              background: 'transparent',
              border: `1px solid ${C.border}`,
              color: C.muted, padding: '6px 14px',
              borderRadius: 6, cursor: 'pointer',
              fontSize: '0.72rem',
              transition: 'all .2s',
            }}
          >Salir</button>
        </div>
      </div>

      {/* ── LEGEND ── */}
      <div style={{
        display: 'flex', gap: 18, flexWrap: 'wrap',
        padding: '9px 24px', borderBottom: `1px solid ${C.border}`,
        fontSize: '0.65rem', color: C.muted, alignItems: 'center',
      }}>
        {Object.entries(TYPE_LABEL).map(([k, v]) => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: TYPE_COLOR[k], display: 'inline-block', flexShrink: 0 }} />
            {v}
          </span>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, border: `1.5px dashed ${C.des}`, display: 'inline-block', flexShrink: 0 }} />
          ACBD
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>🔒 Bloqueado</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.62rem', color: C.muted }}>
          El círculo inferior izquierdo indica N° de prerrequisitos
        </span>
      </div>

      {/* ── GRID ── */}
      <div style={{ overflowX: 'auto', padding: '24px 24px 60px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 185px)',
          gap: 0,
          minWidth: 1520,
        }}>
          {/* Semester headers */}
          {[1,2,3,4,5,6,7,8].map(s => (
            <div key={s} style={{ padding: '0 5px 12px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                background: `${C.s[s-1]}18`,
                border: `1px solid ${C.s[s-1]}44`,
                color: C.s[s-1],
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: '0.66rem',
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700, letterSpacing: '0.06em',
              }}>{s}º Semestre</div>
              <div style={{ fontSize: '0.58rem', color: C.muted, marginTop: 3 }}>
                {BY_SEM[s].reduce((a, x) => a + x.credits, 0)} cr
              </div>
            </div>
          ))}

          {/* Subject rows */}
          {Array.from({ length: MAX_ROWS }, (_, row) =>
            [1,2,3,4,5,6,7,8].map(s => {
              const subj = BY_SEM[s][row]
              return (
                <div key={`${s}-${row}`} style={{ padding: '4px 5px' }}>
                  {subj && (
                    <SubjectCard
                      subject={subj}
                      approved={approved}
                      locked={isLocked(subj)}
                      onClick={toggle}
                    />
                  )}
                </div>
              )
            })
          )}

          {/* Salida intermedia */}
          <div style={{
            gridColumn: '1 / -1',
            margin: '16px 5px 0',
            border: `1px dashed ${C.des}33`,
            borderRadius: 8, padding: '8px 18px',
            fontSize: '0.63rem', color: `${C.des}88`,
            textAlign: 'center',
            background: `${C.des}06`,
          }}>
            ⟶ <strong style={{ color: C.des }}>Salida Intermedia</strong> (después del 4º sem): Técnico en Diseño Industrial — requiere Portafolio de Título + Práctica Profesional
          </div>

          {/* Portafolio */}
          <div style={{
            gridColumn: '1 / -1',
            margin: '8px 5px 0',
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 8, padding: '8px 18px',
            fontSize: '0.6rem', color: C.muted,
            textAlign: 'center',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            Proceso de Portafolio · Se desarrolla durante toda la carrera
          </div>
        </div>
      </div>
    </div>
  )
}
