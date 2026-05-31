import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation Style Guide',
  description:
    'Editorial guidelines for SummonIQ documentation, covering tone, formatting, code blocks, and accessibility expectations.',
};

export default function StyleGuidePage() {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-4xl font-bold text-foreground mb-6">
        Documentation Style Guide
      </h1>

      <p className="leading-7 text-muted-foreground mb-4">
        Consistency keeps the docs trustworthy. Use the following conventions
        when writing content for SummonIQ:
      </p>

      <h2 className="text-3xl font-semibold text-foreground mt-10 mb-4">
        Tone & Voice
      </h2>

      <ul className="my-6 ml-6 list-disc space-y-2 text-muted-foreground">
        <li>
          Write in the <strong>second person</strong> ("you") when guiding the
          reader.
        </li>
        <li>
          Keep sentences short and direct — favour active voice and concrete
          steps over marketing copy.
        </li>
        <li>
          Assume the reader is comfortable with TypeScript and React, but
          explain SummonIQ-specific concepts the first time they appear.
        </li>
      </ul>

      <h2 className="text-3xl font-semibold text-foreground mt-10 mb-4">
        Headings & Structure
      </h2>

      <ul className="my-6 ml-6 list-disc space-y-2 text-muted-foreground">
        <li>
          Each page must begin with a single{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">#</code>{' '}
          heading that matches{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            metadata.title
          </code>
          .
        </li>
        <li>
          Use sentence case for headings (
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            ## Configure deployments
          </code>
          , not{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            ## Configure Deployments
          </code>
          ).
        </li>
        <li>
          Avoid skipping levels (do not jump from{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">##</code> to{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">####</code>).
        </li>
      </ul>

      <h2 className="text-3xl font-semibold text-foreground mt-10 mb-4">
        Lists & Callouts
      </h2>

      <ul className="my-6 ml-6 list-disc space-y-2 text-muted-foreground">
        <li>
          Use ordered lists for sequential steps and unordered lists for
          reference items.
        </li>
        <li>
          Surface critical warnings with the{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            &lt;Callout variant="warning"&gt;
          </code>{' '}
          component. Use{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            &lt;Callout variant="tip"&gt;
          </code>{' '}
          for best practices.
        </li>
      </ul>

      <h2 className="text-3xl font-semibold text-foreground mt-10 mb-4">
        Code Samples
      </h2>

      <pre className="my-6 overflow-x-auto rounded-lg border border-border/70 bg-card/60 p-4">
        <code className="text-sm">
          {`\`\`\`tsx filename="examples/hello-world.tsx"
import { Button } from '@summoniq/applab-ui'

export function HelloWorld() {
  return <Button>Hello</Button>
}
\`\`\``}
        </code>
      </pre>

      <ul className="my-6 ml-6 list-disc space-y-2 text-muted-foreground">
        <li>
          Use the{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            filename="..."
          </code>{' '}
          annotation where the path matters.
        </li>
        <li>
          Keep examples minimal; readers should be able to copy/paste and run
          them without modification.
        </li>
        <li>
          Prefer TypeScript and modern React patterns (hooks, Server Components)
          unless a specific framework requires otherwise.
        </li>
      </ul>

      <h2 className="text-3xl font-semibold text-foreground mt-10 mb-4">
        Links & Cross-References
      </h2>

      <ul className="my-6 ml-6 list-disc space-y-2 text-muted-foreground">
        <li>
          Link to other docs pages using absolute paths (
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            /docs/style-guide
          </code>
          ) so{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            lint:links
          </code>{' '}
          can validate them.
        </li>
        <li>
          External links should open in the same tab; set expectations in the
          surrounding text if the destination requires sign-in.
        </li>
      </ul>

      <h2 className="text-3xl font-semibold text-foreground mt-10 mb-4">
        Accessibility
      </h2>

      <ul className="my-6 ml-6 list-disc space-y-2 text-muted-foreground">
        <li>
          Provide alt text for all images (
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            ![description](/path.png)
          </code>
          ) and use the{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            &lt;Image /&gt;
          </code>{' '}
          component when embedding screenshots.
        </li>
        <li>
          Describe the expected outcome for keyboard-only users when documenting
          UI interactions.
        </li>
      </ul>

      <div className="my-6 ml-6 list-disc space-y-2 text-muted-foreground">
        If a guide requires a different format (for example, long-form tutorials
        or reference tables), call it out in the PR description so reviewers
        understand the rationale.
      </div>
    </div>
  );
}
