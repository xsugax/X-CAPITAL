"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProductCard, { type Product } from "@/components/commerce/ProductCard";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { commerceAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingCart,
  TrendingUp,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Rocket,
  Zap,
  Cpu,
  Globe,
  Filter,
} from "lucide-react";
import { useStore } from "@/store/useStore";

/* â”€â”€ category filter config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const CATEGORIES = [
  {
    key: "ALL",
    label: "All Products",
    icon: <Globe className="w-3.5 h-3.5" />,
  },
  { key: "EV", label: "Tesla / EV", icon: <Zap className="w-3.5 h-3.5" /> },
  { key: "SPACE", label: "Space", icon: <Rocket className="w-3.5 h-3.5" /> },
  { key: "AI", label: "AI Hardware", icon: <Cpu className="w-3.5 h-3.5" /> },
  {
    key: "COMPUTING",
    label: "Computing",
    icon: <Cpu className="w-3.5 h-3.5" />,
  },
  { key: "ENERGY", label: "Energy", icon: <Zap className="w-3.5 h-3.5" /> },
] as const;
type CategoryKey = (typeof CATEGORIES)[number]["key"];

export default function CommercePage() {
  const { wallet } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("ALL");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);
  const [bundleInvest, setBundleInvest] = useState(true);
  const [checking, setChecking] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    affiliateUrl?: string;
    investment?: { symbol: string; amount: number };
  } | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await commerceAPI.getProducts();
        setProducts(res.data.data.products ?? []);
      } catch {
        setProducts(DEMO_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openCheckout = (product: Product) => {
    setSelected(product);
    setBundleInvest(true);
    setCheckoutData(null);
    setMessage(null);
  };

  const handleCheckout = async () => {
    if (!selected) return;
    setChecking(true);
    setMessage(null);
    try {
      const res = await commerceAPI.checkout(selected.id, {
        paymentMethod: "FIAT",
        investmentBundle: bundleInvest,
      });
      setCheckoutData(res.data.data);
      setMessage({
        type: "success",
        text: "Checkout session created! Redirecting to purchaseâ€¦",
      });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setMessage({
        type: "error",
        text: e.response?.data?.message ?? "Checkout failed. Try again.",
      });
    } finally {
      setChecking(false);
    }
  };

  const sourceProducts = products.length > 0 ? products : DEMO_PRODUCTS;
  const displayProducts =
    activeCategory === "ALL"
      ? sourceProducts
      : sourceProducts.filter((p) => p.category === activeCategory);

  const teslaProducts = sourceProducts.filter((p) => p.category === "EV");
  const spaceProducts = sourceProducts.filter((p) => p.category === "SPACE");

  const evCount = sourceProducts.filter((p) => p.category === "EV").length;
  const spaceCount = sourceProducts.filter(
    (p) => p.category === "SPACE",
  ).length;

  return (
    <DashboardLayout
      title="Commerce"
      subtitle="Buy world-class products Â· Invest in the companies behind them"
    >
      <div className="space-y-8">
        {/* â”€â”€ Hero Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="relative overflow-hidden rounded-2xl border border-xc-border min-h-[200px]">
          {/* background image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1617704548623-340376564e68?w=640&q=70&auto=format&fit=crop"
              alt="Tesla vehicle panoramic"
              fill
              className="object-cover object-center"
              unoptimized
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-xc-black/95 via-xc-black/70 to-xc-black/30" />
          </div>
          {/* content */}
          <div className="relative z-10 px-8 py-8">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="w-5 h-5 text-xc-purple-light" />
              <span className="text-sm font-bold text-xc-purple-light tracking-wide uppercase">
                Commerce + Investment Rail
              </span>
              <Badge variant="purple" size="sm">
                LIVE
              </Badge>
            </div>
            <h2 className="text-3xl font-black text-white mb-3 leading-tight">
              Buy Real Products.
              <br />
              <span className="text-xc-purple-light">
                Own the Companies Behind Them.
              </span>
            </h2>
            <p className="text-sm text-white/70 max-w-xl leading-relaxed">
              X-CAPITAL's commerce rail executes product purchases and stock
              investments simultaneously. Every Tesla you buy is an entry into
              TSLA. Every NVIDIA server is an NVDA position. Every SpaceX
              terminal is a stake in the space economy â€” all settled in one
              transaction.
            </p>
            <div className="flex flex-wrap items-center gap-6 mt-5">
              <div className="text-center">
                <div className="text-2xl font-black text-white">{evCount}</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">
                  Tesla Models
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-black text-white">
                  {spaceCount}
                </div>
                <div className="text-xs text-white/50 uppercase tracking-wider">
                  Space Products
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-black text-white">
                  {sourceProducts.length}
                </div>
                <div className="text-xs text-white/50 uppercase tracking-wider">
                  Total Listed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* â”€â”€ Tesla Ecosystem Showcase â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {teslaProducts.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-red-400" />
                <h3 className="text-xl font-black text-white">
                  Tesla Ecosystem
                </h3>
              </div>
              <span className="text-xs bg-red-950/40 text-red-300 border border-red-700/30 px-2.5 py-0.5 rounded-full font-bold">
                {evCount} Models Available
              </span>
              <Badge variant="success" size="sm">
                Invest in TSLA
              </Badge>
            </div>

            {/* Wide panoramic Tesla banner */}
            <div className="relative h-48 rounded-2xl overflow-hidden mb-5 border border-red-900/20">
              <Image
                src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=640&q=70&auto=format&fit=crop"
                alt="Tesla Model S on the road"
                fill
                className="object-cover object-center"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-r from-red-950/85 to-transparent" />
              <div className="absolute inset-0 flex items-center px-8">
                <div>
                  <p className="text-xs font-bold text-red-300 uppercase tracking-widest mb-1">
                    Tesla, Inc. â€” NASDAQ: TSLA
                  </p>
                  <h4 className="text-2xl font-black text-white">
                    Every Purchase.
                    <br />
                    Every Mile. Every Watt.
                  </h4>
                  <p className="text-sm text-white/60 mt-2 max-w-sm">
                    Own the vehicle and invest in the revolution. Our Tesla
                    commerce rail routes 5% of your purchase price directly into
                    TSLA equity.
                  </p>
                </div>
              </div>
              {/* decorative right edge */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 text-right hidden lg:block">
                <div className="text-4xl font-black text-white/10 font-mono">
                  TSLA
                </div>
                <div className="text-lg font-mono font-bold text-red-400">
                  $0.05 / $1
                </div>
                <div className="text-xs text-white/40">
                  invested automatically
                </div>
              </div>
            </div>
          </section>
        )}

        {/* â”€â”€ Space Economy Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {spaceProducts.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-black text-white">Space Economy</h3>
              </div>
              <span className="text-xs bg-indigo-950/40 text-indigo-300 border border-indigo-700/30 px-2.5 py-0.5 rounded-full font-bold">
                {spaceCount} Space Products
              </span>
              <Badge variant="purple" size="sm">
                Exclusive
              </Badge>
            </div>

            {/* Rocket launch panoramic banner */}
            <div className="relative h-44 rounded-2xl overflow-hidden mb-5 border border-indigo-900/20">
              <Image
                src="https://images.unsplash.com/photo-1457364559154-aa2644600ebb?w=640&q=70&auto=format&fit=crop"
                alt="SpaceX rocket launch"
                fill
                className="object-cover object-center"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/90 to-transparent" />
              <div className="absolute inset-0 flex items-center px-8">
                <div>
                  <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">
                    Space Infrastructure Â· Connectivity
                  </p>
                  <h4 className="text-2xl font-black text-white">
                    The Final Frontier.
                    <br />
                    Is Now an Asset Class.
                  </h4>
                  <p className="text-sm text-white/60 mt-2 max-w-sm">
                    Access space-grade hardware while investing in the companies
                    building the space economy. Starlink terminals, satellite
                    data subscriptions, and SPV exposure.
                  </p>
                </div>
              </div>
              {/* animated rocket decoration */}
              <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-1">
                <div
                  className="text-5xl animate-bounce"
                  style={{ animationDuration: "3s" }}
                >
                  ðŸš€
                </div>
                <div className="w-0.5 h-8 bg-gradient-to-b from-orange-400/60 to-transparent" />
              </div>
            </div>
          </section>
        )}

        {/* â”€â”€ Category Filter Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-xc-muted" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
                activeCategory === cat.key
                  ? "bg-xc-purple border-purple-500 text-white shadow-lg shadow-purple-900/30"
                  : "bg-xc-dark/60 border-xc-border text-xc-muted hover:border-xc-purple/40 hover:text-white"
              }`}
            >
              {cat.icon}
              {cat.label}
              {cat.key !== "ALL" && (
                <span className="opacity-60">
                  {sourceProducts.filter((p) => p.category === cat.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* â”€â”€ Product Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[540px] rounded-2xl bg-xc-card border border-xc-border animate-pulse"
              />
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-20 text-xc-muted">
            <Globe className="w-10 h-10 mx-auto mb-4 opacity-40" />
            <p className="font-bold">No products in this category yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onCheckout={openCheckout}
              />
            ))}
          </div>
        )}

        {/* â”€â”€ Disclosure â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex items-start gap-3 text-xs text-xc-muted bg-xc-dark/40 border border-xc-border rounded-xl p-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-xc-muted" />
          <span>
            X-CAPITAL may receive referral compensation from merchant partners.
            Product prices may vary. Investment bundling executes as a separate
            market order via approved broker. Past performance of the associated
            stock does not predict future results. All investment activity is
            subject to applicable regulations.
          </span>
        </div>
      </div>

      {/* â”€â”€ Checkout Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Commerce Checkout"
        subtitle="Purchase + investment bundle"
        size="md"
      >
        {selected && (
          <div className="space-y-5">
            {/* product hero in modal */}
            <div className="relative h-40 rounded-xl overflow-hidden border border-xc-border bg-xc-dark">
              {selected.imageUrl ? (
                <>
                  <Image
                    src={selected.imageUrl}
                    alt={selected.imageAlt ?? selected.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-5xl">
                  {selected.imageEmoji}
                </div>
              )}
              <div className="absolute bottom-3 left-4">
                <div className="font-black text-white text-lg leading-tight">
                  {selected.name}
                </div>
                {selected.tagline && (
                  <div className="text-xs text-xc-purple-light">
                    {selected.tagline}
                  </div>
                )}
              </div>
              <div className="absolute bottom-3 right-4 text-right">
                <div className="text-xl font-black font-mono text-white">
                  {formatCurrency(selected.price)}
                </div>
              </div>
            </div>

            {/* description */}
            <p className="text-xs text-xc-muted leading-relaxed">
              {selected.description}
            </p>

            {/* specs if present */}
            {selected.specs && Object.keys(selected.specs).length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(selected.specs).map(([k, v]) => (
                  <div
                    key={k}
                    className="bg-xc-dark/60 rounded-lg px-3 py-2 border border-xc-border"
                  >
                    <div className="text-[9px] uppercase tracking-widest text-xc-muted font-semibold">
                      {k}
                    </div>
                    <div className="text-xs font-black text-white mt-0.5">
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* investment bundle toggle */}
            {selected.investmentSuggestion && (
              <div className="border border-xc-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-xc-border bg-black/20">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-xc-green" />
                    <span className="text-sm font-bold text-white">
                      Investment Bundle
                    </span>
                    <Badge variant="success" size="sm">
                      Recommended
                    </Badge>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-xc-muted">Include</span>
                    <div
                      className={`w-10 h-5 rounded-full transition-all cursor-pointer ${
                        bundleInvest ? "bg-xc-purple" : "bg-white/10"
                      }`}
                      onClick={() => setBundleInvest(!bundleInvest)}
                      role="switch"
                      aria-checked={bundleInvest}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white mt-0.5 transition-all duration-200 ${
                          bundleInvest ? "ml-5" : "ml-0.5"
                        }`}
                      />
                    </div>
                  </label>
                </div>
                {bundleInvest && (
                  <div className="px-4 py-3 bg-emerald-950/10 space-y-1">
                    <p className="text-xs text-xc-muted">
                      Invest{" "}
                      <span className="text-white font-semibold">
                        {formatCurrency(selected.investmentSuggestion.amount)}
                      </span>{" "}
                      in{" "}
                      <span className="text-xc-purple-light font-semibold">
                        ${selected.investmentSuggestion.symbol} â€”{" "}
                        {selected.investmentSuggestion.name}
                      </span>
                    </p>
                    <p className="text-xs text-xc-muted">
                      Available cash:{" "}
                      <span className="text-white font-semibold">
                        {formatCurrency(Number(wallet?.fiatBalance ?? 0))}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* order summary */}
            <div className="bg-xc-dark/40 rounded-xl p-4 space-y-2 text-sm border border-xc-border">
              <div className="flex justify-between">
                <span className="text-xc-muted">Product price</span>
                <span className="font-mono text-white">
                  {formatCurrency(selected.price)}
                </span>
              </div>
              {bundleInvest && selected.investmentSuggestion && (
                <div className="flex justify-between">
                  <span className="text-xc-muted">
                    ${selected.investmentSuggestion.symbol} investment
                  </span>
                  <span className="font-mono text-xc-green">
                    +{formatCurrency(selected.investmentSuggestion.amount)}
                  </span>
                </div>
              )}
              <div className="border-t border-white/5 pt-2 flex justify-between font-bold">
                <span className="text-xc-muted">Total</span>
                <span className="font-mono text-white">
                  {formatCurrency(
                    selected.price +
                      (bundleInvest && selected.investmentSuggestion
                        ? selected.investmentSuggestion.amount
                        : 0),
                  )}
                </span>
              </div>
            </div>

            {/* merchant redirect */}
            {checkoutData?.affiliateUrl && (
              <a
                href={checkoutData.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold bg-xc-dark/60 border border-xc-border hover:border-xc-purple/40 text-white transition-all"
              >
                Open Merchant Site <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* feedback */}
            {message && (
              <div
                className={`flex items-center gap-2 text-xs rounded-xl px-3 py-2 ${
                  message.type === "success"
                    ? "text-xc-green bg-emerald-950/30 border border-emerald-700/40"
                    : "text-xc-red bg-red-950/30 border border-red-700/40"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                {message.text}
              </div>
            )}

            <ModalFooter>
              <Button variant="ghost" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={checking}
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DEMO DATA â€” full product catalog
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const DEMO_PRODUCTS: Product[] = [
  // â”€â”€ Tesla lineup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: "tesla-model-x",
    name: "Tesla Model X Plaid",
    category: "EV",
    price: 89990,
    imageEmoji: "ðŸš—",
    imageUrl:
      "https://images.unsplash.com/photo-1617704548623-340376564e68?w=640&q=70&auto=format&fit=crop",
    imageAlt: "Tesla Model X Plaid in silver",
    tagline: "The quickest SUV ever made.",
    badge: "Bestseller",
    description:
      "Premium all-electric SUV with Plaid tri-motor drivetrain. 0â€“60 in 2.5 seconds, 333-mile range, falcon-wing doors, 22-speaker audio, and full Autopilot hardware.",
    specs: {
      Range: "333 mi",
      "0â€“60": "2.5 s",
      "Top Speed": "163 mph",
      Seats: "7",
      Cargo: "187 cu ft",
      Charge: "50 mi / 15 min",
    },
    features: [
      "Autopilot",
      "FSD Ready",
      "Over-the-Air Updates",
      "Supercharger",
      "Falcon Wings",
    ],
    highlights: [
      "World's fastest SUV production car",
      "Free Supercharging included",
    ],
    investmentSuggestion: {
      symbol: "TSLA",
      name: "Tesla, Inc.",
      percentage: 5,
      amount: 4499.5,
    },
    affiliateUrl: "https://tesla.com/modelx",
  },
  {
    id: "tesla-model-s-plaid",
    name: "Tesla Model S Plaid",
    category: "EV",
    price: 89990,
    imageEmoji: "ðŸŽï¸",
    imageUrl:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=640&q=70&auto=format&fit=crop",
    imageAlt: "Tesla Model S Plaid red",
    tagline: "1,020 hp. 0â€“60 in 1.99 s.",
    badge: "Plaid",
    description:
      "The most powerful production sedan ever built. Triple-motor Plaid architecture delivers 1,020 hp and a quarter-mile in 9.23 seconds. Range-topping 396-mile EPA estimate.",
    specs: {
      Range: "396 mi",
      "0â€“60": "1.99 s",
      "Peak Power": "1,020 hp",
      "Top Speed": "200 mph",
      "Charge Rate": "250 kW",
      Drive: "AWD",
    },
    features: [
      "Tri-Motor",
      "Autopilot",
      "FSD Ready",
      "Yoke Steering",
      "HEPA Filter",
    ],
    investmentSuggestion: {
      symbol: "TSLA",
      name: "Tesla, Inc.",
      percentage: 5,
      amount: 4499.5,
    },
    affiliateUrl: "https://tesla.com/models",
  },
  {
    id: "tesla-model-3",
    name: "Tesla Model 3 Long Range",
    category: "EV",
    price: 42990,
    imageEmoji: "ðŸš™",
    imageUrl:
      "https://images.unsplash.com/photo-1561580125-028ee3bd62eb?w=640&q=70&auto=format&fit=crop",
    imageAlt: "Tesla Model 3 white",
    tagline: "The world's most popular EV sedan.",
    description:
      "Long Range AWD Model 3 with 358-mile range, 4.2-second 0â€“60, and 17-inch glass cockpit. Dual-motor, full Autopilot hardware, and over-the-air software updates for life.",
    specs: {
      Range: "358 mi",
      "0â€“60": "4.2 s",
      "Top Speed": "145 mph",
      Motor: "Dual AWD",
      Screen: '15.4" + 8"',
      Sound: "13 Speaker",
    },
    features: [
      "Autopilot",
      "FSD Ready",
      "Glass Roof",
      "Supercharger",
      "OTA Updates",
    ],
    investmentSuggestion: {
      symbol: "TSLA",
      name: "Tesla, Inc.",
      percentage: 5,
      amount: 2149.5,
    },
    affiliateUrl: "https://tesla.com/model3",
  },
  {
    id: "tesla-model-y",
    name: "Tesla Model Y AWD",
    category: "EV",
    price: 47990,
    imageEmoji: "ðŸš",
    imageUrl:
      "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=640&q=70&auto=format&fit=crop",
    imageAlt: "Tesla Model Y crossover",
    tagline: "The world's best-selling vehicle.",
    description:
      "All-Wheel Drive crossover with 330-mile range, 7-seat configuration, and the largest cargo space in its class. The #1 best-selling vehicle globally for 2023 and 2024.",
    specs: {
      Range: "330 mi",
      "0â€“60": "4.8 s",
      Seats: "5â€“7",
      Cargo: "76 cu ft",
      Screen: '15.4"',
      Drive: "Dual AWD",
    },
    features: [
      "Autopilot",
      "FSD Ready",
      "Heat Pump",
      "Tow Hitch",
      "OTA Updates",
    ],
    investmentSuggestion: {
      symbol: "TSLA",
      name: "Tesla, Inc.",
      percentage: 5,
      amount: 2399.5,
    },
    affiliateUrl: "https://tesla.com/modely",
  },
  {
    id: "tesla-cybertruck",
    name: "Tesla Cybertruck Foundation",
    category: "EV",
    price: 99990,
    imageEmoji: "ðŸ›»",
    imageUrl:
      "https://images.unsplash.com/photo-1705771801928-4fceafdd6e55?w=640&q=70&auto=format&fit=crop",
    imageAlt: "Tesla Cybertruck Foundation Series",
    tagline: "Built for the future. Available now.",
    badge: "Limited",
    description:
      "Cyberbeast tri-motor Cybertruck in 30X cold-rolled stainless steel exoskeleton. 320-mile range, 0â€“60 in 2.6 seconds, 11,000 lb tow rating, and 120V/240V power export.",
    specs: {
      Range: "320 mi",
      "0â€“60": "2.6 s",
      Tow: "11,000 lb",
      Payload: "2,500 lb",
      Bed: "6 ft",
      "Power Export": "11.5 kW",
    },
    features: [
      "Cyberbeast AWD",
      "Air Suspension",
      "Bulletproof Body",
      "Vault Bed",
      "240V Export",
    ],
    investmentSuggestion: {
      symbol: "TSLA",
      name: "Tesla, Inc.",
      percentage: 5,
      amount: 4999.5,
    },
    affiliateUrl: "https://tesla.com/cybertruck",
  },
  {
    id: "tesla-powerwall",
    name: "Tesla Powerwall 3",
    category: "ENERGY",
    price: 11500,
    imageEmoji: "ðŸ”‹",
    imageUrl:
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=640&q=70&auto=format&fit=crop",
    imageAlt: "Tesla Powerwall home battery",
    tagline: "Whole-home backup power.",
    description:
      "Powerwall 3 with integrated 11.5 kW solar inverter, 13.5 kWh usable capacity, and Storm Watch automatic backup activation. Monitor and control from the Tesla app.",
    specs: {
      Capacity: "13.5 kWh",
      Power: "11.5 kW",
      Inverter: "Integrated",
      Efficiency: "97.5%",
      Warranty: "10 yr",
      Weight: "287 lbs",
    },
    features: [
      "Solar Ready",
      "Storm Watch",
      "Grid Arbitrage",
      "App Control",
      "10-Yr Warranty",
    ],
    investmentSuggestion: {
      symbol: "TSLA",
      name: "Tesla, Inc.",
      percentage: 8,
      amount: 920,
    },
    affiliateUrl: "https://tesla.com/powerwall",
  },

  // â”€â”€ Space Economy â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: "starlink-residential",
    name: "Starlink Residential Kit",
    category: "SPACE",
    price: 499,
    imageEmoji: "ðŸ“¡",
    imageUrl:
      "https://images.unsplash.com/photo-1457364559154-aa2644600ebb?w=640&q=70&auto=format&fit=crop",
    imageAlt: "SpaceX rocket launch",
    tagline: "High-speed internet from low orbit.",
    badge: "Space",
    description:
      "Second-generation Starlink dish with Gen 3 square design, built-in WiFi 6 router, and 100â€“300 Mbps speeds via LEO satellite constellation. Ships globally.",
    specs: {
      Download: "100â€“300 Mbps",
      Latency: "25â€“60 ms",
      "Dish Gen": "Gen 3",
      WiFi: "WiFi 6",
      Mounting: "Pipe / Roof",
      Warranty: "1 Year",
    },
    features: [
      "WiFi 6 Built-in",
      "Self-Orienting",
      "Bypass Mode",
      "Global Coverage",
      "Snow Melt",
    ],
    investmentSuggestion: {
      symbol: "XSPACE",
      name: "X-SPACE SPV Fund",
      percentage: 10,
      amount: 49.9,
    },
    affiliateUrl: "https://starlink.com",
  },
  {
    id: "starlink-roam",
    name: "Starlink Roam Global",
    category: "SPACE",
    price: 2500,
    imageEmoji: "ðŸ›°ï¸",
    imageUrl:
      "https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=640&q=70&auto=format&fit=crop",
    imageAlt: "SpaceX Falcon 9 at launch pad",
    tagline: "Internet anywhere on Earth.",
    badge: "Enterprise",
    description:
      "Starlink Roam flat-panel antenna for RVs, maritime, aviation, and remote operations. Global mobile data, priority access, 40 Mbps mobile / 220 Mbps when parked.",
    specs: {
      "Mobile Speed": "40 Mbps",
      "Parked Speed": "220 Mbps",
      Coverage: "Global",
      Mount: "Flat Panel",
      Power: "100W max",
      Service: "Roam Plan",
    },
    features: [
      "Global Roam",
      "Flat Panel",
      "Maritime Rated",
      "Aviation Ready",
      "Priority Data",
    ],
    investmentSuggestion: {
      symbol: "XSPACE",
      name: "X-SPACE SPV Fund",
      percentage: 12,
      amount: 300,
    },
    affiliateUrl: "https://starlink.com",
  },

  // â”€â”€ AI / Computing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: "nvidia-dgx-h100",
    name: "NVIDIA DGX H100",
    category: "AI",
    price: 250000,
    imageEmoji: "ðŸ–¥ï¸",
    imageUrl:
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=640&q=70&auto=format&fit=crop",
    imageAlt: "NVIDIA AI computing system",
    tagline: "The AI supercomputer. In a box.",
    badge: "Enterprise",
    description:
      "The NVIDIA DGX H100 delivers the definitive AI infrastructure platform â€” 8x H100 80GB GPUs interconnected at 3.2 Tbps NVLink bandwidth. Train frontier models on-premise.",
    specs: {
      GPUs: "8x H100 80GB",
      "GPU RAM": "640 GB HBM3",
      "GPU Link": "3.2 Tbps",
      CPU: "Dual Xeon",
      "System RAM": "2 TB DDR5",
      Storage: "30 TB NVMe",
    },
    features: [
      "H100 Tensor Core",
      "NVLink 4.0",
      "InfiniBand 400G",
      "CUDA 12.x",
      "DGX OS",
    ],
    investmentSuggestion: {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      percentage: 10,
      amount: 25000,
    },
    affiliateUrl: "https://nvidia.com/dgx",
  },
  {
    id: "macbook-pro-m4-max",
    name: "MacBook Pro M4 Max",
    category: "COMPUTING",
    price: 3499,
    imageEmoji: "ðŸ’»",
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=640&q=70&auto=format&fit=crop",
    imageAlt: "Apple MacBook Pro on desk",
    tagline: "Outrageous. Outrageously good.",
    badge: "New",
    description:
      "16-inch MacBook Pro with M4 Max chip featuring 16-core CPU, 40-core GPU, and up to 128 GB unified memory â€” purpose-built for LLM fine-tuning and video workflows.",
    specs: {
      Chip: "M4 Max",
      CPU: "16-Core",
      GPU: "40-Core",
      Memory: "128 GB",
      SSD: "8 TB",
      Battery: "22h",
    },
    features: [
      "M4 Max SoC",
      "128 GB Unified",
      "Mini-LED XDR",
      "Thunderbolt 5",
      "MagSafe 3",
    ],
    investmentSuggestion: {
      symbol: "AAPL",
      name: "Apple Inc.",
      percentage: 10,
      amount: 349.9,
    },
    affiliateUrl: "https://apple.com/macbook-pro",
  },
];
