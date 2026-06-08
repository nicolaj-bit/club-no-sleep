import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Moon, Baby, BookOpen, Users, Calendar, Star, ShoppingBag, Lightbulb, Heart, MessageCircle, CheckSquare, Coffee, Bell } from 'lucide-react';
import LegalModal from '@/components/landing/LegalModal';

const FEATURES = [
  {
    icon: Baby,
    title: 'Grundliden app for age',
    desc: 'Tjek dit barns tilstand og udvikling, søvnalder og meddage og de opdaterer og du og din partner.'
  },
  {
    icon: Lightbulb,
    title: 'miledepæle',
    desc: 'Hold styr på de baby milepæle og støt barnet og hvad de nærmere. Appen giver et samlet overblik.'
  },
  {
    icon: Star,
    title: 'Tipssamler',
    desc: 'Her finder du de vigtigste råd om søvn, og du kan dele dine bedste søvntips og hjælpe andre familier.'
  },
  {
    icon: Heart,
    title: 'Er fyt i meeblet',
    desc: 'De første mange uger tæller mærkere til at stege og hjemme med baby og hvad sker der nå.'
  },
  {
    icon: Coffee,
    title: 'Babysovings-caller',
    desc: 'Find fyggeforholdsmæssige af veninder og aktiviteter at lave med din baby og se hvad der sker.'
  },
  {
    icon: Users,
    title: 'Fællesskab',
    desc: 'Mød andre forældre i nærhed og aldrig væren alene — fællesskab med andre der forstår dig.'
  },
  {
    icon: BookOpen,
    title: 'Søvnlog',
    desc: 'Håndtere søvnrytmen, overvågning, dagbog og opdatering. Forbedrer barns søvn systematisk.'
  },
  {
    icon: ShoppingBag,
    title: 'Din app efter valg',
    desc: 'Sæt tid på præmie produkter, registrér dagsliv og og indhold. Til den start og bedste.'
  },
  {
    icon: CheckSquare,
    title: 'Din app efter valg',
    desc: 'Kend til dem der nu siger dig giv dig mere ro, og tilpas oplevelse til hvad din familie har brug for.'
  },
];

export default function Landing() {
  const [isAuth, setIsAuth] = useState(false);
  const [legalModal, setLegalModal] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth).catch(() => {});
  }, []);

  const handleLogin = () => base44.auth.redirectToLogin('/app');
  const handleEnterApp = () => { window.location.href = '/app'; };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", color: '#2B1F16', backgroundColor: '#F5EDE0', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ backgroundColor: '#F5EDE0', borderBottom: '1px solid #DDD0BC', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: '#C8A882', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Moon style={{ width: 14, height: 14, color: '#fff' }} />
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.1rem', fontWeight: 600, color: '#2B1F16', letterSpacing: '0.01em' }}>clubnosleep</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {isAuth ? (
              <button onClick={handleEnterApp} style={btnDark}>Åbn app →</button>
            ) : (
              <>
                <button onClick={handleLogin} style={{ background: 'none', border: 'none', color: '#5B3F2B', fontSize: '0.87rem', fontWeight: 500, cursor: 'pointer' }}>Log ind</button>
                <button onClick={handleLogin} style={btnDark}>Bliv medlem</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      <section style={{ backgroundColor: '#F5EDE0', padding: '5rem 2rem 5.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 80, flexWrap: 'wrap' }}>

          {/* Left copy */}
          <div style={{ flex: '1 1 360px', minWidth: 280 }}>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2.2rem, 4vw, 3.1rem)',
              fontWeight: 500,
              lineHeight: 1.18,
              color: '#1E140A',
              marginBottom: '1.5rem',
              marginTop: 0,
            }}>
              Til dig, der er vågen,<br />
              når resten af verden sover.
            </h1>

            <div style={{ marginBottom: '1.4rem' }}>
              <Heart style={{ width: 17, height: 17, color: '#C8A882', fill: '#C8A882' }} />
            </div>

            <p style={{ color: '#5B3F2B', fontSize: '0.94rem', lineHeight: 1.85, maxWidth: 415, marginBottom: '1rem', marginTop: 0 }}>
              Der findes en hel særlig form for ensomhed i moderskabet. En ensomhed som kommer snigende om natten, når baby igen er vågen og resten af verden er stille; Natteensomhed.
            </p>
            <p style={{ color: '#5B3F2B', fontSize: '0.94rem', lineHeight: 1.85, maxWidth: 415, marginBottom: '2.5rem', marginTop: 0 }}>
              CLUB NO SLEEP er en dansk app skabt til netop disse øjeblikke. For ingen skal føle sig alene i moderskabet.
            </p>

            <button onClick={handleLogin} style={btnBrown}>Hent app</button>
          </div>

          {/* Right — phones */}
          <div style={{ flex: '0 0 auto', display: 'flex', gap: 12, alignItems: 'flex-end' }}>

            {/* Phone A — Kalender / Home (left, taller) */}
            <div style={{
              width: 182, height: 372,
              borderRadius: 26, overflow: 'hidden',
              boxShadow: '0 28px 72px rgba(0,0,0,0.22)',
              border: '5px solid #C8B49A',
              backgroundColor: '#C8B49A',
              position: 'relative', flexShrink: 0,
            }}>
              <Notch color="#C8B49A" />
              <div style={{ backgroundColor: '#F8F2EA', height: '100%', padding: '22px 9px 8px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={micro('#9A7A6A')}>Mandag, 17. april</p>
                    <p style={{ color: '#1E140A', fontSize: '0.62rem', fontWeight: 700, margin: '1px 0 0' }}>Godmorgen, Sara</p>
                  </div>
                  <span style={{ fontSize: '0.75rem' }}>🔔</span>
                </div>
                {/* Kalender mini */}
                <div style={{ backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', border: '1px solid #EDE4DB' }}>
                  <div style={{ padding: '5px 8px', borderBottom: '1px solid #F0E8DF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: '#1E140A', fontSize: '0.46rem', fontWeight: 700, margin: 0 }}>Fælles kalender</p>
                    <p style={micro('#C8A882')}>April 2025</p>
                  </div>
                  <div style={{ padding: '4px 6px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1, marginBottom: 2 }}>
                      {['M','T','O','T','F','L','S'].map((d,i) => (
                        <div key={i} style={{ textAlign:'center', fontSize:'0.28rem', color:'#9A7A6A', fontWeight:700 }}>{d}</div>
                      ))}
                      {Array.from({length:30},(_,i)=>i+1).map(d=>(
                        <div key={d} style={{ textAlign:'center', fontSize:'0.28rem', borderRadius:3, padding:'1.5px 0', backgroundColor: d===9?'#C8A882':d===18?'#F3E9E1':'transparent', color:d===9?'#fff':'#5B3F2B', fontWeight:d===9?700:400 }}>{d}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ margin:'2px 6px 5px', backgroundColor:'#F3E9E1', borderRadius:6, padding:'3px 6px' }}>
                    <p style={{ color:'#5B3F2B', fontSize:'0.34rem', fontWeight:600, margin:0 }}>Onsdag 11:00 — Rigshospitalet</p>
                  </div>
                </div>
                {/* 2 mini feature cards */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5 }}>
                  <div style={{ backgroundColor:'#3A2416', borderRadius:9, padding:'7px 8px' }}>
                    <span style={{fontSize:'0.7rem'}}>🌙</span>
                    <p style={{color:'#C8A882',fontSize:'0.38rem',fontWeight:600,margin:'2px 0 1px'}}>Søvn chat</p>
                    <p style={{color:'rgba(200,168,130,0.5)',fontSize:'0.3rem',margin:0}}>Lær mere »</p>
                  </div>
                  <div style={{ backgroundColor:'#EDE0CC', borderRadius:9, padding:'7px 8px' }}>
                    <span style={{fontSize:'0.7rem'}}>📅</span>
                    <p style={{color:'#2B1A10',fontSize:'0.38rem',fontWeight:600,margin:'2px 0 1px'}}>Ekspert aftaler</p>
                    <p style={{color:'#9A7A6A',fontSize:'0.3rem',margin:0}}>Følg med »</p>
                  </div>
                </div>
                {/* Partner row */}
                <div style={{ backgroundColor:'#fff', borderRadius:9, padding:'6px 8px' }}>
                  <p style={{...micro('#9A7A6A'), textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:700, marginBottom:3}}>Del med partner</p>
                  <div style={{display:'flex',alignItems:'center',gap:4}}>
                    {['👩','👨'].map((av,i)=>(
                      <div key={i} style={{width:16,height:16,borderRadius:'50%',backgroundColor:'#EDE0CC',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.52rem',border:'1.5px solid #fff',marginLeft:i>0?-3:0}}>{av}</div>
                    ))}
                    <p style={{color:'#5B3F2B',fontSize:'0.32rem',margin:'0 0 0 4px'}}>Sara</p>
                    <p style={{color:'#C8A882',fontSize:'0.3rem',margin:'0 0 0 auto'}}>Inviter →</p>
                  </div>
                </div>
                {/* Bottom nav */}
                <BottomNavMock active={0} />
              </div>
            </div>

            {/* Phone B — Søvnlog (right, slightly shorter, raised) */}
            <div style={{
              width: 172, height: 350,
              borderRadius: 24, overflow:'hidden',
              boxShadow:'0 22px 60px rgba(0,0,0,0.18)',
              border:'5px solid #DDD0BC',
              backgroundColor:'#DDD0BC',
              position:'relative', flexShrink:0,
              marginBottom: 14,
            }}>
              <Notch color="#DDD0BC" />
              <div style={{ backgroundColor:'#FFFDF9', height:'100%', padding:'20px 9px 7px', boxSizing:'border-box', display:'flex', flexDirection:'column', gap:6 }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <p style={{color:'#1E140A',fontSize:'0.62rem',fontWeight:700,margin:0}}>Søvndag</p>
                  <span style={{fontSize:'0.5rem'}}>✏️</span>
                </div>
                <p style={micro('#9A7A6A')}>Fredag 11. april</p>
                {[
                  {time:'21:30 – 07:14', dur:'9t 44 min', dark:false},
                  {time:'21:00 – 13:30', dur:'8t 16 min', dark:false},
                  {time:'17:00 – 17:45', dur:'45 min',    dark:true },
                  {time:'18:30 – 21:47', dur:'3t 17 min', dark:false},
                ].map((row,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',backgroundColor:row.dark?'#3A2416':'#F3E9E1',borderRadius:7,padding:'5px 8px'}}>
                    <p style={{color:row.dark?'#C8A882':'#5B3F2B',fontSize:'0.34rem',margin:0,fontWeight:500}}>{row.time}</p>
                    <p style={{color:row.dark?'#C8A882':'#9A7A6A',fontSize:'0.32rem',margin:0}}>{row.dur}</p>
                  </div>
                ))}
                <div style={{backgroundColor:'#C8A882',borderRadius:7,padding:'5px 8px'}}>
                  <p style={{color:'#fff',fontSize:'0.34rem',fontWeight:600,textAlign:'center',margin:0}}>Se alle →</p>
                </div>
                <BottomNavMock active={1} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          KOM MED I KLUBBEN
      ════════════════════════════════ */}
      <section style={{ backgroundColor: '#E5D3B8' }}>
        <div style={{ display:'flex', flexWrap:'wrap', minHeight:480 }}>
          {/* Photo — left half */}
          <div style={{ flex:'0 0 42%', minWidth:260, minHeight:420, overflow:'hidden' }}>
            <img
              src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=900&q=85"
              alt="Mor med barnevogn"
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
            />
          </div>
          {/* Text — right half */}
          <div style={{ flex:'1 1 300px', padding:'4.5rem 4rem', display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <div style={{ width:36,height:36,borderRadius:'50%',border:'1.5px solid #8A6245',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.5rem' }}>
              <Heart style={{width:16,height:16,color:'#8A6245'}} />
            </div>
            <h2 style={{ fontFamily:"'Cormorant Garamond', Georgia, serif", fontSize:'clamp(1.9rem,3vw,2.5rem)', fontWeight:600, color:'#1E140A', lineHeight:1.2, marginBottom:'1.25rem', marginTop:0 }}>
              Kom med i klubben
            </h2>
            <p style={{ color:'#5B3F2B', fontSize:'0.92rem', lineHeight:1.88, maxWidth:380, marginBottom:'0.9rem', marginTop:0 }}>
              Vi vil være det. Det er skønt at vide, dagene er lange og hun er der for dig de dage, du er træt du slukker lyset. Hug fra for alle medlemmer.
            </p>
            <p style={{ color:'#5B3F2B', fontSize:'0.92rem', lineHeight:1.88, maxWidth:380, marginBottom:'0.9rem', marginTop:0 }}>
              CLUB NO SLEEP er stedet dig, hun der altid vil at blot at lyde, spiller og finde andre i dit slægtled.
            </p>
            <p style={{ color:'#5B3F2B', fontSize:'0.92rem', lineHeight:1.88, maxWidth:380, marginBottom:'1.8rem', marginTop:0 }}>
              Kom med i klubben. For den eneste måde som man er, at man aldrig ene — Vores mål er at mindske ensomhed i moderskabet.
            </p>
            <p style={{ fontFamily:"'Cormorant Garamond', Georgia, serif", fontStyle:'italic', fontSize:'1.35rem', color:'#6B4A2A', margin:0, lineHeight:1.4 }}>
              Hjertelig og kærn fra Sara + Nicolaj
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          DETTE FINDER DU I APPEN
      ════════════════════════════════ */}
      <section style={{ backgroundColor:'#FFFDF9', padding:'5.5rem 2rem' }}>
        <div style={{ maxWidth:920, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3.2rem' }}>
            <h2 style={{ fontFamily:"'Cormorant Garamond', Georgia, serif", fontSize:'clamp(1.9rem,3vw,2.4rem)', fontWeight:600, color:'#1E140A', marginBottom:'0.6rem', marginTop:0 }}>
              Dette finder du i appen
            </h2>
            <Heart style={{width:17,height:17,color:'#C8A882',fill:'#C8A882',display:'inline-block'}} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'2.75rem 3rem' }}>
            {FEATURES.map((f,i)=>(
              <div key={i} style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ width:42,height:42,borderRadius:'50%',backgroundColor:'#EDE0CC',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <f.icon style={{width:19,height:19,color:'#5B3F2B'}} />
                </div>
                <p style={{ color:'#1E140A', fontSize:'0.88rem', fontWeight:600, margin:0 }}>{f.title}</p>
                <p style={{ color:'#7A665A', fontSize:'0.78rem', lineHeight:1.6, margin:0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          DU SKAL IKKE STÅ MED DET HELE ALENE
      ════════════════════════════════ */}
      <section style={{ backgroundColor:'#C4A97A', padding:'5.5rem 2rem' }}>
        <div style={{ maxWidth:1050, margin:'0 auto', display:'flex', alignItems:'center', gap:64, flexWrap:'wrap' }}>

          {/* Left */}
          <div style={{ flex:'1 1 280px' }}>
            <h2 style={{ fontFamily:"'Cormorant Garamond', Georgia, serif", fontSize:'clamp(2rem,3vw,2.75rem)', fontWeight:600, color:'#1E140A', lineHeight:1.2, marginBottom:'1.2rem', marginTop:0 }}>
              Du skal ikke stå<br />med det hele alene
            </h2>
            <p style={{ color:'#3E2510', fontSize:'0.92rem', lineHeight:1.88, maxWidth:320, marginBottom:'2rem', marginTop:0 }}>
              Du kan inkludere alt er en god app til at samle kalender og tjekhuste og tilpasning. Sammen bliver det alle lettere.
            </p>
            <button onClick={handleLogin} style={{ backgroundColor:'#2B1A10', color:'#F5EFE9', border:'none', borderRadius:9, padding:'13px 28px', fontSize:'0.9rem', fontWeight:600, cursor:'pointer' }}>
              Bliv medlem
            </button>
          </div>

          {/* Right — two cards */}
          <div style={{ flex:'0 0 auto', display:'flex', gap:14, alignItems:'flex-start' }}>

            {/* Partner card */}
            <div style={{ width:186, backgroundColor:'#FFFDF9', borderRadius:18, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.22)' }}>
              <div style={{ padding:'11px 13px', borderBottom:'1px solid #F0E8DF' }}>
                <p style={{ color:'#1E140A', fontSize:'0.62rem', fontWeight:700, margin:0 }}>Del med partner</p>
              </div>
              <div style={{ padding:'11px 13px', display:'flex', flexDirection:'column', gap:8 }}>
                {[{name:'Sara obj',av:'👩'},{name:'Nicolaj',av:'👨'}].map((m,i)=>(
                  <div key={i} style={{display:'flex',gap:8,alignItems:'center'}}>
                    <div style={{width:26,height:26,borderRadius:'50%',backgroundColor:'#F3E9E1',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem',flexShrink:0}}>{m.av}</div>
                    <div style={{flex:1,backgroundColor:'#F3E9E1',borderRadius:9,padding:'5px 8px'}}>
                      <p style={{color:'#5B3F2B',fontSize:'0.48rem',fontWeight:600,margin:0}}>{m.name}</p>
                    </div>
                  </div>
                ))}
                <div style={{backgroundColor:'#F3E9E1',borderRadius:9,padding:'5px 8px',marginTop:2}}>
                  <p style={{color:'#9A7A6A',fontSize:'0.42rem',margin:0}}>Inviter partner</p>
                </div>
                <button style={{width:'100%',backgroundColor:'#C8A882',color:'#fff',border:'none',borderRadius:9,padding:'7px 0',fontSize:'0.48rem',fontWeight:700,cursor:'pointer',marginTop:2}}>
                  Bliv medlem
                </button>
              </div>
            </div>

            {/* Calendar card */}
            <div style={{ width:162, backgroundColor:'#FFFDF9', borderRadius:18, overflow:'hidden', boxShadow:'0 16px 50px rgba(0,0,0,0.18)' }}>
              <div style={{ padding:'11px 13px', borderBottom:'1px solid #F0E8DF' }}>
                <p style={{color:'#1E140A',fontSize:'0.62rem',fontWeight:700,margin:0}}>Fælles kalender</p>
                <p style={{color:'#9A7A6A',fontSize:'0.34rem',margin:'2px 0 0'}}>April 2025</p>
              </div>
              <div style={{ padding:'10px 13px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:6 }}>
                  {['M','T','O','T','F','L','S'].map((d,i)=>(
                    <div key={i} style={{textAlign:'center',fontSize:'0.28rem',color:'#9A7A6A',fontWeight:700}}>{d}</div>
                  ))}
                  {Array.from({length:30},(_,i)=>i+1).map(d=>(
                    <div key={d} style={{textAlign:'center',fontSize:'0.28rem',borderRadius:4,padding:'2px 0',backgroundColor:d===9?'#C8A882':[18,24].includes(d)?'#F3E9E1':'transparent',color:d===9?'#fff':'#5B3F2B',fontWeight:d===9?700:400}}>{d}</div>
                  ))}
                </div>
                <div style={{backgroundColor:'#F3E9E1',borderRadius:9,padding:'6px 9px'}}>
                  <p style={{color:'#5B3F2B',fontSize:'0.42rem',fontWeight:600,margin:'0 0 2px'}}>Onsdag 11:00</p>
                  <p style={{color:'#9A7A6A',fontSize:'0.35rem',margin:0}}>Rigshospitalet</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor:'#1E140A', padding:'3.5rem 2rem 2rem' }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))', gap:'2rem', marginBottom:'2rem' }}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:12}}>
                <div style={{width:27,height:27,borderRadius:'50%',backgroundColor:'#C8A882',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Moon style={{width:12,height:12,color:'#fff'}} />
                </div>
                <span style={{fontFamily:"'Cormorant Garamond', Georgia, serif",fontSize:'1rem',fontWeight:600,color:'#F5EFE9'}}>clubnosleep</span>
              </div>
              <p style={{color:'#7A5A44',fontSize:'0.8rem',lineHeight:1.7,maxWidth:200,margin:0}}>
                Din trygge havn som ny forælder — søvn, fællesskab og viden samlet ét sted.
              </p>
            </div>
            <div>
              <p style={{color:'#5A4030',fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12,marginTop:0}}>Juridisk</p>
              <div style={{display:'flex',flexDirection:'column',gap:9}}>
                <button onClick={()=>setLegalModal('terms')} style={{background:'none',border:'none',color:'#C8A882',fontSize:'0.86rem',cursor:'pointer',textAlign:'left',padding:0}}>Handelsbetingelser</button>
                <button onClick={()=>setLegalModal('privacy')} style={{background:'none',border:'none',color:'#C8A882',fontSize:'0.86rem',cursor:'pointer',textAlign:'left',padding:0}}>Privatlivspolitik</button>
              </div>
            </div>
            <div>
              <p style={{color:'#5A4030',fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12,marginTop:0}}>Hent appen</p>
              <div style={{display:'flex',flexDirection:'column',gap:9}}>
                <a href="#" style={{color:'#C8A882',fontSize:'0.86rem',textDecoration:'none'}}>App Store</a>
                <a href="#" style={{color:'#C8A882',fontSize:'0.86rem',textDecoration:'none'}}>Google Play</a>
              </div>
            </div>
          </div>
          <div style={{borderTop:'1px solid #2E1C0E',paddingTop:'1.5rem',textAlign:'center'}}>
            <p style={{color:'#5A4030',fontSize:'0.76rem',margin:0}}>© 2025 Clubnosleep · Alle rettigheder forbeholdes</p>
          </div>
        </div>
      </footer>

      {legalModal==='terms' && <LegalModal type="terms" title="Handelsbetingelser" onClose={()=>setLegalModal(null)} />}
      {legalModal==='privacy' && <LegalModal type="privacy" title="Privatlivspolitik" onClose={()=>setLegalModal(null)} />}

      {/* ── RESPONSIVE ── */}
      <style>{`
        @media (max-width: 860px) {
          /* stack hero */
        }
        @media (max-width: 640px) {
          .features-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 440px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Shared style helpers ── */
const btnDark = {
  backgroundColor:'#5B3F2B', color:'#fff', border:'none',
  borderRadius:8, padding:'9px 20px', fontSize:'0.87rem',
  fontWeight:600, cursor:'pointer',
};
const btnBrown = {
  backgroundColor:'#7A5535', color:'#fff', border:'none',
  borderRadius:9, padding:'13px 32px', fontSize:'0.93rem',
  fontWeight:600, cursor:'pointer',
};
const micro = (color) => ({ color, fontSize:'0.32rem', margin:0 });

/* ── Tiny sub-components ── */
function Notch({ color }) {
  return (
    <div style={{
      position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
      width:52, height:14, backgroundColor:color,
      borderRadius:'0 0 10px 10px', zIndex:10,
    }} />
  );
}

function BottomNavMock({ active }) {
  const items = [['🏠','Hjem'],['📋','Søvnlog'],['➕',''],['💬','Fælles'],['👤','Profil']];
  return (
    <div style={{marginTop:'auto',display:'flex',justifyContent:'space-around',paddingTop:5,borderTop:'1px solid #EDE4DB'}}>
      {items.map(([ic,lb],i)=>(
        <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
          <span style={{fontSize: i===2 ? '0.88rem' : '0.58rem'}}>{ic}</span>
          {lb && <span style={{fontSize:'0.24rem',color:i===active?'#C8A882':'#9A7A6A'}}>{lb}</span>}
        </div>
      ))}
    </div>
  );
}