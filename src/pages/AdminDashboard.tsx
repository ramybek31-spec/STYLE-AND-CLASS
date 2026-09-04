import React, { useState, useEffect } from "react";
import {
  AdminStats,
  Order,
  Product,
  ReconciliationRecord,
  SystemHealth,
  ProductCategory
} from "../types";
import {
  Lock,
  Search,
  Printer,
  Download,
  MessageSquare,
  RefreshCw,
  Plus,
  Edit2,
  Package,
  Activity,
  DollarSign,
  Truck,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  FileSpreadsheet,
  QrCode,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Phone,
  Mail,
  Save
} from "lucide-react";
import { PrintablePackingSheet } from "../components/PrintablePackingSheet";
import { ManagerReportModal } from "../components/ManagerReportModal";

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tabs: "SALES" | "PRODUCTS" | "RECONCILIATION" | "HEALTH"
  const [activeTab, setActiveTab] = useState<"SALES" | "PRODUCTS" | "RECONCILIATION" | "HEALTH">("SALES");

  // Data States
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [reconciliation, setReconciliation] = useState<ReconciliationRecord[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Global Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [courierFilter, setCourierFilter] = useState("ALL");

  // Modals
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [selectedOrderReport, setSelectedOrderReport] = useState<{
    orderId: string;
    orderNumber: string;
    reportText: string;
    whatsAppUrl: string;
    managerPhone: string;
  } | null>(null);

  // Add Product Form State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Store Manager Notification Settings State
  const [managerPhoneInput, setManagerPhoneInput] = useState("+447911123456");
  const [managerEmailInput, setManagerEmailInput] = useState("manager@styleandclass.co.uk");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  const [newProduct, setNewProduct] = useState({
    sku: "",
    name: "",
    category: "WOMEN" as ProductCategory,
    subcategory: "",
    brand: "",
    gender: "Women",
    size: "",
    condition: "Excellent Vintage Condition",
    description: "",
    price: "",
    main_image: "",
    colour: "",
    material: "",
    measurements: "",
    tags: ""
  });

  const getAdminToken = () => {
    return sessionStorage.getItem("admin_token") || "";
  };

  const adminFetch = (url: string, options: RequestInit = {}) => {
    const token = getAdminToken();
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return fetch(url, {
      ...options,
      credentials: "include",
      headers
    });
  };

  // Check existing session
  useEffect(() => {
    adminFetch("/api/admin/me")
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
          loadDashboardData();
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: passwordInput })
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Authentication failed.");
        setIsLoggingIn(false);
        return;
      }

      if (data.token) {
        sessionStorage.setItem("admin_token", data.token);
      }

      setIsAuthenticated(true);
      loadDashboardData();
    } catch (err: any) {
      setLoginError("Login connection error.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await adminFetch("/api/admin/logout", { method: "POST" });
    sessionStorage.removeItem("admin_token");
    setIsAuthenticated(false);
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, ordersRes, productsRes, reconRes, healthRes] = await Promise.all([
        adminFetch("/api/admin/stats").then((r) => r.json()),
        adminFetch(`/api/admin/orders?search=${encodeURIComponent(searchTerm)}&status=${statusFilter}&courier=${courierFilter}`).then((r) => r.json()),
        fetch("/api/products?includeSold=true").then((r) => r.json()),
        adminFetch("/api/admin/reconciliation").then((r) => r.json()),
        adminFetch("/api/admin/health").then((r) => r.json())
      ]);

      setStats(statsRes);
      setOrders(ordersRes.orders || []);
      setAllProducts(productsRes.products || []);
      setReconciliation(reconRes.records || []);
      setHealth(healthRes);
      if (healthRes && healthRes.managerPhone) {
        setManagerPhoneInput(healthRes.managerPhone);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await adminFetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          managerPhone: managerPhoneInput,
          managerEmail: managerEmailInput
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Manager notification settings saved successfully.", "success");
        if (data.managerPhone) {
          setManagerPhoneInput(data.managerPhone);
        }
        setHealth((prev) => (prev ? { ...prev, managerPhone: data.managerPhone } : null));
      } else {
        showToast(data.error || "Failed to update notification settings.", "error");
      }
    } catch {
      showToast("Connection error while updating settings.", "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [searchTerm, statusFilter, courierFilter, isAuthenticated]);

  const handleOpenReport = async (orderId: string) => {
    try {
      const res = await adminFetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedOrderReport({
          orderId: data.order.id,
          orderNumber: data.order.order_number,
          reportText: data.reportText,
          whatsAppUrl: data.whatsAppUrl,
          managerPhone: data.managerPhone
        });
      }
    } catch (err) {
      showToast("Failed to load report.", "error");
    }
  };

  const handleRegenerateQr = async (orderId: string) => {
    try {
      const res = await adminFetch(`/api/admin/orders/${orderId}/regenerate-qr`, { method: "POST" });
      if (res.ok) {
        showToast("Delivery address QR regenerated successfully.", "success");
        loadDashboardData();
      } else {
        showToast("Failed to regenerate QR.", "error");
      }
    } catch {
      showToast("Failed to regenerate QR.", "error");
    }
  };

  const handleUpdateFulfillment = async (orderId: string, status: string) => {
    try {
      await adminFetch(`/api/admin/orders/${orderId}/update-fulfillment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      loadDashboardData();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price)
        })
      });
      if (res.ok) {
        showToast("Unique piece added to store inventory successfully.", "success");
        setShowAddProductModal(false);
        setNewProduct({
          sku: "",
          name: "",
          category: "WOMEN",
          subcategory: "",
          brand: "",
          gender: "Women",
          size: "",
          condition: "Excellent Vintage Condition",
          description: "",
          price: "",
          main_image: "",
          colour: "",
          material: "",
          measurements: "",
          tags: ""
        });
        loadDashboardData();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to create product", "error");
      }
    } catch (err: any) {
      showToast("Failed to add product: " + err.message, "error");
    }
  };

  // Login Screen View
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#1c1917]/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white text-stone-900 w-full max-w-md rounded-lg shadow-2xl p-8 border border-stone-200 space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-900 mx-auto mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold uppercase tracking-wider">
              STYLE AND CLASS
            </h2>
            <p className="text-xs text-stone-500 uppercase tracking-widest">
              Manager &middot; Authenticated Access
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                Admin Security Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter admin password..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full p-3 border border-stone-300 rounded text-sm focus:outline-none focus:border-stone-800"
              />
              <div className="flex items-center justify-between text-[10px] text-stone-400 mt-1.5">
                <span>Default: StyleAndClassLondon2026!</span>
                <button
                  type="button"
                  onClick={() => setPasswordInput("StyleAndClassLondon2026!")}
                  className="text-stone-700 hover:text-black font-semibold underline"
                >
                  Prefill Password
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#1c1917] hover:bg-stone-800 text-white font-semibold py-3 px-4 rounded text-xs uppercase tracking-wider transition disabled:opacity-50"
            >
              {isLoggingIn ? "Verifying..." : "Access Control Center"}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={onClose}
              className="text-xs text-stone-400 hover:text-stone-700 underline"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#faf9f6] text-stone-900 overflow-y-auto flex flex-col">
      {/* Non-intrusive Toast Notification Banner */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl text-xs font-medium border flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
          toast.type === "success"
            ? "bg-emerald-900 text-emerald-100 border-emerald-700"
            : "bg-rose-900 text-rose-100 border-rose-700"
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-[#1c1917] text-white px-6 py-4 border-b border-stone-800 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-serif tracking-[0.2em] text-lg font-bold uppercase">
              STYLE AND CLASS
            </h1>
            <span className="text-[10px] tracking-widest text-amber-300 uppercase block font-mono">
              Store Manager &middot; London Boutique Dispatch
            </span>
          </div>
        </div>

        {/* Global Search Box (Requirements Section 51) */}
        <div className="hidden md:flex items-center relative w-96">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Global search: Order #, Customer, Phone, Item, SKU, PayPal ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-800 text-white text-xs pl-9 pr-4 py-2 rounded border border-stone-700 focus:outline-none focus:border-stone-400 placeholder:text-stone-500"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <a
            href="/api/admin/export/orders.csv"
            className="hidden sm:inline-flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs px-3 py-1.5 rounded border border-stone-700 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={loadDashboardData}
            className="p-2 text-stone-400 hover:text-white rounded hover:bg-stone-800 transition"
            title="Refresh Store Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-rose-400 p-2 rounded hover:bg-stone-800 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="bg-stone-100 hover:bg-white text-stone-900 font-semibold text-xs px-3 py-1.5 rounded transition"
          >
            Exit to Store
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top-Level KPI Metric Cards (Requirements Section 48) */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
            <div className="bg-white p-3.5 rounded border border-stone-200 shadow-xs">
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Today Sales</span>
              <span className="text-xl font-bold text-stone-900 font-mono mt-1 block">{stats.todaySales}</span>
            </div>
            <div className="bg-white p-3.5 rounded border border-stone-200 shadow-xs">
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Today Revenue</span>
              <span className="text-xl font-bold text-stone-900 font-mono mt-1 block">£{stats.todayRevenue.toFixed(2)}</span>
            </div>
            <div className="bg-white p-3.5 rounded border border-stone-200 shadow-xs">
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Total Sales</span>
              <span className="text-xl font-bold text-stone-900 font-mono mt-1 block">{stats.totalSales}</span>
            </div>
            <div className="bg-white p-3.5 rounded border border-stone-200 shadow-xs">
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Total Revenue</span>
              <span className="text-xl font-bold text-stone-900 font-mono mt-1 block">£{stats.totalRevenue.toFixed(2)}</span>
            </div>
            <div className="bg-white p-3.5 rounded border border-emerald-200 shadow-xs">
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Available</span>
              <span className="text-xl font-bold text-emerald-900 font-mono mt-1 block">{stats.availableItems}</span>
            </div>
            <div className="bg-white p-3.5 rounded border border-stone-200 shadow-xs">
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Sold Items</span>
              <span className="text-xl font-bold text-stone-600 font-mono mt-1 block">{stats.soldItems}</span>
            </div>
            <div className="bg-white p-3.5 rounded border border-stone-200 shadow-xs">
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Pending</span>
              <span className="text-xl font-bold text-stone-600 font-mono mt-1 block">{stats.paymentPending}</span>
            </div>
            <div className="bg-white p-3.5 rounded border border-amber-200 shadow-xs">
              <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">To Ship</span>
              <span className="text-xl font-bold text-amber-900 font-mono mt-1 block">{stats.toShip}</span>
            </div>
            <div className="bg-white p-3.5 rounded border border-stone-200 shadow-xs">
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Notif Errors</span>
              <span className={`text-xl font-bold font-mono mt-1 block ${stats.notificationProblems > 0 ? "text-rose-600" : "text-stone-400"}`}>
                {stats.notificationProblems}
              </span>
            </div>
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div className="border-b border-stone-200 flex items-center justify-between">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("SALES")}
              className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                activeTab === "SALES"
                  ? "border-black text-black"
                  : "border-transparent text-stone-400 hover:text-stone-700"
              }`}
            >
              Recent Sales &amp; Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("PRODUCTS")}
              className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                activeTab === "PRODUCTS"
                  ? "border-black text-black"
                  : "border-transparent text-stone-400 hover:text-stone-700"
              }`}
            >
              Unique Product Inventory ({allProducts.length})
            </button>
            <button
              onClick={() => setActiveTab("RECONCILIATION")}
              className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                activeTab === "RECONCILIATION"
                  ? "border-black text-black"
                  : "border-transparent text-stone-400 hover:text-stone-700"
              }`}
            >
              Payment Reconciliation
            </button>
            <button
              onClick={() => setActiveTab("HEALTH")}
              className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                activeTab === "HEALTH"
                  ? "border-black text-black"
                  : "border-transparent text-stone-400 hover:text-stone-700"
              }`}
            >
              Health &amp; Dispatch Settings
            </button>
          </div>

          {activeTab === "PRODUCTS" && (
            <button
              onClick={() => setShowAddProductModal(true)}
              className="mb-2 bg-[#1c1917] hover:bg-stone-800 text-white px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Unique Piece (Qty 1)
            </button>
          )}
        </div>

        {/* TAB 1: SALES & ORDERS TABLE (Requirements Sections 49-51) */}
        {activeTab === "SALES" && (
          <div className="bg-white border border-stone-200 rounded-lg shadow-xs overflow-hidden">
            {/* Table Filters */}
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-stone-700">Filter Orders:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-stone-300 rounded px-2.5 py-1 bg-white"
                >
                  <option value="ALL">All Payment Statuses</option>
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                  <option value="FAILED">FAILED</option>
                </select>

                <select
                  value={courierFilter}
                  onChange={(e) => setCourierFilter(e.target.value)}
                  className="border border-stone-300 rounded px-2.5 py-1 bg-white"
                >
                  <option value="ALL">All Couriers</option>
                  <option value="EVRI">EVRI</option>
                  <option value="ROYAL_MAIL">ROYAL MAIL</option>
                  <option value="INPOST">INPOST</option>
                </select>
              </div>

              <div className="text-stone-500">
                Found {orders.length} orders
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-100 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Date / Time</th>
                    <th className="py-3 px-4">Item &amp; Photo</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Customer &amp; Phone</th>
                    <th className="py-3 px-4">Courier</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Fulfillment</th>
                    <th className="py-3 px-4">Address QR</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {orders.length > 0 ? (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-stone-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-stone-900">
                          #{o.order_number}
                        </td>
                        <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                          {new Date(o.created_at).toLocaleDateString("en-GB")}
                          <br />
                          <span className="text-[10px]">{new Date(o.created_at).toLocaleTimeString("en-GB")}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            {o.image_snapshot && (
                              <img
                                src={o.image_snapshot}
                                alt={o.product_name || "Garment"}
                                className="w-9 h-11 object-cover rounded border border-stone-200 shrink-0"
                              />
                            )}
                            <div className="min-w-0 max-w-xs">
                              <div className="font-semibold text-stone-900 truncate">
                                {o.product_name || "Unique Piece"}
                              </div>
                              <div className="text-[10px] text-stone-500 font-mono">
                                {o.sku} &middot; {o.size}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-stone-900 whitespace-nowrap">
                          £{Number(o.total_amount).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-stone-900">{o.customer_name}</div>
                          <div className="text-stone-500 text-[11px] font-mono">{o.customer_phone}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-stone-800">
                          {o.shipping_company}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.payment_status === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {o.payment_status}
                          </span>
                          <div className="text-[10px] text-stone-400 mt-0.5">
                            {o.payment_method}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={o.fulfillment_status}
                            onChange={(e) => handleUpdateFulfillment(o.id, e.target.value)}
                            className="text-[11px] border border-stone-300 rounded px-1.5 py-0.5 bg-white font-medium"
                          >
                            <option value="NEW">NEW</option>
                            <option value="PACKING">PACKING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          {o.qr_code_data ? (
                            <button
                              onClick={() => setSelectedOrderForPrint(o)}
                              title="View Address QR"
                              className="p-1 text-stone-700 hover:text-black border border-stone-300 rounded bg-stone-50 hover:bg-stone-100 transition"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRegenerateQr(o.id)}
                              className="text-[10px] text-amber-700 underline"
                            >
                              Regenerate
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => setSelectedOrderForPrint(o)}
                            className="p-1.5 text-stone-600 hover:text-black hover:bg-stone-100 rounded"
                            title="Print Packing Sheet"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenReport(o.id)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded"
                            title="Manager Sale Report & WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-stone-500">
                        No orders match your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT INVENTORY (Requirements Section 52-54) */}
        {activeTab === "PRODUCTS" && (
          <div className="bg-white border border-stone-200 rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-800">
                1-of-1 Physical Stock Catalogue (Total: {allProducts.length})
              </span>
              <span className="text-stone-500">
                Quantity = 1 strictly enforced
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-100 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Photo</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {allProducts.map((p) => {
                    const isSold = p.is_sold === 1 || p.status === "SOLD";
                    return (
                      <tr key={p.id} className="hover:bg-stone-50 transition">
                        <td className="py-2.5 px-4">
                          <img
                            src={p.main_image}
                            alt={p.name}
                            className="w-10 h-12 object-cover rounded border border-stone-200"
                          />
                        </td>
                        <td className="py-2.5 px-4 font-mono text-stone-600 font-semibold">{p.sku}</td>
                        <td className="py-2.5 px-4 font-medium text-stone-900 max-w-xs truncate">{p.name}</td>
                        <td className="py-2.5 px-4">{p.category}</td>
                        <td className="py-2.5 px-4">{p.brand}</td>
                        <td className="py-2.5 px-4 font-semibold">{p.size}</td>
                        <td className="py-2.5 px-4 text-stone-500">{p.condition}</td>
                        <td className="py-2.5 px-4 font-bold text-stone-900 font-mono">£{Number(p.price).toFixed(2)}</td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isSold ? "bg-stone-200 text-stone-700" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {isSold ? "SOLD" : "AVAILABLE"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT RECONCILIATION (Requirements Section 40) */}
        {activeTab === "RECONCILIATION" && (
          <div className="bg-white border border-stone-200 rounded-lg shadow-xs overflow-hidden space-y-4 p-6">
            <div>
              <h2 className="text-base font-bold text-stone-900 uppercase tracking-wider">
                Payment Reconciliation Ledger
              </h2>
              <p className="text-xs text-stone-500">
                Audits website order amounts against PayPal captured amounts. Mismatches are prominently flagged.
              </p>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-100 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Website Total</th>
                    <th className="py-3 px-4">PayPal Captured</th>
                    <th className="py-3 px-4">Currency</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">PayPal Reference</th>
                    <th className="py-3 px-4 text-center">Audit Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {reconciliation.map((rec) => (
                    <tr key={rec.orderId} className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-mono font-bold">#{rec.orderNumber}</td>
                      <td className="py-3 px-4 text-stone-500">{new Date(rec.createdAt).toLocaleDateString("en-GB")}</td>
                      <td className="py-3 px-4 font-mono font-semibold">£{rec.websiteTotal.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono font-semibold">£{rec.paypalTotal.toFixed(2)}</td>
                      <td className="py-3 px-4">{rec.currency}</td>
                      <td className="py-3 px-4">{rec.paymentMethod}</td>
                      <td className="py-3 px-4 font-mono text-[10px] text-stone-500">{rec.paypalCaptureId || rec.paypalOrderId || "N/A"}</td>
                      <td className="py-3 px-4 text-center">
                        {rec.isMatch ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> MATCH OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3 text-rose-600" /> MISMATCH
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM HEALTH & OBSERVABILITY (Requirements Section 63) */}
        {activeTab === "HEALTH" && health && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Database Engine</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm text-stone-900 font-mono">SQLite (ACID / WAL)</span>
              </div>
              <p className="text-[11px] text-stone-500">Local relational database with disk persistence.</p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">PayPal REST API</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm text-stone-900 font-mono">{health.paypal}</span>
              </div>
              <p className="text-[11px] text-stone-500">Official v2 Orders &amp; Capture REST integration.</p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">QR Code Generator</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm text-stone-900 font-mono">100% FREE / SELF-HOSTED</span>
              </div>
              <p className="text-[11px] text-stone-500">£0 per-QR fee. Generates local delivery codes.</p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">WhatsApp Dispatch</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm text-stone-900 font-mono">{health.whatsAppMode}</span>
              </div>
              <p className="text-[11px] text-stone-500">Mode A prefilled instant dispatch &amp; Mode B API ready.</p>
            </div>
          </div>

          {/* Store Manager WhatsApp & Dispatch Notification Channel (MANAGER_WHATSAPP_PHONE) */}
          <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <span>Store Manager WhatsApp &amp; Dispatch Channel</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Primary notification destination for instant sale alerts, customer address details, courier QR codes, and Mayfair packaging instructions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded">
                  Config: MANAGER_WHATSAPP_PHONE
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center justify-between">
                  <span>Manager WhatsApp Phone Number</span>
                  <span className="text-[10px] text-stone-400 font-mono font-normal">International format (+44...)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={managerPhoneInput}
                    onChange={(e) => setManagerPhoneInput(e.target.value)}
                    placeholder="+447911123456"
                    className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Used for Mode A instant 1-click WhatsApp dispatch links and direct courier report forwarding.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center justify-between">
                  <span>Manager Notification Email</span>
                  <span className="text-[10px] text-stone-400 font-mono font-normal">Optional backup</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={managerEmailInput}
                    onChange={(e) => setManagerEmailInput(e.target.value)}
                    placeholder="manager@styleandclass.co.uk"
                    className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:outline-none"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Used as the backup channel for delivery receipts and sales audit logs.
                </p>
              </div>

              <div className="md:col-span-2 pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-stone-100">
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="bg-[#1c1917] hover:bg-stone-800 text-white px-5 py-2 rounded text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 transition disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingSettings ? "Saving..." : "Save Notification Settings"}</span>
                  </button>

                  <a
                    href={`https://wa.me/${managerPhoneInput.replace(/[^\d+]/g, "").replace(/^\+/, "")}?text=${encodeURIComponent("STYLE AND CLASS (London Mayfair) - Test dispatch connection to store manager WhatsApp.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Test WhatsApp Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <span className="text-[11px] text-stone-400">
                  Active destination: <strong className="text-stone-700 font-mono">{health.managerPhone || managerPhoneInput}</strong>
                </span>
              </div>
            </form>
          </div>
        </div>
        )}
      </main>

      {/* Printable Sheet Modal */}
      {selectedOrderForPrint && (
        <PrintablePackingSheet
          order={selectedOrderForPrint}
          onClose={() => setSelectedOrderForPrint(null)}
        />
      )}

      {/* Manager Report Modal */}
      {selectedOrderReport && (
        <ManagerReportModal
          orderId={selectedOrderReport.orderId}
          orderNumber={selectedOrderReport.orderNumber}
          reportText={selectedOrderReport.reportText}
          whatsAppUrl={selectedOrderReport.whatsAppUrl}
          managerPhone={selectedOrderReport.managerPhone}
          onClose={() => setSelectedOrderReport(null)}
          onResendReport={async () => {
            await adminFetch(`/api/admin/orders/${selectedOrderReport.orderId}/resend-report`, { method: "POST" });
          }}
        />
      )}

      {/* Add Product Modal (Default Qty = 1) */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-stone-900 w-full max-w-2xl rounded-lg shadow-2xl p-6 border border-stone-200 space-y-4 my-8">
            <h3 className="text-base font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3">
              Add Unique Second-Hand Garment (Quantity = 1)
            </h3>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SC-W-BUR-011"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full p-2 border rounded border-stone-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Price (£ GBP) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 245.00"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full p-2 border rounded border-stone-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aquascutum Vintage Club Check Wool Coat"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-2 border rounded border-stone-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                    className="w-full p-2 border rounded border-stone-300 bg-white"
                  >
                    <option value="WOMEN">WOMEN</option>
                    <option value="MEN">MEN</option>
                    <option value="KIDS">KIDS</option>
                    <option value="ACCESSORIES">ACCESSORIES</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Aquascutum"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full p-2 border rounded border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Size</label>
                  <input
                    type="text"
                    placeholder="e.g. UK 12 / Medium"
                    value={newProduct.size}
                    onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
                    className="w-full p-2 border rounded border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Condition</label>
                  <input
                    type="text"
                    placeholder="e.g. Excellent Vintage Condition"
                    value={newProduct.condition}
                    onChange={(e) => setNewProduct({ ...newProduct, condition: e.target.value })}
                    className="w-full p-2 border rounded border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Main Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newProduct.main_image}
                    onChange={(e) => setNewProduct({ ...newProduct, main_image: e.target.value })}
                    className="w-full p-2 border rounded border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed garment provenance, tailoring, lining, and condition report..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full p-2 border rounded border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Measurements</label>
                  <input
                    type="text"
                    placeholder="e.g. Chest: 42 in, Length: 39 in"
                    value={newProduct.measurements}
                    onChange={(e) => setNewProduct({ ...newProduct, measurements: e.target.value })}
                    className="w-full p-2 border rounded border-stone-300 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Material</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Pure Virgin Wool"
                    value={newProduct.material}
                    onChange={(e) => setNewProduct({ ...newProduct, material: e.target.value })}
                    className="w-full p-2 border rounded border-stone-300"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 border rounded border-stone-300 text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1c1917] hover:bg-stone-800 text-white font-semibold rounded"
                >
                  Add Piece to Catalogue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
