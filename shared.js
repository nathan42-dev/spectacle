// Logique partagée entre tous les écrans (display, loges, public, technique) :
// métadonnées de statut (y compris spectacle suspendu / annulé), formatage
// du minuteur, et palette des couleurs d'annonce. Un seul endroit à modifier
// si un statut change de libellé ou de couleur.

export const statusMeta = {
  before:       { label: "AVANT SPECTACLE", sub: "Portes fermées",            icon:"🏰", tone:"before" },
  doors:        { label: "PORTES OUVERTES", sub: "Public en entrée",          icon:"🚪", tone:"doors" },
  live:         { label: "EN COURS",        sub: "Spectacle en direct",       icon:"🔥", tone:"live" },
  intermission: { label: "ENTRACTE",        sub: "Pause",                     icon:"⏸", tone:"intermission" },
  encore:       { label: "RAPPEL",          sub: "Rappel en cours",           icon:"⚔", tone:"encore" },
  end:          { label: "TERMINÉ",         sub: "Fin de spectacle",          icon:"🏁", tone:"end" },
  suspended:    { label: "SPECTACLE SUSPENDU", sub: "En pause — restez en place", icon:"⏸", tone:"suspended" },
  cancelled:    { label: "SPECTACLE ANNULÉ",   sub: "Consignes en régie",        icon:"✕", tone:"cancelled" },
};

// Libellés adaptés pour l'écran public (langage accueillant, sans jargon régie).
export const publicStatusMeta = {
  before:       { label: "AVANT SPECTACLE",     sub: "Merci de patienter, les portes ouvriront bientôt", icon:"🏰", tone:"before" },
  doors:        { label: "PORTES OUVERTES",     sub: "Installez-vous, le spectacle va bientôt commencer", icon:"🚪", tone:"doors" },
  live:         { label: "SPECTACLE EN COURS",  sub: "Merci de rester silencieux pendant la représentation", icon:"🔥", tone:"live" },
  intermission: { label: "ENTRACTE",            sub: "Le spectacle reprend dans quelques instants", icon:"⏸", tone:"intermission" },
  encore:       { label: "RAPPEL",              sub: "", icon:"⚔", tone:"encore" },
  end:          { label: "MERCI DE VOTRE VISITE", sub: "À très bientôt !", icon:"🏁", tone:"end" },
  suspended:    { label: "INTERRUPTION MOMENTANÉE", sub: "Merci de patienter, le spectacle va reprendre", icon:"⏸", tone:"suspended" },
  cancelled:    { label: "SPECTACLE ANNULÉ",    sub: "Merci de votre compréhension — rendez-vous à l'accueil", icon:"✕", tone:"cancelled" },
};

export const announceColorMap = {
  gold:"var(--gold-bright)", crimson:"var(--crimson)", forest:"var(--forest)", steel:"var(--steel)"
};

// Calcule quelle scène du déroulé est "en cours" en ce moment.
//
// Deux modes :
// - "auto" (par défaut) : calculé à partir de la durée de chaque scène
//   (champ `duration`, en minutes) et du temps écoulé depuis `liveStartedAt`,
//   en retirant le temps passé en pause (`pausedAccumMs`, accumulé pendant
//   les suspensions). Une scène sans durée valide compte pour 1 minute
//   minimum, pour éviter qu'elle ne soit "sautée" instantanément.
// - "manual" : l'équipe a repris la main sur une scène précise
//   (`manualCurrentIndex`) — le calcul par durée est ignoré tant qu'on
//   n'est pas revenu en mode automatique.
//
// Retourne { currentIndex, remainingMs } — currentIndex vaut -1 si rien
// n'est en cours (spectacle pas démarré, déroulé vide…), remainingMs est
// le temps restant estimé sur la scène en cours (null en mode manuel,
// où la durée n'a pas de sens puisqu'elle est pilotée à la main).
export function computeSceneState(data){
  const order = data.runningOrder || [];
  if (!order.length) return { currentIndex: -1, remainingMs: null };

  if (data.cueMode === "manual" && typeof data.manualCurrentIndex === "number") {
    return { currentIndex: data.manualCurrentIndex, remainingMs: null };
  }

  if (!data.liveStartedAt) return { currentIndex: -1, remainingMs: null };

  const elapsed = Date.now() - data.liveStartedAt - (data.pausedAccumMs || 0);
  let acc = 0;
  for (let i = 0; i < order.length; i++) {
    const durMs = Math.max(1, Number(order[i].duration) || 0) * 60000;
    if (elapsed < acc + durMs) return { currentIndex: i, remainingMs: (acc + durMs) - elapsed };
    acc += durMs;
  }
  return { currentIndex: order.length - 1, remainingMs: 0 };
}

export function fmtDuration(ms){
  const neg = ms < 0;
  const abs = Math.abs(ms);
  const totalSec = Math.floor(abs/1000);
  const h = Math.floor(totalSec/3600);
  const m = Math.floor((totalSec%3600)/60);
  const s = totalSec%60;
  const pad = n => String(n).padStart(2,'0');
  const core = h>0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  return (neg ? "+" : "") + core;
}
