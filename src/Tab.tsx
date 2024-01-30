import React from 'react';
import CountMetric from './CountMetric.tsx';

export default ({ text, onClick, getCount }: {
  text: string;
  onClick(): void;
  getCount?(): number;
}) => (
  <span className='p-2' onClick={onClick}>
    {text}
    {getCount ? <CountMetric getCount={getCount} /> : undefined}
  </span>
);
