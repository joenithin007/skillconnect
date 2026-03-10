import React from 'react';

export default function MatchScore({ score }) {
  const color = score >= 80 ? '#4ade80' : score >= 50 ? '#ffb347' : '#ff5757';
  return (
    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
      <div style={{flex:1,height:6,background:'#252d47',borderRadius:99,overflow:'hidden'}}>
        <div style={{width:`${score}%`,height:'100%',background:`linear-gradient(90deg, ${color}80, ${color})`,borderRadius:99,transition:'width 0.5s ease'}} />
      </div>
      <span style={{color,fontWeight:700,fontSize:'0.85rem',minWidth:40}}>{score}%</span>
    </div>
  );
}
