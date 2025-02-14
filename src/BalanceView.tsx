import React from 'react';
import { BalanceService } from 'scaffold/src/BalanceService.ts';
import { UiContext } from './context.ts';
import { error } from 'scaffold/src/util/functional.ts';

export default ({}: {}) => {
  const { ctx } = React.useContext(UiContext) ?? error('No context!');
  const [balance, setBalance] = React.useState(0n);

  React.useEffect(() => {
    const controller = new AbortController();
    ctx.get(BalanceService).onBalanceChange(
      (balance) => setBalance(balance),
      controller.signal,
    );
    return () => controller.abort();
  }, [ctx]);

  return <>Balance: {Number(balance)}</>;
};
