"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Search, Loader2, Check } from "lucide-react";
import { getCoinList, type CryptoCoin } from "../lib/crypto-api";
import { addHolding } from "../lib/portfolio-store";
import { useTranslation } from "../i18n/LanguageContext";

interface AddAssetModalProps {
    open: boolean;
    onClose: () => void;
    onAdded: () => void;
}

export default function AddAssetModal({ open, onClose, onAdded }: AddAssetModalProps) {
    const { t } = useTranslation();
    const [step, setStep] = useState<"search" | "details">("search");
    const [coins, setCoins] = useState<CryptoCoin[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedCoin, setSelectedCoin] = useState<CryptoCoin | null>(null);
    const [quantity, setQuantity] = useState("");
    const [buyPrice, setBuyPrice] = useState("");
    const [saving, setSaving] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    const fetchCoins = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCoinList(100);
            setCoins(data);
        } catch {
            /* ignore */
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open && coins.length === 0) fetchCoins();
        if (open) {
            setStep("search");
            setSearch("");
            setSelectedCoin(null);
            setQuantity("");
            setBuyPrice("");
            setTimeout(() => searchRef.current?.focus(), 100);
        }
    }, [open, fetchCoins, coins.length]);

    if (!open) return null;

    const filtered = coins.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.symbol.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (coin: CryptoCoin) => {
        setSelectedCoin(coin);
        setBuyPrice(coin.current_price.toString());
        setStep("details");
    };

    const handleSave = () => {
        if (!selectedCoin || !quantity || !buyPrice) return;
        const qty = parseFloat(quantity);
        const price = parseFloat(buyPrice);
        if (isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) return;

        setSaving(true);
        addHolding({
            coinId: selectedCoin.id,
            coinName: selectedCoin.name,
            symbol: selectedCoin.symbol,
            image: selectedCoin.image,
            quantity: qty,
            buyPrice: price,
        });
        setTimeout(() => {
            setSaving(false);
            onAdded();
            onClose();
        }, 300);
    };

    const formatPrice = (v: number) =>
        v >= 1
            ? v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(4px)",
                    zIndex: 999,
                    animation: "fadeIn 0.15s ease",
                }}
            />

            {/* Modal */}
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "min(520px, 92vw)",
                    maxHeight: "85vh",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    animation: "slideUp 0.2s ease",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "18px 24px",
                        borderBottom: "1px solid var(--border)",
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--fg-primary)" }}>
                        {step === "search" ? t("myPortfolio.selectCoin") : t("myPortfolio.enterDetails")}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--fg-muted)",
                            cursor: "pointer",
                            padding: 4,
                            borderRadius: "var(--radius-md)",
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {step === "search" ? (
                    <>
                        {/* Search input */}
                        <div style={{ padding: "14px 24px 8px" }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "10px 14px",
                                    borderRadius: "var(--radius-md)",
                                    border: "1px solid var(--border)",
                                    background: "var(--bg-elevated)",
                                }}
                            >
                                <Search size={15} color="var(--fg-muted)" />
                                <input
                                    ref={searchRef}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t("myPortfolio.searchPlaceholder")}
                                    style={{
                                        flex: 1,
                                        border: "none",
                                        background: "transparent",
                                        color: "var(--fg-primary)",
                                        fontSize: 14,
                                        outline: "none",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Coin list */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px 16px" }}>
                            {loading ? (
                                <div style={{
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    gap: 8, padding: "40px 0", color: "var(--fg-muted)", fontSize: 13,
                                }}>
                                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                                    {t("coinDetail.loading")}
                                </div>
                            ) : (
                                filtered.slice(0, 50).map((coin) => (
                                    <button
                                        key={coin.id}
                                        onClick={() => handleSelect(coin)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                            width: "100%",
                                            padding: "10px 12px",
                                            borderRadius: "var(--radius-md)",
                                            border: "none",
                                            background: "transparent",
                                            cursor: "pointer",
                                            transition: "background 0.1s",
                                            textAlign: "left",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <img
                                            src={coin.image}
                                            alt={coin.name}
                                            width={32}
                                            height={32}
                                            style={{ borderRadius: "var(--radius-full)", flexShrink: 0 }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-primary)" }}>
                                                {coin.name}
                                            </div>
                                            <div style={{ fontSize: 11, color: "var(--fg-dim)", textTransform: "uppercase" }}>
                                                {coin.symbol}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-primary)", fontVariantNumeric: "tabular-nums" }}>
                                                ${formatPrice(coin.current_price)}
                                            </div>
                                            <div style={{
                                                fontSize: 11,
                                                fontWeight: 600,
                                                color: (coin.price_change_percentage_24h ?? 0) >= 0 ? "var(--risk-low)" : "var(--risk-high)",
                                            }}>
                                                {(coin.price_change_percentage_24h ?? 0) >= 0 ? "+" : ""}
                                                {(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                            {!loading && filtered.length === 0 && (
                                <div style={{ textAlign: "center", padding: "30px 0", color: "var(--fg-muted)", fontSize: 13 }}>
                                    {t("myPortfolio.noResults")}
                                </div>
                            )}
                        </div>
                    </>
                ) : selectedCoin && (
                    <div style={{ padding: "20px 24px" }}>
                        {/* Selected coin info */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "14px 16px",
                            borderRadius: "var(--radius-md)",
                            background: "var(--bg-elevated)",
                            marginBottom: 20,
                        }}>
                            <img
                                src={selectedCoin.image}
                                alt={selectedCoin.name}
                                width={40}
                                height={40}
                                style={{ borderRadius: "var(--radius-full)" }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--fg-primary)" }}>
                                    {selectedCoin.name}
                                </div>
                                <div style={{ fontSize: 12, color: "var(--fg-muted)", textTransform: "uppercase" }}>
                                    {selectedCoin.symbol} · ${formatPrice(selectedCoin.current_price)}
                                </div>
                            </div>
                            <button
                                onClick={() => setStep("search")}
                                style={{
                                    padding: "5px 12px",
                                    borderRadius: "var(--radius-md)",
                                    border: "1px solid var(--border)",
                                    background: "transparent",
                                    color: "var(--fg-secondary)",
                                    fontSize: 12,
                                    cursor: "pointer",
                                }}
                            >
                                {t("myPortfolio.change")}
                            </button>
                        </div>

                        {/* Quantity input */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--fg-secondary)", marginBottom: 6 }}>
                                {t("myPortfolio.quantity")}
                            </label>
                            <input
                                type="number"
                                step="any"
                                min="0"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="0.00"
                                style={{
                                    width: "100%",
                                    padding: "12px 14px",
                                    borderRadius: "var(--radius-md)",
                                    border: "1px solid var(--border)",
                                    background: "var(--bg-elevated)",
                                    color: "var(--fg-primary)",
                                    fontSize: 15,
                                    fontWeight: 600,
                                    outline: "none",
                                    fontVariantNumeric: "tabular-nums",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        {/* Buy price input */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--fg-secondary)", marginBottom: 6 }}>
                                {t("myPortfolio.buyPriceUSD")}
                            </label>
                            <input
                                type="number"
                                step="any"
                                min="0"
                                value={buyPrice}
                                onChange={(e) => setBuyPrice(e.target.value)}
                                placeholder="0.00"
                                style={{
                                    width: "100%",
                                    padding: "12px 14px",
                                    borderRadius: "var(--radius-md)",
                                    border: "1px solid var(--border)",
                                    background: "var(--bg-elevated)",
                                    color: "var(--fg-primary)",
                                    fontSize: 15,
                                    fontWeight: 600,
                                    outline: "none",
                                    fontVariantNumeric: "tabular-nums",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        {/* Preview */}
                        {quantity && buyPrice && (
                            <div style={{
                                padding: "12px 16px",
                                borderRadius: "var(--radius-md)",
                                background: "var(--accent-soft)",
                                border: "1px solid rgba(56,189,248,0.2)",
                                marginBottom: 20,
                                fontSize: 13,
                                color: "var(--fg-secondary)",
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                    <span>{t("myPortfolio.totalInvested")}</span>
                                    <strong style={{ color: "var(--fg-primary)" }}>
                                        ${(parseFloat(quantity) * parseFloat(buyPrice)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </strong>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>{t("myPortfolio.currentValue")}</span>
                                    <strong style={{ color: "var(--accent)" }}>
                                        ${(parseFloat(quantity) * selectedCoin.current_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </strong>
                                </div>
                            </div>
                        )}

                        {/* Save button */}
                        <button
                            onClick={handleSave}
                            disabled={!quantity || !buyPrice || saving}
                            style={{
                                width: "100%",
                                padding: "14px",
                                borderRadius: "var(--radius-md)",
                                border: "none",
                                background: (!quantity || !buyPrice) ? "var(--bg-active)" : "var(--accent)",
                                color: (!quantity || !buyPrice) ? "var(--fg-dim)" : "#fff",
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: (!quantity || !buyPrice) ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                transition: "all 0.15s",
                                boxShadow: (quantity && buyPrice) ? "0 0 20px rgba(56,189,248,0.3)" : "none",
                            }}
                        >
                            {saving ? (
                                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                            ) : (
                                <Check size={16} />
                            )}
                            {t("myPortfolio.addToPortfolio")}
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translate(-50%, -46%) } to { opacity: 1; transform: translate(-50%, -50%) } }
            `}</style>
        </>
    );
}
