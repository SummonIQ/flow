'use client';

import { CodeBlock } from '@/components/docs/code-block';
import { Badge, Button, Card } from '@summoniq/applab-ui';
import { ArrowLeft, Check, Copy, Pause, Play } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function AnimationsPage() {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const toggleDemo = (demoId: string) => {
    setActiveDemo(activeDemo === demoId ? null : demoId);
  };

  const installCode = `bun add tw-animate-css framer-motion`;

  const basicAnimations = `// Fade animations
<div className="animate-fade-in">Fade In</div>
<div className="animate-fade-out">Fade Out</div>

// Slide animations
<div className="animate-slide-in-from-top">Slide from top</div>
<div className="animate-slide-in-from-bottom">Slide from bottom</div>
<div className="animate-slide-in-from-left">Slide from left</div>
<div className="animate-slide-in-from-right">Slide from right</div>

// Scale animations
<div className="animate-zoom-in">Zoom In</div>
<div className="animate-zoom-out">Zoom Out</div>`;

  const motionComponents = `import { motion } from 'framer-motion';

// Spring animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
>
  Spring animation
</motion.div>

// Stagger animations
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="show"
>
  {items.map((item, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>`;

  const customKeyframes = `@keyframes glow-rotate {
  0% {
    transform: rotate(0deg) scale(1.1);
    background-position: 0% 50%;
  }
  50% {
    transform: rotate(180deg) scale(1.2);
    background-position: 100% 50%;
  }
  100% {
    transform: rotate(360deg) scale(1.1);
    background-position: 0% 50%;
  }
}

@keyframes shimmer {
  from {
    background-position: 0 0;
  }
  to {
    background-position: -200% 0;
  }
}

.animate-glow-rotate {
  animation: glow-rotate 3s linear infinite;
}

.animate-shimmer {
  animation: shimmer 2s linear infinite;
}`;

  const performanceCode = `// Hardware accelerated transforms
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}

// Optimized animation properties
.optimized-animation {
  /* Use transform and opacity for best performance */
  transition: transform 0.3s ease, opacity 0.3s ease;

  /* Avoid animating these properties */
  /* width, height, left, top, margin, padding */
}

// Use CSS containment for complex animations
.animation-container {
  contain: layout style paint;
}`;

  const animations = [
    {
      id: 'fade',
      name: 'Fade',
      description: 'Smooth opacity transitions',
      className: 'animate-fade-in',
      duration: '0.3s',
    },
    {
      id: 'slide-up',
      name: 'Slide Up',
      description: 'Slide from bottom to top',
      className: 'animate-slide-in-from-bottom',
      duration: '0.4s',
    },
    {
      id: 'scale',
      name: 'Scale',
      description: 'Zoom in/out with scaling',
      className: 'animate-zoom-in',
      duration: '0.2s',
    },
    {
      id: 'bounce',
      name: 'Bounce',
      description: 'Playful bounce effect',
      className: 'animate-bounce',
      duration: '1s',
    },
    {
      id: 'pulse',
      name: 'Pulse',
      description: 'Gentle pulsing animation',
      className: 'animate-pulse',
      duration: '2s',
    },
    {
      id: 'spin',
      name: 'Spin',
      description: 'Continuous rotation',
      className: 'animate-spin',
      duration: '1s',
    },
  ];
  const animationCurves = [
    {
      name: 'Linear',
      class: 'ease-linear',
      description: 'Constant speed throughout',
    },
    {
      name: 'Ease',
      class: 'ease',
      description: 'Slow start, fast middle, slow end',
    },
    { name: 'Ease In', class: 'ease-in', description: 'Slow start, fast end' },
    {
      name: 'Ease Out',
      class: 'ease-out',
      description: 'Fast start, slow end',
    },
    {
      name: 'Ease In Out',
      class: 'ease-in-out',
      description: 'Slow start and end',
    },
  ];

  const durations = [
    {
      name: 'Fast',
      class: 'duration-150',
      value: '150ms',
      use: 'Quick interactions',
    },
    {
      name: 'Default',
      class: 'duration-300',
      value: '300ms',
      use: 'Standard transitions',
    },
    {
      name: 'Slow',
      class: 'duration-500',
      value: '500ms',
      use: 'Complex animations',
    },
    {
      name: 'Slower',
      class: 'duration-700',
      value: '700ms',
      use: 'Page transitions',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/design-system"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Design System
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Animation Library
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-200 max-w-3xl">
            A comprehensive collection of smooth, performant animations built
            with CSS and Framer Motion. Designed for modern web applications
            with hardware acceleration and accessibility in mind.
          </p>
        </div>

        {/* Installation */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Installation
          </h2>
          <div className="relative">
            <CodeBlock language="bash" code={installCode} />
            <button
              onClick={() => copyToClipboard(installCode, 'install')}
              className="absolute top-3 right-3 p-2 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
            >
              {copiedStates.install ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </section>

        {/* Animation Demos */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Interactive Demos
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animations.map(animation => (
              <div
                key={animation.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {animation.name}
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleDemo(animation.id)}
                  >
                    {activeDemo === animation.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-gray-600 dark:text-gray-200 text-sm mb-4">
                  {animation.description}
                </p>

                {/* Demo Area */}
                <div className="h-24 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                  <div
                    className={`w-12 h-12 bg-blue-500 rounded-lg ${
                      activeDemo === animation.id ? animation.className : ''
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Duration</span>
                    <span>{animation.duration}</span>
                  </div>
                  <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {animation.className}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Basic CSS Animations */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            CSS Animations
          </h2>
          <p className="text-gray-600 dark:text-gray-200 mb-4">
            Use these utility classes powered by tw-animate-css for common
            animation patterns:
          </p>
          <div className="relative">
            <CodeBlock language="css" code={basicAnimations} />
            <button
              onClick={() => copyToClipboard(basicAnimations, 'basic')}
              className="absolute top-3 right-3 p-2 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
            >
              {copiedStates.basic ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </section>

        {/* Framer Motion */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Framer Motion Components
          </h2>
          <p className="text-gray-600 dark:text-gray-200 mb-4">
            For more complex animations and interactions, use Framer Motion:
          </p>
          <div className="relative">
            <CodeBlock language="tsx" code={motionComponents} />
            <button
              onClick={() => copyToClipboard(motionComponents, 'motion')}
              className="absolute top-3 right-3 p-2 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
            >
              {copiedStates.motion ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </section>

        {/* Custom Keyframes */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Custom Keyframes
          </h2>
          <p className="text-gray-600 dark:text-gray-200 mb-4">
            Advanced animations with custom keyframe definitions:
          </p>
          <div className="relative">
            <CodeBlock language="css" code={customKeyframes} />
            <button
              onClick={() => copyToClipboard(customKeyframes, 'keyframes')}
              className="absolute top-3 right-3 p-2 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
            >
              {copiedStates.keyframes ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </section>

        {/* Performance Guidelines */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Performance Guidelines
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-700">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
                ✅ Best Practices
              </h3>
              <ul className="space-y-2 text-green-800 dark:text-green-200">
                <li>• Use transform and opacity for animations</li>
                <li>• Enable hardware acceleration with transform3d</li>
                <li>• Use will-change sparingly and remove after animation</li>
                <li>• Prefer CSS transitions for simple state changes</li>
                <li>• Use requestAnimationFrame for JavaScript animations</li>
              </ul>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-700">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-3">
                ❌ Avoid
              </h3>
              <ul className="space-y-2 text-red-800 dark:text-red-200">
                <li>• Animating width, height, left, top</li>
                <li>• Animating margin, padding</li>
                <li>• Complex animations during scroll</li>
                <li>• Too many simultaneous animations</li>
                <li>• Animations longer than 500ms for UI interactions</li>
              </ul>
            </div>
          </div>

          <div className="relative">
            <CodeBlock language="css" code={performanceCode} />
            <button
              onClick={() => copyToClipboard(performanceCode, 'performance')}
              className="absolute top-3 right-3 p-2 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
            >
              {copiedStates.performance ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </section>

        {/* Accessibility */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Accessibility Considerations
          </h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Motion Preferences
            </h3>
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              Always respect user preferences for reduced motion:
            </p>
            <pre className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded text-sm text-blue-900 dark:text-blue-100">
              {`@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-slide-in-from-bottom,
  .animate-zoom-in {
    animation: none;
    transition: none;
  }
}`}
            </pre>
          </div>
        </section>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/design-system"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Design System
        </Link>

        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-3xl font-bold">Animations</h1>
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-700"
            >
              Beta
            </Badge>
          </div>
          <p className="text-muted-foreground mb-6">
            Animation curves and timing tokens for smooth and consistent motion
          </p>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Timing Functions</h2>
            <div className="space-y-6">
              {animationCurves.map(curve => (
                <div key={curve.name} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium">{curve.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {curve.class}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {curve.description}
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 text-primary-foreground rounded hover:opacity-90 transition-opacity">
                      Demo
                    </button>
                  </div>
                  <div className="bg-muted rounded-lg p-2 h-12 relative overflow-hidden">
                    <div
                      className={`w-8 h-8 bg-primary rounded transition-transform duration-1000 ${curve.class} hover:translate-x-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Animation Durations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {durations.map(duration => (
                <div key={duration.name} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium">{duration.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {duration.class}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {duration.value} - {duration.use}
                      </div>
                    </div>
                  </div>
                  <button
                    className={`w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors ${duration.class}`}
                  >
                    Hover me
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">
              Common Animation Patterns
            </h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Fade In/Out</h4>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-purple-500 text-white rounded hover:opacity-75 transition-opacity duration-300">
                    Fade on Hover
                  </button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Scale Transform</h4>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-red-500 text-white rounded hover:scale-105 transition-transform duration-300">
                    Scale on Hover
                  </button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Slide Animation</h4>
                <div className="overflow-hidden">
                  <button className="px-4 py-2 bg-indigo-500 text-white rounded hover:translate-x-2 transition-transform duration-300">
                    Slide on Hover
                  </button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Rotate Animation</h4>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:rotate-3 transition-transform duration-300">
                    Rotate on Hover
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">
              Animation Guidelines
            </h2>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <h4 className="font-medium mb-2 text-blue-900">
                  Performance First
                </h4>
                <p className="text-sm text-blue-800">
                  Use CSS transforms and opacity for animations. Avoid animating
                  layout properties like width, height, or position.
                </p>
              </div>

              <div className="p-4 border rounded-lg bg-yellow-50">
                <h4 className="font-medium mb-2 text-yellow-900">
                  Respect User Preferences
                </h4>
                <p className="text-sm text-yellow-800">
                  Always respect the `prefers-reduced-motion` setting for
                  accessibility and user comfort.
                </p>
              </div>

              <div className="p-4 border rounded-lg bg-green-50">
                <h4 className="font-medium mb-2 text-green-900">
                  Purposeful Motion
                </h4>
                <p className="text-sm text-green-800">
                  Use animations to guide attention, provide feedback, and
                  enhance user understanding of interface changes.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
