import React, { useState, useEffect } from "react";
import { Product, ProductCategory } from "./types";
import { CartProvider, useCart } from "./context/CartContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { HomePage } from "./pages/HomePage";
import { CategoryPage } from "./pages/CategoryPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { AdminDashboard } from "./pages/AdminDashboard";

function MainContent() {
  const [view, setView] = useState<"HOME" | "CATEGORY" | "PRODUCT_DETAIL" | "CHECKOUT" | "ORDER_CONFIRMATION">("HOME");
  const [currentCategory, setCurrentCategory] = useState<ProductCategory | "ALL">("ALL");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [completedOrderData, setCompletedOrderData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);

  // Products loaded from server database
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSelectCategory = (cat: ProductCategory | "ALL") => {
    setCurrentCategory(cat);
    setView("CATEGORY");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setView("PRODUCT_DETAIL");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (term.trim().length > 0 && view !== "CATEGORY") {
      setView("CATEGORY");
    }
  };

  const handleOrderSuccess = (orderData: any) => {
    setCompletedOrderData(orderData);
    setView("ORDER_CONFIRMATION");
    fetchProducts(); // Refresh stock status across storefront
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 flex flex-col font-sans selection:bg-stone-800 selection:text-white">
      {/* Primary Boutique Navbar */}
      <Navbar
        currentCategory={currentCategory}
        onSelectCategory={handleSelectCategory}
        onNavigateHome={() => {
          setView("HOME");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenAdmin={() => setShowAdmin(true)}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      {/* Main Page Router */}
      <main className="flex-1">
        {loadingProducts ? (
          <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs uppercase tracking-widest text-stone-500 font-medium">
              Loading London Boutique Catalogue...
            </p>
          </div>
        ) : (
          <>
            {view === "HOME" && (
              <HomePage
                products={products}
                onSelectProduct={handleSelectProduct}
                onSelectCategory={handleSelectCategory}
              />
            )}

            {view === "CATEGORY" && (
              <CategoryPage
                currentCategory={currentCategory}
                onSelectCategory={setCurrentCategory}
                products={products}
                onSelectProduct={handleSelectProduct}
                searchTerm={searchTerm}
                onClearSearch={() => setSearchTerm("")}
              />
            )}

            {view === "PRODUCT_DETAIL" && selectedProduct && (
              <ProductDetailPage
                product={selectedProduct}
                onBack={() => setView("CATEGORY")}
                onBuyNow={() => setView("CHECKOUT")}
              />
            )}

            {view === "CHECKOUT" && (
              <CheckoutPage
                onBack={() => {
                  if (selectedProduct) {
                    setView("PRODUCT_DETAIL");
                  } else {
                    setView("HOME");
                  }
                }}
                onOrderSuccess={handleOrderSuccess}
              />
            )}

            {view === "ORDER_CONFIRMATION" && completedOrderData && (
              <OrderConfirmationPage
                orderData={completedOrderData}
                onReturnHome={() => {
                  setView("HOME");
                  setSelectedProduct(null);
                  setCompletedOrderData(null);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Shopping Basket Drawer */}
      <CartDrawer
        onProceedToCheckout={() => {
          setView("CHECKOUT");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Official London Boutique Footer */}
      <Footer onOpenAdmin={() => setShowAdmin(true)} />

      {/* Admin Store Manager Modal */}
      {showAdmin && (
        <AdminDashboard
          onClose={() => {
            setShowAdmin(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <MainContent />
    </CartProvider>
  );
}
