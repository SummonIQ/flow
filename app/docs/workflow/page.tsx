import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content Contribution Workflow',
  description:
    'Step-by-step process for contributing documentation to the SummonIQ platform, from drafting MDX to shipping production updates.',
};

export default function WorkflowPage() {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-4xl font-bold text-foreground mb-6">
        Content Contribution Workflow
      </h1>

      <p className="leading-7 text-muted-foreground mb-4">
        The documentation stack now ships with automation to keep content
        consistent. Follow this workflow whenever you create or update docs:
      </p>

      <h2 className="text-3xl font-semibold text-foreground mt-10 mb-4">
        1. Branching & Issue Tracking
      </h2>

      <ul className="my-6 ml-6 list-disc space-y-2 text-muted-foreground">
        <li>
          Create a Linear issue (or pick up an existing one) for every
          contribution.
        </li>
        <li>
          Branch from{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">main</code>{' '}
          using a descriptive name, e.g.{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            docs/content-workflow
          </code>
          .
        </li>
        <li>
          Reference the issue ID in your branch/commit messages so automation
          can map activity back to Linear.
        </li>
      </ul>

      <h2 className="text-3xl font-semibold text-foreground mt-10 mb-4">
        2. Authoring Content
      </h2>

      <ul className="my-6 ml-6 list-disc space-y-2 text-muted-foreground">
        <li>
          Author new pages in the{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            apps/docs/app
          </code>{' '}
          directory using <strong>MDX</strong>.
        </li>
        <li>
          Include an{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            export const metadata = {`{ title, description }`}
          </code>{' '}
          block at the top of each file —{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            lint:content
          </code>{' '}
          will fail without it.
        </li>
        <li>
          Ensure the first heading (
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            # Heading
          </code>
          ) matches the metadata title so navigation stays consistent.
        </li>
        <li>
          Keep files focused; prefer new pages over extremely long guides so the
          sidebar remains scannable.
        </li>
      </ul>

      <h2 className="text-3xl font-semibold text-foreground mt-10 mb-4">
        3. Local Validation
      </h2>

      <p className="leading-7 text-muted-foreground mb-4">
        Run the following commands before opening a pull request:
      </p>

      <pre className="my-6 overflow-x-auto rounded-lg border border-border/70 bg-card/60 p-4">
        <code className="text-sm">
          {`bun run lint --cwd apps/docs
bun run lint:links --cwd apps/docs
bun run lint:content --cwd apps/docs
bun run build --cwd apps/docs`}
        </code>
      </pre>

      <p className="leading-7 text-muted-foreground mb-4">
        The{' '}
        <code className="rounded bg-muted px-1 py-0.5 text-sm">ci:verify</code>{' '}
        script bundles these checks into one step:
      </p>

      <pre className="my-6 overflow-x-auto rounded-lg border border-border/70 bg-card/60 p-4">
        <code className="text-sm">{`bun run ci:verify --cwd apps/docs`}</code>
      </pre>

      <p className="leading-7 text-muted-foreground mb-4">
        Address all failing output before requesting review. The link and
        content validators are fast (sub-second for typical changes) so feel
        free to run them often while editing.
      </p>

      <h2 className="text-3xl font-semibold text-foreground mt-10 mb-4">
        4. Submitting a Pull Request
      </h2>

      <ul className="my-6 ml-6 list-disc space-y-2 text-muted-foreground">
        <li>Push your branch and open a PR.</li>
        <li>
          Fill out the PR template (see below) with links to previews and
          screenshots of any notable UI changes.
        </li>
        <li>
          Tag the documentation lead as a reviewer. They are responsible for
          content quality, tone, and adherence to the style guide.
        </li>
        <li>
          Leave the Linear issue in <strong>In Progress</strong> until the PR is
          merged; automation will move it to <strong>Done</strong> during
          deployment.
        </li>
      </ul>

      <h2 className="text-3xl font-semibold text-foreground mt-10 mb-4">
        5. Reviews & Approvals
      </h2>

      <ul className="my-6 ml-6 list-disc space-y-2 text-muted-foreground">
        <li>
          A reviewer will check writing style, accuracy, and the rendered
          preview.
        </li>
        <li>
          Technical reviewers confirm code samples compile or render correctly.
        </li>
        <li>
          Resolve feedback in follow-up commits — avoid force pushes once review
          begins so history stays readable.
        </li>
      </ul>

      <h2 className="text-3xl font-semibold text-foreground mt-10 mb-4">
        6. Deployment & Post-Merge
      </h2>

      <ul className="my-6 ml-6 list-disc space-y-2 text-muted-foreground">
        <li>
          The CI pipeline runs{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            bun run ci:verify --cwd apps/docs
          </code>{' '}
          to block regressions, followed by deployment to the preview
          environment.
        </li>
        <li>
          Once merged to{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">main</code>,
          production deploys automatically. Validate the live page, then close
          the Linear issue if it remains open.
        </li>
      </ul>

      <div className="my-6 ml-6 list-disc space-y-2 text-muted-foreground">
        Large content initiatives work best as multiple PRs: ship the baseline
        page first, then layer interactive examples, screenshots, or translation
        updates afterwards.
      </div>
    </div>
  );
}
