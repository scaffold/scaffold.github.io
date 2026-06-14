import type { ReactNode } from 'react';

interface Props {
  num: string;
  title: ReactNode;
  intro?: ReactNode;
}

export function SectionHead({ num, title, intro }: Props) {
  return (
    <div className="section-head">
      <div>
        <div className="num">{num}</div>
        <h2>{title}</h2>
      </div>
      {intro ? <p className="intro">{intro}</p> : <div />}
    </div>
  );
}
