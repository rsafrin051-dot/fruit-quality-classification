import React from 'react';
import { Leaf, Info } from 'lucide-react';

const WasteGuide = () => {
  const guides = [
    { type: 'Cardboard', color: '#8b5a2b', instructions: 'Flatten boxes to save space. Remove tape and shipping labels if possible. Must be dry.' },
    { type: 'Glass', color: '#4db8ff', instructions: 'Rinse out food residue. Remove lids. Do not mix with broken window glass or mirrors.' },
    { type: 'Metal', color: '#9ca3af', instructions: 'Rinse aluminum and steel cans. Labels can be left on. Do not crush cans.' },
    { type: 'Paper', color: '#d1d5db', instructions: 'Keep dry. Do not include paper with food residue (like pizza boxes) or wax coatings.' },
    { type: 'Plastic', color: '#f59e0b', instructions: 'Check the recycling number. Rinse out containers. Crush to save space if possible.' },
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <div className="page-header glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div className="icon-container" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '1rem', color: 'var(--primary-color)' }}>
          <Leaf size={40} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>Waste Guide</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8, fontSize: '1.1rem' }}>Comprehensive encyclopedia on waste segregation and disposal</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {guides.map((item, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', borderTop: `4px solid ${item.color}` }}>
            <h3 style={{ marginTop: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }}></span>
              {item.type}
            </h3>
            <p style={{ lineHeight: 1.6, opacity: 0.8 }}>{item.instructions}</p>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(150,150,150,0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--primary-color)' }}>
              <Info size={16} /> Learn more about recycling {item.type.toLowerCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WasteGuide;
