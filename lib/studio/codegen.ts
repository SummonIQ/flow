import type { BuilderComponent, Page } from "@/types/studio/builder";

const ROOT_ALIASES = new Set(["home", "index", "page"]);

const escapeText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");

const slugifySegment = (segment: string) =>
  segment
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const normalizeRoutePath = (route: string) => {
  const trimmed = route.trim();
  if (!trimmed) return "/";

  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const sanitized = normalized.replace(/\s+/g, "-");
  const collapsed = sanitized.replace(/\/{2,}/g, "/");
  if (collapsed !== "/" && collapsed.endsWith("/")) {
    return collapsed.replace(/\/+$/, "");
  }
  return collapsed;
};

export const toRoutePath = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return "/";

  const segments = trimmed.replace(/\\/g, "/").split("/").filter(Boolean);
  const slugSegments = segments.map((segment) => slugifySegment(segment));
  const filtered = slugSegments.filter(Boolean);

  if (filtered.length === 0) return "/";
  if (filtered.length === 1 && ROOT_ALIASES.has(filtered[0])) return "/";

  return normalizeRoutePath(`/${filtered.join("/")}`);
};

export const toComponentName = (name: string) => {
  const cleaned = name.replace(/[^a-zA-Z0-9]/g, " ");
  const words = cleaned.trim().split(/\s+/).filter(Boolean);
  const base = words.map((word) => word[0].toUpperCase() + word.slice(1)).join("");
  if (!base) return "AppPage";
  if (/^[A-Za-z]/.test(base)) return base;
  return `Page${base}`;
};

export const getPageRoute = (
  page?: Pick<Page, "name" | "route"> | null
) => {
  if (!page) return "/";
  const rawRoute = page.route?.trim();
  if (rawRoute) {
    return normalizeRoutePath(rawRoute);
  }
  return toRoutePath(page.name);
};

const formatStyleObject = (component: BuilderComponent, indent: number) => {
  const indentation = "  ".repeat(indent);
  return JSON.stringify(component.styles ?? {}, null, 2)
    .split("\n")
    .map((line, index) => (index === 0 ? line : `${indentation}  ${line}`))
    .join("\n");
};

const renderComponent = (
  component: BuilderComponent,
  indent = 0
): string => {
  const indentation = "  ".repeat(indent);
  const styleString = formatStyleObject(component, indent);
  const className = component.className
    ? ` className="${escapeText(component.className)}"`
    : "";
  const classNameLine = component.className
    ? `${indentation}  className="${escapeText(component.className)}"\n`
    : "";

  const renderChildren = (childIndent: number) => {
    if (!component.children?.length) return "";
    return (
      "\n" +
      component.children
        .map((child) => renderComponent(child, childIndent))
        .join("\n") +
      "\n" +
      indentation
    );
  };

  switch (component.type) {
    case "Button": {
      const text = escapeText(component.props.text ?? "Button");
      return `${indentation}<button style={${styleString}}${className}>\n${indentation}  ${text}\n${indentation}</button>`;
    }
    case "Text": {
      const text = escapeText(component.props.text ?? "Text");
      return `${indentation}<p style={${styleString}}${className}>\n${indentation}  ${text}\n${indentation}</p>`;
    }
    case "Heading": {
      const text = escapeText(component.props.text ?? "Heading");
      return `${indentation}<h2 style={${styleString}}${className}>\n${indentation}  ${text}\n${indentation}</h2>`;
    }
    case "Input":
      return `${indentation}<input\n${indentation}  type="${escapeText(
        component.props.type ?? "text"
      )}"\n${
        component.props.placeholder
          ? `${indentation}  placeholder="${escapeText(
              component.props.placeholder
            )}"\n`
          : ""
      }${indentation}  style={${styleString}}\n${classNameLine}${indentation}/>`;
    case "Textarea": {
      const placeholder = component.props.placeholder
        ? ` placeholder="${escapeText(component.props.placeholder)}"`
        : "";
      return `${indentation}<textarea style={${styleString}}${placeholder}${className} />`;
    }
    case "Select":
      return `${indentation}<select style={${styleString}}${className}>\n${indentation}  <option>Select...</option>\n${indentation}</select>`;
    case "Checkbox": {
      const label = escapeText(component.props.text ?? "Checkbox");
      const checked = component.props.checked ? " defaultChecked" : "";
      return `${indentation}<label style={${styleString}}${className}>\n${indentation}  <input type="checkbox"${checked} /> ${label}\n${indentation}</label>`;
    }
    case "Radio": {
      const label = escapeText(component.props.text ?? "Radio");
      return `${indentation}<label style={${styleString}}${className}>\n${indentation}  <input type="radio" /> ${label}\n${indentation}</label>`;
    }
    case "Image":
      if (!component.props.src) {
        return `${indentation}<div style={${styleString}}${className}>\n${indentation}  {/* Missing image src */}\n${indentation}</div>`;
      }
      return `${indentation}<img\n${indentation}  src="${escapeText(
        component.props.src
      )}"\n${indentation}  alt="${escapeText(
        component.props.alt ?? "Image"
      )}"\n${indentation}  style={${styleString}}\n${classNameLine}${indentation}/>`;
    case "Divider":
      return `${indentation}<hr style={${styleString}}${className} />`;
    case "Alert": {
      const title = escapeText(component.props.title ?? "Alert");
      const description = escapeText(component.props.description ?? "");
      return `${indentation}<div role="alert" style={${styleString}}${className}>\n${indentation}  <strong>${title}</strong>\n${
        description ? `${indentation}  <p>${description}</p>\n` : ""
      }${indentation}</div>`;
    }
    case "Badge": {
      const text = escapeText(component.props.text ?? "Badge");
      return `${indentation}<span style={${styleString}}${className}>${text}</span>`;
    }
    case "Page":
    case "Container":
    case "Flex":
    case "Grid":
    case "Card":
    case "Stack":
    case "Form":
    case "List":
    case "Table":
    case "DataGrid": {
      const tag = component.type === "Form" ? "form" : "div";
      return `${indentation}<${tag} style={${styleString}}${className}>${renderChildren(
        indent + 1
      )}</${tag}>`;
    }
    default:
      return `${indentation}<div style={${styleString}}${className}>${component.type}</div>`;
  }
};

export const generateReactPageCode = (
  page: Page | null,
  rootComponent: BuilderComponent | null
) => {
  const componentName = toComponentName(page?.name ?? "AppPage");

  if (!rootComponent) {
    return `'use client';\n\nexport default function ${componentName}() {\n  return (\n    <div>\n      {/* Add components to see generated code */}\n    </div>\n  );\n}\n`;
  }

  const body = renderComponent(rootComponent, 2)
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");

  return `'use client';\n\nexport default function ${componentName}() {\n  return (\n${body}\n  );\n}\n`;
};
