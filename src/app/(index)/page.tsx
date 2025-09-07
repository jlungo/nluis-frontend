import React, { useState, useEffect } from 'react';
import TanzaniaMapDashboard from '@/components/TanzaniaMapDashboard';
import KeyFeatures from '@/components/KeyFeatures';
import {
  FileCheck,
  Map,
  Network,
  Home,
  Users,
  Search,
  UserPlus,
  ShoppingCart,
  X,
  Menu,
  ExternalLink
} from 'lucide-react';

import logo from '@/assets/nluis.png';
import bibiNaBwana from '@/assets/bibi_na_bwana.png';

const backgroundImage = '/landing.png';

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Set document title
  useEffect(() => {
    document.title = "National Land Use Information System - NLUPC";
  }, []);

  // Navigation handlers
  const handleLogin = () => window.location.href = '/auth/signin';
  const handleExplore = () => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  const handleCreateAccount = () => window.location.href = '/auth/signup';
  const handleMapShop = () => window.location.href = '/mapshop';

  // Header visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsHeaderVisible(currentScrollY <= lastScrollY || currentScrollY <= 100);
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Navigation helper
  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navigationItems = [
    { id: 'home', label: 'HOME' },
    { id: 'key-features', label: 'KEY FEATURES' },
    { id: 'land-mapping', label: 'LAND MAPPING' },
    
  ];

  const stats = [
    { number: '94.7%', label: 'CCROs Offered', icon: <FileCheck className="h-6 w-6" /> },
    { number: '37600', label: 'Land use plans', icon: <Map className="h-6 w-6" /> },
    { number: '156', label: 'Districts Connected', icon: <Network className="h-6 w-6" /> },
    { number: '24500', label: 'Total Villages', icon: <Home className="h-6 w-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-chart-2/5">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border z-50 transition-transform duration-300 shadow-lg ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Branding */}
            <div className="flex items-center gap-3 md:gap-6">
              {/* Tanzania Coat of Arms */}
              <div className="flex items-center gap-3">
                <img
                  src={bibiNaBwana}
                  alt="Tanzania Coat of Arms"
                  className="h-9 w-9 lg:h-12 lg:w-12 object-contain"
                />
                <div className="border-l border-border pl-3 hidden lg:block">
                  <div className="text-sm font-medium text-primary">
                    United Republic of Tanzania
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Ministry of Lands
                  </div>
                </div>
              </div>
              
              {/* NLUPC Logo */}
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="National Land Use Planning Commission"
                  className="h-9 w-9 lg:h-12 lg:w-12 object-contain scale-150"
                />
                <div className="hidden lg:block">
                  <div className="text-sm font-medium text-primary">NLUPC</div>
                  <div className="text-xs text-muted-foreground">
                    National Land Use Planning Commission
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    activeSection === item.id ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={handleMapShop}
                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
              >
                MAPSHOP
              </button>
            </nav>

            {/* Action buttons and controls */}
            <div className="flex items-center gap-3">
              {/* Search - Desktop Only */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-40 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-background"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateAccount}
                  className="hidden sm:flex items-center gap-1 px-3 py-2 bg-chart-2 text-white rounded-lg hover:bg-chart-2/90 transition-colors text-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Register</span>
                </button>
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  <Users className="h-4 w-4" />
                  <span>Login</span>
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <div className="container mx-auto px-4 py-3">
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-2 border-t border-border">
                  <button
                    onClick={handleCreateAccount}
                    className="flex items-center gap-2 w-full px-4 py-2 text-chart-2 hover:bg-chart-2/10 rounded-lg transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </button>
                  <button
                    onClick={handleMapShop}
                    className="flex items-center gap-2 w-full px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    MapShop
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="pt-16">
        {/* Hero Section */}
        <section id="home" className="relative min-h-screen flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url('${backgroundImage}')`
            }}
          />
          <div className="relative container mx-auto px-4 py-20 text-center text-white">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                National Land Use Information System
              </h1>
              <p className="text-lg md:text-xl mb-8 opacity-90">
                National land use planning and management system for the United Republic of Tanzania
              </p>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                    <div className="flex items-center justify-center mb-2">
                      {stat.icon}
                    </div>
                    <div className="font-bold text-xl">{stat.number}</div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Call to Action */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleLogin}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Access System
                </button>
                <button
                  onClick={handleExplore}
                  className="bg-white/20 text-white border border-white/30 px-8 py-3 rounded-lg hover:bg-white/30 transition-colors font-medium"
                >
                  Explore Features
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section id="key-features" className="relative">
          <KeyFeatures />
        </section>

        {/* Land Mapping Section */}
        <section
          id="land-mapping"
          className="relative w-full min-h-screen flex flex-col items-center justify-center bg-background"
          style={{ minHeight: '100vh', height: '100vh', padding: 0 }}
        >
          {/* Map Dashboard Title */}
          <div className="text-center mb-6 px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Interactive Land Use Map
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore Tanzania's land use patterns, regional statistics, and CCRO data through our interactive mapping dashboard
            </p>
          </div>
          
          <div className="w-full flex-1">
            <TanzaniaMapDashboard />
          </div>
        </section>

        {/* MapShop CTA Section */}
        <section className="relative py-20 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <ShoppingCart className="h-4 w-4" />
                Purchase Land Use Data
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Need Detailed Land Use Plans and Maps?
              </h2>
              
              <p className="text-lg text-slate-600 mb-8">
                Access land use plans, detailed maps, and geospatial data for your projects through our MapShop platform. Get official, up-to-date land use information for any region in Tanzania.
              </p>
              
              <button
                onClick={handleMapShop}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105 font-medium text-lg shadow-lg"
              >
                <ShoppingCart className="h-5 w-5" />
                Visit MapShop
                <ExternalLink className="h-4 w-4" />
              </button>
              
              <div className="mt-8 text-sm text-slate-500">
                Official land use data • Verified mapping • Instant download
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}