const { useEffect, useState } = React;

const pages = [
  { key: "home", label: "Home" },
  { key: "catalog", label: "Catalog" },
  { key: "product", label: "Product" },
  { key: "cart", label: "Cart" },
  { key: "checkout", label: "Checkout" },
  { key: "account", label: "Account" },
  { key: "orders", label: "Orders" },
  { key: "admin", label: "Admin" }
];

const categories = ["Women", "Men", "Street", "Office", "Accessories", "Sale"];
const sizes = ["XS", "S", "M", "L", "XL"];
const colors = ["Black", "Ivory", "Stone", "Denim", "Olive"];
const sortOptions = ["Newest", "Price: Low to High", "Price: High to Low", "Best Sellers"];

function ProductCard() {
  return (
    <article className="product-card">
      <div className="thumb" />
      <div className="line l1" />
      <div className="line l2" />
      <div className="swatches">
        <span />
        <span />
        <span />
      </div>
      <button type="button" className="ghost small">Quick view</button>
    </article>
  );
}

function HomePage() {
  return (
    <section className="panel">
      <article className="hero">
        <div className="hero-copy">
          <p className="tag">NEW SEASON DROP</p>
          <h1>Elevated everyday style for modern wardrobes</h1>
          <p>Full fashion storefront UI: hero, category lanes, product grid, quick cart, checkout, account, orders, admin.</p>
          <div className="row">
            <button className="btn-main" type="button">Shop collection</button>
            <button className="ghost" type="button">View lookbook</button>
          </div>
        </div>
        <div className="hero-art" />
      </article>

      <article className="category-strip">
        {categories.map((item) => (
          <button key={item} type="button" className="chip">{item}</button>
        ))}
      </article>

      <article className="promo-grid">
        <div className="promo-card">Flash Sale</div>
        <div className="promo-card">Top Rated</div>
        <div className="promo-card">New In</div>
        <div className="promo-card">Bundle Offers</div>
      </article>

      <article className="product-grid">
        {Array.from({ length: 8 }).map((_, idx) => <ProductCard key={idx} />)}
      </article>
    </section>
  );
}

function CatalogPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedSort, setSelectedSort] = useState("");

  return (
    <section className="panel">
      <div className="toolbar">
        <input
          type="search"
          placeholder="Search by name, sku, tag"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Category</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
          <option value="">Color</option>
          {colors.map((color) => (
            <option key={color} value={color}>{color}</option>
          ))}
        </select>
        <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
          <option value="">Size</option>
          {sizes.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <select value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)}>
          <option value="">Sort</option>
          {sortOptions.map((sortItem) => (
            <option key={sortItem} value={sortItem}>{sortItem}</option>
          ))}
        </select>
      </div>
      <div className="layout-2">
        <aside className="card sidebar">
          <h3>Filters</h3>
          <p>Price range</p>
          <input type="range" min="0" max="100" />
          <p>Colors</p>
          <div className="chips-inline">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                className={selectedColor === c ? "chip light selected" : "chip light"}
                onClick={() => setSelectedColor(selectedColor === c ? "" : c)}
              >
                {c}
              </button>
            ))}
          </div>
          <p>Sizes</p>
          <div className="chips-inline">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                className={selectedSize === s ? "chip light selected" : "chip light"}
                onClick={() => setSelectedSize(selectedSize === s ? "" : s)}
              >
                {s}
              </button>
            ))}
          </div>
          <button type="button" className="ghost">Apply</button>
        </aside>
        <div className="product-grid">
          {Array.from({ length: 12 }).map((_, idx) => <ProductCard key={idx} />)}
        </div>
      </div>
    </section>
  );
}

function ProductPage() {
  return (
    <section className="panel layout-2">
      <article className="card gallery">
        <div className="thumb large" />
        <div className="mini-row">
          <div className="thumb" />
          <div className="thumb" />
          <div className="thumb" />
          <div className="thumb" />
        </div>
      </article>
      <article className="card details">
        <p className="tag">WOMEN / DRESS</p>
        <h2>Product detail experience</h2>
        <p>Ready for image zoom, size chart, rating, and related products section.</p>
        <label>Color<select defaultValue=""><option value="" disabled>Select color</option></select></label>
        <label>Size<select defaultValue=""><option value="" disabled>Select size</option></select></label>
        <label>Quantity<input type="number" min="1" defaultValue="1" /></label>
        <div className="row">
          <button className="btn-main" type="button">Add to cart</button>
          <button className="ghost" type="button">Add wishlist</button>
        </div>
        <div className="notice">Review block and shipping timeline are prepared in this layout.</div>
      </article>
    </section>
  );
}

function CartPage() {
  return (
    <section className="panel layout-2">
      <article className="card">
        <h3>Cart items</h3>
        <div className="notice">Cart list placeholder ready for API binding.</div>
        <label>Voucher<input type="text" placeholder="Enter voucher code" /></label>
        <button type="button" className="ghost">Apply voucher</button>
      </article>
      <article className="card">
        <h3>Summary</h3>
        <div className="summary-list">
          <p>Subtotal <span>--</span></p>
          <p>Shipping <span>--</span></p>
          <p>Discount <span>--</span></p>
          <p>Total <span>--</span></p>
        </div>
        <button type="button" className="btn-main">Proceed to checkout</button>
      </article>
    </section>
  );
}

function CheckoutPage() {
  return (
    <section className="panel layout-2">
      <article className="card">
        <h3>Shipping information</h3>
        <label>Receiver name<input type="text" placeholder="Full name" /></label>
        <label>Phone<input type="text" placeholder="Phone" /></label>
        <label>Address<textarea rows="4" placeholder="Delivery address" /></label>
      </article>
      <article className="card">
        <h3>Payment and confirmation</h3>
        <label>Payment method<select defaultValue=""><option value="" disabled>Select payment</option></select></label>
        <label>Order note<textarea rows="4" placeholder="Optional note" /></label>
        <div className="chips-inline">
          <span className="chip light">VNPay</span>
          <span className="chip light">PayPal</span>
          <span className="chip light">Momo</span>
          <span className="chip light">COD</span>
        </div>
        <button type="button" className="btn-main">Place order</button>
      </article>
    </section>
  );
}

function AccountPage({ user, onLogin, onLogout, onRegister }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      const loggedInUser = data && data.user ? data.user : null;
      if (res.ok && loggedInUser) {
        setMessage("Login successful!");
        onLogin(loggedInUser);
        setUsername("");
        setPassword("");
      } else {
        setMessage(data.error || "Login failed");
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, fullName, phone })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Registration successful! Please login.");
        onRegister(data.user);
        setUsername("");
        setEmail("");
        setPassword("");
        setFullName("");
        setPhone("");
        setIsLogin(true);
      } else {
        setMessage(data.error || "Registration failed");
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  if (user) {
    return (
      <section className="panel layout-2">
        <article className="card">
          <h3>My Profile</h3>
          <p>Welcome, {user.fullName || user.username}!</p>
          <label>Username<input type="text" value={user.username} disabled /></label>
          <label>Email<input type="email" value={user.email} disabled /></label>
          <label>Full Name<input type="text" value={user.fullName || ""} disabled /></label>
          <label>Phone<input type="text" value={user.phone || ""} disabled /></label>
          <button type="button" className="btn-main" onClick={() => onLogout()}>Logout</button>
        </article>
        <article className="card">
          <h3>My Addresses</h3>
          <div className="notice">Address list placeholder ready for API binding.</div>
        </article>
      </section>
    );
  }

  return (
    <section className="panel layout-2">
      <article className="card">
        <h3>{isLogin ? "Login" : "Register"}</h3>
        {message && <p className="notice" style={{color: message.includes("Error") || message.includes("failed") ? "red" : "green"}}>{message}</p>}
        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          <label>Username<input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required /></label>
          {!isLogin && <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required /></label>}
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required /></label>
          {!isLogin && <label>Full Name<input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" /></label>}
          {!isLogin && <label>Phone<input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" /></label>}
          <button type="submit" className="btn-main">{isLogin ? "Login" : "Register"}</button>
        </form>
        <p style={{marginTop: "1rem", textAlign: "center"}}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" className="ghost" onClick={() => { setIsLogin(!isLogin); setMessage(""); }} style={{border: "none", background: "none", color: "inherit", cursor: "pointer", textDecoration: "underline"}}>
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </article>
    </section>
  );
}

function OrdersPage() {
  return (
    <section className="panel layout-2">
      <article className="card">
        <h3>Order history and tracking</h3>
        <div className="notice">Timeline and map slot are ready for real shipment data.</div>
        <div className="timeline">
          <span>Ordered</span>
          <span>Packed</span>
          <span>Shipped</span>
          <span>Delivered</span>
        </div>
      </article>
      <article className="card">
        <h3>Cancel or return</h3>
        <label>Reason<select defaultValue=""><option value="" disabled>Select reason</option></select></label>
        <label>Description<textarea rows="5" placeholder="Describe issue" /></label>
        <button type="button" className="ghost">Submit request</button>
      </article>
    </section>
  );
}

function AdminPage() {
  const modules = [
    { key: "products", label: "Products", endpoint: "/api/admin/products" },
    { key: "categories", label: "Categories", endpoint: "/api/admin/categories" },
    { key: "variants", label: "Variants", endpoint: "/api/admin/product-variants" },
    { key: "users", label: "Users", endpoint: "/api/admin/users" }
  ];
  const [activeModule, setActiveModule] = useState("products");
  const [adminNote, setAdminNote] = useState("");
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const currentModule = modules.find((m) => m.key === activeModule);

  const loadItems = async () => {
    if (!currentModule) {
      return;
    }

    setLoading(true);
    setActionMessage("");
    try {
      const res = await fetch(currentModule.endpoint);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Cannot load data");
      }
      setItems(Array.isArray(data) ? data : []);
      setSelectedId(null);
    } catch (err) {
      setItems([]);
      setActionMessage("Load failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModule]);

  const parseJsonInput = (title, initialValue) => {
    const raw = window.prompt(title, initialValue);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (_err) {
      setActionMessage("Invalid JSON format.");
      return null;
    }
  };

  const handleCreate = async () => {
    const payload = parseJsonInput(
      "Enter JSON payload to create new item",
      '{\n  "name": "Sample name"\n}'
    );
    if (!payload || !currentModule) {
      return;
    }

    try {
      const res = await fetch(currentModule.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Create failed");
      }
      setActionMessage("Create successful.");
      loadItems();
    } catch (err) {
      setActionMessage("Create failed: " + err.message);
    }
  };

  const handleEdit = async () => {
    if (!selectedId || !currentModule) {
      setActionMessage("Select one item to edit.");
      return;
    }

    const selectedItem = items.find((item) => item.id === selectedId);
    const payload = parseJsonInput(
      "Edit JSON payload",
      JSON.stringify(selectedItem, null, 2)
    );
    if (!payload) {
      return;
    }

    try {
      const res = await fetch(`${currentModule.endpoint}/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }
      setActionMessage("Update successful.");
      loadItems();
    } catch (err) {
      setActionMessage("Update failed: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedId || !currentModule) {
      setActionMessage("Select one item to delete.");
      return;
    }

    const confirmed = window.confirm("Soft delete selected item?");
    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(`${currentModule.endpoint}/${selectedId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setActionMessage("Delete successful.");
      loadItems();
    } catch (err) {
      setActionMessage("Delete failed: " + err.message);
    }
  };

  const handleSendReply = () => {
    if (!adminNote.trim()) {
      setActionMessage("Please enter message before sending.");
      return;
    }
    setActionMessage("Message queued: " + adminNote.trim());
    setAdminNote("");
  };

  return (
    <section className="panel layout-2">
      <article className="card">
        <h3>Admin dashboard</h3>
        <div className="kpi-grid">
          {modules.map((module) => (
            <button
              key={module.key}
              type="button"
              className={activeModule === module.key ? "kpi active" : "kpi"}
              onClick={() => setActiveModule(module.key)}
            >
              {module.label}
            </button>
          ))}
        </div>
        <div className="notice">
          Active module: <strong>{currentModule?.label}</strong>.
          {loading ? " Loading data..." : ` Loaded ${items.length} item(s).`}
        </div>
        {actionMessage && <div className="notice">{actionMessage}</div>}
        <div className="admin-list">
          {items.length === 0 && !loading && <p className="notice">No data found for this module.</p>}
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={selectedId === item.id ? "admin-row selected" : "admin-row"}
              onClick={() => setSelectedId(item.id)}
            >
              <strong>#{item.id}</strong>
              <span>{item.name || item.username || item.email || "(no title)"}</span>
            </button>
          ))}
        </div>
        <div className="row">
          <button type="button" className="btn-main" onClick={handleCreate}>Create new</button>
          <button type="button" className="ghost" onClick={handleEdit}>Edit selected</button>
          <button type="button" className="ghost" onClick={handleDelete}>Soft delete</button>
        </div>
      </article>
      <article className="card">
        <h3>Support chat</h3>
        <label>
          Message
          <textarea
            rows="6"
            placeholder="Reply to customer"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />
        </label>
        <button type="button" className="btn-main" onClick={handleSendReply}>Send reply</button>
      </article>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div>
        <h4>VELA</h4>
        <p>Modern fashion store experience with scalable frontend architecture.</p>
      </div>
      <div>
        <h5>Information</h5>
        <a href="#">About us</a>
        <a href="#">Size guide</a>
        <a href="#">Shipping policy</a>
      </div>
      <div>
        <h5>Customer care</h5>
        <a href="#">Contact</a>
        <a href="#">FAQ</a>
        <a href="#">Returns</a>
      </div>
      <div>
        <h5>Newsletter</h5>
        <div className="newsletter">
          <input type="email" placeholder="Email address" />
          <button type="button" className="btn-main">Subscribe</button>
        </div>
      </div>
    </footer>
  );
}

function PageView({ activePage, user, onLogin, onLogout, onRegister }) {
  if (activePage === "home") return <HomePage />;
  if (activePage === "catalog") return <CatalogPage />;
  if (activePage === "product") return <ProductPage />;
  if (activePage === "cart") return <CartPage />;
  if (activePage === "checkout") return <CheckoutPage />;
  if (activePage === "account") return <AccountPage user={user} onLogin={onLogin} onLogout={onLogout} onRegister={onRegister} />;
  if (activePage === "orders") return <OrdersPage />;
  return <AdminPage />;
}

function App() {
  const [activePage, setActivePage] = useState("home");
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("currentUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (_err) {
      return null;
    }
  });

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem("currentUser", JSON.stringify(loggedInUser));
    setActivePage("account");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <div className="shop-app">
      <div className="announce">Free shipping for orders over 999k · New arrivals every Friday</div>
      <header className="header">
        <div className="brand">VELA</div>
        <nav className="nav">
          {pages.map((page) => (
            <button
              key={page.key}
              type="button"
              className={activePage === page.key ? "tab active" : "tab"}
              onClick={() => setActivePage(page.key)}
            >
              {page.label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button type="button" className="ghost">Search</button>
          <button type="button" className="btn-main">Cart</button>
        </div>
      </header>

      <main className="main">
        <PageView activePage={activePage} user={user} onLogin={handleLogin} onLogout={handleLogout} onRegister={handleLogin} />
      </main>

      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
