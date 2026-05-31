'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@summoniq/applab-ui';
import { ArrowRight } from 'lucide-react';

const userComponents = [
  {
    name: 'Avatar',
    href: '/user/avatar',
    description: 'User avatar component with image and fallback support',
    features: ['Image avatars', 'Text fallbacks', 'Size variants', 'Status indicators'],
  },
];

export default function UserPage() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-4xl font-bold text-foreground mb-2">User Components</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Components for user profiles, identity, and personalization
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userComponents.map((component) => (
          <Link key={component.name} href={component.href}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{component.name}</CardTitle>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>{component.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {component.features.map((feature) => (
                    <div key={feature} className="text-sm text-muted-foreground">
                      • {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}