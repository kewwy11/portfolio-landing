import React from 'react';
import './rolling-number.css';

export default function RollingNumber({ value, className = '', trackClassName = '' }) {
  return <span className={`rolling-number ${className}`} aria-hidden="true">
    <span className={`number-track ${trackClassName}`}>
      <span>{value}</span><span>{value}</span>
    </span>
  </span>;
}
