'use client';

import { Button } from '@summoniq/applab-ui';
import { useState } from 'react';

export default function TestModalPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Modal Test Page</h1>

      {/* Test if buttons work */}
      <div className="space-y-4">
        {/* Try regular HTML button first */}
        <button
          onClick={() => {
            console.log('HTML Button clicked!');
            alert('HTML Button works!');
          }}
          className="px-4 py-2 bg-primary/100 text-white rounded hover:bg-blue-600"
        >
          Test HTML Button (Should show alert)
        </button>

        <Button
          onClick={() => {
            console.log('UI Button clicked!');
            alert('UI Button works!');
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Test UI Button (Should show alert)
        </Button>

        <button
          onClick={() => {
            console.log('Setting isOpen to:', !isOpen);
            setIsOpen(!isOpen);
          }}
          className="px-4 py-2 bg-primary/100 text-white rounded hover:bg-green-600"
        >
          Toggle State HTML (Current: {isOpen ? 'true' : 'false'})
        </button>

        {/* Simple modal test */}
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-card p-6 rounded-lg shadow-xl border border-border/80">
              <h2 className="text-lg font-bold mb-4 text-foreground">
                Simple Modal Test
              </h2>
              <p className="mb-4 text-foreground">
                If you can see this, basic modal functionality works!
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-destructive/100 hover:bg-red-600 text-white rounded"
              >
                Close Modal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Debug info */}
      <div className="mt-8 p-4 bg-muted/30 rounded">
        <h3 className="font-bold">Debug Info:</h3>
        <p>
          Button component loaded:{' '}
          {typeof Button === 'function' ? '✅ Yes' : '❌ No'}
        </p>
        <p>State value: {isOpen ? 'true' : 'false'}</p>
      </div>
    </div>
  );
}
