'use client';

import {
  Page,
  PageHeader,
} from '@/components/ui/page-layout';

import {
  Badge,
  Button,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@summoniq/applab-ui';
import {
  Copy,
  Download,
  Moon,
  Palette,
  Pause,
  Play,
  Sparkles,
  Sun,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  type Connection,
  ConnectionMode,
  Controls,
  type Edge,
  EdgeLabelRenderer,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

type AssetNodeKind = 'factory' | 'warehouse' | 'truck' | 'store';

interface AssetNodeData {
  kind: AssetNodeKind;
  label: string;
}

type EdgeWaypoint = { x: number; y: number };

type AssetEdgeData = {
  waypoints?: EdgeWaypoint[];
};

type AssetDesignerSceneNode = {
  id: string;
  kind: AssetNodeKind;
  label: string;
  position: { x: number; y: number };
};

type AssetDesignerSceneEdge = {
  id?: string;
  source: string;
  target: string;
};

type AssetDesignerScene = {
  nodes: AssetDesignerSceneNode[];
  edges: AssetDesignerSceneEdge[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isAssetNodeKind(value: unknown): value is AssetNodeKind {
  return (
    value === 'factory' ||
    value === 'warehouse' ||
    value === 'truck' ||
    value === 'store'
  );
}

function parseAssetDesignerScene(value: unknown): AssetDesignerScene | null {
  if (!isRecord(value)) return null;
  const nodesValue = value.nodes;
  const edgesValue = value.edges;
  if (!Array.isArray(nodesValue) || !Array.isArray(edgesValue)) return null;

  const nodes: AssetDesignerSceneNode[] = [];
  for (const n of nodesValue) {
    if (!isRecord(n)) continue;
    const id = n.id;
    const kind = n.kind;
    const label = n.label;
    const position = n.position;
    if (typeof id !== 'string' || !id) continue;
    if (!isAssetNodeKind(kind)) continue;
    if (typeof label !== 'string' || !label) continue;
    if (!isRecord(position)) continue;
    const x = position.x;
    const y = position.y;
    if (!isNumber(x) || !isNumber(y)) continue;
    nodes.push({ id, kind, label, position: { x, y } });
  }

  const edges: AssetDesignerSceneEdge[] = [];
  for (const e of edgesValue) {
    if (!isRecord(e)) continue;
    const source = e.source;
    const target = e.target;
    if (typeof source !== 'string' || !source) continue;
    if (typeof target !== 'string' || !target) continue;
    const id = typeof e.id === 'string' && e.id ? e.id : undefined;
    edges.push({ id, source, target });
  }

  if (nodes.length === 0) return null;
  return { nodes, edges };
}

function AssetNode({ data }: NodeProps<AssetNodeData>) {
  const badgeVariant =
    data.kind === 'factory'
      ? 'secondary'
      : data.kind === 'warehouse'
        ? 'outline'
        : data.kind === 'truck'
          ? 'default'
          : 'secondary';

  return (
    <div className="min-w-[160px] rounded-lg border border-border bg-background px-3 py-2 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="truncate text-sm font-medium">{data.label}</div>
        <Badge variant={badgeVariant} className="shrink-0 capitalize">
          {data.kind}
        </Badge>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        Isometric: pending
      </div>
    </div>
  );
}

const nodeTypes = {
  asset: AssetNode,
};

const defaultNodes: Node<AssetNodeData>[] = [
  {
    id: 'factory-core',
    type: 'asset',
    position: { x: 60, y: 110 },
    data: { kind: 'factory', label: 'Core Plant' },
  },
  {
    id: 'factory-tower',
    type: 'asset',
    position: { x: 120, y: 10 },
    data: { kind: 'factory', label: 'Tower' },
  },
  {
    id: 'warehouse-hub',
    type: 'asset',
    position: { x: 360, y: 170 },
    data: { kind: 'warehouse', label: 'Distribution Hub' },
  },
  {
    id: 'warehouse-plant',
    type: 'asset',
    position: { x: 440, y: 40 },
    data: { kind: 'warehouse', label: 'Processing' },
  },
  {
    id: 'store-output',
    type: 'asset',
    position: { x: 740, y: 120 },
    data: { kind: 'store', label: 'Output' },
  },
  {
    id: 'store-city',
    type: 'asset',
    position: { x: 170, y: 300 },
    data: { kind: 'store', label: 'City Node' },
  },
  {
    id: 'truck-a',
    type: 'asset',
    position: { x: 560, y: 280 },
    data: { kind: 'truck', label: 'Carrier A' },
  },
  {
    id: 'truck-b',
    type: 'asset',
    position: { x: 640, y: 360 },
    data: { kind: 'truck', label: 'Carrier B' },
  },
  {
    id: 'warehouse-yard',
    type: 'asset',
    position: { x: 520, y: 200 },
    data: { kind: 'warehouse', label: 'Yard' },
  },
];

const defaultEdges: Edge<AssetEdgeData>[] = [
  {
    id: 'pipe-1',
    source: 'factory-tower',
    target: 'factory-core',
    animated: true,
    type: 'smoothstep',
  },
  {
    id: 'pipe-2',
    source: 'factory-core',
    target: 'warehouse-hub',
    animated: true,
    type: 'smoothstep',
  },
  {
    id: 'pipe-3',
    source: 'factory-tower',
    target: 'warehouse-plant',
    animated: true,
    type: 'smoothstep',
  },
  {
    id: 'pipe-4',
    source: 'warehouse-plant',
    target: 'warehouse-hub',
    animated: true,
    type: 'smoothstep',
  },
  {
    id: 'pipe-5',
    source: 'warehouse-hub',
    target: 'warehouse-yard',
    animated: true,
    type: 'smoothstep',
  },
  {
    id: 'pipe-6',
    source: 'warehouse-yard',
    target: 'store-output',
    animated: true,
    type: 'smoothstep',
  },
  {
    id: 'pipe-7',
    source: 'warehouse-hub',
    target: 'store-city',
    animated: true,
    type: 'smoothstep',
  },
  {
    id: 'pipe-8',
    source: 'warehouse-yard',
    target: 'truck-a',
    animated: true,
    type: 'smoothstep',
  },
  {
    id: 'pipe-9',
    source: 'truck-a',
    target: 'store-output',
    animated: true,
    type: 'smoothstep',
  },
  {
    id: 'pipe-10',
    source: 'truck-b',
    target: 'store-city',
    animated: true,
    type: 'smoothstep',
  },
];

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2)}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function stableSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededFloat01(seed: number) {
  const next = Math.imul(seed ^ 0x9e3779b9, 1664525) + 1013904223;
  return ((next >>> 0) % 10000) / 10000;
}

function isoBoxPoints({
  x,
  y,
  w,
  d,
  h,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
}) {
  const top = `${x},${y - h} ${x + w},${y - h - w * 0.5} ${x + w + d},${y - h - w * 0.5 + d * 0.5} ${x + d},${y - h + d * 0.5}`;
  const left = `${x},${y - h} ${x + d},${y - h + d * 0.5} ${x + d},${y + d * 0.5} ${x},${y}`;
  const right = `${x + w},${y - h - w * 0.5} ${x + w + d},${y - h - w * 0.5 + d * 0.5} ${x + w + d},${y + d * 0.5} ${x + w},${y - w * 0.5}`;
  const front = `${x},${y} ${x + w},${y - w * 0.5} ${x + w + d},${y - w * 0.5 + d * 0.5} ${x + d},${y + d * 0.5}`;
  return { top, left, right, front };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpPoint(
  a: { x: number; y: number },
  b: { x: number; y: number },
  t: number,
) {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

function isoProject(point: { x: number; y: number }, scale = 1) {
  const x = point.x * scale;
  const y = point.y * scale;
  return {
    x: x - y,
    y: (x + y) * 0.5,
  };
}

function nodeCenter(node: Node<AssetNodeData>) {
  return {
    x: node.position.x + 80,
    y: node.position.y + 28,
  };
}

function kindColors(kind: AssetNodeKind) {
  if (kind === 'factory') {
    return {
      top: '#ffffff',
      left: '#f8fafc',
      right: '#e2e8f0',
    };
  }
  if (kind === 'warehouse') {
    return {
      top: '#ffffff',
      left: '#f1f5f9',
      right: '#dbeafe',
    };
  }
  if (kind === 'truck') {
    return {
      top: '#ffffff',
      left: '#f8fafc',
      right: '#e5e7eb',
    };
  }
  return {
    top: '#ffffff',
    left: '#f8fafc',
    right: '#fee2e2',
  };
}

function IsometricBlock({
  x,
  y,
  id,
  label,
  kind,
  mode = 'light',
}: {
  x: number;
  y: number;
  id: string;
  label: string;
  kind: AssetNodeKind;
  mode?: 'light' | 'dark';
}) {
  const isDark = mode === 'dark';
  const w = kind === 'truck' ? 86 : 72;
  const d = kind === 'truck' ? 36 : 44;
  const h = kind === 'truck' ? 18 : 34;
  const c = kindColors(kind);
  const shadowFill = isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(2, 6, 23, 0.10)';
  const stroke = 'rgba(2, 6, 23, 0.14)';
  const crease = 'rgba(2, 6, 23, 0.10)';
  const windowFill = 'rgba(2, 6, 23, 0.07)';
  const labelFill = isDark
    ? 'rgba(226, 232, 240, 0.72)'
    : 'rgba(2, 6, 23, 0.55)';
  const gradTopId = `iso-top-${id}`;
  const gradLeftId = `iso-left-${id}`;
  const gradRightId = `iso-right-${id}`;

  const seed = stableSeed(id);
  const v1 = seededFloat01(seed);
  const v2 = seededFloat01(seed ^ 0xa5a5a5a5);
  const v3 = seededFloat01(seed ^ 0x5a5a5a5a);

  const base = isoBoxPoints({ x, y, w, d, h });

  const topA = { x, y: y - h };
  const topB = { x: x + w, y: y - h - w * 0.5 };
  const topC = { x: x + w + d, y: y - h - w * 0.5 + d * 0.5 };
  const topD = { x: x + d, y: y - h + d * 0.5 };

  const roofInset = 10;
  const roof = `${x + roofInset},${y - h - roofInset * 0.35} ${x + w - roofInset},${y - h - w * 0.5 - roofInset * 0.35} ${x + w + d - roofInset},${y - h - w * 0.5 + d * 0.5 - roofInset * 0.15} ${x + d + roofInset},${y - h + d * 0.5 - roofInset * 0.15}`;

  const chimneyX = x + w * 0.62;
  const chimneyY = y - h - w * 0.28;
  const cw = kind === 'factory' ? 14 : 0;
  const cd = kind === 'factory' ? 10 : 0;
  const ch = kind === 'factory' ? 22 : 0;

  const chimneyTop = `${chimneyX},${chimneyY - ch} ${chimneyX + cw},${chimneyY - ch - cw * 0.5} ${chimneyX + cw + cd},${chimneyY - ch - cw * 0.5 + cd * 0.5} ${chimneyX + cd},${chimneyY - ch + cd * 0.5}`;
  const chimneyLeft = `${chimneyX},${chimneyY - ch} ${chimneyX + cd},${chimneyY - ch + cd * 0.5} ${chimneyX + cd},${chimneyY + cd * 0.5} ${chimneyX},${chimneyY}`;
  const chimneyRight = `${chimneyX + cw},${chimneyY - ch - cw * 0.5} ${chimneyX + cw + cd},${chimneyY - ch - cw * 0.5 + cd * 0.5} ${chimneyX + cw + cd},${chimneyY + cd * 0.5} ${chimneyX + cw},${chimneyY - cw * 0.5}`;

  const frontA = { x, y };
  const frontB = { x: x + w, y: y - w * 0.5 };
  const frontC = { x: x + w + d, y: y - w * 0.5 + d * 0.5 };
  const frontD = { x: x + d, y: y + d * 0.5 };

  const quad = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    c2: { x: number; y: number },
    d2: { x: number; y: number },
  ) => `${a.x},${a.y} ${b.x},${b.y} ${c2.x},${c2.y} ${d2.x},${d2.y}`;

  const roofLines: string[] = [];
  if (kind !== 'truck') {
    const count = kind === 'warehouse' ? 6 : kind === 'factory' ? 5 : 4;
    for (let i = 1; i < count; i += 1) {
      const u = i / count;
      const a = lerpPoint(topA, topB, u);
      const b = lerpPoint(topD, topC, u);
      roofLines.push(`M ${a.x} ${a.y} L ${b.x} ${b.y}`);
    }
  }

  const windowsRight: string[] = [];
  const windowsLeft: string[] = [];
  if (kind !== 'truck') {
    const cols = kind === 'factory' ? 4 : kind === 'store' ? 3 : 3;
    const rows = kind === 'factory' ? 3 : kind === 'store' ? 2 : 2;
    const padU = kind === 'warehouse' ? 0.14 : 0.12;
    const padV = kind === 'warehouse' ? 0.26 : 0.18;
    const gapU = 0.06;
    const gapV = 0.08;

    for (let r = 0; r < rows; r += 1) {
      for (let c0 = 0; c0 < cols; c0 += 1) {
        const u0 = padU + (c0 / cols) * (1 - padU * 2) + gapU * 0.5;
        const u1 = padU + ((c0 + 1) / cols) * (1 - padU * 2) - gapU * 0.5;
        const v0 = padV + (r / rows) * (1 - padV * 2) + gapV * 0.5;
        const v1 = padV + ((r + 1) / rows) * (1 - padV * 2) - gapV * 0.5;

        const rt0 = lerpPoint(topB, topC, u0);
        const rt1 = lerpPoint(topB, topC, u1);
        const rb0 = lerpPoint(frontB, frontC, u0);
        const rb1 = lerpPoint(frontB, frontC, u1);

        const p00 = lerpPoint(rt0, rb0, v0);
        const p10 = lerpPoint(rt1, rb1, v0);
        const p11 = lerpPoint(rt1, rb1, v1);
        const p01 = lerpPoint(rt0, rb0, v1);
        windowsRight.push(quad(p00, p10, p11, p01));

        if (kind !== 'warehouse') {
          const lt0 = lerpPoint(topA, topD, u0);
          const lt1 = lerpPoint(topA, topD, u1);
          const lb0 = lerpPoint(frontA, frontD, u0);
          const lb1 = lerpPoint(frontA, frontD, u1);
          const q00 = lerpPoint(lt0, lb0, v0);
          const q10 = lerpPoint(lt1, lb1, v0);
          const q11 = lerpPoint(lt1, lb1, v1);
          const q01 = lerpPoint(lt0, lb0, v1);
          windowsLeft.push(quad(q00, q10, q11, q01));
        }
      }
    }
  }

  const doorCount = kind === 'warehouse' ? (v1 > 0.5 ? 3 : 2) : 0;
  const doorTops: string[] = [];
  if (doorCount > 0) {
    for (let i = 0; i < doorCount; i += 1) {
      const t0 = 0.14 + i * (0.62 / doorCount);
      const t1 = t0 + 0.16;
      const b0 = lerpPoint(frontA, frontB, t0);
      const b1 = lerpPoint(frontA, frontB, t1);
      const tA = lerpPoint(frontD, frontC, t0);
      const tB = lerpPoint(frontD, frontC, t1);
      const inset = 0.16;
      const p0 = lerpPoint(b0, tA, inset);
      const p1 = lerpPoint(b1, tB, inset);
      const p2 = lerpPoint(b1, tB, 0.92);
      const p3 = lerpPoint(b0, tA, 0.92);
      doorTops.push(
        `${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`,
      );
    }
  }

  const awning = (() => {
    if (kind !== 'store') return null;
    const t0 = 0.18;
    const t1 = 0.78;
    const b0 = lerpPoint(frontA, frontB, t0);
    const b1 = lerpPoint(frontA, frontB, t1);
    const tA = lerpPoint(frontD, frontC, t0);
    const tB = lerpPoint(frontD, frontC, t1);
    const p0 = lerpPoint(b0, tA, 0.62);
    const p1 = lerpPoint(b1, tB, 0.62);
    const out = 10 + v2 * 6;
    const q0 = { x: p0.x + out, y: p0.y + out * 0.5 };
    const q1 = { x: p1.x + out, y: p1.y + out * 0.5 };
    return `${p0.x},${p0.y} ${p1.x},${p1.y} ${q1.x},${q1.y} ${q0.x},${q0.y}`;
  })();

  const sign = (() => {
    if (kind !== 'store') return null;
    const sx = x + w * (0.2 + v3 * 0.25);
    const sy = y - h - w * 0.28;
    const sw = 26;
    const sd = 12;
    const sh = 12;
    const b = isoBoxPoints({ x: sx, y: sy, w: sw, d: sd, h: sh });
    return b;
  })();

  const hvac = (() => {
    if (kind !== 'warehouse') return null;
    const hx = x + w * (0.18 + v2 * 0.28);
    const hy = y - h - w * 0.22;
    const hw = 20;
    const hd = 12;
    const hh = 10;
    return isoBoxPoints({ x: hx, y: hy, w: hw, d: hd, h: hh });
  })();

  const truckParts = (() => {
    if (kind !== 'truck') return null;
    const trailer = isoBoxPoints({ x, y, w: 62, d: 28, h: 16 });
    const cabX = x - 16;
    const cabY = y + 2;
    const cab = isoBoxPoints({ x: cabX, y: cabY, w: 20, d: 16, h: 14 });
    const wheelA = { x: x + 8, y: y + d * 0.5 + 10 };
    const wheelB = { x: x + 28, y: y + d * 0.5 + 0 };
    const wheelC = { x: x + 48, y: y + d * 0.5 - 10 };
    const wheelD = { x: cabX + 10, y: cabY + 14 };
    return { trailer, cab, wheelA, wheelB, wheelC, wheelD };
  })();

  return (
    <g>
      {kind === 'truck' && truckParts ? (
        <g>
          <polygon points={truckParts.trailer.front} fill="rgba(0,0,0,0.04)" />
          <polygon points={truckParts.trailer.left} fill="#f8fafc" />
          <polygon points={truckParts.trailer.right} fill="#e5e7eb" />
          <polygon points={truckParts.trailer.top} fill="#ffffff" />
          <polygon points={truckParts.cab.front} fill="rgba(0,0,0,0.05)" />
          <polygon points={truckParts.cab.left} fill="#f1f5f9" />
          <polygon points={truckParts.cab.right} fill="#e2e8f0" />
          <polygon points={truckParts.cab.top} fill="#ffffff" />
          <circle
            cx={truckParts.wheelA.x}
            cy={truckParts.wheelA.y}
            r={4.5}
            fill="rgba(2,6,23,0.38)"
          />
          <circle
            cx={truckParts.wheelB.x}
            cy={truckParts.wheelB.y}
            r={4.5}
            fill="rgba(2,6,23,0.38)"
          />
          <circle
            cx={truckParts.wheelC.x}
            cy={truckParts.wheelC.y}
            r={4.5}
            fill="rgba(2,6,23,0.38)"
          />
          <circle
            cx={truckParts.wheelD.x}
            cy={truckParts.wheelD.y}
            r={4.2}
            fill="rgba(2,6,23,0.38)"
          />
          <polygon
            points={truckParts.trailer.top}
            fill="none"
            stroke={stroke}
            strokeWidth={1}
          />
          <polygon
            points={truckParts.trailer.left}
            fill="none"
            stroke={stroke}
            strokeWidth={1}
          />
          <polygon
            points={truckParts.trailer.right}
            fill="none"
            stroke={stroke}
            strokeWidth={1}
          />
          <polygon
            points={truckParts.cab.top}
            fill="none"
            stroke={stroke}
            strokeWidth={1}
          />
          <polygon
            points={truckParts.cab.left}
            fill="none"
            stroke={stroke}
            strokeWidth={1}
          />
          <polygon
            points={truckParts.cab.right}
            fill="none"
            stroke={stroke}
            strokeWidth={1}
          />
        </g>
      ) : (
        <g>
          <defs>
            <linearGradient id={gradTopId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="62%" stopColor={c.top} stopOpacity="1" />
              <stop
                offset="100%"
                stopColor="rgba(2, 6, 23, 0.05)"
                stopOpacity="1"
              />
            </linearGradient>
            <linearGradient id={gradLeftId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.left} stopOpacity="1" />
              <stop
                offset="100%"
                stopColor="rgba(2, 6, 23, 0.05)"
                stopOpacity="1"
              />
            </linearGradient>
            <linearGradient id={gradRightId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.right} stopOpacity="1" />
              <stop
                offset="100%"
                stopColor="rgba(2, 6, 23, 0.07)"
                stopOpacity="1"
              />
            </linearGradient>
          </defs>

          <ellipse
            cx={x + w * 0.52 + d * 0.5}
            cy={y + d * 0.5 + 14}
            rx={w * 0.62}
            ry={w * 0.22}
            fill={shadowFill}
          />
          <polygon points={base.front} fill="rgba(0,0,0,0.05)" />
          <polygon points={base.left} fill={`url(#${gradLeftId})`} />
          <polygon points={base.right} fill={`url(#${gradRightId})`} />
          <polygon points={base.top} fill={`url(#${gradTopId})`} />
          <polygon points={roof} fill="rgba(255,255,255,0.16)" />
          <polygon points={base.top} fill="rgba(255,255,255,0.10)" />
          <polygon points={base.right} fill="rgba(2,6,23,0.03)" />

          <g>
            {windowsRight.map((p, i) => (
              <polygon
                key={`${id}-wr-${i}`}
                points={p}
                fill={windowFill}
                stroke="rgba(2,6,23,0.10)"
                strokeWidth={0.8}
              />
            ))}
            {windowsLeft.map((p, i) => (
              <polygon
                key={`${id}-wl-${i}`}
                points={p}
                fill={windowFill}
                stroke="rgba(2,6,23,0.10)"
                strokeWidth={0.8}
              />
            ))}
          </g>

          {roofLines.length > 0 ? (
            <g>
              {roofLines.map((d, i) => (
                <path
                  key={`${id}-roofline-${i}`}
                  d={d}
                  fill="none"
                  stroke={crease}
                  strokeWidth={1}
                  strokeLinecap="round"
                  opacity={0.8}
                />
              ))}
            </g>
          ) : null}

          <polygon
            points={roof}
            fill="none"
            stroke="rgba(2, 6, 23, 0.12)"
            strokeWidth={1}
          />

          {kind === 'warehouse' ? (
            <g>
              {doorTops.map((p, i) => (
                <polygon
                  key={`${id}-dock-${i}`}
                  points={p}
                  fill="rgba(2,6,23,0.05)"
                  stroke={stroke}
                  strokeWidth={1}
                />
              ))}
            </g>
          ) : null}

          {kind === 'store' && awning ? (
            <polygon
              points={awning}
              fill="rgba(251, 113, 133, 0.10)"
              stroke={stroke}
              strokeWidth={1}
            />
          ) : null}

          {kind === 'store' && sign ? (
            <g>
              <polygon points={sign.front} fill="rgba(251, 113, 133, 0.12)" />
              <polygon points={sign.left} fill="rgba(251, 113, 133, 0.10)" />
              <polygon points={sign.right} fill="rgba(251, 113, 133, 0.08)" />
              <polygon points={sign.top} fill="rgba(251, 113, 133, 0.14)" />
              <polygon
                points={sign.top}
                fill="none"
                stroke={stroke}
                strokeWidth={1}
              />
              <polygon
                points={sign.left}
                fill="none"
                stroke={stroke}
                strokeWidth={1}
              />
              <polygon
                points={sign.right}
                fill="none"
                stroke={stroke}
                strokeWidth={1}
              />
            </g>
          ) : null}

          {kind === 'warehouse' && hvac ? (
            <g>
              <polygon points={hvac.left} fill="rgba(2,6,23,0.06)" />
              <polygon points={hvac.right} fill="rgba(2,6,23,0.04)" />
              <polygon points={hvac.top} fill="rgba(255,255,255,0.65)" />
              <polygon
                points={hvac.top}
                fill="none"
                stroke={stroke}
                strokeWidth={1}
              />
              <polygon
                points={hvac.left}
                fill="none"
                stroke={stroke}
                strokeWidth={1}
              />
              <polygon
                points={hvac.right}
                fill="none"
                stroke={stroke}
                strokeWidth={1}
              />
            </g>
          ) : null}

          {kind === 'factory' ? (
            <g>
              <polygon points={chimneyLeft} fill="rgba(2,6,23,0.22)" />
              <polygon points={chimneyRight} fill="rgba(2,6,23,0.16)" />
              <polygon points={chimneyTop} fill="rgba(255,255,255,0.55)" />
              <polygon
                points={chimneyTop}
                fill="none"
                stroke={stroke}
                strokeWidth={1}
              />
              <polygon
                points={base.top}
                fill="none"
                stroke={stroke}
                strokeWidth={1}
              />
              <polygon
                points={base.left}
                fill="none"
                stroke={stroke}
                strokeWidth={1}
              />
              <polygon
                points={base.right}
                fill="none"
                stroke={stroke}
                strokeWidth={1}
              />
            </g>
          ) : (
            <g>
              <polygon
                points={base.top}
                fill="none"
                stroke={stroke}
                strokeWidth={1}
              />
              <polygon
                points={base.left}
                fill="none"
                stroke={stroke}
                strokeWidth={1}
              />
              <polygon
                points={base.right}
                fill="none"
                stroke={stroke}
                strokeWidth={1}
              />
            </g>
          )}
        </g>
      )}
      <text
        x={x + w * 0.5 + d * 0.15}
        y={y - h - w * 0.25 + d * 0.2}
        textAnchor="middle"
        fontSize={11}
        fill={labelFill}
        style={{ userSelect: 'none' }}
      >
        {label}
      </text>
    </g>
  );
}

function buildIsometricSvg(
  nodes: Node<AssetNodeData>[],
  edges: Edge<AssetEdgeData>[],
  isPlaying: boolean,
) {
  const projected = nodes.map(n => {
    const center = nodeCenter(n);
    const p = isoProject(center, 1);
    return { id: n.id, kind: n.data.kind, label: n.data.label, p };
  });

  const waypointProjected = edges
    .flatMap(e => {
      const points = e.data?.waypoints;
      if (!points || points.length === 0) return [];
      return points.map(p => ({ p: isoProject(p, 1) }));
    })
    .filter(p => Boolean(p));

  const xs = projected
    .map(p => p.p.x)
    .concat(waypointProjected.map(p => p.p.x));
  const ys = projected
    .map(p => p.p.y)
    .concat(waypointProjected.map(p => p.p.y));
  const minX = xs.length ? Math.min(...xs) : 0;
  const maxX = xs.length ? Math.max(...xs) : 0;
  const minY = ys.length ? Math.min(...ys) : 0;
  const maxY = ys.length ? Math.max(...ys) : 0;

  const pad = 140;
  const width = Math.max(520, maxX - minX + pad * 2);
  const height = Math.max(360, maxY - minY + pad * 2);

  const nodeById = new Map(projected.map(p => [p.id, p] as const));

  const edgePaths = edges
    .map(e => {
      const s = nodeById.get(e.source);
      const t = nodeById.get(e.target);
      if (!s || !t) return null;

      const sx = s.p.x - minX + pad;
      const sy = s.p.y - minY + pad;
      const tx = t.p.x - minX + pad;
      const ty = t.p.y - minY + pad;

      const waypoints = e.data?.waypoints;
      const hasWaypoints = Boolean(waypoints && waypoints.length > 0);
      const d = hasWaypoints
        ? (() => {
            const pts = (waypoints || []).map(p => {
              const wp = isoProject(p, 1);
              return {
                x: wp.x - minX + pad,
                y: wp.y - minY + pad,
              };
            });
            const first = `M ${sx} ${sy}`;
            const middle = pts.map(p => `L ${p.x} ${p.y}`).join(' ');
            return `${first} ${middle} L ${tx} ${ty}`.trim();
          })()
        : (() => {
            const mx = (sx + tx) * 0.5;
            const my = (sy + ty) * 0.5 - 24;
            return `M ${sx} ${sy} Q ${mx} ${my} ${tx} ${ty}`;
          })();
      return { id: e.id, d };
    })
    .filter((p): p is { id: string; d: string } => Boolean(p));

  const blocks = projected.map(p => {
    const x = p.p.x - minX + pad;
    const y = p.p.y - minY + pad;
    return { ...p, x, y };
  });

  return {
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    blocks,
    edgePaths,
    isPlaying,
  };
}

function buildSceneFromPrompt(prompt: string): {
  nodes: Node<AssetNodeData>[];
  edges: Edge<AssetEdgeData>[];
} {
  const p = prompt.toLowerCase();
  const wantsFactory = /factory|manufactur/.test(p);
  const wantsWarehouse = /warehouse|dc|distribution/.test(p);
  const wantsStore = /store|retail|customer/.test(p);
  const wantsTruck = /truck|ship|deliver|logistics/.test(p);

  const nodes: Node<AssetNodeData>[] = [];
  const edges: Edge<AssetEdgeData>[] = [];

  const factoryId = wantsFactory ? createId('factory') : null;
  const warehouseId = wantsWarehouse ? createId('warehouse') : null;
  const storeId = wantsStore ? createId('store') : null;
  const truckId = wantsTruck ? createId('truck') : null;

  let x = 80;
  let y = 90;

  if (factoryId) {
    nodes.push({
      id: factoryId,
      type: 'asset',
      position: { x, y },
      data: { kind: 'factory', label: 'Factory' },
    });
    x += 280;
    y += 60;
  }

  if (warehouseId) {
    nodes.push({
      id: warehouseId,
      type: 'asset',
      position: { x, y },
      data: { kind: 'warehouse', label: 'Warehouse' },
    });
    x += 280;
    y += 60;
  }

  if (truckId) {
    nodes.push({
      id: truckId,
      type: 'asset',
      position: { x: x - 200, y: y + 130 },
      data: { kind: 'truck', label: 'Truck' },
    });
  }

  if (storeId) {
    nodes.push({
      id: storeId,
      type: 'asset',
      position: { x, y },
      data: { kind: 'store', label: 'Store' },
    });
  }

  const ordered = [factoryId, warehouseId, storeId].filter(
    (id): id is string => typeof id === 'string',
  );

  for (let i = 0; i < ordered.length - 1; i += 1) {
    edges.push({
      id: createId('edge'),
      source: ordered[i],
      target: ordered[i + 1],
      type: 'smoothstep',
      animated: true,
    });
  }

  if (truckId && warehouseId && storeId) {
    edges.push({
      id: createId('edge'),
      source: warehouseId,
      target: truckId,
      type: 'smoothstep',
      animated: true,
    });
    edges.push({
      id: createId('edge'),
      source: truckId,
      target: storeId,
      type: 'smoothstep',
      animated: true,
    });
  }

  return {
    nodes: nodes.length > 0 ? nodes : defaultNodes,
    edges: edges.length > 0 ? edges : defaultEdges,
  };
}

export default function AssetDesignerPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);

  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const flowWrapperRef = useRef<HTMLDivElement | null>(null);

  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [draggingWaypointIndex, setDraggingWaypointIndex] = useState<
    number | null
  >(null);
  const [isDrawConnectorMode, setIsDrawConnectorMode] = useState(false);
  const [drawSourceId, setDrawSourceId] = useState<string | null>(null);
  const [drawWaypoints, setDrawWaypoints] = useState<EdgeWaypoint[]>([]);

  const presets = useMemo(() => {
    const supply = {
      id: 'supply',
      name: 'Supply Chain Campus',
      nodes: defaultNodes,
      edges: defaultEdges,
    };

    const softwareNodes: Node<AssetNodeData>[] = [
      {
        id: 'users',
        type: 'asset',
        position: { x: 40, y: 240 },
        data: { kind: 'truck', label: 'Users' },
      },
      {
        id: 'web',
        type: 'asset',
        position: { x: 300, y: 170 },
        data: { kind: 'store', label: 'Web App' },
      },
      {
        id: 'api',
        type: 'asset',
        position: { x: 520, y: 90 },
        data: { kind: 'factory', label: 'API' },
      },
      {
        id: 'db',
        type: 'asset',
        position: { x: 760, y: 180 },
        data: { kind: 'warehouse', label: 'Database' },
      },
      {
        id: 'analytics',
        type: 'asset',
        position: { x: 540, y: 290 },
        data: { kind: 'warehouse', label: 'Analytics' },
      },
      {
        id: 'admin',
        type: 'asset',
        position: { x: 820, y: 320 },
        data: { kind: 'store', label: 'Dashboard' },
      },
    ];
    const softwareEdges: Edge<AssetEdgeData>[] = [
      {
        id: 's1',
        source: 'users',
        target: 'web',
        type: 'smoothstep',
        animated: true,
      },
      {
        id: 's2',
        source: 'web',
        target: 'api',
        type: 'smoothstep',
        animated: true,
      },
      {
        id: 's3',
        source: 'api',
        target: 'db',
        type: 'smoothstep',
        animated: true,
      },
      {
        id: 's4',
        source: 'api',
        target: 'analytics',
        type: 'smoothstep',
        animated: true,
      },
      {
        id: 's5',
        source: 'analytics',
        target: 'admin',
        type: 'smoothstep',
        animated: true,
      },
    ];
    const software = {
      id: 'software',
      name: 'Software / Dataflow',
      nodes: softwareNodes,
      edges: softwareEdges,
    };

    const healthcareNodes: Node<AssetNodeData>[] = [
      {
        id: 'patients',
        type: 'asset',
        position: { x: 40, y: 240 },
        data: { kind: 'truck', label: 'Patients' },
      },
      {
        id: 'clinic',
        type: 'asset',
        position: { x: 280, y: 160 },
        data: { kind: 'store', label: 'Clinic' },
      },
      {
        id: 'lab',
        type: 'asset',
        position: { x: 520, y: 100 },
        data: { kind: 'factory', label: 'Lab' },
      },
      {
        id: 'pharmacy',
        type: 'asset',
        position: { x: 760, y: 180 },
        data: { kind: 'warehouse', label: 'Pharmacy' },
      },
      {
        id: 'billing',
        type: 'asset',
        position: { x: 560, y: 300 },
        data: { kind: 'warehouse', label: 'Billing' },
      },
    ];
    const healthcareEdges: Edge<AssetEdgeData>[] = [
      {
        id: 'h1',
        source: 'patients',
        target: 'clinic',
        type: 'smoothstep',
        animated: true,
      },
      {
        id: 'h2',
        source: 'clinic',
        target: 'lab',
        type: 'smoothstep',
        animated: true,
      },
      {
        id: 'h3',
        source: 'lab',
        target: 'pharmacy',
        type: 'smoothstep',
        animated: true,
      },
      {
        id: 'h4',
        source: 'clinic',
        target: 'billing',
        type: 'smoothstep',
        animated: true,
      },
    ];
    const healthcare = {
      id: 'healthcare',
      name: 'Healthcare / Patient Flow',
      nodes: healthcareNodes,
      edges: healthcareEdges,
    };

    const constructionNodes: Node<AssetNodeData>[] = [
      {
        id: 'design',
        type: 'asset',
        position: { x: 60, y: 100 },
        data: { kind: 'store', label: 'Plans' },
      },
      {
        id: 'supplier',
        type: 'asset',
        position: { x: 320, y: 150 },
        data: { kind: 'warehouse', label: 'Supplier' },
      },
      {
        id: 'site',
        type: 'asset',
        position: { x: 640, y: 210 },
        data: { kind: 'factory', label: 'Job Site' },
      },
      {
        id: 'hauler',
        type: 'asset',
        position: { x: 430, y: 310 },
        data: { kind: 'truck', label: 'Hauler' },
      },
    ];
    const constructionEdges: Edge<AssetEdgeData>[] = [
      {
        id: 'c1',
        source: 'design',
        target: 'supplier',
        type: 'smoothstep',
        animated: true,
      },
      {
        id: 'c2',
        source: 'supplier',
        target: 'hauler',
        type: 'smoothstep',
        animated: true,
      },
      {
        id: 'c3',
        source: 'hauler',
        target: 'site',
        type: 'smoothstep',
        animated: true,
      },
    ];
    const construction = {
      id: 'construction',
      name: 'Construction / Materials',
      nodes: constructionNodes,
      edges: constructionEdges,
    };

    return [supply, software, healthcare, construction];
  }, []);

  const [selectedPresetId, setSelectedPresetId] = useState(
    presets[0]?.id ?? 'supply',
  );

  const [isPlaying, setIsPlaying] = useState(true);
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const svgRef = useRef<SVGSVGElement | null>(null);

  const isometric = useMemo(
    () => buildIsometricSvg(nodes, edges, isPlaying),
    [edges, isPlaying, nodes],
  );

  const sortedIsometricBlocks = useMemo(
    () => isometric.blocks.slice().sort((a, b) => a.y - b.y),
    [isometric.blocks],
  );

  const serializeSvg = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return null;

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const content = new XMLSerializer().serializeToString(clone);
    return `<?xml version="1.0" encoding="UTF-8"?>\n${content}`;
  }, []);

  const copySvg = useCallback(async () => {
    const markup = serializeSvg();
    if (!markup) return;
    await navigator.clipboard.writeText(markup);
  }, [serializeSvg]);

  const downloadSvg = useCallback(() => {
    const markup = serializeSvg();
    if (!markup) return;
    const blob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'asset-build.svg';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [serializeSvg]);

  const [prompt, setPrompt] = useState(
    'Isometric supply chain: factory → warehouse → store with deliveries',
  );
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([
    {
      role: 'assistant',
      content:
        'Describe the scene you want (e.g. “factory to warehouse to store with trucks”). Click Apply to update the canvas.',
    },
  ]);

  const draggableItems = useMemo(
    () => [
      { kind: 'factory' as const, label: 'Factory' },
      { kind: 'warehouse' as const, label: 'Warehouse' },
      { kind: 'truck' as const, label: 'Truck' },
      { kind: 'store' as const, label: 'Store' },
    ],
    [],
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges(eds =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
          },
          eds,
        ),
      ),
    [setEdges],
  );

  const startConnector = useCallback(() => {
    setIsDrawConnectorMode(true);
    setDrawSourceId(null);
    setDrawWaypoints([]);
  }, []);

  const cancelConnector = useCallback(() => {
    setIsDrawConnectorMode(false);
    setDrawSourceId(null);
    setDrawWaypoints([]);
  }, []);

  const loadPreset = useCallback(() => {
    const preset = presets.find(p => p.id === selectedPresetId);
    if (!preset) return;
    setNodes(preset.nodes);
    setEdges(preset.edges);
    setPrompt(preset.name);
    cancelConnector();
  }, [cancelConnector, presets, selectedPresetId, setEdges, setNodes]);

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (!isDrawConnectorMode) {
        setSelectedEdgeId(null);
        return;
      }

      if (!drawSourceId) return;
      const instance = reactFlowRef.current;
      if (!instance) return;

      const target = event.currentTarget;
      if (!(target instanceof HTMLElement)) return;
      const bounds = target.getBoundingClientRect();
      const next = instance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      setDrawWaypoints(prev => prev.concat({ x: next.x, y: next.y }));
    },
    [drawSourceId, isDrawConnectorMode],
  );

  const onNodeClick = useCallback(
    (_: unknown, node: Node<AssetNodeData>) => {
      if (!isDrawConnectorMode) return;

      if (!drawSourceId) {
        setDrawSourceId(node.id);
        setDrawWaypoints([]);
        return;
      }

      if (node.id === drawSourceId) return;

      const waypoints = drawWaypoints;
      setEdges(prev =>
        prev.concat({
          id: createId('pipe'),
          source: drawSourceId,
          target: node.id,
          type: 'smoothstep',
          animated: true,
          data: waypoints.length > 0 ? { waypoints } : undefined,
        }),
      );
      setDrawSourceId(null);
      setDrawWaypoints([]);
    },
    [drawSourceId, drawWaypoints, isDrawConnectorMode, setEdges],
  );

  const selectedEdge = useMemo(
    () => (selectedEdgeId ? edges.find(e => e.id === selectedEdgeId) : null),
    [edges, selectedEdgeId],
  );

  const selectedEdgeWaypoints = useMemo(() => {
    const points = selectedEdge?.data?.waypoints;
    return points && points.length > 0 ? points : [];
  }, [selectedEdge]);

  useEffect(() => {
    if (draggingWaypointIndex === null) return;
    if (!selectedEdgeId) return;
    const instance = reactFlowRef.current;
    const wrapper = flowWrapperRef.current;
    if (!instance || !wrapper) return;

    const onMove = (event: PointerEvent) => {
      const bounds = wrapper.getBoundingClientRect();
      const next = instance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      setEdges(prev =>
        prev.map(e => {
          if (e.id !== selectedEdgeId) return e;
          const existing = e.data?.waypoints ?? [];
          if (
            draggingWaypointIndex < 0 ||
            draggingWaypointIndex >= existing.length
          )
            return e;
          const updated = existing.slice();
          updated[draggingWaypointIndex] = { x: next.x, y: next.y };
          return {
            ...e,
            data: {
              ...(e.data ?? {}),
              waypoints: updated,
            },
          };
        }),
      );
    };

    const onUp = () => {
      setDraggingWaypointIndex(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [draggingWaypointIndex, selectedEdgeId, setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const kind = event.dataTransfer.getData('application/applab-asset-kind');
      if (!kind) return;

      const bounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 90,
        y: event.clientY - bounds.top - 40,
      };

      const nodeKind = kind as AssetNodeKind;
      const id = createId(nodeKind);

      const newNode: Node<AssetNodeData> = {
        id,
        type: 'asset',
        position,
        data: {
          kind: nodeKind,
          label:
            nodeKind === 'factory'
              ? 'Factory'
              : nodeKind === 'warehouse'
                ? 'Warehouse'
                : nodeKind === 'truck'
                  ? 'Truck'
                  : 'Store',
        },
      };

      setNodes(nds => nds.concat(newNode));
    },
    [setNodes],
  );

  const applyPromptToScene = useCallback(() => {
    const scene = buildSceneFromPrompt(prompt);
    setNodes(scene.nodes);
    setEdges(scene.edges);
  }, [prompt, setEdges, setNodes]);

  const sendChat = useCallback(async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || isChatLoading) return;

    setIsChatLoading(true);
    setMessages(prev => prev.concat({ role: 'user', content: trimmed }));
    setChatInput('');

    const scene = {
      nodes: nodes.map(n => ({
        id: n.id,
        kind: n.data.kind,
        label: n.data.label,
        position: n.position,
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
      })),
    };

    const history = messages
      .slice(-11)
      .map(m => ({ role: m.role, content: m.content }))
      .concat({ role: 'user' as const, content: trimmed });

    try {
      const response = await fetch('/api/asset-designer/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history,
          scene,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const errorMessage =
          typeof data === 'string'
            ? data
            : data?.error || data?.message || 'Failed to send chat message';
        throw new Error(errorMessage);
      }

      const assistantMessage =
        typeof data?.message === 'string'
          ? data.message
          : 'No response generated';

      setMessages(prev =>
        prev.concat({ role: 'assistant', content: assistantMessage }),
      );

      const parsedScene = parseAssetDesignerScene(
        isRecord(data) ? data.scene : null,
      );

      if (parsedScene) {
        const nextNodes: Node<AssetNodeData>[] = parsedScene.nodes.map(n => ({
          id: n.id,
          type: 'asset',
          position: n.position,
          data: {
            kind: n.kind,
            label: n.label,
          },
        }));

        const nextEdges: Edge<AssetEdgeData>[] = parsedScene.edges.map(e => ({
          id: e.id ?? createId('edge'),
          source: e.source,
          target: e.target,
          type: 'smoothstep',
          animated: true,
        }));

        setNodes(nextNodes);
        setEdges(nextEdges);
      }

      setPrompt(trimmed);
    } catch (error) {
      const fallback = buildSceneFromPrompt(trimmed);
      setNodes(fallback.nodes);
      setEdges(fallback.edges);
      setPrompt(trimmed);
      setMessages(prev =>
        prev.concat({
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Chat failed',
        }),
      );
    } finally {
      setIsChatLoading(false);
    }
  }, [chatInput, edges, isChatLoading, messages, nodes, setEdges, setNodes]);

  return (
    <Page>
      <PageHeader
        title="Asset Designer"
        description="Generate and iterate on illustrations and animations. MVP: supply-chain scenes via drag & drop or chat."
      />

      <Tabs defaultValue="designer" className="h-full">
        <TabsList>
          <TabsTrigger value="designer">Designer</TabsTrigger>
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="designer" className="h-[calc(100vh-220px)]">
          <div className="flex h-full gap-4">
            <div className="flex h-full w-[320px] flex-col rounded-lg border border-border bg-background p-4">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <div className="text-sm font-semibold">Toolbox</div>
              </div>
              <div className="mt-3 space-y-2">
                {draggableItems.map(item => (
                  <div
                    key={item.kind}
                    draggable
                    onDragStart={event => {
                      event.dataTransfer.setData(
                        'application/applab-asset-kind',
                        item.kind,
                      );
                      event.dataTransfer.effectAllowed = 'move';
                    }}
                    className="flex cursor-grab items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-sm active:cursor-grabbing"
                  >
                    <span>{item.label}</span>
                    <Badge variant="outline" className="capitalize">
                      {item.kind}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2">
                <Label htmlFor="scene-preset">Scene preset</Label>
                <div className="flex gap-2">
                  <select
                    id="scene-preset"
                    value={selectedPresetId}
                    onChange={e => setSelectedPresetId(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {presets.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="secondary"
                    onClick={loadPreset}
                    className="h-9 px-3"
                  >
                    Load
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={isDrawConnectorMode ? 'default' : 'secondary'}
                    onClick={
                      isDrawConnectorMode ? cancelConnector : startConnector
                    }
                    className="h-9 w-full"
                  >
                    {isDrawConnectorMode
                      ? 'Exit Connector Tool'
                      : 'Draw Connector'}
                  </Button>
                </div>
                {isDrawConnectorMode ? (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {drawSourceId
                        ? `Click canvas to add waypoints, then click a target node. Source: ${drawSourceId} (points: ${drawWaypoints.length})`
                        : 'Click a source node to start a connector.'}
                    </div>

                    {drawSourceId ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="secondary"
                          onClick={() =>
                            setDrawWaypoints(prev => prev.slice(0, -1))
                          }
                          disabled={drawWaypoints.length === 0}
                          className="h-9"
                        >
                          Undo point
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setDrawWaypoints([])}
                          disabled={drawWaypoints.length === 0}
                          className="h-9"
                        >
                          Clear
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <Label htmlFor="scene-prompt">Generate from prompt</Label>
                <Textarea
                  id="scene-prompt"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="flex gap-2">
                  <Button onClick={applyPromptToScene} className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Apply
                  </Button>
                </div>
              </div>

              <div className="mt-auto pt-4 text-xs text-muted-foreground">
                Animation export + true isometric rendering are next (scene
                graph → SVG/Lottie).
              </div>
            </div>

            <div className="h-full min-w-0 flex-1 overflow-hidden rounded-lg border border-border bg-background">
              <div
                ref={flowWrapperRef}
                className="relative h-full"
                onDrop={onDrop}
                onDragOver={onDragOver}
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onInit={instance => {
                    reactFlowRef.current = instance;
                  }}
                  onPaneClick={onPaneClick}
                  onNodeClick={onNodeClick}
                  onEdgeClick={(event, edge) => {
                    if (isDrawConnectorMode) return;
                    if (
                      !edge.data?.waypoints ||
                      edge.data.waypoints.length === 0
                    ) {
                      setSelectedEdgeId(null);
                      return;
                    }
                    event.stopPropagation();
                    setSelectedEdgeId(edge.id);
                  }}
                  nodeTypes={nodeTypes}
                  fitView
                  connectionMode={ConnectionMode.Loose}
                >
                  <Background />
                  <Controls />

                  {!isDrawConnectorMode && selectedEdgeWaypoints.length > 0 ? (
                    <EdgeLabelRenderer>
                      <div className="absolute left-0 top-0 pointer-events-none">
                        {selectedEdgeWaypoints.map((p, idx) => (
                          <div
                            key={`${selectedEdgeId ?? 'edge'}-wp-${idx}`}
                            className="nodrag nopan pointer-events-auto h-3 w-3 rounded-full border border-primary/50 bg-background shadow-sm transition hover:scale-110 cursor-grab active:cursor-grabbing"
                            style={{
                              transform: `translate(-50%, -50%) translate(${p.x}px, ${p.y}px)`,
                            }}
                            onPointerDown={e => {
                              if (!selectedEdgeId) return;
                              e.preventDefault();
                              e.stopPropagation();
                              setDraggingWaypointIndex(idx);
                            }}
                            title="Drag to adjust connector path"
                          />
                        ))}
                      </div>
                    </EdgeLabelRenderer>
                  ) : null}
                </ReactFlow>
              </div>
            </div>

            <div className="flex h-full w-[420px] flex-col overflow-hidden rounded-lg border border-border bg-background">
              <div className="border-b border-border px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">Build</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Preview and export your isometric scene.
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => setIsPlaying(v => !v)}
                    className="h-8 px-2"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4" />
                        <span className="sr-only">Pause preview</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span className="sr-only">Play preview</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-auto p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Preview mode
                  </div>
                  <div className="flex items-center gap-1 rounded-md border border-border bg-muted/40 p-1">
                    <Button
                      variant={
                        previewMode === 'light' ? 'default' : 'secondary'
                      }
                      onClick={() => setPreviewMode('light')}
                      className="h-8 px-2"
                    >
                      <Sun className="mr-1 h-4 w-4" />
                      <span className="text-xs">Light</span>
                    </Button>
                    <Button
                      variant={previewMode === 'dark' ? 'default' : 'secondary'}
                      onClick={() => setPreviewMode('dark')}
                      className="h-8 px-2"
                    >
                      <Moon className="mr-1 h-4 w-4" />
                      <span className="text-xs">Dark</span>
                    </Button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-border">
                  <div
                    className={
                      previewMode === 'dark'
                        ? 'relative aspect-[4/3] w-full bg-slate-950'
                        : 'relative aspect-[4/3] w-full bg-white'
                    }
                  >
                    <svg
                      ref={svgRef}
                      viewBox={isometric.viewBox}
                      width={isometric.width}
                      height={isometric.height}
                      preserveAspectRatio="xMidYMid meet"
                      className="absolute inset-0 h-full w-full"
                    >
                      <defs>
                        <style>{`
                          .edge-flow{stroke-dasharray:8 14;animation:edgeDash 1.2s linear infinite;}
                          @keyframes edgeDash{to{stroke-dashoffset:-22;}}
                        `}</style>
                        <linearGradient
                          id="bg-light"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#ffffff"
                            stopOpacity="1"
                          />
                          <stop
                            offset="100%"
                            stopColor="#f1f5f9"
                            stopOpacity="1"
                          />
                        </linearGradient>
                        <linearGradient
                          id="bg-dark"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#020617"
                            stopOpacity="1"
                          />
                          <stop
                            offset="100%"
                            stopColor="#0b1220"
                            stopOpacity="1"
                          />
                        </linearGradient>
                        <filter
                          id="softShadow"
                          x="-25%"
                          y="-25%"
                          width="150%"
                          height="150%"
                        >
                          <feDropShadow
                            dx="0"
                            dy="10"
                            stdDeviation="12"
                            floodColor={
                              previewMode === 'dark' ? '#000000' : '#0f172a'
                            }
                            floodOpacity={previewMode === 'dark' ? 0.65 : 0.18}
                          />
                        </filter>
                      </defs>

                      <rect
                        x="0"
                        y="0"
                        width={isometric.width}
                        height={isometric.height}
                        fill={
                          previewMode === 'dark'
                            ? 'url(#bg-dark)'
                            : 'url(#bg-light)'
                        }
                      />

                      {isometric.edgePaths.map(p => (
                        <path
                          key={p.id}
                          d={p.d}
                          fill="none"
                          stroke={
                            previewMode === 'dark'
                              ? 'rgba(148, 163, 184, 0.35)'
                              : 'rgba(100, 116, 139, 0.35)'
                          }
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          vectorEffect="non-scaling-stroke"
                        />
                      ))}

                      {isPlaying
                        ? isometric.edgePaths.map(p => (
                            <path
                              key={`${p.id}-flow`}
                              d={p.d}
                              fill="none"
                              className="edge-flow"
                              stroke={
                                previewMode === 'dark'
                                  ? 'rgba(226, 232, 240, 0.70)'
                                  : 'rgba(15, 23, 42, 0.22)'
                              }
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              vectorEffect="non-scaling-stroke"
                            />
                          ))
                        : null}

                      <g filter="url(#softShadow)">
                        {sortedIsometricBlocks.map(block => (
                          <IsometricBlock
                            key={block.id}
                            id={block.id}
                            x={block.x}
                            y={block.y}
                            label={block.label}
                            kind={block.kind}
                            mode={previewMode}
                          />
                        ))}
                      </g>
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      void copySvg();
                    }}
                    className="h-9"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy SVG
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={downloadSvg}
                    className="h-9"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="h-[calc(100vh-220px)]">
          <div className="grid h-full grid-cols-12 gap-4">
            <div className="col-span-8 h-full overflow-hidden rounded-lg border border-border bg-background">
              <div className="flex h-full flex-col">
                <div className="border-b border-border px-4 py-3 text-sm font-semibold">
                  Conversation
                </div>
                <div className="flex-1 space-y-3 overflow-auto p-4">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={
                        m.role === 'user'
                          ? 'ml-auto max-w-[80%] rounded-lg bg-primary/10 px-3 py-2 text-sm'
                          : 'mr-auto max-w-[80%] rounded-lg bg-muted/40 px-3 py-2 text-sm'
                      }
                    >
                      {m.content}
                    </div>
                  ))}
                </div>
                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Describe an isometric supply chain scene..."
                      disabled={isChatLoading}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          sendChat();
                        }
                      }}
                    />
                    <Button onClick={sendChat} disabled={isChatLoading}>
                      {isChatLoading ? 'Sending…' : 'Send'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-4 flex h-full flex-col rounded-lg border border-border bg-background p-4">
              <div className="text-sm font-semibold">Canvas Preview</div>
              <div className="mt-2 text-xs text-muted-foreground">
                The canvas updates from your last prompt.
              </div>
              <div className="mt-4 flex-1 overflow-hidden rounded-md border border-border">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  fitView
                  panOnDrag={false}
                  zoomOnScroll={false}
                  zoomOnPinch={false}
                  zoomOnDoubleClick={false}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                >
                  <Background />
                </ReactFlow>
              </div>
              <div className="mt-4 space-y-2">
                <Button onClick={applyPromptToScene} className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Apply prompt to canvas
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setNodes(defaultNodes);
                    setEdges(defaultEdges);
                    setPrompt(
                      'Isometric supply chain: factory → warehouse → store with deliveries',
                    );
                  }}
                  className="w-full"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Page>
  );
}
