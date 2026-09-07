// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   FileText,
//   Cpu,
//   ShieldCheck,
//   Quote,
//   Lock,
//   Zap,
//   ArrowRight,
//   Play,
//   Sparkles,
//   Check,
//   UploadCloud,
//   Layers,
//   MessageSquare,
//   Search,
//   BookOpen,
//   FileCheck2,
//   ChevronRight
// } from "lucide-react";

// // Animation Variants
// const fadeInUp = {
//   hidden: { opacity: 0, y: 25 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
// };

// const staggerContainer = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.12,
//       delayChildren: 0.1,
//     },
//   },
// };

// const features = [
//   {
//     icon: FileText,
//     title: "Smart Ingestion",
//     desc: "Drop any PDF, manual, or research paper—ready to query instantly.",
//     color: "from-blue-500/20 via-indigo-500/10 to-transparent",
//     borderColor: "group-hover:border-blue-500/40",
//     iconColor: "text-blue-400",
//   },
//   {
//     icon: Cpu,
//     title: "Semantic Vector Search",
//     desc: "Powered by pgvector embeddings to understand context, tone, and intent, not just keyword matches.",
//     color: "from-purple-500/20 via-pink-500/10 to-transparent",
//     borderColor: "group-hover:border-purple-500/40",
//     iconColor: "text-purple-400",
//   },
//   {
//     icon: ShieldCheck,
//     title: "Zero-Hallucination Answers",
//     desc: "Enterprise-grade grounding ensures every response stays 100% faithful to your source text.",
//     color: "from-emerald-500/20 via-teal-500/10 to-transparent",
//     borderColor: "group-hover:border-emerald-500/40",
//     iconColor: "text-emerald-400",
//   },
//   {
//     icon: Quote,
//     title: "Precision Citations",
//     desc: "Click any source tag to jump directly to the page and paragraph used to generate the answer.",
//     color: "from-amber-500/20 via-orange-500/10 to-transparent",
//     borderColor: "group-hover:border-amber-500/40",
//     iconColor: "text-amber-400",
//   },
//   {
//     icon: Lock,
//     title: "Bank-Grade Privacy",
//     desc: "Encrypted storage and isolated user spaces. Your documents are never used to train global models.",
//     color: "from-pink-500/20 via-rose-500/10 to-transparent",
//     borderColor: "group-hover:border-pink-500/40",
//     iconColor: "text-pink-400",
//   },
// ];

// const steps = [
//   {
//     step: "01",
//     title: "Upload",
//     desc: "Import PDFs via drag-and-drop or cloud URL.",
//     icon: UploadCloud,
//   },
//   {
//     step: "02",
//     title: "Index",
//     desc: "Automated chunking & vector embedding generation.",
//     icon: Layers,
//   },
//   {
//     step: "03",
//     title: "Prompt",
//     desc: "Ask complex questions in plain language.",
//     icon: MessageSquare,
//   },
//   {
//     step: "04",
//     title: "Synthesize",
//     desc: "AI delivers a verified answer with interactive citations.",
//     icon: Sparkles,
//   },
// ];

// const socialProofAvatars = [
//   "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
//   "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
//   "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
// ];

// export default function Landing() {
//   const [activeCitation, setActiveCitation] = useState(true);

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans relative overflow-x-hidden">
//       {/* Dynamic Font Injection */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
//         body { font-family: 'DM Sans', sans-serif; }
//         h1, h2, h3, h4, .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
//       `}</style>

//       {/* Global Background Glow Grid */}
//       <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

//       {/* Navbar */}
//       <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
//         <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
//           <Link to="/" className="flex items-center gap-2.5 group">
//             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
//               <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
//                 <Zap className="h-4 w-4 text-indigo-400 fill-indigo-400/20" />
//               </div>
//             </div>
//             <span className="text-xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
//               DocuChat
//             </span>
//           </Link>

//           <nav className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
//             <a href="#features" className="hover:text-white transition-colors">
//               Features
//             </a>
//             <a href="#how-it-works" className="hover:text-white transition-colors">
//               How It Works
//             </a>
//             <a href="#pricing" className="hover:text-white transition-colors">
//               Pricing
//             </a>
//           </nav>

//             <div className="flex items-center gap-4">
//               <Link
//                 to="/login"
//                 className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
//               >
//                 Login
//               </Link>
//               <Link
//                 to="/register"
//                 className="relative inline-flex items-center justify-center rounded-xl p-0.5 text-sm font-semibold overflow-hidden group shadow-lg shadow-indigo-500/20"
//               >
//                 <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 transition-all duration-300 group-hover:opacity-90" />
//                 <span className="relative rounded-[10px] bg-slate-950 px-4 py-2 transition-all duration-300 group-hover:bg-transparent">
//                   <span className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
//                     Get Started
//                   </span>
//                 </span>
//               </Link>
//             </div>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 overflow-hidden">
//         {/* Animated Background Orbs */}
//         <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-pink-500/20 blur-[130px] rounded-full pointer-events-none animate-pulse duration-10000" />

//         <motion.div
//           className="mx-auto max-w-5xl px-6 text-center relative z-10"
//           initial="hidden"
//           animate="visible"
//           variants={staggerContainer}
//         >
//           {/* Hero Badge */}
//           <motion.div variants={fadeInUp} className="inline-block mb-6">
//             <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-300 backdrop-blur-md shadow-inner shadow-indigo-500/20">
//               <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-spin" style={{ animationDuration: "8s" }} />
//               ✨ NEXT-GEN DOCUMENT INTELLIGENCE
//             </div>
//           </motion.div>

//           {/* Hero Title */}
//           <motion.h1
//             variants={fadeInUp}
//             className="font-display text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.1]"
//           >
//             Stop Searching. <br />
//             <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
//               Start Asking.
//             </span>
//           </motion.h1>

//           {/* Hero Subtitle */}
//           <motion.p
//             variants={fadeInUp}
//             className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 md:text-xl leading-relaxed font-normal"
//           >
//             Turn complex PDFs into instant, conversational answers. Grounded in your own data, complete with exact page-level citations.
//           </motion.p>

//           {/* CTAs */}
//           <motion.div
//             variants={fadeInUp}
//             className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
//           >
//             <Link
//               to="/register"
//               className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-500/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all"
//             >
//               Start Chatting Free
//               <ArrowRight className="h-4 w-4" />
//             </Link>
//             <a
//               href="#demo"
//               className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur-md px-7 py-3.5 text-base font-semibold text-slate-200 hover:bg-slate-800 hover:text-white hover:border-white/20 transition-all"
//             >
//               <Play className="h-4 w-4 text-indigo-400 fill-indigo-400" />
//               Watch Demo (1 min)
//             </a>
//           </motion.div>

//           {/* Social Proof Stack */}
//           <motion.div
//             variants={fadeInUp}
//             className="mt-12 flex items-center justify-center gap-3 text-sm text-slate-400"
//           >
//             <div className="flex -space-x-2 overflow-hidden">
//               {socialProofAvatars.map((url, i) => (
//                 <img
//                   key={i}
//                   className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-950 object-cover"
//                   src={url}
//                   alt="User avatar"
//                 />
//               ))}
//             </div>
//             <span className="font-medium text-slate-300">
//               Joined by <strong className="text-white">2,000+</strong> researchers & students
//             </span>
//           </motion.div>
//         </motion.div>

//         {/* Interactive Hero Preview / Mockup */}
//         <motion.div
//           id="demo"
//           className="mx-auto max-w-6xl px-6 mt-16 relative z-20"
//           initial={{ opacity: 0, y: 40 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, delay: 0.4 }}
//         >
//           <div className="relative rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl overflow-hidden">
//             {/* Window Topbar */}
//             <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/60 px-4 py-3">
//               <div className="flex items-center gap-2">
//                 <div className="h-3 w-3 rounded-full bg-rose-500/80" />
//                 <div className="h-3 w-3 rounded-full bg-amber-500/80" />
//                 <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
//                 <span className="ml-2 text-xs font-medium text-slate-400 flex items-center gap-1.5">
//                   <FileText className="h-3.5 w-3.5 text-indigo-400" />
//                   Q3_Financial_Analysis_Report_2026.pdf
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
//                   Vector Indexed
//                 </span>
//               </div>
//             </div>

//             {/* Split Screen Preview */}
//             <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
//               {/* PDF Viewer Side */}
//               <div className="lg:col-span-5 border-r border-white/10 bg-slate-950/40 p-5 hidden lg:flex flex-col justify-between">
//                 <div>
//                   <div className="flex items-center justify-between mb-4">
//                     <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
//                       Document Source View
//                     </span>
//                     <span className="text-xs text-slate-500 font-mono">Page 14 of 48</span>
//                   </div>
//                   <div className="relative rounded-lg overflow-hidden border border-white/10 bg-slate-900/50">
//                     <img
//                       src="https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=800&auto=format&fit=crop"
//                       alt="Document Page"
//                       className="w-full h-64 object-cover opacity-60"
//                     />
//                     {/* Highlight Box Simulation */}
//                     <div className="absolute inset-x-4 top-16 bg-indigo-500/20 border-l-4 border-indigo-400 p-3 backdrop-blur-sm rounded-r">
//                       <p className="text-[11px] font-mono text-indigo-200 line-clamp-3">
//                         "...Operating margins improved by 24.8% YoY driven by enterprise adoption. Total adjusted EBITDA reached $14.2M..."
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="mt-4 flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
//                   <span className="flex items-center gap-1.5">
//                     <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
//                     Source Match Confidence
//                   </span>
//                   <span className="font-semibold text-emerald-400">99.4%</span>
//                 </div>
//               </div>

//               {/* Chat Interface Side */}
//               <div className="lg:col-span-7 p-6 flex flex-col justify-between bg-slate-900/40">
//                 <div className="space-y-4">
//                   {/* User Bubble */}
//                   <div className="flex justify-end">
//                     <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm text-white shadow-md">
//                       What was our Q3 EBITDA growth compared to overall revenue projections?
//                     </div>
//                   </div>

//                   {/* AI Bubble */}
//                   <div className="flex justify-start items-start gap-3">
//                     <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 text-white font-bold text-xs mt-0.5">
//                       AI
//                     </div>
//                     <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-white/10 bg-slate-800/80 p-4 text-sm text-slate-200 shadow-xl backdrop-blur-md">
//                       <p className="leading-relaxed">
//                         In Q3 2026, adjusted EBITDA grew by <strong className="text-white">24.8% YoY</strong> (reaching $14.2M), exceeding overall initial revenue projections by 3.2%.
//                       </p>

//                       {/* Interactive Citation Pill */}
//                       <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
//                         <span className="text-xs text-slate-400">Verified Answer Source:</span>
//                         <button
//                           onClick={() => setActiveCitation(!activeCitation)}
//                           className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-medium transition-all ${
//                             activeCitation
//                               ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/20"
//                               : "bg-slate-700/50 text-slate-400 border border-transparent"
//                           }`}
//                         >
//                           <Quote className="h-3 w-3 text-indigo-400" />
//                           Page 14, ¶ 3
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Input Simulation Bar */}
//                 <div className="mt-6 relative">
//                   <div className="flex items-center rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-400 shadow-inner">
//                     <span className="flex-1">Ask any question about this document...</span>
//                     <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
//                       <ArrowRight className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="py-24 relative z-10">
//         <div className="mx-auto max-w-7xl px-6">
//           <div className="text-center max-w-3xl mx-auto mb-16">
//             <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
//               Engineered for Accuracy & Speed
//             </h2>
//             <p className="mt-4 text-slate-400 text-base md:text-lg leading-relaxed">
//               Everything you need to extract actionable insights from heavy documentation in seconds.
//             </p>
//           </div>

//           <motion.div
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, margin: "-100px" }}
//             variants={staggerContainer}
//           >
//             {features.map((f, idx) => {
//               const Icon = f.icon;
//               return (
//                 <motion.div
//                   key={idx}
//                   variants={fadeInUp}
//                   className={`group relative rounded-2xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900/80 hover:shadow-2xl hover:shadow-indigo-500/10 ${f.borderColor}`}
//                 >
//                   {/* Subtle Background Glow */}
//                   <div
//                     className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none`}
//                   />

//                   <div className="relative z-10">
//                     <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-slate-800/80 mb-6 group-hover:scale-110 transition-transform duration-300">
//                       <Icon className={`h-6 w-6 ${f.iconColor}`} />
//                     </div>
//                     <h3 className="font-display text-xl font-bold text-white tracking-tight">
//                       {f.title}
//                     </h3>
//                     <p className="mt-3 text-sm text-slate-400 leading-relaxed">
//                       {f.desc}
//                     </p>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </motion.div>
//         </div>
//       </section>

//       {/* How It Works Section */}
//       <section id="how-it-works" className="py-24 bg-slate-900/30 border-y border-white/5 relative">
//         <div className="mx-auto max-w-7xl px-6">
//           <div className="text-center max-w-3xl mx-auto mb-16">
//             <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2 block">
//               Workflow Breakdown
//             </span>
//             <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
//               Simple 4-Step Pipeline
//             </h2>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {steps.map((s, idx) => {
//               const Icon = s.icon;
//               return (
//                 <div key={idx} className="relative group">
//                   <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md h-full flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
//                     <div>
//                       <div className="flex items-center justify-between mb-6">
//                         <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
//                           <Icon className="h-5 w-5" />
//                         </div>
//                         <span className="font-mono text-2xl font-bold text-slate-700 group-hover:text-indigo-400 transition-colors">
//                           {s.step}
//                         </span>
//                       </div>
//                       <h3 className="font-display text-lg font-bold text-white mb-2">
//                         {s.title}
//                       </h3>
//                       <p className="text-sm text-slate-400 leading-relaxed">
//                         {s.desc}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Pricing Section */}
//       <section id="pricing" className="py-24 relative">
//         <div className="mx-auto max-w-7xl px-6">
//           <div className="text-center max-w-2xl mx-auto mb-16">
//             <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
//               Transparent & Accessible
//             </h2>
//             <p className="mt-3 text-slate-400 text-base">
//               Get full access to all features during our Early Access phase.
//             </p>
//           </div>

//           <div className="mx-auto max-w-md relative">
//             {/* Glowing Accent Border */}
//             <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

//             <div className="relative rounded-3xl border border-white/15 bg-slate-900/90 p-8 backdrop-blur-2xl text-center">
//               <span className="inline-block rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400 border border-indigo-500/20 mb-4">
//                 Early Access Pass
//               </span>

//               <div className="mt-2 flex items-baseline justify-center gap-2">
//                 <span className="font-display text-5xl font-extrabold tracking-tight text-white">$0</span>
//                 <span className="text-slate-400 text-sm">/ month</span>
//               </div>
//               <p className="mt-1 text-xs text-indigo-300 font-medium">Limited Time Early Access</p>

//               <ul className="mt-8 space-y-3 text-left text-sm text-slate-300">
//                 {[
//                   "Unlimited PDF uploads",
//                   "Unlimited questions & queries",
//                   "Full source citations & page links",
//                   "pgvector semantic context engine",
//                   "Private & encrypted cloud storage",
//                 ].map((item, i) => (
//                   <li key={i} className="flex items-center gap-3">
//                     <FileCheck2 className="h-4 w-4 text-emerald-400 shrink-0" />
//                     <span>{item}</span>
//                   </li>
//                 ))}
//               </ul>

//               <Link
//                 to="/register"
//                 className="mt-8 block w-full rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all"
//               >
//                 Claim Free Access →
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="border-t border-white/10 bg-slate-950 py-12 text-center text-xs text-slate-500">
//         <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
//           <div className="flex items-center gap-2">
//             <Zap className="h-4 w-4 text-indigo-400" />
//             <span className="font-bold text-slate-300 font-display">DocuChat</span>
//           </div>
//           <p>© {new Date().getFullYear()} DocuChat. Built with FastAPI, PostgreSQL + pgvector, and React.</p>
//         </div>
//       </footer>
//     </div>
//   );
// }






import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Cpu,
  ShieldCheck,
  Quote,
  Lock,
  Zap,
  ArrowRight,
  Play,
  Sparkles,
  Check,
  UploadCloud,
  Layers,
  MessageSquare,
  Search,
  BookOpen,
  FileCheck2,
  ChevronRight,
  X // <-- Close icon for the modal
} from "lucide-react";

// Yahan aapki local video import ki gayi hai
// (Agar error aaye toh path check kar lijiye ga, jaise "./rag pdf assistant.mp4" agar file same folder mein hai)
import demoVideo from "./ragpdfassistant.mp4";

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const features = [
  {
    icon: FileText,
    title: "Smart Ingestion",
    desc: "Drop any PDF, manual, or research paper—ready to query instantly.",
    color: "from-blue-500/20 via-indigo-500/10 to-transparent",
    borderColor: "group-hover:border-blue-500/40",
    iconColor: "text-blue-400",
  },
  {
    icon: Cpu,
    title: "Semantic Vector Search",
    desc: "Powered by pgvector embeddings to understand context, tone, and intent, not just keyword matches.",
    color: "from-purple-500/20 via-pink-500/10 to-transparent",
    borderColor: "group-hover:border-purple-500/40",
    iconColor: "text-purple-400",
  },
  {
    icon: ShieldCheck,
    title: "Zero-Hallucination Answers",
    desc: "Enterprise-grade grounding ensures every response stays 100% faithful to your source text.",
    color: "from-emerald-500/20 via-teal-500/10 to-transparent",
    borderColor: "group-hover:border-emerald-500/40",
    iconColor: "text-emerald-400",
  },
  {
    icon: Quote,
    title: "Precision Citations",
    desc: "Click any source tag to jump directly to the page and paragraph used to generate the answer.",
    color: "from-amber-500/20 via-orange-500/10 to-transparent",
    borderColor: "group-hover:border-amber-500/40",
    iconColor: "text-amber-400",
  },
  {
    icon: Lock,
    title: "Bank-Grade Privacy",
    desc: "Encrypted storage and isolated user spaces. Your documents are never used to train global models.",
    color: "from-pink-500/20 via-rose-500/10 to-transparent",
    borderColor: "group-hover:border-pink-500/40",
    iconColor: "text-pink-400",
  },
];

const steps = [
  {
    step: "01",
    title: "Upload",
    desc: "Import PDFs via drag-and-drop or cloud URL.",
    icon: UploadCloud,
  },
  {
    step: "02",
    title: "Index",
    desc: "Automated chunking & vector embedding generation.",
    icon: Layers,
  },
  {
    step: "03",
    title: "Prompt",
    desc: "Ask complex questions in plain language.",
    icon: MessageSquare,
  },
  {
    step: "04",
    title: "Synthesize",
    desc: "AI delivers a verified answer with interactive citations.",
    icon: Sparkles,
  },
];

const socialProofAvatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
];

export default function Landing() {
  const [activeCitation, setActiveCitation] = useState(true);
  const [showVideo, setShowVideo] = useState(false); // <-- State for video modal

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans relative overflow-x-hidden">
      {/* Dynamic Font Injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
        body { font-family: 'DM Sans', sans-serif; }
        h1, h2, h3, h4, .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      {/* Global Background Glow Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Zap className="h-4 w-4 text-indigo-400 fill-indigo-400/20" />
              </div>
            </div>
            <span className="text-xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              DocuChat
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-pink-500/20 blur-[130px] rounded-full pointer-events-none animate-pulse duration-10000" />

        <motion.div
          className="mx-auto max-w-5xl px-6 text-center relative z-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Hero Badge */}
          <motion.div variants={fadeInUp} className="inline-block mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-300 backdrop-blur-md shadow-inner shadow-indigo-500/20">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-spin" style={{ animationDuration: "8s" }} />
              ✨ NEXT-GEN DOCUMENT INTELLIGENCE
            </div>
          </motion.div>

          {/* Hero Title */}
          <motion.h1
            variants={fadeInUp}
            className="font-display text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.1]"
          >
            Stop Searching. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Start Asking.
            </span>
          </motion.h1>

          {/* Hero Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 md:text-xl leading-relaxed font-normal"
          >
            Turn complex PDFs into instant, conversational answers. Grounded in your own data, complete with exact page-level citations.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-500/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Start Chatting Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            {/* Watch Demo Button */}
            <button
              onClick={() => setShowVideo(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur-md px-7 py-3.5 text-base font-semibold text-slate-200 hover:bg-slate-800 hover:text-white hover:border-white/20 transition-all"
            >
              <Play className="h-4 w-4 text-indigo-400 fill-indigo-400" />
              Watch Demo (1 min)
            </button>
          </motion.div>

          {/* Social Proof Stack */}
          <motion.div
            variants={fadeInUp}
            className="mt-12 flex items-center justify-center gap-3 text-sm text-slate-400"
          >
            <div className="flex -space-x-2 overflow-hidden">
              {socialProofAvatars.map((url, i) => (
                <img
                  key={i}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-950 object-cover"
                  src={url}
                  alt="User avatar"
                />
              ))}
            </div>
            <span className="font-medium text-slate-300">
              Joined by <strong className="text-white">2,000+</strong> researchers & students
            </span>
          </motion.div>
        </motion.div>

        {/* Interactive Hero Preview / Mockup */}
        <motion.div
          id="demo"
          className="mx-auto max-w-6xl px-6 mt-16 relative z-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="relative rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl overflow-hidden">
            {/* Window Topbar */}
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-400" />
                  Q3_Financial_Analysis_Report_2026.pdf
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  Vector Indexed
                </span>
              </div>
            </div>

            {/* Split Screen Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
              {/* PDF Viewer Side */}
              <div className="lg:col-span-5 border-r border-white/10 bg-slate-950/40 p-5 hidden lg:flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Document Source View
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Page 14 of 48</span>
                  </div>
                  <div className="relative rounded-lg overflow-hidden border border-white/10 bg-slate-900/50">
                    <img
                      src="https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=800&auto=format&fit=crop"
                      alt="Document Page"
                      className="w-full h-64 object-cover opacity-60"
                    />
                    {/* Highlight Box Simulation */}
                    <div className="absolute inset-x-4 top-16 bg-indigo-500/20 border-l-4 border-indigo-400 p-3 backdrop-blur-sm rounded-r">
                      <p className="text-[11px] font-mono text-indigo-200 line-clamp-3">
                        "...Operating margins improved by 24.8% YoY driven by enterprise adoption. Total adjusted EBITDA reached $14.2M..."
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                    Source Match Confidence
                  </span>
                  <span className="font-semibold text-emerald-400">99.4%</span>
                </div>
              </div>

              {/* Chat Interface Side */}
              <div className="lg:col-span-7 p-6 flex flex-col justify-between bg-slate-900/40">
                <div className="space-y-4">
                  {/* User Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm text-white shadow-md">
                      What was our Q3 EBITDA growth compared to overall revenue projections?
                    </div>
                  </div>

                  {/* AI Bubble */}
                  <div className="flex justify-start items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 text-white font-bold text-xs mt-0.5">
                      AI
                    </div>
                    <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-white/10 bg-slate-800/80 p-4 text-sm text-slate-200 shadow-xl backdrop-blur-md">
                      <p className="leading-relaxed">
                        In Q3 2026, adjusted EBITDA grew by <strong className="text-white">24.8% YoY</strong> (reaching $14.2M), exceeding overall initial revenue projections by 3.2%.
                      </p>

                      {/* Interactive Citation Pill */}
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                        <span className="text-xs text-slate-400">Verified Answer Source:</span>
                        <button
                          onClick={() => setActiveCitation(!activeCitation)}
                          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-medium transition-all ${
                            activeCitation
                              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/20"
                              : "bg-slate-700/50 text-slate-400 border border-transparent"
                          }`}
                        >
                          <Quote className="h-3 w-3 text-indigo-400" />
                          Page 14, ¶ 3
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input Simulation Bar */}
                <div className="mt-6 relative">
                  <div className="flex items-center rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-400 shadow-inner">
                    <span className="flex-1">Ask any question about this document...</span>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative z-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
              Engineered for Accuracy & Speed
            </h2>
            <p className="mt-4 text-slate-400 text-base md:text-lg leading-relaxed">
              Everything you need to extract actionable insights from heavy documentation in seconds.
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  className={`group relative rounded-2xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900/80 hover:shadow-2xl hover:shadow-indigo-500/10 ${f.borderColor}`}
                >
                  {/* Subtle Background Glow */}
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none`}
                  />

                  <div className="relative z-10">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-slate-800/80 mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className={`h-6 w-6 ${f.iconColor}`} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white tracking-tight">
                      {f.title}
                    </h3>
                    <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-900/30 border-y border-white/5 relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2 block">
              Workflow Breakdown
            </span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Simple 4-Step Pipeline
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="relative group">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md h-full flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-mono text-2xl font-bold text-slate-700 group-hover:text-indigo-400 transition-colors">
                          {s.step}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-white mb-2">
                        {s.title}
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Transparent & Accessible
            </h2>
            <p className="mt-3 text-slate-400 text-base">
              Get full access to all features during our Early Access phase.
            </p>
          </div>

          <div className="mx-auto max-w-md relative">
            {/* Glowing Accent Border */}
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

            <div className="relative rounded-3xl border border-white/15 bg-slate-900/90 p-8 backdrop-blur-2xl text-center">
              <span className="inline-block rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400 border border-indigo-500/20 mb-4">
                Early Access Pass
              </span>

              <div className="mt-2 flex items-baseline justify-center gap-2">
                <span className="font-display text-5xl font-extrabold tracking-tight text-white">$0</span>
                <span className="text-slate-400 text-sm">/ month</span>
              </div>
              <p className="mt-1 text-xs text-indigo-300 font-medium">Limited Time Early Access</p>

              <ul className="mt-8 space-y-3 text-left text-sm text-slate-300">
                {[
                  "Unlimited PDF uploads",
                  "Unlimited questions & queries",
                  "Full source citations & page links",
                  "pgvector semantic context engine",
                  "Private & encrypted cloud storage",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <FileCheck2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className="mt-8 block w-full rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all"
              >
                Claim Free Access →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950 py-12 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-indigo-400" />
            <span className="font-bold text-slate-300 font-display">DocuChat</span>
          </div>
          <p>© {new Date().getFullYear()} DocuChat. Built with FastAPI, PostgreSQL + pgvector, and React.</p>
        </div>
      </footer>

      {/* --- VIDEO MODAL (Updated to <video> tag) --- */}
      {showVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 p-2 shadow-2xl border border-white/10">
            
            {/* Close Button */}
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Video Player */}
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <video 
                className="w-full h-full object-contain"
                controls 
                autoPlay 
                src={demoVideo} 
              >
                Your browser does not support the video tag.
              </video>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
