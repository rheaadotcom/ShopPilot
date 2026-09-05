import React from 'react';
import { Button } from './common/Button';
import { useDemoFlow } from '../../hooks/useDemoFlow';

/**
 * Controls to manage the demo flow during a live run.
 * Provides Reset and Exit actions.
 */
export const DemoControls: React.FC = () => {
  const { resetDemo, exitDemo, state } = useDemoFlow();

  const isRunning = state !== 'IDLE' && state !== 'SUCCESS' && state !== 'FAILED';

  return (
    <div className="flex gap-space-12 mt-space-12">
      <Button variant="secondary" size="md" onClick={resetDemo} disabled={!isRunning}>
        Reset Demo
      </Button>
      <Button variant="outline" size="md" onClick={exitDemo} disabled={!isRunning}>
        Exit Demo
      </Button>
    </div>
  );
};
