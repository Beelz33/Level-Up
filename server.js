const express = require("express");
const app = express();
const crypto = require("crypto");
const path = require("path");

app.use(express.json());
app.use(express.static(__dirname)); 

const users = [];       
const sessions = new Map(); 
const products = [
  {id:"p1", name:"Consola X", category:"consolas", price:399990, stock:5, desc:"Consola de última gen", images:["/img/1.jpg"]},
  {id:"p2", name:"PC Gamer R5", category:"computadores gamers", price:899990, stock:3, desc:"Ryzen + RTX", images:["/img/2.jpg"]},
  {id:"p3", name:"Silla Gamer Pro", category:"sillas gamers", price:129990, stock:8, desc:"Ergonómica", images:["/img/3.jpg"]},
  {id:"p4", name:"Mouse Óptico", category:"mouse", price:19990, stock:30, desc:"12k DPI", images:["/img/4.jpg"]},
  {id:"p5", name:"Mousepad XL", category:"mousepad", price:14990, stock:20, desc:"Grande y antideslizante", images:["/img/5.jpg"]},
  {id:"p6", name:"Polera Personalizada", category:"poleras personalizadas", price:9990, stock:50, desc:"Tu diseño", images:["/img/6.jpg"]},
  {id:"p7", name:"Juego de Mesa Épico", category:"juegos de mesa", price:34990, stock:12, desc:"Hasta 6 jugadores", images:["/img/7.jpg"]},
  {id:"p8", name:"Teclado Mecánico", category:"accesorios", price:59990, stock:15, desc:"Switches azules", images:["/img/8.jpg"]},
  {id:"p9", name:"Periférico Personalizado", category:"periféricos personalizados", price:45990, stock:10, desc:"Hecho a medida", images:["/img/9.jpg"]},
];
const reviews = []; 

function uid(){ return crypto.randomBytes(12).toString("hex"); }
function auth(req,res,next){
  const token = req.headers.authorization?.replace("Bearer ","");
  if(!token || !sessions.has(token)) return res.status(401).json({error:"No autorizado"});
  req.user = users.find(u=>u.id===sessions.get(token));
  if(!req.user) return res.status(401).json({error:"Sesión inválida"});
  next();
}
function calcLevel(points){
  if(points>=1000) return 5;
  if(points>=600) return 4;
  if(points>=300) return 3;
  if(points>=150) return 2;
  return 1;
}

app.post("/api/register",(req,res)=>{
  const {name,email,password,birthdate,referralCode} = req.body;
  if(!name||!email||!password||!birthdate) return res.status(400).json({error:"Faltan campos"});
  const d = new Date(birthdate);
  const hoy = new Date();
  const edad = hoy.getFullYear()-d.getFullYear() - (hoy < new Date(hoy.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
  if(edad < 18) return res.status(400).json({error:"Solo mayores de 18 años"});
  if(users.some(u=>u.email===email)) return res.status(400).json({error:"Correo ya registrado"});

  const discount = email.toLowerCase().endsWith("@duoc.cl") ? 0.20 : 0;
  const id = uid();
  const user = {id,name,email,password,birthdate,discount,points:0,level:1,refCode:"REF-"+id.slice(0,6).toUpperCase(),prefs:{},cart:[],address:"",phone:""};
  if(referralCode){
    const refOwner = users.find(u=>u.refCode===referralCode.trim());
    if(refOwner){ refOwner.points += 50; refOwner.level = calcLevel(refOwner.points); }
  }
  users.push(user);
  res.json({ok:true,message:"Registro exitoso",duocDiscount:discount>0,refCode:user.refCode});
});

app.post("/api/login",(req,res)=>{
  const {email,password} = req.body;
  const user = users.find(u=>u.email===email && u.password===password);
  if(!user) return res.status(401).json({error:"Credenciales inválidas"});
  const token = uid();
  sessions.set(token,user.id);
  res.json({token, name:user.name, discount:user.discount, points:user.points, level:user.level, refCode:user.refCode});
});

app.get("/api/profile",auth,(req,res)=>{
  const {name,email,birthdate,discount,points,level,refCode,prefs,address,phone} = req.user;
  res.json({name,email,birthdate,discount,points,level,refCode,prefs,address,phone});
});
app.put("/api/profile",auth,(req,res)=>{
  const {name,address,phone,prefs} = req.body;
  if(name!==undefined) req.user.name=name;
  if(address!==undefined) req.user.address=address;
  if(phone!==undefined) req.user.phone=phone;
  if(prefs!==undefined) req.user.prefs=prefs;
  res.json({ok:true});
});

app.get("/api/products",(req,res)=>{
  let list=[...products];
  const {category,q,minPrice,maxPrice,sort} = req.query;
  if(category) list = list.filter(p=>p.category.toLowerCase()===category.toLowerCase());
  if(q) list = list.filter(p=>p.name.toLowerCase().includes(q.toLowerCase()));
  if(minPrice) list = list.filter(p=>p.price>=Number(minPrice));
  if(maxPrice) list = list.filter(p=>p.price<=Number(maxPrice));
  if(sort==="price") list.sort((a,b)=>a.price-b.price);
  if(sort==="name") list.sort((a,b)=>a.name.localeCompare(b.name));
  res.json(list);
});

app.get("/api/cart",auth,(req,res)=>{
  const cart = req.user.cart; 
  const detailed = cart.map(i=>{
    const p = products.find(x=>x.id===i.productId);
    return {...i, name:p?.name, price:p?.price||0, subtotal:(p?.price||0)*i.qty};
  });
  const subtotal = detailed.reduce((s,i)=>s+i.subtotal,0);
  const discountAmt = Math.round(subtotal * (req.user.discount||0));
  const total = subtotal - discountAmt;
  res.json({items:detailed, subtotal, discount:discountAmt, total});
});
app.post("/api/cart/add",auth,(req,res)=>{
  const {productId,qty} = req.body;
  const p = products.find(x=>x.id===productId);
  if(!p) return res.status(404).json({error:"Producto no existe"});
  const q = Math.max(1, Number(qty||1));
  const item = req.user.cart.find(i=>i.productId===productId);
  if(item){ item.qty += q; } else { req.user.cart.push({productId,qty:q}); }
  res.json({ok:true});
});
app.post("/api/cart/update",auth,(req,res)=>{
  const {productId,qty} = req.body;
  const item = req.user.cart.find(i=>i.productId===productId);
  if(!item) return res.status(404).json({error:"No está en carrito"});
  item.qty = Math.max(1, Number(qty));
  res.json({ok:true});
});
app.post("/api/cart/remove",auth,(req,res)=>{
  const {productId} = req.body;
  req.user.cart = req.user.cart.filter(i=>i.productId!==productId);
  res.json({ok:true});
});

app.get("/api/reviews/:productId",(req,res)=>{
  const list = reviews
    .filter(r=>r.productId===req.params.productId)
    .map(r=>({rating:r.rating, comment:r.comment, user: users.find(u=>u.id===r.userId)?.name || "Usuario", date:r.date}));
  res.json(list);
});
app.post("/api/reviews",auth,(req,res)=>{
  const {productId,rating,comment} = req.body;
  if(!productId || !rating) return res.status(400).json({error:"Faltan datos"});
  reviews.push({productId,userId:req.user.id,rating:Math.max(1,Math.min(5,Number(rating))),comment:comment||"",date:new Date().toISOString()});
  req.user.points += 10; req.user.level = calcLevel(req.user.points);
  res.json({ok:true});
});

app.post("/api/referrals/redeem",auth,(req,res)=>{
  const {points} = req.body;
  const p = Number(points||0);
  if(p<=0 || req.user.points < p) return res.status(400).json({error:"Puntos insuficientes"});
  req.user.points -= p; req.user.level = calcLevel(req.user.points);
  const coupons = Math.floor(p/100);
  res.json({ok:true, coupons, message:`Canjeaste ${p} pts por ${coupons} cupón(es) de 5%`});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("LevelUp API escuchando en http://localhost:"+PORT));
