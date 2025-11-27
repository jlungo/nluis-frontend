import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, ArrowLeft } from 'lucide-react';
import { useSaleProductsQuery } from '@/queries/useSalesProductsQuery';
import { useAuth } from '@/store/auth';
import { useCreateOrderFromProductMutation } from '@/queries/useCreateOrderFromProductMutation';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const createOrderMutation = useCreateOrderFromProductMutation();

  const productId = Number(id);

  const { data, isLoading } = useSaleProductsQuery({ is_active: '1', limit: 100 });
  const products = data?.results ?? [];

  const product = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId]
  );

  const handleBuy = async () => {
    if (!product) return;

    if (!user) {
      navigate(`/auth/signin?next=/mapshop/products/${product.id}&action=buy`);
    } else {
      try {
        const result = await createOrderMutation.mutateAsync({
          product_id: product.id,
          quantity: 1,
        });

        if (result.bill_id) {
          navigate(`/billing/bills/${result.bill_id}?product=${product.id}`);
        } else {
          navigate('/billing/bills');
        }
      } catch (e) {
        // For now we can stay on the page; later we can show a toast
        console.error('Failed to create order from product', e);
      }
    }
  };

  if (!id || Number.isNaN(productId)) {
    return (
      <div className="xl:container mx-auto px-4 py-6">
        <p className="text-sm text-muted-foreground">Invalid product id.</p>
      </div>
    );
  }

  if (isLoading && !product) {
    return (
      <div className="xl:container mx-auto px-4 py-6">
        <p className="text-sm text-muted-foreground">Loading product details…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="xl:container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/mapshop')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to MapShop
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="xl:container mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/mapshop')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to MapShop
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left: large preview */}
        <Card className="overflow-hidden rounded-md md:h-80 lg:h-[420px]">
          <div className="relative w-full h-full bg-muted">
            {product.thumbnail_url ? (
              <img
                src={product.thumbnail_url}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                No preview available
              </div>
            )}
            {product.target_label && (
              <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1 rounded bg-black/60 px-3 py-1 text-xs text-white">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{product.target_label}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Right: details & actions */}
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold mb-1 line-clamp-2">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {product.content_type && (
                <Badge variant="outline" className="text-[11px]">
                  {product.content_type.replace(/_/g, ' ')}
                </Badge>
              )}
              {product.fee_name && (
                <Badge variant="secondary" className="text-[11px]">
                  {product.fee_name}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Official map product</div>
            <div className="text-lg font-semibold">
              {product.currency_code ?? ''} {Number(product.base_price).toLocaleString()}
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            {product.description && (
              <p className="text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            )}
            {!product.description && (
              <p className="text-muted-foreground">
                Detailed description for this map product will appear here.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <div className="font-medium text-xs uppercase tracking-wide mb-1">Product ID</div>
              <div>{product.id}</div>
            </div>
            {product.target_label && (
              <div>
                <div className="font-medium text-xs uppercase tracking-wide mb-1">Coverage</div>
                <div>{product.target_label}</div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button size="sm" className="w-full md:w-auto" onClick={handleBuy}>
              Buy this product
            </Button>
            {!user && (
              <p className="text-xs text-muted-foreground">
                You will be asked to sign in or create an account before completing your purchase.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
