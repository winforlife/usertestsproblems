import { useState, useRef } from "react";

// ── Staging mode — limit to 2 questions if not production ─────────────────────
const IS_PROD = import.meta.env.MODE === "production";
const CTA_REDIRECT_URL = import.meta.env.VITE_CTA_REDIRECT_URL || "#";

// ── CSS variable injected once ─────────────────────────────────────────────────
if (typeof document !== "undefined") {
  document.documentElement.style.setProperty("--primary-color", "#3A7BD5");
}

const AXES = [
  { id:"D1", label:"Clarté\nStratégique",   short:"Clarté stratégique",   color:"#3A7BD5", light:"#EBF3FA", pro:true  },
  { id:"D2", label:"Énergie &\nAlignement",  short:"Énergie & alignement",  color:"#00B4A6", light:"#E0F7F5", pro:false },
  { id:"D3", label:"Relation au\nCollectif", short:"Relation au collectif", color:"#27AE60", light:"#E8F8EE", pro:true  },
  { id:"D4", label:"Rapport\nà Soi",          short:"Rapport à soi",         color:"#8E44AD", light:"#F5EEF8", pro:false },
  { id:"D5", label:"Sens &\nVision",           short:"Sens & vision",         color:"#F39C12", light:"#FEF9E7", pro:false },
  { id:"D6", label:"Mani-\nfestation",         short:"Manifestation",         color:"#E74C3C", light:"#FDEDEC", pro:true  },
];

// Ordre mixé — questions mélangées pour éviter la stratégie utilisateur
// Principes : ouverture situationnelle, alternance choix/accord,
// D4 (rapport à soi) au milieu, fin sur action concrète
const QUESTIONS = [
  // Q1 — Ouverture situationnelle D1
  { id:1,  axis:"D1", type:"choice", question:"Si vous deviez décrire votre état d'esprit du lundi matin en ce moment, ce serait plutôt :",
    options:[{text:"Je suis focus et je sais exactement où je vais.",score:5},{text:"J'ai mille choses à faire et je ne sais pas par où commencer.",score:1},{text:"Je fais ce qu'il faut, mais quelque chose me manque.",score:3},{text:"Je me pose des questions que je ne posais pas avant.",score:2},{text:"Je suis épuisé avant même d'avoir commencé.",score:1}]},
  // Q2 — D3
  { id:10, axis:"D3", type:"agree", positive:true,  statement:"Je peux exprimer mes doutes et mes difficultés à au moins une personne de mon cercle professionnel." },
  // Q3 — D5
  { id:18, axis:"D5", type:"agree", positive:true,  statement:"Ce que je construis a un sens qui dépasse le business — je sais pourquoi cela compte vraiment." },
  // Q4 — D2 situationnelle
  { id:5,  axis:"D2", type:"choice", question:"Où allez-vous chercher de l'énergie quand vous êtes à plat ?",
    options:[{text:"Dans l'action — avancer me recharge.",score:3},{text:"Dans le silence — j'ai besoin de me retrouver seul.",score:3},{text:"Dans les conversations avec les bonnes personnes.",score:3},{text:"Dans le sens — me reconnecter à pourquoi je fais tout ça.",score:5},{text:"Je ne sais pas vraiment. Je fonctionne jusqu'à ce que je n'en puisse plus.",score:1}]},
  // Q5 — D6
  { id:22, axis:"D6", type:"agree", positive:false, statement:"Je me retrouve souvent à recommencer les mêmes cycles sans que les choses n'avancent vraiment." },
  // Q6 — D1
  { id:2,  axis:"D1", type:"agree", positive:true,  statement:"Je sais exactement quelles sont mes trois priorités cette semaine — et pourquoi." },
  // Q7 — D4 (intro douce)
  { id:15, axis:"D4", type:"agree", positive:true,  statement:"Je me fais confiance pour traverser les périodes d'incertitude sans perdre mon axe." },
  // Q8 — D3
  { id:11, axis:"D3", type:"agree", positive:false, statement:"Les tensions dans mon équipe ou avec mes associés prennent trop de place dans mon quotidien." },
  // Q9 — D2
  { id:6,  axis:"D2", type:"agree", positive:false, statement:"Il y a souvent un écart entre l'énergie que je dépense et les résultats que j'obtiens." },
  // Q10 — D5 situationnelle
  { id:17, axis:"D5", type:"choice", question:"Quand vous pensez à votre projet dans 3 ans, vous ressentez :",
    options:[{text:"De l'enthousiasme — j'ai une vision claire et j'y crois.",score:5},{text:"De l'incertitude — je ne sais pas encore où on va atterrir.",score:3},{text:"De la pression — les attentes sont lourdes.",score:2},{text:"Du doute — je me demande si c'est encore ce que je veux.",score:2},{text:"Du vide — j'ai du mal à me projeter.",score:1}]},
  // Q11 — D1
  { id:3,  axis:"D1", type:"agree", positive:false, statement:"Je remets souvent les mêmes décisions à plus tard, sans vraiment savoir pourquoi." },
  // Q12 — D6
  { id:21, axis:"D6", type:"agree", positive:true,  statement:"Je passe facilement de l'intention à l'action concrète — sans me perdre en route." },
  // Q13 — D3 situationnelle
  { id:9,  axis:"D3", type:"choice", question:"Dans votre entourage professionnel proche, vous vous sentez :",
    options:[{text:"Bien entouré et compris. Je peux parler de ce que je vis vraiment.",score:5},{text:"Entouré, mais seul sur les vraies questions.",score:3},{text:"Isolé. Le rôle que j'occupe crée une distance.",score:1},{text:"Variable. Des moments de vraie connexion, et d'autres de grande solitude.",score:2},{text:"Je fonctionne surtout seul. C'est comme ça depuis le début.",score:2}]},
  // Q14 — D2
  { id:7,  axis:"D2", type:"agree", positive:true,  statement:"Je me sens globalement aligné entre ce que je fais, ce que je pense et ce que je veux vraiment." },
  // Q15 — D4 (plus profond)
  { id:13, axis:"D4", type:"agree", positive:true,  statement:"Je reconnais facilement quand mes réactions sont guidées par la peur plutôt que par le choix." },
  // Q16 — D5
  { id:19, axis:"D5", type:"agree", positive:false, statement:"Je me sens parfois à la croisée des chemins — ce qui m'a mené jusqu'ici ne suffit peut-être plus pour la suite." },
  // Q17 — D1
  { id:25, axis:"D1", type:"agree", positive:false, statement:"J'ai souvent l'impression de travailler beaucoup sans avancer vraiment dans la bonne direction." },
  // Q18 — D6
  { id:30, axis:"D6", type:"agree", positive:false, statement:"J'ai souvent des idées ou des projets qui démarrent bien mais que je n'arrive pas à mener jusqu'au bout." },
  // Q19 — D4
  { id:14, axis:"D4", type:"agree", positive:false, statement:"J'ai tendance à reproduire les mêmes patterns dans mes relations professionnelles, même quand je veux faire autrement." },
  // Q20 — D2
  { id:8,  axis:"D2", type:"agree", positive:false, statement:"Certains matins, je me demande si tout cela en vaut vraiment la peine." },
  // Q21 — D3
  { id:12, axis:"D3", type:"agree", positive:true,  statement:"Je sais m'entourer de personnes qui me challengent vraiment — pas seulement de personnes qui m'approuvent." },
  // Q22 — D5
  { id:20, axis:"D5", type:"agree", positive:true,  statement:"Je sens qu'il y a quelque chose de plus grand que mon projet actuel qui cherche à s'exprimer à travers moi." },
  // Q23 — D4
  { id:16, axis:"D4", type:"agree", positive:false, statement:"Il m'arrive de prendre des décisions pour éviter un conflit plutôt que parce qu'elles sont justes pour moi." },
  // Q24 — D1
  { id:4,  axis:"D1", type:"agree", positive:true,  statement:"Quand une nouvelle opportunité se présente, je sais rapidement si elle est alignée avec ma direction ou non." },
  // Q25 — D2
  { id:26, axis:"D2", type:"agree", positive:true,  statement:"Je sais reconnaître les signaux que mon corps m'envoie quand je suis hors de mon axe." },
  // Q26 — D6
  { id:23, axis:"D6", type:"agree", positive:true,  statement:"Ce que je produis dans le monde correspond à ce que je me sens capable de produire." },
  // Q27 — D5
  { id:29, axis:"D5", type:"agree", positive:false, statement:"Il m'arrive de me demander si ce que je fais correspond vraiment à qui je suis profondément." },
  // Q28 — D3
  { id:27, axis:"D3", type:"agree", positive:false, statement:"Je porte souvent des responsabilités collectives que je n'arrive pas vraiment à partager ou à déléguer." },
  // Q29 — D4 (le plus profond en avant-dernière)
  { id:28, axis:"D4", type:"agree", positive:true,  statement:"Quand quelque chose ne va pas, je suis capable d'en identifier la source en moi plutôt que de la chercher uniquement à l'extérieur." },
  // Q30 — D6 situationnelle — clôture action concrète
  { id:24, axis:"D6", type:"choice", question:"Où en êtes-vous dans votre projet en ce moment ?",
    options:[{text:"Je tourne en rond sur des questions stratégiques sans trouver de sortie claire.",score:2},{text:"Je cherche des financements pour passer à la vitesse supérieure.",score:2},{text:"J'ai un bon produit — mais je n'arrive pas à trouver les bons clients.",score:2},{text:"Il y a des tensions avec mes associés ou actionnaires qui bloquent tout.",score:1},{text:"J'ai surtout besoin de parler à quelqu'un qui comprend ce que c'est d'être à ma place.",score:3}]},
];

const INSIGHTS = {
  // Q7 — après 6 questions, première pause
  7:  { title:"Votre énergie dit quelque chose", body:"Ce que vous venez de décrire n'est pas un hasard. L'énergie — où elle va, d'où elle vient — est souvent le signal le plus honnête de votre alignement réel. La suite va explorer ce que ça révèle." },
  // Q15 — mi-parcours
  15: { title:"Mi-parcours — quelque chose se dessine", body:"Ce que vos réponses montrent déjà : il n'y a pas de problème de compétence ici. Il y a une cartographie spécifique — des zones de force et des zones de tension. Encore 15 questions pour affiner l'image." },
  // Q23 — avant la dernière ligne droite
  23: { title:"Presque là", body:"Les dernières questions vont dans les zones les plus déterminantes — celles que la plupart évitent de regarder en face. Répondez avec la même honnêteté. C'est là que le portrait devient vraiment précis." },
};

function agreeScore(val,pos){if(pos)return val===1?5:val===2?3:1;return val===1?1:val===2?3:5;}

// ── Staging: limit to 2 questions (1 choice + 1 agree) ───────────────────────
const ALL_QUESTIONS = QUESTIONS;
const ACTIVE_QUESTIONS = IS_PROD ? ALL_QUESTIONS : [
  ALL_QUESTIONS.find(q=>q.type==="choice"),
  ALL_QUESTIONS.find(q=>q.type==="agree"),
].filter(Boolean);

// ── Date mask helper: jj/mm/aaaa — slashes always visible ────────────────────
function formatDob(raw){
  const digits=raw.replace(/\D/g,"").slice(0,8);
  if(digits.length<=2) return digits;
  if(digits.length<=4) return digits.slice(0,2)+"/"+digits.slice(2);
  return digits.slice(0,2)+"/"+digits.slice(2,4)+"/"+digits.slice(4);
}

function computeScores(answers){
  const totals={},counts={};
  AXES.forEach(a=>{totals[a.id]=0;counts[a.id]=0;});
  QUESTIONS.forEach(q=>{
    const ans=answers[q.id];if(ans===undefined)return;
    const score=q.type==="choice"?q.options[ans].score:agreeScore(ans,q.positive);
    totals[q.axis]+=score;counts[q.axis]++;
  });
  const res={};
  AXES.forEach(a=>{res[a.id]=counts[a.id]>0?Math.round((totals[a.id]/counts[a.id])*10)/10:0;});
  return res;
}

function getProfileKey(scores){
  const vals=Object.values(scores);
  const global=vals.reduce((s,v)=>s+v,0)/vals.length;
  const proAvg=AXES.filter(a=>a.pro).reduce((s,a)=>s+(scores[a.id]||0),0)/AXES.filter(a=>a.pro).length;
  const perAvg=AXES.filter(a=>!a.pro).reduce((s,a)=>s+(scores[a.id]||0),0)/AXES.filter(a=>!a.pro).length;
  const niveau=global>=3.5?"fort":global>=2.5?"moyen":"faible";
  const diff=proAvg-perAvg;
  const tension=diff>0.4?"pro":diff<-0.4?"perso":"equilibre";
  return `${niveau}_${tension}`;
}

const PROFILES={
  fort_pro:      {m:"L'Architecte",   f:"L'Architecte",   color:"#2E6090", desc:"Vous construisez avec intention et vous tenez la direction. Vos forces opérationnelles et stratégiques sont réelles. Ce qui peut encore s'affiner est dans la précision de l'exécution collective — pas dans la vision."},
  fort_equilibre:{m:"Le Porteur",     f:"La Porteuse",     color:"#1B5E6E", desc:"Vous portez quelque chose de plus grand que vous — une vision, une mission, un sens. Votre intégration est avancée sur les deux registres. Votre question n'est plus comment avancer, c'est vers quoi et pour qui."},
  fort_perso:    {m:"Le Visionnaire", f:"La Visionnaire",  color:"#8B6914", desc:"La vision est là, puissante et claire. Votre intégration personnelle est forte. Ce qui reste en travail est dans l'ancrage concret — transformer ce que vous percevez en ce que vous produisez réellement."},
  moyen_pro:     {m:"Le Dissipé",     f:"La Dissipée",     color:"#2E6090", desc:"Vous voyez où vous voulez aller. Mais quelque chose se perd en route — l'énergie se dilue, les priorités se brouillent, l'exécution ne suit pas la vision. Le potentiel est réel. Le cadre manque."},
  moyen_equilibre:{m:"À la Croisée", f:"À la Croisée",    color:"#4A2C6E", desc:"Ni vraiment dans l'ancien, ni encore dans le nouveau. Ce moment est inconfortable — et c'est exactement là que tout se joue. Ce qui vous a mené jusqu'ici ne suffit peut-être plus pour la suite."},
  moyen_perso:   {m:"Le Silencieux", f:"La Silencieuse",  color:"#4A2C6E", desc:"Les résultats sont là. Mais quelque chose s'est tu en vous. Vous continuez — par engagement, par habitude, parfois par peur d'arrêter. Le sens s'est affaibli. Il ne s'agit pas de faire mieux, mais de retrouver pourquoi."},
  faible_pro:    {m:"L'Essoufflé",   f:"L'Essoufflée",   color:"#6E3B1B", desc:"Vous avez couru longtemps. La mécanique ne répond plus comme avant et les solutions habituelles ne changent rien. Ce n'est pas un manque de volonté — c'est le signal que quelque chose doit fondamentalement changer."},
  faible_equilibre:{m:"Le Marcheur", f:"La Marcheuse",    color:"#1B5E3B", desc:"Vous avancez — pas à terre, pas perdu, mais sans carte claire. Vous marchez parce que vous savez que s'arrêter est pire. La direction reste floue. Ce que vous cherchez, c'est une boussole."},
  faible_perso:  {m:"L'Endormi",     f:"L'Endormie",     color:"#8B6914", desc:"Quelque chose en vous n'est pas encore réveillé — ou vient de commencer à bouger. Il y a un appel que vous entendez sans encore savoir comment y répondre. Ce n'est pas un retard. C'est un commencement."},
};

function getProfileData(scores,genre){
  const key=getProfileKey(scores);
  const p=PROFILES[key]||PROFILES["moyen_equilibre"];
  return{...p,title:genre==="f"?p.f:p.m,key};
}

function Radar({scores,size=300}){
  const n=6,cx=size/2,cy=size/2,r=size*0.3;
  const start=-Math.PI/2,step=(2*Math.PI)/n;
  const pt=(i,v)=>{const a=start+i*step,d=(v/5)*r;return[cx+d*Math.cos(a),cy+d*Math.sin(a)];};
  const poly=pts=>pts.map((p,i)=>`${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")+"Z";
  const fullPts=AXES.map((_,i)=>pt(i,5));
  const devPts=AXES.map((_,i)=>pt(i,Math.min(5,(scores[AXES[i].id]||0)+1.5)));
  const curPts=AXES.map((_,i)=>pt(i,scores[AXES[i].id]||0));
  const lR=r+r*0.55;
  return(
    <svg viewBox={`0 0 ${size} ${size}`} style={{width:"100%",maxWidth:size}}>
      <path d={poly(fullPts)} fill="#EAF0F6" stroke="#B0C4D8" strokeWidth={0.8}/>
      {[1,2,3,4].map(lv=><path key={lv} d={poly(AXES.map((_,i)=>pt(i,lv)))} fill="none" stroke="#D0DAE4" strokeWidth={0.4}/>)}
      {AXES.map((_,i)=>{const[ex,ey]=pt(i,5);return<line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="#C8D4DC" strokeWidth={0.5}/>;} )}
      <path d={poly(devPts)} fill="#CCE4F0BB" stroke="#4A90C0" strokeWidth={1.2} strokeDasharray="4 3"/>
      <path d={poly(curPts)} fill="#2E609044" stroke="#2E6090" strokeWidth={2} style={{transition:"all 0.5s ease"}}/>
      {curPts.map(([px,py],i)=><circle key={i} cx={px} cy={py} r={4} fill={AXES[i].color} stroke="white" strokeWidth={1.5} style={{transition:"all 0.5s ease"}}/>)}
      {curPts.map(([px,py],i)=>{const s=scores[AXES[i].id];if(!s)return null;const a=start+i*step;return<text key={i} x={px+Math.cos(a)*14} y={py+Math.sin(a)*14+3} textAnchor="middle" fontSize={8} fontFamily="Georgia" fontWeight="bold" fill={AXES[i].color}>{s.toFixed(1)}</text>;})}
      {AXES.map((ax,i)=>{const a=start+i*step,lx=cx+lR*Math.cos(a),ly=cy+lR*Math.sin(a);return ax.label.split("\n").map((line,j,arr)=><text key={j} x={lx} y={ly-(arr.length-1)*6+j*12} textAnchor="middle" fontSize={8.5} fontFamily="Georgia" fontWeight="600" fill={ax.color}>{line}</text>);})}
      {[["#EAF0F6","#B0C4D8","","Potentiel théorique"],["#CCE4F0","#4A90C0","4 3","Perspective"],["#2E609044","#2E6090","","Votre position"]].map(([fc,sc,dash,label],k)=>(
        <g key={k} transform={`translate(8,${size-56+k*18})`}>
          <rect width={12} height={8} fill={fc} stroke={sc} strokeWidth={0.8} strokeDasharray={dash}/>
          <text x={16} y={7} fontSize={7} fontFamily="Georgia" fill="#7A8A9A">{label}</text>
        </g>
      ))}
    </svg>
  );
}

export default function App(){
  const[step,setStep]=useState("intro");
  const[current,setCurrent]=useState(0);
  const[answers,setAnswers]=useState({});
  const[genre,setGenre]=useState("");
  const[nom,setNom]=useState("");
  const[dob,setDob]=useState("");
  const[email,setEmail]=useState("");
  const[selections,setSelections]=useState([]);
  const[submitted,setSubmitted]=useState(false);
  const[sending,setSending]=useState(false);
  const[sendError,setSendError]=useState("");
  const topRef=useRef(null);

  const TOTAL=ACTIVE_QUESTIONS.length;
  const q=ACTIVE_QUESTIONS[current];
  const scores=computeScores(answers);
  const answered=q&&answers[q.id]!==undefined;
  const progress=Math.round((Object.keys(answers).length/TOTAL)*100);
  const axis=q?AXES.find(a=>a.id===q.axis):null;
  const profData=(step==="result"&&genre)?getProfileData(scores,genre):null;
  const showIns=answered&&INSIGHTS[q?.id];
  const F={family:"Georgia, serif"},G="#7A8A9A",D="#0D1A2B",Au="#C4A46A";

  function handleAnswer(val){setAnswers(p=>({...p,[q.id]:val}));}
  function next(){
    if(current+1>=TOTAL){setStep("result");return;}
    setCurrent(c=>c+1);
    topRef.current?.scrollIntoView({behavior:"smooth"});
  }
  function toggleSel(id){setSelections(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);}
  async function handleSubmit(){
    if(!nom||!email)return;
    setSending(true);setSendError("");
    try{
      const res=await fetch("/api/send-report",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({nom,dob,email,genre,selections,scores,profil:getProfileKey(scores)})});
      if(!res.ok)throw new Error();
      setSubmitted(true);
    }catch{setSendError("Une erreur est survenue. Veuillez réessayer.");}
    finally{setSending(false);}
  }

  if(step==="intro")return(
    <div style={{fontFamily:F.family,background:"#FAFAF7",minHeight:"100vh"}}>
      <div style={{background:D,padding:"14px 24px"}}>
        <span style={{color:Au,fontSize:11,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase"}}>The Game of Life</span>
      </div>
      <div style={{maxWidth:560,margin:"0 auto",padding:"48px 20px",textAlign:"center"}}>
        <div style={{fontSize:11,color:Au,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:20}}>The Game Of Life · Rapport</div>
        <h1 style={{fontSize:34,color:D,margin:0,fontWeight:700,lineHeight:1.2}}>Rapprochez-vous</h1>
        <h1 style={{fontSize:34,color:D,margin:0,fontWeight:700,lineHeight:1.2}}>de votre</h1>
        <h1 style={{fontSize:34,color:D,margin:"0 0 24px",fontWeight:700,lineHeight:1.2}}>Plus haut potentiel.</h1>
        <div style={{width:50,height:2,background:Au,margin:"0 auto 24px"}}/>
        <p style={{fontSize:14,color:"#5C3D0A",lineHeight:1.8,maxWidth:460,margin:"0 auto 28px",textAlign:"left"}}>
          Vous portez une vision, une équipe, des responsabilités. Et pourtant, il y a cet écart persistant entre ce que vous sentez capable de faire et ce que vous produisez réellement.<br/><br/>
          Ce questionnaire cartographie cet écart et vous permet de le voir selon 6 dimensions.
        </p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxWidth:420,margin:"0 auto 28px",textAlign:"left"}}>
          {AXES.map(ax=>(
            <div key={ax.id} style={{display:"flex",alignItems:"center",gap:10,background:"white",borderRadius:8,padding:"10px 14px",boxShadow:"0 1px 6px rgba(0,0,0,0.05)",borderLeft:`3px solid ${ax.color}`}}>
              <span style={{fontSize:10,fontWeight:700,color:ax.color,minWidth:22}}>{ax.id}</span>
              <span style={{fontSize:12,color:"#2C2018",lineHeight:1.3}}>{ax.short}</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:32}}>
          {["10 minutes","30 questions","Cartographie personnalisée"].map(t=>(
            <span key={t} style={{fontSize:11,color:G,border:"1px solid #D8CFC0",padding:"4px 12px",borderRadius:20}}>{t}</span>
          ))}
        </div>
        <button onClick={()=>setStep("quiz")} style={{background:"#2E6090",color:"white",border:"none",padding:"16px 44px",fontSize:15,fontFamily:F.family,cursor:"pointer",letterSpacing:"0.05em",borderRadius:4,fontWeight:700}}>
          Vers mon plus haut potentiel →
        </button>
        <p style={{fontSize:11,color:G,marginTop:14,fontStyle:"italic"}}>Aucune bonne ou mauvaise réponse. Répondez honnêtement.</p>
      </div>
    </div>
  );

  if(step==="quiz")return(
    <div style={{fontFamily:F.family,background:"#FAFAF7",minHeight:"100vh"}}>
      <div style={{background:D,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{color:Au,fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase"}}>The Game of Life · Rapport</span>
        <span style={{color:G,fontSize:11,fontStyle:"italic"}}>{Object.keys(answers).length} / {TOTAL}</span>
      </div>
      <div style={{height:3,background:"#E8E0D0"}}>
        <div style={{height:"100%",width:`${progress}%`,background:`linear-gradient(90deg,${axis?.color},#C4A46A)`,transition:"width 0.4s ease"}}/>
      </div>
      <div ref={topRef} style={{maxWidth:620,margin:"0 auto",padding:"24px 18px 60px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",marginBottom:18}}>
          <span style={{fontSize:11,color:G,fontStyle:"italic"}}>Question {current+1} sur {TOTAL}</span>
        </div>
        <div style={{background:"white",borderRadius:10,padding:"22px 24px",boxShadow:"0 2px 16px rgba(13,26,43,0.07)",borderTop:`3px solid ${axis?.color}`}}>
          <p style={{fontSize:16,color:D,fontWeight:700,lineHeight:1.6,margin:"0 0 20px"}}>
            {q.type==="agree"?(<><span style={{display:"block",fontSize:12,color:axis?.color,fontWeight:400,fontStyle:"italic",marginBottom:8}}>Dans quelle mesure êtes-vous d'accord ?</span>« {q.statement} »</>):q.question}
          </p>
          {q.type==="choice"&&q.options.map((opt,i)=>{
            const sel=answers[q.id]===i;
            const col=axis?.color||"#3A7BD5";
            return(
              <button key={i} onClick={()=>handleAnswer(i)} style={{display:"block",width:"100%",textAlign:"left",background:sel?axis?.light:"#FAFAF7",border:`1.5px solid ${sel?col:"#E8E0D0"}`,borderRadius:8,padding:"11px 15px",marginBottom:9,fontSize:14,color:sel?col:"#2C2018",fontFamily:F.family,cursor:"pointer",transition:"all 0.15s",fontWeight:sel?700:400}}>
                <span style={{color:col,marginRight:8}}>{sel?"●":"○"}</span>{opt.text}
              </button>
            );
          })}
          {q.type==="agree"&&(
            <div style={{display:"flex",gap:10,marginTop:8}}>
              {[{val:1,label:"D'accord",col:axis?.color},{val:2,label:"Neutre",col:G},{val:3,label:"Pas d'accord",col:"#6E3B1B"}].map(({val,label,col})=>(
                <button key={val} onClick={()=>handleAnswer(val)} style={{flex:1,padding:"12px 6px",borderRadius:8,border:`1.5px solid ${answers[q.id]===val?col:"#E8E0D0"}`,background:answers[q.id]===val?(val===1?axis?.light:val===3?"#FAF0E8":"#F5F5F5"):"#FAFAF7",color:answers[q.id]===val?col:"#8A8078",fontFamily:F.family,fontSize:13,fontWeight:answers[q.id]===val?700:400,cursor:"pointer",transition:"all 0.15s",textAlign:"center"}}>
                  {answers[q.id]===val?"● ":"○ "}{label}
                </button>
              ))}
            </div>
          )}
        </div>
        {showIns&&(
          <div style={{background:"linear-gradient(135deg,#F4F7FA,#EBF3FA)",borderLeft:`4px solid ${axis?.color}`,borderRadius:8,padding:"16px 20px",margin:"18px 0"}}>
            <div style={{fontSize:12,fontWeight:700,color:axis?.color,marginBottom:6}}>💡 {INSIGHTS[q.id].title}</div>
            <div style={{fontSize:13,color:"#5C3D0A",lineHeight:1.65,fontStyle:"italic"}}>{INSIGHTS[q.id].body}</div>
          </div>
        )}
        <div style={{textAlign:"center",marginTop:20}}>
          <button onClick={next} disabled={!answered} style={{background:answered?D:"#E8E0D0",color:answered?"white":G,border:"none",padding:"13px 36px",fontSize:15,fontFamily:F.family,cursor:answered?"pointer":"default",letterSpacing:"0.05em",borderRadius:4,transition:"background 0.2s"}}>
            {current+1>=TOTAL?"Voir ma cartographie →":"Suivant →"}
          </button>
        </div>
      </div>
    </div>
  );

  if(step==="result")return(
    <div style={{fontFamily:F.family,background:"#FAFAF7",minHeight:"100vh"}}>
      <div style={{background:D,padding:"12px 20px"}}>
        <span style={{color:Au,fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase"}}>The Game of Life · Votre Cartographie</span>
      </div>
      <div style={{maxWidth:620,margin:"0 auto",padding:"32px 18px 60px"}}>

        {!genre?(
          <div style={{textAlign:"center",padding:"20px 0 32px"}}>
            <div style={{fontSize:11,color:Au,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:16}}>Votre cartographie est prête</div>
            <div style={{width:40,height:2,background:Au,margin:"0 auto 20px"}}/>
            <p style={{fontSize:14,color:"#5C3D0A",lineHeight:1.7,marginBottom:24,fontStyle:"italic",maxWidth:400,margin:"0 auto 24px"}}>
              Pour personnaliser votre rapport, précisez comment vous adresser :
            </p>
            <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
              {[{val:"m",label:"Au masculin"},{val:"f",label:"Au féminin"},{val:"n",label:"Sans préférence"}].map(({val,label})=>(
                <button key={val} onClick={()=>setGenre(val)} style={{padding:"13px 22px",borderRadius:8,border:"1.5px solid #E8E0D0",background:"white",color:"#5C3D0A",fontFamily:F.family,fontSize:14,cursor:"pointer",transition:"all 0.15s",boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ):(
          <>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:11,color:Au,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>Votre profil</div>
              <h2 style={{fontSize:26,color:D,margin:"0 0 8px",fontWeight:700}}>{profData.title}</h2>
              <div style={{width:40,height:2,background:Au,margin:"10px auto 16px"}}/>
              <p style={{fontSize:13,color:"#5C3D0A",lineHeight:1.7,fontStyle:"italic",maxWidth:460,margin:"0 auto"}}>{profData.desc}</p>
            </div>
            <div style={{maxWidth:320,margin:"0 auto 28px"}}><Radar scores={scores} size={320}/></div>
            <div style={{marginBottom:28}}>
              {AXES.map(ax=>{
                const s=scores[ax.id]||0;
                return(
                  <div key={ax.id} style={{display:"flex",alignItems:"center",gap:12,background:"white",borderRadius:8,padding:"12px 16px",marginBottom:8,boxShadow:"0 1px 8px rgba(0,0,0,0.05)",borderLeft:`3px solid ${ax.color}`}}>
                    <div style={{minWidth:32}}><div style={{fontSize:10,fontWeight:700,color:ax.color}}>{ax.id}</div></div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:700,color:D,marginBottom:4}}>{ax.short} <span style={{fontSize:10,color:G,fontWeight:400}}>· {ax.pro?"Professionnel":"Personnel"}</span></div>
                      <div style={{height:4,background:"#E8E0D0",borderRadius:2}}>
                        <div style={{height:"100%",width:`${(s/5)*100}%`,background:ax.color,borderRadius:2,transition:"width 1s ease"}}/>
                      </div>
                    </div>
                    <div style={{fontSize:20,fontWeight:700,color:ax.color,minWidth:40,textAlign:"right"}}>{s.toFixed(1)}</div>
                  </div>
                );
              })}
            </div>

            <div style={{background:D,borderRadius:10,padding:"24px",border:`2px solid ${profData.color}`}}>
              <div style={{fontSize:16,fontWeight:700,color:"white",marginBottom:20,textAlign:"center"}}>Recevez votre rapport</div>
              {!submitted?(
                <>
                  <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
                    <input value={nom} onChange={e=>setNom(e.target.value)}
                      placeholder="Prénom"
                      style={{padding:"11px 14px",fontSize:14,fontFamily:F.family,border:`1.5px solid ${nom?Au:"#2E4060"}`,background:"#162030",color:"white",borderRadius:6,outline:"none"}}/>
                    <input
                      value={dob}
                      onChange={e=>setDob(formatDob(e.target.value))}
                      placeholder="jj/mm/aaaa"
                      inputMode="numeric"
                      maxLength={10}
                      style={{padding:"11px 14px",fontSize:14,fontFamily:F.family,border:`1.5px solid ${dob.length===10?Au:"#2E4060"}`,background:"#162030",color:"white",borderRadius:6,outline:"none",letterSpacing:"0.05em"}}/>
                    <input value={email} onChange={e=>setEmail(e.target.value)}
                      placeholder="Email"
                      type="email"
                      style={{padding:"11px 14px",fontSize:14,fontFamily:F.family,border:`1.5px solid ${email?Au:"#2E4060"}`,background:"#162030",color:"white",borderRadius:6,outline:"none"}}/>
                  </div>
                  {sendError&&<p style={{color:"#FF6B6B",fontSize:12,marginBottom:8,textAlign:"center"}}>{sendError}</p>}
                  <button onClick={handleSubmit} disabled={!nom||!email||sending} style={{width:"100%",background:nom&&email&&!sending?profData.color:"#2E4060",color:"white",border:"none",padding:"14px",fontSize:15,fontFamily:F.family,cursor:nom&&email?"pointer":"default",borderRadius:6,fontWeight:700,transition:"background 0.2s"}}>
                    {sending?"Envoi en cours...":"Valider →"}
                  </button>
                  <p style={{fontSize:11,color:G,fontStyle:"italic",margin:"10px 0 0",textAlign:"center"}}>Données confidentielles. Aucun spam.</p>
                </>
              ):(
                <div style={{textAlign:"center",padding:"16px 0"}}>
                  <div style={{fontSize:32,marginBottom:12}}>✓</div>
                  <p style={{color:Au,fontSize:16,fontWeight:700,margin:"0 0 8px"}}>Merci {nom}.</p>
                  <p style={{color:"#C8D8E8",fontSize:13,fontStyle:"italic",margin:"0 0 20px",lineHeight:1.6}}>Votre rapport arrive dans votre boîte dans quelques minutes.</p>
                  <a href={CTA_REDIRECT_URL} style={{display:"inline-block",background:profData.color,color:"white",textDecoration:"none",padding:"13px 28px",borderRadius:6,fontSize:14,fontWeight:700,fontFamily:F.family}}>
                    Explorer ces pistes →
                  </a>
                </div>
              )}
            </div>

            {submitted&&(
              <div style={{marginTop:28,background:"white",borderRadius:10,overflow:"hidden",boxShadow:"0 2px 16px rgba(13,26,43,0.08)"}}>
                <div style={{background:D,padding:"20px 24px",borderBottom:`3px solid ${Au}`}}>
                  <div style={{fontSize:10,color:Au,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6}}>The Game of Life</div>
                  <div style={{fontSize:20,fontWeight:700,color:"white",lineHeight:1.3}}>Des pistes à explorer ensemble</div>
                </div>
                <div style={{padding:"24px"}}>
                  {[
                    {icon:"📄",title:"Votre rapport personnalisé",color:"#2E6090",desc:"Une analyse complète de vos 6 dimensions avec votre toile d'araignée, votre profil et des pistes de travail concrètes distinguant développement professionnel et personnel."},
                    {icon:"🎥",title:"Le chemin vers votre plus haut potentiel",color:"#1B5E6E",desc:"Un tuto vidéo qui présente les 12 mouvements du Jeu de la Vie — pour comprendre où vous en êtes, ce qui vous freine, et ce que la suite peut ressembler."},
                    {icon:"🎙️",title:"Visio collective — En chemin ensemble",color:"#1B5E3B",desc:"1h30 avec d'autres personnes qui traversent les mêmes questions. Un espace rare de partage, de reconnaissance mutuelle, et de réflexion collective."},
                    {icon:"🎯",title:"Session individuelle offerte — 45 minutes",color:"#4A2C6E",desc:"Un entretien en tête-à-tête pour nommer votre blocage prioritaire, comprendre sa logique, et repartir avec une direction claire. Sans engagement."},
                  ].map((item,i)=>(
                    <div key={i} style={{display:"flex",gap:16,padding:"16px 0",borderBottom:i<3?"1px solid #EEE8DE":"none"}}>
                      <div style={{fontSize:24,minWidth:36}}>{item.icon}</div>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,color:item.color,marginBottom:4}}>{item.title}</div>
                        <div style={{fontSize:13,color:"#5C3D0A",lineHeight:1.6,fontStyle:"italic"}}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{marginTop:20,background:"#F4F7FA",borderRadius:8,padding:"16px",borderLeft:`3px solid ${Au}`}}>
                    <div style={{fontSize:13,color:D,lineHeight:1.7}}><b>La suite vous appartient.</b> Ce que vous avez vu ici n'est qu'un premier miroir. Le chemin vers votre plus haut potentiel commence par la reconnaissance — et vous venez de franchir ce premier pas.</div>
                    <div style={{marginTop:10,fontSize:12,color:G,fontStyle:"italic"}}>christophe@thegameoflife.com</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <p style={{textAlign:"center",fontSize:10,color:G,fontStyle:"italic",marginTop:24}}>
          The Game of Life · Christophe Jouret · 2026
        </p>
      </div>
    </div>
  );
}
