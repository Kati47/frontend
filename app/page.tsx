"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sun,
  Moon,
  ShoppingCart,
  Globe,
  Shield,
  Smartphone,
  ChevronRight,
  ArrowRight,
  Zap,
  Layers,
  Clock,
  Check,
  Menu,
  X,
  BarChart3,
  CreditCard,
  Truck,
  Headphones,
  Settings,
  PenTool,
  Bell,
} from "lucide-react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/i18n/client";
import { LanguageSelector } from "@/components/language-selector";

export default function LandingPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Refs for scroll animations
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const showcaseRef = useRef(null);
  const testimonialsRef = useRef(null);
  const pricingRef = useRef(null);
  const ctaRef = useRef(null);
  const howItWorksRef = useRef(null);
  const benefitsRef = useRef(null);

  // InView states for animations
  const heroInView = useInView(heroRef, { once: true, amount: 0.2 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const showcaseInView = useInView(showcaseRef, { once: true, amount: 0.2 });
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.2 });
  const pricingInView = useInView(pricingRef, { once: true, amount: 0.2 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.2 });
  const howItWorksInView = useInView(howItWorksRef, { once: true, amount: 0.2 });
  const benefitsInView = useInView(benefitsRef, { once: true, amount: 0.2 });

  // Scroll animation for the hero section
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  // Detect scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest(".mobile-menu") && !event.target.closest(".menu-button")) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Benefits data
  const benefits = [
    {
      icon: <BarChart3 className="h-10 w-10" />,
      title: t("increased_conversion_rates"),
      description: t("increased_conversion_rates_desc"),
    },
    {
      icon: <CreditCard className="h-10 w-10" />,
      title: t("secure_payment_processing"),
      description: t("secure_payment_processing_desc"),
    },
    {
      icon: <Truck className="h-10 w-10" />,
      title: t("streamlined_shipping"),
      description: t("streamlined_shipping_desc"),
    },
    {
      icon: <Headphones className="h-10 w-10" />,
      title: t("customer_support"),
      description: t("customer_support_desc"),
    },
  ];

  // How it works steps
  const howItWorksSteps = [
    {
      number: "01",
      title: t("create_your_store"),
      description: t("create_your_store_desc"),
    },
    {
      number: "02",
      title: t("add_your_products"),
      description: t("add_your_products_desc"),
    },
    {
      number: "03",
      title: t("configure_settings"),
      description: t("configure_settings_desc"),
    },
    {
      number: "04",
      title: t("launch_and_grow"),
      description: t("launch_and_grow_desc"),
    },
  ];

  // Store features
  const storeFeatures = [
    {
      title: t("product_management"),
      description: t("product_management_desc"),
      icon: <Settings className="h-6 w-6" />,
    },
    {
      title: t("custom_storefronts"),
      description: t("custom_storefronts_desc"),
      icon: <PenTool className="h-6 w-6" />,
    },
    {
      title: t("marketing_tools"),
      description: t("marketing_tools_desc"),
      icon: <Bell className="h-6 w-6" />,
    },
    {
      title: t("analytics_dashboard"),
      description: t("analytics_dashboard_desc"),
      icon: <BarChart3 className="h-6 w-6" />,
    },
  ];

  return (
    <div className="relative bg-white dark:bg-slate-900 overflow-hidden">
      {/* Decorative elements with brand color */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#0b3093] filter blur-3xl opacity-5 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#0b3093] filter blur-3xl opacity-5 translate-x-1/3 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] rounded-full bg-[#0b3093] filter blur-[120px] opacity-[0.03] -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-[#0b3093] dark:text-[#5a89ff]">Kadéa Design</span>
              </Link>
            </div>

       
            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="relative text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">{t("toggle_theme")}</span>
              </Button>
              
              {/* Language selector */}
              <LanguageSelector />

              {/* Auth buttons - desktop */}
              <div className="hidden sm:flex items-center space-x-3">
                <Button
                  asChild
                  variant="ghost"
                  className="text-slate-700 dark:text-slate-300 hover:text-[#0b3093] dark:hover:text-[#5a89ff]"
                >
                  <Link href="/login">{t("sign_in")}</Link>
                </Button>
                <Button
                  asChild
                  className="bg-[#0b3093] dark:bg-[#5a89ff] text-white hover:bg-[#0b3093]/90 dark:hover:bg-[#5a89ff]/90"
                >
                  <Link href="/register">{t("get_started")}</Link>
                </Button>
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden menu-button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                ) : (
                  <Menu className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                )}
                <span className="sr-only">{t("toggle_menu")}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mobile-menu">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm dark:bg-slate-900/80 z-50">
              <div className="fixed top-20 right-0 w-full max-w-xs bg-white dark:bg-slate-800 rounded-l-xl p-6 shadow-lg h-[calc(100vh-5rem)] overflow-y-auto">
                <nav className="flex flex-col space-y-6 text-lg">
                  <a
                    href="#features"
                    className="text-slate-700 dark:text-slate-300 hover:text-[#0b3093] dark:hover:text-[#5a89ff] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("features")}
                  </a>
                  <a
                    href="#how-it-works"
                    className="text-slate-700 dark:text-slate-300 hover:text-[#0b3093] dark:hover:text-[#5a89ff] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("how_it_works")}
                  </a>
                  <a
                    href="#testimonials"
                    className="text-slate-700 dark:text-slate-300 hover:text-[#0b3093] dark:hover:text-[#5a89ff] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("testimonials")}
                  </a>
                  <a
                    href="#pricing"
                    className="text-slate-700 dark:text-slate-300 hover:text-[#0b3093] dark:hover:text-[#5a89ff] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("pricing")}
                  </a>
                  <Separator />
                  <div className="flex flex-col space-y-4">
                    <Button asChild variant="outline" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      <Link href="/login">{t("sign_in")}</Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full bg-[#0b3093] dark:bg-[#5a89ff] text-white hover:bg-[#0b3093]/90 dark:hover:bg-[#5a89ff]/90"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/register">{t("get_started")}</Link>
                    </Button>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero section */}
        <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden" ref={heroRef}>
          <motion.div style={{ y, opacity }} className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Badge className="mb-4 bg-[#0b3093]/10 text-[#0b3093] dark:bg-[#5a89ff]/10 dark:text-[#5a89ff] hover:bg-[#0b3093]/20 dark:hover:bg-[#5a89ff]/20">
                {t("redefining_ecommerce")}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                <span className="block">{t("modern_ecommerce")}</span>
                <span className="block mt-2 text-[#0b3093] dark:text-[#5a89ff]">{t("extraordinary_results")}</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                {t("hero_subtitle_long")}
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#0b3093] dark:bg-[#5a89ff] text-white hover:bg-[#0b3093]/90 dark:hover:bg-[#5a89ff]/90 px-8 rounded-full shadow-lg shadow-[#0b3093]/20 dark:shadow-[#5a89ff]/20"
                >
                  <Link href="/register">
                    {t("begin_your_experience")} <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#0b3093]/30 dark:hover:border-[#5a89ff]/30 rounded-full"
                >
                 
                </Button>
              </div>
            </motion.div>

            {/* Hero stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.4 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto"
            >
              {[
                { label: t("active_stores"), value: "10,000+" },
                { label: t("countries"), value: "120+" },
                { label: t("transactions"), value: "$500M+" },
                { label: t("customer_satisfaction"), value: "98%" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-slate-100 dark:border-slate-700"
                >
                  <p className="text-2xl md:text-3xl font-bold text-[#0b3093] dark:text-[#5a89ff]">{stat.value}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Brands section */}
        <section className="py-12 bg-slate-50 dark:bg-slate-800/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">
              {t("trusted_by_leading_brands")}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {[t("brand_1"), t("brand_2"), t("brand_3"), t("brand_4"), t("brand_5")].map((brand, i) => (
                <div
                  key={i}
                  className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                >
                  <p className="font-bold text-lg text-slate-400 dark:text-slate-500">{brand}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits section */}
        <section id="benefits" className="py-20 sm:py-32" ref={benefitsRef}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-[#0b3093]/10 text-[#0b3093] dark:bg-[#5a89ff]/10 dark:text-[#5a89ff] hover:bg-[#0b3093]/20 dark:hover:bg-[#5a89ff]/20">
                {t("why_choose_us")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {t("benefits_that_drive_results")}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {t("benefits_subtitle")}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-6 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-[#0b3093]/20 dark:hover:border-[#5a89ff]/20 transition-all duration-300"
                >
                  <div className="rounded-full bg-[#0b3093]/10 dark:bg-[#5a89ff]/10 p-4 h-fit text-[#0b3093] dark:text-[#5a89ff]">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{benefit.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works section */}
        <section id="how-it-works" className="py-20 sm:py-32 bg-slate-50 dark:bg-slate-800/50" ref={howItWorksRef}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-[#0b3093]/10 text-[#0b3093] dark:bg-[#5a89ff]/10 dark:text-[#5a89ff] hover:bg-[#0b3093]/20 dark:hover:bg-[#5a89ff]/20">
                {t("simple_process")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t("how_it_works")}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {t("how_it_works_subtitle")}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorksSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-[calc(100%-2rem)] h-0.5 bg-slate-200 dark:bg-slate-700 -z-10 transform -translate-x-1/2">
                      <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </div>
                    </div>
                  )}
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-[#0b3093]/20 dark:hover:border-[#5a89ff]/20 transition-all duration-300 h-full">
                    <div className="w-12 h-12 rounded-full bg-[#0b3093]/10 dark:bg-[#5a89ff]/10 flex items-center justify-center text-[#0b3093] dark:text-[#5a89ff] font-bold text-lg mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="py-20 sm:py-32" ref={featuresRef}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-[#0b3093]/10 text-[#0b3093] dark:bg-[#5a89ff]/10 dark:text-[#5a89ff] hover:bg-[#0b3093]/20 dark:hover:bg-[#5a89ff]/20">
                {t("powerful_features")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {t("advanced_ecommerce_features")}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t("features_subtitle")}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {[
                {
                  icon: <ShoppingCart className="h-6 w-6" />,
                  title: t("seamless_checkout"),
                  description: t("seamless_checkout_desc_long"),
                  delay: 0.1,
                },
                {
                  icon: <Globe className="h-6 w-6" />,
                  title: t("global_reach"),
                  description: t("global_reach_desc_long"),
                  delay: 0.2,
                },
                {
                  icon: <Shield className="h-6 w-6" />,
                  title: t("secure_payments"),
                  description: t("secure_payments_desc_long"),
                  delay: 0.3,
                },
                {
                  icon: <Smartphone className="h-6 w-6" />,
                  title: t("mobile_optimized"),
                  description: t("mobile_optimized_desc_long"),
                  delay: 0.4,
                },
                {
                  icon: <Zap className="h-6 w-6" />,
                  title: t("lightning_fast"),
                  description: t("lightning_fast_desc_long"),
                  delay: 0.5,
                },
                {
                  icon: <Layers className="h-6 w-6" />,
                  title: t("customizable"),
                  description: t("customizable_desc_long"),
                  delay: 0.6,
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: feature.delay }}
                  className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:border-[#0b3093]/20 dark:hover:border-[#5a89ff]/20 group"
                >
                  <div className="rounded-full bg-[#0b3093]/10 dark:bg-[#5a89ff]/10 p-3 inline-flex items-center justify-center mb-4 group-hover:bg-[#0b3093]/20 dark:group-hover:bg-[#5a89ff]/20 transition-colors duration-300">
                    <div className="text-[#0b3093] dark:text-[#5a89ff]">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Showcase section */}
        <section
          id="showcase"
          className="py-20 sm:py-32 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800"
          ref={showcaseRef}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={showcaseInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-[#0b3093]/10 text-[#0b3093] dark:bg-[#5a89ff]/10 dark:text-[#5a89ff] hover:bg-[#0b3093]/20 dark:hover:bg-[#5a89ff]/20">
                {t("store_features")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {t("everything_to_succeed")}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {t("everything_to_succeed_desc")}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {storeFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={showcaseInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-[#0b3093]/20 dark:hover:border-[#5a89ff]/20 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-[#0b3093]/10 dark:bg-[#5a89ff]/10 p-3 text-[#0b3093] dark:text-[#5a89ff]">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                asChild
                className="bg-[#0b3093] dark:bg-[#5a89ff] text-white hover:bg-[#0b3093]/90 dark:hover:bg-[#5a89ff]/90 rounded-full shadow-lg shadow-[#0b3093]/20 dark:shadow-[#5a89ff]/20"
              >
                <Link href="/register">
                  {t("start_building_store")} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials section */}
        <section id="testimonials" className="py-20 sm:py-32" ref={testimonialsRef}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-[#0b3093]/10 text-[#0b3093] dark:bg-[#5a89ff]/10 dark:text-[#5a89ff] hover:bg-[#0b3093]/20 dark:hover:bg-[#5a89ff]/20">
                {t("testimonials")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {t("client_testimonials")}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {t("testimonials_subtitle")}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: t("testimonial_1_name"),
                  role: t("testimonial_1_role"),
                  quote: t("testimonial_1"),
                  delay: 0.1,
                },
                {
                  name: t("testimonial_2_name"),
                  role: t("testimonial_2_role"),
                  quote: t("testimonial_2"),
                  delay: 0.3,
                },
                {
                  name: t("testimonial_3_name"),
                  role: t("testimonial_3_role"),
                  quote: t("testimonial_3"),
                  delay: 0.5,
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: testimonial.delay }}
                  className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:border-[#0b3093]/20 dark:hover:border-[#5a89ff]/20"
                >
                  <div className="flex items-center mb-6">
                    <div className="h-12 w-12 rounded-full bg-[#0b3093]/10 dark:bg-[#5a89ff]/10 flex items-center justify-center text-[#0b3093] dark:text-[#5a89ff] font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium text-slate-900 dark:text-white">{testimonial.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed">"{testimonial.quote}"</p>
                  <div className="mt-6 flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing section */}
        <section id="pricing" className="py-20 sm:py-32 bg-slate-50 dark:bg-slate-800/50" ref={pricingRef}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={pricingInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-[#0b3093]/10 text-[#0b3093] dark:bg-[#5a89ff]/10 dark:text-[#5a89ff] hover:bg-[#0b3093]/20 dark:hover:bg-[#5a89ff]/20">
                {t("coming_soon")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {t("pricing_plans")}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {t("pricing_plans_launch_desc")}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  tier: t("starter"),
                  price: "$29",
                  description: t("starter_desc_long"),
                  features: [
                    t("starter_feature_1"),
                    t("starter_feature_2"),
                    t("starter_feature_3"),
                    t("starter_feature_4"),
                    t("starter_feature_5"),
                    t("starter_feature_6"),
                  ],
                  popular: false,
                  delay: 0.1,
                },
                {
                  tier: t("professional"),
                  price: "$79",
                  description: t("professional_desc_long"),
                  features: [
                    t("professional_feature_1"),
                    t("professional_feature_2"),
                    t("professional_feature_3"),
                    t("professional_feature_4"),
                    t("professional_feature_5"),
                    t("professional_feature_6"),
                    t("professional_feature_7"),
                  ],
                  popular: true,
                  delay: 0.2,
                },
                {
                  tier: t("enterprise"),
                  price: "$199",
                  description: t("enterprise_desc_long"),
                  features: [
                    t("enterprise_feature_1"),
                    t("enterprise_feature_2"),
                    t("enterprise_feature_3"),
                    t("enterprise_feature_4"),
                    t("enterprise_feature_5"),
                    t("enterprise_feature_6"),
                    t("enterprise_feature_7"),
                    t("enterprise_feature_8"),
                  ],
                  popular: false,
                  delay: 0.3,
                },
              ].map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={pricingInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: plan.delay }}
                  className={`
                    relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300
                    ${
                      plan.popular
                        ? "border-2 border-[#0b3093] dark:border-[#5a89ff] shadow-lg scale-105 z-10"
                        : "border border-slate-200 dark:border-slate-700"
                    }
                  `}
                >
                  {plan.popular && (
                    <div className="sticky top-0 z-30 p-3 bg-[#0b3093] dark:bg-[#5a89ff] text-white text-sm font-medium text-center">
                      {t("most_popular")}
                    </div>
                  )}
                  <div className={`p-6 ${plan.popular ? "pt-8" : ""}`}>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.tier}</h3>
                    <div className="flex items-end mb-2">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400 ml-1 mb-1">/ {t("month")}</span>
                    </div>
                    <div className="flex items-center mb-5 text-sm text-[#0b3093] dark:text-[#5a89ff]">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{t("coming_soon_label")}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{plan.description}</p>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "bg-[#0b3093] dark:bg-[#5a89ff] text-white hover:bg-[#0b3093]/90 dark:hover:bg-[#5a89ff]/90"
                          : "bg-white dark:bg-slate-800 text-[#0b3093] dark:text-[#5a89ff] border border-[#0b3093] dark:border-[#5a89ff] hover:bg-[#0b3093]/5 dark:hover:bg-[#5a89ff]/10"
                      } rounded-full`}
                    >
                      {t("join_waitlist")}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

          
          </div>
        </section>

        {/* CTA section */}
        <section className="py-20 sm:py-32" ref={ctaRef}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto bg-gradient-to-r from-[#0b3093] to-[#1e54d8] dark:from-[#2a5ade] dark:to-[#5a89ff] rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="px-6 py-12 sm:px-12 sm:py-16 text-center">
                <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">{t("get_started_today")}</Badge>
                <h2 className="text-3xl font-bold text-white mb-4">{t("ready_to_transform")}</h2>
                <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                  {t("cta_description_long")}
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button asChild size="lg" className="bg-white text-[#0b3093] hover:bg-blue-50 rounded-full shadow-lg">
                    <Link href="/register">{t("start_free_trial")}</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 rounded-full"
                  >
                    
                  </Button>
                </div>
                <div className="mt-8 max-w-md mx-auto">
                  <div className="space-y-4">
                    <Input type="text" placeholder={t("your_name")} className="bg-white/10 text-white placeholder:text-white/70 border-white/20" />
                    <Input type="email" placeholder={t("your_email")} className="bg-white/10 text-white placeholder:text-white/70 border-white/20" />
                    <Button className="w-full bg-white text-[#0b3093] hover:bg-blue-50">{t("send_message")}</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
     
    </div>
  );
}