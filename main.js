const money=n=>"₹"+Number(n).toLocaleString("en-IN");
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function toggleMenu(){const n=document.querySelector(".nav nav");if(n){n.style.display=n.style.display==="flex"?"none":"flex";n.style.position="absolute";n.style.top="74px";n.style.left="0";n.style.right="0";n.style.background="#fff";n.style.padding="20px";n.style.flexDirection="column"}}
function destCard(d){return `<article class="card"><div class="card-img"><img src="${d.image}" alt="${esc(d.name)}"><button class="heart" onclick="toggleWish(${d.id})">♡</button></div><div class="card-body"><span class="tag">${esc(d.region)}</span><span class="tag">⭐ ${d.rating}</span><h3>${esc(d.name)}</h3><div class="meta">📍 ${esc(d.state)} · Best: ${esc(d.bestTime)}</div><p class="card-desc">${esc(d.description)}</p><div class="card-footer"><span class="price">${esc(d.budget)}</span><a class="btn btn-small" href="destination-details.html?id=${d.id}">Explore</a></div></div></article>`}
function packageCard(p){return `<article class="card"><div class="card-img"><img src="${p.image}" alt="${esc(p.name)}"></div><div class="card-body"><span class="tag">${esc(p.duration)}</span><h3>${esc(p.name)}</h3><p class="meta">📍 ${esc(p.destination)}</p><p class="card-desc">${esc(p.description)}</p><div class="card-footer"><span class="price">${money(p.price)} <small>/ person</small></span><a class="btn btn-small" href="package-details.html?id=${p.id}">View Trip</a></div></div></article>`}
function hotelCard(h){return `<article class="card"><div class="card-img"><img src="${h.image}" alt="${esc(h.name)}"></div><div class="card-body"><span class="tag">⭐ ${h.rating}</span><span class="tag">${esc(h.type)}</span><h3>${esc(h.name)}</h3><div class="meta">📍 ${esc(h.city)}</div><p>${h.facilities.map(x=>`<span class="tag">${esc(x)}</span>`).join("")}</p><div class="card-footer"><span class="price">${money(h.price)} <small>/ night</small></span><a class="btn btn-small" href="booking.html?hotel=${encodeURIComponent(h.name)}">Book</a></div></div></article>`}
function renderHome(){const d=document.getElementById("homeDestinations");if(d)d.innerHTML=destinations.slice(0,6).map(destCard).join("");const p=document.getElementById("homePackages");if(p)p.innerHTML=packages.slice(0,3).map(packageCard).join("")}
function renderDestinations(){const q=new URLSearchParams(location.search).get("search");if(q&&document.getElementById("destSearch"))document.getElementById("destSearch").value=q;filterDestinations()}
function mapsSearchUrl(q){return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(q+" India")}
function searchAnywhere(q){q=(q||"").trim();if(!q){alert("Please enter a city, place or destination.");return}window.open(mapsSearchUrl(q),"_blank")}
function dynamicPlaceCard(place){
  const name=place.display_name.split(",")[0]||"Unknown place";
  const address=place.display_name;
  const lat=place.lat,lon=place.lon;
  const map="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(lat+","+lon);
  return `<article class="card dynamic-place"><div class="dynamic-map"><span>📍</span><small>India location</small></div><div class="card-body"><span class="tag">🌍 Anywhere Search</span><h3>${esc(name)}</h3><div class="meta">📍 ${esc(address)}</div><p class="card-desc">This place was found live from the map search. You can explore its location and nearby attractions on Google Maps.</p><div class="card-footer"><span class="price">Explore place</span><a class="btn btn-small" target="_blank" rel="noopener" href="${map}">Open Map</a></div></div></article>`;
}
function anywhereResult(q,loading=false){
  const safe=esc(q);
  return `<div class="anywhere-panel"><div class="anywhere-icon">🌍</div><div class="anywhere-copy"><span class="eyebrow dark">SEARCH ANYWHERE</span><h3>${loading?`Searching India for "${safe}"...`:`Can't find "${safe}" in our curated list?`}</h3><p>${loading?`We're looking for matching cities, towns and places across India.`:`No problem! Ghumo India can search India-wide map data, so users are not limited to the destinations manually added by the admin.`}</p>${loading?`<div class="search-loader">Finding places...</div>`:`<div class="anywhere-actions"><a class="btn" target="_blank" rel="noopener" href="${mapsSearchUrl(q)}">📍 Open broad Google Maps search</a><button class="btn btn-outline" onclick="document.getElementById('destSearch').value='';filterDestinations()">Clear Search</button></div>`}</div></div>`;
}
let destinationSearchTimer;
async function searchIndiaPlaces(query){
  const q=(query||"").trim();
  const box=document.getElementById("destinationGrid");
  if(!box||q.length<2)return;
  box.innerHTML=anywhereResult(q,true);
  try{
    const url="https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=12&countrycodes=in&q="+encodeURIComponent(q);
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),7000);const res=await fetch(url,{signal:controller.signal});clearTimeout(timeout);
    if(!res.ok)throw new Error("search failed");
    const places=await res.json();
    if(places.length){
      const curated=destinations.filter(d=>(d.name+" "+d.state).toLowerCase().includes(q.toLowerCase()));
      box.innerHTML=`<div class="search-results-head"><div><span class="eyebrow dark">LIVE INDIA SEARCH</span><h3>Places matching "${esc(q)}"</h3><p>Curated Ghumo India results and live map results are shown together.</p></div><span class="result-count">${places.length} map result(s)</span></div>`+curated.map(destCard).join("")+places.map(dynamicPlaceCard).join("")+`<div class="map-credit">Map results provided using OpenStreetMap data. Google Maps links open in a new tab.</div>`;
    }else{
      box.innerHTML=anywhereResult(q,false)+`<div class="panel no-results"><h3>No exact India map result found</h3><p class="muted">Try a city, state, landmark or a slightly different spelling.</p></div>`;
    }
  }catch(err){
    box.innerHTML=`${anywhereResult(q,false)}<div class="panel no-results"><h3>Live search is unavailable right now</h3><p class="muted">You can still open this place directly on Google Maps.</p><a class="btn" target="_blank" rel="noopener" href="${mapsSearchUrl(q)}">📍 Search ${esc(q)} on Google Maps</a></div>`;
  }
}
function filterDestinations(){
  const box=document.getElementById("destinationGrid");if(!box)return;
  const raw=(document.getElementById("destSearch")?.value||"").trim();
  const s=raw.toLowerCase();
  const r=document.getElementById("regionFilter")?.value||"",c=document.getElementById("categoryFilter")?.value||"";
  if(s.length>=2&&!r&&!c){clearTimeout(destinationSearchTimer);destinationSearchTimer=setTimeout(()=>searchIndiaPlaces(raw),350);return;}
  const list=destinations.filter(d=>(!s||(d.name+" "+d.state).toLowerCase().includes(s))&&(!r||d.region===r)&&(!c||d.categories.includes(c)));
  box.innerHTML=list.length?list.map(destCard).join(""):(s?anywhereResult(raw,false):`<div class="panel"><h3>No destinations found</h3><p class="muted">Try another search or filter.</p></div>`);
}
function renderDestinationDetails(){const id=Number(new URLSearchParams(location.search).get("id"))||1,d=destinations.find(x=>x.id===id)||destinations[0];document.title=d.name+" | Ghumo India";document.getElementById("destinationDetails").innerHTML=`<section class="detail-hero"><div class="container"><div class="detail-grid"><img class="detail-image" src="${d.image}" alt="${esc(d.name)}"><div class="detail-panel"><span class="tag">${esc(d.region)} India</span><span class="tag">⭐ ${d.rating}</span><h1>${esc(d.name)}</h1><p>${esc(d.description)}</p><div class="info-grid"><div class="info-box"><small>Best Time</small><b>${esc(d.bestTime)}</b></div><div class="info-box"><small>Estimated Budget</small><b>${esc(d.budget)}</b></div></div><h3>Top attractions</h3><ul class="attractions">${d.attractions.map(a=>`<li>✓ ${esc(a)}</li>`).join("")}</ul><div class="actions"><a class="btn" href="packages.html">View Packages</a><button class="btn" onclick="toggleWish(${d.id})">♡ Save</button></div><a class="btn map-btn" target="_blank" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.name+" India")}">📍 Open in Google Maps</a></div></div></div></section>`;document.getElementById("detailReviews").innerHTML=reviews.map(r=>`<div class="review"><div class="stars">${"★".repeat(r[1])}${"☆".repeat(5-r[1])}</div><p>“${esc(r[2])}”</p><b>${esc(r[0])}</b><small>Verified traveler</small></div>`).join("")}
function renderPackages(){const box=document.getElementById("packageGrid");if(box)box.innerHTML=packages.map(packageCard).join("")}
function renderPackageDetails(){const id=Number(new URLSearchParams(location.search).get("id"))||101,p=packages.find(x=>x.id===id)||packages[0];document.getElementById("packageDetails").innerHTML=`<div class="package-detail"><img src="${p.image}" alt="${esc(p.name)}"><div class="detail-panel"><span class="tag">${esc(p.duration)}</span><h1>${esc(p.name)}</h1><p>${esc(p.description)}</p><div class="price">${money(p.price)} <small>/ person</small></div><h3>Package includes</h3><p>${p.includes.map(x=>`<span class="tag">✓ ${esc(x)}</span>`).join("")}</p><div class="itinerary"><h3>Itinerary</h3>${p.itinerary.map(x=>`<div class="day"><b>${esc(x[0])} — ${esc(x[1])}</b><div>${esc(x[2])}</div></div>`).join("")}</div><a class="btn" href="booking.html?package=${p.id}">Book This Package</a></div></div>`}
function renderHotels(){filterHotels()}
function filterHotels(){const box=document.getElementById("hotelGrid");if(!box)return;const s=(document.getElementById("hotelSearch")?.value||"").toLowerCase(),c=document.getElementById("hotelCategory")?.value||"";const list=hotels.filter(h=>(!s||(h.name+" "+h.city).toLowerCase().includes(s))&&(!c||h.type===c));box.innerHTML=list.length?list.map(hotelCard).join(""):`<div class="panel"><h3>No hotels found</h3><p class="muted">Try another search.</p></div>`}
function homeSearch(e){
  e.preventDefault();
  const q=document.getElementById("homeSearch").value.trim();
  if(!q){location.href="destinations.html";return}
  location.href="destinations.html?search="+encodeURIComponent(q);
}
function toggleWish(id){let w=JSON.parse(localStorage.getItem("wishlist")||"[]");w=w.includes(id)?w.filter(x=>x!==id):[...w,id];localStorage.setItem("wishlist",JSON.stringify(w));alert(w.includes(id)?"Added to wishlist ❤️":"Removed from wishlist")}
function setupBooking(){const qs=new URLSearchParams(location.search),pid=Number(qs.get("package"))||101,p=packages.find(x=>x.id===pid)||packages[0];window.bookingPackage=p;document.getElementById("bookingPackage").innerHTML=`<b>${esc(p.name)}</b><br><span class="muted">${esc(p.duration)} · ${money(p.price)} per person</span>`;updateTotal()}
function updateTotal(){if(!window.bookingPackage)return;const a=Number(document.getElementById("adults")?.value||1),c=Number(document.getElementById("children")?.value||0);document.getElementById("bookingTotal").textContent=money((a+c)*window.bookingPackage.price)}
function submitBooking(e){e.preventDefault();const b={id:"GI"+Date.now().toString().slice(-7),package:window.bookingPackage.name,date:document.getElementById("travelDate").value,people:Number(document.getElementById("adults").value)+Number(document.getElementById("children").value),amount:document.getElementById("bookingTotal").textContent,name:document.getElementById("bookName").value};let arr=JSON.parse(localStorage.getItem("bookings")||"[]");arr.unshift(b);localStorage.setItem("bookings",JSON.stringify(arr));document.getElementById("modal").classList.remove("hidden");document.getElementById("modal").innerHTML=`<div class="modal-box"><div style="font-size:3rem">🎉</div><h2>Booking Confirmed!</h2><p>Your demo booking <b>${b.id}</b> has been saved locally.</p><p>${esc(b.package)} · ${esc(b.date)} · ${b.people} traveler(s)</p><h3 style="color:var(--green)">${b.amount}</h3><a class="btn" href="dashboard.html">Go to My Trips</a></div>`}
function register(e){e.preventDefault();const name=document.getElementById("regName").value,email=document.getElementById("regEmail").value,password=document.getElementById("regPassword").value;localStorage.setItem("user",JSON.stringify({name,email,password}));document.getElementById("authMessage").innerHTML='<div class="alert">Account created! Redirecting...</div>';setTimeout(()=>location.href="dashboard.html",700)}
function login(e){e.preventDefault();const email=document.getElementById("loginEmail").value,password=document.getElementById("loginPassword").value,u=JSON.parse(localStorage.getItem("user")||"null");if(u&&u.email===email&&u.password===password){location.href="dashboard.html"}else if(email==="admin@ghumoindia.com"&&password==="Admin@123"){location.href="admin-dashboard.html"}else{document.getElementById("authMessage").innerHTML='<div class="alert">Demo login: first register an account, or use admin@ghumoindia.com / Admin@123.</div>'}}
function logout(){localStorage.removeItem("user");location.href="index.html"}
function loadDashboard(){const u=JSON.parse(localStorage.getItem("user")||"null");document.getElementById("welcomeUser").textContent=u?`Welcome, ${u.name} 👋`:"Welcome, Traveler 👋";const b=JSON.parse(localStorage.getItem("bookings")||"[]"),w=JSON.parse(localStorage.getItem("wishlist")||"[]");document.getElementById("tripCount").textContent=b.length;document.getElementById("wishCount").textContent=w.length;document.getElementById("myBookings").innerHTML=b.length?b.map(x=>`<div class="panel" style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;gap:10px"><b>${esc(x.id)}</b><span class="status confirmed">Confirmed</span></div><h3>${esc(x.package)}</h3><p class="muted">📅 ${esc(x.date)} · 👥 ${x.people} traveler(s) · <b>${esc(x.amount)}</b></p></div>`).join(""):`<div class="panel"><h3>No trips yet</h3><p class="muted">Start exploring destinations and book your first adventure.</p><a class="btn" href="packages.html">Explore Packages</a></div>`}
document.addEventListener("DOMContentLoaded",()=>{if(document.getElementById("homeDestinations"))renderHome()})
