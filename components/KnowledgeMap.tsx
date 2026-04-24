"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  Handle,
  applyNodeChanges,
  type Edge,
  type Node,
  type NodeChange,
  type NodeProps,
} from "@xyflow/react";
import type { LinkObject, NodeObject } from "react-force-graph-2d";
import "@xyflow/react/dist/style.css";
import { Filter, Pin, PinOff, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import ItemDetailModal from "@/components/ItemDetailModal";
import { ARCHIVE_ITEM_CREATED_EVENT, ARCHIVE_ITEMS_CHANGED_EVENT } from "@/lib/archive-events";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

type ViewMode = "canvas" | "graph";

interface GraphNode {
  id: string;
  type: "url" | "text" | "file" | "note";
  title: string | null;
  summary: string | null;
  tags: string[];
  raw_url: string | null;
  source: string;
  file_name: string | null;
  collection_id: string | null;
  canvas_x: number | null;
  canvas_y: number | null;
  canvas_pinned: boolean;
  enriched: boolean;
  image_url: string | null;
  created_at: string;
}

interface GraphEdgeRecord {
  id: string;
  item_a_id: string;
  item_b_id: string;
  relation_type: "ai_similar" | "ai_same_domain" | "ai_topic" | "user_linked";
  strength: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdgeRecord[];
}

type ItemNodeData = {
  item: GraphNode;
  onTogglePinned: (item: GraphNode) => void;
};

type ItemFlowNode = Node<ItemNodeData, "recallItem">;
type GraphCanvasNode = NodeObject<GraphNode & { color: string; nodeTypeColor: string }>;
type GraphCanvasLink = LinkObject<GraphNode & { color: string; nodeTypeColor: string }, GraphEdgeRecord>;

const relationLabels: Record<GraphEdgeRecord["relation_type"], string> = {
  ai_similar: "Similar",
  ai_same_domain: "Same domain",
  ai_topic: "Topic",
  user_linked: "Manual",
};

const typeColors: Record<GraphNode["type"], string> = {
  url: "#38bdf8",
  text: "#84cc16",
  note: "#84cc16",
  file: "#fb923c",
};

const typeLabels: Record<GraphNode["type"], string> = {
  url: "Links",
  text: "Text",
  note: "Notes",
  file: "Files",
};

const collectionColors = ["#38bdf8", "#22c55e", "#f97316", "#e879f9", "#facc15", "#14b8a6"];
const allTypes: GraphNode["type"][] = ["url", "text", "note", "file"];

function fallbackPosition(index: number) {
  const col = index % 4;
  const row = Math.floor(index / 4);
  return { x: 120 + col * 290, y: 100 + row * 190 };
}

function getTitle(node: GraphNode) {
  return node.title || node.file_name || node.raw_url || "Untitled";
}

function getCollectionColor(collectionId: string | null) {
  if (!collectionId) return "#6366f1";

  let hash = 0;
  for (let i = 0; i < collectionId.length; i += 1) {
    hash = (hash + collectionId.charCodeAt(i)) % collectionColors.length;
  }

  return collectionColors[hash];
}

function matchesNodeQuery(node: GraphNode, query: string) {
  if (!query) {
    return true;
  }

  const normalized = query.toLowerCase();
  const haystack = [
    getTitle(node),
    node.summary,
    node.raw_url,
    node.file_name,
    node.source,
    ...(node.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

function ItemNodeCard({ data }: NodeProps<ItemFlowNode>) {
  const item = data.item;

  return (
    <div
      className="w-[260px] rounded-[18px] border border-border bg-surface shadow-[0_16px_48px_rgba(0,0,0,0.18)]"
      style={{
        borderTop: `3px solid ${getCollectionColor(item.collection_id)}`,
        clipPath: "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-brand" />
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div
              className="mb-1 inline-flex items-center rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white"
              style={{ backgroundColor: typeColors[item.type] }}
            >
              {item.type}
            </div>
            <div className="line-clamp-2 text-sm font-semibold text-text-primary">{getTitle(item)}</div>
          </div>
          <button
            className="rounded-full p-1 text-text-muted hover:bg-surface-2"
            onClick={(event) => {
              event.stopPropagation();
              data.onTogglePinned(item);
            }}
          >
            {item.canvas_pinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-3 px-4 py-3">
        <p className="line-clamp-3 text-xs text-text-mid">{item.summary || item.raw_url || item.source}</p>
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-bg px-2 py-1 text-[10px] text-text-muted">
              {tag}
            </span>
          ))}
          {!item.enriched ? <span className="rounded-full bg-brand/10 px-2 py-1 text-[10px] text-brand">Enriching</span> : null}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-brand" />
    </div>
  );
}

const nodeTypes = {
  recallItem: ItemNodeCard,
};

export default function KnowledgeMap({ initialMode }: { initialMode: ViewMode }) {
  const [view, setView] = useState<ViewMode>(initialMode);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [flowNodes, setFlowNodes] = useState<ItemFlowNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [minStrength, setMinStrength] = useState(0.75);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [activeTypes, setActiveTypes] = useState<GraphNode["type"][]>(allTypes);

  const loadGraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/graph");
      if (!response.ok) {
        throw new Error("Failed to load graph");
      }
      const data = (await response.json()) as GraphData;
      setGraphData(data);
      setFlowNodes(
        data.nodes.map((node, index) => ({
          id: node.id,
          type: "recallItem",
          data: {
            item: node,
            onTogglePinned: async (current: GraphNode) => {
              const response = await fetch(`/api/items/${current.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ canvas_pinned: !current.canvas_pinned }),
              });
              if (!response.ok) {
                return;
              }

              setGraphData((existing) => ({
                ...existing,
                nodes: existing.nodes.map((node) =>
                  node.id === current.id
                    ? { ...node, canvas_pinned: !current.canvas_pinned }
                    : node,
                ),
              }));
              setFlowNodes((existing) =>
                existing.map((node) =>
                  node.id === current.id
                    ? {
                        ...node,
                        draggable: current.canvas_pinned,
                        data: {
                          ...node.data,
                          item: {
                            ...node.data.item,
                            canvas_pinned: !current.canvas_pinned,
                          },
                        },
                      }
                    : node,
                ),
              );
            },
          },
          draggable: !node.canvas_pinned,
          position:
            typeof node.canvas_x === "number" && typeof node.canvas_y === "number"
              ? { x: node.canvas_x, y: node.canvas_y }
              : fallbackPosition(index),
        })),
      );
    } catch {
      setError("The knowledge map could not be loaded right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGraph();

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadGraph();
      }
    }, 60000);

    return () => window.clearInterval(interval);
  }, [loadGraph]);

  useEffect(() => {
    const refresh = () => void loadGraph();
    window.addEventListener(ARCHIVE_ITEM_CREATED_EVENT, refresh);
    window.addEventListener(ARCHIVE_ITEMS_CHANGED_EVENT, refresh);

    return () => {
      window.removeEventListener(ARCHIVE_ITEM_CREATED_EVENT, refresh);
      window.removeEventListener(ARCHIVE_ITEMS_CHANGED_EVENT, refresh);
    };
  }, [loadGraph]);

  const visibleNodes = useMemo(
    () =>
      graphData.nodes.filter(
        (node) =>
          activeTypes.includes(node.type) &&
          (!showPinnedOnly || node.canvas_pinned) &&
          matchesNodeQuery(node, query),
      ),
    [activeTypes, graphData.nodes, query, showPinnedOnly],
  );

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);

  const visibleEdges = useMemo(
    () =>
      graphData.edges.filter(
        (edge) =>
          edge.strength >= minStrength &&
          visibleNodeIds.has(edge.item_a_id) &&
          visibleNodeIds.has(edge.item_b_id),
      ),
    [graphData.edges, minStrength, visibleNodeIds],
  );

  const visibleFlowNodes = useMemo(
    () => flowNodes.filter((node) => visibleNodeIds.has(node.id)),
    [flowNodes, visibleNodeIds],
  );

  const flowEdges = useMemo<Edge[]>(
    () =>
      visibleEdges.map((edge) => ({
        id: edge.id,
        source: edge.item_a_id,
        target: edge.item_b_id,
        label: relationLabels[edge.relation_type],
        animated: edge.relation_type === "user_linked",
        style: { stroke: "#6366f1", strokeWidth: 1 + edge.strength * 2 },
        labelStyle: { fill: "#71717a", fontSize: 11 },
      })),
    [visibleEdges],
  );

  const graphCanvasData = useMemo(
    () => ({
      nodes: visibleNodes.map((node) => ({
        ...node,
        color: getCollectionColor(node.collection_id),
        nodeTypeColor: typeColors[node.type],
      })),
      links: visibleEdges.map((edge) => ({
        ...edge,
        source: edge.item_a_id,
        target: edge.item_b_id,
      })),
    }),
    [visibleEdges, visibleNodes],
  );

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setFlowNodes((current) => applyNodeChanges(changes, current) as ItemFlowNode[]);
  }, []);

  useEffect(() => {
    if (selectedId && !visibleNodeIds.has(selectedId)) {
      setSelectedId(null);
    }
  }, [selectedId, visibleNodeIds]);

  function toggleType(type: GraphNode["type"]) {
    setActiveTypes((current) =>
      current.includes(type)
        ? current.filter((entry) => entry !== type)
        : [...current, type],
    );
  }

  function resetFilters() {
    setQuery("");
    setMinStrength(0.75);
    setShowPinnedOnly(false);
    setActiveTypes(allTypes);
  }

  const pinnedCount = visibleNodes.filter((node) => node.canvas_pinned).length;
  const averageStrength =
    visibleEdges.length > 0
      ? (visibleEdges.reduce((total, edge) => total + edge.strength, 0) / visibleEdges.length).toFixed(2)
      : "0.00";

  return (
    <div className="relative h-[calc(100vh-1rem)] overflow-hidden bg-bg">
      <div className="absolute left-4 right-4 top-4 z-20 flex max-w-[28rem] flex-col gap-3">
        <div className="flex items-center gap-2 rounded-modals border border-border bg-surface/90 p-2 backdrop-blur">
          <button
            className={`rounded-buttons px-3 py-2 text-xs ${view === "canvas" ? "bg-brand text-white" : "text-text-mid"}`}
            onClick={() => setView("canvas")}
          >
            Canvas
          </button>
          <button
            className={`rounded-buttons px-3 py-2 text-xs ${view === "graph" ? "bg-brand text-white" : "text-text-mid"}`}
            onClick={() => setView("graph")}
          >
            Graph
          </button>
          <button className="rounded-buttons p-2 text-text-mid hover:bg-surface-2" onClick={() => void loadGraph()}>
            <RefreshCw className="h-4 w-4" />
          </button>
          <div className="ml-auto hidden text-[11px] text-text-muted sm:block">
            {visibleNodes.length} nodes
          </div>
        </div>

        <div className="rounded-modals border border-border bg-surface/90 p-4 backdrop-blur">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Map controls</div>
              <p className="mt-1 text-sm text-text-primary">
                Filter the knowledge map before you rearrange or inspect it.
              </p>
            </div>
            <button type="button" onClick={resetFilters} className="text-xs text-brand hover:text-brand-hover">
              Reset
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-input border border-border bg-bg px-3 py-2">
            <Search className="h-4 w-4 text-text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by title, URL, tag, or source"
              className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {allTypes.map((type) => {
              const active = activeTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    active
                      ? "border-transparent text-white"
                      : "border-border bg-bg text-text-mid hover:border-brand/40 hover:text-text-primary"
                  }`}
                  style={active ? { backgroundColor: typeColors[type] } : undefined}
                >
                  {typeLabels[type]}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setShowPinnedOnly((current) => !current)}
              className={`flex items-center justify-between rounded-cards border px-3 py-3 text-sm transition ${
                showPinnedOnly
                  ? "border-brand bg-brand/10 text-text-primary"
                  : "border-border bg-bg text-text-mid hover:text-text-primary"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Pinned only
              </span>
              {showPinnedOnly ? <Pin className="h-4 w-4 text-brand" /> : <PinOff className="h-4 w-4" />}
            </button>

            <div className="rounded-cards border border-border bg-bg px-3 py-3">
              <div className="mb-2 inline-flex items-center gap-2 text-sm text-text-primary">
                <SlidersHorizontal className="h-4 w-4 text-brand" />
                Relation strength
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={minStrength}
                onChange={(event) => setMinStrength(Number(event.target.value))}
                className="w-full accent-brand"
              />
              <div className="mt-1 text-xs text-text-muted">Show links from {minStrength.toFixed(2)} and up</div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StatCard label="Visible nodes" value={String(visibleNodes.length)} />
            <StatCard label="Visible links" value={String(visibleEdges.length)} />
            <StatCard label="Pinned" value={String(pinnedCount)} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-20 hidden w-72 rounded-modals border border-border bg-surface/90 p-4 backdrop-blur xl:block">
        <div className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Legend</div>
        <div className="mt-3 space-y-2">
          {allTypes.map((type) => (
            <div key={type} className="flex items-center justify-between text-sm text-text-primary">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: typeColors[type] }} />
                {typeLabels[type]}
              </span>
              <span className="text-xs text-text-muted">
                {visibleNodes.filter((node) => node.type === type).length}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-cards border border-border bg-bg px-3 py-3 text-xs text-text-muted">
          Drag cards in canvas mode to arrange your space. Graph mode is better for spotting dense clusters and strong relation overlap.
        </div>
        <div className="mt-3 text-xs text-text-muted">Average visible link strength: {averageStrength}</div>
      </div>

      {loading ? (
        <div className="absolute right-4 top-4 z-20 rounded-buttons border border-border bg-surface px-3 py-2 text-xs text-text-muted">
          Syncing knowledge map...
        </div>
      ) : null}

      {error ? (
        <div className="absolute right-4 top-20 z-20 max-w-sm rounded-buttons border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <div>{error}</div>
          <button type="button" onClick={() => void loadGraph()} className="mt-2 text-xs font-medium text-rose-100">
            Retry
          </button>
        </div>
      ) : null}

      {!loading && visibleNodes.length === 0 ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
          <div className="max-w-md rounded-modals border border-border bg-surface p-6 text-center">
            <h2 className="text-lg font-semibold text-text-primary">No nodes match the current filters</h2>
            <p className="mt-2 text-sm text-text-muted">
              Broaden the search, re-enable a type, or lower the relation threshold to bring the map back.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-buttons bg-brand px-4 py-2 text-sm font-medium text-white"
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : view === "canvas" ? (
        <div className="h-full">
          <ReactFlowProvider>
            <ReactFlow
              nodes={visibleFlowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onNodeClick={(_, node) => setSelectedId(node.id)}
              onNodeDragStop={async (_, node) => {
                await fetch(`/api/items/${node.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ canvas_x: node.position.x, canvas_y: node.position.y }),
                });
              }}
              fitView
              className="bg-bg"
            >
              <MiniMap
                nodeStrokeColor={(node) => {
                  const item = (node.data as ItemNodeData | undefined)?.item;
                  return item ? typeColors[item.type] : "#6366f1";
                }}
                nodeColor={() => "#18181b"}
              />
              <Background gap={24} color="rgba(113,113,122,0.18)" />
              <Controls />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      ) : (
        <div className="h-full">
          <ForceGraph2D
            graphData={graphCanvasData}
            backgroundColor="#0f0f11"
            nodeRelSize={7}
            linkColor={() => "rgba(99,102,241,0.35)"}
            linkWidth={(link) => 1 + Number((link as GraphCanvasLink).strength ?? 0) * 2}
            nodeCanvasObject={(node, ctx: CanvasRenderingContext2D, globalScale: number) => {
              const graphNode = node as GraphCanvasNode;
              if (typeof graphNode.x !== "number" || typeof graphNode.y !== "number") {
                return;
              }

              const label = getTitle(graphNode);
              const fontSize = 11 / globalScale;
              const size = 18;
              ctx.save();
              ctx.translate(graphNode.x, graphNode.y);
              ctx.rotate(Math.PI / 4);
              ctx.beginPath();
              ctx.rect(-size / 2, -size / 2, size, size);
              ctx.fillStyle = graphNode.color;
              ctx.fill();
              ctx.beginPath();
              ctx.arc(0, 0, 4.5, 0, 2 * Math.PI, false);
              ctx.fillStyle = graphNode.nodeTypeColor;
              ctx.fill();
              ctx.restore();
              ctx.font = `600 ${fontSize}px "Geist Mono", monospace`;
              ctx.fillStyle = "#a1a1aa";
              ctx.fillText(label, graphNode.x + 14, graphNode.y + 4);
            }}
            linkCanvasObjectMode={() => "after"}
            linkCanvasObject={(link, ctx: CanvasRenderingContext2D) => {
              const graphLink = link as GraphCanvasLink;
              const start = graphLink.source;
              const end = graphLink.target;
              if (typeof start === "string" || typeof start === "number" || typeof end === "string" || typeof end === "number") {
                return;
              }
              if (
                !start ||
                !end ||
                typeof start.x !== "number" ||
                typeof start.y !== "number" ||
                typeof end.x !== "number" ||
                typeof end.y !== "number"
              ) {
                return;
              }
              const midX = (start.x + end.x) / 2;
              const midY = (start.y + end.y) / 2;
              ctx.fillStyle = "#71717a";
              ctx.font = '10px "Geist Mono", monospace';
              ctx.fillText(relationLabels[graphLink.relation_type], midX, midY);
            }}
            onNodeClick={(node) => setSelectedId(typeof node.id === "string" ? node.id : null)}
          />
        </div>
      )}

      <ItemDetailModal itemId={selectedId || ""} open={!!selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-cards border border-border bg-bg px-3 py-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-text-muted">{label}</div>
      <div className="mt-2 text-xl font-semibold text-text-primary">{value}</div>
    </div>
  );
}
