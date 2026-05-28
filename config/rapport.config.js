// ═══════════════════════════════════════════════════════════════════════════════
// rapport.config.js
// FICHIER ÉDITORIAL — modifiable sans toucher au code
//
// Ce fichier contrôle intégralement le contenu et l'apparence du rapport PDF.
// Vous pouvez modifier :
//   - Les couleurs (palette)
//   - Le nom de marque et les textes génériques
//   - Les descriptions de chaque dimension
//   - Les constats et pistes par profil
//   - Les textes de la page finale (CTA)
// ═══════════════════════════════════════════════════════════════════════════════

export const CONFIG = {

  // ── Identité de marque ────────────────────────────────────────────────────
  brand: {
    name:    "The Game of Life",
    author:  "Christophe Jouret",
    email:   "christophe@thegameoflife.com",
    website: "thegameoflife.com",
    year:    "2026",
    tagline: "Rapprochez-vous de votre plus haut potentiel.",
  },

  // ── Palette de couleurs ───────────────────────────────────────────────────
  // Modifier ici change toutes les couleurs du rapport d'un coup
  palette: {
    deep:    "#0D1A2B",   // fond sombre, titres principaux
    blue:    "#2E6090",   // accent principal, D1
    teal:    "#1B5E6E",   // D2
    green:   "#1B5E3B",   // D3
    purple:  "#4A2C6E",   // D4
    gold:    "#8B6914",   // D5, accents dorés
    terra:   "#6E3B1B",   // D6
    warm:    "#5C3D0A",   // texte italique
    grey:    "#7A8A9A",   // texte secondaire
    pale:    "#F4F7FA",   // fond clair
    rule:    "#C4A46A",   // filets dorés
  },

  // ── Textes de la page de couverture ──────────────────────────────────────
  cover: {
    supra:    "Rapport personnalisé",
    title:    "Votre Cartographie",
    subtitle: "6 dimensions · Profil & Perspectives",
  },

  // ── Texte d'introduction (page 2) ────────────────────────────────────────
  intro: {
    paragraph1:
      "Ce rapport a été généré sur la base de vos réponses au questionnaire de " +
      "positionnement The Game of Life. Il ne constitue pas un jugement sur vos " +
      "capacités ou votre valeur — il est une cartographie : une image précise de " +
      "six dimensions clés qui, ensemble, déterminent l'écart entre votre potentiel " +
      "ressenti et ce que vous produisez réellement.",
    paragraph2:
      "Il se structure en trois parties. La première présente le cadre théorique — " +
      "ce que chaque dimension représente et pourquoi elle compte. La deuxième offre " +
      "votre analyse personnelle — ce que vos réponses révèlent. La troisième propose " +
      "des perspectives de développement, distinguant le registre professionnel du " +
      "registre personnel.",
    note:
      "Aucune de ces dimensions n'est figée. Ce que vous voyez ici est un point de " +
      "départ, pas un verdict.",
  },

  // ── Section I — Cadre théorique ───────────────────────────────────────────
  sectionI: {
    title: "Les Six Dimensions",
    intro1:
      "Le modèle des Six Dimensions repose sur une observation simple : l'écart entre " +
      "potentiel ressenti et résultats obtenus n'est presque jamais un problème de " +
      "compétence. Il est le signe d'une ou plusieurs dimensions sous-développées ou " +
      "sous tension — qui coûtent de l'énergie, fragmentent l'attention, ou empêchent " +
      "l'action juste.",
    intro2:
      "Ces six dimensions se répartissent en deux registres complémentaires. Ni l'un " +
      "ni l'autre ne suffit seul : un fondateur techniquement solide mais intérieurement " +
      "désaligné s'épuise sans avancer. Un fondateur aligné intérieurement mais sans " +
      "clarté stratégique tourne en rond.",

    // Boîte Développement Professionnel
    pro: {
      title:  "Développement\nProfessionnel",
      axes:   "D1  ·  D3  ·  D6",
      body:
        "Ces trois dimensions décrivent votre rapport à l'action dans le monde " +
        "professionnel : la clarté de votre direction stratégique (D1), la qualité " +
        "de vos relations et de votre écosystème (D3), et votre capacité à transformer " +
        "une intention en résultat concret (D6). Ensemble, elles déterminent votre " +
        "efficacité opérationnelle et votre impact réel.",
    },

    // Boîte Développement Personnel
    perso: {
      title:  "Développement\nPersonnel",
      axes:   "D2  ·  D4  ·  D5",
      body:
        "Ces trois dimensions décrivent votre rapport à vous-même et à votre chemin " +
        "intérieur : la cohérence de votre énergie (D2), votre conscience de vos " +
        "patterns et votre capacité à vous faire confiance (D4), et votre connexion " +
        "au sens profond de ce que vous construisez (D5). Ensemble, elles déterminent " +
        "votre durabilité et votre alignement.",
    },
  },

  // ── Les 6 dimensions — descriptions théoriques ───────────────────────────
  // Modifiez le texte desc pour changer la description générique dans le rapport
  dimensions: {
    D1: {
      id:    "D1",
      name:  "Clarté Stratégique",
      pro:   true,
      color: "#2E6090",
      desc:
        "La capacité à savoir où vous allez, à trancher vos priorités avec netteté " +
        "et à filtrer rapidement les opportunités selon un cadre de décision stable. " +
        "Une clarté stratégique faible se manifeste par la dispersion, la " +
        "procrastination décisionnelle, et l'impression de courir après les urgences " +
        "plutôt que d'avancer vers la direction choisie.",
    },
    D2: {
      id:    "D2",
      name:  "Énergie & Alignement",
      pro:   false,
      color: "#1B5E6E",
      desc:
        "La cohérence entre ce que vous faites, ce que vous pensez et ce que vous " +
        "voulez vraiment. Cette dimension mesure à la fois votre niveau de vitalité " +
        "et la direction dans laquelle elle s'écoule. Un désalignement produit de " +
        "l'épuisement sans raison apparente, un écart entre effort fourni et résultats " +
        "ressentis, et une perte progressive du sens du lundi matin.",
    },
    D3: {
      id:    "D3",
      name:  "Relation au Collectif",
      pro:   true,
      color: "#1B5E3B",
      desc:
        "La qualité de votre environnement relationnel professionnel : équipe, associés, " +
        "pairs. Cette dimension évalue si vous êtes vraiment entouré — si vous pouvez " +
        "partager les vraies questions, recevoir des challenges sincères et naviguer " +
        "les tensions sans que celles-ci ne consomment votre énergie stratégique.",
    },
    D4: {
      id:    "D4",
      name:  "Rapport à Soi",
      pro:   false,
      color: "#4A2C6E",
      desc:
        "Votre capacité à vous connaître en action : reconnaître quand la peur guide " +
        "vos décisions, identifier vos patterns répétitifs, et vous faire suffisamment " +
        "confiance pour traverser l'incertitude sans perdre votre axe. C'est la " +
        "dimension la plus invisible — et souvent la plus déterminante pour la qualité " +
        "de vos décisions.",
    },
    D5: {
      id:    "D5",
      name:  "Sens & Vision",
      pro:   false,
      color: "#8B6914",
      desc:
        "Votre connexion au sens profond de ce que vous construisez — ce qui dépasse " +
        "le business et qui donne à votre action une direction irréductible. Un sens " +
        "affaibli produit du vide malgré le succès apparent. Un sens fort sans ancrage " +
        "dans l'action produit de la vision sans manifestation.",
    },
    D6: {
      id:    "D6",
      name:  "Manifestation",
      pro:   true,
      color: "#6E3B1B",
      desc:
        "La cohérence entre vos intentions et ce que vous produisez réellement dans " +
        "le monde. Cette dimension est le pont entre toutes les autres : clarté " +
        "stratégique, alignement intérieur et vision ne produisent des résultats " +
        "concrets que si la manifestation fonctionne. C'est l'axe de l'exécution.",
    },
  },

  // ── Section II — Texte d'intro analyse ───────────────────────────────────
  sectionII: {
    intro1:
      "Voici ce que vos réponses révèlent. Le graphique ci-dessous présente votre " +
      "position actuelle sur les six dimensions (zone bleue), la perspective de " +
      "développement accessible à court terme (zone pointillée), et le potentiel " +
      "théorique complet de chaque dimension (fond clair à 5/5).",
    intro2:
      "L'écart entre votre position actuelle et la perspective de développement est " +
      "l'espace de travail. Il ne s'agit pas de tout atteindre simultanément — mais " +
      "de comprendre sur quelles dimensions le travail produira le plus d'effet.",
  },

  // ── Profils — description et constats par dimension ──────────────────────
  profiles: {
    dispersé: {
      label: "Le Fondateur Dispersé",
      description:
        "Ce profil indique une dispersion de l'énergie sur trop de fronts " +
        "simultanément. La vision est présente, l'énergie est réelle — mais " +
        "l'exécution et la clarté stratégique ne suivent pas au même niveau. " +
        "Le travail prioritaire est celui du cadre de décision et de l'exécution ciblée.",

      // Constats par dimension — personnalisés selon le profil
      constats: {
        D1: "Votre clarté stratégique est la dimension la plus tendue de votre cartographie. Les réponses indiquent une difficulté à trancher les priorités et une tendance à remettre les mêmes décisions. Vous voyez où vous voulez aller — mais le chemin manque de netteté, ce qui génère une dispersion d'énergie coûteuse.",
        D2: "Votre énergie est globalement préservée, mais elle n'est pas toujours bien dirigée. Il y a un écart entre ce que vous dépensez et ce que vous produisez. Le sens reste votre principale source de recharge — c'est un atout, à condition de le cultiver activement.",
        D3: "La relation au collectif est une zone de tension modérée. Vous fonctionnez souvent seul sur les vraies questions, et les tensions dans l'équipe ou avec des associés prennent plus de place qu'elles ne le devraient.",
        D4: "Votre rapport à vous-même est relativement solide. Vous avez une conscience de vos patterns et une capacité à traverser l'incertitude. La principale zone de travail est la tendance à décider pour éviter un conflit plutôt que par conviction profonde.",
        D5: "C'est l'une de vos dimensions les plus vivantes. Vous avez le sens et la vision. Le risque est de rester dans la vision sans l'ancrer dans une action concrète.",
        D6: "La manifestation est la dimension la plus critique de votre profil. Il y a un écart significatif entre ce que vous initiez et ce qui se concrétise réellement. Les cycles se répètent. L'exécution coûte de l'énergie sans produire les résultats attendus.",
      },

      // Pistes professionnelles
      pistes_pro: {
        D1: "Clarifier votre cadre de décision est la priorité absolue. Non pas en faisant plus d'analyses, mais en créant un filtre simple et robuste pour trancher rapidement. La session stratégique individuelle est précisément conçue pour ce travail.",
        D3: "Reconstruire un cercle de qualité autour de vous — des personnes qui challengent plutôt qu'approuvent — est une condition de progrès. Cela commence par une conversation honnête avec les personnes clés de votre entourage professionnel.",
        D6: "Le travail sur la manifestation commence par identifier un seul cycle bloquant et le défaire complètement, avant d'en attaquer d'autres. C'est un travail qui se fait mieux avec un regard extérieur calibré sur votre réalité spécifique.",
      },

      // Pistes personnelles
      pistes_perso: {
        D2: "Cartographier ce qui vous recharge vraiment versus ce qui vous draine est une priorité pratique. Une heure de silence par semaine pour faire le point sur l'alignement de vos actions avec votre sens peut changer significativement votre rapport au lundi matin.",
        D4: "Le pattern de décision par évitement mérite une attention spécifique. Il est probable qu'il se rejoue dans plusieurs contextes de votre vie professionnelle. Le nommer est déjà un premier pas.",
        D5: "Votre vision est une ressource — pas un programme. Le travail est de trouver comment elle s'incarne dans une action spécifique et mesurable cette semaine, pas dans un projet ambitieux dans 18 mois.",
      },
    },

    silencieux: {
      label: "Le Fondateur Silencieux",
      description:
        "Les résultats sont là, mais quelque chose ne l'est plus. Vous avez réussi " +
        "à construire — et vous vous demandez si c'est encore ce que vous voulez. " +
        "Il y a un sens à retrouver, pas une stratégie à corriger.",

      constats: {
        D1: "Votre clarté stratégique est fonctionnelle — vous savez faire. Mais une partie de vous se demande si c'est encore dans la bonne direction. Le cadre de décision est là ; c'est la boussole qui mérite d'être recalibrée.",
        D2: "L'énergie est votre signal le plus important en ce moment. Il y a une fatigue qui n'est pas physique — c'est le signe d'un désalignement entre ce que vous faites et ce que vous êtes vraiment.",
        D3: "Vous êtes peut-être entouré — mais pas toujours compris sur ce qui se passe vraiment en vous. La solitude du fondateur à ce stade n'est pas un manque de personnes, c'est un manque de rencontre vraie.",
        D4: "C'est ici que se joue l'essentiel pour vous. Votre rapport à vous-même — vos patterns, vos peurs, ce que vous évitez de regarder — est au cœur de ce qui vous freine actuellement.",
        D5: "Le sens s'est affaibli ou a changé. Ce que vous construisiez avec passion n'a peut-être plus le même goût. C'est une invitation à explorer ce qui compte vraiment maintenant — pas ce qui comptait avant.",
        D6: "La manifestation est correcte en surface — vous produisez. Mais vous sentez que ce que vous produisez n'est plus tout à fait aligné avec ce que vous voulez vraiment créer.",
      },

      pistes_pro: {
        D1: "Revisiter votre direction — pas votre plan d'exécution — est le travail prioritaire. Pas pour tout changer, mais pour vérifier que vous courez encore vers quelque chose qui vous appartient vraiment.",
        D3: "Chercher des espaces de rencontre authentique avec d'autres fondateurs qui traversent des questions similaires peut créer une qualité de connexion que votre entourage habituel ne peut pas offrir.",
        D6: "Plutôt que d'optimiser l'exécution, la question est : est-ce que ce que je produis est encore ce que je veux produire ? La réponse à cette question précède tout autre ajustement opérationnel.",
      },

      pistes_perso: {
        D2: "Faire le point honnête sur ce qui vous recharge encore — et ce qui ne vous recharge plus — est une priorité. Pas pour tout arrêter, mais pour ne plus vous épuiser là où ça ne nourrit plus rien.",
        D4: "Un espace de réflexion en profondeur — avec quelqu'un qui peut tenir le miroir sans agenda — peut vous aider à voir ce que vous ne pouvez pas voir seul depuis l'intérieur.",
        D5: "Le sens ne se retrouve pas en cherchant une nouvelle mission. Il se retrouve en allant plus profond dans ce qui était déjà là, sous les couches de performance et d'adaptation.",
      },
    },

    croisée: {
      label: "Le Fondateur à la Croisée",
      description:
        "Vous êtes à un vrai tournant. Ce n'est pas une crise — c'est une transition. " +
        "Ce que vous avez construit ne suffit plus à vous tenir. Quelque chose de " +
        "nouveau appelle, mais vous ne savez pas encore quoi ni comment.",

      constats: {
        D1: "La clarté stratégique est en suspens — non par manque de compétence, mais parce que vous ne savez plus encore vers quoi orienter cette compétence. C'est normal à ce stade du chemin.",
        D2: "Votre énergie fluctue significativement. Il y a des moments de clarté et d'élan, et d'autres de vide ou de doute intense. Ce n'est pas un signe de faiblesse — c'est le signe d'une transition en cours.",
        D3: "Les relations autour de vous ne comprennent pas toujours ce que vous traversez. Vous avez besoin de personnes qui ont elles-mêmes traversé un tournant similaire — pas de conseils, de présence.",
        D4: "C'est votre dimension la plus travaillée en ce moment — souvent sans le choisir. Les questions sur qui vous êtes, ce que vous voulez, et ce dont vous avez peur remontent naturellement.",
        D5: "Le sens est à la fois la source de votre inconfort et votre boussole. Ce qui vous dérange, c'est précisément que quelque chose appelle — et que vous ne savez pas encore comment y répondre.",
        D6: "La manifestation est en pause ou en transition. Ce n'est pas le moment d'optimiser l'exécution — c'est le moment de comprendre ce qui mérite d'être exécuté.",
      },

      pistes_pro: {
        D1: "Ne pas forcer la clarté stratégique dans ce moment. Ce qui est utile maintenant c'est de créer les conditions pour qu'elle émerge — pas de la construire intellectuellement.",
        D3: "Trouver une communauté de fondateurs qui traversent ou ont traversé des transitions similaires. Pas pour des conseils — pour ne plus traverser seul.",
        D6: "Identifier ce que vous ne voulez plus faire est souvent plus utile que de définir ce que vous voulez faire. C'est un premier pas vers une manifestation réalignée.",
      },

      pistes_perso: {
        D2: "Préserver votre énergie est la priorité absolue dans une période de transition. Cela peut signifier réduire temporairement des engagements pour créer de l'espace intérieur.",
        D4: "Ce moment est une invitation à un travail de profondeur sur vous-même — pas pour vous améliorer, mais pour vous comprendre. Un accompagnement individuel adapté peut être transformatif ici.",
        D5: "La vision qui cherche à s'exprimer à travers vous mérite d'être entendue — pas encore réalisée, juste entendue. Des pratiques contemplatives, de l'écriture, ou des conversations profondes peuvent aider.",
      },
    },
  },

  // ── Section III — Texte d'intro perspectives ──────────────────────────────
  sectionIII: {
    intro:
      "Cette section propose des directions de travail concrètes pour les dimensions " +
      "qui méritent une attention prioritaire. Elles sont organisées selon les deux " +
      "registres du cadre — professionnel et personnel — parce que les leviers " +
      "d'action ne sont pas les mêmes, et parce que traiter l'un sans l'autre " +
      "produit des résultats incomplets.",
    note:
      "Ces pistes ne sont pas des solutions. Ce sont des directions. La manière dont " +
      "vous les traversez dépend de votre situation spécifique — c'est précisément " +
      "ce que le travail d'accompagnement permet d'affiner.",
    pro_intro:
      "Les dimensions professionnelles décrivent votre rapport à l'action dans le monde. " +
      "Les pistes qui suivent sont opérationnelles — elles produisent des effets " +
      "mesurables à court terme si elles sont véritablement engagées.",
    perso_intro:
      "Les dimensions personnelles travaillent à un rythme différent — plus lent, " +
      "plus profond, mais plus durable. Les pistes qui suivent ne produisent pas " +
      "d'effets immédiats visibles, mais elles modifient la qualité du terrain sur " +
      "lequel toutes les autres dimensions s'appuient.",
  },

  // ── Page finale — CTA ─────────────────────────────────────────────────────
  finale: {
    title: "Ce que la suite peut ressembler",
    paragraph1:
      "Ce rapport est un premier miroir. Ce qu'il vous montre est réel — et il " +
      "montre aussi l'espace entre où vous en êtes et où vous pourriez être. Cet " +
      "espace n'est pas un manque. C'est un territoire de travail.",
    paragraph2:
      "La plupart des fondateurs qui lisent ce type de rapport reconnaissent quelque " +
      "chose qu'ils savaient déjà, sans avoir trouvé les mots pour le dire. Et la " +
      "reconnaissance est toujours le premier pas — pas vers une solution, mais vers " +
      "une direction.",
    italic:
      "Le chemin ne commence pas quand tout est clair. Il commence quand vous décidez " +
      "de ne plus naviguer seul dans le flou.",
    cta_title:   "Une prochaine étape concrète",
    cta_body:
      "Si ce rapport résonne — si vous reconnaissez dans ces pages quelque chose que " +
      "vous portez depuis un moment — la suite naturelle est un échange direct. Pas " +
      "pour vendre quelque chose, mais pour voir si et comment un travail ensemble " +
      "aurait du sens dans votre situation spécifique.",
    cta_button:  "Réserver une session de 30 minutes",
  },
};

export default CONFIG;
