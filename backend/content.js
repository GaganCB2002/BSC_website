'use strict';
/* BSC site content — collections, stores and leadership, seeded into SQLite so the
   whole catalogue is database-driven. The frontend renders the canonical cards from
   its own markup and enriches them with the DB "full directory" via /api/content/*.
   Future admin tooling edits these rows directly; seedForce() re-applies the canonical seed. */
const { db } = require('./db');

const COLLECTIONS = [
  { slug: 'women', name: 'Women’s Collection', category: 'clothing', tagline: 'Kanjivarams & silks · ethnic & party wear · dress materials · casuals · workwear',
    description: 'Sarees, ethnic wear, party wear, dress materials and everyday casuals — the depth of a traditional textile house with modern fashion for every generation of women.',
    highlights: ['Sarees — silks, cottons, handlooms', 'Ethnic & party wear', 'Dress materials & unstitched suits', 'Casual & workwear'], image: '/assets/img/collection-women.jpg', accent: '#CA2125', sort: 10 },
  { slug: 'men', name: 'Men’s Collection', category: 'clothing', tagline: 'Formals & office wear · shirts · trousers · ethnic sets · suiting fabrics',
    description: 'Formal wear for the working week, ethnic sets for the festival, casuals for everything between — plus suiting fabrics cut and stitched by our in-house tailors.',
    highlights: ['Formals & office wear', 'Shirts & trousers', 'Kurta sets & ethnic doris', 'Suiting & shirting fabrics'], image: '/assets/img/collection-men.jpg', accent: '#203A85', sort: 20 },
  { slug: 'kids', name: 'Kids & Teens', category: 'clothing', tagline: 'Back-to-school · festive sets · first-birthday silks · nightwear · playwear',
    description: 'For every little generation — school-ready staples, festive sets, first-celebration silks and comfortable playwear, in fabrics parents trust.',
    highlights: ['School & playwear', 'Festive sets', 'First-birthday silks', 'Nightwear'], image: '/assets/img/collection-kids.jpg', accent: '#C77F2B', sort: 30 },
  { slug: 'wedding', name: 'Wedding & Occasion — The Bridal Wing', category: 'occasion', tagline: 'Complete trousseau — bridal & groom silks, family occasion wear, jewellery pairs, gifting',
    description: 'One visit, wedding-ready: bridal & groom silks (kanjivaram, paithani, banarasi, tissue), matching family occasion sets, imitation bridal jewellery and gifting — with bespoke tailoring for the entire baraat.',
    highlights: ['Bridal & groom silks', 'Family occasion sets & guest wear', 'Imitation bridal jewellery', 'Wedding gifting', 'Bespoke tailoring'], image: '/assets/img/collection-wedding.jpg', accent: '#8E1D26', sort: 40 },
  { slug: 'home-furnishings', name: 'Home Furnishings', category: 'home', tagline: 'Linen & curtains · bedspreads · cushions · mats & dhurries · festive décor',
    description: 'Dress your home like you dress your family — bedsheets, pillow covers, napery, sheers and jacquard curtains stitched to your windows, plus seasonal and occasion-based essentials.',
    highlights: ['Fabrics & linen', 'Curtains & drapes', 'Seasonal décor', 'Everyday essentials'], image: '/assets/img/collection-home.jpg', accent: '#3B5BA8', sort: 50 },
  { slug: 'dress-materials', name: 'Dress Materials & Fabrics', category: 'clothing', tagline: 'Unstitched suits, silks and cottons by the metre',
    description: 'The heart of a textile house — dress materials and fabrics by the metre, paired with expert tailoring for men and women.',
    highlights: ['Unstitched dress materials', 'Silks & cottons by the metre', 'Fall & pico, in-house'], image: '/assets/img/collection-dress-materials.svg', accent: '#8E1D26', sort: 60 },
  { slug: 'imitation-jewellery', name: 'Imitation Jewellery', category: 'accessories', tagline: 'Bridal pairs, temple sets & everyday sparkle',
    description: 'Imitation jewellery that pairs perfectly with the sarees and sets on our own floors — from temple bridal sets to lightweight everyday pieces.',
    highlights: ['Bridal sets', 'Temple & antique finish', 'Everyday wear'], image: '/assets/img/collection-jewellery.svg', accent: '#C77F2B', sort: 70 },  
  { slug: 'cosmetics', name: 'Cosmetics', category: 'accessories', tagline: 'Beauty counters with trusted names',
    description: 'Cosmetics counters carrying trusted names — daily care to occasion looks, curated for Indian skin and Indian weddings.',
    highlights: ['Daily care', 'Occasion looks', 'Trusted brands'], image: '/assets/img/collection-cosmetics.svg', accent: '#CA2125', sort: 80 },
  { slug: 'footwear', name: 'Footwear', category: 'accessories', tagline: 'Formal to festive, for all ages',
    description: 'Footwear for every member of the family — office formals, festive sandals, school shoes and everything between.',
    highlights: ['Men’s formals', 'Festive & ethnic', 'Kids & school'], image: '/assets/img/collection-footwear.svg', accent: '#203A85', sort: 90 },
  { slug: 'accessories', name: 'Fashion Accessories', category: 'accessories', tagline: 'Bags, belts, dupattas & the finishing touch',
    description: 'The finishing touch — dupattas, stoles, bags, belts and accessories that complete every outfit, for every occasion.',
    highlights: ['Dupattas & stoles', 'Bags & belts', 'Occasion add-ons'], image: '/assets/img/collection-accessories.svg', accent: '#3B5BA8', sort: 100 },
  { slug: 'brands', name: 'Curated Brands', category: 'brands', tagline: 'Alongside BSC’s own trusted offerings — greater choice across styles, needs and occasions',
    description: 'Leading brands curated across the store: saree houses, menswear labels, kids labels, home textile mills, beauty counters and footwear brands.',
    highlights: ['Saree houses', 'Menswear labels', 'Kids labels', 'Home textile mills', 'Beauty & care', 'Footwear brands'], image: '/assets/img/collection-brands.svg', accent: '#203A85', sort: 110 },
  { slug: 'tailoring', name: 'Expert Tailoring', category: 'services', tagline: 'For men & women — fit-on-approval stitching',
    description: 'Our in-house tailoring for men and women — weddings, office and festivals, with fit-on-approval stitching and festival-ready turnaround.',
    highlights: ['Men’s & women’s stitching', 'Fit-on-approval', 'Wedding & festive orders'], image: '/assets/img/collection-tailoring.svg', accent: '#C77F2B', sort: 120 },
];

const STORES = [
  { slug: 'davanagere', name: 'BSC Exclusive, Davanagere', city: 'Davanagere, Karnataka', badge: 'Birthplace · Flagship', sqft: '50,000', employees: '300',
    note: 'The birthplace of the brand — a three-storied store offering BSC’s complete family shopping experience.',
    hours: '10:00 AM – 10:00 PM · every day', maps_query: 'BSC Exclusive, Davanagere @14.4529115,75.9154592', sort: 10 },
  { slug: 'belagavi', name: 'BSC Textile Mall, Belagavi', city: 'Belagavi, Karnataka', badge: 'Landmark', sqft: '1,00,000', employees: '500',
    note: 'The largest textile showroom across Karnataka, Maharashtra and Goa — a landmark retail experience.',
    hours: '10:00 AM – 10:00 PM · every day', maps_query: 'BSC Textile Mall Belagavi', sort: 20 },
  { slug: 'shivamogga', name: 'BSC Shivamogga', city: 'Shivamogga, Karnataka', badge: 'New chapter', sqft: '1,50,000', employees: '500',
    note: 'The next chapter in BSC’s growth story — the warmth, range and trust of BSC for a new city and new families.',
    hours: '10:00 AM – 10:00 PM · every day', maps_query: 'BSC Shivamogga', sort: 30 },
];

const LEADERS = [
  { slug: 'umapathy', name: 'Mr. Umapathy Bankapur', role: 'Founder & Director', generation: '3rd generation', initials: 'UB',
    bio: 'Instrumental in strengthening the foundations of BSC and establishing its reputation as a household name built on quality and customer trust.', sort: 10 },
  { slug: 'chandrashekar', name: 'Mr. Chandrashekar Bankapur', role: 'Managing Director', generation: '4th generation', initials: 'CB',
    bio: 'Leads operations, growth and strategic expansion while continuously enhancing BSC’s scale and market presence.', sort: 20 },
  { slug: 'ved', name: 'Mr. Ved Bankapur', role: 'Director', generation: '5th generation', initials: 'VB',
    bio: 'Represents the 5th and newest generation of leadership — drives brand building, customer experience, innovation and future expansion for BSC.', sort: 30 },
];

function seedCollections() {
  const ins = db.prepare(`INSERT INTO collections (slug, name, category, tagline, description, highlights, image, accent, sort)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET name=excluded.name, category=excluded.category, tagline=excluded.tagline,
      description=excluded.description, highlights=excluded.highlights, image=excluded.image,
      accent=excluded.accent, sort=excluded.sort`);
  for (const c of COLLECTIONS) ins.run(c.slug, c.name, c.category, c.tagline, c.description, JSON.stringify(c.highlights), c.image, c.accent, c.sort);
}
function seedStores() {
  const ins = db.prepare(`INSERT INTO stores (slug, name, city, badge, sqft, employees, note, hours, maps_query, sort)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET name=excluded.name, city=excluded.city, badge=excluded.badge, sqft=excluded.sqft,
      employees=excluded.employees, note=excluded.note, hours=excluded.hours, maps_query=excluded.maps_query, sort=excluded.sort`);
  for (const s of STORES) ins.run(s.slug, s.name, s.city, s.badge, s.sqft, s.employees, s.note, s.hours, s.maps_query, s.sort);
}
function seedLeaders() {
  const ins = db.prepare(`INSERT INTO leaders (slug, name, role, generation, bio, initials, sort)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET name=excluded.name, role=excluded.role, generation=excluded.generation,
      bio=excluded.bio, initials=excluded.initials, sort=excluded.sort`);
  for (const l of LEADERS) ins.run(l.slug, l.name, l.role, l.generation, l.bio, l.initials, l.sort);
}

/* ensureSeeded() fills empty tables on boot; seedForce() re-applies the canonical seed. */
function ensureSeeded(force = false) {
  const empty = db.prepare('SELECT (SELECT COUNT(*) FROM collections)+(SELECT COUNT(*) FROM stores)+(SELECT COUNT(*) FROM leaders) c').get().c;
  if (!force && empty > 0) return false;
  const tx = db.transaction(() => { seedCollections(); seedStores(); seedLeaders(); });
  tx();
  return true;
}

const parse = (r) => (r.highlights ? { ...r, highlights: JSON.parse(r.highlights) } : r);
const listCollections = () => db.prepare('SELECT slug, name, category, tagline, description, highlights, image, accent FROM collections ORDER BY sort, id').all().map(parse);
const listStores = () => db.prepare('SELECT slug, name, city, badge, sqft, employees, note, hours, maps_query FROM stores ORDER BY sort, id').all();
const listLeaders = () => db.prepare('SELECT slug, name, role, generation, bio, initials FROM leaders ORDER BY sort, id').all();

module.exports = { ensureSeeded, seedForce: () => ensureSeeded(true), listCollections, listStores, listLeaders };
