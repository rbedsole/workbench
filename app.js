const seed={systems:[
{id:"baseline",name:"Core Experience",desc:"The rules that define how Delta Emerald should feel."},
{id:"traversal",name:"Traversal",desc:"How the player moves through Hoenn with Pokémon."},
{id:"encounters",name:"Encounters & Catching",desc:"Wild encounters, followers and catching behavior."},
{id:"shiny",name:"Shiny System",desc:"Visibility, odds and notification behavior."},
{id:"world",name:"World & Time",desc:"Real-time world systems, outbreaks and time control."},
{id:"pokemon",name:"Pokémon & Progression",desc:"Availability, scaling, movement and Pokédex progression."},
{id:"party",name:"Party & Followers",desc:"How the active party interacts with the overworld."}
],decisions:[
{id:"modern",system:"baseline",title:"Modern mechanics baseline",status:"Decided",text:"Use modern Pokémon mechanics by default while offering classic-style options where practical.",affects:["simple","scaling","availability"]},
{id:"simple",system:"baseline",title:"Keep the single-player experience focused",status:"Decided",text:"Prefer simple, coherent systems over piling on mechanics just because they are possible. Build the basic Pokémon game first.",affects:["slots","hordes","interaction"]},
{id:"autoheal",system:"baseline",title:"Contextual auto healing",status:"Decided",text:"Automatically heal the party when it makes sense while preserving options for a more classic experience.",affects:[]},
{id:"options",system:"baseline",title:"Modern and classic options",status:"Decided",text:"Provide options for both modern and classic-style play where the systems support it.",affects:["shinyalerts","odds","scaling"]},
{id:"slots",system:"traversal",title:"Three traversal Pokémon slots",status:"Decided",text:"Use designated flying, climbing and swimming slots with eligible Pokémon filtered for each role.",affects:["auto"]},
{id:"auto",system:"traversal",title:"Automatic traversal selection",status:"Decided",text:"When traversal is required, automatically use the Pokémon assigned to the appropriate traversal slot.",affects:[]},
{id:"movement",system:"traversal",title:"Pokémon-based movement speed",status:"Decided",text:"Traversal movement speed is based on the Pokémon being used.",affects:["slots"]},
{id:"bike",system:"traversal",title:"Pokémon and bike travel",status:"Decided",text:"Keep bike travel available while allowing suitable Pokémon to cover traversal behaviors such as hopping and slopes.",affects:[]},
{id:"hordes",system:"encounters",title:"Hordes remain grass encounters",status:"Decided",text:"Horde encounters are tied to grass encounters rather than appearing as overworld groups.",affects:[]},
{id:"throw",system:"encounters",title:"Overworld surprise throw",status:"Decided",text:"Throwing a Poké Ball at an unaware wild Pokémon gives an increased capture chance on the first turn.",affects:["simple"]},
{id:"interaction",system:"encounters",title:"Simple environmental interactions",status:"Decided",text:"Use a simple contextual interaction approach rather than creating a large collection of separate environmental mechanics.",affects:[]},
{id:"visible",system:"shiny",title:"Shinies visible in the overworld",status:"Decided",text:"Shiny Pokémon are visibly shiny before battle.",affects:["odds","shinyalerts"]},
{id:"shinyalerts",system:"shiny",title:"Configurable shiny notifications",status:"Decided",text:"Shiny encounters can trigger notifications, with options controlling how those notifications behave.",affects:[]},
{id:"odds",system:"shiny",title:"Configurable shiny odds",status:"Decided",text:"Offer shiny odds from 1/256 through 1/8192, with 1/4096 as the default.",affects:[]},
{id:"outbreaks",system:"world",title:"Real-time daily outbreaks",status:"Decided",text:"Outbreaks operate on a real-time daily schedule, can be manipulated with safeguards, and appear as a map icon that opens outbreak information.",affects:[]},
{id:"timeofday",system:"world",title:"Controllable time of day",status:"Decided",text:"Time continues to pass normally, but an item can change the current time of day.",affects:[]},
{id:"availability",system:"pokemon",title:"All Pokémon obtainable",status:"Decided",text:"Make the full intended Pokémon roster obtainable within the game.",affects:[]},
{id:"scaling",system:"pokemon",title:"Limited level scaling",status:"Decided",text:"Use level scaling in a limited form rather than scaling the entire game freely around the player.",affects:[]},
{id:"gyms",system:"pokemon",title:"Later-generation evolutions for Gym teams",status:"Decided",text:"Gym Leaders may use later-generation evolutions when they fit the intended level range; otherwise reserve them for rematches or postgame.",affects:[]},
{id:"pokedex",system:"pokemon",title:"Pokédex knowledge grows over time",status:"Decided",text:"Pokédex information expands as the player learns more, with richer Pokémon-specific entries.",affects:[]},
{id:"hotbar",system:"party",title:"Party hotbar",status:"Decided",text:"Use an overworld hotbar to cycle the active party Pokémon. Cycling recalls the current follower and sends out the newly selected Pokémon.",affects:["battlelead"]},
{id:"battlelead",system:"party",title:"Active follower enters battle",status:"Decided",text:"Throwing the active Pokémon in the overworld sends that selected Pokémon into battle.",affects:[]}
]};

function migrate(saved){
 if(!saved)return structuredClone(seed);
 const systemsById=new Map((saved.systems||[]).map(x=>[x.id,x]));
 const decisionsById=new Map((saved.decisions||[]).map(x=>[x.id,x]));
 const migrated={
  systems:seed.systems.map(s=>({...structuredClone(s),...(systemsById.get(s.id)||{})})),
  decisions:[...(saved.decisions||[]).filter(d=>!seed.decisions.some(s=>s.id===d.id)),...seed.decisions.map(d=>{const prior=decisionsById.get(d.id);return prior?{...structuredClone(d),...prior}:structuredClone(d)})]
 };
 localStorage.setItem("workbench-data",JSON.stringify(migrated));
 return migrated;
}
let data=migrate(JSON.parse(localStorage.getItem("workbench-data")||"null"));let current=null;
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
function save(){localStorage.setItem("workbench-data",JSON.stringify(data))}
function show(id){$$(".view").forEach(v=>v.classList.remove("active"));$("#"+id).classList.add("active");scrollTo(0,0)}
function counts(){$("#systemCount").textContent=data.systems.length+" systems";$("#decisionCount").textContent=data.decisions.length+" decisions"}
function systemName(id){return data.systems.find(s=>s.id===id)?.name||"Unknown system"}
function get(id){return data.decisions.find(d=>d.id===id)}
function render(){
 counts();
 $("#systemsPanel").innerHTML=data.systems.map(s=>{let ds=data.decisions.filter(d=>d.system===s.id);return '<button class="system-card" data-system="'+s.id+'"><strong>'+s.name+'</strong><small>'+s.desc+'</small><div class="system-meta">'+ds.length+' decisions · '+ds.filter(d=>d.status==="Decided").length+' decided</div></button>'}).join("");
 $("#decisionsPanel").innerHTML='<button class="primary add-btn" id="addDecision">+ Add Decision</button>'+data.decisions.map(card).join("");
 let impacted=data.decisions.filter(d=>d.affects.length);
 $("#impactPanel").innerHTML=impacted.map(d=>'<button class="impact-card" data-decision="'+d.id+'"><strong>'+d.title+'</strong><p>Changing this may affect '+d.affects.length+' decision'+(d.affects.length>1?'s':'')+': '+d.affects.map(x=>get(x)?.title||"Unknown decision").join(", ")+'</p></button>').join("")||'<div class="empty">No dependencies yet.</div>';
 bindCards();
 $("#addDecision").onclick=()=>decisionEditor();
}
function card(d){let c=d.status==="Exploring"?"exploring":d.status==="Needs Decision"?"needs":"";return '<button class="decision-card" data-decision="'+d.id+'"><span class="dot '+c+'"></span><div><strong>'+d.title+'</strong><small>'+systemName(d.system)+'</small><span class="status">'+d.status+'</span></div></button>'}
function bindCards(){
 $$("[data-decision]").forEach(b=>b.onclick=()=>detail(b.dataset.decision));
 $$("[data-system]").forEach(b=>b.onclick=()=>{let s=data.systems.find(x=>x.id===b.dataset.system);$("#systemsPanel").innerHTML='<button class="back" id="allSystems">‹ All systems</button><h2>'+s.name+'</h2><p style="color:#9aa7c1;margin:7px 0 18px">'+s.desc+'</p>'+data.decisions.filter(d=>d.system===s.id).map(card).join("");$("#allSystems").onclick=render;bindCards()});
}
function dependencyOptions(selected=[]){
 return data.decisions.map(x=>'<option value="'+x.id+'" '+(selected.includes(x.id)?"selected":"")+'>'+x.title+'</option>').join("");
}
function decisionEditor(id){
 const d=id?get(id):null;
 $("#detailBody").innerHTML='<span class="eyebrow">'+(d?"EDIT DECISION":"NEW DECISION")+'</span><h2 style="margin-top:7px">'+(d?d.title:"Add a decision")+'</h2><div class="detail-card"><label>Title</label><input id="decisionTitle" type="text" placeholder="What decision are we making?"><label>System</label><select id="decisionSystem">'+data.systems.map(s=>'<option value="'+s.id+'">'+s.name+'</option>').join("")+'</select><label>Status</label><select id="status"><option>Decided</option><option>Exploring</option><option>Needs Decision</option><option>Superseded</option></select><label>Decision</label><textarea id="decisionText" placeholder="Describe the current decision or direction."></textarea><label>Affects other decisions</label><select id="affects" multiple size="6">'+dependencyOptions(d?.affects||[])+'</select><small class="field-help">Tap the field to choose the decisions this may affect. You can select multiple. This is where the dependency graph is built.</small><button class="primary" id="saveDecision">'+(d?"Save change":"Create decision")+'</button></div>';
 if(d){$("#decisionTitle").value=d.title;$("#decisionSystem").value=d.system;$("#status").value=d.status;$("#decisionText").value=d.text}
 $("#saveDecision").onclick=()=>{
  const title=$("#decisionTitle").value.trim();if(!title){toast("Title is required");return}
  const affects=[...$("#affects").selectedOptions].map(o=>o.value).filter(x=>x!==id);
  if(d){d.title=title;d.system=$("#decisionSystem").value;d.status=$("#status").value;d.text=$("#decisionText").value.trim();d.affects=affects;save();render();toast("Decision saved");detail(id)}
  else{let base=title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40)||"decision";let newid=base;let n=2;while(data.decisions.some(x=>x.id===newid))newid=base+"-"+n++;data.decisions.push({id:newid,system:$("#decisionSystem").value,title,status:$("#status").value,text:$("#decisionText").value.trim(),affects});save();render();toast("Decision created");detail(newid)}
 };
 show("detail");
}
function detail(id){
 current=id;let d=get(id),deps=d.affects.map(get).filter(Boolean),incoming=data.decisions.filter(x=>x.affects.includes(id));
 $("#detailBody").innerHTML='<span class="eyebrow">'+systemName(d.system).toUpperCase()+'</span><h2 style="margin-top:7px">'+d.title+'</h2><button class="ghost edit-link" id="editDecision">Edit decision</button><div class="detail-card"><label>Status</label><select id="status"><option>Decided</option><option>Exploring</option><option>Needs Decision</option><option>Superseded</option></select><label>Decision</label><textarea id="decisionText"></textarea><button class="primary" id="saveDecision">Save change</button></div><div class="detail-card"><h3>Dependencies</h3>'+(deps.length?deps.map(x=>'<div class="impact-card"><strong>→ '+x.title+'</strong><p>May be affected if this decision changes.</p></div>').join(""):'<p class="empty">This decision currently affects nothing else.</p>')+(incoming.length?'<h3 style="margin-top:18px">Depends on this</h3>'+incoming.map(x=>'<div class="impact-card"><strong>← '+x.title+'</strong></div>').join(""):'')+'</div>';
 $("#status").value=d.status;$("#decisionText").value=d.text;
 $("#saveDecision").onclick=()=>{let old=d.text;d.status=$("#status").value;d.text=$("#decisionText").value.trim();save();render();toast(old!==d.text&&d.affects.length?"Saved · "+d.affects.length+" related decision"+(d.affects.length>1?"s":"")+" may be affected":"Saved");detail(id)};
 $("#editDecision").onclick=()=>decisionEditor(id);show("detail");
}
function toast(t){let e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2200)}
$$("[data-go]").forEach(b=>b.onclick=()=>show(b.dataset.go));$(".project-card").onclick=()=>{render();show("project")};
$$(".tab").forEach(b=>b.onclick=()=>{$$(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");$$(".panel").forEach(x=>x.classList.add("hidden"));$("#"+b.dataset.tab+"Panel").classList.remove("hidden")});
$("#resetBtn").onclick=()=>{data=structuredClone(seed);save();render();toast("Demo data reset")};render();