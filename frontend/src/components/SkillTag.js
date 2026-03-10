import React from 'react';

const COLORS = {
  'Python': '#3776AB', 'JavaScript': '#F7DF1E', 'React': '#61DAFB', 'Node.js': '#339933',
  'Machine Learning': '#FF6B6B', 'Deep Learning': '#9B59B6', 'NLP': '#E74C3C',
  'Computer Vision': '#1ABC9C', 'Robotics': '#E67E22', 'IoT': '#27AE60',
  'Arduino': '#00979D', 'C++': '#00599C', 'Java': '#ED8B00', 'Django': '#092E20',
  'React': '#61DAFB', 'PostgreSQL': '#336791', 'MongoDB': '#47A248', 'Web Development': '#FF7675',
  'AI': '#6C63FF', 'Transformers': '#FFB347', 'Data Science': '#E84393',
};

export default function SkillTag({ skill, size = 'sm' }) {
  const color = COLORS[skill] || '#6c63ff';
  const padding = size === 'lg' ? '5px 14px' : '3px 10px';
  const fontSize = size === 'lg' ? '0.85rem' : '0.75rem';
  return (
    <span style={{
      display:'inline-block', padding, fontSize, fontWeight:600, borderRadius:99,
      border:`1px solid ${color}40`, color, background:`${color}15`, whiteSpace:'nowrap'
    }}>{skill}</span>
  );
}
