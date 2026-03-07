import type { Vendor, Booking, AppUser, Dispute, Message, VendorService } from "./types";

export const VENDORS: Vendor[] = [
  { id:"1", name:"Marcus Osei",         cat:"Plumber",     loc:"Gaborone CBD", rating:4.9, rev:124, price:250, unit:"hr",  avail:true,  tags:["Pipe Repair","Drain Cleaning","Installation"], bio:"10+ years experience. Licensed & insured. Same-day available." },
  { id:"2", name:"Thabo Molefe",        cat:"Electrician", loc:"Extension 10", rating:4.7, rev:89,  price:300, unit:"hr",  avail:true,  tags:["Wiring","Circuit Breakers","Lighting"],         bio:"Certified electrician. Free quote for large jobs." },
  { id:"3", name:"Kelebogile Dube",     cat:"Carpenter",   loc:"Phase 2",      rating:4.8, rev:56,  price:200, unit:"hr",  avail:false, tags:["Furniture","Doors & Windows","Decking"],        bio:"Custom woodwork specialist. Premium materials." },
  { id:"4", name:"Sipho Nkosi",         cat:"Painter",     loc:"Block 8",      rating:4.6, rev:203, price:180, unit:"hr",  avail:true,  tags:["Interior","Exterior","Waterproofing"],          bio:"Fast, tidy work. Full-room quotes available." },
  { id:"5", name:"Boitumelo Setlhare",  cat:"Cleaner",     loc:"Tlokweng",     rating:5.0, rev:412, price:150, unit:"hr",  avail:true,  tags:["Deep Clean","Post-construction","Regular"],     bio:"Top-rated cleaner in Gaborone. Eco-friendly products." },
];

export const BOOKINGS_DATA: Booking[] = [
  { id:"1", customer:"Lesego Mokoena",   vendor:"Marcus Osei",        service:"Pipe Repair",    date:"12 Jun 2025", time:"09:00", status:"pending",   amount:250, loc:"Phase 2" },
  { id:"2", customer:"Tshepiso Dlamini", vendor:"Thabo Molefe",       service:"Wiring Check",   date:"13 Jun 2025", time:"14:00", status:"confirmed",  amount:300, loc:"Extension 10" },
  { id:"3", customer:"Mpho Kgosi",       vendor:"Sipho Nkosi",        service:"Interior Paint", date:"14 Jun 2025", time:"08:00", status:"completed",  amount:540, loc:"Block 8" },
  { id:"4", customer:"Refilwe Tau",      vendor:"Boitumelo Setlhare", service:"Deep Clean",     date:"10 Jun 2025", time:"10:00", status:"completed",  amount:300, loc:"Tlokweng" },
  { id:"5", customer:"Neo Sithole",      vendor:"Kelebogile Dube",    service:"Furniture Fit",  date:"15 Jun 2025", time:"11:00", status:"pending",    amount:400, loc:"Phase 2" },
];

export const ALL_USERS: AppUser[] = [
  { id:"1", name:"Lesego Mokoena",   role:"customer", email:"lesego@mail.com",   phone:"", joined:"Jan 2025", status:"active",    bookings:7  },
  { id:"2", name:"Tshepiso Dlamini", role:"customer", email:"tshepiso@mail.com", phone:"", joined:"Feb 2025", status:"active",    bookings:3  },
  { id:"3", name:"Mpho Kgosi",       role:"customer", email:"mpho@mail.com",     phone:"", joined:"Mar 2025", status:"active",    bookings:12 },
  { id:"4", name:"Marcus Osei",      role:"vendor",   email:"marcus@mail.com",   phone:"", joined:"Dec 2024", status:"active",    bookings:42 },
  { id:"5", name:"Thabo Molefe",     role:"vendor",   email:"thabo@mail.com",    phone:"", joined:"Jan 2025", status:"pending",   bookings:0  },
  { id:"6", name:"Kelebogile Dube",  role:"vendor",   email:"kgosi@mail.com",    phone:"", joined:"Feb 2025", status:"active",    bookings:18 },
  { id:"7", name:"Neo Sithole",      role:"customer", email:"neo@mail.com",      phone:"", joined:"May 2025", status:"suspended", bookings:1  },
];

export const DISPUTES: Dispute[] = [
  { id:"1", customer:"Mpho Kgosi",  vendor:"Sipho Nkosi",        reason:"Job incomplete — only painted one wall", amount:540, status:"open",     date:"14 Jun" },
  { id:"2", customer:"Refilwe Tau", vendor:"Boitumelo Setlhare", reason:"Cleaner left early, missed bathrooms",   amount:300, status:"resolved", date:"10 Jun" },
];

export const CHAT_MESSAGES: Record<string, Message[]> = {
  "1": [
    { id:1, from:"them", text:"Hi! I wanted to book you for a pipe repair.",              time:"09:51" },
    { id:2, from:"me",   text:"Hello! Happy to help. What's the issue?",                 time:"09:53" },
    { id:3, from:"them", text:"Kitchen sink leaking under the cabinet.",                 time:"09:55" },
    { id:4, from:"me",   text:"Sounds like a joint issue. Available Thursday morning?",  time:"09:58" },
    { id:5, from:"them", text:"Is 9am still ok for Thursday?",                           time:"10:32" },
  ],
  "2": [
    { id:1, from:"them", text:"Hi Marcus, bathroom drain is blocked.",                   time:"08:00" },
    { id:2, from:"me",   text:"I can come Friday at 2pm. Will bring the power snake.",   time:"08:15" },
    { id:3, from:"them", text:"Thank you, see you Friday!",                              time:"08:20" },
  ],
};

export const VENDOR_SERVICES_INIT: VendorService[] = [
  { id:1, name:"Basic Pipe Repair", price:250, unit:"hr",  desc:"Fix leaks, joints, and minor pipe issues.", active:true  },
  { id:2, name:"Drain Cleaning",    price:180, unit:"job", desc:"Unblock and flush residential drains.",    active:true  },
  { id:3, name:"Full Overhaul",     price:900, unit:"job", desc:"Complete inspection & repair.",            active:false },
];
