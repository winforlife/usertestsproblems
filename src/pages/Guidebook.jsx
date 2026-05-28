import React from 'react';
import { COLORS, FONTS } from '../design-tokens';

function Guidebook() {
  const projectName = window.location.pathname.split('/')[1] || "Pro Scan 6Dimensions";

  // Composant pour les lignes de couleur avec code hex
  const ColorRow = ({ label, hex }) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: `1px solid ${COLORS.grey}11`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '24px', 
          height: '24px', 
          backgroundColor: hex, 
          borderRadius: '4px', 
          border: '1px solid #ddd' 
        }} />
        <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{label}</span>
      </div>
      <code style={{ 
        fontFamily: FONTS.mono, 
        fontSize: '0.8rem', 
        color: COLORS.grey,
        backgroundColor: '#f4f4f4',
        padding: '2px 6px',
        borderRadius: '4px'
      }}>{hex.toUpperCase()}</code>
    </div>
  );

  const SectionCard = ({ title, children }) => (
    <div style={{
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '12px',
      textAlign: 'left',
      boxShadow: '0 4px 12px rgba(13, 26, 43, 0.05)',
      border: `1px solid ${COLORS.grey}22`,
      height: '100%',
      boxSizing: 'border-box'
    }}>
      <h3 style={{ 
        fontFamily: FONTS.primary, 
        color: COLORS.gold, 
        marginTop: 0,
        fontSize: '1.2rem',
        borderBottom: `2px solid ${COLORS.gold}22`,
        paddingBottom: '10px',
        marginBottom: '15px'
      }}>{title}</h3>
      <div>{children}</div>
    </div>
  );

  return (
    <div style={{ 
      backgroundColor: COLORS.pale, 
      minHeight: '100vh', 
      fontFamily: FONTS.body, 
      color: COLORS.deep,
      padding: '40px 20px',
      boxSizing: 'border-box'
    }}>
      
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <div style={{ fontFamily: FONTS.mono, color: COLORS.gold, fontSize: '0.75rem', letterSpacing: '3px' }}>
          PROJECT GUIDEBOOK v1.2
        </div>
        <h1 style={{ fontFamily: FONTS.primary, fontSize: '3.5rem', margin: '10px 0', fontWeight: '900' }}>
          {projectName.replace(/_/g, ' ')}
        </h1>
        <div style={{ height: '2px', width: '80px', backgroundColor: COLORS.gold, margin: '0 auto' }}></div>
      </header>

      <main style={{ 
        maxWidth: '1100px', 
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '30px'
      }}>
        
        {/* COLONNE GAUCHE : DESIGN & COULEURS */}
        <div style={{ flex: '1 1 450px' }}>
          <SectionCard title="I. Nuancier & Design System">
            <p style={{ fontSize: '0.9rem', color: COLORS.grey, marginBottom: '20px' }}>
              Variables extraites de <code>design-tokens.js</code>
            </p>
            
            <h4 style={{ fontSize: '0.75rem', color: COLORS.gold, fontFamily: FONTS.mono, marginBottom: '10px' }}>COULEURS DE MARQUE</h4>
            <ColorRow label="Fond (Pale)" hex={COLORS.pale} />
            <ColorRow label="Texte (Deep)" hex={COLORS.deep} />
            <ColorRow label="Accents (Gold)" hex={COLORS.gold} />
            <ColorRow label="Chaud (Warm)" hex={COLORS.warm} />

            <h4 style={{ fontSize: '0.75rem', color: COLORS.gold, fontFamily: FONTS.mono, marginTop: '25px', marginBottom: '10px' }}>LES 6 DIMENSIONS (D1-D6)</h4>
            <ColorRow label="D1 - Stratégie" hex={COLORS.D1} />
            <ColorRow label="D2 - Énergie" hex={COLORS.D2} />
            <ColorRow label="D3 - Collectif" hex={COLORS.D3} />
            <ColorRow label="D4 - Soi" hex={COLORS.D4} />
            <ColorRow label="D5 - Sens" hex={COLORS.D5} />
            <ColorRow label="D6 - Manifeste" hex={COLORS.D6} />
          </SectionCard>
        </div>

        {/* COLONNE DROITE : TECH & WORKFLOW */}
        <div style={{ flex: '1 1 450px' }}>
          <SectionCard title="II. Architecture & Code">
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '0.75rem', color: COLORS.gold, fontFamily: FONTS.mono, marginBottom: '10px' }}>TYPOGRAPHIE</h4>
              <div style={{ padding: '15px', background: COLORS.pale, borderRadius: '8px', borderLeft: `4px solid ${COLORS.gold}` }}>
                <p style={{ margin: 0, fontFamily: FONTS.primary, fontSize: '1.1rem' }}>Titre : {FONTS.primary}</p>
                <p style={{ margin: '8px 0 0 0', fontFamily: FONTS.body, fontSize: '0.9rem' }}>Corps : {FONTS.body}</p>
              </div>
            </div>

            <h4 style={{ fontSize: '0.75rem', color: COLORS.gold, fontFamily: FONTS.mono, marginBottom: '10px' }}>COMMANDES DE MAINTENANCE</h4>
            <code style={{ 
              display: 'block', 
              backgroundColor: COLORS.deep, 
              color: '#a5d6ff', 
              padding: '15px', 
              borderRadius: '8px',
              fontFamily: FONTS.mono,
              fontSize: '0.8rem',
              lineHeight: '1.5'
            }}>
              # Reset Cache Vite (PS)<br/>
              Remove-Item -Recurse -Force node_modules/.vite<br/><br/>
              # Relance forcée<br/>
              npm run dev -- --force
            </code>

            <div style={{ marginTop: '25px' }}>
              <h4 style={{ fontSize: '0.75rem', color: COLORS.gold, fontFamily: FONTS.mono, marginBottom: '10px' }}>STRUCTURE DOSSIERS</h4>
              <ul style={{ fontSize: '0.85rem', paddingLeft: '18px', margin: 0 }}>
                <li><code>/src/main.jsx</code> (Point d'entrée)</li>
                <li><code>/src/App.jsx</code> (Interface Guidebook)</li>
                <li><code>/src/design-tokens.js</code> (Source de vérité)</li>
              </ul>
            </div>
          </SectionCard>
        </div>

      </main>

      <footer style={{ textAlign: 'center', marginTop: '60px', color: COLORS.grey, fontSize: '0.8rem', borderTop: `1px solid ${COLORS.grey}22`, paddingTop: '20px' }}>
        <strong>{projectName}</strong> • Système Agile Opérationnel
      </footer>
    </div>
  );
}

export default Guidebook;