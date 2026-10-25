// Bus Apocalypse 3D : remplit la page depuis releases.json, vérifie le serveur, fait défiler la girouette.

const ARRETS = [
  "Terminus : Piton de la Fournaise",
  "Prochain arrêt : Ferme des Morel",
  "Via Cimetière des Pendus",
  "Via Côte des Naufragés",
  "Via Marais des Brumes",
  "Ne monte pas si tu es mordu"
];

function setAll(sel, text){
  document.querySelectorAll(sel).forEach(el => { el.textContent = text; });
}

async function chargerVersion(){
  try{
    const r = await fetch("releases.json?ts=" + Date.now(), {cache:"no-store"});
    if(!r.ok) throw new Error("releases.json introuvable");
    const d = await r.json();
    if(d.version) setAll("[data-version]", d.version);
    if(d.apk_size) setAll("[data-size]", d.apk_size);
    if(d.date) setAll("[data-date]", d.date);
    if(d.apk_url) document.querySelectorAll("[data-apk]").forEach(a => { a.href = d.apk_url; });
    afficherNouveautes((d.changelog && d.changelog[0] && d.changelog[0].items) || []);
    if(d.server_health_url) verifierServeur(d.server_health_url);
    else etatServeur(null, "Serveur en ligne : adresse non configurée");
  }catch(e){
    console.error(e);
    afficherNouveautes([]);
    etatServeur(null, "Serveur en ligne : impossible de lire la configuration");
  }
}

function afficherNouveautes(items){
  const ul = document.getElementById("changes");
  ul.innerHTML = "";
  if(!items.length){
    const li = document.createElement("li");
    li.textContent = "La liste des nouveautés arrive avec la prochaine version.";
    ul.appendChild(li);
    return;
  }
  items.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    ul.appendChild(li);
  });
}

function etatServeur(on, label){
  const p = document.getElementById("server");
  p.classList.toggle("on", on === true);
  p.classList.toggle("off", on === false);
  document.getElementById("server-label").textContent = label;
}

async function verifierServeur(url){
  try{
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 4000);
    const r = await fetch(url, {cache:"no-store", signal:ctl.signal, headers:{"ngrok-skip-browser-warning":"1"}});
    clearTimeout(t);
    if(!r.ok) throw new Error("hors ligne");
    etatServeur(true, "Serveur en ligne ouvert : amis, groupes, guildes et chat disponibles");
  }catch(e){
    etatServeur(false, "Serveur en ligne fermé pour le moment : le jeu solo marche quand même");
  }
}

function girouette(){
  const el = document.getElementById("girouette");
  if(!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let i = 0;
  setInterval(() => {
    i = (i + 1) % ARRETS.length;
    el.classList.remove("swap");
    void el.offsetWidth;
    el.textContent = ARRETS[i];
    el.classList.add("swap");
  }, 3200);
}

chargerVersion();
girouette();
