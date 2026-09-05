import React from 'react';
import { Button } from './common/Button';
import { useDemoFlow } from '../../hooks/useDemoFlow';

/**
 * Prominent button to launch the deterministic demo flow.
 * Placed on the AgentHome page.
 */
export const RunLiveDemoButton: React.FC = () => {
  const { startDemo, state } = useDemoFlow();

  const isRunning = state !== 'IDLE' && state !== 'SUCCESS' && state !== 'FAILED';

  const handleClick = () => {
    if (!isRunning) {
      startDemo();
    }
  };

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={handleClick}
      disabled={isRunning}
      className="shadow-md"
    >
      ▶ RUN LIVE DEMO
    </Button>
  );
};
