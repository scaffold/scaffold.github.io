import React from 'react';

interface Monitor {
  on(cb: () => void): void;
  off(cb: () => void): void;
  getCount(): number;
}

export default ({ getCount }: { getCount(): number }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const itvl = setInterval(
      () => setCount(getCount()),
      100 * Math.exp(Math.random() - 0.5),
    );
    return () => clearInterval(itvl);

    // monitor.on(cb);
    // return () => monitor.off(cb);
  }, [getCount]);

  return <span className='mx-2'>{count}</span>;
};
