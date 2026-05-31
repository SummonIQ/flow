export type ComponentType =
  // Layout
  | "Page"
  | "Container"
  | "Flex"
  | "Grid"
  | "Card"
  | "Stack"
  | "Divider"
  // Form Elements
  | "Button"
  | "Input"
  | "Textarea"
  | "Select"
  | "Checkbox"
  | "Radio"
  | "Switch"
  | "Label"
  | "Form"
  // Display
  | "Text"
  | "Heading"
  | "Image"
  | "Badge"
  | "Avatar"
  | "Icon"
  // Feedback
  | "Alert"
  | "Dialog"
  | "Toast"
  | "Progress"
  | "Spinner"
  | "Skeleton"
  // Navigation
  | "Tabs"
  | "Breadcrumb"
  | "Pagination"
  | "Menu"
  // Data Display
  | "Table"
  | "List"
  | "DataGrid";

export type LayoutDirection = "horizontal" | "vertical";
export type AlignItems = "start" | "center" | "end" | "stretch";
export type JustifyContent =
  | "start"
  | "center"
  | "end"
  | "space-between"
  | "space-around"
  | "space-evenly"
  | "stretch";

export interface ComponentStyles {
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  color?: string;
  opacity?: string;
  border?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string;
  borderRadius?: string;
  boxShadow?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textDecoration?: string;
  textTransform?: string;
  textAlign?: "left" | "center" | "right";
  whiteSpace?: string;
  display?: string;
  flexDirection?: "row" | "column";
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
  alignContent?: AlignItems | "space-between" | "space-around" | "space-evenly";
  gap?: string;
  columnGap?: string;
  rowGap?: string;
  flex?: string;
  flexGrow?: string;
  flexShrink?: string;
  flexBasis?: string;
  alignSelf?: AlignItems | "auto";
  justifySelf?: JustifyContent | "auto";
  order?: number;

  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridAutoFlow?: string;
  gridAutoColumns?: string;
  gridAutoRows?: string;
  justifyItems?: AlignItems;
  placeItems?: string;
  placeContent?: string;

  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  position?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  zIndex?: number;
  overflow?: "visible" | "hidden" | "scroll" | "auto";
  overflowX?: "visible" | "hidden" | "scroll" | "auto";
  overflowY?: "visible" | "hidden" | "scroll" | "auto";
  cursor?: string;
  pointerEvents?: "auto" | "none";
  userSelect?: string;
  transform?: string;
}

export type VariablePrimitiveType = "string" | "number" | "boolean";

export interface Variable {
  id: string;
  name: string;
  type: VariablePrimitiveType;
  value?: string | number | boolean;
}

// State is reactive - changes trigger UI updates
export interface StateVariable {
  id: string;
  name: string;
  type: VariablePrimitiveType;
  defaultValue?: string | number | boolean;
  currentValue?: string | number | boolean;
}

// Custom functions that can be called from event handlers
export interface CustomFunction {
  id: string;
  name: string;
  description?: string;
  parameters?: string; // e.g., "value: string, count: number"
  returnType?: string; // e.g., "string", "number", "void"
  body: string; // JavaScript code
}

export type EventActionType = "code" | "workflow" | "setVariable" | "aiCode";

export interface EventAction {
  id: string;
  type: EventActionType;
  code?: string; // JavaScript/TypeScript code
  workflow?: WorkflowNode[]; // Visual workflow nodes
  name?: string;
  // For setVariable actions
  variableId?: string;
  variableName?: string;
  variableValue?: string | number | boolean;
  // For AI-assisted handlers
  aiPrompt?: string;
}

export interface WorkflowNode {
  id: string;
  type: "action" | "condition" | "loop" | "api" | "state" | "navigation";
  label: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  connections: string[]; // IDs of connected nodes
}

export type EventType =
  | "onClick"
  | "onDoubleClick"
  | "onChange"
  | "onSubmit"
  | "onFocus"
  | "onBlur"
  | "onMouseEnter"
  | "onMouseLeave"
  | "onKeyDown"
  | "onKeyUp"
  | "onLoad";

export interface ComponentEvents {
  [key: string]: EventAction | undefined;
}

export interface ComponentProps {
  // Common
  text?: string;
  placeholder?: string;
  disabled?: boolean;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";

  // Form
  type?: string;
  value?: string;
  checked?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;

  // Image/Avatar
  src?: string;
  alt?: string;

  // Badge
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";

  // Alert
  alertVariant?: "default" | "destructive";
  title?: string;
  description?: string;

  // Progress
  progressValue?: number;

  // Heading
  level?: 1 | 2 | 3 | 4 | 5 | 6;

  // Icon
  icon?: string;
}

export interface BuilderComponent {
  id: string;
  type: ComponentType;
  name: string;
  props: ComponentProps;
  styles: ComponentStyles;
  className?: string;
  events: ComponentEvents;
  children: BuilderComponent[];
  parentId: string | null;
}

export type ProjectType = "react" | "html";

export type PageType = "page" | "form";

export interface Page {
  id: string;
  name: string;
  type: PageType;
  route?: string;
  components: Record<string, BuilderComponent>;
  rootId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  description?: string;
  pages: Record<string, Page>;
  currentPageId: string | null;
  createdAt: number;
  updatedAt: number;
  variables?: Variable[];
  state?: StateVariable[];
  functions?: CustomFunction[];
}

export interface BuilderState {
  project: Project | null;
  selectedId: string | null;
  selectedIds: string[];
  hoveredId: string | null;
  outlineMode: boolean;
}
