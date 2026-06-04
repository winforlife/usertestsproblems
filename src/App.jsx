import { useState, useRef } from "react";
import COLORS, { FONTS } from "./design-tokens.js";

// ── Staging mode — limit to 2 questions if not production ─────────────────────
const IS_PROD = import.meta.env.MODE === "production";
const CTA_REDIRECT_URL = import.meta.env.VITE_CTA_REDIRECT_URL || "#";

const AXES = [
  { id:"D1", label:"Clarté\nStratégique",   short:"Clarté stratégique",   color:COLORS.D1, sel:COLORS.D1_sel, pro:true  },
  { id:"D2", label:"Énergie &\nAlignement",  short:"Énergie & alignement",  color:COLORS.D2, sel:COLORS.D2_sel, pro:false },
  { id:"D3", label:"Relation au\nCollectif", short:"Relation au collectif", color:COLORS.D3, sel:COLORS.D3_sel, pro:true  },
  { id:"D4", label:"Rapport\nà Soi",          short:"Rapport à soi",         color:COLORS.D4, sel:COLORS.D4_sel, pro:false },
  { id:"D5", label:"Sens &\nVision",           short:"Sens & vision",         color:COLORS.D5, sel:COLORS.D5_sel, pro:false },
  { id:"D6", label:"Mani-\nfestation",         short:"Manifestation",         color:COLORS.D6, sel:COLORS.D6_sel, pro:true  },
];

const QUESTIONS = [
  { id:1,  axis:"D1", type:"choice", question:"Si vous deviez décrire votre état d'esprit du lundi matin en ce moment, ce serait plutôt :",
    options:[{text:"Je suis focus et je sais exactement où je vais.",score:5},{text:"J'ai mille choses à faire et je ne sais pas par où commencer.",score:1},{text:"Je fais ce qu'il faut, mais quelque chose me manque.",score:3},{text:"Je me pose des questions que je ne posais pas avant.",score:2},{text:"Je suis épuisé avant même d'avoir commencé.",score:1}]},
  { id:10, axis:"D3", type:"agree", positive:true,  statement:"Je peux exprimer mes doutes et mes difficultés à au moins une personne de mon cercle professionnel." },
  { id:18, axis:"D5", type:"agree", positive:true,  statement:"Ce que je construis a un sens qui dépasse le business — je sais pourquoi cela compte vraiment." },
  { id:5,  axis:"D2", type:"choice", question:"Où allez-vous chercher de l'énergie quand vous êtes à plat ?",
    options:[{text:"Dans l'action — avancer me recharge.",score:3},{text:"Dans le silence — j'ai besoin de me retrouver seul.",score:3},{text:"Dans les conversations avec les bonnes personnes.",score:3},{text:"Dans le sens — me reconnecter à pourquoi je fais tout ça.",score:5},{text:"Je ne sais pas vraiment. Je fonctionne jusqu'à ce que je n'en puisse plus.",score:1}]},
  { id:22, axis:"D6", type:"agree", positive:false, statement:"Je me retrouve souvent à recommencer les mêmes cycles sans que les choses n'avancent vraiment." },
  { id:2,  axis:"D1", type:"agree", positive:true,  statement:"Je sais exactement quelles sont mes trois priorités cette semaine — et pourquoi." },
  { id:15, axis:"D4", type:"agree", positive:true,  statement:"Je me fais confiance pour traverser les périodes d'incertitude sans perdre mon axe." },
  { id:11, axis:"D3", type:"agree", positive:false, statement:"Les tensions dans mon équipe ou avec mes associés prennent trop de place dans mon quotidien." },
  { id:6,  axis:"D2", type:"agree", positive:false, statement:"Il y a souvent un écart entre l'énergie que je dépense et les résultats que j'obtiens." },
  { id:17, axis:"D5", type:"choice", question:"Quand vous pensez à votre projet dans 3 ans, vous ressentez :",
    options:[{text:"De l'enthousiasme — j'ai une vision claire et j'y crois.",score:5},{text:"De l'incertitude — je ne sais pas encore où on va atterrir.",score:3},{text:"De la pression — les attentes sont lourdes.",score:2},{text:"Du doute — je me demande si c'est encore ce que je veux.",score:2},{text:"Du vide — j'ai du mal à me projeter.",score:1}]},
  { id:3,  axis:"D1", type:"agree", positive:false, statement:"Je remets souvent les mêmes décisions à plus tard, sans vraiment savoir pourquoi." },
  { id:21, axis:"D6", type:"agree", positive:true,  statement:"Je passe facilement de l'intention à l'action concrète — sans me perdre en route." },
  { id:9,  axis:"D3", type:"choice", question:"Dans votre entourage professionnel proche, vous vous sentez :",
    options:[{text:"Bien entouré et compris. Je peux parler de ce que je vis vraiment.",score:5},{text:"Entouré, mais seul sur les vraies questions.",score:3},{text:"Isolé. Le rôle que j'occupe crée une distance.",score:1},{text:"Variable. Des moments de vraie connexion, et d'autres de grande solitude.",score:2},{text:"Je fonctionne surtout seul. C'est comme ça depuis le début.",score:2}]},
  { id:7,  axis:"D2", type:"agree", positive:true,  statement:"Je me sens globalement aligné entre ce que je fais, ce que je pense et ce que je veux vraiment." },
  { id:13, axis:"D4", type:"agree", positive:true,  statement:"Je reconnais facilement quand mes réactions sont guidées par la peur plutôt que par le choix." },
  { id:19, axis:"D5", type:"agree", positive:false, statement:"Je me sens parfois à la croisée des chemins — ce qui m'a mené jusqu'ici ne suffit peut-être plus pour la suite." },
  { id:25, axis:"D1", type:"agree", positive:false, statement:"J'ai souvent l'impression de travailler beaucoup sans avancer vraiment dans la bonne direction." },
  { id:30, axis:"D6", type:"agree", positive:false, statement:"J'ai souvent des idées ou des projets qui démarrent bien mais que je n'arrive pas à mener jusqu'au bout." },
  { id:14, axis:"D4", type:"agree", positive:false, statement:"J'ai tendance à reproduire les mêmes patterns dans mes relations professionnelles, même quand je veux faire autrement." },
  { id:8,  axis:"D2", type:"agree", positive:false, statement:"Certains matins, je me demande si tout cela en vaut vraiment la peine." },
  { id:12, axis:"D3", type:"agree", positive:true,  statement:"Je sais m'entourer de personnes qui me challengent vraiment — pas seulement de personnes qui m'approuvent." },
  { id:20, axis:"D5", type:"agree", positive:true,  statement:"Je sens qu'il y a quelque chose de plus grand que mon projet actuel qui cherche à s'exprimer à travers moi." },
  { id:16, axis:"D4", type:"agree", positive:false, statement:"Il m'arrive de prendre des décisions pour éviter un conflit plutôt que parce qu'elles sont justes pour moi." },
  { id:4,  axis:"D1", type:"agree", positive:true,  statement:"Quand une nouvelle opportunité se présente, je sais rapidement si elle est alignée avec ma direction ou non." },
  { id:26, axis:"D2", type:"agree", positive:true,  statement:"Je sais reconnaître les signaux que mon corps m'envoie quand je suis hors de mon axe." },
  { id:23, axis:"D6", type:"agree", positive:true,  statement:"Ce que je produis dans le monde correspond à ce que je me sens capable de produire." },
  { id:29, axis:"D5", type:"agree", positive:false, statement:"Il m'arrive de me demander si ce que je fais correspond vraiment à qui je suis profondément." },
  { id:27, axis:"D3", type:"agree", positive:false, statement:"Je porte souvent des responsabilités collectives que je n'arrive pas vraiment à partager ou à déléguer." },
  { id:28, axis:"D4", type:"agree", positive:true,  statement:"Quand quelque chose ne va pas, je suis capable d'en identifier la source en moi plutôt que de la chercher uniquement à l'extérieur." },
  { id:24, axis:"D6", type:"choice", question:"Où en êtes-vous dans votre projet en ce moment ?",
    options:[{text:"Je tourne en rond sur des questions stratégiques sans trouver de sortie claire.",score:2},{text:"Je cherche des financements pour passer à la vitesse supérieure.",score:2},{text:"J'ai un bon produit — mais je n'arrive pas à trouver les bons clients.",score:2},{text:"Il y a des tensions avec mes associés ou actionnaires qui bloquent tout.",score:1},{text:"J'ai surtout besoin de parler à quelqu'un qui comprend ce que c'est d'être à ma place.",score:3}]},
];

const INSIGHTS = {
  7:  { title:"Votre énergie dit quelque chose", body:"Ce que vous venez de décrire n'est pas un hasard. L'énergie — où elle va, d'où elle vient — est souvent le signal le plus honnête de votre alignement réel. La suite va explorer ce que ça révèle." },
  15: { title:"Mi-parcours — quelque chose se dessine", body:"Ce que vos réponses montrent déjà : il n'y a pas de problème de compétence ici. Il y a une cartographie spécifique — des zones de force et des zones de tension. Encore 15 questions pour affiner l'image." },
  23: { title:"Presque là", body:"Les dernières questions vont dans les zones les plus déterminantes — celles que la plupart évitent de regarder en face. Répondez avec la même honnêteté. C'est là que le portrait devient vraiment précis." },
};

// 5-level Likert scoring: positive → 6-val, negative → val
function agreeScore(val, pos) { return pos ? 6 - val : val; }

const ALL_QUESTIONS = QUESTIONS;
const ACTIVE_QUESTIONS = IS_PROD ? ALL_QUESTIONS : [
  ALL_QUESTIONS.find(q => q.type === "choice"),
  ALL_QUESTIONS.find(q => q.type === "agree"),
].filter(Boolean);

const AGREE_LABELS = [
  { val:1, label:"Tout à fait d'accord" },
  { val:2, label:"Plutôt d'accord" },
  { val:3, label:"Neutre" },
  { val:4, label:"Plutôt pas d'accord" },
  { val:5, label:"Pas du tout d'accord" },
];

function formatDob(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
}

function computeScores(answers) {
  const totals = {}, counts = {};
  AXES.forEach(a => { totals[a.id] = 0; counts[a.id] = 0; });
  QUESTIONS.forEach(q => {
    const ans = answers[q.id]; if (ans === undefined) return;
    const score = q.type === "choice" ? q.options[ans].score : agreeScore(ans, q.positive);
    totals[q.axis] += score; counts[q.axis]++;
  });
  const res = {};
  AXES.forEach(a => { res[a.id] = counts[a.id] > 0 ? Math.round((totals[a.id] / counts[a.id]) * 10) / 10 : 0; });
  return res;
}

function getProfileKey(scores) {
  const vals = Object.values(scores);
  const global = vals.reduce((s, v) => s + v, 0) / vals.length;
  const proAvg = AXES.filter(a => a.pro).reduce((s, a) => s + (scores[a.id] || 0), 0) / AXES.filter(a => a.pro).length;
  const perAvg = AXES.filter(a => !a.pro).reduce((s, a) => s + (scores[a.id] || 0), 0) / AXES.filter(a => !a.pro).length;
  const niveau = global >= 3.5 ? "fort" : global >= 2.5 ? "moyen" : "faible";
  const diff = proAvg - perAvg;
  const tension = diff > 0.4 ? "pro" : diff < -0.4 ? "perso" : "equilibre";
  return `${niveau}_${tension}`;
}

const PROFILES = {
  fort_pro:       { m:"L'Architecte",    f:"L'Architecte",    desc:"Vous construisez avec intention et vous tenez la direction. Vos forces opérationnelles et stratégiques sont réelles. Ce qui peut encore s'affiner est dans la précision de l'exécution collective — pas dans la vision." },
  fort_equilibre: { m:"Le Porteur",      f:"La Porteuse",      desc:"Vous portez quelque chose de plus grand que vous — une vision, une mission, un sens. Votre intégration est avancée sur les deux registres. Votre question n'est plus comment avancer, c'est vers quoi et pour qui." },
  fort_perso:     { m:"Le Visionnaire",  f:"La Visionnaire",   desc:"La vision est là, puissante et claire. Votre intégration personnelle est forte. Ce qui reste en travail est dans l'ancrage concret — transformer ce que vous percevez en ce que vous produisez réellement." },
  moyen_pro:      { m:"Le Dissipé",      f:"La Dissipée",      desc:"Vous voyez où vous voulez aller. Mais quelque chose se perd en route — l'énergie se dilue, les priorités se brouillent, l'exécution ne suit pas la vision. Le potentiel est réel. Le cadre manque." },
  moyen_equilibre:{ m:"À la Croisée",   f:"À la Croisée",     desc:"Ni vraiment dans l'ancien, ni encore dans le nouveau. Ce moment est inconfortable — et c'est exactement là que tout se joue. Ce qui vous a mené jusqu'ici ne suffit peut-être plus pour la suite." },
  moyen_perso:    { m:"Le Silencieux",   f:"La Silencieuse",   desc:"Les résultats sont là. Mais quelque chose s'est tu en vous. Vous continuez — par engagement, par habitude, parfois par peur d'arrêter. Le sens s'est affaibli. Il ne s'agit pas de faire mieux, mais de retrouver pourquoi." },
  faible_pro:     { m:"L'Essoufflé",    f:"L'Essoufflée",    desc:"Vous avez couru longtemps. La mécanique ne répond plus comme avant et les solutions habituelles ne changent rien. Ce n'est pas un manque de volonté — c'est le signal que quelque chose doit fondamentalement changer." },
  faible_equilibre:{ m:"Le Marcheur",   f:"La Marcheuse",     desc:"Vous avancez — pas à terre, pas perdu, mais sans carte claire. Vous marchez parce que vous savez que s'arrêter est pire. La direction reste floue. Ce que vous cherchez, c'est une boussole." },
  faible_perso:   { m:"L'Endormi",      f:"L'Endormie",      desc:"Quelque chose en vous n'est pas encore réveillé — ou vient de commencer à bouger. Il y a un appel que vous entendez sans encore savoir comment y répondre. Ce n'est pas un retard. C'est un commencement." },
};

function getProfileData(scores, genre) {
  const key = getProfileKey(scores);
  const p = PROFILES[key] || PROFILES["moyen_equilibre"];
  return { ...p, title: genre === "f" ? p.f : p.m, key };
}

function Radar({ scores, size = 300 }) {
  const n = 6, cx = size / 2, cy = size / 2, r = size * 0.3;
  const start = -Math.PI / 2, step = (2 * Math.PI) / n;
  const pt = (i, v) => { const a = start + i * step, d = (v / 5) * r; return [cx + d * Math.cos(a), cy + d * Math.sin(a)]; };
  const poly = pts => pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + "Z";
  const fullPts = AXES.map((_, i) => pt(i, 5));
  const devPts  = AXES.map((_, i) => pt(i, Math.min(5, (scores[AXES[i].id] || 0) + 1.5)));
  const curPts  = AXES.map((_, i) => pt(i, scores[AXES[i].id] || 0));
  const lR = r + r * 0.55;

  const legend = [
    { fc:COLORS.navy, sc:COLORS.navyBd, dash:"", label:"Potentiel théorique" },
    { fc:"rgba(200,151,58,0.12)", sc:COLORS.gold, dash:"4 3", label:"Perspective" },
    { fc:"rgba(200,151,58,0.22)", sc:COLORS.gold, dash:"", label:"Votre position" },
  ];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width:"100%", maxWidth:size, background:COLORS.deep }}>
      <path d={poly(fullPts)} fill={COLORS.navy} stroke={COLORS.navyBd} strokeWidth={0.8}/>
      {[1,2,3,4].map(lv => <path key={lv} d={poly(AXES.map((_,i) => pt(i,lv)))} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={0.4}/>)}
      {AXES.map((_,i) => { const[ex,ey]=pt(i,5); return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5}/>; })}
      <path d={poly(devPts)} fill="rgba(200,151,58,0.12)" stroke={COLORS.gold} strokeWidth={1.2} strokeDasharray="4 3"/>
      <path d={poly(curPts)} fill="rgba(200,151,58,0.22)" stroke={COLORS.gold} strokeWidth={2} style={{ transition:"all 0.5s ease" }}/>
      {curPts.map(([px,py],i) => <circle key={i} cx={px} cy={py} r={4} fill={AXES[i].color} stroke={COLORS.deep} strokeWidth={1.5} style={{ transition:"all 0.5s ease" }}/>)}
      {curPts.map(([px,py],i) => {
        const s = scores[AXES[i].id]; if (!s) return null;
        const a = start + i * step;
        return <text key={i} x={px+Math.cos(a)*14} y={py+Math.sin(a)*14+3} textAnchor="middle" fontSize={8} fontFamily="Montserrat,sans-serif" fontWeight="700" fill={AXES[i].color}>{s.toFixed(1)}</text>;
      })}
      {AXES.map((ax,i) => {
        const a = start + i * step, lx = cx + lR * Math.cos(a), ly = cy + lR * Math.sin(a);
        return ax.label.split("\n").map((line, j, arr) =>
          <text key={j} x={lx} y={ly-(arr.length-1)*6+j*12} textAnchor="middle" fontSize={8.5} fontFamily="Montserrat,sans-serif" fontWeight="600" fill={ax.color}>{line}</text>
        );
      })}
      {legend.map(({ fc, sc, dash, label }, k) => (
        <g key={k} transform={`translate(8,${size-56+k*18})`}>
          <rect width={12} height={8} fill={fc} stroke={sc} strokeWidth={0.8} strokeDasharray={dash}/>
          <text x={16} y={7} fontSize={7} fontFamily="Montserrat,sans-serif" fill={COLORS.grey}>{label}</text>
        </g>
      ))}
    </svg>
  );
}

export default function App() {
  const [step, setStep]           = useState("intro");
  const [current, setCurrent]     = useState(0);
  const [answers, setAnswers]     = useState({});
  const [genre, setGenre]         = useState("");
  const [nom, setNom]             = useState("");
  const [dob, setDob]             = useState("");
  const [email, setEmail]         = useState("");
  const [selections, setSelections] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending]     = useState(false);
  const [sendError, setSendError] = useState("");
  const topRef = useRef(null);

  // Airtable save-per-answer
  const sessionIdRef      = useRef(crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const airtableRecordRef = useRef(null);
  const saveChainRef      = useRef(Promise.resolve());

  const TOTAL    = ACTIVE_QUESTIONS.length;
  const q        = ACTIVE_QUESTIONS[current];
  const scores   = computeScores(answers);
  const answered = q && answers[q.id] !== undefined;
  const progress = Math.round((Object.keys(answers).length / TOTAL) * 100);
  const axis     = q ? AXES.find(a => a.id === q.axis) : null;
  const profData = (step === "result" && genre) ? getProfileData(scores, genre) : null;
  const showIns  = answered && INSIGHTS[q?.id];

  function saveAnswer(questionId, value) {
    saveChainRef.current = saveChainRef.current.then(async () => {
      try {
        const res = await fetch("/api/saveanswer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionIdRef.current, recordId: airtableRecordRef.current, questionId, value }),
        });
        if (res.ok) {
          const d = await res.json();
          if (d.recordId) airtableRecordRef.current = d.recordId;
        }
      } catch {}
    });
  }

  function handleAnswer(val) {
    setAnswers(p => ({ ...p, [q.id]: val }));
    saveAnswer(q.id, val);
  }

  function next() {
    if (current + 1 >= TOTAL) { setStep("result"); return; }
    setCurrent(c => c + 1);
    topRef.current?.scrollIntoView({ behavior:"smooth" });
  }

  function toggleSel(id) { setSelections(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); }

  async function handleSubmit() {
    if (!nom || !email) return;
    setSending(true); setSendError("");
    try {
      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, dob, email, genre, selections, scores, profil: getProfileKey(scores), sessionId: sessionIdRef.current, recordId: airtableRecordRef.current }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch { setSendError("Une erreur est survenue. Veuillez réessayer."); }
    finally { setSending(false); }
  }

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (step === "intro") return (
    <div style={{ fontFamily:FONTS.body, background:COLORS.deep, minHeight:"100vh" }}>
      <div style={{ background:COLORS.navy, padding:"14px 24px", borderBottom:`1px solid ${COLORS.navyBd}` }}>
        <span style={{ color:COLORS.gold, fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase" }}>The New Game of Life</span>
      </div>
      <div style={{ maxWidth:560, margin:"0 auto", padding:"48px 20px", textAlign:"center" }}>
        <div style={{ fontSize:11, color:COLORS.gold, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:20 }}>The New Game Of Life · Rapport</div>
        <h1 style={{ fontSize:36, color:COLORS.white, margin:0, fontWeight:700, lineHeight:1.2, fontFamily:FONTS.display }}>Rapprochez-vous</h1>
        <h1 style={{ fontSize:36, color:COLORS.white, margin:0, fontWeight:700, lineHeight:1.2, fontFamily:FONTS.display }}>de votre</h1>
        <h1 style={{ fontSize:36, color:COLORS.gold, margin:"0 0 24px", fontWeight:700, lineHeight:1.2, fontFamily:FONTS.display }}>Plus haut potentiel.</h1>
        <div style={{ width:50, height:2, background:COLORS.gold, margin:"0 auto 24px" }}/>
        <p style={{ fontSize:14, color:COLORS.cream, lineHeight:1.8, maxWidth:460, margin:"0 auto 28px", textAlign:"left" }}>
          Vous portez une vision, une équipe, des responsabilités. Et pourtant, il y a cet écart persistant entre ce que vous sentez capable de faire et ce que vous produisez réellement.<br/><br/>
          Ce questionnaire cartographie cet écart et vous permet de le voir selon 6 dimensions.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, maxWidth:420, margin:"0 auto 28px", textAlign:"left" }}>
          {AXES.map(ax => (
            <div key={ax.id} style={{ display:"flex", alignItems:"center", gap:10, background:COLORS.navy, padding:"10px 14px", borderLeft:`3px solid ${ax.color}` }}>
              <span style={{ fontSize:10, fontWeight:700, color:ax.color, minWidth:22 }}>{ax.id}</span>
              <span style={{ fontSize:12, color:COLORS.cream, lineHeight:1.3 }}>{ax.short}</span>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:32 }}>
          {["10 minutes","30 questions","Cartographie personnalisée"].map(t => (
            <span key={t} style={{ fontSize:11, color:COLORS.grey, border:`1px solid ${COLORS.navyBd}`, padding:"4px 12px" }}>{t}</span>
          ))}
        </div>
        <button onClick={() => setStep("quiz")} style={{ background:COLORS.gold, color:COLORS.deep, border:"none", padding:"16px 44px", fontSize:15, fontFamily:FONTS.body, cursor:"pointer", letterSpacing:"0.05em", fontWeight:700 }}>
          Vers mon plus haut potentiel →
        </button>
        <p style={{ fontSize:11, color:COLORS.grey, marginTop:14, fontStyle:"italic" }}>Aucune bonne ou mauvaise réponse. Répondez honnêtement.</p>
      </div>
    </div>
  );

  // ── Quiz ───────────────────────────────────────────────────────────────────
  if (step === "quiz") return (
    <div style={{ fontFamily:FONTS.body, background:COLORS.deep, minHeight:"100vh" }}>
      <div style={{ background:COLORS.navy, padding:"12px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${COLORS.navyBd}` }}>
        <span style={{ color:COLORS.gold, fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" }}>The New Game of Life · Rapport</span>
        <span style={{ color:COLORS.grey, fontSize:11, fontStyle:"italic" }}>{Object.keys(answers).length} / {TOTAL}</span>
      </div>
      <div style={{ height:3, background:COLORS.navyBd }}>
        <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(90deg,${axis?.color || COLORS.D1},${COLORS.gold})`, transition:"width 0.4s ease" }}/>
      </div>
      <div ref={topRef} style={{ maxWidth:620, margin:"0 auto", padding:"24px 18px 60px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", marginBottom:18 }}>
          <span style={{ fontSize:11, color:COLORS.grey, fontStyle:"italic" }}>Question {current + 1} sur {TOTAL}</span>
        </div>
        <div style={{ background:COLORS.navy, padding:"22px 24px", borderTop:`3px solid ${axis?.color}` }}>
          <p style={{ fontSize:16, color:COLORS.white, fontWeight:700, lineHeight:1.6, margin:"0 0 20px", fontFamily:FONTS.display }}>
            {q.type === "agree" ? (
              <><span style={{ display:"block", fontSize:12, color:axis?.color, fontWeight:400, fontStyle:"italic", marginBottom:8, fontFamily:FONTS.body }}>Dans quelle mesure êtes-vous d'accord ?</span>« {q.statement} »</>
            ) : q.question}
          </p>
          {q.type === "choice" && q.options.map((opt, i) => {
            const sel = answers[q.id] === i;
            const col = axis?.color || COLORS.D1;
            return (
              <button key={i} onClick={() => handleAnswer(i)} style={{ display:"block", width:"100%", textAlign:"left", background:sel ? axis?.sel : COLORS.deep, border:`1.5px solid ${sel ? col : COLORS.navyBd}`, padding:"11px 15px", marginBottom:9, fontSize:14, color:sel ? col : COLORS.cream, fontFamily:FONTS.body, cursor:"pointer", transition:"all 0.15s", fontWeight:sel ? 700 : 400 }}>
                <span style={{ color:col, marginRight:8 }}>{sel ? "●" : "○"}</span>{opt.text}
              </button>
            );
          })}
          {q.type === "agree" && (
            <div style={{ marginTop:8 }}>
              {AGREE_LABELS.map(({ val, label }) => {
                const sel = answers[q.id] === val;
                const col = axis?.color || COLORS.D1;
                return (
                  <button key={val} onClick={() => handleAnswer(val)} style={{ display:"block", width:"100%", textAlign:"left", background:sel ? axis?.sel : COLORS.deep, border:`1.5px solid ${sel ? col : COLORS.navyBd}`, padding:"11px 15px", marginBottom:9, fontSize:14, color:sel ? col : COLORS.cream, fontFamily:FONTS.body, cursor:"pointer", transition:"all 0.15s", fontWeight:sel ? 700 : 400 }}>
                    <span style={{ color:col, marginRight:8 }}>{sel ? "●" : "○"}</span>{label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {showIns && (
          <div style={{ background:COLORS.navy, borderLeft:`4px solid ${axis?.color}`, padding:"16px 20px", margin:"18px 0" }}>
            <div style={{ fontSize:12, fontWeight:700, color:axis?.color, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>{INSIGHTS[q.id].title}</div>
            <div style={{ fontSize:13, color:COLORS.cream, lineHeight:1.65, fontStyle:"italic" }}>{INSIGHTS[q.id].body}</div>
          </div>
        )}
        <div style={{ textAlign:"center", marginTop:20 }}>
          <button onClick={next} disabled={!answered} style={{ background:answered ? COLORS.gold : COLORS.navyBd, color:answered ? COLORS.deep : COLORS.grey, border:"none", padding:"13px 36px", fontSize:15, fontFamily:FONTS.body, cursor:answered ? "pointer" : "default", letterSpacing:"0.05em", transition:"background 0.2s", fontWeight:700 }}>
            {current + 1 >= TOTAL ? "Voir ma cartographie →" : "Suivant →"}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Résultat ───────────────────────────────────────────────────────────────
  if (step === "result") return (
    <div style={{ fontFamily:FONTS.body, background:COLORS.deep, minHeight:"100vh" }}>
      <div style={{ background:COLORS.navy, padding:"12px 20px", borderBottom:`1px solid ${COLORS.navyBd}` }}>
        <span style={{ color:COLORS.gold, fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" }}>The New Game of Life · Votre Cartographie</span>
      </div>
      <div style={{ maxWidth:620, margin:"0 auto", padding:"32px 18px 60px" }}>

        {!genre ? (
          <div style={{ textAlign:"center", padding:"20px 0 32px" }}>
            <div style={{ fontSize:11, color:COLORS.gold, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:16 }}>Votre cartographie est prête</div>
            <div style={{ width:40, height:2, background:COLORS.gold, margin:"0 auto 20px" }}/>
            <p style={{ fontSize:14, color:COLORS.cream, lineHeight:1.7, marginBottom:24, fontStyle:"italic", maxWidth:400, margin:"0 auto 24px" }}>
              Pour personnaliser votre rapport, précisez comment vous adresser :
            </p>
            <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
              {[{val:"m",label:"Au masculin"},{val:"f",label:"Au féminin"},{val:"n",label:"Sans préférence"}].map(({ val, label }) => (
                <button key={val} onClick={() => setGenre(val)} style={{ padding:"13px 22px", border:`1.5px solid ${COLORS.navyBd}`, background:COLORS.navy, color:COLORS.cream, fontFamily:FONTS.body, fontSize:14, cursor:"pointer", transition:"all 0.15s" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ fontSize:11, color:COLORS.gold, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:10 }}>Votre profil</div>
              <h2 style={{ fontSize:28, color:COLORS.white, margin:"0 0 8px", fontWeight:700, fontFamily:FONTS.display }}>{profData.title}</h2>
              <div style={{ width:40, height:2, background:COLORS.gold, margin:"10px auto 16px" }}/>
              <p style={{ fontSize:13, color:COLORS.cream, lineHeight:1.7, fontStyle:"italic", maxWidth:460, margin:"0 auto" }}>{profData.desc}</p>
            </div>
            <div style={{ maxWidth:320, margin:"0 auto 28px" }}><Radar scores={scores} size={320}/></div>

            <div style={{ marginBottom:28 }}>
              {AXES.map(ax => {
                const s = scores[ax.id] || 0;
                return (
                  <div key={ax.id} style={{ display:"flex", alignItems:"center", gap:12, background:COLORS.navy, padding:"12px 16px", marginBottom:8, borderLeft:`3px solid ${ax.color}` }}>
                    <div style={{ minWidth:32 }}><div style={{ fontSize:10, fontWeight:700, color:ax.color }}>{ax.id}</div></div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:COLORS.cream, marginBottom:4 }}>{ax.short} <span style={{ fontSize:10, color:COLORS.grey, fontWeight:400 }}>· {ax.pro ? "Professionnel" : "Personnel"}</span></div>
                      <div style={{ height:4, background:COLORS.navyBd }}>
                        <div style={{ height:"100%", width:`${(s/5)*100}%`, background:ax.color, transition:"width 1s ease" }}/>
                      </div>
                    </div>
                    <div style={{ fontSize:20, fontWeight:700, color:ax.color, minWidth:40, textAlign:"right" }}>{s.toFixed(1)}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ background:COLORS.navy, padding:"24px", borderTop:`3px solid ${COLORS.gold}` }}>
              <div style={{ fontSize:18, fontWeight:700, color:COLORS.white, marginBottom:20, textAlign:"center", fontFamily:FONTS.display }}>Recevez votre rapport</div>
              {!submitted ? (
                <>
                  <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:14 }}>
                    <input value={nom} onChange={e => setNom(e.target.value)}
                      placeholder="Prénom"
                      style={{ padding:"11px 14px", fontSize:14, fontFamily:FONTS.body, border:`1.5px solid ${nom ? COLORS.gold : COLORS.navyBd}`, background:COLORS.deep, color:COLORS.white, outline:"none" }}/>
                    <input value={dob} onChange={e => setDob(formatDob(e.target.value))}
                      placeholder="jj/mm/aaaa" inputMode="numeric" maxLength={10}
                      style={{ padding:"11px 14px", fontSize:14, fontFamily:FONTS.body, border:`1.5px solid ${dob.length===10 ? COLORS.gold : COLORS.navyBd}`, background:COLORS.deep, color:COLORS.white, outline:"none", letterSpacing:"0.05em" }}/>
                    <input value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="Email" type="email"
                      style={{ padding:"11px 14px", fontSize:14, fontFamily:FONTS.body, border:`1.5px solid ${email ? COLORS.gold : COLORS.navyBd}`, background:COLORS.deep, color:COLORS.white, outline:"none" }}/>
                  </div>
                  {sendError && <p style={{ color:COLORS.error, fontSize:12, marginBottom:8, textAlign:"center" }}>{sendError}</p>}
                  <button onClick={handleSubmit} disabled={!nom || !email || sending}
                    style={{ width:"100%", background:nom && email && !sending ? COLORS.gold : COLORS.navyBd, color:nom && email && !sending ? COLORS.deep : COLORS.grey, border:"none", padding:"14px", fontSize:15, fontFamily:FONTS.body, cursor:nom && email ? "pointer" : "default", fontWeight:700, transition:"background 0.2s" }}>
                    {sending ? "Envoi en cours..." : "Valider →"}
                  </button>
                  <p style={{ fontSize:11, color:COLORS.grey, fontStyle:"italic", margin:"10px 0 0", textAlign:"center" }}>Données confidentielles. Aucun spam.</p>
                </>
              ) : (
                <div style={{ textAlign:"center", padding:"16px 0" }}>
                  <div style={{ fontSize:32, marginBottom:12, color:COLORS.gold }}>✓</div>
                  <p style={{ color:COLORS.gold, fontSize:16, fontWeight:700, margin:"0 0 8px", fontFamily:FONTS.display }}>Merci {nom}.</p>
                  <p style={{ color:COLORS.cream, fontSize:13, fontStyle:"italic", margin:"0 0 20px", lineHeight:1.6 }}>Votre rapport arrive dans votre boîte dans quelques minutes.</p>
                  <a href={CTA_REDIRECT_URL} style={{ display:"inline-block", background:COLORS.gold, color:COLORS.deep, textDecoration:"none", padding:"13px 28px", fontSize:14, fontWeight:700, fontFamily:FONTS.body }}>
                    Explorer ces pistes →
                  </a>
                </div>
              )}
            </div>

            {submitted && (
              <div style={{ marginTop:28, background:COLORS.navy, overflow:"hidden" }}>
                <div style={{ background:COLORS.deep, padding:"20px 24px", borderBottom:`3px solid ${COLORS.gold}` }}>
                  <div style={{ fontSize:10, color:COLORS.gold, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6 }}>The New Game of Life</div>
                  <div style={{ fontSize:20, fontWeight:700, color:COLORS.white, lineHeight:1.3, fontFamily:FONTS.display }}>Des pistes à explorer ensemble</div>
                </div>
                <div style={{ padding:"24px" }}>
                  {[
                    { title:"Votre rapport personnalisé",                color:COLORS.D1, desc:"Une analyse complète de vos 6 dimensions avec votre toile d'araignée, votre profil et des pistes de travail concrètes distinguant développement professionnel et personnel." },
                    { title:"Le chemin vers votre plus haut potentiel",   color:COLORS.D2, desc:"Un tuto vidéo qui présente les 12 mouvements du Jeu de la Vie — pour comprendre où vous en êtes, ce qui vous freine, et ce que la suite peut ressembler." },
                    { title:"Visio collective — En chemin ensemble",       color:COLORS.D3, desc:"1h30 avec d'autres personnes qui traversent les mêmes questions. Un espace rare de partage, de reconnaissance mutuelle, et de réflexion collective." },
                    { title:"Session individuelle offerte — 45 minutes",   color:COLORS.D4, desc:"Un entretien en tête-à-tête pour nommer votre blocage prioritaire, comprendre sa logique, et repartir avec une direction claire. Sans engagement." },
                  ].map((item, i) => (
                    <div key={i} style={{ display:"flex", gap:16, padding:"16px 0", borderBottom:i<3 ? `1px solid ${COLORS.navyBd}` : "none" }}>
                      <div style={{ width:4, minWidth:4, background:item.color }}/>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:item.color, marginBottom:4 }}>{item.title}</div>
                        <div style={{ fontSize:13, color:COLORS.cream, lineHeight:1.6, fontStyle:"italic" }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop:20, background:COLORS.deep, padding:"16px", borderLeft:`3px solid ${COLORS.gold}` }}>
                    <div style={{ fontSize:13, color:COLORS.cream, lineHeight:1.7 }}><b>La suite vous appartient.</b> Ce que vous avez vu ici n'est qu'un premier miroir. Le chemin vers votre plus haut potentiel commence par la reconnaissance — et vous venez de franchir ce premier pas.</div>
                    <div style={{ marginTop:10, fontSize:12, color:COLORS.grey, fontStyle:"italic" }}>christophe@thenewgol.com</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <p style={{ textAlign:"center", fontSize:10, color:COLORS.grey, fontStyle:"italic", marginTop:24 }}>
          The New Game of Life · Christophe Jouret · 2026
        </p>
      </div>
    </div>
  );
}
