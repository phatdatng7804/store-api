const { useEffect, useState, useCallback } = React;

// ─── Constants ────────────────────────────────────────────────────────────────
const pages = [
  { key: "home", label: "🏠 Home" },
  { key: "catalog", label: "Catalog" },
  { key: "admin", label: "⚙️ Admin", adminOnly: true }
];

const categories = ["Women", "Men", "Street", "Office", "Accessories", "Sale"];
const sizes = ["XS", "S", "M", "L", "XL"];
const colors = ["Black", "Ivory", "Stone", "Denim", "Olive"];
const sortOptions = ["Newest", "Price: Low to High", "Price: High to Low", "Best Sellers"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatVND = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Không thể đọc file ảnh"));
    reader.readAsDataURL(file);
  });

const parseResponse = async (r) => {
  const raw = await r.text();
  const data = raw ? JSON.parse(raw) : null;
  if (!r.ok) {
    const message = data?.error || data?.message || `HTTP ${r.status}`;
    throw new Error(message);
  }
  return data;
};

const BASE_URL = "http://127.0.0.1:3000";

const api = {
  get: (url) => fetch(BASE_URL + url).then(parseResponse),
  post: (url, body) =>
    fetch(BASE_URL + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(parseResponse),
  put: (url, body) =>
    fetch(BASE_URL + url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(parseResponse),
  del: (url) => fetch(BASE_URL + url, { method: "DELETE" }).then(parseResponse),
  patch: (url, body) =>
    fetch(BASE_URL + url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(parseResponse),
};

// ─── Spinner ─────────────────────────────────────────────────────────────────
function Spinner() {
  return <div className="spinner" aria-label="Loading" />;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div className={`toast toast-${type || "info"}`} onClick={onClose}>
      {type === "success" && "✅ "}
      {type === "error" && "❌ "}
      {type === "info" && "ℹ️ "}
      {message}
    </div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({ product, variants, onAddToCart, user, onNavigate, onViewDetail }) {
  const defaultVariant = variants && variants[0];
  const purchasableVariant = variants?.find((v) => Number(v.stock || 0) > 0) || defaultVariant;
  const price = defaultVariant ? defaultVariant.price : null;
  const totalStock = (variants || []).reduce((sum, v) => sum + Number(v.stock || 0), 0);
  const inStock = totalStock > 0;
  const [qty, setQty] = useState(1);

  const handleAdd = () => {
    if (!user) {
      onNavigate("account");
      return;
    }
    if (!purchasableVariant || !inStock) return;
    onAddToCart(purchasableVariant.id, qty);
  };

  return (
    <article className="product-card">
      <div className="thumb" style={{ background: "linear-gradient(135deg, #2d2d3a, #1a1a2e)" }}>
        {product?.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name || "Product"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#a78bfa", fontSize: "2rem" }}>
            👗
          </div>
        )}
        <div className={inStock ? "stock-badge in" : "stock-badge out"}>
          {inStock ? "Còn hàng" : "Hết hàng"}
        </div>
      </div>
      <div className="product-info">
        <div className="line l1" style={{ fontWeight: 600, color: "#e2e8f0", fontSize: "0.9rem" }}>
          {product ? product.name : "—"}
        </div>
        <div className="line l2" style={{ color: "#a78bfa", fontSize: "0.85rem", marginTop: "0.25rem" }}>
          {price ? formatVND(price) : "—"}
        </div>
        <div className="swatches">
          {variants && variants.slice(0, 3).map((v) => (
            <span 
              key={v.id} 
              title={v.color?.name || ""} 
              style={{ backgroundColor: v.color?.hexcode || "var(--muted)" }}
            />
          ))}
        </div>
        <div className={inStock ? "stock-inline in" : "stock-inline out"}>
          {inStock ? `Còn ${totalStock} sản phẩm` : "Tạm hết hàng"}
        </div>
      </div>
      <button
        type="button"
        className="btn-add-cart"
        onClick={handleAdd}
        disabled={!inStock}
      >
        {!inStock ? "Hết hàng" : "🛒 Thêm vào giỏ"}
      </button>
      <div className="qty-picker">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={!inStock}
        >
          -
        </button>
        <span>{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(inStock ? totalStock : 1, q + 1))}
          disabled={!inStock}
        >
          +
        </button>
      </div>
      <button
        type="button"
        className="ghost small"
        style={{ margin: "0 .85rem .85rem" }}
        onClick={() => onViewDetail?.(product, variants)}
      >
        Xem chi tiết
      </button>
    </article>
  );
}

// ─── HomePage ────────────────────────────────────────────────────────────────
function HomePage({ products, variants, onAddToCart, user, onNavigate, onViewDetail }) {
  return (
    <section className="panel">
      <article className="hero">
        <div className="hero-copy">
          <p className="tag">NEW SEASON DROP</p>
          <h1>Thời trang hiện đại cho mọi phong cách</h1>
          <p>Khám phá bộ sưu tập mới nhất với chất lượng tốt nhất và phong cách độc đáo.</p>
          <div className="row">
            <button className="btn-main" type="button" onClick={() => onNavigate("catalog")}
            >
              Mua sắm ngay
            </button>
            <button className="ghost" type="button">Xem lookbook</button>
          </div>
        </div>
        <div className="hero-art">
          <img
            src="/panner.png"
            alt="Fashion Hero"
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "1rem" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/400x400.png?text=Fashion";
            }}
          />
        </div>
      </article>

      <article className="category-strip">
        {categories.map((item) => (
          <button key={item} type="button" className="chip" onClick={() => onNavigate("catalog")}>
            {item}
          </button>
        ))}
      </article>

      <article className="promo-grid">
        <div className="promo-card" style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
          ⚡ Flash Sale
        </div>
        <div className="promo-card" style={{ background: "linear-gradient(135deg, #0ea5e9, #2563eb)" }}>
          ⭐ Top Rated
        </div>
        <div className="promo-card" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
          🆕 New In
        </div>
        <div className="promo-card" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
          🎁 Bundle Deals
        </div>
      </article>

      <h2 style={{ padding: "1rem 0 0.5rem", color: "#e2e8f0" }}>Sản phẩm nổi bật</h2>
      <article className="product-grid">
        {products.slice(0, 8).map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            variants={variants.filter((v) => v.product?.id === p.id)}
            onAddToCart={onAddToCart}
            user={user}
            onNavigate={onNavigate}
            onViewDetail={onViewDetail}
          />
        ))}
        {products.length === 0 &&
          Array.from({ length: 4 }).map((_, i) => (
            <article key={i} className="product-card skeleton">
              <div className="thumb" />
              <div className="line l1" />
              <div className="line l2" />
            </article>
          ))}
      </article>
    </section>
  );
}

// ─── CatalogPage ──────────────────────────────────────────────────────────────
function CatalogPage({ products, variants, onAddToCart, user, onNavigate, onViewDetail }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // all | in | out

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || p.category?.name === selectedCategory;

    // Filter by color/size: check if product has any variant matching both filters
    const productVariants = variants.filter((v) => v.product?.id === p.id);
    const hasMatchingVariant = productVariants.some((v) => {
      const colorMatch = !selectedColor || v.color?.name === selectedColor;
      const sizeMatch = !selectedSize || v.size?.name === selectedSize;
      return colorMatch && sizeMatch;
    });

    const totalStock = productVariants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
    const matchStock =
      stockFilter === "all" ||
      (stockFilter === "in" && totalStock > 0) ||
      (stockFilter === "out" && totalStock <= 0);

    return matchSearch && matchCat && hasMatchingVariant && matchStock;
  });

  return (
    <section className="panel">
      <div className="toolbar">
        <input
          type="search"
          placeholder="🔍 Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
          <option value="">Tất cả màu</option>
          {colors.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
          <option value="">Kích cỡ</option>
          {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
          <option value="all">Tình trạng: Tất cả</option>
          <option value="in">Còn hàng</option>
          <option value="out">Hết hàng</option>
        </select>
      </div>

      <div className="product-grid">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            variants={variants.filter((v) => v.product?.id === p.id)}
            onAddToCart={onAddToCart}
            user={user}
            onNavigate={onNavigate}
            onViewDetail={onViewDetail}
          />
        ))}
        {filtered.length === 0 && (
          <div className="notice" style={{ gridColumn: "1/-1" }}>
            Không tìm thấy sản phẩm nào.
          </div>
        )}
      </div>
    </section>
  );
}

// ─── CartPage ────────────────────────────────────────────────────────────────
function CartPage({ user, cartCount, setCartCount, onNavigate }) {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.get(`/api/carts/user/${user.id}/items`);
      setCartData(data);
      setCartCount((data.items || []).length);
    } catch (e) {
      setMessage("Lỗi tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  }, [user, setCartCount]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const updateQty = async (itemId, qty) => {
    await api.put(`/api/carts/items/${itemId}/quantity`, { quantity: qty });
    loadCart();
  };

  const removeItem = async (itemId) => {
    await api.del(`/api/carts/items/${itemId}`);
    loadCart();
  };

  const clearCart = async () => {
    if (!window.confirm("Xóa tất cả sản phẩm trong giỏ hàng?")) return;
    await api.del(`/api/carts/user/${user.id}/clear`);
    loadCart();
  };

  if (!user) {
    return (
      <section className="panel">
        <div className="card centered-notice">
          <div style={{ fontSize: "4rem" }}>🛒</div>
          <h3>Vui lòng đăng nhập để xem giỏ hàng</h3>
          <button className="btn-main" type="button" onClick={() => onNavigate("account")}>
            Đăng nhập
          </button>
        </div>
      </section>
    );
  }

  const items = cartData?.items || [];
  const total = items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);

  return (
    <section className="panel layout-2">
      <article className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>🛒 Giỏ hàng ({items.length} sản phẩm)</h3>
          {items.length > 0 && (
            <button type="button" className="ghost small" onClick={clearCart}>
              Xóa tất cả
            </button>
          )}
        </div>

        {loading && <Spinner />}
        {message && <div className="notice error">{message}</div>}

        {items.length === 0 && !loading && (
          <div className="empty-cart">
            <div style={{ fontSize: "3rem" }}>🛍️</div>
            <p>Giỏ hàng trống</p>
            <button className="btn-main" type="button" onClick={() => onNavigate("catalog")}>
              Tiếp tục mua sắm
            </button>
          </div>
        )}

        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-thumb">👗</div>
              <div className="cart-item-info">
                <div className="cart-item-name">
                  {item.productVariant?.product?.name || "Sản phẩm"}
                </div>
                <div className="cart-item-meta">
                  {item.productVariant?.color?.name && (
                    <span className="chip light small">{item.productVariant.color.name}</span>
                  )}
                  {item.productVariant?.size?.name && (
                    <span className="chip light small">{item.productVariant.size.name}</span>
                  )}
                </div>
                <div className="cart-item-price">
                  {formatVND(item.productVariant?.price || 0)} × {item.quantity}
                </div>
              </div>
              <div className="cart-item-controls">
                <div className="qty-control">
                  <button type="button" onClick={() => updateQty(item.id, item.quantity - 1)}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateQty(item.id, item.quantity + 1)}>
                    +
                  </button>
                </div>
                <div className="cart-item-total">{formatVND(item.totalPrice)}</div>
                <button type="button" className="remove-btn" onClick={() => removeItem(item.id)}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="card">
        <h3>Tóm tắt đơn hàng</h3>
        <div className="summary-list">
          <p>Tạm tính <span>{formatVND(total)}</span></p>
          <p>Phí vận chuyển <span className="free">Miễn phí</span></p>
          <p className="total-row">Tổng cộng <span>{formatVND(total)}</span></p>
        </div>
        <button
          type="button"
          className="btn-main"
          disabled={items.length === 0}
          onClick={() => onNavigate("checkout")}
          style={{ width: "100%", marginTop: "1rem" }}
        >
          Tiến hành thanh toán →
        </button>
        <button
          type="button"
          className="ghost"
          style={{ width: "100%", marginTop: "0.5rem" }}
          onClick={() => onNavigate("catalog")}
        >
          Tiếp tục mua sắm
        </button>
      </article>
    </section>
  );
}

// ─── CheckoutPage ─────────────────────────────────────────────────────────────
function CheckoutPage({ user, onNavigate }) {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [form, setForm] = useState({
    receiverName: user?.fullName || "",
    receiverPhone: user?.phone || "",
    shippingAddress: "",
    note: "",
    paymentMethod: "MOMO",
    couponCode: ""
  });
  const [coupons, setCoupons] = useState([]);
  const [discountData, setDiscountData] = useState(null);
  const [showCoupons, setShowCoupons] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.get(`/api/carts/user/${user.id}/items`)
      .then(setCartData)
      .catch(() => setMessage({ text: "Lỗi tải giỏ hàng", type: "error" }))
      .finally(() => setLoading(false));

    api.get("/api/coupons")
      .then((data) => setCoupons((data || []).filter(c => c.active)))
      .catch(() => { });
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleApplyCoupon = async (codeToApply) => {
    const code = typeof codeToApply === "string" ? codeToApply : form.couponCode.trim();
    if (!code) return;
    const items = cartData?.items || [];
    const total = items.reduce((sum, i) => sum + Number(i.totalPrice || 0), 0);
    try {
      const res = await api.post("/api/coupons/validate", { code: code.toUpperCase(), orderTotal: total });
      if (res.error) {
        setDiscountData(null);
        setForm({ ...form, couponCode: "" });
        setMessage({ text: res.error, type: "error" });
      } else {
        setDiscountData(res);
        setForm({ ...form, couponCode: res.code });
        setMessage({ text: res.message, type: "success" });
      }
    } catch (e) {
      setDiscountData(null);
      setMessage({ text: "Lỗi áp dụng mã: " + e.message, type: "error" });
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!form.receiverName || !form.receiverPhone || !form.shippingAddress) {
      setMessage({ text: "Vui lòng điền đầy đủ thông tin giao hàng", type: "error" });
      return;
    }

    const items = cartData?.items || [];
    if (items.length === 0) {
      setMessage({ text: "Giỏ hàng trống!", type: "error" });
      return;
    }

    setPlacing(true);
    setMessage({ text: "", type: "" });

    try {
      if (form.paymentMethod === "MOMO") {
        const res = await api.post("/api/momo/create-payment", {
          userId: user.id,
          receiverName: form.receiverName,
          receiverPhone: form.receiverPhone,
          shippingAddress: form.shippingAddress,
          note: form.note,
          couponCode: discountData?.code || ""
        });

        if (res.error) {
          throw new Error(res.error);
        }

        if (res.payUrl) {
          // Redirect to MoMo payment
          setMessage({ text: "Đang chuyển tới MoMo...", type: "success" });
          setTimeout(() => { window.location.href = res.payUrl; }, 1000);
        } else {
          setMessage({ text: `Tạo đơn thành công! Mã đơn: ${res.orderId}. Kết quả: ${res.message}`, type: "info" });
        }
      } else {
        // COD: create order directly
        const res = await api.post("/api/orders/create", {
          userId: user.id,
          receiverName: form.receiverName,
          receiverPhone: form.receiverPhone,
          shippingAddress: form.shippingAddress,
          note: form.note,
          paymentMethod: form.paymentMethod,
          couponCode: discountData?.code || ""
        });
        if (res.error) throw new Error(res.error);
        setMessage({ text: "Đặt hàng thành công! Cảm ơn bạn.", type: "success" });
        setTimeout(() => onNavigate("orders"), 2000);
      }
    } catch (err) {
      setMessage({ text: "Lỗi: " + err.message, type: "error" });
    } finally {
      setPlacing(false);
    }
  };

  if (!user) {
    return (
      <section className="panel">
        <div className="card centered-notice">
          <h3>Vui lòng đăng nhập để thanh toán</h3>
          <button className="btn-main" type="button" onClick={() => onNavigate("account")}>
            Đăng nhập
          </button>
        </div>
      </section>
    );
  }

  const items = cartData?.items || [];
  const total = items.reduce((sum, i) => sum + Number(i.totalPrice || 0), 0);

  return (
    <section className="panel layout-2">
      <form onSubmit={handlePlaceOrder} style={{ display: "contents" }}>
        <article className="card">
          <h3>📦 Thông tin giao hàng</h3>

          {message.text && (
            <div className={`notice ${message.type}`}>{message.text}</div>
          )}

          <label>
            Tên người nhận *
            <input
              type="text"
              name="receiverName"
              value={form.receiverName}
              onChange={handleChange}
              placeholder="Họ và tên"
              required
            />
          </label>
          <label>
            Số điện thoại *
            <input
              type="tel"
              name="receiverPhone"
              value={form.receiverPhone}
              onChange={handleChange}
              placeholder="0909xxxxxx"
              required
            />
          </label>
          <label>
            Địa chỉ giao hàng *
            <textarea
              rows="3"
              name="shippingAddress"
              value={form.shippingAddress}
              onChange={handleChange}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
              required
            />
          </label>
          <label>
            Ghi chú
            <textarea
              rows="2"
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Ghi chú thêm (tuỳ chọn)"
            />
          </label>

          <h3 style={{ marginTop: "1.5rem", color: "var(--text)" }}>
            <span style={{ color: "#e83e8c", marginRight: "0.5rem" }}>🎟️</span>
            Mã giảm giá
          </h3>
          <select
            value={form.couponCode || ""}
            onChange={(e) => {
              const code = e.target.value;
              if (!code) {
                setDiscountData(null);
                setForm({ ...form, couponCode: "" });
                setMessage({ text: "Đã gỡ mã giảm giá", type: "info" });
              } else {
                handleApplyCoupon(code);
              }
            }}
            style={{ marginBottom: "1.5rem" }}
          >
            <option value="">Chọn mã giảm giá...</option>
            {coupons.length === 0 ? (
              <option disabled>Hiện chưa có mã giảm giá nào</option>
            ) : (
              coupons.map((c) => (
                <option key={c.id || c.code} value={c.code}>
                  {c.code} - Giảm {c.discountType === 'PERCENTAGE' ? c.discountValue + '%' : formatVND(c.discountValue)}{c.minOrderValue > 0 ? ` (Đơn từ ${formatVND(c.minOrderValue)})` : ""}
                </option>
              ))
            )}
          </select>

          <h3 style={{ marginTop: "1.5rem" }}>💳 Phương thức thanh toán</h3>
          <div className="payment-methods">
            {[
              { value: "MOMO", label: "💜 MoMo", desc: "Thanh toán qua ví MoMo (sandbox)" },
              { value: "COD", label: "💵 COD", desc: "Thanh toán khi nhận hàng" },
            ].map((pm) => (
              <label
                key={pm.value}
                className={`payment-method-card ${form.paymentMethod === pm.value ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={pm.value}
                  checked={form.paymentMethod === pm.value}
                  onChange={handleChange}
                  style={{ display: "none" }}
                />
                <div className="pm-icon">{pm.label}</div>
                <div className="pm-desc">{pm.desc}</div>
              </label>
            ))}
          </div>
        </article>

        <article className="card">
          <h3>🧾 Đơn hàng của bạn</h3>
          {loading ? (
            <Spinner />
          ) : (
            <>
              <div className="order-items-preview">
                {items.map((item) => (
                  <div key={item.id} className="order-item-row">
                    <span className="oi-name">
                      {item.productVariant?.product?.name || "Sản phẩm"} ×{item.quantity}
                    </span>
                    <span className="oi-price">{formatVND(item.totalPrice)}</span>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="notice">Giỏ hàng trống. Hãy thêm sản phẩm trước.</div>
                )}
              </div>
              <div className="summary-list" style={{ marginTop: "1rem" }}>
                <p>Tạm tính <span>{formatVND(total)}</span></p>
                <p>Phí vận chuyển <span className="free">Miễn phí</span></p>
                {discountData && (
                  <p>Giảm giá ({discountData.code}) <span className="free">-{formatVND(discountData.discountAmount)}</span></p>
                )}
                <p className="total-row">Tổng cộng <span>{formatVND(Math.max(0, total - Number(discountData?.discountAmount || 0)))}</span></p>
              </div>

              {form.paymentMethod === "MOMO" && (
                <div className="momo-badge">
                  <div className="momo-logo">M</div>
                  <div>
                    <strong>Thanh toán MoMo </strong>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#d8b4fe" }}>
                      Bạn sẽ được chuyển đến trang MoMo thanh toán
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className={`btn-main btn-place-order ${form.paymentMethod === "MOMO" ? "btn-momo" : ""}`}
                disabled={placing || items.length === 0}
                style={{ width: "100%", marginTop: "1.5rem" }}
              >
                {placing ? (
                  <span>Đang xử lý... <Spinner /></span>
                ) : form.paymentMethod === "MOMO" ? (
                  "💜 Thanh toán với MoMo"
                ) : (
                  "✅ Đặt hàng (COD)"
                )}
              </button>
            </>
          )}
        </article>
      </form>
    </section>
  );
}

// ─── PaymentResultPage ────────────────────────────────────────────────────────
function PaymentResultPage({ onNavigate }) {
  const [status, setStatus] = useState("loading");
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    // Parse MoMo callback params from URL
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const resultCode = params.get("resultCode");
    const transId = params.get("transId");
    const message = params.get("message");

    if (!orderId) {
      setStatus("error");
      setDetail({ message: "Không tìm thấy thông tin đơn hàng." });
      return;
    }

    // Call backend to confirm + record result
    api.get(
      `/api/momo/result?orderId=${encodeURIComponent(orderId)}&resultCode=${resultCode}&transId=${transId || ""}&message=${encodeURIComponent(message || "")}`
    ).then((data) => {
      setDetail(data);
      setStatus(data.resultCode === 0 || data.resultCode === "0" ? "success" : "failed");
    }).catch(() => {
      setStatus("error");
      setDetail({ message: "Không thể kết nối máy chủ." });
    });
  }, []);

  const icons = { loading: "⏳", success: "✅", failed: "❌", error: "⚠️" };
  const titles = {
    loading: "Đang xác nhận thanh toán...",
    success: "Thanh toán thành công!",
    failed: "Thanh toán thất bại",
    error: "Lỗi xác nhận"
  };

  return (
    <section className="panel">
      <div className="card payment-result-card">
        <div className="result-icon">{icons[status]}</div>
        <h2 className={`result-title result-${status}`}>{titles[status]}</h2>

        {status === "loading" && <Spinner />}

        {detail && status !== "loading" && (
          <div className="result-detail">
            {detail.dbOrderId && <p>Mã đơn hàng: <strong>#{detail.dbOrderId}</strong></p>}
            {detail.transId && <p>Mã giao dịch MoMo: <strong>{detail.transId}</strong></p>}
            {detail.message && <p className="result-msg">{detail.message}</p>}
            {detail.status && <p>Trạng thái: <span className={`status-badge status-${detail.status}`}>{detail.status}</span></p>}
          </div>
        )}

        <div className="result-actions">
          <button className="btn-main" type="button" onClick={() => { window.history.replaceState({}, "", "/"); onNavigate("orders"); }}>
            Xem đơn hàng của tôi
          </button>
          <button className="ghost" type="button" onClick={() => { window.history.replaceState({}, "", "/"); onNavigate("home"); }}>
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── OrdersPage ───────────────────────────────────────────────────────────────
function OrdersPage({ user, onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.get(`/api/orders/user/${user.id}`)
      .then(setOrders)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [user]);

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Hủy đơn hàng này?")) return;
    await api.patch(`/api/orders/${orderId}/cancel`, {});
    const updated = await api.get(`/api/orders/user/${user.id}`);
    setOrders(updated);
  };

  if (!user) {
    return (
      <section className="panel">
        <div className="card centered-notice">
          <h3>Vui lòng đăng nhập để xem đơn hàng</h3>
          <button className="btn-main" type="button" onClick={() => onNavigate("account")}>Đăng nhập</button>
        </div>
      </section>
    );
  }

  const statusColor = {
    PENDING: "#f59e0b",
    PAID: "#10b981",
    FAILED: "#ef4444",
    CANCELLED: "#6b7280"
  };

  return (
    <section className="panel layout-2">
      <article className="card">
        <h3>📋 Lịch sử đơn hàng</h3>
        {loading && <Spinner />}
        {orders.length === 0 && !loading && (
          <div className="empty-cart">
            <div style={{ fontSize: "3rem" }}>📦</div>
            <p>Chưa có đơn hàng nào</p>
            <button className="btn-main" type="button" onClick={() => onNavigate("catalog")}>
              Mua sắm ngay
            </button>
          </div>
        )}
        <div className="orders-list">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`order-row ${selected?.id === order.id ? "selected" : ""}`}
              onClick={() => setSelected(order)}
            >
              <div className="order-row-left">
                <strong>Đơn #{order.id}</strong>
                <span className="order-date">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "—"}
                </span>
              </div>
              <div className="order-row-right">
                <span className="order-total">{formatVND(order.totalAmount || 0)}</span>
                <span
                  className="status-badge"
                  style={{ background: statusColor[order.status] || "#6b7280" }}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="card">
        <h3>Chi tiết đơn hàng</h3>
        {selected ? (
          <div className="order-detail">
            <p><strong>Mã đơn:</strong> #{selected.id}</p>
            <p><strong>Trạng thái:</strong>{" "}
              <span className="status-badge" style={{ background: statusColor[selected.status] }}>
                {selected.status}
              </span>
            </p>
            <p><strong>Tổng tiền:</strong> {formatVND(selected.totalAmount || 0)}</p>
            <p><strong>Thanh toán:</strong> {selected.paymentMethod}</p>
            {selected.receiverName && <p><strong>Người nhận:</strong> {selected.receiverName}</p>}
            {selected.receiverPhone && <p><strong>Điện thoại:</strong> {selected.receiverPhone}</p>}
            {selected.shippingAddress && <p><strong>Địa chỉ:</strong> {selected.shippingAddress}</p>}
            {selected.momoTransId && <p><strong>Mã GD MoMo:</strong> {selected.momoTransId}</p>}
            {selected.status === "PENDING" && (
              <button
                type="button"
                className="ghost"
                style={{ marginTop: "1rem", color: "#ef4444", borderColor: "#ef4444" }}
                onClick={() => cancelOrder(selected.id)}
              >
                Hủy đơn hàng
              </button>
            )}
          </div>
        ) : (
          <div className="notice">Chọn một đơn hàng để xem chi tiết</div>
        )}
      </article>
    </section>
  );
}

// ─── AccountPage ──────────────────────────────────────────────────────────────
function AccountPage({ user, onLogin, onLogout, onRegister }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // Các tab trong khu vực tài khoản khi đã đăng nhập
  const [activeSection, setActiveSection] = useState("profile"); // profile | orders | vouchers
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);

  // Profile Edit
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    avatarUrl: user?.avatarUrl || ""
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        avatarUrl: user.avatarUrl || ""
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user || activeSection !== "orders") return;
    setOrdersLoading(true);
    api
      .get(`/api/orders/user/${user.id}`)
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [user, activeSection]);

  useEffect(() => {
    if (!user || activeSection !== "vouchers") return;
    api.get("/api/coupons")
      .then((data) => setCoupons((data || []).filter(c => c.active)))
      .catch(() => { });
  }, [user, activeSection]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setProfileForm((prev) => ({ ...prev, avatarUrl: dataUrl }));
    } catch (err) {
      setProfileMessage({ text: "Lỗi đọc ảnh: " + err.message, type: "error" });
    } finally {
      e.target.value = "";
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage({ text: "", type: "" });
    try {
      const payload = {
        ...user,
        fullName: profileForm.fullName,
        phone: profileForm.phone,
        avatarUrl: profileForm.avatarUrl
      };
      const res = await api.put(`/api/users/${user.id}`, payload);
      onLogin(res);
      setProfileMessage({ text: "Cập nhật hồ sơ thành công", type: "success" });
      setIsEditingProfile(false);
    } catch (err) {
      setProfileMessage({ text: "Lỗi: " + err.message, type: "error" });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch(BASE_URL + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setMessage({ text: "Đăng nhập thành công!", type: "success" });
        onLogin(data.user);
      } else {
        setMessage({ text: data.error || "Đăng nhập thất bại", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Lỗi: " + err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch(BASE_URL + "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, fullName, phone })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Đăng ký thành công! Vui lòng đăng nhập.", type: "success" });
        setIsLogin(true);
      } else {
        setMessage({ text: data.error || "Đăng ký thất bại", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Lỗi: " + err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    const statusColor = {
      PENDING: "#f59e0b",
      PAID: "#10b981",
      FAILED: "#ef4444",
      CANCELLED: "#6b7280"
    };

    return (
      <section className="panel account-layout">
        <aside className="card account-sidebar">
          <h3>Tài khoản</h3>
          <div className="account-user">
            <div className="profile-avatar" style={{ overflow: "hidden" }}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : "👤"}
            </div>
            <div className="account-user-meta">
              <div className="account-user-name">{user.fullName || user.username}</div>
              <div className="account-user-email">{user.email}</div>
            </div>
          </div>

          <nav className="account-nav">
            <button
              type="button"
              className={activeSection === "profile" ? "account-nav-btn active" : "account-nav-btn"}
              onClick={() => setActiveSection("profile")}
            >
              👤 Hồ sơ
            </button>
            <button
              type="button"
              className={activeSection === "orders" ? "account-nav-btn active" : "account-nav-btn"}
              onClick={() => setActiveSection("orders")}
            >
              📦 Đơn đã mua
            </button>
            <button
              type="button"
              className={activeSection === "vouchers" ? "account-nav-btn active" : "account-nav-btn"}
              onClick={() => setActiveSection("vouchers")}
            >
              🎟️ Phiếu giảm giá
            </button>
          </nav>

          <button
            type="button"
            className="account-logout"
            onClick={onLogout}
          >
            Đăng xuất
          </button>
        </aside>

        <article className="card account-content">
          {activeSection === "profile" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <h3 style={{ margin: 0 }}>👤 Thông tin hồ sơ</h3>
                {!isEditingProfile && (
                  <button type="button" className="ghost small" onClick={() => setIsEditingProfile(true)}>✎ Chỉnh sửa</button>
                )}
              </div>
              <p className="account-section-desc">
                Thông tin cơ bản của bạn dùng cho đặt hàng và liên hệ giao hàng.
              </p>

              {profileMessage.text && (
                <div className={`notice ${profileMessage.type}`} style={{ marginBottom: "1rem" }}>{profileMessage.text}</div>
              )}

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "0.5rem" }}>
                    <div className="profile-avatar" style={{ margin: 0, width: "80px", height: "80px", overflow: "hidden" }}>
                      {profileForm.avatarUrl ? (
                        <img src={profileForm.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : "👤"}
                    </div>
                    <div>
                      <label className="btn-main small" style={{ cursor: "pointer", display: "inline-block" }}>
                        Tải ảnh lên
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleAvatarUpload}
                        />
                      </label>
                      <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.5rem" }}></p>
                    </div>
                  </div>

                  <div className="account-form-grid">
                    <label>Tên đăng nhập <input type="text" value={user.username} disabled /></label>
                    <label>Email        <input type="email" value={user.email} disabled /></label>
                    <label>Họ tên       <input type="text" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} required /></label>
                    <label>Điện thoại   <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} required /></label>
                  </div>

                  <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                    <button type="submit" className="btn-main" disabled={profileSaving}>
                      {profileSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                    <button type="button" className="ghost" onClick={() => { setIsEditingProfile(false); setProfileMessage({ text: "", type: "" }); setProfileForm({ fullName: user.fullName || "", phone: user.phone || "", avatarUrl: user.avatarUrl || "" }); }}>
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="account-form-grid">
                  <label>Tên đăng nhập <input type="text" value={user.username} disabled /></label>
                  <label>Email        <input type="email" value={user.email} disabled /></label>
                  <label>Họ tên       <input type="text" value={user.fullName || ""} disabled /></label>
                  <label>Điện thoại   <input type="text" value={user.phone || ""} disabled /></label>
                </div>
              )}
            </>
          )}

          {activeSection === "orders" && (
            <>
              <h3>📦 Đơn hàng của tôi</h3>
              <p className="account-section-desc">
                Xem nhanh các đơn đã đặt và trạng thái thanh toán.
              </p>
              {ordersLoading && <Spinner />}
              {!ordersLoading && orders.length === 0 && (
                <div className="empty-cart">
                  <div style={{ fontSize: "3rem" }}>📭</div>
                  <p>Chưa có đơn hàng nào.</p>
                </div>
              )}
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-row">
                    <div className="order-row-left">
                      <strong>Đơn #{order.id}</strong>
                      <span className="order-date">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString("vi-VN")
                          : "—"}
                      </span>
                    </div>
                    <div className="order-row-right">
                      <span className="order-total">
                        {formatVND(order.totalAmount || 0)}
                      </span>
                      <span
                        className="status-badge"
                        style={{ background: statusColor[order.status] || "#6b7280" }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeSection === "vouchers" && (
            <>
              <h3>🎟️ Phiếu giảm giá</h3>
              <p className="account-section-desc">
                Nơi lưu trữ các mã giảm giá và ưu đãi dành riêng cho tài khoản của bạn.
              </p>
              <div className="orders-list">
                {coupons.length === 0 ? (
                  <div className="empty-cart">
                    <div style={{ fontSize: "3rem" }}>🎟️</div>
                    <p>Hiện chưa có mã giảm giá nào khả dụng.</p>
                  </div>
                ) : (
                  coupons.map((c) => (
                    <div key={c.id || c.code} className="order-row">
                      <div className="order-row-left">
                        <strong style={{ color: "var(--primary)", fontSize: "1.2rem", display: "block" }}>{c.code}</strong>
                        <div style={{ fontSize: "0.9rem", color: "var(--text-light)", marginTop: "0.2rem" }}>
                          {c.minOrderValue > 0 ? `Áp dụng đơn từ ${formatVND(c.minOrderValue)}` : "Dành cho mọi giá trị đơn hàng"}
                        </div>
                      </div>
                      <div className="order-row-right">
                        <span className="status-badge" style={{ background: "var(--primary)" }}>
                          Giảm {c.discountType === 'PERCENTAGE' ? c.discountValue + '%' : formatVND(c.discountValue)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </article>
      </section>
    );
  }

  return (
    <section className="panel">
      <article className="card" style={{ maxWidth: "480px", margin: "0 auto" }}>
        <div className="auth-tabs">
          <button
            type="button"
            className={isLogin ? "auth-tab active" : "auth-tab"}
            onClick={() => { setIsLogin(true); setMessage({ text: "", type: "" }); }}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={!isLogin ? "auth-tab active" : "auth-tab"}
            onClick={() => { setIsLogin(false); setMessage({ text: "", type: "" }); }}
          >
            Đăng ký
          </button>
        </div>

        {message.text && (
          <div className={`notice ${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          <label>
            Tên đăng nhập
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" required />
          </label>
          {!isLogin && (
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
            </label>
          )}
          <label>
            Mật khẩu
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </label>
          {!isLogin && (
            <>
              <label>
                Họ và tên
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" />
              </label>
              <label>
                Số điện thoại
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0909xxxxxx" />
              </label>
            </>
          )}
          <button type="submit" className="btn-main" disabled={loading} style={{ width: "100%", marginTop: "1rem" }}>
            {loading ? "Đang xử lý..." : (isLogin ? "Đăng nhập" : "Đăng ký")}
          </button>
        </form>
      </article>
    </section>
  );
}

// ─── AdminPage ────────────────────────────────────────────────────────────────
function AdminPage({ onToast }) {
  const modules = [
    { key: "products", label: "Sản phẩm", endpoint: "/api/admin/products" },
    { key: "categories", label: "Danh mục", endpoint: "/api/admin/categories" },
    { key: "variants", label: "Biến thể", endpoint: "/api/admin/product-variants" },
    { key: "users", label: "Người dùng", endpoint: "/api/admin/users" },
    { key: "orders", label: "Đơn hàng", endpoint: "/api/orders" },
    { key: "coupons", label: "Mã giảm giá", endpoint: "/api/coupons" }
  ];
  const [activeModule, setActiveModule] = useState("products");
  const [items, setItems] = useState([]);
  const [couponForm, setCouponForm] = useState({
    code: "",
    discountType: "FIXED",
    discountValue: "",
    minOrderValue: "",
    usageLimit: "",
    expiryDate: "",
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    active: true,
    categoryId: "",
    imageUrl: "",
    username: "",
    email: "",
    fullName: "",
    phone: "",
    password: "",
    roleCode: "USER"
  });
  const [variantForm, setVariantForm] = useState({
    productId: "",
    colorId: "",
    sizeId: "",
    name: "",
    price: "",
    stock: 0,
    sku: ""
  });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [allVariants, setAllVariants] = useState([]);
  const [stockFilter, setStockFilter] = useState("all"); // all | in | out

  const currentModule = modules.find((m) => m.key === activeModule);

  const loadItems = useCallback(async () => {
    if (!currentModule) return;
    setLoading(true);
    setActionMessage("");
    try {
      const data = await api.get(currentModule.endpoint);
      setItems(Array.isArray(data) ? data : []);
      setSelectedId(null);
    } catch (err) {
      setItems([]);
      setActionMessage("Lỗi tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentModule]);

  useEffect(() => { loadItems(); }, [activeModule]);

  useEffect(() => {
    api.get("/api/admin/categories")
      .then((data) => setCategoryOptions(Array.isArray(data) ? data : []))
      .catch((err) => {
        setCategoryOptions([]);
        onToast?.("Lỗi tải danh mục: " + err.message, "error");
      });
  }, []);

  useEffect(() => {
    api.get("/api/admin/products")
      .then((data) => setProductOptions(Array.isArray(data) ? data : []))
      .catch(() => setProductOptions([]));
    api.get("/api/admin/colors")
      .then((data) => setColorOptions(Array.isArray(data) ? data : []))
      .catch(() => setColorOptions([]));
    api.get("/api/admin/sizes")
      .then((data) => setSizeOptions(Array.isArray(data) ? data : []))
      .catch(() => setSizeOptions([]));
  }, []);

  useEffect(() => {
    api.get("/api/product-variants")
      .then((data) => setAllVariants(Array.isArray(data) ? data : []))
      .catch(() => setAllVariants([]));
  }, []);

  useEffect(() => {
    setSelectedId(null);
    setForm({ name: "", description: "", active: true, categoryId: "", imageUrl: "" });
    setVariantForm({
      productId: "",
      colorId: "",
      sizeId: "",
      name: "",
      price: "",
      stock: 0,
      sku: ""
    });
    setCouponForm({
      code: "",
      discountType: "FIXED",
      discountValue: "",
      minOrderValue: "",
      usageLimit: "",
      expiryDate: "",
      active: true
    });
    setStockFilter("all");
  }, [activeModule]);

  const supportsCrud = activeModule === "products" || activeModule === "categories" || activeModule === "users";
  const selectedItem = items.find((i) => i.id === selectedId) || null;
  const isProductModule = activeModule === "products";
  const isUsersModule = activeModule === "users";
  const isOrdersModule = activeModule === "orders";
  const isVariantModule = activeModule === "variants";
  const isCouponModule = activeModule === "coupons";

  const stockByProductId = allVariants.reduce((acc, variant) => {
    const pid = variant.product?.id;
    if (!pid) return acc;
    acc[pid] = (acc[pid] || 0) + Number(variant.stock || 0);
    return acc;
  }, {});

  const filteredItems = isProductModule
    ? items.filter((item) => {
      const stock = stockByProductId[item.id] || 0;
      if (stockFilter === "in") return stock > 0;
      if (stockFilter === "out") return stock <= 0;
      return true;
    })
    : items;

  const uiColorOptions = colors
    .map((name) => colorOptions.find((c) => c.name?.toLowerCase() === name.toLowerCase()))
    .filter(Boolean);
  const uiSizeOptions = sizes
    .map((name) => sizeOptions.find((s) => s.name?.toLowerCase() === name.toLowerCase()))
    .filter(Boolean);

  useEffect(() => {
    if (isCouponModule) {
      if (!selectedItem) {
        setCouponForm({
          code: "",
          discountType: "FIXED",
          discountValue: "",
          minOrderValue: "",
          usageLimit: "",
          expiryDate: "",
          active: true
        });
        return;
      }
      setCouponForm({
        code: selectedItem.code || "",
        discountType: selectedItem.discountType || "FIXED",
        discountValue: selectedItem.discountValue != null ? String(selectedItem.discountValue) : "",
        minOrderValue: selectedItem.minOrderValue != null ? String(selectedItem.minOrderValue) : "",
        usageLimit: selectedItem.usageLimit != null ? String(selectedItem.usageLimit) : "",
        expiryDate: selectedItem.expiryDate ? selectedItem.expiryDate.substring(0, 16) : "",
        active: selectedItem.active !== false
      });
      return;
    }
    if (isVariantModule) {
      if (!selectedItem) {
        setVariantForm({
          productId: "",
          colorId: "",
          sizeId: "",
          name: "",
          price: "",
          stock: 0,
          sku: ""
        });
        return;
      }
      setVariantForm({
        productId: selectedItem.product?.id ? String(selectedItem.product.id) : "",
        colorId: selectedItem.color?.id ? String(selectedItem.color.id) : "",
        sizeId: selectedItem.size?.id ? String(selectedItem.size.id) : "",
        name: selectedItem.name || "",
        price: selectedItem.price != null ? String(selectedItem.price) : "",
        stock: Number(selectedItem.stock || 0),
        sku: selectedItem.sku || ""
      });
      return;
    }
    if (!supportsCrud) return;
    if (!selectedItem) {
      setForm({
        name: "",
        description: "",
        active: true,
        categoryId: "",
        imageUrl: "",
        username: "",
        email: "",
        fullName: "",
        phone: "",
        password: "",
        roleCode: "USER"
      });
      return;
    }

    if (isUsersModule) {
      setForm({
        name: "",
        description: "",
        active: true,
        categoryId: "",
        imageUrl: "",
        username: selectedItem.username || "",
        email: selectedItem.email || "",
        fullName: selectedItem.fullName || "",
        phone: selectedItem.phone || "",
        password: "",
        roleCode: selectedItem.role?.code || "USER"
      });
      return;
    }

    setForm({
      name: selectedItem.name || "",
      description: selectedItem.description || "",
      active: selectedItem.active !== false,
      categoryId: selectedItem.category?.id ? String(selectedItem.category.id) : "",
      imageUrl: selectedItem.imageUrl || "",
      username: "",
      email: "",
      fullName: "",
      phone: "",
      password: "",
      roleCode: "USER"
    });
  }, [selectedItem, supportsCrud, isVariantModule, isUsersModule]);

  const resetForm = () => {
    setSelectedId(null);
    setForm({
      name: "",
      description: "",
      active: true,
      categoryId: "",
      imageUrl: "",
      username: "",
      email: "",
      fullName: "",
      phone: "",
      password: "",
      roleCode: "USER"
    });
    setVariantForm({
      productId: "",
      colorId: "",
      sizeId: "",
      name: "",
      price: "",
      stock: 0,
      sku: ""
    });
  };

  const handleImageFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onToast?.("Vui lòng chọn file ảnh hợp lệ", "error");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((prev) => ({ ...prev, imageUrl: dataUrl }));
      onToast?.("Đã tải ảnh từ máy", "success");
    } catch (err) {
      onToast?.("Lỗi đọc ảnh: " + err.message, "error");
    } finally {
      event.target.value = "";
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isCouponModule) {
      if (!couponForm.code.trim() || !couponForm.discountValue) {
        onToast?.("Vui lòng nhập mã giảm giá và giá trị", "error");
        return;
      }
      const payload = {
        code: couponForm.code.trim().toUpperCase(),
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        minOrderValue: couponForm.minOrderValue ? Number(couponForm.minOrderValue) : null,
        usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : null,
        expiryDate: couponForm.expiryDate ? couponForm.expiryDate : null,
        active: Boolean(couponForm.active)
      };
      setSaving(true);
      try {
        if (selectedId) {
          await api.put(`${currentModule.endpoint}/${selectedId}`, payload);
          onToast?.(`Đã cập nhật coupon ${payload.code}`, "success");
        } else {
          await api.post(currentModule.endpoint, payload);
          onToast?.("Đã tạo mới coupon", "success");
        }
        await loadItems();
        resetForm();
      } catch (err) {
        onToast?.("Lỗi lưu coupon: " + err.message, "error");
      } finally {
        setSaving(false);
      }
      return;
    }
    if (isVariantModule) {
      if (!variantForm.productId || !variantForm.colorId || !variantForm.sizeId) {
        onToast?.("Vui lòng chọn sản phẩm, màu và size", "error");
        return;
      }
      if (!variantForm.name.trim() || !variantForm.sku.trim()) {
        onToast?.("Vui lòng nhập tên biến thể và SKU", "error");
        return;
      }
      const price = Number(variantForm.price);
      const stock = Number(variantForm.stock);
      if (!Number.isFinite(price) || price <= 0) {
        onToast?.("Giá phải lớn hơn 0", "error");
        return;
      }
      if (!Number.isFinite(stock) || stock < 0) {
        onToast?.("Số lượng tồn kho không hợp lệ", "error");
        return;
      }
      const payload = {
        product: { id: Number(variantForm.productId) },
        color: { id: Number(variantForm.colorId) },
        size: { id: Number(variantForm.sizeId) },
        name: variantForm.name.trim(),
        price,
        stock,
        sku: variantForm.sku.trim()
      };
      setSaving(true);
      try {
        if (selectedId) {
          await api.put(`${currentModule.endpoint}/${selectedId}`, payload);
          onToast?.(`Đã cập nhật biến thể #${selectedId}`, "success");
        } else {
          await api.post(currentModule.endpoint, payload);
          onToast?.("Đã tạo biến thể mới", "success");
        }
        await loadItems();
        resetForm();
      } catch (err) {
        onToast?.("Lỗi lưu biến thể: " + err.message, "error");
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!supportsCrud) return;

    let payload;

    if (isUsersModule) {
      if (!form.username.trim()) {
        onToast?.("Vui lòng nhập tên đăng nhập", "error");
        return;
      }
      if (!form.email.trim()) {
        onToast?.("Vui lòng nhập email", "error");
        return;
      }
      payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        role: { code: form.roleCode || "USER" }
      };
      if (form.password.trim()) {
        payload.password = form.password.trim();
      }
    } else {
      if (!form.name.trim()) {
        onToast?.("Vui lòng nhập tên", "error");
        return;
      }

      if (activeModule === "products" && !form.categoryId) {
        onToast?.("Vui lòng chọn danh mục cho sản phẩm", "error");
        return;
      }

      payload =
        activeModule === "products"
          ? {
            name: form.name.trim(),
            description: form.description.trim(),
            imageUrl: form.imageUrl.trim(),
            category: { id: Number(form.categoryId) }
          }
          : { name: form.name.trim() };
    }

    setSaving(true);
    try {
      if (selectedId) {
        await api.put(`${currentModule.endpoint}/${selectedId}`, payload);
        onToast?.(`Đã cập nhật ${currentModule.label.toLowerCase()} #${selectedId}`, "success");
      } else {
        await api.post(currentModule.endpoint, payload);
        onToast?.(`Đã tạo mới ${currentModule.label.toLowerCase()}`, "success");
      }
      await loadItems();
      resetForm();
    } catch (err) {
      onToast?.("Lỗi lưu dữ liệu: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if ((!supportsCrud && !isVariantModule && !isCouponModule) || !selectedId) return;
    if (!window.confirm(`Xóa mục #${selectedId}?`)) return;
    setSaving(true);
    try {
      await api.del(`${currentModule.endpoint}/${selectedId}`);
      onToast?.(`Đã xóa mục #${selectedId}`, "success");
      await loadItems();
      resetForm();
    } catch (err) {
      onToast?.("Lỗi xóa dữ liệu: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-dashboard card" style={{ display: "flex", flexDirection: "row", gap: "2rem", alignItems: "flex-start", padding: "1.5rem", width: "1500px", maxWidth: "100%", minHeight: "750px", margin: "0 auto" }}>
      <aside className="admin-sidebar" style={{ width: "220px", flexShrink: 0, position: "sticky", top: "1rem" }}>
        <h3 style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>⚙️ Admin Panel</h3>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {modules.map((m) => (
            <button
              key={m.key}
              type="button"
              className={activeModule === m.key ? "btn-main small" : "ghost small"}
              onClick={() => setActiveModule(m.key)}
              style={{ justifyContent: "flex-start", textAlign: "left", borderRadius: "8px", width: "100%", padding: "0.8rem 1rem", fontSize: "0.95rem" }}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="admin-content" style={{ flexGrow: 1, display: "grid", gridTemplateColumns: "1fr 400px", gap: "1.5rem", minWidth: 0, alignItems: "start" }}>
        <div style={{ background: "var(--surface2)", padding: "1.5rem", borderRadius: "var(--radius)", boxShadow: "var(--shadow)" }}>
          <h3 style={{ marginBottom: "1rem" }}>{currentModule?.label}</h3>
          {isProductModule && (
            <div className="admin-stock-filter">
              <button
                type="button"
                className={stockFilter === "all" ? "chip light selected" : "chip light"}
                onClick={() => setStockFilter("all")}
              >
                Tất cả
              </button>
              <button
                type="button"
                className={stockFilter === "in" ? "chip light selected" : "chip light"}
                onClick={() => setStockFilter("in")}
              >
                Còn hàng
              </button>
              <button
                type="button"
                className={stockFilter === "out" ? "chip light selected" : "chip light"}
                onClick={() => setStockFilter("out")}
              >
                Hết hàng
              </button>
            </div>
          )}
          <div className="notice">
            Module: <strong>{currentModule?.label}</strong>.
            {loading ? " Đang tải..." : ` Tổng ${filteredItems.length} mục.`}
          </div>
          {actionMessage && <div className="notice error">{actionMessage}</div>}
          <div className="admin-list">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={selectedId === item.id ? "admin-row selected" : "admin-row"}
                onClick={() => setSelectedId(item.id)}
              >
                <strong>#{item.id.slice(-6)}</strong>
                <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.name || item.username || item.email || item.code || item.status || "(no title)"}
                </span>
                {isVariantModule && <span style={{ flexShrink: 0 }}>SKU: {item.sku || "—"}</span>}
                {isVariantModule && <span className="stock-tag in" style={{ flexShrink: 0 }}>Kho: {item.stock ?? 0}</span>}
                {isProductModule && (
                  <span className={(stockByProductId[item.id] || 0) > 0 ? "stock-tag in" : "stock-tag out"} style={{ flexShrink: 0 }}>
                    {(stockByProductId[item.id] || 0) > 0 ? "Còn hàng" : "Hết hàng"}
                  </span>
                )}
                {item.totalAmount && <span style={{ flexShrink: 0 }}>{formatVND(item.totalAmount)}</span>}
              </button>
            ))}
            {filteredItems.length === 0 && !loading && <p className="notice">Không có dữ liệu.</p>}
          </div>
        </div>
        <div style={{ background: "var(--surface2)", padding: "1.5rem", borderRadius: "var(--radius)", boxShadow: "var(--shadow)" }}>
          {isCouponModule ? (
            <>
              <h3>{selectedId ? "✏️ Chỉnh sửa mã giảm giá" : "➕ Tạo mã giảm giá"}</h3>
              <form className="admin-form" onSubmit={handleSave}>
                <label>
                  Mã giảm giá *
                  <input type="text" value={couponForm.code} onChange={(e) => setCouponForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="VD: SUMMER2024" required />
                </label>
                <div className="admin-form-grid">
                  <label>
                    Loại giảm giá *
                    <select value={couponForm.discountType} onChange={(e) => setCouponForm(p => ({ ...p, discountType: e.target.value }))}>
                      <option value="FIXED">Giá trị cố định (VNĐ)</option>
                      <option value="PERCENTAGE">Phần trăm (%)</option>
                    </select>
                  </label>
                  <label>
                    Giá trị giảm *
                    <input type="number" min="1" value={couponForm.discountValue} onChange={(e) => setCouponForm(p => ({ ...p, discountValue: e.target.value }))} placeholder="VD: 50000 hoặc 15" required />
                  </label>
                </div>
                <div className="admin-form-grid">
                  <label>
                    Đơn hàng tối thiểu (Tuỳ chọn)
                    <input type="number" min="0" value={couponForm.minOrderValue} onChange={(e) => setCouponForm(p => ({ ...p, minOrderValue: e.target.value }))} placeholder="VD: 300000" />
                  </label>
                  <label>
                    Giới hạn số lượt (Tuỳ chọn)
                    <input type="number" min="1" value={couponForm.usageLimit} onChange={(e) => setCouponForm(p => ({ ...p, usageLimit: e.target.value }))} placeholder="VD: 100" />
                  </label>
                </div>
                <label>
                  Ngày hết hạn (Tuỳ chọn)
                  <input type="datetime-local" value={couponForm.expiryDate} onChange={(e) => setCouponForm(p => ({ ...p, expiryDate: e.target.value }))} />
                </label>
                <div style={{ margin: "1rem 0" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexDirection: "row", cursor: "pointer" }}>
                    <input type="checkbox" checked={couponForm.active} onChange={(e) => setCouponForm(p => ({ ...p, active: e.target.checked }))} style={{ width: "auto" }} />
                    <span style={{ fontWeight: "bold" }}>Mã này đang hoạt động (Hiển thị cho khách hàng)</span>
                  </label>
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="btn-main" disabled={saving}>
                    {saving ? "Đang lưu..." : selectedId ? "Cập nhật mã" : "Tạo mã mới"}
                  </button>
                  <button type="button" className="ghost" onClick={resetForm} disabled={saving}>Làm mới</button>
                  <button type="button" className="ghost admin-delete-btn" onClick={handleDelete} disabled={!selectedId || saving}>Xóa</button>
                </div>
              </form>
            </>
          ) : isVariantModule ? (
            <>
              <h3>{selectedId ? "✏️ Chỉnh sửa biến thể" : "➕ Tạo biến thể"}</h3>
              <form className="admin-form" onSubmit={handleSave}>
                <label>
                  Sản phẩm *
                  <select
                    value={variantForm.productId}
                    onChange={(e) => setVariantForm((p) => ({ ...p, productId: e.target.value }))}
                    required
                  >
                    <option value="">Chọn sản phẩm</option>
                    {productOptions.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </label>
                <div className="admin-form-grid">
                  <label>
                    Màu *
                    <select
                      value={variantForm.colorId}
                      onChange={(e) => setVariantForm((p) => ({ ...p, colorId: e.target.value }))}
                      required
                    >
                      <option value="">Chọn màu</option>
                      {uiColorOptions.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Size *
                    <select
                      value={variantForm.sizeId}
                      onChange={(e) => setVariantForm((p) => ({ ...p, sizeId: e.target.value }))}
                      required
                    >
                      <option value="">Chọn size</option>
                      {uiSizeOptions.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                {(uiColorOptions.length === 0 || uiSizeOptions.length === 0) && (
                  <div className="notice info">
                    Màu/size trong DB chưa khớp bộ hiển thị (Black, Ivory, Stone, Denim, Olive / XS, S, M, L, XL).
                  </div>
                )}
                <div className="admin-form-grid">
                  <label>
                    Tên biến thể *
                    <input
                      type="text"
                      value={variantForm.name}
                      onChange={(e) => setVariantForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Ví dụ: Đen - Size M"
                      required
                    />
                  </label>
                  <label>
                    SKU *
                    <input
                      type="text"
                      value={variantForm.sku}
                      onChange={(e) => setVariantForm((p) => ({ ...p, sku: e.target.value }))}
                      placeholder="SKU duy nhất"
                      required
                    />
                  </label>
                </div>
                <div className="admin-form-grid">
                  <label>
                    Giá *
                    <input
                      type="number"
                      min="1"
                      step="1000"
                      value={variantForm.price}
                      onChange={(e) => setVariantForm((p) => ({ ...p, price: e.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Số lượng tồn kho *
                    <input
                      type="number"
                      min="0"
                      value={variantForm.stock}
                      onChange={(e) => setVariantForm((p) => ({ ...p, stock: e.target.value }))}
                      required
                    />
                  </label>
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="btn-main" disabled={saving}>
                    {saving ? "Đang lưu..." : selectedId ? "Cập nhật biến thể" : "Tạo biến thể"}
                  </button>
                  <button type="button" className="ghost" onClick={resetForm} disabled={saving}>
                    Làm mới form
                  </button>
                  <button
                    type="button"
                    className="ghost admin-delete-btn"
                    onClick={handleDelete}
                    disabled={!selectedId || saving}
                  >
                    Xóa
                  </button>
                </div>
              </form>
            </>
          ) : supportsCrud ? (
            <>
              <h3>{selectedId ? "✏️ Chỉnh sửa mục" : "➕ Tạo mới"}</h3>
              <form className="admin-form" onSubmit={handleSave}>
                {isUsersModule ? (
                  <>
                    <label>
                      Tên đăng nhập *
                      <input
                        type="text"
                        value={form.username}
                        onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                        placeholder="Nhập tên đăng nhập"
                        required
                      />
                    </label>
                    <label>
                      Email *
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="Nhập email"
                        required
                      />
                    </label>
                    <label>
                      Mật khẩu (để trống nếu không đổi)
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="Nhập mật khẩu"
                      />
                    </label>
                    <label>
                      Họ và tên
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Nhập họ tên"
                      />
                    </label>
                    <label>
                      Số điện thoại
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="Nhập số điện thoại"
                      />
                    </label>
                    <label>
                      Role
                      <select
                        value={form.roleCode}
                        onChange={(e) => setForm((prev) => ({ ...prev, roleCode: e.target.value }))}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </label>
                  </>
                ) : (
                  <>
                    <label>
                      Tên *
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Nhập tên"
                        required
                      />
                    </label>
                    <label>
                      Mô tả
                      <textarea
                        rows="4"
                        value={form.description}
                        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Nhập mô tả"
                      />
                    </label>
                  </>
                )}
                {activeModule === "products" && (
                  <label>
                    Danh mục *
                    <select
                      value={form.categoryId}
                      onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      {categoryOptions.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {activeModule === "products" && (
                  <label>
                    Ảnh sản phẩm (imageUrl)
                    <input
                      type="text"
                      value={form.imageUrl}
                      onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="Dán URL ảnh (ví dụ: https://placehold.co/600x400/png?text=Product)"
                    />
                  </label>
                )}
                {activeModule === "products" && (
                  <label>
                    Tải ảnh từ máy
                    <input type="file" accept="image/*" onChange={handleImageFile} />
                  </label>
                )}
                {activeModule === "products" && (
                  <button
                    type="button"
                    className="ghost small"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        imageUrl: "https://placehold.co/600x400/png?text=Product"
                      }))
                    }
                  >
                    Dùng ảnh mẫu
                  </button>
                )}
                {activeModule === "products" && form.imageUrl && (
                  <div className="notice">
                    <div style={{ marginBottom: ".4rem" }}>Xem trước ảnh:</div>
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      style={{ width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "8px" }}
                    />
                  </div>
                )}
                {activeModule === "products" && categoryOptions.length === 0 && (
                  <div className="notice info">
                    Chưa có danh mục để chọn. Hãy vào tab <strong>Danh mục</strong> và tạo trước.
                  </div>
                )}
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                  />
                  <span>Đang hoạt động</span>
                </label>

                <div className="admin-form-actions">
                  <button type="submit" className="btn-main" disabled={saving}>
                    {saving ? "Đang lưu..." : selectedId ? "Cập nhật" : "Tạo mới"}
                  </button>
                  <button type="button" className="ghost" onClick={resetForm} disabled={saving}>
                    Làm mới form
                  </button>
                  <button
                    type="button"
                    className="ghost admin-delete-btn"
                    onClick={handleDelete}
                    disabled={!selectedId || saving}
                  >
                    Xóa
                  </button>
                </div>
              </form>
            </>
          ) : isUsersModule ? (
            <>
              <h3>👥 Thống kê người dùng</h3>
              <div className="notice">
                Tổng số người dùng: <strong>{items.length}</strong>
              </div>
              <div className="notice">
                Người dùng mới nhất: <strong>{items[0]?.username || items[0]?.email || "—"}</strong>
              </div>
            </>
          ) : isOrdersModule ? (
            <>
              <h3>📊 Thống kê đơn hàng</h3>
              <div className="notice">
                Tổng đơn hàng: <strong>{items.length}</strong>
              </div>
              <div className="notice">
                Đã thanh toán: <strong>{items.filter((i) => i.status === "PAID").length}</strong>
              </div>
              <div className="notice">
                Đang chờ: <strong>{items.filter((i) => i.status === "PENDING").length}</strong>
              </div>
            </>
          ) : (
            <>
              <h3>📊 Thống kê nhanh</h3>
              <div className="notice">
                Tổng số bản ghi: <strong>{items.length}</strong>
              </div>
              <div className="notice">
                Module hiện tại: <strong>{currentModule?.label || "—"}</strong>
              </div>
              <div className="notice">
                Module này hiện chỉ hỗ trợ xem danh sách trên giao diện.
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div>
        <h4>VELA</h4>
        <p>Thời trang hiện đại – chất lượng đẳng cấp.</p>
      </div>
      <div>
        <h5>Thông tin</h5>
        <a href="#">Về chúng tôi</a>
        <a href="#">Hướng dẫn size</a>
        <a href="#">Chính sách vận chuyển</a>
      </div>
      <div>
        <h5>Hỗ trợ</h5>
        <a href="#">Liên hệ</a>
        <a href="#">FAQ</a>
        <a href="#">Đổi trả hàng</a>
      </div>
      <div>
        <h5>Đăng ký nhận tin</h5>
        <div className="newsletter">
          <input type="email" placeholder="Email của bạn" />
          <button type="button" className="btn-main">Đăng ký</button>
        </div>
        <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#6b7280" }}>
          💜 Thanh toán an toàn với MoMo
        </p>
      </div>
    </footer>
  );
}

function ProductDetailModal({ detail, onClose }) {
  if (!detail) return null;
  const { product, variants } = detail;
  const totalStock = (variants || []).reduce((sum, v) => sum + Number(v.stock || 0), 0);
  const price = variants?.[0]?.price;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>{product?.name || "Chi tiết sản phẩm"}</h3>
        <div className="notice">
          Trạng thái:{" "}
          <span className={totalStock > 0 ? "stock-tag in" : "stock-tag out"}>
            {totalStock > 0 ? "Còn hàng" : "Hết hàng"}
          </span>
        </div>
        <img
          src={product?.imageUrl || "https://placehold.co/600x400/png?text=Product"}
          alt={product?.name || "Product"}
          style={{ width: "100%", maxHeight: "260px", objectFit: "cover", borderRadius: "10px" }}
        />
        <p style={{ color: "#94a3b8" }}>{product?.description || "Chưa có mô tả sản phẩm."}</p>
        <div className="summary-list">
          <p>Giá tham khảo <span>{price ? formatVND(price) : "—"}</span></p>
          <p>Tổng tồn kho <span>{totalStock}</span></p>
          <p>Số biến thể <span>{variants?.length || 0}</span></p>
        </div>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="ghost" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [activePage, setActivePage] = useState(() => {
    // If redirected from MoMo, show payment result
    if (window.location.pathname === "/payment-result") return "payment-result";
    return "home";
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("currentUser");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [detailProduct, setDetailProduct] = useState(null);

  useEffect(() => {
    if (activePage === "home" || activePage === "catalog") {
      api.get("/api/products")
        .then(data => setProducts(Array.isArray(data) ? data : []))
        .catch(() => setProducts([]));
      api.get("/api/product-variants")
        .then(data => setVariants(Array.isArray(data) ? data : []))
        .catch(() => setVariants([]));
    }
  }, [activePage]);

  // Load cart count
  useEffect(() => {
    if (!user) { setCartCount(0); return; }
    api.get(`/api/carts/user/${user.id}/items`)
      .then((data) => setCartCount((data.items || []).length))
      .catch(() => setCartCount(0));
  }, [user]);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem("currentUser", JSON.stringify(loggedInUser));
    setActivePage("home");
    showToast("Đăng nhập thành công! Chào " + (loggedInUser.fullName || loggedInUser.username), "success");
  };

  const handleLogout = () => {
    setUser(null);
    setCartCount(0);
    localStorage.removeItem("currentUser");
    showToast("Đã đăng xuất", "info");
  };

  const showToast = (message, type = "info") => setToast({ message, type });

  const addToCart = async (variantId, qty = 1) => {
    if (!user) {
      setActivePage("account");
      return;
    }
    try {
      const res = await api.post(`/api/carts/user/${user.id}/add`, {
        productVariantId: variantId,
        quantity: qty
      });
      if (res.error) throw new Error(res.error);
      setCartCount((c) => c + qty);
      showToast("Đã thêm vào giỏ hàng! 🛒", "success");
    } catch (err) {
      showToast("Lỗi: " + err.message, "error");
    }
  };

  const navigate = (page) => setActivePage(page);
  const openDetail = (product, productVariants) => setDetailProduct({ product, variants: productVariants || [] });

  const renderPage = () => {
    // Block admin access if not ADMIN role
    if (activePage === "admin" && (!user || user.role?.code !== "ADMIN")) {
      return (
        <section className="panel">
          <article className="card">
            <div className="notice error" style={{ textAlign: "center" }}>
              🚫 <strong>Truy cập bị từ chối</strong><br />
              Bạn không có quyền truy cập khu vực quản trị. Chỉ quản trị viên mới có thể vào đây.
            </div>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button type="button" className="btn-main" onClick={() => navigate("home")}>
                Quay lại trang chủ
              </button>
            </div>
          </article>
        </section>
      );
    }

    switch (activePage) {
      case "home": return <HomePage products={products} variants={variants} onAddToCart={addToCart} user={user} onNavigate={navigate} onViewDetail={openDetail} />;
      case "catalog": return <CatalogPage products={products} variants={variants} onAddToCart={addToCart} user={user} onNavigate={navigate} onViewDetail={openDetail} />;
      case "cart": return <CartPage user={user} cartCount={cartCount} setCartCount={setCartCount} onNavigate={navigate} />;
      case "checkout": return <CheckoutPage user={user} onNavigate={navigate} />;
      case "orders": return <OrdersPage user={user} onNavigate={navigate} />;
      case "account": return <AccountPage user={user} onLogin={handleLogin} onLogout={handleLogout} onRegister={handleLogin} />;
      case "admin": return <AdminPage onToast={showToast} />;
      case "payment-result": return <PaymentResultPage onNavigate={navigate} />;
      default: return <HomePage products={products} variants={variants} onAddToCart={addToCart} user={user} onNavigate={navigate} onViewDetail={openDetail} />;
    }
  };

  return (
    <div className="shop-app">
      <div className="announce">
        Miễn phí vận chuyển cho đơn từ 999k · Thanh toán an toàn với MoMo 💜
      </div>

      <header className="header">
        <div className="brand" onClick={() => navigate("home")} style={{ cursor: "pointer" }}>
          VELA
        </div>
        <nav className="nav">
          {pages.filter(p => {
            // Hide admin tab unless user is ADMIN
            if (p.key === "admin") return user && user.role?.code === "ADMIN";
            return p.key !== "payment-result";
          }).map((page) => (
            <button
              key={page.key}
              type="button"
              className={activePage === page.key ? "tab active" : "tab"}
              onClick={() => navigate(page.key)}
            >
              {page.label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button
            type="button"
            className="cart-btn"
            onClick={() => navigate("cart")}
          >
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>



          <button
            type="button"
            className="btn-main small"
            style={{ backgroundColor: "#7c3aed", color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem", borderRadius: "10px", padding: "0.5rem 1rem" }}
            onClick={() => navigate("account")}
          >
            {user ? (
              <>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "cover", margin: "-4px 0" }} />
                ) : (
                  "👤"
                )}
                <span>{(user.fullName || user.username).split(" ").pop()}</span>
              </>
            ) : (
              "👤 Đăng nhập"
            )}
          </button>
        </div>
      </header>

      <main className="main">{renderPage()}</main>

      <Footer />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />

      <ProductDetailModal detail={detailProduct} onClose={() => setDetailProduct(null)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
