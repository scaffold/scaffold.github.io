import React from 'react';
import observationMonitor from '../observationMonitor.ts';

export default (
  { title, children }: { title: React.ReactNode; children?: React.ReactNode },
) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const callback = React.useCallback(
    (el: HTMLDivElement | null) => {
      if (el) {
        observationMonitor.observe(el);
      } else if (ref.current) {
        observationMonitor.unobserve(ref.current);
      }
      ref.current = el;
    },
    [],
  );

  return (
    <div
      ref={callback}
      className='even:self-start odd:self-end mx-16 text-night bg-construction rounded-lg max-w-5xl'
    >
      <div className='px-4 py-2 font-medium'>
        {title}
      </div>
      <div className='px-4 py-2 bg-mist rounded-b-lg'>{children}</div>
    </div>
  );
};
