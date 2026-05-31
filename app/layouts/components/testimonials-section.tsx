'use client';

import { Badge } from '@/components/ui/badge';
import { Quote } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
}

interface TestimonialsSectionProps {
  badge?: string;
  headline?: string;
  subheadline?: string;
  testimonials?: Testimonial[];
  logosLabel?: string;
  logos?: string[];
}

export function TestimonialsSection({
  badge = 'Testimonials',
  headline = 'Trusted by industry leaders',
  subheadline = 'From startups to Fortune 500 enterprises, we help companies build exceptional products and teams.',
  testimonials = [
    {
      quote:
        'They delivered exceptional results within two weeks. Their understanding of our industry was immediately apparent—no learning curve required.',
      author: 'Sarah Chen',
      role: 'CEO',
      company: 'Series B Startup',
    },
    {
      quote:
        "We'd been searching for a solution for months. They found exactly what we needed and helped us scale rapidly.",
      author: 'Marcus Johnson',
      role: 'COO',
      company: 'Enterprise Corp',
    },
    {
      quote:
        "The quality of work is remarkable. Pre-vetted, relevant, and ready to deploy. It's transformed how we approach our challenges.",
      author: 'David Park',
      role: 'VP Engineering',
      company: 'Tech Platform',
    },
  ],
  logosLabel = 'Partnering with leading companies',
  logos = ['Company 1', 'Company 2', 'Company 3', 'Company 4', 'Company 5', 'Company 6'],
}: TestimonialsSectionProps) {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            {badge}
          </Badge>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-4">
            {headline}
          </h2>
          <p className="text-base text-muted-foreground max-w-3xl mx-auto">
            {subheadline}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-8 rounded-2xl bg-white/60 backdrop-blur-sm border border-border dark:bg-slate-800/60"
            >
              <Quote className="w-10 h-10 text-electric-blue/20 absolute top-6 right-6" />
              <p className="text-foreground/80 mb-6 relative z-10 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-electric-blue/10 flex items-center justify-center">
                  <span className="font-semibold text-electric-blue">
                    {testimonial.author
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-12">
          <p className="text-center text-sm text-muted-foreground mb-8">
            {logosLabel}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
            {logos.map(logo => (
              <div
                key={logo}
                className="text-muted-foreground font-display font-semibold text-lg hover:text-muted-foreground transition-colors"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
