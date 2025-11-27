import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, MapPin, ChevronDown, ChevronRight } from 'lucide-react';

import { useSaleProductsQuery } from '@/queries/useSalesProductsQuery';
import { useAuth } from '@/store/auth';
import { Link, useNavigate } from 'react-router';

import { useLocalitiesQuery } from '@/queries/useLocalityQuery';

import type { LocalityI } from '@/types/projects';
import { tanzaniaLocalityKey } from '@/types/constants';
import { Spinner } from '@/components/ui/spinner';

export default function MapShop() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocalityIds, setSelectedLocalityIds] = useState<string[]>([]);
    const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);
    const [showSearch, setShowSearch] = useState(true);
    const [showLocality, setShowLocality] = useState(true);
    const [showType, setShowType] = useState(true);

    const [treeData, setTreeData] = useState<LocalityI[]>([]);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [pendingNodeId, setPendingNodeId] = useState<string | null>(null);

    // Root localities (e.g. regions, using Tanzania root key)
    const { data: rootLocalities, isLoading: loadingRoot } = useLocalitiesQuery(tanzaniaLocalityKey);
    const { data: childLocalities, isLoading: loadingChildren } = useLocalitiesQuery(
        pendingNodeId ? parseInt(pendingNodeId) : 0
    );

    // Initialize tree with root localities
    useEffect(() => {
        if (rootLocalities) {
            setTreeData(rootLocalities);
        }
    }, [rootLocalities]);

    // When child localities load for a pending node, append them into tree
    useEffect(() => {
        if (pendingNodeId && childLocalities && childLocalities.length > 0) {
            setTreeData((prev) => [...prev, ...childLocalities]);
            setPendingNodeId(null);
        }
    }, [childLocalities, pendingNodeId]);

    const toggleNode = (nodeId: string) => {
        const next = new Set(expandedNodes);
        if (next.has(nodeId)) {
            next.delete(nodeId);
        } else {
            next.add(nodeId);

            const alreadyLoaded = treeData.some((item) => item.parent === nodeId);
            if (!alreadyLoaded) {
                setPendingNodeId(nodeId);
            }
        }
        setExpandedNodes(next);
    };

    const isLocalitySelected = (id: string) => selectedLocalityIds.includes(id);

    const handleLocalityToggle = (locality: LocalityI) => {
        setSelectedLocalityIds((prev) => {
            if (prev.includes(locality.id)) {
                return prev.filter((x) => x !== locality.id);
            }
            return [...prev, locality.id];
        });
    };

    const getChildren = (parentId: string) => treeData.filter((item) => item.parent == parentId);

    const renderTreeNode = (node: LocalityI) => {
        const children = getChildren(node.id);
        const isExpanded = expandedNodes.has(node.id);
        const isLoadingNode = pendingNodeId === node.id && loadingChildren;

        return (
            <div key={node.id}>
                <div className="flex items-center py-1">
                    {children.length > 0 || !expandedNodes.has(node.id) ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 mr-1"
                            onClick={() => toggleNode(node.id)}
                            disabled={isLoadingNode}
                        >
                            {isLoadingNode ? (
                                <Spinner className="h-4 w-4" />
                            ) : isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </Button>
                    ) : (
                        <div className="w-6 mr-1" />
                    )}

                    <div className="flex items-center space-x-2 flex-1">
                        <Checkbox
                            id={`loc-${node.id}`}
                            checked={isLocalitySelected(node.id)}
                            onCheckedChange={() => handleLocalityToggle(node)}
                            disabled={isLoadingNode}
                        />
                        <label
                            htmlFor={`loc-${node.id}`}
                            className="text-xs cursor-pointer line-clamp-1"
                        >
                            {node.name}
                        </label>
                    </div>
                </div>

                {isExpanded && children.length > 0 && (
                    <div className="border-l ml-3 pl-2">
                        {children.map((child) => renderTreeNode(child))}
                    </div>
                )}
            </div>
        );
    };

    const localityParam = selectedLocalityIds.length > 0 ? selectedLocalityIds.join(',') : undefined;

    const documentTypeParam = selectedDocTypes.length > 0 ? selectedDocTypes.join(',') : undefined;

    const { data, isLoading } = useSaleProductsQuery({
        is_active: '1',
        limit: 100,
        locality: localityParam,
        document_type: documentTypeParam,
    });
    const products = data?.results ?? [];

    const typeOptions = [
        'Plan Document',
        'Shapefile',
    ];

    const filtered = products.filter((p) => {
        const q = searchTerm.trim().toLowerCase();
        if (q) {
            const matchesText =
                p.name.toLowerCase().includes(q) ||
                (p.description ?? '').toLowerCase().includes(q);
            if (!matchesText) return false;
        }

        return true;
    });

    return (
        <div className="xl:container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <Card className="w-full md:w-56 lg:w-64 shrink-0 rounded-md">
                    <CardContent className="space-y-4 pt-4 text-sm">
                        <div className="space-y-2 border-b pb-3">
                            <button
                                type="button"
                                className="flex w-full items-center justify-between text-left"
                                onClick={() => setShowSearch((v) => !v)}
                            >
                                <span className="font-semibold text-xs tracking-wide">Search</span>
                                <span className="text-xs text-muted-foreground">{showSearch ? '-' : '+'}</span>
                            </button>
                            {showSearch && (
                                <div className="relative mt-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or description..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 h-9 text-sm"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 border-b pb-3">
                            <button
                                type="button"
                                className="flex w-full items-center justify-between text-left"
                                onClick={() => setShowLocality((v) => !v)}
                            >
                                <span className="font-semibold text-xs tracking-wide">Locality</span>
                                <span className="text-xs text-muted-foreground">{showLocality ? '-' : '+'}</span>
                            </button>
                            {showLocality && (
                                <div className="space-y-1 max-h-40 overflow-y-auto pr-1 mt-2">
                                    {loadingRoot ? (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Spinner className="h-3 w-3" /> Loading localities...
                                        </div>
                                    ) : !treeData.length ? (
                                        <p className="text-xs text-muted-foreground">No localities available.</p>
                                    ) : (
                                        treeData
                                            .filter((item) => item.parent == `${tanzaniaLocalityKey}`)
                                            .map((node) => renderTreeNode(node))
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 pb-3">
                            <button
                                type="button"
                                className="flex w-full items-center justify-between text-left"
                                onClick={() => setShowType((v) => !v)}
                            >
                                <span className="font-semibold text-xs tracking-wide">Type</span>
                                <span className="text-xs text-muted-foreground">{showType ? '-' : '+'}</span>
                            </button>
                            {showType && (
                                <div className="space-y-1 mt-2">
                                    {typeOptions.length === 0 && (
                                        <p className="text-xs text-muted-foreground">No types yet.</p>
                                    )}
                                    {typeOptions.map((type) => (
                                        <label key={type} className="flex items-center gap-2 text-xs cursor-pointer">
                                            <Checkbox
                                                checked={selectedDocTypes.includes(type)}
                                                onCheckedChange={(checked) => {
                                                    setSelectedDocTypes((prev) =>
                                                        checked
                                                            ? [...prev, type]
                                                            : prev.filter((v) => v !== type)
                                                    );
                                                }}
                                            />
                                            <span className="line-clamp-1">
                                                {type}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedLocalityIds([]);
                                setSelectedDocTypes([]);
                            }}
                        >
                            Clear all filters
                        </Button>
                    </CardContent>
                </Card>

                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold">
                            {isLoading ? 'Loading products…' : `${filtered.length} products found`}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map((product) => (
                            <Card key={product.id} className="flex flex-col h-full rounded-md overflow-hidden">
                                <div className="relative w-full pt-[66%] bg-muted">
                                    {product.thumbnail_url ? (
                                        <img
                                            src={product.thumbnail_url}
                                            alt={product.name}
                                            className="absolute inset-0 h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                                            No preview available
                                        </div>
                                    )}
                                    {product.target_label && (
                                        <div className="absolute bottom-1 left-1 right-1 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">
                                            <MapPin className="h-3 w-3" />
                                            <span className="truncate">{product.target_label}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 p-3 flex-1">
                                    <Link
                                        to={`/mapshop/products/${product.id}`}
                                        className="font-medium text-sm line-clamp-2 hover:underline"
                                    >
                                        {product.name}
                                    </Link>

                                    <div className="text-sm font-semibold">
                                        {product.currency_code ?? ''} {Number(product.base_price).toLocaleString()}
                                    </div>

                                    <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t">
                                        <div className="flex flex-wrap gap-1">
                                            <Badge variant="outline" className="text-[11px]">
                                                {product.content_type.replace(/_/g, ' ')}
                                            </Badge>
                                            {product.fee_name && (
                                                <Badge variant="secondary" className="text-[11px]">
                                                    {product.fee_name}
                                                </Badge>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            className="text-xs px-3"
                                            onClick={() => {
                                                if (!user) {
                                                    navigate(`/auth/signin?next=/mapshop/products/${product.id}&action=buy`);
                                                } else {
                                                    navigate(`/mapshop/products/${product.id}?action=buy`);
                                                }
                                            }}
                                        >
                                            Buy
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}

                        {!isLoading && filtered.length === 0 && (
                            <Card className="col-span-full text-center py-12">
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        No products match your search. Try clearing or changing the search text.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}