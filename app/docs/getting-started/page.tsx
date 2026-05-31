export default function GettingStartedPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-4xl font-bold tracking-tight">Getting Started</h1>
				<p className="text-lg text-muted-foreground mt-4">
					Set up the SummonIQ UI library in your project and start building.
				</p>
			</div>

			<div className="space-y-6">
				<div className="bg-card border border-border rounded-lg p-6">
					<h2 className="text-2xl font-semibold mb-4">Installation</h2>
					<p className="text-muted-foreground mb-6">
						Follow these steps to set up the SummonIQ UI library in your project.
					</p>

					<div className="space-y-6">
						<div className="bg-muted/30 p-4 rounded-lg">
							<h4 className="font-medium text-foreground mb-2">
								1. Link the package locally
							</h4>
							<p className="text-sm text-muted-foreground mb-2">
								From your project directory, link the UI package:
							</p>
							<code className="text-sm bg-muted/80 text-white px-3 py-2 rounded block">
								bun link @summoniq/applab-ui
							</code>
						</div>

						<div className="bg-muted/30 p-4 rounded-lg">
							<h4 className="font-medium text-foreground mb-2">
								2. Import styles
							</h4>
							<p className="text-sm text-muted-foreground mb-2">
								Add the styles to your global CSS or layout:
							</p>
							<code className="text-sm bg-muted/80 text-white px-3 py-2 rounded block">
								@import &quot;@summoniq/applab-ui/styles/globals.css&quot;;
							</code>
						</div>

						<div className="bg-muted/30 p-4 rounded-lg">
							<h4 className="font-medium text-foreground mb-2">
								3. Use components
							</h4>
							<p className="text-sm text-muted-foreground mb-2">
								Import and use components in your application:
							</p>
							<code className="text-sm bg-muted/80 text-white px-3 py-2 rounded block whitespace-pre">
								{`import { Button, Card, Input } from &quot;@summoniq/applab-ui&quot;

export function MyComponent() {
  return (
    <Card>
      <Button>Click me</Button>
    </Card>
  )
}`}
							</code>
						</div>
					</div>
				</div>

				<div className="bg-card border border-border rounded-lg p-6">
					<h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
					<ul className="space-y-3">
						<li>
							<a className="text-primary hover:underline" href="/docs/components">
								Explore the component library →
							</a>
						</li>
						<li>
							<a className="text-primary hover:underline" href="/docs/architecture">
								Learn about the architecture →
							</a>
						</li>
						<li>
							<a className="text-primary hover:underline" href="/docs/best-practices">
								Follow best practices →
							</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
