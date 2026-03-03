import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZoomIn, ZoomOut, Maximize, User, ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { useEmployees } from '../hooks';
import { Avatar, Card, FullPageLoader, EmptyState } from '../components/common';
import type { Employee } from '../types';
import { cn } from '../utils/cn';

// ─── Types ──────────────────────────────────────────────────────────────────
interface TreeNode {
    employee: Employee;
    children: TreeNode[];
}

// ─── Build tree from flat list ───────────────────────────────────────────────
function buildTree(employees: Employee[]): TreeNode[] {
    const map = new Map<number, TreeNode>();
    employees.forEach(e => map.set(e.id, { employee: e, children: [] }));

    const roots: TreeNode[] = [];
    employees.forEach(e => {
        const node = map.get(e.id)!;
        if (e.reportingManagerId && map.has(e.reportingManagerId)) {
            map.get(e.reportingManagerId)!.children.push(node);
        } else {
            roots.push(node);
        }
    });
    return roots;
}

// ─── Level colors ────────────────────────────────────────────────────────────
function getLevelStyle(level: number): { card: string; text: string; sub: string } {
    if (level >= 7) return { card: 'bg-kpmg-blue border-kpmg-blue shadow-md', text: 'text-white font-bold', sub: 'text-white/80 font-medium' };
    if (level === 6) return { card: 'bg-[#483698] border-[#483698] shadow-md', text: 'text-white font-bold', sub: 'text-white/80 font-medium' };
    if (level === 5) return { card: 'bg-kpmg-blue-light border-kpmg-blue-light shadow-md', text: 'text-white font-bold', sub: 'text-white/80 font-medium' };
    if (level === 4) return { card: 'bg-[#00A3A1] border-[#00A3A1] shadow-md', text: 'text-white font-bold', sub: 'text-white/80 font-medium' };
    return { card: 'bg-white border-[#E5E8EB] shadow-sm', text: 'text-text-primary font-bold', sub: 'text-text-muted font-bold' };
}

// ─── OrgNode ─────────────────────────────────────────────────────────────────
interface OrgNodeProps {
    node: TreeNode;
    isRoot?: boolean;
    highlightedId: number | null;
    onNavigate: (id: number) => void;
    nodeRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
    initiallyExpanded?: boolean;
}

function OrgNode({ node, isRoot = false, highlightedId, onNavigate, nodeRefs, initiallyExpanded = true }: OrgNodeProps) {
    const [expanded, setExpanded] = useState(initiallyExpanded);
    const emp = node.employee;
    const hasChildren = node.children.length > 0;
    const isHighlighted = highlightedId === emp.id;
    const style = getLevelStyle(emp.designationLevel);

    const setRef = useCallback((el: HTMLDivElement | null) => {
        if (el) nodeRefs.current.set(emp.id, el);
        else nodeRefs.current.delete(emp.id);
    }, [emp.id]);

    return (
        <div className="flex flex-col items-center" ref={setRef}>
            {/* Vertical connector from parent */}
            {!isRoot && <div className="w-px h-6 bg-gray-300 shrink-0" />}

            {/* Node card */}
            <div
                className={cn(
                    'relative min-w-[200px] max-w-[220px] rounded border transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 hover:shadow-lg',
                    style.card,
                    isHighlighted && 'ring-4 ring-kpmg-blue-light ring-offset-2 scale-105 z-10'
                )}
                title={`${emp.fullName} · ${emp.designationName}`}
            >
                <div className="p-3 flex items-center gap-2.5">
                    <Avatar name={emp.fullName} src={emp.profilePicUrl} size="md"
                        className="shrink-0 ring-2 ring-white/50" />
                    <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-bold truncate', style.text)}>{emp.fullName}</p>
                        <p className={cn('text-[11px] truncate', style.sub)}>{emp.designationName}</p>
                        <span className={cn(
                            'inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-sm mt-1 truncate max-w-full uppercase tracking-wider',
                            emp.designationLevel >= 4 ? 'bg-black/10 text-white/90' : 'bg-sidebar-active text-kpmg-blue border border-[#D0E1F9]'
                        )}>
                            {emp.department}
                        </span>
                    </div>
                </div>

                {/* Action buttons on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        title="View Profile"
                        onClick={e => { e.stopPropagation(); onNavigate(emp.id); }}
                        className={cn(
                            'p-1 rounded-full transition-colors',
                            emp.designationLevel >= 4 ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-100 text-gray-500'
                        )}
                    >
                        <User className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Expand / collapse + children */}
            {hasChildren && (
                <div className="flex flex-col items-center">
                    {/* Toggle button */}
                    <button
                        onClick={() => setExpanded(x => !x)}
                        className="z-20 w-5 h-5 -mt-1 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-500 hover:text-[#00338D] hover:border-[#00338D] shadow-sm transition-colors"
                        title={expanded ? 'Collapse' : `Expand (${node.children.length} direct reports)`}
                    >
                        {expanded
                            ? <ChevronDown className="w-3 h-3" />
                            : <ChevronRight className="w-3 h-3" />}
                    </button>

                    {/* Vertical line */}
                    <div className={cn('w-px bg-gray-300 transition-all duration-300', expanded ? 'h-6' : 'h-0')} />

                    {/* Children */}
                    <div className={cn(
                        'transition-all duration-300 origin-top',
                        expanded ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 h-0 overflow-hidden'
                    )}>
                        <div className="flex items-start gap-4 relative pt-0">
                            {/* Horizontal connector spanning all children */}
                            {node.children.length > 1 && (
                                <div
                                    className="absolute top-0 h-px bg-gray-300"
                                    style={{
                                        left: `calc(${100 / (node.children.length * 2)}% + 0.5rem)`,
                                        right: `calc(${100 / (node.children.length * 2)}% + 0.5rem)`,
                                    }}
                                />
                            )}
                            {node.children.map(child => (
                                <div key={child.employee.id} className="flex flex-col items-center px-2">
                                    {/* Vertical from horizontal bar down to child */}
                                    <div className="w-px h-6 bg-gray-300" />
                                    <OrgNode
                                        node={child}
                                        isRoot={true} // children draw their own top connector already
                                        highlightedId={highlightedId}
                                        onNavigate={onNavigate}
                                        nodeRefs={nodeRefs}
                                        initiallyExpanded={false}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function OrgChartPage() {
    const navigate = useNavigate();
    const [zoom, setZoom] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedId, setHighlightedId] = useState<number | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const nodeRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const canvasRef = useRef<HTMLDivElement>(null);

    // Fetch all employees for tree building
    const { data: empData, isLoading } = useEmployees(0, 300, 'id,asc');
    const allEmployees = empData?.content ?? [];

    // Build tree
    const treeRoots = useMemo(() => buildTree(allEmployees), [allEmployees]);

    // Search filter
    const searchResults = useMemo(() => {
        if (searchQuery.trim().length < 2) return [];
        const q = searchQuery.toLowerCase();
        return allEmployees
            .filter(e =>
                e.fullName.toLowerCase().includes(q) ||
                e.designationName.toLowerCase().includes(q) ||
                e.department.toLowerCase().includes(q)
            )
            .slice(0, 8);
    }, [searchQuery, allEmployees]);

    // Scroll highlighted node into view
    useEffect(() => {
        if (highlightedId != null) {
            const el = nodeRefs.current.get(highlightedId);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
    }, [highlightedId]);

    const handleSelectEmployee = (emp: Employee) => {
        setHighlightedId(emp.id);
        setSearchQuery(emp.fullName);
        setShowDropdown(false);
    };

    return (
        <div className="flex flex-col h-full">
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="shrink-0 bg-white border border-gray-100 rounded-xl shadow-sm p-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-20 relative">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary uppercase tracking-tight">Corporate Hierarchy</h1>
                    <p className="text-xs text-text-muted mt-1 font-bold uppercase tracking-wider">
                        {allEmployees.length} employees · Click nodes to expand, hover to view profile
                    </p>
                </div>

                <div className="flex gap-3 items-center w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:w-64">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                                onFocus={() => setShowDropdown(true)}
                                placeholder="Find employee..."
                                className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded focus:bg-white focus:border-kpmg-blue focus:ring-1 focus:ring-kpmg-blue outline-none transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => { setSearchQuery(''); setHighlightedId(null); setShowDropdown(false); }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Dropdown */}
                        {showDropdown && searchQuery.length >= 2 && (
                            <div className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-[#E5E8EB] rounded shadow-xl max-h-64 overflow-y-auto z-50">
                                {searchResults.length === 0 ? (
                                    <div className="py-6 text-center text-xs font-bold text-text-muted uppercase">No results found</div>
                                ) : (
                                    searchResults.map(emp => (
                                        <button
                                            key={emp.id}
                                            onClick={() => handleSelectEmployee(emp)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-sidebar-active transition-colors text-left border-b border-[#F1F3F5] last:border-0"
                                        >
                                            <Avatar name={emp.fullName} src={emp.profilePicUrl} size="sm" />
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm font-bold text-text-primary truncate">{emp.fullName}</p>
                                                <p className="text-[10px] text-text-muted font-bold truncate uppercase tracking-wider">{emp.designationName} · {emp.department}</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Zoom controls */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200 shrink-0">
                        <button onClick={() => setZoom(z => Math.max(z - 0.15, 0.3))}
                            className="p-1.5 text-gray-500 hover:text-[#00338D] hover:bg-white rounded transition-colors" title="Zoom Out">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-medium w-10 text-center text-gray-600">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(1)}
                            className="p-1.5 text-gray-500 hover:text-[#00338D] hover:bg-white rounded transition-colors" title="Reset Zoom">
                            <Maximize className="w-4 h-4" />
                        </button>
                        <button onClick={() => setZoom(z => Math.min(z + 0.15, 2.5))}
                            className="p-1.5 text-gray-500 hover:text-[#00338D] hover:bg-white rounded transition-colors" title="Zoom In">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Canvas ─────────────────────────────────────────── */}
            <Card className="flex-1 overflow-hidden relative bg-gray-50/60 border border-gray-200">
                {/* Legend */}
                <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded border border-[#E5E8EB] shadow-lg p-3 text-[10px] font-bold">
                    <p className="text-text-primary mb-2 uppercase tracking-tight">Level Colors</p>
                    {[
                        { color: 'bg-kpmg-blue', label: 'Partner' },
                        { color: 'bg-[#483698]', label: 'Director' },
                        { color: 'bg-kpmg-blue-light', label: 'Assistant Director' },
                        { color: 'bg-[#00A3A1]', label: 'Manager' },
                        { color: 'bg-white border border-[#E5E8EB]', label: 'Associate to Assistant Manager' },
                    ].map(({ color, label }) => (
                        <div key={label} className="flex items-center gap-2 mb-1.5 last:mb-0">
                            <div className={cn('w-3 h-3 rounded-sm shrink-0', color)} />
                            <span className="text-text-muted uppercase tracking-wider">{label}</span>
                        </div>
                    ))}
                </div>

                {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <FullPageLoader message="Building org chart…" />
                    </div>
                ) : treeRoots.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <EmptyState title="No hierarchy data" description="Could not build the organization tree." />
                    </div>
                ) : (
                    <div
                        ref={canvasRef}
                        className="w-full h-full overflow-auto p-12"
                        onClick={() => setShowDropdown(false)}
                    >
                        <div
                            className="transition-transform duration-300 origin-top w-max mx-auto"
                            style={{ transform: `scale(${zoom})` }}
                        >
                            {/* If multiple roots (shouldn't happen in practice), render side by side */}
                            <div className="flex gap-16">
                                {treeRoots.map(root => (
                                    <OrgNode
                                        key={root.employee.id}
                                        node={root}
                                        isRoot={true}
                                        highlightedId={highlightedId}
                                        onNavigate={id => navigate(`/employees/${id}`)}
                                        nodeRefs={nodeRefs}
                                        initiallyExpanded={true}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
