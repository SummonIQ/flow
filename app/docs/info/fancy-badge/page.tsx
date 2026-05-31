'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { ComponentExample } from '@/components/docs/component-example';
import { FancyBadge } from '@summoniq/applab-ui';
import {
  Sparkles,
  Zap,
  Rocket,
  Stars,
  Crown,
  Award,
  TrendingUp,
  Activity,
} from 'lucide-react';

export default function FancyBadgePage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">FancyBadge</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Premium animated badges with gradient backgrounds and glowing effects
      </p>

      <div className="space-y-12">
        {/* Default Example */}
        <ComponentExample
          title="AI-Powered Badge"
          description="The signature FancyBadge with sparkles icon and fade-in animation"
          code={`<FancyBadge>
  AI-Powered Work Intelligence
</FancyBadge>`}
        >
          <div className="flex items-center justify-center p-8">
            <FancyBadge>AI-Powered Work Intelligence</FancyBadge>
          </div>
        </ComponentExample>

        {/* Color Variants */}
        <ComponentExample
          title="Color Variants"
          description="Different gradient color schemes for various contexts"
          code={`<FancyBadge variant="default">Default Gray</FancyBadge>
<FancyBadge variant="purple">Purple Theme</FancyBadge>
<FancyBadge variant="blue">Blue Theme</FancyBadge>
<FancyBadge variant="green">Green Theme</FancyBadge>
<FancyBadge variant="amber">Amber Theme</FancyBadge>
<FancyBadge variant="rose">Rose Theme</FancyBadge>`}
        >
          <div className="flex flex-wrap items-center gap-3 justify-center p-8">
            <FancyBadge variant="default">Default Gray</FancyBadge>
            <FancyBadge variant="purple">Purple Theme</FancyBadge>
            <FancyBadge variant="blue">Blue Theme</FancyBadge>
            <FancyBadge variant="green">Green Theme</FancyBadge>
            <FancyBadge variant="amber">Amber Theme</FancyBadge>
            <FancyBadge variant="rose">Rose Theme</FancyBadge>
          </div>
        </ComponentExample>

        {/* Custom Icons */}
        <ComponentExample
          title="Custom Icons"
          description="Use different lucide-react icons for different contexts"
          code={`<FancyBadge icon={Rocket} variant="blue">
  Launch Ready
</FancyBadge>
<FancyBadge icon={Crown} variant="amber">
  Premium Feature
</FancyBadge>
<FancyBadge icon={Zap} variant="purple">
  Super Fast
</FancyBadge>
<FancyBadge icon={Award} variant="green">
  Verified
</FancyBadge>`}
        >
          <div className="flex flex-wrap items-center gap-3 justify-center p-8">
            <FancyBadge icon={Rocket} variant="blue">
              Launch Ready
            </FancyBadge>
            <FancyBadge icon={Crown} variant="amber">
              Premium Feature
            </FancyBadge>
            <FancyBadge icon={Zap} variant="purple">
              Super Fast
            </FancyBadge>
            <FancyBadge icon={Award} variant="green">
              Verified
            </FancyBadge>
          </div>
        </ComponentExample>

        {/* Animation Variants */}
        <ComponentExample
          title="Animation Options"
          description="Control badge and icon animations independently"
          code={`<FancyBadge animation="fade-in" iconAnimation="pulse">
  Fade In
</FancyBadge>
<FancyBadge animation="pulse" iconAnimation="spin" icon={Activity}>
  Pulse Effect
</FancyBadge>
<FancyBadge animation="bounce" iconAnimation="pulse" icon={TrendingUp}>
  Bounce Effect
</FancyBadge>
<FancyBadge animation="none" iconAnimation="none">
  No Animation
</FancyBadge>`}
        >
          <div className="flex flex-wrap items-center gap-3 justify-center p-8">
            <FancyBadge animation="fade-in" iconAnimation="pulse">
              Fade In
            </FancyBadge>
            <FancyBadge animation="pulse" iconAnimation="spin" icon={Activity}>
              Pulse Effect
            </FancyBadge>
            <FancyBadge animation="bounce" iconAnimation="pulse" icon={TrendingUp}>
              Bounce Effect
            </FancyBadge>
            <FancyBadge animation="none" iconAnimation="none">
              No Animation
            </FancyBadge>
          </div>
        </ComponentExample>

        {/* Practical Examples */}
        <ComponentExample
          title="Practical Use Cases"
          description="Real-world examples of FancyBadge usage"
          code={`<FancyBadge variant="purple" icon={Stars}>
  New Feature Available
</FancyBadge>
<FancyBadge variant="green" icon={Sparkles}>
  AI-Enhanced
</FancyBadge>
<FancyBadge variant="blue" icon={Rocket}>
  Beta Program
</FancyBadge>
<FancyBadge variant="amber" icon={Crown}>
  Pro Plan Only
</FancyBadge>`}
        >
          <div className="flex flex-wrap items-center gap-3 justify-center p-8">
            <FancyBadge variant="purple" icon={Stars}>
              New Feature Available
            </FancyBadge>
            <FancyBadge variant="green" icon={Sparkles}>
              AI-Enhanced
            </FancyBadge>
            <FancyBadge variant="blue" icon={Rocket}>
              Beta Program
            </FancyBadge>
            <FancyBadge variant="amber" icon={Crown}>
              Pro Plan Only
            </FancyBadge>
          </div>
        </ComponentExample>

        {/* API Reference */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">API Reference</h2>
          <CodeBlock
            language="typescript"
            code={`interface FancyBadgeProps {
  variant?: 'default' | 'purple' | 'blue' | 'green' | 'amber' | 'rose';
  animation?: 'none' | 'fade-in' | 'pulse' | 'bounce';
  icon?: React.ComponentType<{ className?: string }>;
  iconAnimation?: 'none' | 'pulse' | 'spin';
  children: React.ReactNode;
  className?: string;
}`}
          />
        </div>

        {/* Props Table */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold">Prop</th>
                <th className="text-left p-3 font-semibold">Type</th>
                <th className="text-left p-3 font-semibold">Default</th>
                <th className="text-left p-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3 font-mono">variant</td>
                <td className="p-3 font-mono text-xs">
                  'default' | 'purple' | 'blue' | 'green' | 'amber' | 'rose'
                </td>
                <td className="p-3 font-mono text-xs">'default'</td>
                <td className="p-3">Color theme of the badge</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-mono">animation</td>
                <td className="p-3 font-mono text-xs">
                  'none' | 'fade-in' | 'pulse' | 'bounce'
                </td>
                <td className="p-3 font-mono text-xs">'fade-in'</td>
                <td className="p-3">Badge entrance animation</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-mono">icon</td>
                <td className="p-3 font-mono text-xs">LucideIcon</td>
                <td className="p-3 font-mono text-xs">Sparkles</td>
                <td className="p-3">Icon component from lucide-react</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-mono">iconAnimation</td>
                <td className="p-3 font-mono text-xs">'none' | 'pulse' | 'spin'</td>
                <td className="p-3 font-mono text-xs">'pulse'</td>
                <td className="p-3">Icon animation effect</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-mono">children</td>
                <td className="p-3 font-mono text-xs">ReactNode</td>
                <td className="p-3 font-mono text-xs">-</td>
                <td className="p-3">Badge text content</td>
              </tr>
              <tr>
                <td className="p-3 font-mono">className</td>
                <td className="p-3 font-mono text-xs">string</td>
                <td className="p-3 font-mono text-xs">-</td>
                <td className="p-3">Additional CSS classes</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Usage Notes */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">Usage Notes</h3>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>FancyBadge uses dark gradients and is optimized for dark backgrounds</li>
            <li>The backdrop-blur effect requires a contrasting background to be visible</li>
            <li>All animations use CSS and perform well across devices</li>
            <li>Icons from lucide-react are automatically sized and colored</li>
            <li>
              Use sparingly for premium features, announcements, or special status indicators
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
