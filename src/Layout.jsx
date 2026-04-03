import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Car,
  Users,
  Route,
  Key,
  Settings,
  Wrench,
  BarChart3,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Fuel,
  Calculator,
  Map
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppSettings } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { name: "Strona główna", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Pojazdy", icon: Car, page: "Vehicles" },
  { name: "Kierowcy", icon: Users, page: "Drivers" },
  { name: "Podróże", icon: Route, page: "Trips" },
  { name: "Kluczyki", icon: Key, page: "Keys" },
  { name: "Serwisy", icon: Wrench, page: "Services" },
  { name: "Statystyki", icon: BarChart3, page: "Statistics" },
  { name: "Tankowania", icon: Fuel, page: "Refueling" },
  { name: "Kalkulatory", icon: Calculator, page: "Calculators" },
  { name: "Mapa", icon: Map, page: "MapPage" },
  { name: "Ustawienia", icon: Settings, page: "Settings" },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { settings } = useAppSettings();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Funkcja obsługująca wylogowanie
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-theme-white text-lg">LongDrive</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-theme-white-secondary hover:text-theme-white"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || true) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: sidebarOpen ? 0 : (window.innerWidth >= 1024 ? 0 : -280) }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200, duration: settings.animationSpeed }}
            className={`fixed top-0 left-0 z-40 h-full w-72 sidebar
              ${sidebarOpen ? 'block' : 'hidden lg:block'}`}
          >
            <div className="flex flex-col h-full p-6">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-10">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: settings.animationSpeed }}
                  className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg"
                >
                  <Car className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="font-bold text-theme-white text-xl tracking-tight">LongDrive</h1>
                  <p className="text-xs text-theme-white-secondary">Zarządzanie Flotą</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                  const isActive = item.page === currentPageName;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.page}
                      to={item.page === "Dashboard" ? "/" : createPageUrl(item.page)}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <motion.div
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: settings.animationSpeed }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                          ${isActive 
                            ? 'bg-gradient-primary text-white shadow-lg shadow-primary/25' 
                            : 'text-theme-white-secondary hover:text-theme-white hover:bg-white/5'
                          }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-gradient-primary rounded-xl -z-10"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-primary'}`} />
                        <span className={`font-medium ${isActive ? 'text-white' : ''}`}>{item.name}</span>
                        {isActive && (
                          <ChevronRight className="w-4 h-4 ml-auto text-white" />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </nav>

              {/* User Section – dane z kontekstu */}
              {user && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: settings.animationSpeed, delay: 0.2 }}
                  className="mt-auto pt-6 border-t border-white/5"
                >
                  <div className="flex items-center gap-3 px-2 mb-4">
                    <Avatar className="w-10 h-10 border-2 border-primary/50">
                      <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-theme-white truncate">
                        {user.name || 'Użytkownik'}
                      </p>
                      <p className="text-xs text-theme-white-secondary truncate">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-theme-white-secondary hover:text-red-400 hover:bg-red-500/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Wyloguj się
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: settings.animationSpeed }}
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}