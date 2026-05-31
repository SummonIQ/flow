import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import {
  getOpenAIKey,
  OPENAI_API_KEY_ERROR,
} from '@/lib/openai/client';
import { OPENAI_GENERATE_MODEL_DEFAULT } from '@/lib/openai/config';

const ALLOWED_MODELS = new Set([
  'gpt-5',
  'o1-pro',
  'o3',
  'o4-mini',
  'gpt-4.1',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4.1-mini',
  'gpt-4.1-nano',
]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;
    const requestedModel = body?.model;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 },
      );
    }

    if (!getOpenAIKey()) {
      return NextResponse.json(
        { error: OPENAI_API_KEY_ERROR },
        { status: 500 },
      );
    }

    console.log('Generating with prompt:', prompt);

    const fallbackModelName = OPENAI_GENERATE_MODEL_DEFAULT;
    const modelName =
      typeof requestedModel === 'string' && ALLOWED_MODELS.has(requestedModel)
        ? requestedModel
        : fallbackModelName;
    console.log('Using model:', modelName);

    let text: string;
    try {
      const result = await generateText({
        model: openai(modelName),
        prompt: `You are an expert UI/UX designer and frontend architect. Generate a STUNNING, MODERN, PRODUCTION-READY layout based on: "${prompt}"

STATELESS GENERATION (CRITICAL):
- Treat this request as a completely fresh context.
- Do NOT reference or incorporate any previous prompts, previous conversations, earlier requests, or prior generated screens.
- Do NOT include meta commentary like "as mentioned earlier" or "based on our previous discussion" anywhere in the JSON content.

CRITICAL: Return ONLY raw JSON (no markdown code blocks, no backticks, no explanations). The response must start with { and end with }.

DESIGN PHILOSOPHY - Create UIs that are:
- MODERN & SLEEK: Clean lines, generous whitespace, subtle depth through shadows and layering
- ELEGANT: Refined typography hierarchy, balanced visual weight, cohesive color usage
- COMPLETE: Full-featured screens with all expected sections (not just basic placeholders)
- POLISHED: Attention to micro-details like consistent spacing, proper alignment, visual rhythm

ANTI-PATTERNS (DO NOT DO THIS):
- Do NOT make giant placeholder text blocks like "Logo" or "Result".
- Do NOT use comically oversized typography (avoid text bigger than text-4xl).
- Do NOT create a single massive card taking the whole page.
- Prefer realistic, product-like content density: compact header, clear sections, consistent spacing.

FOR SEARCH / RESULTS / LISTING PAGES (e.g. "search results page"), ALWAYS include:
- A compact top header bar with logo (Image), nav links, and a right-side area for login/avatar.
- A search bar area (Input + Button) with optional chips/tags (Badge) for active filters.
- A results header row: "Showing X–Y of Z", sort Select (e.g. Relevance, Newest, Price), view toggle (grid/list) if appropriate.
- Filters UX:
  - Desktop: left sidebar filter Card (Checkbox/Select for category/price/rating), plus "Clear" button.
  - Mobile: a filter Button that opens a Dialog containing the filter controls.
- Results content:
  - Use a responsive grid of result Cards (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3) OR a list with compact rows.
  - Each result Card should include: thumbnail Image, title, short description, price/rating Badge(s), and primary action Button.
- Pagination controls (Pagination component) and/or "Load more" button.
- Empty state (no results) and loading state (Skeleton rows/cards) so the screen feels production-ready.

FOR LANDING PAGES, always include multiple complete sections:
- Hero section with compelling headline, subheadline, CTA buttons, and visual element
- Features/benefits section with icon cards or feature highlights (3-4 features minimum)
- Social proof section (testimonials, logos, or stats)
- Secondary CTA or pricing section
- Footer with links and branding

FOR DASHBOARDS, include:
- Navigation/sidebar with menu items
- Header with search, notifications, user avatar
- Stats/KPI cards with icons, values, and trends
- Data visualizations or tables
- Recent activity or quick actions

FOR FORMS, include:
- Clear section headers and descriptions
- Properly grouped and labeled fields
- Helper text and validation states
- Primary and secondary actions
- Progress indicators for multi-step forms

Example structure for a login form (using TailwindCSS v4 classes):
{
  "type": "Flex",
  "name": "LoginContainer",
  "props": {},
  "className": "flex flex-col gap-4 p-8 bg-card rounded-lg w-full max-w-md",
  "styles": {},
  "children": [
    {
      "type": "Text",
      "name": "Title",
      "props": { "text": "Welcome Back" },
      "className": "text-2xl font-semibold text-foreground",
      "styles": {},
      "children": [],
      "events": {}
    },
    {
      "type": "Input",
      "name": "EmailInput",
      "props": { "placeholder": "Email" },
      "className": "w-full",
      "styles": {},
      "children": [],
      "events": {}
    },
    {
      "type": "Input",
      "name": "PasswordInput",
      "props": { "placeholder": "Password" },
      "className": "w-full",
      "styles": {},
      "children": [],
      "events": {}
    },
    {
      "type": "Button",
      "name": "SubmitButton",
      "props": { "text": "Sign In" },
      "className": "w-full bg-primary text-primary-foreground rounded-md py-2 font-medium",
      "styles": {},
      "children": [],
      "events": {}
    }
  ],
  "events": {}
}

IMPORTANT RULES:
- Generate 25-50+ components for a RICH, COMPLETE, production-ready UI
- Think like a professional designer: every screen needs multiple sections, not just a basic layout
- Always use ONE root layout component that holds everything (Container, Flex, Grid, or Card)
- The root component's "name" must be a descriptive PascalCase identifier derived from the screen purpose, like "LoginScreen", "AnalyticsDashboard", or "PricingPage". Do NOT use generic names like "MainContainer", "Root", "Wrapper", or "Container1".
- Use deep nesting - children can have children can have children (3-5 levels deep minimum)
- Create visual hierarchy with varying font sizes, weights, and colors
- Use Cards to create depth and separate content sections
- Add Badges for status indicators, labels, and tags
- Include Icons where appropriate (use props.icon with icon names like "star", "check", "arrow-right", "user", "settings", "bell", "search", "heart", "mail", "phone", "globe", "calendar", "clock", "shield", "zap", "trending-up")

BUILDER SCHEMA (FOLLOW EXACTLY):
- Every node MUST be an object with exactly these keys:
  type, name, props, styles, children, events
  You MAY also include className (TailwindCSS v4). Do NOT include id or parentId.
- children MUST always be an array (use [] if none).
- props MUST be an object (use {} if none).
- styles MUST be an object (use {} if none). Prefer className for styling.

SUPPORTED COMPONENT TYPES (do not invent new ones):
- Layout: Page, Container, Flex, Grid, Card, Stack, Divider
- Form: Button, Input, Textarea, Select, Checkbox, Radio, Switch, Label, Form
- Display: Text, Heading, Image, Badge, Avatar, Icon
- Feedback: Alert, Dialog, Toast, Progress, Spinner, Skeleton
- Navigation: Tabs, Breadcrumb, Pagination, Menu
- Data: Table, List, DataGrid

ALLOWED PROPS (do not invent new prop keys):
- Common: text, placeholder, disabled, variant (default|destructive|outline|secondary|ghost|link), size (default|sm|lg|icon)
- Form: type, value, checked, required, min, max, step
- Image/Avatar: src, alt
- Badge: badgeVariant (default|secondary|destructive|outline)
- Alert: alertVariant (default|destructive), title, description
- Progress: progressValue
- Heading: level (1-6)
- Icon: icon (string)

- Do NOT invent new component types. Only use existing toolbox primitives:
  - Layout: Container, Flex, Grid, Card, Stack, Divider
  - Form: Button, Input, Textarea, Select, Checkbox, Radio, Switch, Label, Form
  - Display: Text, Heading, Image, Badge, Avatar, Icon
  - Feedback: Alert, Dialog, Toast, Progress, Spinner, Skeleton
  - Navigation: Tabs, Breadcrumb, Pagination, Menu
  - Data: Table, List, DataGrid
- For Text/Heading/Label/Badge: add props.text with COMPELLING, REALISTIC content:
  - Headlines should be punchy and benefit-focused ("Ship faster with AI-powered workflows")
  - Subheadlines should expand on the value proposition
  - Feature descriptions should be specific and concrete
  - Stats should use realistic numbers ("10,000+ customers", "99.9% uptime", "50% faster")
  - Testimonials should sound authentic with names and titles
  - NO generic placeholder text like "Lorem ipsum" or "Description here"
- For Button: add props.text with action-oriented labels ("Get Started Free", "See Pricing", "Book a Demo", "Try it Now")
- For Input/Textarea/Select: add props.placeholder with helpful, specific hints ("Enter your work email", "Describe your project...")
- For Image: use contextual placeholder images:
  - For hero images: props.src="https://placehold.co/800x500/1a1a2e/eaeaea?text=Product+Preview"
  - For avatars: props.src="https://placehold.co/100x100/6366f1/ffffff?text=JD"
  - For feature images: props.src="https://placehold.co/400x300/0f172a/94a3b8?text=Feature"
  - For logos: props.src="https://placehold.co/120x40/transparent/666?text=Logo"
  - Always include descriptive props.alt
- When generating login/authentication UIs:
  - Inputs for email/password should look like real fields with borders, padding, and clear placeholders (not just plain text).
  - The primary submit Button should look like a clear call to action, with a solid background color and readable text.
  - Social login Buttons (e.g. "Sign in with Google", "Sign in with Facebook") should visually look like buttons and use brand-like color schemes (Google: light surface with blue text; Facebook: blue background with white text).
- Never represent interactive form fields as Text components. For any editable user input (email, password, username, name, etc.), ALWAYS use type: "Input" (or "Textarea" where appropriate), not "Text".
- Use Flex with flexDirection: "column" for vertical groups, "row" for horizontal groups
- Add visual polish: borderRadius, backgroundColor, proper font sizes
- Each component MUST have exactly: type, name, props, styles, children, events

CRITICAL: USE TAILWINDCSS v4 CLASSES FOR ALL STYLING

Instead of inline styles object, use a "className" property with TailwindCSS v4 utility classes.
The "styles" object should be empty {} or contain only dynamic values that can't be expressed as Tailwind classes.

TAILWINDCSS v4 CLASS GUIDELINES:

LAYOUT:
  - Flexbox: flex, flex-col, flex-row, items-center, justify-center, justify-between, gap-1, gap-2, gap-4, gap-6, gap-8
  - Grid: grid, grid-cols-2, grid-cols-3, grid-cols-4, place-items-center
  - Sizing: w-full, w-1/2, w-auto, h-full, h-auto, max-w-md, max-w-lg, max-w-xl, max-w-2xl, min-h-screen

SPACING:
  - Padding: p-1, p-2, p-4, p-6, p-8, px-4, py-2, pt-4, pb-4, pl-4, pr-4
  - Margin: m-1, m-2, m-4, m-auto, mx-auto, my-4, mt-4, mb-4, ml-4, mr-4

COLORS (use CSS variables with arbitrary values):
  - Background: bg-background, bg-card, bg-primary, bg-secondary, bg-muted, bg-accent, bg-destructive
  - Text: text-foreground, text-muted-foreground, text-primary, text-secondary-foreground, text-accent-foreground
  - Border: border-border, border-input, border-primary

TYPOGRAPHY:
  - Size: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl
  - Weight: font-light, font-normal, font-medium, font-semibold, font-bold, font-extrabold
  - Style: italic, underline, line-through, uppercase, lowercase, capitalize

BORDERS & EFFECTS:
  - Radius: rounded-none, rounded-sm, rounded, rounded-md, rounded-lg, rounded-xl, rounded-full
  - Border: border, border-2, border-0
  - Shadow: shadow-sm, shadow, shadow-md, shadow-lg, shadow-xl

COMPONENT STRUCTURE with className:
{
  "type": "Flex",
  "name": "LoginContainer",
  "props": {},
  "className": "flex flex-col gap-4 p-6 bg-card rounded-lg w-full max-w-md",
  "styles": {},
  "children": [...],
  "events": {}
}

EXAMPLES OF COMPLETE, MODERN DESIGNS:

LANDING PAGE structure (minimum 30+ components):
- Root Flex (column) >
  - Nav Bar (Flex row): Logo Image + Nav Links (Flex) + CTA Button
  - Hero Section (Flex): Headline Heading + Subheadline Text + CTA Buttons (Flex row) + Hero Image
  - Logos Section: "Trusted by" Text + Logo Row (Flex row with 4-5 logo Images)
  - Features Section: Section Heading + Features Grid (3-4 Cards each with Icon + Title + Description)
  - Testimonials Section: Section Heading + Testimonial Cards (Avatar + Quote Text + Name + Title)
  - Pricing Section: Section Heading + Pricing Cards (3 tiers with features lists)
  - CTA Section: Headline + Subtext + Email Input + Button
  - Footer: Logo + Link Columns + Social Icons + Copyright Text

DASHBOARD structure (minimum 35+ components):
- Root Flex (row) >
  - Sidebar (Flex column): Logo + Nav Items (each with Icon + Text) + User Profile
  - Main Content (Flex column):
    - Header (Flex row): Page Title + Search Input + Notification Icon + Avatar
    - Stats Row (Flex row): 4 Stat Cards (each with Icon + Label + Value + Trend Badge)
    - Charts Section (Flex row): 2 Chart Cards with titles and placeholder visuals
    - Table Section: Card with Table Header + Data rows
    - Recent Activity: Card with Activity List items

ALWAYS create COMPLETE screens, not partial layouts. Users should feel like they're looking at a real app.

Generate the COMPLETE JSON structure with DEEP NESTING now:`,
      });
      text = result.text;
    } catch (err) {
      if (modelName !== fallbackModelName) {
        console.warn(
          'Model failed, retrying with fallback model:',
          fallbackModelName,
          err,
        );
        const retry = await generateText({
          model: openai(fallbackModelName),
          prompt: `You are an expert UI/UX designer and frontend architect. Generate a STUNNING, MODERN, PRODUCTION-READY layout based on: "${prompt}"

STATELESS GENERATION (CRITICAL):
- Treat this request as a completely fresh context.
- Do NOT reference or incorporate any previous prompts, previous conversations, earlier requests, or prior generated screens.
- Do NOT include meta commentary like "as mentioned earlier" or "based on our previous discussion" anywhere in the JSON content.

CRITICAL: Return ONLY raw JSON (no markdown code blocks, no backticks, no explanations). The response must start with { and end with }.

DESIGN PHILOSOPHY - Create UIs that are:
- MODERN & SLEEK: Clean lines, generous whitespace, subtle depth through shadows and layering
- ELEGANT: Refined typography hierarchy, balanced visual weight, cohesive color usage
- COMPLETE: Full-featured screens with all expected sections (not just basic placeholders)
- POLISHED: Attention to micro-details like consistent spacing, proper alignment, visual rhythm

ANTI-PATTERNS (DO NOT DO THIS):
- Do NOT make giant placeholder text blocks like "Logo" or "Result".
- Do NOT use comically oversized typography (avoid text bigger than text-4xl).
- Do NOT create a single massive card taking the whole page.
- Prefer realistic, product-like content density: compact header, clear sections, consistent spacing.

FOR SEARCH / RESULTS / LISTING PAGES (e.g. "search results page"), ALWAYS include:
- A compact top header bar with logo (Image), nav links, and a right-side area for login/avatar.
- A search bar area (Input + Button) with optional chips/tags (Badge) for active filters.
- A results header row: "Showing X–Y of Z", sort Select (e.g. Relevance, Newest, Price), view toggle (grid/list) if appropriate.
- Filters UX:
  - Desktop: left sidebar filter Card (Checkbox/Select for category/price/rating), plus "Clear" button.
  - Mobile: a filter Button that opens a Dialog containing the filter controls.
- Results content:
  - Use a responsive grid of result Cards (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3) OR a list with compact rows.
  - Each result Card should include: thumbnail Image, title, short description, price/rating Badge(s), and primary action Button.
- Pagination controls (Pagination component) and/or "Load more" button.
- Empty state (no results) and loading state (Skeleton rows/cards) so the screen feels production-ready.

FOR LANDING PAGES, always include multiple complete sections:
- Hero section with compelling headline, subheadline, CTA buttons, and visual element
- Features/benefits section with icon cards or feature highlights (3-4 features minimum)
- Social proof section (testimonials, logos, or stats)
- Secondary CTA or pricing section
- Footer with links and branding

FOR DASHBOARDS, include:
- Navigation/sidebar with menu items
- Header with search, notifications, user avatar
- Stats/KPI cards with icons, values, and trends
- Data visualizations or tables
- Recent activity or quick actions

FOR FORMS, include:
- Clear section headers and descriptions
- Properly grouped and labeled fields
- Helper text and validation states
- Primary and secondary actions
- Progress indicators for multi-step forms

Example structure for a login form (using TailwindCSS v4 classes):
{
  "type": "Flex",
  "name": "LoginContainer",
  "props": {},
  "className": "flex flex-col gap-4 p-8 bg-card rounded-lg w-full max-w-md",
  "styles": {},
  "children": [
    {
      "type": "Text",
      "name": "Title",
      "props": { "text": "Welcome Back" },
      "className": "text-2xl font-semibold text-foreground",
      "styles": {},
      "children": [],
      "events": {}
    },
    {
      "type": "Input",
      "name": "EmailInput",
      "props": { "placeholder": "Email" },
      "className": "w-full",
      "styles": {},
      "children": [],
      "events": {}
    },
    {
      "type": "Input",
      "name": "PasswordInput",
      "props": { "placeholder": "Password" },
      "className": "w-full",
      "styles": {},
      "children": [],
      "events": {}
    },
    {
      "type": "Button",
      "name": "SubmitButton",
      "props": { "text": "Sign In" },
      "className": "w-full bg-primary text-primary-foreground rounded-md py-2 font-medium",
      "styles": {},
      "children": [],
      "events": {}
    }
  ],
  "events": {}
}

IMPORTANT RULES:
- Generate 25-50+ components for a RICH, COMPLETE, production-ready UI
- Think like a professional designer: every screen needs multiple sections, not just a basic layout
- Always use ONE root layout component that holds everything (Container, Flex, Grid, or Card)
- The root component's "name" must be a descriptive PascalCase identifier derived from the screen purpose, like "LoginScreen", "AnalyticsDashboard", or "PricingPage". Do NOT use generic names like "MainContainer", "Root", "Wrapper", or "Container1".
- Use deep nesting - children can have children can have children (3-5 levels deep minimum)
- Create visual hierarchy with varying font sizes, weights, and colors
- Use Cards to create depth and separate content sections
- Add Badges for status indicators, labels, and tags
- Include Icons where appropriate (use props.icon with icon names like "star", "check", "arrow-right", "user", "settings", "bell", "search", "heart", "mail", "phone", "globe", "calendar", "clock", "shield", "zap", "trending-up")

BUILDER SCHEMA (FOLLOW EXACTLY):
- Every node MUST be an object with exactly these keys:
  type, name, props, styles, children, events
  You MAY also include className (TailwindCSS v4). Do NOT include id or parentId.
- children MUST always be an array (use [] if none).
- props MUST be an object (use {} if none).
- styles MUST be an object (use {} if none). Prefer className for styling.

SUPPORTED COMPONENT TYPES (do not invent new ones):
- Layout: Page, Container, Flex, Grid, Card, Stack, Divider
- Form: Button, Input, Textarea, Select, Checkbox, Radio, Switch, Label, Form
- Display: Text, Heading, Image, Badge, Avatar, Icon
- Feedback: Alert, Dialog, Toast, Progress, Spinner, Skeleton
- Navigation: Tabs, Breadcrumb, Pagination, Menu
- Data: Table, List, DataGrid

ALLOWED PROPS (do not invent new prop keys):
- Common: text, placeholder, disabled, variant (default|destructive|outline|secondary|ghost|link), size (default|sm|lg|icon)
- Form: type, value, checked, required, min, max, step
- Image/Avatar: src, alt
- Badge: badgeVariant (default|secondary|destructive|outline)
- Alert: alertVariant (default|destructive), title, description
- Progress: progressValue
- Heading: level (1-6)
- Icon: icon (string)

- Do NOT invent new component types. Only use existing toolbox primitives:
  - Layout: Container, Flex, Grid, Card, Stack, Divider
  - Form: Button, Input, Textarea, Select, Checkbox, Radio, Switch, Label, Form
  - Display: Text, Heading, Image, Badge, Avatar, Icon
  - Feedback: Alert, Dialog, Toast, Progress, Spinner, Skeleton
  - Navigation: Tabs, Breadcrumb, Pagination, Menu
  - Data: Table, List, DataGrid
- For Text/Heading/Label/Badge: add props.text with COMPELLING, REALISTIC content:
  - Headlines should be punchy and benefit-focused ("Ship faster with AI-powered workflows")
  - Subheadlines should expand on the value proposition
  - Feature descriptions should be specific and concrete
  - Stats should use realistic numbers ("10,000+ customers", "99.9% uptime", "50% faster")
  - Testimonials should sound authentic with names and titles
  - NO generic placeholder text like "Lorem ipsum" or "Description here"
- For Button: add props.text with action-oriented labels ("Get Started Free", "See Pricing", "Book a Demo", "Try it Now")
- For Input/Textarea/Select: add props.placeholder with helpful, specific hints ("Enter your work email", "Describe your project...")
- For Image: use contextual placeholder images:
  - For hero images: props.src="https://placehold.co/800x500/1a1a2e/eaeaea?text=Product+Preview"
  - For avatars: props.src="https://placehold.co/100x100/6366f1/ffffff?text=JD"
  - For feature images: props.src="https://placehold.co/400x300/0f172a/94a3b8?text=Feature"
  - For logos: props.src="https://placehold.co/120x40/transparent/666?text=Logo"
  - Always include descriptive props.alt
- When generating login/authentication UIs:
  - Inputs for email/password should look like real fields with borders, padding, and clear placeholders (not just plain text).
  - The primary submit Button should look like a clear call to action, with a solid background color and readable text.
  - Social login Buttons (e.g. "Sign in with Google", "Sign in with Facebook") should visually look like buttons and use brand-like color schemes (Google: light surface with blue text; Facebook: blue background with white text).
- Never represent interactive form fields as Text components. For any editable user input (email, password, username, name, etc.), ALWAYS use type: "Input" (or "Textarea" where appropriate), not "Text".
- Use Flex with flexDirection: "column" for vertical groups, "row" for horizontal groups
- Add visual polish: borderRadius, backgroundColor, proper font sizes
- Each component MUST have exactly: type, name, props, styles, children, events

CRITICAL: USE TAILWINDCSS v4 CLASSES FOR ALL STYLING

Instead of inline styles object, use a "className" property with TailwindCSS v4 utility classes.
The "styles" object should be empty {} or contain only dynamic values that can't be expressed as Tailwind classes.

TAILWINDCSS v4 CLASS GUIDELINES:

LAYOUT:
  - Flexbox: flex, flex-col, flex-row, items-center, justify-center, justify-between, gap-1, gap-2, gap-4, gap-6, gap-8
  - Grid: grid, grid-cols-2, grid-cols-3, grid-cols-4, place-items-center
  - Sizing: w-full, w-1/2, w-auto, h-full, h-auto, max-w-md, max-w-lg, max-w-xl, max-w-2xl, min-h-screen

SPACING:
  - Padding: p-1, p-2, p-4, p-6, p-8, px-4, py-2, pt-4, pb-4, pl-4, pr-4
  - Margin: m-1, m-2, m-4, m-auto, mx-auto, my-4, mt-4, mb-4, ml-4, mr-4

COLORS (use CSS variables with arbitrary values):
  - Background: bg-background, bg-card, bg-primary, bg-secondary, bg-muted, bg-accent, bg-destructive
  - Text: text-foreground, text-muted-foreground, text-primary, text-secondary-foreground, text-accent-foreground
  - Border: border-border, border-input, border-primary

TYPOGRAPHY:
  - Size: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl
  - Weight: font-light, font-normal, font-medium, font-semibold, font-bold, font-extrabold
  - Style: italic, underline, line-through, uppercase, lowercase, capitalize

BORDERS & EFFECTS:
  - Radius: rounded-none, rounded-sm, rounded, rounded-md, rounded-lg, rounded-xl, rounded-full
  - Border: border, border-2, border-0
  - Shadow: shadow-sm, shadow, shadow-md, shadow-lg, shadow-xl

COMPONENT STRUCTURE with className:
{
  "type": "Flex",
  "name": "LoginContainer",
  "props": {},
  "className": "flex flex-col gap-4 p-6 bg-card rounded-lg w-full max-w-md",
  "styles": {},
  "children": [...],
  "events": {}
}

EXAMPLES OF COMPLETE, MODERN DESIGNS:

LANDING PAGE structure (minimum 30+ components):
- Root Flex (column) >
  - Nav Bar (Flex row): Logo Image + Nav Links (Flex) + CTA Button
  - Hero Section (Flex): Headline Heading + Subheadline Text + CTA Buttons (Flex row) + Hero Image
  - Logos Section: "Trusted by" Text + Logo Row (Flex row with 4-5 logo Images)
  - Features Section: Section Heading + Features Grid (3-4 Cards each with Icon + Title + Description)
  - Testimonials Section: Section Heading + Testimonial Cards (Avatar + Quote Text + Name + Title)
  - Pricing Section: Section Heading + Pricing Cards (3 tiers with features lists)
  - CTA Section: Headline + Subtext + Email Input + Button
  - Footer: Logo + Link Columns + Social Icons + Copyright Text

DASHBOARD structure (minimum 35+ components):
- Root Flex (row) >
  - Sidebar (Flex column): Logo + Nav Items (each with Icon + Text) + User Profile
  - Main Content (Flex column):
    - Header (Flex row): Page Title + Search Input + Notification Icon + Avatar
    - Stats Row (Flex row): 4 Stat Cards (each with Icon + Label + Value + Trend Badge)
    - Charts Section (Flex row): 2 Chart Cards with titles and placeholder visuals
    - Table Section: Card with Table Header + Data rows
    - Recent Activity: Card with Activity List items

ALWAYS create COMPLETE screens, not partial layouts. Users should feel like they're looking at a real app.

Generate the COMPLETE JSON structure with DEEP NESTING now:`,
        });
        text = retry.text;
      } else {
        throw err;
      }
    }

    console.log('Raw API response:', text);

    // Parse the JSON response - try multiple strategies
    let component;

    // Strategy 1: Direct parse if it's already clean JSON
    try {
      component = JSON.parse(text);
    } catch {
      // Strategy 2: Extract JSON from markdown code blocks
      const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (codeBlockMatch) {
        component = JSON.parse(codeBlockMatch[1]);
      } else {
        // Strategy 3: Find first JSON object
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          component = JSON.parse(jsonMatch[0]);
        } else {
          console.error('Failed to extract JSON from:', text);
          throw new Error('No valid JSON found in response');
        }
      }
    }

    console.log('Parsed component:', JSON.stringify(component, null, 2));

    return NextResponse.json(
      { component },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      },
    );
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate component' },
      { status: 500 },
    );
  }
}
