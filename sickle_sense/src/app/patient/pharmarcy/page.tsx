'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Sidebar } from '@/components';

/* ─── Types ─────────────────────────────────────────────────── */
type Category = 'all' | 'hydroxyurea' | 'pain' | 'supplements' | 'hydration' | 'monitoring' | 'care';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  originalPrice?: number;
  unit: string;
  stock: number;
  rating: number;
  reviews: number;
  tags: string[];
  description: string;
  icon: string;
  image?: string; // <-- added: optional Unsplash image URL / fallback generator
  badge?: 'Rx' | 'OTC' | 'Recommended' | 'Bestseller' | 'New';
  badgeColor?: string;
  sickleSpecific: boolean;
}

interface CartItem {
  product: Product;
  qty: number;
}

/* ─── Product Catalog ────────────────────────────────────────── */
const PRODUCTS: Product[] = [
  {
    id:'p1', name:'Hydroxyurea 500mg', brand:'Sicklemed',
    category:'hydroxyurea', price:4500, unit:'60 capsules',
    stock:48, rating:4.9, reviews:312, tags:['sickle cell','disease modifying'],
    description:'First-line treatment for sickle cell disease. Reduces frequency of painful crises and hospitalizations.',
    icon:'💊', image:'https://source.unsplash.com/600x600/?hydroxyurea,pills', badge:'Rx', badgeColor:'#7c3aed', sickleSpecific:true,
  },
  {
    id:'p2', name:'Hydroxyurea 1000mg', brand:'Sicklemed',
    category:'hydroxyurea', price:7800, unit:'60 capsules',
    stock:22, rating:4.8, reviews:198, tags:['sickle cell','high dose'],
    description:'Higher-dose hydroxyurea for patients requiring increased therapeutic levels.',
    icon:'💊', image:'https://source.unsplash.com/600x600/?capsules,medicine', badge:'Rx', badgeColor:'#7c3aed', sickleSpecific:true,
  },
  {
    id:'p3', name:'Folic Acid 5mg', brand:'NutriPlus',
    category:'supplements', price:1200, originalPrice:1500, unit:'90 tablets',
    stock:200, rating:4.7, reviews:445, tags:['supplement','recommended'],
    description:'Daily folic acid supplementation — essential for sickle cell patients to support red blood cell production.',
    icon:'🟡', image:'https://source.unsplash.com/600x600/?folic-acid,vitamin', badge:'Recommended', badgeColor:'#16a34a', sickleSpecific:true,
  },
  {
    id:'p4', name:'Ibuprofen 400mg', brand:'PainAway',
    category:'pain', price:850, unit:'30 tablets',
    stock:150, rating:4.4, reviews:867, tags:['pain relief','anti-inflammatory'],
    description:'For mild to moderate pain management during sickle cell crises. Use as directed.',
    icon:'🔴', sickleSpecific:false,
  },
  {
    id:'p5', name:'Tramadol 50mg', brand:'RelieveMed',
    category:'pain', price:2200, unit:'30 tablets',
    stock:35, rating:4.6, reviews:234, tags:['pain relief','moderate-severe'],
    description:'Moderate-to-severe pain relief prescribed during acute sickle cell crisis episodes.',
    icon:'🔴', badge:'Rx', badgeColor:'#7c3aed', sickleSpecific:false,
  },
  {
    id:'p6', name:'ORS Rehydration Sachets', brand:'HydroSalt',
    category:'hydration', price:600, originalPrice:750, unit:'20 sachets',
    stock:500, rating:4.8, reviews:1203, tags:['hydration','electrolytes'],
    description:'Oral rehydration salts — critical for maintaining hydration during crises. Mix with water.',
    icon:'💧', badge:'Bestseller', badgeColor:'#d97706', sickleSpecific:true,
  },
  {
    id:'p7', name:'Electrolyte Drink Mix', brand:'VitaHydra',
    category:'hydration', price:3200, unit:'30 sachets',
    stock:78, rating:4.5, reviews:320, tags:['hydration','sports','electrolytes'],
    description:'Premium electrolyte mix with potassium, sodium and magnesium. Formulated for high daily intake needs.',
    icon:'💧', sickleSpecific:false,
  },
  {
    id:'p8', name:'Vitamin D3 2000 IU', brand:'SunVite',
    category:'supplements', price:1800, unit:'60 softgels',
    stock:120, rating:4.6, reviews:289, tags:['supplement','bone health'],
    description:'Vitamin D3 supplementation to address common deficiency in sickle cell patients.',
    icon:'🌞', badge:'Recommended', badgeColor:'#16a34a', sickleSpecific:true,
  },
  {
    id:'p9', name:'Zinc 25mg Tablets', brand:'NutriPlus',
    category:'supplements', price:1400, unit:'60 tablets',
    stock:95, rating:4.3, reviews:178, tags:['supplement','immune support'],
    description:'Zinc supports immune function and wound healing — particularly beneficial for sickle cell patients.',
    icon:'🟢', sickleSpecific:true,
  },
  {
    id:'p10', name:'Digital Thermometer', brand:'MediCheck',
    category:'monitoring', price:3500, unit:'1 device',
    stock:60, rating:4.7, reviews:412, tags:['monitoring','temperature'],
    description:'Fast-read clinical thermometer. Essential for daily temperature monitoring.',
    icon:'🌡️', badge:'Recommended', badgeColor:'#16a34a', sickleSpecific:false,
  },
  {
    id:'p11', name:'Pulse Oximeter', brand:'OxiSense',
    category:'monitoring', price:8500, originalPrice:10000, unit:'1 device',
    stock:28, rating:4.9, reviews:603, tags:['monitoring','oxygen','sickle cell'],
    description:'Fingertip SpO2 monitor — tracks oxygen saturation. Critical for sickle cell patients to detect early crisis signs.',
    icon:'❤️', badge:'Bestseller', badgeColor:'#d97706', sickleSpecific:true,
  },
  {
    id:'p12', name:'Blood Pressure Monitor', brand:'CareCheck',
    category:'monitoring', price:12000, unit:'1 device',
    stock:18, rating:4.6, reviews:341, tags:['monitoring','bp'],
    description:'Automatic upper arm BP monitor. Track cardiovascular health easily at home.',
    icon:'💓', badge:'New', badgeColor:'#0891b2', sickleSpecific:false,
  },
  {
    id:'p13', name:'Warm Water Bottle', brand:'CareComfort',
    category:'care', price:2500, unit:'1 item',
    stock:75, rating:4.4, reviews:189, tags:['comfort','pain relief'],
    description:'Rubber hot water bottle — heat therapy is commonly recommended for pain relief during crises.',
    icon:'🟠', sickleSpecific:false,
  },
  {
    id:'p14', name:'Sickle Cell Diary Journal', brand:'SickleSense',
    category:'care', price:1500, unit:'1 journal (90 days)',
    stock:200, rating:4.8, reviews:98, tags:['monitoring','lifestyle'],
    description:'Structured health diary for daily tracking of symptoms, medications, and triggers.',
    icon:'📓', badge:'New', badgeColor:'#0891b2', sickleSpecific:true,
  },
  {
    id:'p15', name:'Omega-3 Fish Oil 1000mg', brand:'OceanVite',
    category:'supplements', price:2800, unit:'60 softgels',
    stock:110, rating:4.5, reviews:267, tags:['supplement','anti-inflammatory'],
    description:'Omega-3 fatty acids help reduce inflammation — beneficial for managing sickle cell complications.',
    icon:'🐟', sickleSpecific:true,
  },
  {
    id:'p16', name:'L-Glutamine Powder', brand:'AminoHealth',
    category:'supplements', price:6500, originalPrice:7500, unit:'200g powder',
    stock:40, rating:4.7, reviews:145, tags:['supplement','crisis prevention'],
    description:'L-Glutamine has shown promise in reducing acute painful crises in sickle cell disease patients.',
    icon:'💚', badge:'Recommended', badgeColor:'#16a34a', sickleSpecific:true,
  },
];

const CATEGORIES: {id:Category; label:string; icon:string}[] = [
  {id:'all',         label:'All Products',  icon:'🏪'},
  {id:'hydroxyurea', label:'Hydroxyurea',   icon:'💊'},
  {id:'pain',        label:'Pain Relief',   icon:'🩺'},
  {id:'supplements', label:'Supplements',   icon:'🌿'},
  {id:'hydration',   label:'Hydration',     icon:'💧'},
  {id:'monitoring',  label:'Monitoring',    icon:'📊'},
  {id:'care',        label:'Care Products', icon:'🛒'},
];

/* ─── Styles ─────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --g50:#f0fdf4;--g100:#dcfce7;--g200:#bbf7d0;--g500:#22c55e;--g600:#16a34a;--g700:#15803d;
    --rh-bg:#fef2f2;--rh-bd:#fecaca;--rh-tx:#dc2626;
    --rm-bg:#fffbeb;--rm-bd:#fde68a;--rm-tx:#d97706;
    --bl50:#eff6ff;--bl100:#dbeafe;--bl600:#2563eb;
    --n0:#fff;--n50:#f9fafb;--n100:#f3f4f6;--n200:#e5e7eb;
    --n300:#d1d5db;--n400:#9ca3af;--n500:#6b7280;--n600:#4b5563;--n700:#374151;--n900:#111827;
    --sh-xs:0 1px 2px rgba(0,0,0,.05);
    --sh-sm:0 1px 4px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04);
    --sh-md:0 4px 16px rgba(0,0,0,.08),0 1px 4px rgba(0,0,0,.04);
    --sh-green:0 4px 16px rgba(22,163,74,.22);
    --r-sm:8px;--r-md:12px;--r-lg:16px;--r-xl:20px;--r-2xl:24px;
  }
  body{font-family:'DM Sans',sans-serif;background:var(--n50);}

  .shell{display:flex;min-height:100svh;}
  .main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
  .content{flex:1;overflow-y:auto;padding:clamp(14px,3vw,28px);}
  .inner{max-width:1280px;margin:0 auto;}

  /* ── Hero banner ── */
  .hero{
    background:linear-gradient(135deg,#0f4c2a 0%,#16a34a 55%,#22c55e 100%);
    border-radius:var(--r-2xl);padding:clamp(22px,4vw,36px) clamp(22px,5vw,40px);
    color:white;position:relative;overflow:hidden;margin-bottom:clamp(16px,2.5vw,24px);
    box-shadow:var(--sh-green);
  }
  .hero::before{content:'';position:absolute;top:-60px;right:-40px;width:280px;height:280px;background:rgba(255,255,255,.06);border-radius:50%;}
  .hero::after{content:'';position:absolute;bottom:-80px;right:120px;width:200px;height:200px;background:rgba(255,255,255,.04);border-radius:50%;}
  .hero-body{position:relative;z-index:1;max-width:560px;}
  .hero-eyebrow{
    display:inline-flex;align-items:center;gap:6px;
    background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);
    border-radius:100px;padding:4px 12px;
    font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    margin-bottom:12px;backdrop-filter:blur(8px);
  }
  .hero-title{font-family:'Sora',sans-serif;font-size:clamp(20px,3vw,30px);font-weight:800;letter-spacing:-.8px;line-height:1.1;margin-bottom:8px;}
  .hero-sub{font-size:clamp(13px,1.6vw,15px);opacity:.82;font-weight:300;line-height:1.6;}
  .hero-stats{
    display:flex;gap:clamp(16px,3vw,32px);margin-top:clamp(16px,2.5vw,24px);
    flex-wrap:wrap;
  }
  .hero-stat-val{font-family:'Sora',sans-serif;font-size:clamp(18px,2.5vw,24px);font-weight:800;line-height:1;}
  .hero-stat-lbl{font-size:11px;opacity:.7;font-weight:400;margin-top:2px;}
  .hero-trust{
    position:absolute;right:clamp(20px,4vw,40px);top:50%;transform:translateY(-50%);
    z-index:1;display:flex;flex-direction:column;gap:8px;
  }
  @media(max-width:640px){.hero-trust{display:none;}}
  .trust-pill{
    display:flex;align-items:center;gap:7px;
    background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);
    border-radius:100px;padding:6px 14px;
    font-size:12px;font-weight:500;backdrop-filter:blur(8px);
    white-space:nowrap;
  }
  .trust-dot{width:7px;height:7px;border-radius:50%;background:#86efac;animation:pls 2s ease-in-out infinite;}
  @keyframes pls{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}

  /* ── Layout ── */
  .marketplace-layout{
    display:grid;
    grid-template-columns:1fr;
    gap:clamp(16px,2.5vw,24px);
  }

  /* ── Search & filter bar ── */
  .topbar{
    display:flex;align-items:center;gap:10px;
    flex-wrap:wrap;margin-bottom:4px;
  }
  .search-wrap{
    flex:1;min-width:220px;
    position:relative;
  }
  .search-icon{
    position:absolute;left:12px;top:50%;transform:translateY(-50%);
    color:var(--n400);pointer-events:none;
  }
  .search-input{
    width:100%;padding:10px 14px 10px 38px;
    border:1.5px solid var(--n200);border-radius:var(--r-lg);
    font-family:'DM Sans',sans-serif;font-size:14px;color:var(--n900);
    background:var(--n0);outline:none;
    transition:border-color .2s,box-shadow .2s;
  }
  .search-input::placeholder{color:var(--n400);font-weight:300;}
  .search-input:focus{border-color:var(--g600);box-shadow:0 0 0 3px rgba(22,163,74,.1);}

  .filter-sel{
    padding:10px 14px;border:1.5px solid var(--n200);border-radius:var(--r-lg);
    font-family:'DM Sans',sans-serif;font-size:13px;color:var(--n700);
    background:var(--n0);outline:none;cursor:pointer;
    appearance:none;-webkit-appearance:none;
    padding-right:32px;
    background-image:url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.5 4.5L6 8l3.5-3.5' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat:no-repeat;background-position:right 10px center;
    transition:border-color .2s;
  }
  .filter-sel:focus{border-color:var(--g600);outline:none;}

  .sickle-toggle{
    display:flex;align-items:center;gap:7px;
    padding:10px 14px;border-radius:var(--r-lg);
    border:1.5px solid;cursor:pointer;
    font-size:13px;font-weight:500;
    transition:all .2s;white-space:nowrap;
  }
  .sickle-toggle.on{border-color:var(--g200);background:var(--g50);color:var(--g700);}
  .sickle-toggle.off{border-color:var(--n200);background:var(--n0);color:var(--n600);}

  /* ── Category pills ── */
  .cat-pills{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:clamp(14px,2vw,20px);}
  .cat-pill{
    display:inline-flex;align-items:center;gap:6px;
    padding:8px 14px;border-radius:100px;
    font-size:13px;font-weight:500;cursor:pointer;
    border:1.5px solid;transition:all .2s;white-space:nowrap;
  }
  .cat-pill.active{background:var(--n900);color:white;border-color:var(--n900);}
  .cat-pill.inactive{background:var(--n0);color:var(--n600);border-color:var(--n200);}
  .cat-pill.inactive:hover{background:var(--n50);border-color:var(--n300);}

  /* ── Results count ── */
  .results-bar{
    display:flex;align-items:center;justify-content:space-between;
    flex-wrap:wrap;gap:10px;margin-bottom:clamp(12px,2vw,16px);
  }
  .results-count{font-size:13px;color:var(--n500);font-weight:300;}
  .results-count strong{color:var(--n700);font-weight:600;}

  /* ── Product grid ── */
  .product-grid{
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(240px,1fr));
    gap:clamp(12px,2vw,16px);
  }

  /* ── Product card ── */
  .product-card{
    background:var(--n0);border:1px solid var(--n200);
    border-radius:var(--r-xl);overflow:hidden;
    box-shadow:var(--sh-xs);
    transition:all .22s cubic-bezier(.34,1.56,.64,1);
    display:flex;flex-direction:column;
    position:relative;
  }
  .product-card:hover{
    transform:translateY(-4px);
    box-shadow:var(--sh-md);
    border-color:var(--n300);
  }
  .product-card.sickle-specific::before{
    content:'';position:absolute;top:0;left:0;right:0;height:3px;
    background:linear-gradient(90deg,var(--g500),var(--g300));
  }

  .product-top{
    padding:clamp(14px,2vw,20px);
    display:flex;align-items:flex-start;justify-content:space-between;
    gap:10px;flex:1;
  }
  .product-icon-wrap{
    width:52px;height:52px;border-radius:14px;
    display:flex;align-items:center;justify-content:center;
    font-size:26px;flex-shrink:0;background:var(--n50);
    border:1px solid var(--n100);
  }
  .product-badges{display:flex;flex-direction:column;align-items:flex-end;gap:4px;}
  .badge{
    display:inline-flex;align-items:center;
    padding:2px 8px;border-radius:100px;
    font-size:10px;font-weight:700;letter-spacing:.03em;
    color:white;
  }
  .badge-sickle{
    background:var(--g50);color:var(--g700);
    border:1px solid var(--g200);font-size:10px;
    padding:2px 7px;border-radius:100px;font-weight:600;
  }

  .product-body{padding:0 clamp(14px,2vw,20px) clamp(14px,2vw,20px);flex:1;display:flex;flex-direction:column;gap:8px;}
  .product-brand{font-size:11px;color:var(--n400);font-weight:500;letter-spacing:.03em;text-transform:uppercase;}
  .product-name{font-family:'Sora',sans-serif;font-size:clamp(13px,1.5vw,15px);font-weight:700;color:var(--n900);letter-spacing:-.3px;line-height:1.2;}
  .product-unit{font-size:12px;color:var(--n400);font-weight:300;}
  .product-desc{font-size:12px;color:var(--n500);font-weight:300;line-height:1.5;}

  .product-tags{display:flex;gap:4px;flex-wrap:wrap;}
  .product-tag{
    padding:2px 7px;border-radius:100px;
    font-size:10px;font-weight:500;color:var(--n500);
    background:var(--n50);border:1px solid var(--n200);
  }

  .product-rating{display:flex;align-items:center;gap:5px;}
  .stars{color:#f59e0b;font-size:11px;letter-spacing:.5px;}
  .rating-val{font-size:12px;font-weight:600;color:var(--n700);}
  .rating-count{font-size:11px;color:var(--n400);font-weight:300;}

  .stock-chip{
    display:inline-flex;align-items:center;gap:4px;
    font-size:11px;font-weight:500;
  }
  .stock-dot{width:6px;height:6px;border-radius:50%;}
  .stock-dot.in{background:var(--g500);}
  .stock-dot.low{background:var(--rm-dot);}
  .stock-dot.out{background:var(--rh-dot);}

  .product-footer{
    padding:12px clamp(14px,2vw,20px);
    border-top:1px solid var(--n100);
    display:flex;align-items:center;justify-content:space-between;gap:8px;
    flex-wrap:wrap;
  }
  .price-block{}
  .price-main{font-family:'Sora',sans-serif;font-size:clamp(15px,2vw,18px);font-weight:800;color:var(--n900);}
  .price-original{font-size:12px;color:var(--n400);text-decoration:line-through;margin-left:4px;}
  .price-save{font-size:11px;color:var(--g600);font-weight:600;margin-left:4px;}

  .add-btn{
    display:inline-flex;align-items:center;gap:5px;
    padding:8px 14px;border-radius:var(--r-md);
    background:linear-gradient(135deg,var(--g600),#15803d);
    color:white;border:none;cursor:pointer;
    font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;
    transition:all .2s;white-space:nowrap;
    box-shadow:0 2px 8px rgba(22,163,74,.25);
  }
  .add-btn:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(22,163,74,.35);}
  .add-btn.in-cart{background:var(--g50);color:var(--g700);border:1.5px solid var(--g200);box-shadow:none;}
  .add-btn.in-cart:hover{background:var(--g100);}

  /* ── Cart drawer ── */
  .cart-fab{
    position:fixed;bottom:24px;right:24px;
    width:60px;height:60px;border-radius:50%;
    background:linear-gradient(135deg,var(--n900),var(--n700));
    color:white;border:none;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    font-size:22px;
    box-shadow:0 8px 24px rgba(0,0,0,.25);
    transition:transform .2s;z-index:50;
  }
  .cart-fab:hover{transform:scale(1.08);}
  .cart-fab-badge{
    position:absolute;top:-2px;right:-2px;
    width:22px;height:22px;border-radius:50%;
    background:#ef4444;color:white;
    font-size:11px;font-weight:800;
    display:flex;align-items:center;justify-content:center;
    border:2px solid white;
  }

  .cart-overlay{
    position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:60;
    animation:fadeIn .2s ease;
  }
  .cart-drawer{
    position:fixed;right:0;top:0;bottom:0;
    width:min(440px,100vw);
    background:var(--n0);z-index:70;
    display:flex;flex-direction:column;
    box-shadow:-8px 0 32px rgba(0,0,0,.12);
    animation:slideIn .3s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}

  .cart-header{
    padding:20px 24px;border-bottom:1px solid var(--n200);
    display:flex;align-items:center;justify-content:space-between;
  }
  .cart-title{font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:var(--n900);letter-spacing:-.4px;}
  .cart-close{
    width:32px;height:32px;border-radius:50%;
    border:none;background:var(--n100);cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    color:var(--n600);transition:all .15s;
  }
  .cart-close:hover{background:var(--n200);}

  .cart-body{flex:1;overflow-y:auto;padding:16px 24px;}

  .cart-item{
    display:flex;align-items:flex-start;gap:12px;
    padding:12px 0;border-bottom:1px solid var(--n100);
  }
  .cart-item:last-child{border-bottom:none;}
  .cart-item-icon{
    width:44px;height:44px;border-radius:12px;
    background:var(--n50);border:1px solid var(--n200);
    display:flex;align-items:center;justify-content:center;
    font-size:22px;flex-shrink:0;
  }
  .cart-item-name{font-family:'Sora',sans-serif;font-size:13px;font-weight:700;color:var(--n900);margin-bottom:2px;}
  .cart-item-unit{font-size:11px;color:var(--n400);font-weight:300;}
  .cart-item-price{font-family:'Sora',sans-serif;font-size:14px;font-weight:800;color:var(--n900);}
  .cart-item-body{flex:1;min-width:0;}

  .qty-control{
    display:flex;align-items:center;gap:6px;margin-top:6px;
  }
  .qty-btn{
    width:26px;height:26px;border-radius:8px;
    border:1.5px solid var(--n200);background:var(--n0);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;font-size:14px;color:var(--n600);
    transition:all .15s;
  }
  .qty-btn:hover{background:var(--n100);}
  .qty-val{font-family:'Sora',sans-serif;font-size:14px;font-weight:700;color:var(--n900);min-width:20px;text-align:center;}
  .remove-btn{
    background:none;border:none;cursor:pointer;
    color:var(--n300);padding:4px;border-radius:6px;
    transition:all .15s;display:flex;align-items:center;
  }
  .remove-btn:hover{color:var(--rh-tx);background:var(--rh-bg);}

  .cart-footer{padding:16px 24px;border-top:1px solid var(--n200);}
  .cart-summary{margin-bottom:14px;}
  .cart-row{display:flex;justify-content:space-between;font-size:13px;color:var(--n500);margin-bottom:6px;}
  .cart-row.total{font-family:'Sora',sans-serif;font-size:16px;font-weight:800;color:var(--n900);border-top:1px solid var(--n200);padding-top:10px;margin-top:6px;}
  .cart-empty{text-align:center;padding:48px 0;color:var(--n400);}
  .cart-empty-icon{font-size:40px;opacity:.3;margin-bottom:12px;}
  .cart-empty-text{font-size:14px;font-weight:300;}

  .checkout-btn{
    width:100%;background:linear-gradient(135deg,var(--n900),var(--n700));
    color:white;border:none;padding:14px;border-radius:var(--r-lg);
    font-family:'Sora',sans-serif;font-weight:700;font-size:15px;cursor:pointer;
    transition:all .2s;box-shadow:0 4px 16px rgba(0,0,0,.2);
    position:relative;overflow:hidden;
  }
  .checkout-btn::before{content:'';position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(to bottom,rgba(255,255,255,.08),transparent);pointer-events:none;}
  .checkout-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,.25);}
  .checkout-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}

  /* ── Checkout modal ── */
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:80;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn .2s ease;}
  .modal{
    background:var(--n0);border-radius:var(--r-2xl);
    width:100%;max-width:480px;
    max-height:90svh;overflow-y:auto;
    box-shadow:0 24px 64px rgba(0,0,0,.2);
    animation:scaleIn .3s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes scaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
  .modal-header{padding:22px 24px 0;display:flex;align-items:center;justify-content:space-between;}
  .modal-title{font-family:'Sora',sans-serif;font-size:18px;font-weight:800;color:var(--n900);letter-spacing:-.4px;}
  .modal-body{padding:20px 24px;}
  .modal-footer{padding:0 24px 22px;}

  .form-group{display:flex;flex-direction:column;gap:4px;margin-bottom:14px;}
  .form-label{font-size:12px;font-weight:600;color:var(--n600);text-transform:uppercase;letter-spacing:.05em;}
  .form-input,.form-select{
    width:100%;padding:11px 13px;
    border:1.5px solid var(--n200);border-radius:var(--r-md);
    font-family:'DM Sans',sans-serif;font-size:14px;color:var(--n900);
    background:var(--n0);outline:none;
    transition:border-color .2s,box-shadow .2s;
    appearance:none;-webkit-appearance:none;
  }
  .form-input::placeholder{color:var(--n400);font-weight:300;}
  .form-input:focus,.form-select:focus{border-color:var(--g600);box-shadow:0 0 0 3px rgba(22,163,74,.1);}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

  .payment-methods{display:flex;flex-direction:column;gap:8px;}
  .pay-option{
    display:flex;align-items:center;gap:12px;
    padding:12px 14px;border-radius:var(--r-md);
    border:1.5px solid var(--n200);cursor:pointer;transition:all .2s;
  }
  .pay-option.selected{border-color:var(--g600);background:var(--g50);}
  .pay-icon{font-size:22px;flex-shrink:0;}
  .pay-label{font-size:14px;font-weight:500;color:var(--n700);}
  .pay-sub{font-size:11px;color:var(--n400);font-weight:300;}
  .pay-radio{
    width:18px;height:18px;border-radius:50%;border:2px solid var(--n300);
    margin-left:auto;flex-shrink:0;transition:all .2s;
    display:flex;align-items:center;justify-content:center;
  }
  .pay-option.selected .pay-radio{border-color:var(--g600);background:var(--g600);}
  .pay-radio-dot{width:7px;height:7px;border-radius:50%;background:white;}

  .rx-notice{
    display:flex;align-items:flex-start;gap:8px;
    padding:11px 13px;border-radius:var(--r-md);
    background:var(--bl50);border:1px solid var(--bl100);
    font-size:12px;color:var(--bl600);margin-bottom:16px;line-height:1.5;
  }

  /* ── Order success ── */
  .order-success{text-align:center;padding:clamp(24px,4vw,40px) 24px;}
  .success-icon{font-size:56px;margin-bottom:16px;}
  .success-title{font-family:'Sora',sans-serif;font-size:22px;font-weight:800;color:var(--n900);letter-spacing:-.5px;margin-bottom:8px;}
  .success-sub{font-size:14px;color:var(--n500);font-weight:300;line-height:1.6;max-width:340px;margin:0 auto 24px;}
  .order-id{
    display:inline-block;
    background:var(--n50);border:1px solid var(--n200);
    border-radius:var(--r-md);padding:10px 20px;
    font-family:'Sora',sans-serif;font-size:15px;font-weight:800;color:var(--n900);
    letter-spacing:.1em;margin-bottom:24px;
  }

  /* ── Animations ── */
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  .au {animation:fadeUp .4s ease both;}
  .au1{animation:fadeUp .4s ease .05s both;}
  .au2{animation:fadeUp .4s ease .10s both;}
  .au3{animation:fadeUp .4s ease .15s both;}
  .au4{animation:fadeUp .4s ease .20s both;}

  /* ── Empty state ── */
  .empty{text-align:center;padding:clamp(40px,7vw,72px) 20px;color:var(--n400);}
  .empty-icon{font-size:40px;opacity:.35;margin-bottom:12px;}
  .empty-title{font-family:'Sora',sans-serif;font-size:16px;font-weight:700;color:var(--n600);margin-bottom:5px;}
  .empty-sub{font-size:13px;font-weight:300;}

  /* ── Responsive ── */
  @media(max-width:480px){
    .product-grid{grid-template-columns:1fr 1fr;}
    .product-desc{display:none;}
    .hero-stats{gap:12px;}
  }
  @media(max-width:360px){
    .product-grid{grid-template-columns:1fr;}
  }
`;

/* ─── Helpers ────────────────────────────────────────────────── */
const fmtNGN = (n: number) =>
  '₦' + n.toLocaleString('en-NG');

const Stars = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="stars">
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
};

const StockStatus = ({ stock }: { stock: number }) => {
  const cls = stock === 0 ? 'out' : stock < 10 ? 'low' : 'in';
  const label = stock === 0 ? 'Out of stock' : stock < 10 ? `Only ${stock} left` : 'In stock';
  return (
    <span className="stock-chip">
      <span className={`stock-dot ${cls}`} />
      <span style={{ fontSize: 11, color: cls === 'out' ? 'var(--rh-tx)' : cls === 'low' ? 'var(--rm-tx)' : 'var(--n400)', fontWeight: 400 }}>{label}</span>
    </span>
  );
};

/* ─── Main Page ──────────────────────────────────────────────── */
export default function MarketplacePage() {
  const router = useRouter();

  // State
  const [search,       setSearch]       = useState('');
  const [category,     setCategory]     = useState<Category>('all');
  const [sortBy,       setSortBy]       = useState('recommended');
  const [sickleOnly,   setSickleOnly]   = useState(false);
  const [cart,         setCart]         = useState<CartItem[]>([]);
  const [cartOpen,     setCartOpen]     = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderDone,    setOrderDone]    = useState(false);
  const [orderId,      setOrderId]      = useState('');
  const [payMethod,    setPayMethod]    = useState('card');
  const [form, setForm] = useState({
    name:'', email:'', phone:'', address:'', city:'', state:'', card:'', expiry:'', cvv:''
  });

  // Derived
  const filtered = useMemo(() => {
    let list = PRODUCTS;
    if (category !== 'all') list = list.filter(p => p.category === category);
    if (sickleOnly) list = list.filter(p => p.sickleSpecific);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q))
      );
    }
    if (sortBy === 'price-asc')  list = [...list].sort((a,b) => a.price - b.price);
    if (sortBy === 'price-desc') list = [...list].sort((a,b) => b.price - a.price);
    if (sortBy === 'rating')     list = [...list].sort((a,b) => b.rating - a.rating);
    if (sortBy === 'reviews')    list = [...list].sort((a,b) => b.reviews - a.reviews);
    return list;
  }, [category, sickleOnly, search, sortBy]);

  const cartCount  = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal  = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const delivery   = cartTotal > 0 ? 1500 : 0;
  const grandTotal = cartTotal + delivery;
  const hasRx      = cart.some(i => i.product.badge === 'Rx');

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? {...i, qty: i.qty + 1} : i);
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => {
      const next = prev.map(i => i.product.id === id ? {...i, qty: Math.max(0, i.qty + delta)} : i);
      return next.filter(i => i.qty > 0);
    });
  };

  const removeItem = (id: string) => setCart(prev => prev.filter(i => i.product.id !== id));

  const handleCheckout = () => {
    const id = 'SS-' + Date.now().toString(36).toUpperCase();
    setOrderId(id);
    setOrderDone(true);
  };

  const isInCart = (id: string) => cart.some(i => i.product.id === id);

  const getUserRole = () => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.role || 'patient';
    } catch { return 'patient'; }
  };
  const userRole = getUserRole() as 'patient' | 'caregiver';

  return (
    <>
      <style>{STYLES}</style>
      <div className="shell">
        {/* <Sidebar userRole={userRole} /> */}
        <div className="main">
          {/* <Header title="Pharmacy Marketplace" userRole={userRole} /> */}
          <div className="content">
            <div className="inner">

              {/* Hero */}
              <div className="hero au">
                <div className="hero-body">
                  <div className="hero-eyebrow">
                    <span className="trust-dot" style={{width:6,height:6}} />
                    SickleSense Pharmacy
                  </div>
                  <div className="hero-title">Medications & Supplies<br />Delivered to Your Door</div>
                  <div className="hero-sub">Curated products for sickle cell patients and caregivers. Licensed medications, supplements, and monitoring devices.</div>
                  <div className="hero-stats">
                    <div>
                      <div className="hero-stat-val">{PRODUCTS.length}+</div>
                      <div className="hero-stat-lbl">Products</div>
                    </div>
                    <div>
                      <div className="hero-stat-val">24h</div>
                      <div className="hero-stat-lbl">Delivery</div>
                    </div>
                    <div>
                      <div className="hero-stat-val">100%</div>
                      <div className="hero-stat-lbl">Licensed</div>
                    </div>
                  </div>
                </div>
                <div className="hero-trust">
                  {['NAFDAC Certified', 'Licensed Pharmacy', '24h Delivery'].map(t => (
                    <div className="trust-pill" key={t}>
                      <span className="trust-dot" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              {/* Category pills */}
              <div className="cat-pills au1">
                {CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    className={`cat-pill ${category === c.id ? 'active' : 'inactive'}`}
                    onClick={() => setCategory(c.id)}
                  >
                    {c.icon} {c.label}
                    {c.id !== 'all' && (
                      <span style={{
                        background: category === c.id ? 'rgba(255,255,255,.25)' : 'var(--n100)',
                        color: category === c.id ? 'white' : 'var(--n500)',
                        fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:100
                      }}>
                        {PRODUCTS.filter(p => p.category === c.id).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search + filter bar */}
              <div className="topbar au2">
                <div className="search-wrap">
                  <span className="search-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                  </span>
                  <input
                    className="search-input"
                    placeholder="Search medications, supplements…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="filter-sel"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="recommended">Recommended</option>
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviewed</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                </select>
                <button
                  className={`sickle-toggle ${sickleOnly ? 'on' : 'off'}`}
                  onClick={() => setSickleOnly(v => !v)}
                >
                  <span>🩸</span>
                  Sickle Cell Only
                </button>
              </div>

              {/* Results count */}
              <div className="results-bar au3">
                <div className="results-count">
                  Showing <strong>{filtered.length}</strong> product{filtered.length !== 1 ? 's' : ''}
                  {category !== 'all' && ` in ${CATEGORIES.find(c => c.id === category)?.label}`}
                  {sickleOnly && ' — Sickle Cell specific'}
                </div>
              </div>

              {/* Product grid */}
              {filtered.length > 0 ? (
                <div className="product-grid au4">
                  {filtered.map((product, i) => (
                    <div
                      key={product.id}
                      className={`product-card ${product.sickleSpecific ? 'sickle-specific' : ''}`}
                      style={{animationDelay:`${i * 0.03}s`, animation:'fadeUp .4s ease both'}}
                    >
                      <div className="product-top">
                        <div className="product-icon-wrap">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              style={{width:52,height:52,objectFit:'cover',borderRadius:14}}
                            />
                          ) : (
                            product.icon
                          )}
                        </div>
                        <div className="product-badges">
                          {product.badge && (
                            <span className="badge" style={{background: product.badgeColor}}>
                              {product.badge}
                            </span>
                          )}
                          {product.sickleSpecific && (
                            <span className="badge-sickle">🩸 SC</span>
                          )}
                        </div>
                      </div>

                      <div className="product-body">
                        <div className="product-brand">{product.brand}</div>
                        <div className="product-name">{product.name}</div>
                        <div className="product-unit">{product.unit}</div>
                        <div className="product-desc">{product.description}</div>

                        <div className="product-rating">
                          <Stars rating={product.rating} />
                          <span className="rating-val">{product.rating}</span>
                          <span className="rating-count">({product.reviews})</span>
                        </div>

                        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:6}}>
                          <StockStatus stock={product.stock} />
                          {product.tags.slice(0,1).map(t => (
                            <span className="product-tag" key={t}>{t}</span>
                          ))}
                        </div>
                      </div>

                      <div className="product-footer">
                        <div className="price-block">
                          <span className="price-main">{fmtNGN(product.price)}</span>
                          {product.originalPrice && (
                            <>
                              <span className="price-original">{fmtNGN(product.originalPrice)}</span>
                              <span className="price-save">-{Math.round((1 - product.price/product.originalPrice)*100)}%</span>
                            </>
                          )}
                        </div>
                        <button
                          className={`add-btn ${isInCart(product.id) ? 'in-cart' : ''}`}
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                        >
                          {isInCart(product.id) ? (
                            <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> Added</>
                          ) : (
                            <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> Add</>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty au3">
                  <div className="empty-icon">🔍</div>
                  <div className="empty-title">No products found</div>
                  <div className="empty-sub">Try adjusting your search or filters.</div>
                </div>
              )}

              <div style={{height:80}} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating cart button */}
      {cartCount > 0 && !cartOpen && (
        <button className="cart-fab" onClick={() => setCartOpen(true)}>
          🛒
          <span className="cart-fab-badge">{cartCount}</span>
        </button>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <>
          <div className="cart-overlay" onClick={() => setCartOpen(false)} />
          <div className="cart-drawer">
            <div className="cart-header">
              <div>
                <div className="cart-title">Your Cart</div>
                <div style={{fontSize:12,color:'var(--n400)',fontWeight:300,marginTop:2}}>{cartCount} item{cartCount !== 1 ? 's' : ''}</div>
              </div>
              <button className="cart-close" onClick={() => setCartOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>

            <div className="cart-body">
              {cart.length === 0 ? (
                <div className="cart-empty">
                  <div className="cart-empty-icon">🛒</div>
                  <div className="cart-empty-text">Your cart is empty</div>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="cart-item">
                    <div className="cart-item-icon">
                      {item.product.image ? (
                        <img src={item.product.image} alt={item.product.name} style={{width:44,height:44,objectFit:'cover',borderRadius:12}} />
                      ) : item.product.icon}
                    </div>
                    <div className="cart-item-body">
                      <div className="cart-item-name">{item.product.name}</div>
                      <div className="cart-item-unit">{item.product.unit}</div>
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQty(item.product.id, -1)}>−</button>
                        <span className="qty-val">{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.product.id, +1)}>+</button>
                        <div className="cart-item-price" style={{marginLeft:6}}>{fmtNGN(item.product.price * item.qty)}</div>
                      </div>
                    </div>
                    <button className="remove-btn" onClick={() => removeItem(item.product.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-summary">
                  <div className="cart-row"><span>Subtotal</span><span>{fmtNGN(cartTotal)}</span></div>
                  <div className="cart-row"><span>Delivery</span><span>{fmtNGN(delivery)}</span></div>
                  <div className="cart-row total"><span>Total</span><span>{fmtNGN(grandTotal)}</span></div>
                </div>
                <button
                  className="checkout-btn"
                  onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                >
                  Checkout → {fmtNGN(grandTotal)}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Checkout modal */}
      {checkoutOpen && (
        <div className="modal-overlay">
          <div className="modal">
            {orderDone ? (
              <div className="order-success">
                <div className="success-icon">🎉</div>
                <div className="success-title">Order Placed!</div>
                <div className="success-sub">
                  Your order has been confirmed and will be delivered within 24 hours.
                  {hasRx && ' Prescription items will be verified by our pharmacist before dispatch.'}
                </div>
                <div className="order-id">{orderId}</div>
                <button
                  className="checkout-btn"
                  style={{maxWidth:280,margin:'0 auto'}}
                  onClick={() => { setCheckoutOpen(false); setOrderDone(false); setCart([]); }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <div className="modal-title">Checkout</div>
                  <button className="cart-close" onClick={() => setCheckoutOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                </div>

                <div className="modal-body">
                  {hasRx && (
                    <div className="rx-notice">
                      <span>ℹ️</span>
                      Your cart contains Rx (prescription) items. Our pharmacist will contact you to verify your prescription before dispatch.
                    </div>
                  )}

                  {/* Delivery details */}
                  <div style={{fontSize:12,fontWeight:700,color:'var(--n500)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:12}}>Delivery Details</div>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" placeholder="Amina Okonkwo" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" placeholder="+234 801 234 5678" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Delivery Address</label>
                    <input className="form-input" placeholder="12 Broad Street, Victoria Island" value={form.address} onChange={e => setForm(f=>({...f,address:e.target.value}))} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input className="form-input" placeholder="Lagos" value={form.city} onChange={e => setForm(f=>({...f,city:e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <select className="form-select" value={form.state} onChange={e => setForm(f=>({...f,state:e.target.value}))}>
                        <option value="">Select state</option>
                        {['Lagos','Abuja','Rivers','Oyo','Kano','Delta','Enugu','Kaduna'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Payment */}
                  <div style={{fontSize:12,fontWeight:700,color:'var(--n500)',textTransform:'uppercase',letterSpacing:'.06em',margin:'16px 0 12px'}}>Payment Method</div>
                  <div className="payment-methods">
                    {[
                      {id:'card',     icon:'💳', label:'Debit / Credit Card',    sub:'Visa, Mastercard, Verve'},
                      {id:'transfer', icon:'🏦', label:'Bank Transfer',          sub:'Pay via direct bank transfer'},
                      {id:'wallet',   icon:'📱', label:'Mobile Wallet',           sub:'Opay, Palmpay, Flutterwave'},
                    ].map(m => (
                      <div
                        key={m.id}
                        className={`pay-option ${payMethod===m.id ? 'selected' : ''}`}
                        onClick={() => setPayMethod(m.id)}
                      >
                        <span className="pay-icon">{m.icon}</span>
                        <div>
                          <div className="pay-label">{m.label}</div>
                          <div className="pay-sub">{m.sub}</div>
                        </div>
                        <div className="pay-radio">
                          {payMethod === m.id && <div className="pay-radio-dot" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  {payMethod === 'card' && (
                    <div style={{marginTop:14}}>
                      <div className="form-group">
                        <label className="form-label">Card Number</label>
                        <input className="form-input" placeholder="0000 0000 0000 0000" value={form.card} onChange={e => setForm(f=>({...f,card:e.target.value}))} maxLength={19} />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Expiry</label>
                          <input className="form-input" placeholder="MM / YY" value={form.expiry} onChange={e => setForm(f=>({...f,expiry:e.target.value}))} maxLength={5} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">CVV</label>
                          <input className="form-input" placeholder="•••" value={form.cvv} onChange={e => setForm(f=>({...f,cvv:e.target.value}))} maxLength={3} type="password" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order summary */}
                  <div style={{background:'var(--n50)',borderRadius:'var(--r-lg)',padding:'14px 16px',marginTop:16}}>
                    <div style={{fontSize:12,fontWeight:700,color:'var(--n500)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10}}>Order Summary</div>
                    {cart.map(item => (
                      <div key={item.product.id} style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'var(--n600)',marginBottom:4}}>
                        <span>{item.product.name} × {item.qty}</span>
                        <span style={{fontWeight:600}}>{fmtNGN(item.product.price * item.qty)}</span>
                      </div>
                    ))}
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--n400)',marginBottom:4,marginTop:8,paddingTop:8,borderTop:'1px solid var(--n200)'}}>
                      <span>Delivery</span><span>{fmtNGN(delivery)}</span>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',fontFamily:'Sora,sans-serif',fontSize:15,fontWeight:800,color:'var(--n900)',marginTop:8,paddingTop:8,borderTop:'1px solid var(--n200)'}}>
                      <span>Total</span><span>{fmtNGN(grandTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="checkout-btn"
                    onClick={handleCheckout}
                    disabled={!form.name || !form.phone || !form.address}
                  >
                    Place Order — {fmtNGN(grandTotal)}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}