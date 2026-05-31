'use client';

import { ComponentPreview } from '@summoniq/applab-ui';

interface ComponentExampleProps {
	title?: string;
	description?: string;
	code: string;
	language?: string;
	children: React.ReactNode;
	align?: 'start' | 'center' | 'end';
	showCopy?: boolean;
	defaultTab?: 'preview' | 'code';
}

export function ComponentExample({
	title,
	description,
	code,
	language = 'tsx',
	children,
	align = 'center',
	showCopy = true,
	defaultTab = 'preview',
}: ComponentExampleProps) {
	return (
		<div className="space-y-4">
			{(title || description) && (
				<div className="space-y-2">
					{title && <h3 className="text-xl font-semibold">{title}</h3>}
					{description && <p className="text-sm text-muted-foreground">{description}</p>}
				</div>
			)}
			<ComponentPreview
				code={code}
				language={language}
				align={align}
				showCopy={showCopy}
				defaultTab={defaultTab}
			>
				{children}
			</ComponentPreview>
		</div>
	);
}
