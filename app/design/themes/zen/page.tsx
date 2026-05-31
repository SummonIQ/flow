'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import { Button } from '@summoniq/applab-ui';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  ChevronDown,
  Clock,
  FolderTree,
  RockingChair,
  Search,
  Shield,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { HeroBackground } from './_components/hero-background';
import './maczen.css';

export default function MacZenThemePage() {
  return (
    <Page className="h-full">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <span className="rounded-lg bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 p-2">
              <RockingChair className="h-5 w-5 text-white" />
            </span>
            MacZen Theme
          </span>
        }
        description="A modern purple/fuchsia/pink gradient theme with glass morphism effects."
        actions={
          <Button asChild variant="outline">
            <Link href="/design/themes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Themes
            </Link>
          </Button>
        }
      />

      <div className="flex-1 overflow-auto">
        {/* Theme Preview Container */}
        <div className="maczen-app min-h-screen">
          {/* Hero Section */}
          <section className="relative isolate overflow-hidden bg-gradient-to-b from-white via-white to-sky-50/25 pt-16">
            <HeroBackground />
            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-40">
              <div className="mx-auto max-w-4xl text-center">
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border-x border-x-white/10 border-t border-t-white/70 bg-white/35 pl-3 pr-3.5 py-1.5 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.06)] backdrop-blur-lg">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 shadow-sm shadow-purple-500/20">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </span>
                  <span className="font-medium text-gray-900">
                    AI-Powered Screenshot Management
                  </span>
                </div>

                <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                  Transform Screenshot{' '}
                  <span className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                    Chaos
                  </span>{' '}
                  into Organized{' '}
                  <span className="bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
                    Bliss
                  </span>
                </h1>

                <p className="mb-10 text-xl text-gray-600 sm:text-2xl">
                  MacZen uses AI to automatically categorize, search, and manage
                  your screenshots. Never lose track of important captures
                  again.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border-t border-t-white/70 border-b border-b-black/10 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 px-7 py-3.5 text-base font-semibold text-white shadow-[0_12px_28px_-16px_rgba(0,0,0,0.55),0_22px_74px_-34px_rgba(124,58,237,0.65)] transition-all duration-300 hover:-translate-y-[1px] hover:scale-[1.02]">
                    <span className="relative z-10">Download for Mac</span>
                    <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-black/45 bg-white/70 px-7 py-3.5 text-base font-semibold text-gray-900 shadow-sm backdrop-blur-md transition-all hover:border-black/55 hover:bg-white/80">
                    <span className="relative z-10">Explore Features</span>
                  </button>
                </div>

                <p className="mt-8 text-sm text-gray-500">
                  Free forever • No credit card required • macOS 12.0 or later
                </p>
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 animate-bounce pb-8">
              <ChevronDown className="h-8 w-8 text-gray-400" />
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                  Everything you need to stay organized
                </h2>
                <p className="text-lg text-gray-600">
                  Powerful features designed to make screenshot management
                  effortless
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    icon: Brain,
                    title: 'AI-Powered Categorization',
                    description:
                      'Intelligent AI automatically sorts screenshots into relevant categories without any manual effort.',
                  },
                  {
                    icon: Search,
                    title: 'Instant Search',
                    description:
                      'Find any screenshot instantly with powerful OCR-based search across all your captures.',
                  },
                  {
                    icon: FolderTree,
                    title: 'Smart Organization',
                    description:
                      'Automatic folder creation and management keeps everything perfectly organized.',
                  },
                  {
                    icon: Zap,
                    title: 'Lightning Fast',
                    description:
                      'Native Mac app built for performance. Access thousands of screenshots in milliseconds.',
                  },
                  {
                    icon: Shield,
                    title: 'Privacy First',
                    description:
                      'All processing happens locally on your Mac. Your screenshots never leave your device.',
                  },
                  {
                    icon: Clock,
                    title: 'Time-Based Browsing',
                    description:
                      'Navigate through your screenshot history with beautiful timeline views.',
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="group relative rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-purple-300 hover:shadow-lg"
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                      <feature.icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-24 bg-gradient-to-b from-fuchsia-50/50 to-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 md:grid-cols-3 text-center">
                {[
                  { value: '< 100ms', label: 'Space switch latency' },
                  { value: '1,000+', label: 'Screenshots before you need Pro' },
                  { value: 'Seconds', label: 'To find any capture' },
                ].map((stat, index) => (
                  <div key={index}>
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                  Simple, transparent pricing
                </h2>
                <p className="text-lg text-gray-600">
                  Choose the plan that&apos;s right for you
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
                {[
                  {
                    name: 'Free',
                    price: '$0',
                    description: 'Perfect for getting started',
                    features: [
                      'Up to 1,000 screenshots',
                      'Basic AI categorization',
                      'Local search',
                      'Community support',
                    ],
                    cta: 'Get Started',
                    popular: false,
                  },
                  {
                    name: 'Pro',
                    price: '$9',
                    period: '/month',
                    description: 'For power users',
                    features: [
                      'Unlimited screenshots',
                      'Advanced AI categorization',
                      'OCR search',
                      'Priority support',
                      'Cloud backup',
                      'Advanced analytics',
                    ],
                    cta: 'Start Free Trial',
                    popular: true,
                  },
                ].map((plan, index) => (
                  <div
                    key={index}
                    className={`relative rounded-2xl border p-8 w-full sm:w-[380px] ${
                      plan.popular
                        ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'border-gray-200'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center">
                        <span className="rounded-full border-t border-t-white/70 border-b border-b-black/10 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 px-4 py-1 text-sm font-semibold text-white shadow-sm shadow-fuchsia-500/20">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-900">
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-gray-600">{plan.period}</span>
                        )}
                      </div>
                      <p className="text-gray-600">{plan.description}</p>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-start gap-3 text-gray-900"
                        >
                          <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`block w-full rounded-full py-3 text-center font-medium transition-all ${
                        plan.popular
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-24 bg-gradient-to-b from-white to-fuchsia-50/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                  Loved by professionals worldwide
                </h2>
              </div>

              <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
                {[
                  {
                    name: 'Sarah Chen',
                    role: 'Product Designer',
                    content:
                      'MacZen has completely transformed how I organize design inspiration. I can find any screenshot in seconds!',
                    avatar: 'SC',
                  },
                  {
                    name: 'Alex Rivera',
                    role: 'Software Engineer',
                    content:
                      "The AI categorization is incredibly accurate. It's like having a personal assistant for screenshot management.",
                    avatar: 'AR',
                  },
                  {
                    name: 'Jamie Lee',
                    role: 'Content Creator',
                    content:
                      'I take hundreds of screenshots daily. MacZen saves me hours every week. Absolutely essential tool!',
                    avatar: 'JL',
                  },
                ].map((testimonial, index) => (
                  <div
                    key={index}
                    className="glass-card rounded-2xl p-6 bg-white/80 backdrop-blur-xl border border-gray-200"
                  >
                    <div className="mb-4 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="mb-6 text-gray-900">{testimonial.content}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 text-sm font-semibold text-white">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-24 bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-4xl font-bold mb-6">
                  Ready to organize your screenshots?
                </h2>
                <p className="text-xl mb-10 text-white/90">
                  Join thousands of Mac users who have transformed their
                  screenshot workflow with MacZen.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <button className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-purple-700 shadow-lg transition-all hover:bg-white/90">
                    Download Now - It&apos;s Free
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Page>
  );
}
