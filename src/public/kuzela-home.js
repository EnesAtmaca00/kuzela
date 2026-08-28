const ORDER_URL = 'https://kuzelathebowlhouse.itsready.be/nl';

const products = [
  ['Stel je eigen pokébowl', 'Medium · volledig naar jouw smaak', '€13.80', '7279ae_52a6f8b25760418c9a5e142710023d92~mv2.jpg'],
  ['Quesadilla Spicy Kip', 'Gegrild · kaas · groenten', '€13.80', '7279ae_a4140ebf5c2d45449af95f04135ebdd6~mv2.jpg'],
  ['Honey BBQ-wings bowl', 'Rijst · sesam · lente-ui', '€10.00', '7279ae_19b63a8c65ac487b9ba033d2ff0baeb7~mv2.png'],
  ['Wrap kip', 'Vers gerold · royaal gevuld', '€10.90', '7279ae_05f19c04217a4256b380778535b53ed8~mv2.png'],
  ['Calamares', 'Krokant · limoen · tartaarsaus', '€8.00', '7279ae_7f340f6097b24c93a9ff63d58aaacf08~mv2.jpg'],
  ["Mini loempia's", 'Goudbruin · sweet chilli', '€5.80', '7279ae_7bac18e268934a5f9093b3fc807d8d75~mv2.jpg']
];

const cards = products.map(([name, note, price, image], index) => `
  <article class="product reveal" style="--delay:${index * 70}ms">
    <a href="${ORDER_URL}" target="_top" aria-label="Bestel ${name}">
      <div class="photo">
        <img src="https://static.wixstatic.com/media/${image}" alt="${name} bij Kuzela The Bowl House" loading="lazy">
        <span>0${index + 1}</span>
      </div>
      <div class="product-copy"><div><h3>${name}</h3><p>${note}</p></div><strong>${price}</strong></div>
    </a>
  </article>`).join('');

class KuzelaHome extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host{--ink:#11120f;--paper:#f1eddf;--paper2:#e6dfcf;--white:#fffdf7;--lime:#d9f24f;--orange:#ff6b35;--line:rgba(17,18,15,.16);display:block;width:100%;min-height:100%;color:var(--ink);background:var(--paper);font-family:Inter,Avenir,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
        *{box-sizing:border-box}html{scroll-behavior:smooth}a{color:inherit;text-decoration:none}img{display:block;width:100%}h1,h2,h3,p{margin-top:0}.site{overflow:hidden;background:var(--paper)}.wrap{width:min(100% - 48px,1440px);margin-inline:auto}
        .topbar{position:sticky;top:0;z-index:30;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;min-height:84px;padding:0 clamp(24px,4vw,68px);border-bottom:1px solid rgba(255,255,255,.2);color:var(--white);background:rgba(17,18,15,.86);backdrop-filter:blur(18px) saturate(135%)}
        .brand{font-size:clamp(21px,2vw,30px);font-weight:900;letter-spacing:0;text-transform:uppercase}.nav{display:flex;gap:28px;font-size:13px;font-weight:700}.nav a{opacity:.76;transition:opacity .25s}.nav a:hover{opacity:1}.top-action{justify-self:end}
        .pill{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 24px;border:1px solid currentColor;border-radius:999px;font-size:13px;font-weight:800;transition:transform .35s cubic-bezier(.22,1,.36,1),background .25s,color .25s}.pill:hover{transform:translateY(-3px)}.lime{border-color:var(--lime);background:var(--lime);color:var(--ink)}.dark{border-color:var(--ink);background:var(--ink);color:var(--white)}
        .hero{position:relative;min-height:910px;display:grid;align-items:end;margin-top:-84px;padding:150px clamp(24px,5vw,80px) 70px;color:var(--white);background-color:var(--ink);background-image:linear-gradient(90deg,rgba(17,18,15,1) 0%,rgba(17,18,15,.98) 38%,rgba(17,18,15,.48) 66%,rgba(17,18,15,.12) 100%),url('https://static.wixstatic.com/media/7279ae_05f19c04217a4256b380778535b53ed8~mv2.png');background-position:center,78% center;background-size:cover,auto 72%;background-repeat:no-repeat}.hero-content{position:relative;z-index:1;max-width:1120px}.eyebrow{margin:0 0 22px;font-size:12px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}
        h1{max-width:1100px;margin-bottom:30px;font-size:clamp(72px,10.4vw,166px);font-weight:900;letter-spacing:0;line-height:.82;text-wrap:balance}.hero-bottom{display:flex;align-items:end;justify-content:space-between;gap:40px}.hero-copy{max-width:560px;margin:0;color:rgba(255,255,255,.84);font-size:clamp(17px,1.6vw,22px);line-height:1.48}.hero-buttons{display:flex;gap:12px;flex-wrap:wrap}
        .ticker{display:flex;width:max-content;padding:22px 0;background:var(--lime);border-block:1px solid var(--ink);animation:ticker 24s linear infinite}.ticker span{padding-right:42px;font-size:clamp(22px,2.8vw,44px);font-weight:900;letter-spacing:-.045em;white-space:nowrap}.ticker i{padding-left:42px;font-family:Georgia,serif;font-weight:400}@keyframes ticker{to{transform:translateX(-50%)}}
        .intro{display:grid;grid-template-columns:.72fr 1.28fr;gap:clamp(48px,8vw,140px);padding-block:clamp(100px,13vw,200px)}.intro h2,.menu-head h2,.story h2,.location h2{margin-bottom:0;font-size:clamp(52px,7.2vw,112px);font-weight:850;letter-spacing:-.072em;line-height:.88;text-wrap:balance}.intro-copy{align-self:end}.intro-copy p{max-width:610px;margin-bottom:34px;font-size:clamp(18px,1.8vw,25px);line-height:1.55}
        .proofs{display:grid;grid-template-columns:repeat(3,1fr);border-block:1px solid var(--line)}.proof{min-height:250px;padding:42px clamp(24px,4vw,60px);border-right:1px solid var(--line)}.proof:last-child{border-right:0}.proof span{display:block;margin-bottom:70px;font-size:12px;font-weight:850;letter-spacing:.16em}.proof h3{margin-bottom:12px;font-size:clamp(24px,2.4vw,38px);letter-spacing:-.045em}.proof p{margin:0;max-width:34ch;color:rgba(17,18,15,.68);line-height:1.55}
        .menu{padding-block:clamp(110px,12vw,190px);background:var(--white)}.menu-head{display:flex;align-items:end;justify-content:space-between;gap:48px;margin-bottom:72px}.menu-head h2{max-width:800px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.product{border:1px solid var(--line);border-radius:28px;overflow:hidden;background:var(--paper);transition:transform .55s cubic-bezier(.22,1,.36,1),box-shadow .55s}.product:hover{transform:translateY(-10px);box-shadow:0 28px 70px rgba(18,18,14,.14)}.photo{position:relative;aspect-ratio:4/3;overflow:hidden;background:var(--paper2)}.photo img{height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.22,1,.36,1)}.product:hover img{transform:scale(1.045)}.photo span{position:absolute;top:18px;left:18px;display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:var(--lime);font-size:12px;font-weight:900}.product-copy{display:flex;align-items:start;justify-content:space-between;gap:20px;padding:25px}.product-copy h3{margin-bottom:7px;font-size:clamp(20px,1.8vw,29px);letter-spacing:-.045em;line-height:1}.product-copy p{margin:0;color:rgba(17,18,15,.62);font-size:14px;line-height:1.4}.product-copy strong{flex:none;font-size:17px}
        .story{display:grid;grid-template-columns:1.08fr .92fr;min-height:820px;background:var(--ink);color:var(--white)}.story-media{min-height:650px;background:linear-gradient(180deg,transparent 62%,rgba(0,0,0,.35)),url('https://static.wixstatic.com/media/7279ae_1ebe510677b948b7aefb6c46fd06f577~mv2.jpg') center/cover no-repeat}.story-copy{display:flex;flex-direction:column;justify-content:space-between;padding:clamp(56px,7vw,110px)}.story h2{font-size:clamp(50px,6.2vw,98px)}.story-bottom{max-width:550px}.story-bottom p{color:rgba(255,255,255,.72);font-size:19px;line-height:1.6}
        .location{padding-block:clamp(110px,14vw,220px);background:var(--orange)}.location-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:80px;align-items:end}.location h2{max-width:900px}.location-card{padding:36px;border:1px solid var(--ink);border-radius:28px;background:rgba(255,255,255,.18)}.location-card p{margin-bottom:9px;font-size:18px}.location-card strong{display:block;margin:28px 0;font-size:clamp(28px,3vw,46px);letter-spacing:-.05em;line-height:1}
        .closing{padding:clamp(90px,11vw,170px) 24px;text-align:center;background:var(--lime)}.closing h2{max-width:1200px;margin:0 auto 42px;font-size:clamp(66px,10vw,158px);font-weight:900;letter-spacing:-.085em;line-height:.8}.closing .pill{min-height:58px;padding-inline:34px}footer{display:flex;justify-content:space-between;gap:30px;padding:40px clamp(24px,5vw,80px);background:var(--ink);color:rgba(255,255,255,.66);font-size:13px}footer strong{color:var(--white)}
        .reveal{opacity:0;transform:translateY(28px);transition:opacity .8s ease var(--delay,0ms),transform .8s cubic-bezier(.22,1,.36,1) var(--delay,0ms)}.reveal.visible{opacity:1;transform:none}
        @media(max-width:900px){.wrap{width:min(100% - 36px,1440px)}.topbar{grid-template-columns:1fr auto;min-height:72px;padding-inline:18px}.nav{display:none}.brand{font-size:20px}.top-action{min-height:42px;padding-inline:17px;font-size:12px}.hero{min-height:790px;margin-top:-72px;padding:120px 18px 34px;background-image:linear-gradient(180deg,rgba(17,18,15,.35),rgba(17,18,15,.96) 74%),url('https://static.wixstatic.com/media/7279ae_05f19c04217a4256b380778535b53ed8~mv2.png');background-position:center,70% 18%;background-size:cover,auto 55%;background-repeat:no-repeat}h1{font-size:clamp(66px,20vw,104px)}.hero-bottom{display:block}.hero-copy{max-width:92%;margin-bottom:26px;font-size:17px}.intro{grid-template-columns:1fr;gap:38px;padding-block:100px}.proofs{grid-template-columns:1fr}.proof{min-height:auto;border-right:0;border-bottom:1px solid var(--line)}.proof:last-child{border-bottom:0}.proof span{margin-bottom:38px}.menu{padding-block:100px}.menu-head{display:block;margin-bottom:46px}.menu-head .pill{margin-top:28px}.grid{grid-template-columns:1fr}.story{grid-template-columns:1fr}.story-media{min-height:520px}.story-copy{min-height:680px;padding:70px 22px}.location-grid{grid-template-columns:1fr;gap:50px}.location-card{padding:28px}footer{flex-direction:column}}
        @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.reveal{opacity:1;transform:none}}
      </style>
      <main class="site">
        <header class="topbar"><a class="brand" href="#top">Kuzela</a><nav class="nav" aria-label="Hoofdnavigatie"><a href="#menu">Menu</a><a href="#over">Over ons</a><a href="#locatie">Locatie</a></nav><a class="pill lime top-action" href="${ORDER_URL}" target="_top">Bestel nu</a></header>
        <section class="hero" id="top"><div class="hero-content"><p class="eyebrow">VERS GEMAAKT · LAAKDAL</p><h1>Jouw bowl.<br>Jouw smaak.</h1><div class="hero-bottom"><p class="hero-copy">Pokébowls, quesadilla’s, wraps, broodjes en wings. Vers bereid, royaal gevuld en klaar wanneer jij dat bent.</p><div class="hero-buttons"><a class="pill lime" href="${ORDER_URL}" target="_top">Bestel online</a><a class="pill" href="#menu">Ontdek het menu</a></div></div></div></section>
        <div class="ticker" aria-hidden="true"><span>VERS GEMAAKT <i>·</i> JIJ KIEST <i>·</i> VOL SMAAK <i>·</i> LAAKDAL <i>·</i></span><span>VERS GEMAAKT <i>·</i> JIJ KIEST <i>·</i> VOL SMAAK <i>·</i> LAAKDAL <i>·</i></span></div>
        <section class="intro wrap" id="over"><div><p class="eyebrow">KUZELA THE BOWL HOUSE</p><h2>Geen standaard fastfood.</h2></div><div class="intro-copy reveal"><p>Goede ingrediënten, stevige porties en combinaties die je zelf samenstelt. Eenvoudig bestellen, vers bereid en precies zoals jij het wilt.</p><a class="pill dark" href="#menu">Waar heb je zin in?</a></div></section>
        <section class="proofs"><article class="proof"><span>01</span><h3>Jij kiest</h3><p>Stel je eigen bowl samen of kies een vaste favoriet.</p></article><article class="proof"><span>02</span><h3>Wij maken</h3><p>Je bestelling wordt pas bereid wanneer jij bestelt.</p></article><article class="proof"><span>03</span><h3>Direct genieten</h3><p>Afhalen of bezorgen: kies wat voor jou het makkelijkst is.</p></article></section>
        <section class="menu" id="menu"><div class="wrap"><div class="menu-head"><div><p class="eyebrow">POPULAIRE KEUZES</p><h2>Vandaag op je verlanglijst.</h2></div><a class="pill dark" href="${ORDER_URL}" target="_top">Bekijk alles</a></div><div class="grid">${cards}</div></div></section>
        <section class="story"><div class="story-media" role="img" aria-label="Vers broodje van Kuzela"></div><div class="story-copy"><div><p class="eyebrow">OVER KUZELA</p><h2>Simpel voelt. Allesbehalve simpel smaakt.</h2></div><div class="story-bottom"><p>Midden in Laakdal maken we eten zonder gedoe: uitgesproken smaken, verse ingrediënten en genoeg keuze voor ieder moment.</p><a class="pill lime" href="${ORDER_URL}" target="_top">Proef Kuzela</a></div></div></section>
        <section class="location" id="locatie"><div class="wrap location-grid"><div><p class="eyebrow">KOM LANGS</p><h2>Jouw volgende bowl wacht in Laakdal.</h2></div><aside class="location-card"><p>Kuzela The Bowl House</p><strong>Markt 23<br>2430 Laakdal</strong><p>Afhalen en bezorging beschikbaar.</p></aside></div></section>
        <section class="closing"><p class="eyebrow">KLAAR OM TE KIEZEN?</p><h2>Bestel. Proef. Herhaal.</h2><a class="pill dark" href="${ORDER_URL}" target="_top">Bestel bij Kuzela</a></section>
        <footer><strong>KUZELA THE BOWL HOUSE</strong><span>Markt 23 · 2430 Laakdal</span><span>© ${new Date().getFullYear()} Kuzela</span></footer>
      </main>`;

    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12 });
    root.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  }
}

if (!customElements.get('kuzela-home')) customElements.define('kuzela-home', KuzelaHome);
