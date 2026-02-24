'use client';

import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { ContributeDialog } from '@/components/contribute-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ZoomIn, ZoomOut, Maximize2, Eye, Users, GitBranch, User, ArrowDownToLine, ArrowUpFromLine, Crosshair, X, ChevronDown, ChevronRight, BarChart3, Package, Link, ChevronsDownUp, ChevronsUpDown, Copy, Pencil, Save, RotateCcw, Trash2, ArrowUp, ArrowDown, GripVertical, MessageSquarePlus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
    fetchTreeData,
    updateFamilyChildren as supaUpdateFamilyChildren,
    moveChildToFamily as supaMoveChild,
    removeChildFromFamily as supaRemoveChild,
    updatePersonLiving as supaUpdatePersonLiving,
    updatePerson as supaUpdatePerson,
} from '@/lib/supabase-data';
import {
    computeLayout, filterAncestors, filterDescendants,
    CARD_W, CARD_H,
    type TreeNode, type TreeFamily, type LayoutResult, type PositionedNode, type PositionedCouple,
} from '@/lib/tree-layout';
import { getMockTreeData } from '@/lib/mock-data';

type ViewMode = 'full' | 'ancestor' | 'descendant';
type ZoomLevel = 'full' | 'compact' | 'mini';

function getZoomLevel(scale: number): ZoomLevel {
    if (scale > 0.6) return 'full';
    if (scale > 0.3) return 'compact';
    return 'mini';
}

// === Branch Summary (F4) ===
interface BranchSummary {
    parentHandle: string;
    totalDescendants: number;
    generationRange: [number, number];
    livingCount: number;
    deceasedCount: number;
    patrilinealCount: number;
}

function computeBranchSummary(
    handle: string,
    people: TreeNode[],
    families: TreeFamily[],
): BranchSummary {
    const personMap = new Map(people.map(p => [p.handle, p]));
    const familyMap = new Map(families.map(f => [f.handle, f]));
    const visited = new Set<string>();
    let livingCount = 0, deceasedCount = 0, patrilinealCount = 0;
    let minGen = Infinity, maxGen = -Infinity;

    function walk(h: string, gen: number) {
        if (visited.has(h)) return;
        visited.add(h);
        const person = personMap.get(h);
        if (!person) return;
        if (gen < minGen) minGen = gen;
        if (gen > maxGen) maxGen = gen;
        if (person.isLiving) livingCount++; else deceasedCount++;
        if (person.isPatrilineal) patrilinealCount++;
        for (const fId of person.families) {
            const fam = familyMap.get(fId);
            if (!fam) continue;
            for (const ch of fam.children) walk(ch, gen + 1);
        }
    }

    // Walk from this person's children (not including the person itself)
    const person = personMap.get(handle);
    if (person) {
        for (const fId of person.families) {
            const fam = familyMap.get(fId);
            if (!fam) continue;
            // Also count spouse
            if (fam.motherHandle && fam.motherHandle !== handle && !visited.has(fam.motherHandle)) {
                const spouse = personMap.get(fam.motherHandle);
                if (spouse) { visited.add(fam.motherHandle); if (spouse.isLiving) livingCount++; else deceasedCount++; }
            }
            if (fam.fatherHandle && fam.fatherHandle !== handle && !visited.has(fam.fatherHandle)) {
                const spouse = personMap.get(fam.fatherHandle);
                if (spouse) { visited.add(fam.fatherHandle); if (spouse.isLiving) livingCount++; else deceasedCount++; }
            }
            for (const ch of fam.children) walk(ch, 1);
        }
    }

    return {
        parentHandle: handle,
        totalDescendants: visited.size,
        generationRange: [minGen === Infinity ? 0 : minGen, maxGen === -Infinity ? 0 : maxGen],
        livingCount, deceasedCount, patrilinealCount,
    };
}

// === Tree Stats (F3) ===
interface TreeStats {
    total: number;
    totalFamilies: number;
    totalGenerations: number;
    perGeneration: { gen: number; count: number }[];
    livingCount: number;
    deceasedCount: number;
    patrilinealCount: number;
    nonPatrilinealCount: number;
}

function computeTreeStats(nodes: PositionedNode[], families: TreeFamily[]): TreeStats {
    const genMap = new Map<number, number>();
    let living = 0, deceased = 0, patri = 0, nonPatri = 0;
    for (const n of nodes) {
        const gen = n.generation + 1;
        genMap.set(gen, (genMap.get(gen) ?? 0) + 1);
        if (n.node.isLiving) living++; else deceased++;
        if (n.node.isPatrilineal) patri++; else nonPatri++;
    }
    const perGeneration = Array.from(genMap.entries())
        .map(([gen, count]) => ({ gen, count }))
        .sort((a, b) => a.gen - b.gen);
    return {
        total: nodes.length,
        totalFamilies: families.length,
        totalGenerations: perGeneration.length,
        perGeneration,
        livingCount: living,
        deceasedCount: deceased,
        patrilinealCount: patri,
        nonPatrilinealCount: nonPatri,
    };
}

// Default depth at which branches auto-collapse in panoramic view (0-indexed: gen 3 = Đời 4)
const AUTO_COLLAPSE_GEN = 8;

// Compute generations via BFS from root persons (persons not in any family as children)
function computePersonGenerations(people: TreeNode[], families: TreeFamily[]): Map<string, number> {
    const childOf = new Set<string>();
    for (const f of families) for (const ch of f.children) childOf.add(ch);
    const roots = people.filter(p => p.isPatrilineal && !childOf.has(p.handle));
    const gens = new Map<string, number>();
    const familyMap = new Map(families.map(f => [f.handle, f]));
    const queue: { handle: string; gen: number }[] = roots.map(r => ({ handle: r.handle, gen: 0 }));
    while (queue.length > 0) {
        const { handle, gen } = queue.shift()!;
        if (gens.has(handle)) continue;
        gens.set(handle, gen);
        const person = people.find(p => p.handle === handle);
        if (!person) continue;
        for (const fId of person.families) {
            const fam = familyMap.get(fId);
            if (!fam) continue;
            // Spouse at same gen
            if (fam.fatherHandle && !gens.has(fam.fatherHandle)) gens.set(fam.fatherHandle, gen);
            if (fam.motherHandle && !gens.has(fam.motherHandle)) gens.set(fam.motherHandle, gen);
            for (const ch of fam.children) {
                if (!gens.has(ch)) queue.push({ handle: ch, gen: gen + 1 });
            }
        }
    }
    return gens;
}

export default function TreeViewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const viewportRef = useRef<HTMLDivElement>(null);
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateSize = () => {
            if (viewportRef.current) {
                setViewportSize({
                    width: viewportRef.current.clientWidth,
                    height: viewportRef.current.clientHeight
                });
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    const [treeData, setTreeData] = useState<{ people: TreeNode[]; families: TreeFamily[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('full');
    const [focusPerson, setFocusPerson] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [highlightHandles, setHighlightHandles] = useState<Set<string>>(new Set());
    const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ handle: string; x: number; y: number } | null>(null);
    const [contributePerson, setContributePerson] = useState<{ handle: string; name: string } | null>(null);
    const [linkCopied, setLinkCopied] = useState(false);

    // F4: Collapsible branches
    const [collapsedBranches, setCollapsedBranches] = useState<Set<string>>(new Set());
    // F3: Stats panel user-hidden
    const [statsHidden, setStatsHidden] = useState(false);

    // Editor mode state
    const [editorMode, setEditorMode] = useState(false);
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const { isAdmin } = useAuth();

    // URL query param initialization + auto-collapse on initial load
    const urlInitialized = useRef(false);
    useEffect(() => {
        if (urlInitialized.current || !treeData) return;
        urlInitialized.current = true;
        const viewParam = searchParams.get('view') as ViewMode | null;
        const personParam = searchParams.get('person');
        if (viewParam && ['full', 'ancestor', 'descendant'].includes(viewParam)) {
            if (viewMode !== viewParam) setViewMode(viewParam);
        }
        if (personParam && treeData.people.some(p => p.handle === personParam)) {
            if (focusPerson !== personParam) setFocusPerson(personParam);
        }
        // Auto-collapse on initial load
        if (!viewParam || viewParam === 'full') {
            // Panoramic: collapse by absolute generation
            const gens = computePersonGenerations(treeData.people, treeData.families);
            const toCollapse = new Set<string>();
            for (const f of treeData.families) {
                if (f.children.length === 0) continue;
                const parentHandle = f.fatherHandle || f.motherHandle;
                if (!parentHandle) continue;
                const gen = gens.get(parentHandle);
                if (gen !== undefined && gen >= AUTO_COLLAPSE_GEN) {
                    toCollapse.add(parentHandle);
                }
            }
            setCollapsedBranches(toCollapse);
        } else if (viewParam === 'descendant' && personParam) {
            // Descendant: collapse by relative depth from focus person
            const personMap = new Map(treeData.people.map(p => [p.handle, p]));
            const toCollapse = new Set<string>();
            const depthMap = new Map<string, number>();
            const queue: string[] = [personParam];
            depthMap.set(personParam, 0);
            while (queue.length > 0) {
                const h = queue.shift()!;
                const depth = depthMap.get(h)!;
                const p = personMap.get(h);
                if (!p) continue;
                for (const fId of p.families) {
                    const fam = treeData.families.find(f => f.handle === fId);
                    if (!fam || fam.children.length === 0) continue;
                    if (depth >= AUTO_COLLAPSE_GEN) {
                        toCollapse.add(h);
                    } else {
                        for (const ch of fam.children) {
                            if (!depthMap.has(ch)) {
                                depthMap.set(ch, depth + 1);
                                queue.push(ch);
                            }
                        }
                    }
                }
            }
            setCollapsedBranches(toCollapse);
        }
    }, [searchParams, treeData, focusPerson, viewMode]);

    // Sync URL when view/focus changes
    useEffect(() => {
        if (!urlInitialized.current) return;
        const params = new URLSearchParams();
        if (viewMode !== 'full') params.set('view', viewMode);
        if (focusPerson && viewMode !== 'full') params.set('person', focusPerson);
        const qs = params.toString();
        router.replace(`/tree${qs ? '?' + qs : ''}`, { scroll: false });
    }, [viewMode, focusPerson, router]);

    // Transform state
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ startX: 0, startY: 0, startTx: 0, startTy: 0 });
    const pinchRef = useRef({ initialDist: 0, initialScale: 1 });

    // Fetch data
    useEffect(() => {
        const fetchTree = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                if (token && apiUrl) {
                    const res = await fetch(`${apiUrl}/genealogy/tree`, {
                        headers: { Authorization: `Bearer ${token}` },
                        signal: AbortSignal.timeout(3000),
                    });
                    if (res.ok) {
                        const json = await res.json();
                        setTreeData(json.data);
                        setLoading(false);
                        return;
                    }
                }
            } catch { /* fallback */ }
            // Load from Supabase
            try {
                const data = await fetchTreeData();
                if (data.people.length > 0) {
                    setTreeData(data);
                    setLoading(false);
                    return;
                }
            } catch { /* fallback to mock */ }
            // Fallback: use bundled mock data (demo mode)
            setTreeData(getMockTreeData());
            setLoading(false);
        };
        fetchTree();
    }, []);

    // Filtered data for view mode
    const displayData = useMemo(() => {
        if (!treeData) return null;
        if (viewMode === 'full' || !focusPerson) return treeData;
        if (viewMode === 'ancestor') return filterAncestors(focusPerson, treeData.people, treeData.families);
        if (viewMode === 'descendant') return filterDescendants(focusPerson, treeData.people, treeData.families);
        return treeData;
    }, [treeData, viewMode, focusPerson]);

    // F1: Zoom level
    const zoomLevel = useMemo<ZoomLevel>(() => getZoomLevel(transform.scale), [transform.scale]);

    // F4: Get all descendants of collapsed branches
    const getDescendantHandles = useCallback((handle: string): Set<string> => {
        if (!treeData) return new Set();
        const personMap = new Map(treeData.people.map(p => [p.handle, p]));
        const familyMap = new Map(treeData.families.map(f => [f.handle, f]));
        const result = new Set<string>();
        function walk(h: string) {
            const person = personMap.get(h);
            if (!person) return;
            for (const fId of person.families) {
                const fam = familyMap.get(fId);
                if (!fam) continue;
                // Include spouse
                if (fam.motherHandle && fam.motherHandle !== h) result.add(fam.motherHandle);
                if (fam.fatherHandle && fam.fatherHandle !== h) result.add(fam.fatherHandle);
                for (const ch of fam.children) {
                    result.add(ch);
                    walk(ch);
                }
            }
        }
        walk(handle);
        return result;
    }, [treeData]);

    // F4: Compute all hidden handles from collapsed branches
    const hiddenHandles = useMemo(() => {
        if (!treeData) return new Set<string>();
        const hidden = new Set<string>();
        for (const h of collapsedBranches) {
            const descendants = getDescendantHandles(h);
            for (const d of descendants) hidden.add(d);
        }
        // Cascade: hide people whose ALL parent families have hidden fathers
        // This catches nodes that leaked through (e.g., gen 13 whose gen 12 parents are hidden)
        const familyMap = new Map(treeData.families.map(f => [f.handle, f]));
        let changed = true;
        while (changed) {
            changed = false;
            for (const p of treeData.people) {
                if (hidden.has(p.handle)) continue;
                if (p.parentFamilies.length === 0) continue;
                // Check if ALL parent families have their father/mother hidden
                const allParentsHidden = p.parentFamilies.every(pfId => {
                    const pf = familyMap.get(pfId);
                    if (!pf) return true; // orphan family = treat as hidden
                    const fatherHidden = pf.fatherHandle ? hidden.has(pf.fatherHandle) : true;
                    const motherHidden = pf.motherHandle ? hidden.has(pf.motherHandle) : true;
                    return fatherHidden && motherHidden;
                });
                if (allParentsHidden) {
                    hidden.add(p.handle);
                    changed = true;
                }
            }
        }
        return hidden;
    }, [collapsedBranches, getDescendantHandles, treeData]);

    // F4: Branch summaries for collapsed branches
    const branchSummaries = useMemo(() => {
        if (!treeData) return new Map<string, BranchSummary>();
        const map = new Map<string, BranchSummary>();
        for (const h of collapsedBranches) {
            map.set(h, computeBranchSummary(h, treeData.people, treeData.families));
        }
        return map;
    }, [collapsedBranches, treeData]);

    // F4: Toggle collapse — reveals one level at a time when expanding
    const toggleCollapse = useCallback((handle: string) => {
        if (!treeData) return;
        setCollapsedBranches(prev => {
            const next = new Set(prev);
            if (next.has(handle)) {
                // Expanding: remove this person's collapse, but auto-collapse their
                // direct children who have descendants (progressive reveal)
                next.delete(handle);
                const person = treeData.people.find(p => p.handle === handle);
                if (person) {
                    for (const fId of person.families) {
                        const fam = treeData.families.find(f => f.handle === fId);
                        if (!fam) continue;
                        for (const ch of fam.children) {
                            // Check if child has their own children
                            const childPerson = treeData.people.find(p => p.handle === ch);
                            if (childPerson) {
                                const childHasChildren = childPerson.families.some(cfId => {
                                    const cf = treeData.families.find(f => f.handle === cfId);
                                    return cf && cf.children.length > 0;
                                });
                                if (childHasChildren) {
                                    next.add(ch);
                                }
                            }
                        }
                    }
                }
            } else {
                next.add(handle);
            }
            return next;
        });
    }, [treeData]);

    // Expand All / Collapse All
    const expandAll = useCallback(() => {
        setCollapsedBranches(new Set());
    }, []);

    const collapseAll = useCallback(() => {
        if (!treeData) return;
        const allParents = new Set<string>();
        for (const f of treeData.families) {
            if (f.children.length > 0) {
                if (f.fatherHandle) allParents.add(f.fatherHandle);
                if (f.motherHandle) allParents.add(f.motherHandle);
            }
        }
        setCollapsedBranches(allParents);
    }, [treeData]);

    // Auto-collapse for Toàn cảnh view
    const autoCollapseForPanoramic = useCallback(() => {
        if (!treeData) return;
        const gens = computePersonGenerations(treeData.people, treeData.families);
        const toCollapse = new Set<string>();
        for (const f of treeData.families) {
            if (f.children.length === 0) continue;
            const parentHandle = f.fatherHandle || f.motherHandle;
            if (!parentHandle) continue;
            const gen = gens.get(parentHandle);
            if (gen !== undefined && gen >= AUTO_COLLAPSE_GEN) {
                toCollapse.add(parentHandle);
            }
        }
        setCollapsedBranches(toCollapse);
    }, [treeData]);

    // Auto-collapse for Hậu duệ view: collapse branches beyond AUTO_COLLAPSE_GEN relative depth from focus
    const autoCollapseForDescendant = useCallback((person: string) => {
        if (!treeData) return;
        const personMap = new Map(treeData.people.map(p => [p.handle, p]));
        const toCollapse = new Set<string>();
        // BFS from person to compute relative depth
        const depthMap = new Map<string, number>();
        const queue: string[] = [person];
        depthMap.set(person, 0);
        while (queue.length > 0) {
            const h = queue.shift()!;
            const depth = depthMap.get(h)!;
            const p = personMap.get(h);
            if (!p) continue;
            for (const fId of p.families) {
                const fam = treeData.families.find(f => f.handle === fId);
                if (!fam || fam.children.length === 0) continue;
                if (depth >= AUTO_COLLAPSE_GEN) {
                    toCollapse.add(h);
                } else {
                    for (const ch of fam.children) {
                        if (!depthMap.has(ch)) {
                            depthMap.set(ch, depth + 1);
                            queue.push(ch);
                        }
                    }
                }
            }
        }
        setCollapsedBranches(toCollapse);
    }, [treeData]);

    // Compute layout — filter out hidden nodes from collapsed branches
    const layout = useMemo<LayoutResult | null>(() => {
        if (!displayData) return null;
        const d = 'filteredPeople' in displayData
            ? {
                people: (displayData as unknown as { filteredPeople: TreeNode[] }).filteredPeople,
                families: (displayData as unknown as { filteredFamilies: TreeFamily[] }).filteredFamilies
            }
            : displayData;
        // F4: Filter out hidden handles
        const visiblePeople = d.people.filter((p: TreeNode) => !hiddenHandles.has(p.handle));
        const visibleFamilies = d.families.filter((f: TreeFamily) => {
            // Keep family only if NOT all parents are hidden
            const fatherHidden = f.fatherHandle ? hiddenHandles.has(f.fatherHandle) : true;
            const motherHidden = f.motherHandle ? hiddenHandles.has(f.motherHandle) : true;
            return !(fatherHidden && motherHidden);
        });
        return computeLayout(visiblePeople, visibleFamilies);
    }, [displayData, hiddenHandles]);

    // F4: Check if a person has children (for showing toggle button)
    const hasChildren = useCallback((handle: string): boolean => {
        if (!treeData) return false;
        return treeData.families.some(f =>
            (f.fatherHandle === handle || f.motherHandle === handle) && f.children.length > 0
        );
    }, [treeData]);

    // F3: Stats computed from full layout
    const treeStats = useMemo<TreeStats | null>(() => {
        if (!layout || !treeData) return null;
        return computeTreeStats(layout.nodes, treeData.families);
    }, [layout, treeData]);

    // F2: Generation stats for headers
    const generationStats = useMemo(() => {
        if (!layout) return new Map<number, number>();
        const map = new Map<number, number>();
        for (const n of layout.nodes) {
            const gen = n.generation + 1;
            map.set(gen, (map.get(gen) ?? 0) + 1);
        }
        return map;
    }, [layout]);

    // ═══ Viewport culling: only render visible nodes ═══
    const CULL_PAD = 300; // px padding around viewport

    const visibleNodes = useMemo(() => {
        if (!layout || viewportSize.width === 0) return layout?.nodes ?? [];
        const vw = viewportSize.width;
        const vh = viewportSize.height;
        const { x: tx, y: ty, scale } = transform;
        // Convert viewport rect to tree-space coordinates
        const left = (-tx / scale) - CULL_PAD;
        const top = (-ty / scale) - CULL_PAD;
        const right = ((vw - tx) / scale) + CULL_PAD;
        const bottom = ((vh - ty) / scale) + CULL_PAD;
        return layout.nodes.filter(n =>
            n.x + CARD_W >= left && n.x <= right &&
            n.y + CARD_H >= top && n.y <= bottom
        );
    }, [layout, transform, viewportSize]);

    const visibleHandles = useMemo(() => new Set(visibleNodes.map(n => n.node.handle)), [visibleNodes]);

    // Batched SVG paths for connections
    const { parentPaths, couplePaths, visibleCouples } = useMemo(() => {
        if (!layout || viewportSize.width === 0) return { parentPaths: '', couplePaths: '', visibleCouples: [] as PositionedCouple[] };
        let pp = '';
        let cp = '';
        const vc: PositionedCouple[] = [];
        // Only render connections where at least one endpoint is visible
        const vw = viewportSize.width;
        const vh = viewportSize.height;
        const { x: tx, y: ty, scale } = transform;
        const left = (-tx / scale) - CULL_PAD;
        const top = (-ty / scale) - CULL_PAD;
        const right = ((vw - tx) / scale) + CULL_PAD;
        const bottom = ((vh - ty) / scale) + CULL_PAD;
        const inView = (x: number, y: number) =>
            x >= left && x <= right && y >= top && y <= bottom;

        for (const c of layout.connections) {
            if (!inView(c.fromX, c.fromY) && !inView(c.toX, c.toY)) continue;

            if (c.type === 'couple') {
                cp += `M${c.fromX},${c.fromY}L${c.toX},${c.toY}`;
            } else {
                pp += `M${c.fromX},${c.fromY}L${c.toX},${c.toY}`;
            }
        }
        // Visible couples for hearts
        for (const c of layout.couples) {
            if (visibleHandles.has(c.fatherPos?.node.handle ?? '') || visibleHandles.has(c.motherPos?.node.handle ?? '')) {
                vc.push(c);
            }
        }
        return { parentPaths: pp, couplePaths: cp, visibleCouples: vc };
    }, [layout, transform, visibleHandles, viewportSize]);

    // Stable callbacks for PersonCard
    const handleCardHover = useCallback((h: string | null) => setHoveredHandle(h), []);
    const handleCardClick = useCallback((handle: string, x: number, y: number) => {
        if (editorMode) {
            setSelectedCard(handle);
            return;
        }
        setContextMenu({ handle, x, y });
    }, [editorMode]);
    const handleCardFocus = useCallback((handle: string) => {
        setFocusPerson(handle);
    }, []);

    // Search highlight
    useEffect(() => {
        if (!searchQuery || !treeData) {
            if (highlightHandles.size > 0) setHighlightHandles(new Set());
            return;
        }
        const q = searchQuery.toLowerCase();
        const matches = new Set(treeData.people.filter(p => p.displayName.toLowerCase().includes(q)).map(p => p.handle));
        setHighlightHandles(matches);
    }, [searchQuery, treeData, highlightHandles.size]);

    // Fit all
    const fitAll = useCallback(() => {
        if (!layout || !viewportRef.current) return;
        const vw = viewportRef.current.clientWidth;
        const vh = viewportRef.current.clientHeight;
        const pad = 40;
        const tw = layout.width + pad * 2;
        const th = layout.height + pad * 2;
        const scale = Math.max(Math.min(vw / tw, vh / th, 1.2), 0.12);
        setTransform({
            x: (vw - layout.width * scale) / 2,
            y: (vh - layout.height * scale) / 2,
            scale,
        });
    }, [layout]);

    // Auto-fit on first load
    useEffect(() => {
        if (layout && !loading) setTimeout(fitAll, 50);
    }, [layout, loading]); // eslint-disable-line

    // === Mouse handlers ===
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        dragRef.current = { startX: e.clientX, startY: e.clientY, startTx: transform.x, startTy: transform.y };
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setTransform(t => ({ ...t, x: dragRef.current.startTx + dx, y: dragRef.current.startTy + dy }));
    };
    const handleMouseUp = () => setIsDragging(false);

    // === Scroll-wheel zoom ===
    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setTransform(t => {
                const newScale = Math.min(Math.max(t.scale * delta, 0.15), 3);
                const ratio = newScale / t.scale;
                return { scale: newScale, x: mx - (mx - t.x) * ratio, y: my - (my - t.y) * ratio };
            });
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, []);

    // === Touch handlers ===
    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;

        let touching = false;

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 1) {
                touching = true;
                const t = e.touches[0];
                dragRef.current = { startX: t.clientX, startY: t.clientY, startTx: transform.x, startTy: transform.y };
            } else if (e.touches.length === 2) {
                const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                pinchRef.current = { initialDist: dist, initialScale: transform.scale };
            }
        };

        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            if (e.touches.length === 1 && touching) {
                const t = e.touches[0];
                const dx = t.clientX - dragRef.current.startX;
                const dy = t.clientY - dragRef.current.startY;
                setTransform(prev => ({ ...prev, x: dragRef.current.startTx + dx, y: dragRef.current.startTy + dy }));
            } else if (e.touches.length === 2) {
                const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                const ratio = dist / pinchRef.current.initialDist;
                const newScale = Math.min(Math.max(pinchRef.current.initialScale * ratio, 0.15), 3);

                const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                const rect = el.getBoundingClientRect();
                const mx = midX - rect.left;
                const my = midY - rect.top;

                setTransform(prev => {
                    const r = newScale / prev.scale;
                    return { scale: newScale, x: mx - (mx - prev.x) * r, y: my - (my - prev.y) * r };
                });
            }
        };

        const onTouchEnd = () => { touching = false; };

        el.addEventListener('touchstart', onTouchStart, { passive: false });
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        el.addEventListener('touchend', onTouchEnd);
        return () => {
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchmove', onTouchMove);
            el.removeEventListener('touchend', onTouchEnd);
        };
    }, [transform.x, transform.y, transform.scale]);

    // Pan to person
    const panToPerson = useCallback((handle: string) => {
        if (!layout || !viewportRef.current) return;
        const node = layout.nodes.find(n => n.node.handle === handle);
        if (!node) return;
        const vw = viewportRef.current.clientWidth;
        const vh = viewportRef.current.clientHeight;
        setTransform(t => ({
            ...t,
            x: vw / 2 - (node.x + CARD_W / 2) * t.scale,
            y: vh / 2 - (node.y + CARD_H / 2) * t.scale,
        }));
        setFocusPerson(handle);
    }, [layout]);

    // View mode
    const changeViewMode = (mode: ViewMode) => {
        if (mode !== 'full' && !focusPerson && treeData?.people[0]) setFocusPerson(treeData.people[0].handle);
        setViewMode(mode);
        // Auto-collapse based on view mode
        if (mode === 'full') {
            autoCollapseForPanoramic();
        } else if (mode === 'descendant') {
            const person = focusPerson || treeData?.people[0]?.handle;
            if (person) autoCollapseForDescendant(person);
        } else {
            setCollapsedBranches(new Set());
        }
    };

    // Copy shareable link
    const copyTreeLink = useCallback((handle: string) => {
        const url = `${window.location.origin}/tree?view=descendant&person=${handle}`;
        navigator.clipboard.writeText(url).then(() => {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        });
    }, []);

    // Search results
    const searchResults = useMemo(() => {
        if (!searchQuery || !treeData) return [];
        const q = searchQuery.toLowerCase();
        return treeData.people.filter(p => p.displayName.toLowerCase().includes(q)).slice(0, 8);
    }, [searchQuery, treeData]);

    // connPath kept for compatibility but unused with batched rendering

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
            {/* Header */}
            <div className="flex-none p-4 pb-2">
                <p className="text-surface-500 dark:text-surface-400 text-xs font-medium uppercase tracking-wider">
                    {layout ? `${layout.nodes.length} thành viên` : 'Đang tải...'}
                    {viewMode !== 'full' && focusPerson && (
                        <span className="ml-2 text-primary-500 font-bold">
                            {viewMode === 'ancestor' ? 'TỔ TIÊN' : 'HẬU DUỆ'} CỦA{' '}
                            <span className="underline decoration-primary-500/30 underline-offset-4 tracking-normal">
                                {treeData?.people.find(p => p.handle === focusPerson)?.displayName.toUpperCase()}
                            </span>
                        </span>
                    )}
                </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                {/* View modes */}
                <div className="flex glass-card border-white/10 dark:border-white/5 p-1 rounded-2xl shadow-xl">
                    {([['full', 'Toàn cảnh', Eye], ['ancestor', 'Tổ tiên', Users], ['descendant', 'Hậu duệ', GitBranch]] as const).map(([mode, label, Icon]) => (
                        <button key={mode} onClick={() => changeViewMode(mode)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-tight flex items-center gap-2 transition-all ${viewMode === mode ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-[1.02]' : 'text-surface-500 hover:text-surface-900 border border-transparent hover:border-white/20 hover:bg-white/5'}`}>
                            <Icon className="h-3.5 w-3.5" /> {label}
                        </button>
                    ))}
                </div>
                {/* Search */}
                <div className="relative">
                    <div className="relative w-56 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                        <Input placeholder="Tìm nhanh..." value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
                            onFocus={() => setShowSearch(true)}
                            className="pl-10 h-10 text-sm glass border-white/10 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500/50 shadow-inner" />
                    </div>
                    <AnimatePresence>
                        {showSearch && searchResults.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute z-50 w-64 right-0 top-12"
                            >
                                <Card className="glass-card rounded-2.5xl border-white/20 dark:border-white/10 shadow-2xl overflow-hidden">
                                    <CardContent className="p-2 max-h-64 overflow-y-auto">
                                        {searchResults.map(p => (
                                            <button key={p.handle} onClick={() => {
                                                setFocusPerson(p.handle);
                                                setViewMode('descendant');
                                                autoCollapseForDescendant(p.handle);
                                                setShowSearch(false);
                                                setSearchQuery('');
                                            }}
                                                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium hover:bg-primary-500/10 hover:text-primary-600 transition-all flex items-center justify-between group">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-surface-900">{p.displayName}</span>
                                                    <span className="text-[10px] text-surface-400">{'generation' in p ? `Đời thứ ${p.generation}` : ''}</span>
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                            </button>
                                        ))}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                {/* Controls */}
                <div className="flex glass-card border-white/10 dark:border-white/5 p-1 rounded-2xl shadow-xl">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-white/10" title="Thu gọn" onClick={collapseAll}><ChevronsDownUp className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-white/10" title="Mở rộng" onClick={expandAll}><ChevronsUpDown className="h-3.5 w-3.5" /></Button>
                    <div className="w-px bg-white/10 mx-1" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-white/10" onClick={() => setTransform(t => {
                        const vw = viewportRef.current?.clientWidth ?? 0; const vh = viewportRef.current?.clientHeight ?? 0;
                        const cx = vw / 2; const cy = vh / 2;
                        const ns = Math.min(t.scale * 1.3, 3); const r = ns / t.scale;
                        return { scale: ns, x: cx - (cx - t.x) * r, y: cy - (cy - t.y) * r };
                    })}><ZoomIn className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-white/10" onClick={() => setTransform(t => {
                        const vw = viewportRef.current?.clientWidth ?? 0; const vh = viewportRef.current?.clientHeight ?? 0;
                        const cx = vw / 2; const cy = vh / 2;
                        const ns = Math.max(t.scale / 1.3, 0.15); const r = ns / t.scale;
                        return { scale: ns, x: cx - (cx - t.x) * r, y: cy - (cy - t.y) * r };
                    })}><ZoomOut className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-white/10" onClick={fitAll}><Maximize2 className="h-3.5 w-3.5" /></Button>
                    {isAdmin && (
                        <>
                            <div className="w-px bg-white/10 mx-1" />
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 rounded-xl transition-all ${editorMode ? 'bg-primary-500 text-white shadow-lg' : 'hover:bg-white/10 text-primary-500'}`}
                                title={editorMode ? 'Tắt chỉnh sửa' : 'Chế độ chỉnh sửa'}
                                onClick={() => { setEditorMode(m => !m); setSelectedCard(null); }}
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Tree viewport + Editor panel row */}
            <div className="flex-1 flex gap-0 min-h-0 relative">
                <div ref={viewportRef}
                    className="flex-1 relative overflow-hidden rounded-[2.5rem] bg-slate-50 dark:bg-slate-950 glow-mesh cursor-grab active:cursor-grabbing select-none border border-white/10 shadow-2xl"
                    onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
                    onClick={() => { setShowSearch(false); setContextMenu(null); if (editorMode) setSelectedCard(null); }}
                >
                    {/* Ambient Background Orbs */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <motion.div
                            animate={{
                                x: [0, 100, 0],
                                y: [0, 50, 0],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary-500/10 blur-[120px] dark:bg-primary-500/5"
                        />
                        <motion.div
                            animate={{
                                x: [0, -100, 0],
                                y: [0, -50, 0],
                                scale: [1, 1.5, 1],
                            }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-accent-500/10 blur-[100px] dark:bg-accent-500/5"
                        />
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : layout && (
                        <div style={{
                            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                            transformOrigin: '0 0', width: layout.width, height: layout.height,
                            position: 'absolute', top: 0, left: 0,
                        }}>
                            {/* SVG connections — batched into 2 paths */}
                            <svg className="absolute inset-0 pointer-events-none" width={layout.width} height={layout.height}
                                style={{ overflow: 'visible' }}>
                                {parentPaths && (
                                    <path d={parentPaths}
                                        stroke="rgba(34, 197, 94, 0.3)"
                                        strokeWidth={1.5}
                                        fill="none"
                                        className="transition-colors duration-500"
                                    />
                                )}
                                {couplePaths && (
                                    <path d={couplePaths}
                                        stroke="rgba(234, 179, 8, 0.4)"
                                        strokeWidth={1.5}
                                        fill="none"
                                        strokeDasharray="5,4"
                                        className="transition-colors duration-500"
                                    />
                                )}
                                {/* Couple hearts — only visible */}
                                {visibleCouples.map(c => (
                                    <motion.text key={c.familyHandle}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        x={c.midX} y={c.y + CARD_H / 2 + 4}
                                        textAnchor="middle" fontSize="12" fill="#ef4444"
                                        className="drop-shadow-sm select-none"
                                    >❤️</motion.text>
                                ))}
                            </svg>

                            {/* DOM nodes — only visible (culled) */}
                            {visibleNodes.map(item => (
                                <MemoPersonCard key={item.node.handle} item={item}
                                    isHighlighted={highlightHandles.has(item.node.handle)}
                                    isFocused={focusPerson === item.node.handle}
                                    isHovered={hoveredHandle === item.node.handle}
                                    isSelected={editorMode && selectedCard === item.node.handle}
                                    zoomLevel={zoomLevel}
                                    showCollapseToggle={hasChildren(item.node.handle)}
                                    isCollapsed={collapsedBranches.has(item.node.handle)}
                                    onHover={handleCardHover}
                                    onClick={handleCardClick}
                                    onSetFocus={handleCardFocus}
                                    onToggleCollapse={toggleCollapse}
                                />
                            ))}

                            {/* F4: Branch summary cards for collapsed nodes */}
                            {Array.from(branchSummaries.entries()).map(([handle, summary]) => {
                                const parentNode = layout.nodes.find(n => n.node.handle === handle);
                                if (!parentNode) return null;
                                return (
                                    <BranchSummaryCard
                                        key={`summary-${handle}`}
                                        summary={summary}
                                        parentNode={parentNode}
                                        zoomLevel={zoomLevel}
                                        onExpand={() => toggleCollapse(handle)}
                                    />
                                );
                            })}

                            {/* Context menu on card */}
                            {contextMenu && treeData && (() => {
                                const person = treeData.people.find(p => p.handle === contextMenu.handle);
                                if (!person) return null;
                                return (
                                    <CardContextMenu
                                        person={person}
                                        x={contextMenu.x}
                                        y={contextMenu.y}
                                        onViewDetail={() => { router.push(`/people/${person.handle}`); setContextMenu(null); }}
                                        onShowDescendants={() => { setFocusPerson(person.handle); setViewMode('descendant'); setContextMenu(null); }}
                                        onShowAncestors={() => { setFocusPerson(person.handle); setViewMode('ancestor'); setContextMenu(null); }}
                                        onSetFocus={() => { panToPerson(person.handle); setContextMenu(null); }}
                                        onShowFull={() => { setViewMode('full'); setContextMenu(null); }}
                                        onCopyLink={() => { copyTreeLink(person.handle); setContextMenu(null); }}
                                        onContribute={() => { setContributePerson({ handle: person.handle, name: person.displayName }); setContextMenu(null); }}
                                        onClose={() => setContextMenu(null)}
                                    />
                                );
                            })()}
                        </div>
                    )}

                    {/* F2: Generation Row Headers */}
                    {layout && (
                        <GenerationHeaders
                            generationStats={generationStats}
                            transform={transform}
                            cardH={CARD_H}
                        />
                    )}

                    {/* F3: Stats Overlay Panel */}
                    {treeStats && zoomLevel === 'mini' && !statsHidden && (
                        <StatsOverlay stats={treeStats} onClose={() => setStatsHidden(true)} />
                    )}

                    {/* Zoom + culling indicator */}
                    <div className="absolute bottom-6 left-6 glass-card border-white/20 dark:border-white/10 rounded-2xl px-3 py-1.5 text-[11px] font-bold text-surface-500 flex items-center gap-3 shadow-xl backdrop-blur-xl">
                        <div className="flex items-center gap-1.5 text-primary-500">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{Math.round(transform.scale * 100)}%</span>
                        </div>
                        {layout && <div className="w-px h-3 bg-white/20" />}
                        {layout && (
                            <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                <span>{visibleNodes.length}/{layout.nodes.length} <span className="opacity-50 font-medium">hiện hữu</span></span>
                            </div>
                        )}
                    </div>

                    {/* Focus person selector */}
                    <AnimatePresence>
                        {viewMode !== 'full' && treeData && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="absolute bottom-6 right-6 glass-card border-white/20 dark:border-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-2xl backdrop-blur-3xl z-40"
                            >
                                <span className="text-[11px] font-black uppercase text-surface-400 tracking-widest">Gốc phả</span>
                                <select
                                    value={focusPerson || ''}
                                    onChange={e => setFocusPerson(e.target.value)}
                                    className="bg-white/5 dark:bg-black/20 border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none cursor-pointer pr-8 relative"
                                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '12px' }}
                                >
                                    {treeData.people.map(p => (
                                        <option key={p.handle} value={p.handle} className="bg-white dark:bg-slate-900">{p.displayName}</option>
                                    ))}
                                </select>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Link copied toast */}
                    {linkCopied && (
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 z-50">
                            <Copy className="w-3.5 h-3.5" /> Đã sao chép link!
                        </div>
                    )}
                </div>

                {/* Editor Sidebar Panel */}
                {editorMode && (
                    <EditorPanel
                        selectedCard={selectedCard}
                        treeData={treeData}
                        onReorderChildren={(familyHandle, newOrder) => {
                            setTreeData(prev => prev ? {
                                ...prev,
                                families: prev.families.map(f => f.handle === familyHandle ? { ...f, children: newOrder } : f)
                            } : null);
                            supaUpdateFamilyChildren(familyHandle, newOrder);
                        }}
                        onMoveChild={(childHandle, fromFamily, toFamily) => {
                            setTreeData(prev => {
                                if (!prev) return null;
                                const families = prev.families.map(f => {
                                    if (f.handle === fromFamily) return { ...f, children: f.children.filter(c => c !== childHandle) };
                                    if (f.handle === toFamily) return { ...f, children: [...f.children, childHandle] };
                                    return f;
                                });
                                supaMoveChild(childHandle, fromFamily, toFamily, prev.families);
                                return { ...prev, families };
                            });
                        }}
                        onRemoveChild={(childHandle, familyHandle) => {
                            setTreeData(prev => {
                                if (!prev) return null;
                                const families = prev.families.map(f =>
                                    f.handle === familyHandle ? { ...f, children: f.children.filter(c => c !== childHandle) } : f
                                );
                                supaRemoveChild(childHandle, familyHandle, prev.families);
                                return { ...prev, families };
                            });
                        }}
                        onToggleLiving={(handle, isLiving) => {
                            setTreeData(prev => prev ? {
                                ...prev,
                                people: prev.people.map(p => p.handle === handle ? { ...p, isLiving } : p)
                            } : null);
                            supaUpdatePersonLiving(handle, isLiving);
                        }}
                        onUpdatePerson={(handle, fields) => {
                            setTreeData(prev => {
                                if (!prev) return null;
                                return {
                                    ...prev,
                                    people: prev.people.map(p => p.handle === handle ? { ...p, ...fields } : p)
                                };
                            });
                            supaUpdatePerson(handle, fields);
                        }}
                        onReset={async () => {
                            const data = await fetchTreeData();
                            setTreeData(data);
                        }}
                        onClose={() => { setEditorMode(false); setSelectedCard(null); }}
                    />
                )}
            </div>

            {/* Legend */}
            <div className="flex gap-3 text-[10px] text-muted-foreground pt-1.5 px-1 flex-wrap">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-100 border border-blue-400" /> Nam (chính tộc)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-pink-100 border border-pink-400" /> Nữ (chính tộc)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-dashed border-slate-300" /> Ngoại tộc</span>
                <span className="flex items-center gap-1"><span className="text-red-500">❤</span> Vợ chồng</span>
                <span className="flex items-center gap-1 opacity-60"><span className="w-2.5 h-2.5 rounded-sm bg-slate-200 border border-slate-400" /> Đã mất</span>
                <span className="ml-auto opacity-50">Cuộn để zoom • Kéo để di chuyển • Nhấn để xem</span>
            </div>

            {/* Contribute dialog */}
            {contributePerson && (
                <ContributeDialog
                    personHandle={contributePerson.handle}
                    personName={contributePerson.name}
                    onClose={() => setContributePerson(null)}
                />
            )}
        </div>
    );
}

// === Card Context Menu ===
function CardContextMenu({ person, x, y, onViewDetail, onShowDescendants, onShowAncestors, onSetFocus, onShowFull, onCopyLink, onContribute }: {
    person: TreeNode;
    x: number;
    y: number;
    onViewDetail: () => void;
    onShowDescendants: () => void;
    onShowAncestors: () => void;
    onSetFocus: () => void;
    onShowFull: () => void;
    onCopyLink: () => void;
    onContribute: () => void;
    onClose: () => void;
}) {
    return (
        <div
            className="absolute z-50 animate-in fade-in zoom-in-95 duration-150"
            style={{ left: x + 8, top: y + 8 }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="glass-card border-white/20 dark:border-white/10 rounded-2xl shadow-2xl
                py-2 min-w-[220px] overflow-hidden backdrop-blur-3xl">
                {/* Header */}
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black
                            ${person.isPatrilineal
                                ? (person.gender === 1 ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-pink-500 text-white shadow-lg shadow-pink-500/30')
                                : 'bg-surface-200 text-surface-600'}`}>
                            {person.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-surface-900 truncate max-w-[130px] tracking-tight">{person.displayName}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-1.5 flex flex-col gap-0.5">
                    <MenuAction icon={<User className="w-4 h-4" />} label="Hồ sơ cá nhân" desc="Thông tin chi tiết" onClick={onViewDetail} />
                    <MenuAction icon={<ArrowDownToLine className="w-4 h-4" />} label="Xem hậu duệ" desc="Cây con cháu" onClick={onShowDescendants} />
                    <MenuAction icon={<ArrowUpFromLine className="w-4 h-4" />} label="Xem tổ tiên" desc="Cây cội nguồn" onClick={onShowAncestors} />
                    <MenuAction icon={<Crosshair className="w-4 h-4" />} label="Tâm điểm" desc="Căn giữa màn hình" onClick={onSetFocus} />
                    <div className="h-px bg-white/10 my-1 mx-2" />
                    <MenuAction icon={<Link className="w-4 h-4" />} label="Sao chép liên kết" desc="Link chia sẻ nhanh" onClick={onCopyLink} />
                    <MenuAction icon={<Eye className="w-4 h-4" />} label="Toàn cảnh" desc="Hiện toàn bộ phả" onClick={onShowFull} />
                    <div className="h-px bg-white/10 my-1 mx-2" />
                    <MenuAction icon={<MessageSquarePlus className="w-4 h-4" />} label="Đóng góp tu chỉnh" desc="Gửi yêu cầu sửa đổi" onClick={onContribute} />
                </div>
            </div>
        </div>
    );
}

function MenuAction({ icon, label, desc, onClick }: { icon: React.ReactNode; label: string; desc: string; onClick: () => void }) {
    return (
        <button
            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/10 active:bg-white/20
                rounded-xl transition-all text-left group"
            onClick={onClick}
        >
            <span className="text-surface-400 group-hover:text-primary-500 transition-colors flex-shrink-0 scale-110 group-hover:scale-125 duration-300">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-surface-700 group-hover:text-surface-950 transition-colors uppercase tracking-tight leading-none mb-0.5">{label}</p>
                <p className="text-[10px] text-surface-400 group-hover:text-surface-600 transition-colors">{desc}</p>
            </div>
        </button>
    );
}

// === Person Card Component (memoized) ===
const MemoPersonCard = memo(PersonCard, (prev, next) =>
    prev.item === next.item &&
    prev.isHighlighted === next.isHighlighted &&
    prev.isFocused === next.isFocused &&
    prev.isHovered === next.isHovered &&
    prev.isSelected === next.isSelected &&
    prev.zoomLevel === next.zoomLevel &&
    prev.showCollapseToggle === next.showCollapseToggle &&
    prev.isCollapsed === next.isCollapsed
);

function PersonCard({ item, isHighlighted, isFocused, isHovered, isSelected, zoomLevel, showCollapseToggle, isCollapsed, onHover, onClick, onSetFocus, onToggleCollapse }: {
    item: PositionedNode;
    isHighlighted: boolean;
    isFocused: boolean;
    isHovered: boolean;
    isSelected: boolean;
    zoomLevel: ZoomLevel;
    showCollapseToggle: boolean;
    isCollapsed: boolean;
    onHover: (h: string | null) => void;
    onClick: (handle: string, x: number, y: number) => void;
    onSetFocus: (handle: string) => void;
    onToggleCollapse: (handle: string) => void;
}) {
    const { node, x, y } = item;
    const isMale = node.gender === 1;
    const isFemale = node.gender === 2;
    const isDead = !node.isLiving;
    const isPatri = node.isPatrilineal;

    // ── Color system ──
    const dotColor = !isPatri ? '#94a3b8' : isMale ? '#10b981' : isFemale ? '#f472b6' : '#94a3b8';

    // F1: MINI zoom → just a colored dot with tooltip
    if (zoomLevel === 'mini') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute group"
                style={{ left: x + CARD_W / 2 - 6, top: y + CARD_H / 2 - 6, width: 12, height: 12 }}
                onMouseEnter={() => onHover(node.handle)}
                onMouseLeave={() => onHover(null)}
                onClick={(e) => { e.stopPropagation(); onClick(node.handle, x + CARD_W, y + CARD_H / 2); }}
            >
                <div className="w-3 h-3 rounded-full shadow-lg ring-2 ring-white/20" style={{ backgroundColor: dotColor }} />
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -top-10 left-1/2 -translate-x-1/2 z-50
                            bg-slate-900/90 backdrop-blur-md text-white text-[10px] px-2.5 py-1.5 rounded-xl shadow-2xl whitespace-nowrap pointer-events-none font-bold border border-white/10"
                        >
                            {node.displayName} <span className="opacity-50 mx-1">/</span> Đời {item.generation + 1}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    }

    // Extract initials
    const nameParts = node.displayName.split(' ');
    const initials = nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : node.displayName.slice(0, 2).toUpperCase();

    const avatarBg = !isPatri
        ? 'bg-stone-200 text-stone-600'
        : isMale
            ? (isDead ? 'bg-primary-900/20 text-primary-500' : 'bg-primary-500 text-white shadow-lg shadow-primary-500/30')
            : isFemale
                ? (isDead ? 'bg-pink-900/20 text-pink-500' : 'bg-pink-500 text-white shadow-lg shadow-pink-500/30')
                : 'bg-surface-200 text-surface-600';

    const glassBg = isDead ? 'opacity-60 grayscale-[0.3]' : '';

    const glowClass = isSelected ? 'ring-4 ring-primary-500 ring-offset-4 dark:ring-offset-slate-950 shadow-2xl shadow-primary-500/40 scale-[1.05]'
        : isHighlighted ? 'ring-2 ring-accent-500 ring-offset-2 scale-[1.02]'
            : isFocused ? 'ring-2 ring-primary-400 ring-offset-2'
                : isHovered ? 'scale-[1.03] shadow-2xl' : '';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute glass-card rounded-2.5xl border-white/10 dark:border-white/5 shadow-xl transition-all duration-500
                cursor-pointer ${glassBg} ${glowClass}`}
            style={{ left: x, top: y, width: CARD_W, height: CARD_H }}
            onMouseEnter={() => onHover(node.handle)}
            onMouseLeave={() => onHover(null)}
            onClick={(e) => { e.stopPropagation(); onClick(node.handle, x + CARD_W, y + CARD_H / 2); }}
            onContextMenu={(e) => { e.preventDefault(); onSetFocus(node.handle); }}
        >
            <div className={`absolute inset-0 rounded-2.5xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${isMale ? 'bg-primary-500/5' : 'bg-pink-500/5'}`} />

            <div className="px-3 py-2.5 h-full flex items-center gap-3 relative z-10">
                {/* Avatar area */}
                <div className="relative flex-shrink-0">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center
                            font-black text-base shadow-inner border border-white/10 ${avatarBg}`}
                    >
                        {initials}
                    </motion.div>
                    {isPatri && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-gradient-to-br from-primary-400 to-primary-600
                                text-white text-[8px] flex items-center justify-center shadow-lg font-black border-2 border-white dark:border-slate-900"
                        >
                            LÊ
                        </motion.div>
                    )}
                </div>

                {/* Info area */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-extrabold text-[12px] leading-tight text-surface-900 dark:text-surface-50 truncate tracking-tight">
                            {node.displayName}
                        </p>
                    </div>

                    <p className="text-[10px] font-bold text-surface-500 dark:text-surface-400 flex items-center gap-1">
                        <Badge variant="outline" className="h-3.5 px-1 text-[8px] font-black border-primary-500/30 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/20 rounded">
                            ĐỜI {item.generation + 1}
                        </Badge>
                        {node.birthYear && (
                            <span className="opacity-70 dark:opacity-90 tracking-tighter">
                                {node.birthYear} — {node.deathYear || (node.isLiving ? 'NAY' : '???')}
                            </span>
                        )}
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                        {isDead ? (
                            <span className="text-[8px] font-black text-surface-400 dark:text-surface-300 uppercase tracking-widest flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-surface-300 dark:bg-surface-500" /> Đã mất
                            </span>
                        ) : (
                            <span className="text-[8px] font-black text-primary-500 dark:text-primary-400 uppercase tracking-widest flex items-center gap-1">
                                <motion.span
                                    animate={{ opacity: [1, 0.4, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-1 h-1 rounded-full bg-primary-500 dark:bg-primary-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                                /> Còn sống
                            </span>
                        )}
                        {!isPatri && (
                            <Badge variant="secondary" className="h-3.5 px-1 text-[7.5px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-none">NGOẠI TỘC</Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Collapse toggle */}
            {showCollapseToggle && (
                <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 w-8 h-8 rounded-xl
                        glass border-white/20 shadow-2xl flex items-center justify-center
                        transition-all ${isCollapsed ? 'bg-accent-500 text-white border-accent-400' : 'bg-white/80 dark:bg-slate-900/80 text-surface-600 hover:text-primary-500'}`}
                    onClick={(e) => { e.stopPropagation(); onToggleCollapse(node.handle); }}
                    title={isCollapsed ? 'Mở rộng nhánh' : 'Thu gọn nhánh'}
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </motion.button>
            )}
        </motion.div>
    );
}

// === F4: Branch Summary Card ===
function BranchSummaryCard({ summary, parentNode, zoomLevel, onExpand }: {
    summary: BranchSummary;
    parentNode: PositionedNode;
    zoomLevel: ZoomLevel;
    onExpand: () => void;
}) {
    const x = parentNode.x;
    const y = parentNode.y + CARD_H + 40; // Position below parent with spacing

    if (zoomLevel === 'mini') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute group cursor-pointer"
                style={{ left: x + CARD_W / 2 - 8, top: y + CARD_H / 2 - 8, width: 16, height: 16 }}
                onClick={(e) => { e.stopPropagation(); onExpand(); }}
            >
                <div className="w-4 h-4 rounded-lg bg-orange-500 shadow-lg shadow-orange-500/30 flex items-center justify-center ring-2 ring-white/20">
                    <span className="text-[7px] text-white font-black">{summary.totalDescendants}</span>
                </div>
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        className="hidden group-hover:block absolute -top-12 left-1/2 -translate-x-1/2 z-50
                        bg-slate-900/90 backdrop-blur-md text-white text-[10px] px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap pointer-events-none font-bold border border-white/10"
                    >
                        📦 {summary.totalDescendants} người <span className="opacity-40 mx-1">/</span> Đời {summary.generationRange[0]}→{summary.generationRange[1]}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="absolute rounded-2.5xl glass-card border-orange-500/30 bg-orange-500/5
                shadow-xl cursor-pointer overflow-hidden"
            style={{ left: x, top: y, width: CARD_W, height: CARD_H }}
            onClick={(e) => { e.stopPropagation(); onExpand(); }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
            <div className="px-4 py-3 h-full flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600
                    flex items-center justify-center shadow-xl shadow-orange-500/20 flex-shrink-0 border border-white/20">
                    <Package className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-black text-[13px] leading-tight text-orange-600 uppercase tracking-tight">
                        📦 {summary.totalDescendants} Nhân khẩu
                    </p>
                    <p className="text-[10px] font-bold text-surface-500 mt-1 uppercase tracking-widest opacity-70">
                        Đời {summary.generationRange[0]} — {summary.generationRange[1]}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-tighter">
                        <span className="text-primary-600">● {summary.livingCount}</span>
                        <span className="text-surface-400">✝ {summary.deceasedCount}</span>
                        <Badge variant="secondary" className="ml-auto h-4 px-1.5 text-[8px] font-black bg-orange-100 dark:bg-orange-900/40 text-orange-600 border-none">MỞ RỘNG</Badge>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// === F2: Generation Row Headers ===
function GenerationHeaders({ generationStats, transform, cardH }: {
    generationStats: Map<number, number>;
    transform: { x: number; y: number; scale: number };
    cardH: number;
}) {
    const V_SPACE = 80; // Must match tree-layout.ts V_SPACE
    const entries = Array.from(generationStats.entries()).sort((a, b) => a[0] - b[0]);
    if (entries.length === 0) return null;

    return (
        <div className="absolute left-0 top-0 bottom-0 overflow-hidden pointer-events-none" style={{ width: 100 }}>
            {entries.map(([gen, count]) => {
                const rowY = (gen - 1) * (cardH + V_SPACE);
                const screenY = rowY * transform.scale + transform.y;
                // Only render if in viewport
                if (screenY < -60 || screenY > 2000) return null;
                return (
                    <div
                        key={gen}
                        className="absolute left-0 flex items-center text-[10px] transition-transform duration-100"
                        style={{
                            top: screenY + (cardH * transform.scale) / 2 - 10,
                            height: 20,
                        }}
                    >
                        <div className="bg-slate-900/90 dark:bg-slate-100/10 backdrop-blur-2xl text-white dark:text-white px-3 py-1.5 rounded-r-2xl
                            font-black whitespace-nowrap shadow-2xl border border-white/20 border-l-0 tracking-tighter text-[11px] uppercase">
                            Thế hệ {gen} <span className="opacity-50 mx-1">/</span> <span className="text-primary-400">{count}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// === F3: Stats Overlay Panel ===
function StatsOverlay({ stats, onClose }: { stats: TreeStats; onClose: () => void }) {
    const maxCount = Math.max(...stats.perGeneration.map(g => g.count));

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-6 right-6 w-72 glass-card border-white/20 dark:border-white/10
                rounded-[2rem] shadow-2xl z-40 pointer-events-auto overflow-hidden backdrop-blur-3xl"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-primary-500/10 rounded-xl text-primary-500">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest text-surface-900">Thông lục</span>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-surface-400 hover:text-surface-600 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-5 space-y-6">
                {/* Summary numbers */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Nhân khẩu', val: stats.total, color: 'text-primary-500' },
                        { label: 'Thế hệ', val: stats.totalGenerations, color: 'text-accent-500' },
                        { label: 'Gia đình', val: stats.totalFamilies, color: 'text-blue-500' }
                    ].map(item => (
                        <div key={item.label} className="flex flex-col items-center">
                            <span className={`text-xl font-black ${item.color} leading-none mb-1`}>{item.val}</span>
                            <span className="text-[10px] font-bold text-surface-400 uppercase tracking-tighter">{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Generation distribution */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest text-center">Phân phổ truyền đời</p>
                    <div className="space-y-2">
                        {stats.perGeneration.map(({ gen, count }) => (
                            <div key={gen} className="flex items-center gap-3 text-[10px] group">
                                <span className="w-8 text-right text-surface-500 font-black tracking-tighter uppercase whitespace-nowrap">Đời {gen}</span>
                                <div className="flex-1 h-2.5 bg-white/5 dark:bg-black/20 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(count / maxCount) * 100}%` }}
                                        transition={{ duration: 1, ease: "circOut" }}
                                        className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                                    />
                                </div>
                                <span className="w-6 text-surface-900 font-black text-right">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status breakdown */}
                <div className="pt-4 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {[
                            { label: 'Song đường', val: stats.livingCount, color: 'bg-primary-500' },
                            { label: 'Quy tiên', val: stats.deceasedCount, color: 'bg-surface-300' },
                            { label: 'Chính phối', val: stats.patrilinealCount, color: 'bg-blue-500' },
                            { label: 'Ngoại tộc', val: stats.nonPatrilinealCount, color: 'bg-stone-400' }
                        ].map(item => (
                            <div key={item.label} className="flex items-center justify-between text-[10px] font-bold">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                                    <span className="text-surface-500 uppercase tracking-tighter">{item.label}</span>
                                </div>
                                <span className="text-surface-900 font-black">{item.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// === Editor Panel Component ===
function EditorPanel({ selectedCard, treeData, onReorderChildren, onMoveChild, onRemoveChild, onToggleLiving, onUpdatePerson, onReset, onClose }: {
    selectedCard: string | null;
    treeData: { people: TreeNode[]; families: TreeFamily[] } | null;
    onReorderChildren: (familyHandle: string, newOrder: string[]) => void;
    onMoveChild: (childHandle: string, fromFamily: string, toFamily: string) => void;
    onRemoveChild: (childHandle: string, familyHandle: string) => void;
    onToggleLiving: (handle: string, isLiving: boolean) => void;
    onUpdatePerson: (handle: string, fields: Record<string, unknown>) => void;
    onReset: () => void;
    onClose: () => void;
}) {
    const [editName, setEditName] = useState('');
    const [editBirthYear, setEditBirthYear] = useState('');
    const [editDeathYear, setEditDeathYear] = useState('');
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [parentSearch, setParentSearch] = useState('');
    const [showParentDropdown, setShowParentDropdown] = useState(false);
    const parentSearchRef = useRef<HTMLDivElement>(null);

    const person = selectedCard && treeData ? treeData.people.find(p => p.handle === selectedCard) : null;

    // Sync local state when selection changes
    useEffect(() => {
        if (person) {
            const newName = person.displayName || '';
            const newBirth = person.birthYear?.toString() || '';
            const newDeath = person.deathYear?.toString() || '';

            if (editName !== newName) setEditName(newName);
            if (editBirthYear !== newBirth) setEditBirthYear(newBirth);
            if (editDeathYear !== newDeath) setEditDeathYear(newDeath);
            if (dirty) setDirty(false);
            if (parentSearch) setParentSearch('');
            if (showParentDropdown) setShowParentDropdown(false);
        }
    }, [person, editName, editBirthYear, editDeathYear, dirty, parentSearch, showParentDropdown]);

    // Close parent dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (parentSearchRef.current && !parentSearchRef.current.contains(e.target as Node)) {
                setShowParentDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!treeData) return null;

    // Find the family where this person is a parent
    const parentFamily = person
        ? treeData.families.find(f => f.fatherHandle === person.handle || f.motherHandle === person.handle)
        : null;

    // Find the family where this person is a child
    const childOfFamily = person
        ? treeData.families.find(f => f.children.includes(person.handle))
        : null;

    // Get parent person name
    const parentPerson = childOfFamily
        ? treeData.people.find(p => p.handle === childOfFamily.fatherHandle || p.handle === childOfFamily.motherHandle)
        : null;

    // Children of the selected person's family
    const children = parentFamily
        ? parentFamily.children.map(ch => treeData.people.find(p => p.handle === ch)).filter(Boolean) as TreeNode[]
        : [];

    // All families (for "change parent" dropdown) with labels
    const allParentFamilies = treeData.families.filter(f => f.fatherHandle || f.motherHandle);
    const parentFamiliesWithLabels = allParentFamilies.map(f => {
        const father = treeData.people.find(p => p.handle === f.fatherHandle);
        const gen = father ? father.generation : '';
        const label = father ? father.displayName : f.handle;
        return { ...f, label, gen };
    });

    // Filter parent families by search term
    const filteredParentFamilies = parentSearch.trim()
        ? parentFamiliesWithLabels.filter(f =>
            f.label.toLowerCase().includes(parentSearch.toLowerCase()) ||
            f.handle.toLowerCase().includes(parentSearch.toLowerCase())
        )
        : parentFamiliesWithLabels;

    const handleSave = async () => {
        if (!person || !dirty) return;
        setSaving(true);
        const fields: Record<string, unknown> = {};
        if (editName !== person.displayName) fields.displayName = editName;
        const newBirth = editBirthYear ? parseInt(editBirthYear) : null;
        if (newBirth !== (person.birthYear ?? null)) fields.birthYear = newBirth;
        const newDeath = editDeathYear ? parseInt(editDeathYear) : null;
        if (newDeath !== (person.deathYear ?? null)) fields.deathYear = newDeath;
        if (Object.keys(fields).length > 0) {
            onUpdatePerson(person.handle, fields);
        }
        setDirty(false);
        setSaving(false);
    };

    return (
        <div className="w-72 bg-background border-l flex flex-col overflow-hidden flex-shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b bg-blue-50">
                <div className="flex items-center gap-2">
                    <Pencil className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-800">Chỉnh sửa</span>
                </div>
                <div className="flex gap-1">
                    <button onClick={onReset} title="Khôi phục gốc" className="p-1 rounded hover:bg-blue-100 text-blue-600">
                        <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={onClose} className="p-1 rounded hover:bg-blue-100 text-blue-600">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {!person ? (
                <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-sm text-muted-foreground text-center">
                        Nhấn vào một card trên cây để chọn và chỉnh sửa
                    </p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto">
                    {/* Editable person info */}
                    <div className="p-3 border-b space-y-2">
                        <p className="text-xs text-muted-foreground">Đời {person.generation ?? '?'} · {person.handle}</p>
                        {parentPerson && (
                            <p className="text-xs text-muted-foreground">
                                Cha: <span className="font-medium text-foreground">{parentPerson.displayName}</span>
                            </p>
                        )}

                        {/* Editable Name */}
                        <div>
                            <label className="text-xs text-muted-foreground">Họ tên</label>
                            <input className="w-full border rounded px-2 py-1 text-sm bg-background" value={editName}
                                onChange={e => { setEditName(e.target.value); setDirty(true); }} />
                        </div>

                        {/* Birth / Death Year */}
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-xs text-muted-foreground">Năm sinh</label>
                                <input type="number" className="w-full border rounded px-2 py-1 text-sm bg-background" value={editBirthYear}
                                    onChange={e => { setEditBirthYear(e.target.value); setDirty(true); }} placeholder="—" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-muted-foreground">Năm mất</label>
                                <input type="number" className="w-full border rounded px-2 py-1 text-sm bg-background" value={editDeathYear}
                                    onChange={e => { setEditDeathYear(e.target.value); setDirty(true); }} placeholder="—" />
                            </div>
                        </div>

                        {/* Living status */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Trạng thái:</span>
                            <button
                                className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${person.isLiving
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                                onClick={() => onToggleLiving(person.handle, !person.isLiving)}
                            >
                                {person.isLiving ? '● Còn sống' : '○ Đã mất'}
                            </button>
                        </div>

                        {/* Save button */}
                        {dirty && (
                            <button
                                className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                onClick={handleSave} disabled={saving}
                            >
                                <Save className="h-3.5 w-3.5" />{saving ? 'Đang lưu...' : 'Lưu thay đổi → Supabase'}
                            </button>
                        )}
                    </div>

                    {/* Children reorder */}
                    {parentFamily && children.length > 0 && (
                        <div className="p-3 border-b">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                Con ({children.length})
                            </p>
                            <div className="space-y-1">
                                {children.map((child, idx) => (
                                    <div key={child.handle} className="flex items-center gap-1 group">
                                        <GripVertical className="h-3 w-3 text-muted-foreground/40" />
                                        <span className="flex-1 text-xs truncate">{child.displayName}</span>
                                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {idx > 0 && (
                                                <button
                                                    className="p-0.5 rounded hover:bg-muted"
                                                    title="Lên"
                                                    onClick={() => {
                                                        const newOrder = [...parentFamily.children];
                                                        [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
                                                        onReorderChildren(parentFamily.handle, newOrder);
                                                    }}
                                                >
                                                    <ArrowUp className="h-3 w-3" />
                                                </button>
                                            )}
                                            {idx < children.length - 1 && (
                                                <button
                                                    className="p-0.5 rounded hover:bg-muted"
                                                    title="Xuống"
                                                    onClick={() => {
                                                        const newOrder = [...parentFamily.children];
                                                        [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
                                                        onReorderChildren(parentFamily.handle, newOrder);
                                                    }}
                                                >
                                                    <ArrowDown className="h-3 w-3" />
                                                </button>
                                            )}
                                            <button
                                                className="p-0.5 rounded hover:bg-red-100 text-red-500"
                                                title="Xóa liên kết"
                                                onClick={() => {
                                                    if (confirm(`Xóa "${child.displayName}" khỏi danh sách con?`)) {
                                                        onRemoveChild(child.handle, parentFamily.handle);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Change parent — searchable */}
                    {childOfFamily && (
                        <div className="p-3 border-b" ref={parentSearchRef}>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                Đổi cha
                            </p>
                            {/* Current parent display */}
                            <p className="text-xs text-muted-foreground mb-1">
                                Hiện tại: <span className="font-medium text-foreground">{parentPerson?.displayName ?? childOfFamily.handle}</span>
                            </p>
                            {/* Searchable input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full border rounded px-2 py-1 text-xs bg-background placeholder:text-muted-foreground/60"
                                    placeholder="🔍 Tìm cha mới..."
                                    value={parentSearch}
                                    onChange={e => { setParentSearch(e.target.value); setShowParentDropdown(true); }}
                                    onFocus={() => setShowParentDropdown(true)}
                                />
                                {showParentDropdown && (
                                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border rounded shadow-lg max-h-48 overflow-y-auto">
                                        {filteredParentFamilies.length === 0 ? (
                                            <div className="px-2 py-2 text-xs text-muted-foreground text-center">
                                                Không tìm thấy
                                            </div>
                                        ) : (
                                            filteredParentFamilies.map(f => {
                                                const isSelected = f.handle === childOfFamily.handle;
                                                return (
                                                    <button
                                                        key={f.handle}
                                                        className={`w-full text-left px-2 py-1.5 text-xs hover:bg-blue-50 flex items-center gap-1 transition-colors ${isSelected ? 'bg-blue-100 font-semibold text-blue-700' : ''}`}
                                                        onClick={() => {
                                                            if (f.handle !== childOfFamily.handle) {
                                                                onMoveChild(person.handle, childOfFamily.handle, f.handle);
                                                            }
                                                            setShowParentDropdown(false);
                                                            setParentSearch('');
                                                        }}
                                                    >
                                                        <span className="truncate flex-1">{f.label}</span>
                                                        <span className="text-muted-foreground/60 shrink-0">Đ{f.gen}</span>
                                                        {isSelected && <span className="text-blue-600 shrink-0">✓</span>}
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
