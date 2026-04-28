import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { HOUSE_RULES } from "./house-rules.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  collection,
  serverTimestamp,
  runTransaction,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAUcp4N3YQjpDBf9vUNZni12PiY4_cIgds",
  authDomain: "beerlympics-2026-live.firebaseapp.com",
  projectId: "beerlympics-2026-live",
  storageBucket: "beerlympics-2026-live.firebasestorage.app",
  messagingSenderId: "514383788804",
  appId: "1:514383788804:web:2c2c00a39a1a925f79ae51"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const GAME_TYPES = [
  { id: "beer_pong", name: "Beer Pong", teams: 2 },
  { id: "flip_cup", name: "Flip Cup", teams: 4 },
  { id: "beerio_kart", name: "Beerio Kart", teams: 2 },
  { id: "die", name: "Die", teams: 2 },
  { id: "drinkball", name: "Drinkball", teams: 2 },
];

const STORAGE_KEYS = {
  activeTeamId: "beerlympics_active_team",
  adminMode: "beerlympics_admin_mode",
  activeGameCode: "beerlympics_active_game_code",
  currentGameCode: "beerlympics_current_game_code",
  hostId: "beerlympics_host_id",
  pendingTeamAction: "beerlympics_pending_team_action",
};

const form = document.getElementById("team-form");
const saveStatus = document.getElementById("save-status");
const nextGameCard = document.getElementById("next-game");
const scoreActions = document.getElementById("score-actions");
const leaderboardSection = document.getElementById("leaderboard-section");
const playerSection = document.getElementById("player-section");
const rulesSection = document.getElementById("rules-section");
const refSection = document.getElementById("ref-section");
const rosterSection = document.getElementById("roster-section");
const controlSection = document.getElementById("control-section");
const leaderboardEl = document.getElementById("leaderboard");
const rosterEl = document.getElementById("roster");
const rosterForm = document.getElementById("roster-form");
const rosterStatus = document.getElementById("roster-status");
const rosterEdit = document.getElementById("roster-edit");
const rosterEditTitle = document.getElementById("roster-edit-title");
const rosterEditDescription = document.getElementById("roster-edit-description");
const rosterPlayerName = document.getElementById("rosterPlayerName");
const rosterPartnerName = document.getElementById("rosterPartnerName");
const rosterCountry = document.getElementById("rosterCountry");
const removeTeamButton = document.getElementById("remove-team");
const mergePanel = document.getElementById("merge-panel");
const mergeSourceSelect = document.getElementById("merge-source");
const mergeTargetSelect = document.getElementById("merge-target");
const mergeButton = document.getElementById("merge-button");
const mergeStatus = document.getElementById("merge-status");
const adminToggle = document.getElementById("admin-toggle");
const adminStatus = document.getElementById("admin-status");
const adminPanel = document.getElementById("admin-panel");
const adminActionStatus = document.getElementById("admin-action-status");
const gameCodeEl = document.getElementById("game-code");
const joinQrEl = document.getElementById("join-qr");
const joinLinkEl = document.getElementById("join-link");
const joinDomainEl = document.getElementById("join-domain");
const copyJoinLinkButton = document.getElementById("copy-join-link");
const shareJoinLinkButton = document.getElementById("share-join-link");
const currentMatchesEl = document.getElementById("current-matches");
const newGameButton = document.getElementById("new-game");
const resetGameButton = document.getElementById("reset-game");
const clearResultsButton = document.getElementById("clear-results");
const startGameButton = document.getElementById("start-game");
const joinGameButton = document.getElementById("join-game");
const tabs = document.querySelectorAll(".tab");
const leaderboardTab = document.querySelector('.tab[data-view="leaderboard"]');
const controlTab = document.getElementById("control-tab");
const toastContainer = document.getElementById("toast-container");
const modePill = document.getElementById("mode-pill");
const hostPill = document.getElementById("host-pill");
const stepper = document.getElementById("stepper");
const playerNameInput = document.getElementById("playerName");
const partnerNameInput = document.getElementById("partnerName");
const countryInput = document.getElementById("country");
const gameCodeInput = document.getElementById("gameCode");
const playerNameHint = document.getElementById("playerName-hint");
const partnerNameHint = document.getElementById("partnerName-hint");
const countryHint = document.getElementById("country-hint");
const gameCodeHint = document.getElementById("gameCode-hint");
const mobileWelcome = document.getElementById("mobile-welcome");
const mobileSplash = document.getElementById("mobile-splash");
const mobileDock = document.getElementById("mobile-dock");
const mobileContinueButton = document.getElementById("mobile-continue");
const mobileCodeContinueButton = document.getElementById("mobileCodeContinueBtn");
const mobileDownloadAppButton = document.getElementById("mobileDownloadAppBtn");
const mobileLetsPlayButton = document.getElementById("mobileLetsPlayBtn");
const mobileOnboardingCodeCard = document.getElementById("mobile-onboarding-code");
const mobileOnboardingTeamCard = document.getElementById("mobile-onboarding-team");
const mobileGameCodeInput = document.getElementById("mobileGameCodeInput");
const mobileOnboardingNote = document.getElementById("mobile-onboarding-note");
const mobilePlayerNameInput = document.getElementById("mobilePlayerNameInput");
const mobilePartnerNameInput = document.getElementById("mobilePartnerNameInput");
const mobileCountryInput = document.getElementById("mobileCountryInput");
const mobileRegisterPanel = document.getElementById("mobile-register-panel");
const mobileAccessPanel = document.getElementById("mobile-access-panel");
const mobilePlayPanel = document.getElementById("mobile-play-panel");
const manualRefreshButton = document.getElementById("manual-refresh");
const mobileExitGameButton = document.getElementById("mobile-exit-game-btn");
const mobileBottomNav = document.getElementById("mobile-bottom-nav");
const mobileNavTabs = document.querySelectorAll(".mobile-bottom-nav__tab");
const installAppButton = document.getElementById("install-app-btn");
const installModal = document.getElementById("install-modal");
const installModalBackdrop = document.getElementById("install-modal-backdrop");
const installModalClose = document.getElementById("install-modal-close");
const installModalNote = document.getElementById("install-modal-note");
const installSteps = document.getElementById("install-steps");
const exitModal = document.getElementById("exit-modal");
const exitModalBackdrop = document.getElementById("exit-modal-backdrop");
const exitModalClose = document.getElementById("exit-modal-close");
const exitRemoveButton = document.getElementById("exit-remove-btn");
const exitPauseButton = document.getElementById("exit-pause-btn");

const ADMIN_PASSCODE = "3241";

const MANUAL_REFRESH_DELAY_MS = 2 * 60 * 1000;
const TOAST_DISPLAY_MS = 4200;
const TOAST_EXIT_MS = 260;
let manualRefreshTimeout;

const normalizeGameCode = (value) => value.trim().replace(/\s+/g, "");
const generateGameCode = () =>
  String(Math.floor(1000 + Math.random() * 9000));

// Session-scoped game/join state is intentionally stored in sessionStorage so a
// normal app switch can resume, but a fresh browser/PWA session starts at Step 1.
// PWAs cannot reliably detect iOS "force close", so session scope is the safest
// practical approximation of "current run only" behavior.
const getSessionValue = (key) => {
  const current = sessionStorage.getItem(key);
  if (current !== null) return current;
  const legacy = localStorage.getItem(key);
  if (legacy !== null) {
    sessionStorage.setItem(key, legacy);
    localStorage.removeItem(key);
  }
  return legacy;
};

const setSessionValue = (key, value) => {
  sessionStorage.setItem(key, value);
  localStorage.removeItem(key);
};

const clearSessionValue = (key) => {
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
};

const getPendingTeamAction = () => {
  const raw = getSessionValue(STORAGE_KEYS.pendingTeamAction);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Invalid pending team action payload; clearing.", error);
    clearSessionValue(STORAGE_KEYS.pendingTeamAction);
    return null;
  }
};

const setPendingTeamAction = (payload) => {
  if (!payload) {
    clearSessionValue(STORAGE_KEYS.pendingTeamAction);
    return;
  }
  setSessionValue(STORAGE_KEYS.pendingTeamAction, JSON.stringify(payload));
};

const clearPendingTeamAction = () => {
  clearSessionValue(STORAGE_KEYS.pendingTeamAction);
};

const getCurrentGameCode = () => getSessionValue(STORAGE_KEYS.currentGameCode);
const getActiveGameCode = () => getSessionValue(STORAGE_KEYS.activeGameCode);
const setActiveGameCode = (code) =>
  setSessionValue(STORAGE_KEYS.activeGameCode, code);

const setCurrentGameCode = (code) =>
  setSessionValue(STORAGE_KEYS.currentGameCode, code);

const setGameCodes = (code) => {
  setCurrentGameCode(code);
  setActiveGameCode(code);
};

const withTimeout = (promise, timeoutMs, message) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });

const showToast = (message, type = "info") => {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("is-leaving");
    setTimeout(() => {
      toast.remove();
    }, TOAST_EXIT_MS);
  }, TOAST_DISPLAY_MS);
};

const setButtonLoading = (button, isLoading, label) => {
  if (!button) return;
  button.disabled = isLoading;
  button.classList.toggle("loading", isLoading);
  if (label) {
    // Store the original label the first time we see one
    button.dataset.defaultLabel = button.dataset.defaultLabel || button.textContent;
  }
  if (isLoading && label) {
    button.textContent = label;
  } else if (!isLoading && button.dataset.defaultLabel) {
    // Always restore the original text when loading ends, even if no label passed
    button.textContent = button.dataset.defaultLabel;
  }
};

let pendingMobileGameCode = "";
let deferredInstallPrompt = null;
const MOBILE_SPLASH_MS = 2100;
const MOBILE_SPLASH_EXIT_MS = 320;
let mobileSplashTimer = null;
let mobileBootFinalized = false;
let mobileSplashExitTimer = null;

const resetJoinButtonLabels = () => {
  if (joinGameButton) {
    joinGameButton.dataset.defaultLabel = "Lock in our team 🚀";
    joinGameButton.textContent = "Lock in our team 🚀";
    setButtonLoading(joinGameButton, false);
  }
  if (mobileCodeContinueButton) {
    mobileCodeContinueButton.dataset.defaultLabel = "Join game";
    mobileCodeContinueButton.textContent = "Join game";
    setButtonLoading(mobileCodeContinueButton, false);
  }
};

const finalizeMobileBoot = () => {
  if (!document.body) return;

  if (mobileSplashExitTimer) {
    clearTimeout(mobileSplashExitTimer);
    mobileSplashExitTimer = null;
  }

  mobileBootFinalized = true;

  if (mobileSplashTimer) {
    clearTimeout(mobileSplashTimer);
    mobileSplashTimer = null;
  }

  const completeBoot = () => {
    document.body.classList.remove("is-splash-active", "is-splash-exiting", "pre-mobile-app");
    if (isMobileLayout()) {
      document.body.classList.add("mobile-app");
      document.documentElement.classList.add("mobile-app-bg");
      document.documentElement.classList.remove("mobile-preload");
    } else {
      document.documentElement.classList.remove("mobile-preload");
    }
  };

  if (document.body.classList.contains("is-splash-active")) {
    document.body.classList.add("is-splash-exiting");
    mobileSplashExitTimer = setTimeout(() => {
      mobileSplashExitTimer = null;
      completeBoot();
    }, MOBILE_SPLASH_EXIT_MS);
    return;
  }

  completeBoot();
};

const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent || "");
const isAndroid = () => /Android/i.test(navigator.userAgent || "");
const isSafari = () => {
  const ua = navigator.userAgent || "";
  return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|OPT/i.test(ua);
};
const isStandaloneMode = () => {
  const displayModeMedia = window.matchMedia
    ? window.matchMedia("(display-mode: standalone)")
    : null;
  return Boolean(displayModeMedia?.matches || window.navigator.standalone);
};

const setInstallButtonState = () => {
  const standalone = isStandaloneMode();

  if (installAppButton) {
    if (standalone) {
      installAppButton.classList.add("hidden");
    } else if (deferredInstallPrompt || isIos()) {
      installAppButton.classList.remove("hidden");
      installAppButton.textContent = isIos() ? "Add to Home Screen" : "Install App";
    } else {
      installAppButton.classList.add("hidden");
    }
  }

  if (mobileDownloadAppButton) {
    if (standalone) {
      mobileDownloadAppButton.classList.add("hidden");
    } else {
      mobileDownloadAppButton.classList.remove("hidden");
    }
  }
};

const openInstallModal = (note) => {
  if (!installModal) return;
  if (installModalNote) {
    installModalNote.textContent = note || "You can keep using the website normally too.";
  }
  if (installSteps) {
    if (isIos() && isSafari()) {
      installSteps.innerHTML = `
        <article class="install-step-card">
          <span class="install-step-icon" aria-hidden="true">1️⃣</span>
          <div><strong>Tap Share</strong><br /><small>Use the square with the arrow ⬆️ in Safari.</small></div>
        </article>
        <article class="install-step-card">
          <span class="install-step-icon" aria-hidden="true">2️⃣</span>
          <div><strong>Scroll down</strong><br /><small>Look through the action list.</small></div>
        </article>
        <article class="install-step-card">
          <span class="install-step-icon" aria-hidden="true">3️⃣</span>
          <div><strong>Tap “Add to Home Screen”</strong><br /><small>📲 It pins Beerlympics like an app.</small></div>
        </article>
        <article class="install-step-card">
          <span class="install-step-icon" aria-hidden="true">4️⃣</span>
          <div><strong>Tap Add</strong><br /><small>You’re ready to launch from your Home Screen.</small></div>
        </article>
      `;
    } else {
      installSteps.innerHTML = `
        <article class="install-step-card">
          <span class="install-step-icon" aria-hidden="true">⋮</span>
          <div><strong>Open browser menu</strong><br /><small>Tap the three-dot menu in your browser.</small></div>
        </article>
        <article class="install-step-card">
          <span class="install-step-icon" aria-hidden="true">📲</span>
          <div><strong>Tap “Add to Home screen”</strong><br /><small>Then confirm to install.</small></div>
        </article>
      `;
    }
  }
  installModal.classList.remove("hidden");
  installModal.setAttribute("aria-hidden", "false");
};

const closeInstallModal = () => {
  if (!installModal) return;
  installModal.classList.add("hidden");
  installModal.setAttribute("aria-hidden", "true");
};

const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("./service-worker.js", {
      updateViaCache: "none",
    });
  } catch (error) {
    console.warn("Service worker registration failed.", error);
  }
};

const initInstallFlow = () => {
  const triggerInstallFlow = async () => {
    if (isStandaloneMode()) return;
    if (isAndroid() && deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === "accepted") {
        showToast("Install started.", "success");
      }
      deferredInstallPrompt = null;
      setInstallButtonState();
      return;
    }
    if (isIos()) {
      openInstallModal(
        isSafari()
          ? "Safari supports Add to Home Screen from the Share menu."
          : "Open in Safari to add Beerlympics to your Home Screen."
      );
      return;
    }
    if (isAndroid()) {
      openInstallModal("Install prompt unavailable. Use your browser menu to add this app.");
      return;
    }
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      setInstallButtonState();
      return;
    }
    openInstallModal("Use your browser menu and choose Install App.");
  };

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    setInstallButtonState();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    showToast("Beerlympics installed.", "success");
    setInstallButtonState();
  });

  const displayModeMedia = window.matchMedia
    ? window.matchMedia("(display-mode: standalone)")
    : null;
  displayModeMedia?.addEventListener("change", () => {
    setInstallButtonState();
  });

  installAppButton?.addEventListener("click", triggerInstallFlow);
  mobileDownloadAppButton?.addEventListener("click", triggerInstallFlow);

  installModalBackdrop?.addEventListener("click", closeInstallModal);
  installModalClose?.addEventListener("click", closeInstallModal);

  if (installAppButton) {
    setInstallButtonState();
  } else if (mobileDownloadAppButton) {
    mobileDownloadAppButton.classList.remove("hidden");
  }
};

const isProbablyPhone = () => {
  if (window.__BEERLYMPICS_EARLY_MOBILE__ === true) return true;
  const ua = navigator.userAgent || "";
  const mobileUaPattern = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
  if (mobileUaPattern.test(ua)) return true;
  const smallestViewportSide = Math.min(window.innerWidth || 0, window.innerHeight || 0);
  const hasTouch = navigator.maxTouchPoints > 0;
  return hasTouch && smallestViewportSide > 0 && smallestViewportSide <= 900;
};

const isMobileLayout = () =>
  (window.matchMedia ? window.matchMedia("(max-width: 767px)").matches : false) ||
  isProbablyPhone();

const setMobileOnboardingStep = (step) => {
  if (!mobileOnboardingCodeCard || !mobileOnboardingTeamCard) return;
  const showCode = step === "code";
  mobileOnboardingCodeCard.classList.toggle("is-visible", showCode);
  mobileOnboardingTeamCard.classList.toggle("is-visible", !showCode);
  if (showCode) {
    resetJoinButtonLabels();
    const tip = document.getElementById("onboarding-tip-code");
    if (tip && !tip.classList.contains("is-dismissed")) setTimeout(() => tip.classList.add("is-dismissed"), 12000);
  } else {
    const tip = document.getElementById("onboarding-tip-team");
    if (tip && !tip.classList.contains("is-dismissed")) setTimeout(() => tip.classList.add("is-dismissed"), 12000);
  }
};

const resetMobileOnboardingMessage = () => {
  if (!mobileOnboardingNote) return;
  mobileOnboardingNote.textContent = "Enter your 4-digit game code to continue.";
  mobileOnboardingNote.classList.remove("success");
};

const resetMobileJoinFlow = () => {
  pendingMobileGameCode = "";
  if (mobileGameCodeInput) mobileGameCodeInput.value = "";
  resetJoinButtonLabels();
  resetMobileOnboardingMessage();
};

const syncMobilePanelActivity = (state) => {
  if (!isMobileLayout()) return;
  const onboardingStates = new Set(["onboarding-code", "onboarding-team"]);
  const isOnboarding = onboardingStates.has(state);

  if (mobileWelcome) {
    mobileWelcome.inert = !isOnboarding;
    mobileWelcome.setAttribute("aria-hidden", String(!isOnboarding));
  }

  if (mobileRegisterPanel) {
    mobileRegisterPanel.inert = state === "playing";
  }

  if (mobileAccessPanel) {
    mobileAccessPanel.inert = state === "playing";
  }

  if (mobilePlayPanel) {
    mobilePlayPanel.inert = state !== "playing";
  }
};

const setMobileState = (state) => {
  // IMPORTANT: never remove panels from the DOM.
  // Removing causes the Step 1 form to disappear until a full refresh.
  document.body.dataset.mobileState = state;
  syncMobilePanelActivity(state);
};

const computeMobileState = () => {
  if (!isMobileLayout()) return "desktop";
  const hasTeam = Boolean(getActiveTeamId());
  const hasGame = Boolean(getActiveGameCode());
  if (hasTeam && hasGame) return "playing";
  return "onboarding-code";
};

const scheduleManualRefreshPrompt = (state) => {
  if (!manualRefreshButton) return;
  // Don't reset/hide if the button is already visible — iOS resize events on scroll
  // would otherwise dismiss it every time the browser chrome appears/disappears.
  if (!manualRefreshButton.classList.contains("hidden")) return;
  if (manualRefreshTimeout) {
    clearTimeout(manualRefreshTimeout);
  }
  if (state !== "playing") return;
  if (getActiveTeam()?.currentMatchId) return;
  manualRefreshTimeout = setTimeout(() => {
    const isStillPlaying = computeMobileState() === "playing";
    const hasCurrentMatch = Boolean(getActiveTeam()?.currentMatchId);
    if (isStillPlaying && !hasCurrentMatch) {
      manualRefreshButton.classList.remove("hidden");
    }
  }, MANUAL_REFRESH_DELAY_MS);
};

const updateMobileState = (forcedState) => {
  const isMobile = isMobileLayout();

  document.body.classList.toggle("mobile-app", isMobile);
  document.documentElement.classList.toggle("mobile-app-bg", isMobile);

  if (!isMobile) {
    document.body.dataset.mobileState = "desktop";
    document.documentElement.classList.remove("mobile-preload");
    finalizeMobileBoot();
    return;
  }

  const nextState = forcedState || computeMobileState();
  setMobileState(nextState);
  scheduleManualRefreshPrompt(nextState);

  if (nextState === "playing") {
    finalizeMobileBoot();
  }
};

const runMobileWelcome = () => {
  if (!isMobileLayout()) return;
  document.body.classList.add("mobile-app");
  document.documentElement.classList.add("mobile-app-bg");
  const state = computeMobileState();
  setMobileState(state);
  if (state === "onboarding-code") {
    const tip = document.getElementById("onboarding-tip-code");
    if (tip && !tip.classList.contains("is-dismissed")) setTimeout(() => tip.classList.add("is-dismissed"), 12000);
  }
};

const runMobileSplash = () => {
  if (!mobileSplash || !isMobileLayout()) {
    finalizeMobileBoot();
    return;
  }

  mobileBootFinalized = false;

  if (
    isStandaloneMode() &&
    sessionStorage.getItem("beerlympics_mobile_splash_seen") === "1"
  ) {
    finalizeMobileBoot();
    return;
  }

  document.body.classList.add("is-splash-active");

  if (mobileSplashTimer) {
    clearTimeout(mobileSplashTimer);
  }

  mobileSplashTimer = setTimeout(() => {
    if (isStandaloneMode()) {
      sessionStorage.setItem("beerlympics_mobile_splash_seen", "1");
    }
    finalizeMobileBoot();
  }, MOBILE_SPLASH_MS);
};

const dismissMobileKeyboard = () => {
  const active = document.activeElement;
  if (!active) return;
  if (
    active.tagName === "INPUT" ||
    active.tagName === "TEXTAREA" ||
    active.tagName === "SELECT" ||
    active.isContentEditable
  ) {
    active.blur();
  }
};

const triggerConfetti = () => {
  const colors = ["#5b6cff", "#ff7ab2", "#49d9c2", "#ffc94a"];
  const count = 18;
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.2}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1600);
  }
};

const triggerWinConfetti = () => {
  const colors = ["#d4af37", "#f7f1de", "#b89146", "#111111", "#ffffff", "#e8d48b"];
  const count = 60;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    piece.className = "win-confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = `${-10 - Math.random() * 20}px`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = `${6 + Math.random() * 8}px`;
    piece.style.height = `${10 + Math.random() * 10}px`;
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    const duration = 2.2 + Math.random() * 2;
    piece.style.animationDuration = `${duration}s`;
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), (duration + 1) * 1000);
  }
};

const showReward = ({ points, isWin }) => {
  const banner = document.createElement("div");
  banner.className = `reward-banner${isWin ? "" : " loss"}`;
  banner.innerHTML = `
    <div>${isWin ? "Winner energy! 🎉" : "Nice hustle! 💪"}</div>
    <div class="points-burst">
      <span>+${points} pts</span>
    </div>
  `;
  scoreActions.prepend(banner);
  setTimeout(() => banner.remove(), 1800);
  if (isWin) {
    triggerConfetti();
  }
};

const validateTeamInputs = () => {
  const playerName = playerNameInput.value.trim();
  const partnerName = partnerNameInput.value.trim();
  const country = countryInput.value.trim();
  const gameCode = normalizeGameCode(gameCodeInput.value || "");

  playerNameHint.classList.toggle("error", !playerName);
  playerNameHint.textContent = playerName
    ? "First name is perfect."
    : "Add your name so teammates know who to cheer for.";

  partnerNameHint.classList.toggle("error", !partnerName);
  partnerNameHint.textContent = partnerName
    ? "We’ll pair you up on the bracket."
    : "Add your partner so we can schedule matches.";

  countryHint.classList.toggle("error", !country);
  if (!country) {
    countryHint.textContent = "Pick a country so we can grab the flag.";
  } else if (getCountryIso2(country)) {
    countryHint.textContent = "Flag found! ✅";
  } else {
    countryHint.textContent = "We’ll try our best—flag will show when recognized.";
  }

  gameCodeHint.classList.toggle("error", !gameCode);
  gameCodeHint.textContent = gameCode
    ? "Code ready. Tap to lock in!"
    : "Ask the host for the 4-digit code.";

  const hasCoreInfo = Boolean(playerName && partnerName && country);
  joinGameButton.disabled = !hasCoreInfo || !gameCode;
  startGameButton.disabled = !hasCoreInfo;
  if (mobileContinueButton) {
    mobileContinueButton.disabled = !hasCoreInfo;
  }

  updateStepIndicator({ hasCoreInfo, hasCode: Boolean(gameCode) });
};

const updateStepIndicator = ({ hasCoreInfo, hasCode } = {}) => {
  if (!stepper) return;
  const steps = stepper.querySelectorAll(".step");
  const hasTeam = hasCoreInfo ?? Boolean(
    playerNameInput.value.trim() && partnerNameInput.value.trim() && countryInput.value.trim()
  );
  const hasGame = hasCode ?? Boolean(
    normalizeGameCode(gameCodeInput.value || "") || getActiveGameCode()
  );
  const hasTeamLocked = Boolean(getActiveTeamId());

  steps.forEach((step) => {
    step.classList.remove("active", "complete");
  });

  if (!hasGame) {
    steps[0]?.classList.add("active");
    return;
  }
  steps[0]?.classList.add("complete");

  if (!hasTeam) {
    steps[1]?.classList.add("active");
    return;
  }
  steps[1]?.classList.add("complete");

  steps[2]?.classList.add(hasTeamLocked ? "active" : "complete");
};

const isAdmin = () => localStorage.getItem(STORAGE_KEYS.adminMode) === "true";

const ensureHostId = () => {
  let hostId = localStorage.getItem(STORAGE_KEYS.hostId);
  if (!hostId) {
    hostId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEYS.hostId, hostId);
  }
  return hostId;
};

const state = {
  game: null,
  teams: [],
  matches: [],
};

const getTeams = () => state.teams;
const getMatches = () => state.matches;
const getGame = () => state.game;
const getActiveTeam = () => {
  const activeTeamId = getActiveTeamId();
  if (!activeTeamId) return null;
  return getTeams().find((team) => team.id === activeTeamId) || null;
};

let unsubscribeGame = null;
let unsubscribeTeams = null;
let unsubscribeMatches = null;
let adminEditingTeamId = null;
let pendingTeamActionInFlight = false;

const preGameDecided = new Set();
let preGameTimerInterval = null;

const activeTeamStorageKey = (code = getActiveGameCode()) =>
  code ? `${STORAGE_KEYS.activeTeamId}:${code}` : STORAGE_KEYS.activeTeamId;

const getActiveTeamId = () =>
  getSessionValue(activeTeamStorageKey()) || null;

const setActiveTeamId = (id) =>
  setSessionValue(activeTeamStorageKey(), id);

const clearActiveTeamId = (code = getActiveGameCode()) =>
  clearSessionValue(activeTeamStorageKey(code));

const clearActiveSession = (code = getActiveGameCode()) => {
  clearActiveTeamId(code);
  clearSessionValue(STORAGE_KEYS.activeGameCode);
  clearSessionValue(STORAGE_KEYS.currentGameCode);
  clearPendingTeamAction();
};

const initials = (value) =>
  (value || "?")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

const renderFlagAvatar = (country) => {
  const iso2 = getCountryIso2(country);
  if (!iso2) {
    return `<span class="flag">${initials(country || "?")}</span>`;
  }
  const url = getFlagUrl(iso2);
  return `<span class="flag"><img src="${url}" alt="${country} flag" loading="lazy" /></span>`;
};

const normalizeText = (value) => value.trim().toLowerCase();
const normalizeName = (value) => normalizeText(value).replace(/[^a-z0-9]/g, "");
const normalizeCountry = (value) => normalizeText(value).replace(/[^a-z]/g, "");

const COUNTRY_ALIASES = {
  usa: "united states",
  "u.s.a": "united states",
  us: "united states",
  "u.s.": "united states",
  uk: "united kingdom",
  uae: "united arab emirates",
  "south korea": "korea, republic of",
  "north korea": "korea, democratic people's republic of",
  russia: "russian federation",
  czechia: "czechia",
  iran: "iran, islamic republic of",
  syria: "syrian arab republic",
  vietnam: "viet nam",
  laos: "lao people's democratic republic",
  bolivia: "bolivia (plurinational state of)",
  tanzania: "tanzania, united republic of",
  moldova: "moldova, republic of",
  venezuela: "venezuela (bolivarian republic of)",
  "cape verde": "cabo verde",
  "cote divoire": "côte d'ivoire",
  "ivory coast": "côte d'ivoire",
  myanmar: "myanmar",
  burma: "myanmar",
  "north macedonia": "north macedonia",
  palestine: "palestine, state of",
  "saint kitts": "saint kitts and nevis",
  "saint lucia": "saint lucia",
  "saint vincent": "saint vincent and the grenadines",
  eswatini: "eswatini",
};

let countryLookup = null;
let countryLookupPromise = null;

const buildCountryLookup = (data) => {
  const lookup = {};
  Object.entries(data).forEach(([code, name]) => {
    const normalized = normalizeCountry(name);
    lookup[normalized] = code.toLowerCase();
  });
  Object.entries(COUNTRY_ALIASES).forEach(([alias, canonical]) => {
    const normalizedAlias = normalizeCountry(alias);
    const normalizedCanonical = normalizeCountry(canonical);
    if (lookup[normalizedCanonical]) {
      lookup[normalizedAlias] = lookup[normalizedCanonical];
    }
  });
  return lookup;
};

const ensureCountryLookup = async () => {
  if (countryLookup) return countryLookup;
  if (!countryLookupPromise) {
    countryLookupPromise = fetch("https://flagcdn.com/en/codes.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to fetch country list.");
        }
        return response.json();
      })
      .then((data) => {
        countryLookup = buildCountryLookup(data);
        return countryLookup;
      })
      .catch((error) => {
        console.warn("Country map unavailable, using initials fallback.", error);
        countryLookup = {};
        return countryLookup;
      });
  }
  return countryLookupPromise;
};

const getCountryIso2 = (country) => {
  if (!country) return null;
  const normalized = normalizeCountry(country);
  if (!normalized) return null;
  const alias = COUNTRY_ALIASES[normalizeText(country)];
  const finalKey = alias ? normalizeCountry(alias) : normalized;
  return countryLookup?.[finalKey] || null;
};

const getFlagUrl = (iso2) =>
  iso2 ? `https://flagcdn.com/w40/${iso2.toLowerCase()}.png` : null;

const gameRef = (code) => doc(db, "games", code);
const teamsCollection = (code) => collection(db, "games", code, "teams");
const matchesCollection = (code) => collection(db, "games", code, "matches");

async function createGame(code) {
  const hostId = ensureHostId();
  await setDoc(gameRef(code), {
    started: true,
    createdAt: serverTimestamp(),
    settings: {
      doubleDownFlipCupMode: "all_rounds",
    },
    hostId,
  });
}

async function fetchGame(code) {
  const snap = await getDoc(gameRef(code));
  return snap.exists() ? snap.data() : null;
}

async function fetchTeamsOnce(code) {
  const snap = await getDocs(teamsCollection(code));
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

function isHost() {
  const game = getGame();
  if (!game) return false;
  return game.hostId === ensureHostId();
}

// Host-only: create matches whenever the roster changes.
// Debounced + locked so we don't spam Firestore writes.
let fillMatchesTimer = null;
let fillMatchesInFlight = false;

function scheduleFillMatches(code) {
  if (!code) return;
  if (!isHost()) return;
  if (fillMatchesTimer) return;

  fillMatchesTimer = setTimeout(async () => {
    fillMatchesTimer = null;
    if (fillMatchesInFlight) return;

    fillMatchesInFlight = true;
    try {
      await fillMatches(code);
    } catch (error) {
      console.error("Unable to auto-create matches.", error);
    } finally {
      fillMatchesInFlight = false;
    }
  }, 250);
}

function subscribeToGame(code) {
  if (unsubscribeGame) unsubscribeGame();
  if (unsubscribeTeams) unsubscribeTeams();
  if (unsubscribeMatches) unsubscribeMatches();

  unsubscribeGame = onSnapshot(gameRef(code), (snap) => {
    state.game = snap.exists() ? { id: snap.id, ...snap.data() } : null;
    renderLeaderboard();
    renderRoster();
    renderMatch();
    updateGameCodeDisplay();
    updateTabsVisibility();
    scheduleFillMatches(code);
  });

  unsubscribeTeams = onSnapshot(teamsCollection(code), (snap) => {
    state.teams = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    renderLeaderboard();
    renderRoster();
    renderMatch();
    scheduleFillMatches(code);
    void processPendingTeamAction();
  });

  unsubscribeMatches = onSnapshot(matchesCollection(code), (snap) => {
    state.matches = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    renderLeaderboard();
    renderMatch();
    // Dispute functions are defined later in the file — call via window check to avoid
    // "not defined" errors if this snapshot fires before the module fully executes
    if (typeof updateDisputeButton === "function") updateDisputeButton();
    if (typeof checkNullifyState  === "function") checkNullifyState();
  });
}

async function processPendingTeamAction(force = false) {
  if (pendingTeamActionInFlight) return;
  const pendingAction = getPendingTeamAction();
  if (!pendingAction) return;

  const activeGameCode = getActiveGameCode();
  if (!activeGameCode || pendingAction.gameCode !== activeGameCode) {
    clearPendingTeamAction();
    return;
  }

  const targetTeam = getTeams().find((team) => team.id === pendingAction.teamId);
  if (!targetTeam) {
    clearPendingTeamAction();
    return;
  }

  // When called from a just-completed transaction (force=true), skip the
  // currentMatchId check because local state hasn't been updated by onSnapshot yet.
  if (!force && targetTeam.currentMatchId) return;

  pendingTeamActionInFlight = true;
  try {
    if (pendingAction.type === "remove") {
      await clearTeamFromMatches(activeGameCode, pendingAction.teamId);
      await deleteTeamFromCloud(activeGameCode, pendingAction.teamId);
      if (getActiveTeamId() === pendingAction.teamId) {
        clearActiveSession(activeGameCode);
        setView("player");
        setMobileState("onboarding-code");
        setMobileOnboardingStep("code");
        resetMobileJoinFlow();
        showToast("Round finished. Team removed.", "info");
      }
    } else if (pendingAction.type === "pause") {
      await clearTeamFromMatches(activeGameCode, pendingAction.teamId);
      await updateDoc(doc(teamsCollection(activeGameCode), pendingAction.teamId), {
        paused: true,
      });
      if (getActiveTeamId() === pendingAction.teamId) {
        showToast("Round finished. Your team is now paused.", "success");
      }
    } else {
      console.warn("Unknown pending action; clearing.", pendingAction.type);
    }

    clearPendingTeamAction();
    refreshState();
    scheduleFillMatches(activeGameCode);
  } catch (error) {
    console.error("Unable to process pending team action.", error);
  } finally {
    pendingTeamActionInFlight = false;
  }
}

async function clearTeamsInCloud(code) {
  const batch = writeBatch(db);
  getTeams().forEach((team) => {
    batch.delete(doc(teamsCollection(code), team.id));
  });
  getMatches().forEach((match) => {
    batch.delete(doc(matchesCollection(code), match.id));
  });
  await batch.commit();
}

async function clearMatchResults() {
  const activeGameCode = getActiveGameCode();
  if (!activeGameCode) return;
  const batch = writeBatch(db);
  getMatches().forEach((match) => {
    batch.update(doc(matchesCollection(activeGameCode), match.id), {
      status: "pending",
      result: null,
      doubleDown: {},
      doubleDownCharged: {},
    });
  });
  getTeams().forEach((team) => {
    batch.update(doc(teamsCollection(activeGameCode), team.id), { currentMatchId: null });
  });
  await batch.commit();
  if (isHost()) {
    await fillMatches(activeGameCode);
  }
}

async function closeMatchForRemoval(code, match, removedTeamId = null) {
  await runTransaction(db, async (transaction) => {
    const matchRef = doc(matchesCollection(code), match.id);
    const matchSnap = await transaction.get(matchRef);
    if (!matchSnap.exists()) return;
    const matchData = matchSnap.data();
    const teamIds = matchData.teamIds || [];
    for (const teamId of teamIds.filter(
      (entryTeamId) => entryTeamId && entryTeamId !== removedTeamId
    )) {
      const teamRef = doc(teamsCollection(code), teamId);
      const teamSnap = await transaction.get(teamRef);
      if (!teamSnap.exists()) continue;
      transaction.update(teamRef, {
        currentMatchId: null,
      });
    }
    transaction.update(matchRef, {
      status: "complete",
      result: { abandoned: true, removedTeamId },
      completedAt: serverTimestamp(),
    });
  });
}

const levenshtein = (a, b) => {
  if (a === b) return 0;
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0)
  );
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
};

async function deleteTeamFromCloud(code, teamId) {
  await deleteDoc(doc(teamsCollection(code), teamId));
}

async function clearTeamFromMatches(code, teamId) {
  const impactedMatches = getMatches().filter(
    (match) => match.status !== "complete" && match.teamIds?.includes(teamId)
  );
  for (const match of impactedMatches) {
    await closeMatchForRemoval(code, match, teamId);
  }
}

const formatTeamLabel = (team) =>
  `${team.playerName} + ${team.partnerName} (${team.country || "Unknown"})`;

const renderMergeOptions = (teams) => {
  if (!mergePanel) return;
  const adminMode = isAdmin();
  mergePanel.classList.toggle("hidden", !adminMode);
  if (!adminMode) return;

  const currentSource = mergeSourceSelect.value;
  const currentTarget = mergeTargetSelect.value;

  const buildOptions = (selectEl, selectedId) => {
    selectEl.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a team";
    placeholder.disabled = true;
    placeholder.selected = true;
    selectEl.appendChild(placeholder);
    teams.forEach((team) => {
      const option = document.createElement("option");
      option.value = team.id;
      option.textContent = formatTeamLabel(team);
      if (team.id === selectedId) {
        option.selected = true;
      }
      selectEl.appendChild(option);
    });
  };

  buildOptions(mergeSourceSelect, currentSource);
  buildOptions(mergeTargetSelect, currentTarget);

  if (teams.length < 2) {
    mergeButton.disabled = true;
    mergeStatus.textContent = "Need at least two teams to merge.";
  } else {
    mergeButton.disabled = false;
    if (!mergeSourceSelect.value || !mergeTargetSelect.value) {
      mergeStatus.textContent = "Select a source and destination team.";
    }
  }
};

const areNamesClose = (a, b) => {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (!left || !right) return false;
  if (left === right) return true;
  const distance = levenshtein(left, right);
  const limit = Math.max(1, Math.floor(Math.max(left.length, right.length) / 4));
  return distance <= limit;
};

const areCountriesClose = (a, b) => {
  const left = normalizeCountry(a);
  const right = normalizeCountry(b);
  if (!left || !right) return false;
  if (left === right) return true;

  const distance = levenshtein(left, right);
  const limit = Math.max(1, Math.floor(Math.max(left.length, right.length) / 5));
  return distance <= limit;
};

const findMatchingTeam = (teams, playerName, partnerName, country) => {
  return teams.find((team) => {
    const sameCountry = areCountriesClose(country, team.country);
    if (!sameCountry) return false;
    const sameOrder =
      areNamesClose(playerName, team.playerName) &&
      areNamesClose(partnerName, team.partnerName);
    const swappedOrder =
      areNamesClose(playerName, team.partnerName) &&
      areNamesClose(partnerName, team.playerName);
    return sameOrder || swappedOrder;
  });
};

const hasRecentOpponent = (team, opponentId) =>
  (team.lastOpponents || []).includes(opponentId);

const sortTeamsForMatch = (teams) =>
  [...teams].sort((a, b) => {
    if ((b.wins || 0) !== (a.wins || 0)) return (b.wins || 0) - (a.wins || 0);
    if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
    return (a.losses || 0) - (b.losses || 0);
  });

const countFreshTeamsForType = (teams, gameType) => {
  const fresh = teams.filter((team) => team.lastGameType !== gameType.id).length;
  return fresh;
};

const pickPair = (teams, gameTypeId) => {
  // Strict rules (requested):
  // - No team can play the same GAME twice in a row.
  // - No team can play the same OPPONENT twice in a row.
  // If no legal pairing exists for this game type, return null so
  // fillMatches() can try another game type (or wait for more teams).

  const immediateOpponentId = (team) => (team.lastOpponents || [])[0] || null;
  const isImmediateOpponentPair = (a, b) =>
    immediateOpponentId(a) === b.id || immediateOpponentId(b) === a.id;

  // Hard filter: no one repeating this game type.
  const eligible = teams.filter((t) => !t.paused && t.lastGameType !== gameTypeId);
  if (eligible.length < 2) return null;

  const pool = sortTeamsForMatch(eligible);
  for (const team of pool) {
    const opponents = pool.filter((candidate) => candidate.id !== team.id);
    if (!opponents.length) continue;

    // Prefer: not an immediate rematch.
    let opponent = opponents.find((candidate) => !isImmediateOpponentPair(team, candidate));
    if (opponent) return [team, opponent];

    // If every possible opponent is an immediate rematch, we must WAIT.
    // (This prevents two teams from instantly re-playing each other when
    // only they become available.)
    return null;
  }

  return null;
};

const pickFlipCupGroup = (teams) => {
  const unpausedTeams = teams.filter((t) => !t.paused);
  // Hard block: nobody can exceed a streak of 2
  const hardAllowed = unpausedTeams.filter((t) => (t.flipCupStreak || 0) < 2);
  const working = hardAllowed.length >= 4 ? hardAllowed : unpausedTeams;

  const nonRepeat = working.filter((t) => t.lastGameType !== "flip_cup");
  const repeatOk = working.filter(
    (t) => t.lastGameType === "flip_cup" && (t.flipCupStreak || 0) < 2
  );

  // Prefer 0 repeat teams; if not possible, allow at most 1 repeat team.
  const candidatePools = [
    nonRepeat,
    [...nonRepeat, ...repeatOk],
  ];

  for (const pool of candidatePools) {
    if (pool.length < 4) continue;

    const sorted = sortTeamsForMatch(pool);
    const group = [];
    let repeatCount = 0;

    for (const team of sorted) {
      const isRepeat = team.lastGameType === "flip_cup";
      if (isRepeat && repeatCount >= 1) continue;

      if (
        group.every(
          (existing) =>
            !hasRecentOpponent(team, existing.id) &&
            !hasRecentOpponent(existing, team.id)
        )
      ) {
        group.push(team);
        if (isRepeat) repeatCount += 1;
      }
      if (group.length === 4) break;
    }

    // Fallback fill (still respecting repeat cap + streak cap)
    if (group.length < 4) {
      for (const team of sorted) {
        if (group.some((g) => g.id === team.id)) continue;
        const isRepeat = team.lastGameType === "flip_cup";
        if (isRepeat && repeatCount >= 1) continue;
        if ((team.flipCupStreak || 0) >= 2) continue;

        group.push(team);
        if (isRepeat) repeatCount += 1;
        if (group.length === 4) break;
      }
    }

    if (group.length === 4) return group;
  }

  return null;
};

async function createMatchForTeams(code, gameTypeId, teams) {
  const matchRef = doc(matchesCollection(code));
  const matchId = matchRef.id;
  await runTransaction(db, async (transaction) => {
    const teamRefs = teams.map((team) => doc(teamsCollection(code), team.id));
    const teamSnaps = await Promise.all(teamRefs.map((ref) => transaction.get(ref)));
    if (teamSnaps.some((snap) => !snap.exists())) return;
    if (teamSnaps.some((snap) => snap.data().currentMatchId)) return;
    transaction.set(matchRef, {
      id: matchId,
      gameType: gameTypeId,
      status: "in_progress",
      teamIds: teams.map((team) => team.id),
      createdAt: serverTimestamp(),
      doubleDown: {},
      doubleDownCharged: {},
      result: null,
    });
    teamRefs.forEach((teamRef) => {
      transaction.update(teamRef, { currentMatchId: matchId });
    });
  });
}

async function fillMatches(gameCode) {
  if (!isHost()) return;
  // 1) Build sets
  const activeMatches = getMatches().filter(
    (match) => match.status === "in_progress"
  );
  const activeByType = new Set(activeMatches.map((match) => match.gameType));

  // Read pending action once — teams with a pending exit/pause must not be
  // given new matches, otherwise processPendingTeamAction will never fire.
  const pendingAction = getPendingTeamAction();
  const pendingTeamId = pendingAction?.gameCode === gameCode ? pendingAction.teamId : null;

  let availableTeams = sortTeamsForMatch(
    getTeams().filter((team) => !team.currentMatchId && !team.paused && team.id !== pendingTeamId)
  );

  // 2) Flip Cup first (optional, but keeps everyone playing)
  if (!activeByType.has("flip_cup") && availableTeams.length >= 4) {
    const group = pickFlipCupGroup(availableTeams);
    if (group) {
      await createMatchForTeams(gameCode, "flip_cup", group);
      availableTeams = availableTeams.filter(
        (team) => !group.some((member) => member.id === team.id)
      );
    }
  }

  // 3) Rotate 2-team games so Beer Pong isn't always first
  const twoTeamTypes = GAME_TYPES.filter(
    (gameType) => gameType.teams === 2 && !activeByType.has(gameType.id)
  );
  if (!twoTeamTypes.length) return;

  const rotation = getMatches().length % twoTeamTypes.length;
  const rotatedTwoTeamTypes = [
    ...twoTeamTypes.slice(rotation),
    ...twoTeamTypes.slice(0, rotation),
  ];

  // 4) Create as many 2-team matches as possible, using different game types first
  for (const gameType of rotatedTwoTeamTypes) {
    if (availableTeams.length < 2) break;
    const pair = pickPair(availableTeams, gameType.id);
    if (!pair) continue;
    await createMatchForTeams(gameCode, gameType.id, pair);
    availableTeams = availableTeams.filter(
      (team) => !pair.some((member) => member.id === team.id)
    );
  }
}

const computeStandings = (teams) =>
  [...teams].sort((a, b) => {
    if ((b.wins || 0) !== (a.wins || 0)) return (b.wins || 0) - (a.wins || 0);
    if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
    return (a.losses || 0) - (b.losses || 0);
  });

const flagColorCache = {};
const DEFAULT_LEADERBOARD_COLORS = {
  primary: [91, 108, 255],
  secondary: [255, 122, 178],
};

const rgbToCss = (rgb) => rgb.join(", ");

const getDistance = (a, b) =>
  Math.sqrt(
    Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2)
  );

const extractFlagColors = (iso2) =>
  new Promise((resolve) => {
    if (!iso2) {
      resolve(DEFAULT_LEADERBOARD_COLORS);
      return;
    }
    if (flagColorCache[iso2]) {
      resolve(flagColorCache[iso2]);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `https://flagcdn.com/w80/${iso2}.png`;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(DEFAULT_LEADERBOARD_COLORS);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const buckets = new Map();
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha < 200) continue;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const key = `${Math.round(r / 32)}-${Math.round(g / 32)}-${Math.round(
          b / 32
        )}`;
        buckets.set(key, (buckets.get(key) || 0) + 1);
      }
      const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1]);
      const toRgb = (key) =>
        key
          .split("-")
          .map((value) => Math.min(255, Number(value) * 32 + 16));
      const primary = sorted[0] ? toRgb(sorted[0][0]) : DEFAULT_LEADERBOARD_COLORS.primary;
      let secondary = DEFAULT_LEADERBOARD_COLORS.secondary;
      for (let i = 1; i < sorted.length; i += 1) {
        const candidate = toRgb(sorted[i][0]);
        if (getDistance(primary, candidate) > 80) {
          secondary = candidate;
          break;
        }
      }
      const colors = { primary, secondary };
      flagColorCache[iso2] = colors;
      resolve(colors);
    };
    img.onerror = () => {
      resolve(DEFAULT_LEADERBOARD_COLORS);
    };
  });

const applyLeaderboardTheme = async (team) => {
  if (!leaderboardSection) return;
  const iso2 = getCountryIso2(team?.country);
  const colors = await extractFlagColors(iso2);
  const root = document.documentElement;
  root.style.setProperty("--leaderboard-accent-rgb", rgbToCss(colors.primary));
  root.style.setProperty("--leaderboard-secondary-rgb", rgbToCss(colors.secondary));
  root.style.setProperty(
    "--leaderboard-flag-url",
    iso2 ? `url("https://flagcdn.com/w320/${iso2}.png")` : "none"
  );
  leaderboardSection.style.setProperty("--leaderboard-accent-rgb", rgbToCss(colors.primary));
  leaderboardSection.style.setProperty(
    "--leaderboard-secondary-rgb",
    rgbToCss(colors.secondary)
  );
  leaderboardSection.style.setProperty(
    "--leaderboard-flag-url",
    iso2 ? `url("https://flagcdn.com/w320/${iso2}.png")` : "none"
  );
  leaderboardTab?.classList.add("leaderboard-accent");
};

const renderCurrentMatches = () => {
  if (!currentMatchesEl) return;
  const matches = getMatches().filter((match) => match.status === "in_progress");
  const teams = getTeams();
  currentMatchesEl.innerHTML = "";

  if (!matches.length) {
    currentMatchesEl.innerHTML =
      "<p class=\"status\">No matches are live at the moment.</p>";
    return;
  }

  matches.forEach((match) => {
    const card = document.createElement("div");
    card.className = "current-match-card";
    const gameType = GAME_TYPES.find((entry) => entry.id === match.gameType);
    const matchTeams = match.teamIds
      .map((id) => teams.find((team) => team.id === id))
      .filter(Boolean);
    const teamRows =
      matchTeams.length > 0
            ? matchTeams
                .map(
                  (team) => `
                    <div class="current-match-team">
                      <span>${team.playerName} + ${team.partnerName}</span>
                      ${renderFlagAvatar(team.country)}
                    </div>
                  `
                )
                .join("")
        : "<p class=\"status\">Teams syncing...</p>";

    card.innerHTML = `
      <div class="current-match-header">
        <strong>${gameType?.name || match.gameType}</strong>
        <span class="status">Match ${match.id.slice(0, 6)}</span>
      </div>
      <div class="current-match-teams">
        ${teamRows}
      </div>
    `;
    currentMatchesEl.appendChild(card);
  });
};

const renderLeaderboard = () => {
  renderCurrentMatches();
  const teams = getTeams();
  const standings = computeStandings(teams);
  const isAdminMode = isAdmin();

  leaderboardEl.innerHTML = "";

  if (!standings.length) {
    leaderboardEl.innerHTML =
      "<p class=\"status\">Waiting for squads to register.</p>";
    const root = document.documentElement;
    root.style.setProperty(
      "--leaderboard-accent-rgb",
      rgbToCss(DEFAULT_LEADERBOARD_COLORS.primary)
    );
    root.style.setProperty(
      "--leaderboard-secondary-rgb",
      rgbToCss(DEFAULT_LEADERBOARD_COLORS.secondary)
    );
    leaderboardSection.style.setProperty(
      "--leaderboard-accent-rgb",
      rgbToCss(DEFAULT_LEADERBOARD_COLORS.primary)
    );
    leaderboardSection.style.setProperty(
      "--leaderboard-secondary-rgb",
      rgbToCss(DEFAULT_LEADERBOARD_COLORS.secondary)
    );
    leaderboardSection.style.setProperty("--leaderboard-flag-url", "none");
    root.style.setProperty("--leaderboard-flag-url", "none");
    leaderboardTab?.classList.add("leaderboard-accent");
    return;
  }

  void applyLeaderboardTheme(standings[0]);

  standings.forEach((team, index) => {
    const card = document.createElement("div");
    card.className = `leaderboard-card${isAdminMode ? " admin" : ""}`;
    const rankClass =
      index === 0
        ? "rank rank--gold"
        : index === 1
          ? "rank rank--silver"
          : index === 2
            ? "rank rank--bronze"
            : "rank rank--default";
    card.innerHTML = `
      <div class="team-row">
        <span class="${rankClass}">#${index + 1}</span>
        <div class="team-info">
          <div class="team-row">
            ${renderFlagAvatar(team.country)}
            <span>${team.playerName} + ${team.partnerName}</span>
          </div>
          <small class="status">${team.country}</small>
        </div>
      </div>
      <div class="team-row">
        <span class="stat-pill">${team.points || 0} pts</span>
        <span class="stat-pill">${team.wins || 0} W</span>
        <span class="stat-pill">${team.losses || 0} L</span>
      </div>
    `;
    if (isAdminMode) {
      const editWrap = document.createElement("div");
      editWrap.className = "leaderboard-edit";
      const input = document.createElement("input");
      input.type = "number";
      input.className = "small";
      input.value = team.points || 0;
      input.addEventListener("change", async () => {
        const nextValue = Number(input.value);
        const activeGameCode = getActiveGameCode();
        if (activeGameCode) {
          try {
            await updateDoc(doc(teamsCollection(activeGameCode), team.id), {
              points: Number.isFinite(nextValue) ? nextValue : team.points || 0,
            });
          } catch (error) {
            console.error("Unable to sync score override.", error);
          }
        }
      });
      const clearButton = document.createElement("button");
      clearButton.type = "button";
      clearButton.className = "btn small ghost";
      clearButton.textContent = "Reset";
      clearButton.addEventListener("click", async () => {
        const activeGameCode = getActiveGameCode();
        if (activeGameCode) {
          try {
            await updateDoc(doc(teamsCollection(activeGameCode), team.id), {
              points: 0,
              wins: 0,
              losses: 0,
            });
          } catch (error) {
            console.error("Unable to reset team points.", error);
          }
        }
      });
      editWrap.appendChild(input);
      editWrap.appendChild(clearButton);
      card.appendChild(editWrap);
    }
    leaderboardEl.appendChild(card);
  });
};

const renderRoster = () => {
  const teams = getTeams();
  const activeTeamId = getActiveTeamId();
  const isEditingRoster = rosterForm.contains(document.activeElement);
  const isAdmin = localStorage.getItem(STORAGE_KEYS.adminMode) === "true";
  rosterEl.innerHTML = "";

  if (!teams.length) {
    rosterEl.innerHTML =
      "<p class=\"status\">No teams yet. Register to kick off the roster.</p>";
    rosterEdit.classList.add("hidden");
    return;
  }

  // On desktop, hide the edit panel if there's no active team (host-only view)
  const canEdit = Boolean(activeTeamId) || isAdmin;
  if (!canEdit && !isMobileLayout()) {
    rosterEdit.classList.add("hidden");
  } else {
    rosterEdit.classList.remove("hidden");
    rosterEditTitle.textContent = isAdmin ? "Edit roster entry" : "Your roster entry";
    rosterEditDescription.textContent = isAdmin
      ? "Admins can update any team entry from this device."
      : "Edit or remove only your own team details.";
  }
  const grouped = teams.reduce((acc, team) => {
    const key = team.country || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(team);
    return acc;
  }, {});

  Object.keys(grouped)
    .sort((a, b) => a.localeCompare(b))
    .forEach((country) => {
      const group = document.createElement("div");
      group.className = "roster-group";
      group.innerHTML = `<h3>${country}</h3>`;
      grouped[country].forEach((team) => {
        const row = document.createElement("div");
        row.className = `roster-team${isAdmin ? " admin" : ""}`;
        row.innerHTML = `
          <div>
            <strong>
              ${renderFlagAvatar(team.country)}
              ${team.playerName} + ${team.partnerName}
            </strong>
            <div class="status">Team ID: ${team.id.slice(0, 8)}</div>
          </div>
          <span class="status">${team.country}</span>
        `;
        if (team.id === activeTeamId) {
          row.style.borderColor = "rgba(91, 108, 255, 0.4)";
        }
        if (isAdmin) {
          const editButton = document.createElement("button");
          editButton.type = "button";
          editButton.className = "btn small ghost";
          editButton.textContent = "Edit";
          editButton.addEventListener("click", () => {
            adminEditingTeamId = team.id;
            rosterPlayerName.value = team.playerName;
            rosterPartnerName.value = team.partnerName;
            rosterCountry.value = team.country;
            rosterStatus.textContent = `Editing ${team.playerName} + ${team.partnerName}.`;
          });
          row.appendChild(editButton);
        }
        group.appendChild(row);
      });
      rosterEl.appendChild(group);
    });

  const activeTeam = teams.find((team) => team.id === activeTeamId);
  const adminTeam = adminEditingTeamId
    ? teams.find((team) => team.id === adminEditingTeamId)
    : null;
  const selectedTeam = isAdmin && adminTeam ? adminTeam : activeTeam;

  if (selectedTeam) {
    if (!isEditingRoster) {
      rosterPlayerName.value = selectedTeam.playerName;
      rosterPartnerName.value = selectedTeam.partnerName;
      rosterCountry.value = selectedTeam.country;
    }
    if (isAdmin && adminTeam) {
      rosterStatus.textContent = `Editing ${selectedTeam.playerName} + ${selectedTeam.partnerName}.`;
    } else {
      rosterStatus.textContent = isEditingRoster
        ? "Editing in progress. We'll pause auto-refresh while you update."
        : "Only your team can be updated from this device.";
    }
  } else {
    if (!isEditingRoster) {
      rosterPlayerName.value = "";
      rosterPartnerName.value = "";
      rosterCountry.value = "";
    }
    rosterStatus.textContent = "Register or rejoin to claim your team.";
  }

  renderMergeOptions(teams);
};

const getFlipCupPairings = (teamIds) => {
  const [t1, t2, t3, t4] = teamIds;
  return [
    { pairA: [t1, t2], pairB: [t3, t4] },
    { pairA: [t4, t1], pairB: [t2, t3] },
    { pairA: [t3, t1], pairB: [t2, t4] },
  ];
};

const renderMatch = () => {
  const teams = getTeams();
  const activeTeamId = getActiveTeamId();
  const activeTeam = teams.find((team) => team.id === activeTeamId);

  if (!activeTeam) {
    nextGameCard.innerHTML = "<p class=\"status\">Register to unlock your matchup.</p>";
    scoreActions.innerHTML = "";
    updateStepIndicator();
    return;
  }

  const match = activeTeam.currentMatchId
    ? getMatches().find((entry) => entry.id === activeTeam.currentMatchId)
    : null;

  if (!match) {
    if (activeTeam.paused) {
      nextGameCard.innerHTML = `
        <h3>You are currently paused ⏸️</h3>
        <p class="status">You’ll stay on the leaderboard, but matchmaking is paused until you resume.</p>
      `;
      scoreActions.innerHTML = "";
      const resumeButton = document.createElement("button");
      resumeButton.type = "button";
      resumeButton.className = "btn";
      resumeButton.textContent = "Resume Playing";
      resumeButton.addEventListener("click", async () => {
        const activeGameCode = getActiveGameCode();
        if (!activeGameCode || !activeTeamId) return;
        await updateDoc(doc(teamsCollection(activeGameCode), activeTeamId), { paused: false });
        showToast("You’re back in the game.", "success");
        scheduleFillMatches(activeGameCode);
      });
      scoreActions.appendChild(resumeButton);
      updateStepIndicator({ hasCoreInfo: true, hasCode: true });
      return;
    }

    const hasPending = getMatches().some((entry) =>
      entry.teamIds?.includes(activeTeamId)
    );
    nextGameCard.innerHTML = hasPending
      ? `
        <h3><span class="hourglass-spin">⏳</span> Waiting on game stations</h3>
        <p class="status">All your remaining games are currently in play. Check back soon.</p>
      `
      : `
        <h3>Hang tight 🎉</h3>
        <p class="status">We're waiting for a team so you can beat them.</p>
      `;
    scoreActions.innerHTML = "";
    updateStepIndicator({ hasCoreInfo: true, hasCode: true });
    return;
  }

  const gameType = GAME_TYPES.find((entry) => entry.id === match.gameType);

  // ── PRE-GAME POWERUP DECISION ─────────────────────────────────────────────
  const alreadyDoubledDown = Boolean(match.doubleDown?.[activeTeamId]);
  const needsPreGameDecision =
    match.status !== "complete" && !alreadyDoubledDown && !preGameDecided.has(match.id);

  if (needsPreGameDecision) {
    const powerupsRemaining = activeTeam.powerupsRemaining ?? 0;
    const hasPowerup = powerupsRemaining > 0;
    const TIMER_SECS = 30;
    const circumference = 163;
    nextGameCard.innerHTML = `
      <div class="pre-game-card">
        <p class="pre-game-kicker">Up next</p>
        <p class="pre-game-title">You're playing<br><strong>${gameType?.name || match.gameType}</strong>!</p>
        <p class="pre-game-question">${hasPowerup
          ? `You have ${"⚡".repeat(powerupsRemaining)} powerup${powerupsRemaining !== 1 ? "s" : ""} left.<br>Think you'll win? Double your points!`
          : "No powerups remaining — give it your all!"}</p>
        <div class="pre-game-timer-ring">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle class="ring-bg" cx="32" cy="32" r="26"/>
            <circle class="ring-fill" id="pre-game-ring-fill" cx="32" cy="32" r="26"
              stroke-dasharray="${circumference}" stroke-dashoffset="0"/>
          </svg>
          <div class="pre-game-timer-label" id="pre-game-timer-label">${TIMER_SECS}</div>
        </div>
      </div>`;
    scoreActions.innerHTML = "";
    if (hasPowerup) {
      const useBtn = document.createElement("button");
      useBtn.type = "button"; useBtn.className = "btn"; useBtn.textContent = "💥 Double my points!";
      useBtn.addEventListener("click", async () => {
        dismissMobileKeyboard(); clearInterval(preGameTimerInterval); preGameTimerInterval = null;
        preGameDecided.add(match.id); await toggleDoubleDown(activeTeamId, match.id); renderMatch();
      });
      scoreActions.appendChild(useBtn);
    }
    const skipBtn = document.createElement("button");
    skipBtn.type = "button"; skipBtn.className = "btn ghost";
    skipBtn.textContent = hasPowerup ? "Nah, just play" : "Let's go! 🏃";
    skipBtn.addEventListener("click", () => {
      dismissMobileKeyboard(); clearInterval(preGameTimerInterval); preGameTimerInterval = null;
      preGameDecided.add(match.id); renderMatch();
    });
    scoreActions.appendChild(skipBtn);
    let secsLeft = TIMER_SECS;
    if (preGameTimerInterval) clearInterval(preGameTimerInterval);
    preGameTimerInterval = setInterval(() => {
      secsLeft -= 1;
      const label = document.getElementById("pre-game-timer-label");
      const ring = document.getElementById("pre-game-ring-fill");
      if (label) label.textContent = secsLeft;
      if (ring) { ring.style.strokeDashoffset = circumference * (1 - secsLeft / TIMER_SECS); if (secsLeft <= 10) ring.classList.add("urgent"); }
      if (secsLeft <= 0) { clearInterval(preGameTimerInterval); preGameTimerInterval = null; preGameDecided.add(match.id); renderMatch(); }
    }, 1000);
    updateStepIndicator({ hasCoreInfo: true, hasCode: true });
    return;
  }
  // ── END PRE-GAME ──────────────────────────────────────────────────────────

  const opponents = (match.teamIds || [])
    .filter((id) => id !== activeTeamId)
    .map((id) => teams.find((team) => team.id === id))
    .filter(Boolean);

  const opponentSummary = opponents.length
    ? opponents.map((team) => {
        const members = [team.playerName, team.partnerName].filter(Boolean).join(" + ");
        const country = team.country || "Unknown country";
        return `<article class="opponent-card"><div class="opponent-head">${renderFlagAvatar(country)}<div class="opponent-meta"><span class="opponent-country">${country}</span><span class="opponent-members">${members || "Team TBD"}</span></div></div></article>`;
      }).join("")
    : `<p class="status">Opponent team was removed. Waiting for a new matchup…</p>`;

  nextGameCard.innerHTML = `
    <h3>Game: ${gameType?.name || match.gameType}</h3>
    <p class="matchup-subtitle">Against:</p>
    <div class="opponents aesthetic">${opponentSummary}</div>
  `;

  scoreActions.innerHTML = "";
  if (match.status !== "complete") {
    const powerupsRemaining = activeTeam.powerupsRemaining ?? 0;
    const powerupStatus = document.createElement("div");
    powerupStatus.className = `powerups${alreadyDoubledDown ? " active" : ""}`;
    powerupStatus.innerHTML = `<span>Powerups remaining:</span><span class="charges">${"⚡".repeat(Math.max(powerupsRemaining, 0)) || "—"}</span>`;
    scoreActions.appendChild(powerupStatus);
    if (alreadyDoubledDown) {
      const ddBadge = document.createElement("div");
      ddBadge.className = "stat-pill";
      ddBadge.style.cssText = "margin-top:4px;display:inline-flex;padding:6px 12px;font-size:0.85rem;";
      ddBadge.textContent = "Double Points active 💥";
      scoreActions.appendChild(ddBadge);
    }
  }

  if (match.gameType !== "flip_cup") {
    const winButton = document.createElement("button");
    winButton.type = "button";
    winButton.className = "btn";
    winButton.textContent = "We won! 🏆";
    winButton.addEventListener("click", () => {
      dismissMobileKeyboard();
      triggerWinConfetti();
      void recordResult(match.id, { winnerTeamId: activeTeamId });
    });

    const loseButton = document.createElement("button");
    loseButton.type = "button";
    loseButton.className = "btn secondary";
    loseButton.textContent = "We lost 😅";
    loseButton.addEventListener("click", () => {
      dismissMobileKeyboard();
      const opponentId = match.teamIds.find((id) => id !== activeTeamId);
      if (!opponentId) return;
      void recordResult(match.id, { winnerTeamId: opponentId });
    });

    scoreActions.appendChild(winButton);
    scoreActions.appendChild(loseButton);
    return;
  }

  // ── FLIP CUP: simple Win/Lose with best-of-3 confirmation ────────────────
  const pairings = getFlipCupPairings(match.teamIds);
  const myPairing = pairings[0];
  const mySide = myPairing.pairA.includes(activeTeamId) ? myPairing.pairA : myPairing.pairB;
  const oppSide = myPairing.pairA.includes(activeTeamId) ? myPairing.pairB : myPairing.pairA;
  const sideLabel = (ids) => ids.map(id => {
    const t = teams.find(t => t.id === id);
    return t ? `${t.playerName} + ${t.partnerName}` : "TBD";
  }).join(" &amp; ");

  const roundCard = document.createElement("div");
  roundCard.className = "game-card";
  roundCard.innerHTML = `
    <h3>Flip Cup — Best of 3</h3>
    <div class="flip-sides">
      <div class="flip-side flip-side--you">
        <span class="flip-side-label">Your side</span>
        <span class="flip-side-teams">${sideLabel(mySide)}</span>
      </div>
      <div class="flip-side-vs">vs</div>
      <div class="flip-side flip-side--them">
        <span class="flip-side-label">Opponents</span>
        <span class="flip-side-teams">${sideLabel(oppSide)}</span>
      </div>
    </div>
    <p class="status" style="margin-top:10px">Play all 3 rounds, then report your result below.</p>
  `;
  scoreActions.appendChild(roundCard);

  if (match.status !== "complete") {
    const showFlipCupConfirm = (claimedWin) => {
      const overlay = document.createElement("div");
      overlay.className = "flipcup-confirm-overlay";
      overlay.innerHTML = `
        <div class="flipcup-confirm-card">
          <h3>Best of 3 complete? 🏓</h3>
          <p>Make sure you've finished all 3 rounds before reporting. Have both teams played all their rounds?</p>
          <div class="flipcup-confirm-actions">
            <button class="btn" id="fc-confirm-yes" type="button">Yes, all 3 done — ${claimedWin ? "We Won! 🏆" : "We Lost 😅"}</button>
            <button class="btn ghost" id="fc-confirm-no" type="button">Not yet, go back</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);

      document.getElementById("fc-confirm-yes").addEventListener("click", async () => {
        overlay.remove();
        dismissMobileKeyboard();
        const winnerSide = claimedWin ? "win" : "lose";
        await recordResult(match.id, { flipCupFinalResult: winnerSide, activeTeamId });
        // Explicitly process any pending exit/pause now that the match is complete
        void processPendingTeamAction();
      });
      document.getElementById("fc-confirm-no").addEventListener("click", () => overlay.remove());
    };

    const winButton = document.createElement("button");
    winButton.type = "button";
    winButton.className = "btn";
    winButton.textContent = "We Won! 🏆";
    winButton.addEventListener("click", () => { dismissMobileKeyboard(); showFlipCupConfirm(true); });

    const loseButton = document.createElement("button");
    loseButton.type = "button";
    loseButton.className = "btn secondary";
    loseButton.textContent = "We Lost 😅";
    loseButton.addEventListener("click", () => { dismissMobileKeyboard(); showFlipCupConfirm(false); });

    scoreActions.appendChild(winButton);
    scoreActions.appendChild(loseButton);
  } else {
    const done = document.createElement("div");
    done.className = "status";
    done.textContent = "Flip Cup complete! 🎉";
    scoreActions.appendChild(done);
  }
  // ── END FLIP CUP ─────────────────────────────────────────────────────────

  updateStepIndicator({ hasCoreInfo: true, hasCode: true });
  if (typeof updateDisputeButton === "function") updateDisputeButton();
};

async function toggleDoubleDown(teamId, matchId) {
  const activeGameCode = getActiveGameCode();
  if (!activeGameCode) return;
  let toastMessage = null;
  await runTransaction(db, async (transaction) => {
    const matchRef = doc(matchesCollection(activeGameCode), matchId);
    const teamRef = doc(teamsCollection(activeGameCode), teamId);
    const [matchSnap, teamSnap] = await Promise.all([
      transaction.get(matchRef),
      transaction.get(teamRef),
    ]);
    if (!matchSnap.exists() || !teamSnap.exists()) return;
    const match = matchSnap.data();
    const team = teamSnap.data();
    if (match.status === "complete") return;
    const charged = match.doubleDownCharged || {};
    if (charged[teamId]) return;
    const doubleDown = { ...(match.doubleDown || {}) };
    const currentlyOn = Boolean(doubleDown[teamId]);
    if (!currentlyOn && (team.powerupsRemaining ?? 0) <= 0) return;
    if (currentlyOn) {
      delete doubleDown[teamId];
      toastMessage = "Double Down removed.";
    } else {
      doubleDown[teamId] = true;
      toastMessage = "Double Down locked in! 💥";
    }
    transaction.update(matchRef, { doubleDown });
  });
  if (toastMessage) {
    showToast(toastMessage, "info");
  }
}

const calculatePoints = (teamId, isWinner, match) => {
  const base = isWinner ? 4 : 1;
  return match.doubleDown?.[teamId] ? base * 2 : base;
};

const computeFlipCupFinalWinners = (rounds, teamIds) => {
  const winCounts = Object.fromEntries(teamIds.map((id) => [id, 0]));
  rounds.forEach((round) => {
    const winners = round.winnerSide === "A" ? round.pairA : round.pairB;
    winners.forEach((id) => {
      winCounts[id] = (winCounts[id] || 0) + 1;
    });
  });
  return [...teamIds]
    .sort((a, b) => winCounts[b] - winCounts[a])
    .slice(0, 2);
};

async function recordResult(matchId, payload) {
  const activeGameCode = getActiveGameCode();
  if (!activeGameCode) return;
  const activeTeamId = getActiveTeamId();
  const localMatch = getMatches().find((entry) => entry.id === matchId);
  let rewardPayload = null;
  if (activeTeamId && localMatch?.teamIds?.includes(activeTeamId)) {
    if (localMatch.gameType !== "flip_cup") {
      const isWin = payload.winnerTeamId === activeTeamId;
      const points = calculatePoints(activeTeamId, isWin, localMatch);
      rewardPayload = { points, isWin };
    } else {
      // New: flipCupFinalResult = "win" or "lose" from the reporting team's perspective
      const isWin = payload.flipCupFinalResult === "win";
      const points = calculatePoints(activeTeamId, isWin, localMatch);
      rewardPayload = { points, isWin };
    }
  }
  await runTransaction(db, async (transaction) => {
    const matchRef = doc(matchesCollection(activeGameCode), matchId);
    const matchSnap = await transaction.get(matchRef);
    if (!matchSnap.exists()) return;
    const match = matchSnap.data();
    if (match.status === "complete") return;
    const teamRefs = match.teamIds.map((id) => doc(teamsCollection(activeGameCode), id));
    const teamSnaps = await Promise.all(teamRefs.map((ref) => transaction.get(ref)));
    if (teamSnaps.some((snap) => !snap.exists())) return;
    const teams = teamSnaps.map((snap) => ({ id: snap.id, ...snap.data() }));
    const doubleDownCharged = { ...(match.doubleDownCharged || {}) };

    if (match.gameType !== "flip_cup") {
      const winnerTeamId = payload.winnerTeamId;
      if (!match.teamIds.includes(winnerTeamId)) return;
      const loserTeamId = match.teamIds.find((id) => id !== winnerTeamId);
      teams.forEach((team) => {
        const isWinner = team.id === winnerTeamId;
        const points = calculatePoints(team.id, isWinner, match);
        const shouldCharge = match.doubleDown?.[team.id] && !doubleDownCharged[team.id];
        const powerupsRemaining = shouldCharge
          ? Math.max((team.powerupsRemaining ?? 3) - 1, 0)
          : team.powerupsRemaining ?? 3;
        if (shouldCharge) doubleDownCharged[team.id] = true;
        const opponents = team.id === winnerTeamId ? [loserTeamId] : [winnerTeamId];
        transaction.update(doc(teamsCollection(activeGameCode), team.id), {
          wins: (team.wins || 0) + (isWinner ? 1 : 0),
          losses: (team.losses || 0) + (isWinner ? 0 : 1),
          points: (team.points || 0) + points,
          currentMatchId: null,
          lastOpponents: [...opponents, ...(team.lastOpponents || [])].slice(0, 3),
          lastGameType: match.gameType,
          flipCupStreak: 0,
          powerupsRemaining,
        });
      });
      transaction.update(matchRef, {
        status: "complete",
        result: { winnerTeamId, loserTeamId },
        completedAt: serverTimestamp(),
        doubleDownCharged,
      });
      return;
    }

    // ── FLIP CUP: single result, complete immediately ──────────────────────
    // The reporting team says they won or lost; derive winner/loser team IDs.
    const reportingTeamId = payload.activeTeamId;
    const reportingWon = payload.flipCupFinalResult === "win";
    if (!match.teamIds.includes(reportingTeamId)) return;

    // Flip cup has 4 teams — split into two pairs (sides A & B)
    // We don't know which pair won from each side, so award based on reporting
    // team's claim. All 4 teams get win/loss regardless (2 winners, 2 losers).
    // We derive partner by finding the other team NOT on the opposite pair.
    // Simplest: use pairings[0] to identify the two sides, then check which
    // side the reporting team is on.
    const pairings = getFlipCupPairings(match.teamIds);
    const firstPairing = pairings[0];
    const reportingOnA = firstPairing.pairA.includes(reportingTeamId);
    const winnerIds = reportingWon
      ? (reportingOnA ? firstPairing.pairA : firstPairing.pairB)
      : (reportingOnA ? firstPairing.pairB : firstPairing.pairA);

    teams.forEach((team) => {
      const isWinner = winnerIds.includes(team.id);
      const points = calculatePoints(team.id, isWinner, match);
      const shouldCharge = match.doubleDown?.[team.id] && !doubleDownCharged[team.id];
      const powerupsRemaining = shouldCharge
        ? Math.max((team.powerupsRemaining ?? 3) - 1, 0)
        : team.powerupsRemaining ?? 3;
      if (shouldCharge) doubleDownCharged[team.id] = true;
      transaction.update(doc(teamsCollection(activeGameCode), team.id), {
        wins: (team.wins || 0) + (isWinner ? 1 : 0),
        losses: (team.losses || 0) + (isWinner ? 0 : 1),
        points: (team.points || 0) + points,
        currentMatchId: null,
        lastOpponents: match.teamIds.filter((id) => id !== team.id).slice(0, 3),
        lastGameType: match.gameType,
        flipCupStreak: team.lastGameType === "flip_cup"
          ? Math.min((team.flipCupStreak || 0) + 1, 2) : 1,
        powerupsRemaining,
      });
    });
    transaction.update(matchRef, {
      status: "complete",
      result: { winnerIds, reportedByTeamId: reportingTeamId },
      completedAt: serverTimestamp(),
      doubleDownCharged,
    });
    // ── END FLIP CUP ──────────────────────────────────────────────────────
  });

  // Process any pending exit/pause BEFORE filling new matches so the
  // leaving team is never re-assigned to another game first.
  // force=true bypasses the currentMatchId check since local state hasn't updated yet.
  await processPendingTeamAction(true);

  if (isHost()) {
    await fillMatches(activeGameCode);
  }

  if (rewardPayload) {
    showReward(rewardPayload);
    showToast(
      rewardPayload.isWin
        ? `+${rewardPayload.points} points! Victory vibes.`
        : `+${rewardPayload.points} point earned. Comeback time!`,
      rewardPayload.isWin ? "success" : "info"
    );
  }
}

// ── DISPUTE SYSTEM ────────────────────────────────────────────────────────────

const getLastCompletedMatch = () => {
  const activeTeamId = getActiveTeamId();
  if (!activeTeamId) return null;
  const completed = getMatches()
    .filter(m => m.status === "complete" && m.teamIds?.includes(activeTeamId))
    .sort((a, b) => {
      const ta = a.completedAt?.toMillis?.() ?? 0;
      const tb = b.completedAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
  return completed[0] || null;
};

// Find any completed match involving the active team that has a pending nullify request
const getMatchWithPendingNullify = () => {
  const activeTeamId = getActiveTeamId();
  if (!activeTeamId) return null;
  return getMatches().find(m =>
    m.status === "complete" &&
    m.teamIds?.includes(activeTeamId) &&
    m.nullifyRequest?.status === "pending"
  ) || null;
};

// Show/hide the dispute button — only for most recent undisputed completed match
const updateDisputeButton = () => {
  const btn = document.getElementById("dispute-last-result");
  if (!btn) return;
  const match = getLastCompletedMatch();
  const hasMatch = Boolean(
    match &&
    match.result &&
    !match.result.nullified &&
    !match.result.corrected &&
    !match.nullifyRequest  // hide once any nullify request exists (pending or resolved)
  );
  btn.style.display = hasMatch && isMobileLayout() ? "block" : "none";
};

// Open the dispute modal
const openDisputeModal = () => {
  const activeTeamId = getActiveTeamId();
  const match = getLastCompletedMatch();
  if (!match || !activeTeamId) return;

  const modal = document.getElementById("dispute-modal");
  const switchBtn = document.getElementById("dispute-switch-loss");
  const desc = document.getElementById("dispute-modal-desc");

  const result = match.result || {};
  const activeTeamWon =
    result.winnerTeamId === activeTeamId ||
    (Array.isArray(result.winnerIds) && result.winnerIds.includes(activeTeamId));
  const activeTeamReported =
    result.winnerTeamId === activeTeamId ||
    result.reportedByTeamId === activeTeamId;

  if (switchBtn) {
    switchBtn.style.display = (activeTeamWon && activeTeamReported) ? "block" : "none";
  }

  const gameName = (match.gameType || "").replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
  if (desc) desc.textContent = `Last game: ${gameName}. What would you like to do?`;

  modal?.classList.remove("hidden");
  modal?.setAttribute("aria-hidden", "false");
};

const closeDisputeModal = () => {
  const modal = document.getElementById("dispute-modal");
  modal?.classList.add("hidden");
  modal?.setAttribute("aria-hidden", "true");
};

// Swap winner/loser on the last match
const processSwitchToLoss = async () => {
  const activeGameCode = getActiveGameCode();
  const activeTeamId = getActiveTeamId();
  const match = getLastCompletedMatch();
  if (!match || !activeGameCode || !activeTeamId) return;

  const result = match.result || {};
  const oldWinnerId = result.winnerTeamId || (result.winnerIds?.[0]);
  const oldLoserId = result.loserTeamId || match.teamIds?.find(id => id !== oldWinnerId);
  if (!oldWinnerId || !oldLoserId) { showToast("Can't parse that result. Ask the host to fix it.", "warning"); return; }

  closeDisputeModal();
  showToast("Switching result...", "info");

  try {
    await runTransaction(db, async (transaction) => {
      const matchRef = doc(matchesCollection(activeGameCode), match.id);
      const winnerRef = doc(teamsCollection(activeGameCode), oldWinnerId);
      const loserRef  = doc(teamsCollection(activeGameCode), oldLoserId);
      const [matchSnap, winnerSnap, loserSnap] = await Promise.all([
        transaction.get(matchRef),
        transaction.get(winnerRef),
        transaction.get(loserRef),
      ]);
      if (!matchSnap.exists() || !winnerSnap.exists() || !loserSnap.exists()) return;
      const winnerData = winnerSnap.data();
      const loserData  = loserSnap.data();

      const oldWinPts  = calculatePoints(oldWinnerId, true,  match);
      const oldLosePts = calculatePoints(oldLoserId,  false, match);
      const newWinPts  = calculatePoints(oldLoserId,  true,  match);
      const newLosePts = calculatePoints(oldWinnerId, false, match);

      transaction.update(winnerRef, {
        wins:   Math.max(0, (winnerData.wins   || 0) - 1),
        losses: (winnerData.losses || 0) + 1,
        points: Math.max(0, (winnerData.points || 0) - oldWinPts + newLosePts),
      });
      transaction.update(loserRef, {
        wins:   (loserData.wins   || 0) + 1,
        losses: Math.max(0, (loserData.losses || 0) - 1),
        points: Math.max(0, (loserData.points || 0) - oldLosePts + newWinPts),
      });
      transaction.update(matchRef, {
        result: { ...matchSnap.data().result, winnerTeamId: oldLoserId, loserTeamId: oldWinnerId, corrected: true },
      });
    });
    showToast("Result corrected. Leaderboard updated.", "success");
  } catch (err) {
    console.error("Switch to loss failed:", err);
    showToast("Could not update the result. Try again.", "warning");
  }
};

// Initiate a nullify request
const processNullifyRequest = async () => {
  const activeGameCode = getActiveGameCode();
  const activeTeamId = getActiveTeamId();
  const match = getLastCompletedMatch();
  if (!match || !activeGameCode || !activeTeamId) return;

  closeDisputeModal();

  const activeTeam = getTeams().find(t => t.id === activeTeamId);
  const requesterName = activeTeam?.playerName || "Someone";

  try {
    await updateDoc(doc(matchesCollection(activeGameCode), match.id), {
      nullifyRequest: {
        requestedBy: activeTeamId,
        requesterName,
        agreedBy: [activeTeamId], // requester auto-agrees
        declinedBy: [],
        status: "pending",
        requestedAt: serverTimestamp(),
      },
    });
    showToast("Nullify request sent. Waiting for others to respond.", "info");
  } catch (err) {
    console.error("Nullify request failed:", err);
    showToast("Could not send nullify request.", "warning");
  }
};

// Execute the actual nullify (called when majority agrees)
const executeNullify = async (match) => {
  const activeGameCode = getActiveGameCode();
  if (!activeGameCode || !match) return;

  try {
    await runTransaction(db, async (transaction) => {
      const matchRef = doc(matchesCollection(activeGameCode), match.id);
      const teamRefs = match.teamIds.map(id => doc(teamsCollection(activeGameCode), id));
      const [matchSnap, ...teamSnaps] = await Promise.all([
        transaction.get(matchRef),
        ...teamRefs.map(r => transaction.get(r)),
      ]);
      if (!matchSnap.exists()) return;

      const result = matchSnap.data().result || {};
      const PARTICIPATION_PTS = 2;

      teamSnaps.forEach((snap, i) => {
        if (!snap.exists()) return;
        const team = snap.data();
        const isWinner =
          result.winnerTeamId === match.teamIds[i] ||
          (Array.isArray(result.winnerIds) && result.winnerIds.includes(match.teamIds[i]));
        const isLoser = !isWinner;

        const oldWinPts  = isWinner ? calculatePoints(match.teamIds[i], true,  match) : 0;
        const oldLosePts = isLoser  ? calculatePoints(match.teamIds[i], false, match) : 0;
        const pointAdjust = PARTICIPATION_PTS - oldWinPts - oldLosePts;

        transaction.update(teamRefs[i], {
          wins:   isWinner ? Math.max(0, (team.wins   || 0) - 1) : (team.wins   || 0),
          losses: isLoser  ? Math.max(0, (team.losses || 0) - 1) : (team.losses || 0),
          points: Math.max(0, (team.points || 0) + pointAdjust),
        });
      });

      transaction.update(matchRef, {
        "result.nullified": true,
        "nullifyRequest.status": "approved",
      });
    });
    dismissNullifyOverlay();
    showToast("Game nullified. Everyone gets 2 participation points.", "success");
  } catch (err) {
    console.error("Nullify execution failed:", err);
    showToast("Nullify failed. Try again.", "warning");
  }
};

let nullifyOverlayMatchId = null;

// Show the nullify overlay — two modes: requester (waiting) vs respondent (agree/decline)
const showNullifyOverlay = (match, isRequester = false) => {
  const overlay = document.getElementById("nullify-overlay");
  if (!overlay) return;
  nullifyOverlayMatchId = match.id;

  const req = match.nullifyRequest || {};
  const total = match.teamIds?.length || 2;
  const agreed = (req.agreedBy || []).length;
  const majority = Math.floor(total / 2) + 1;

  const titleEl = document.getElementById("nullify-requester-name");
  const bodyEl  = document.getElementById("nullify-body");
  const countEl = document.getElementById("nullify-count");
  const agreeBtn = document.getElementById("nullify-agree-btn");
  const declineBtn = document.getElementById("nullify-decline-btn");

  if (isRequester) {
    // Requester waiting view
    if (titleEl) titleEl.textContent = "Hang tight ⏳";
    if (bodyEl)  bodyEl.textContent  = `Your nullify request is out there. ${majority} out of ${total} teams need to agree for it to go through.`;
    if (countEl) countEl.textContent = `${agreed} / ${majority} teams agreed so far`;
    if (agreeBtn) agreeBtn.style.display = "none";
    if (declineBtn) { declineBtn.style.display = "block"; declineBtn.textContent = "Dismiss"; }
  } else {
    // Respondent view
    if (titleEl) titleEl.textContent = `${req.requesterName || "A teammate"} wants to nullify`;
    if (bodyEl)  bodyEl.textContent  = `the last game result. If ${majority} out of ${total} teams agree, that result is removed and everyone gets 2 participation points instead.`;
    if (countEl) countEl.textContent = `${agreed} / ${majority} teams agreed so far`;
    if (agreeBtn) { agreeBtn.style.display = "block"; agreeBtn.textContent = "✅ My team agrees — nullify it"; }
    if (declineBtn) { declineBtn.style.display = "block"; declineBtn.textContent = "❌ No, the result stands"; }
  }

  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");
};

const dismissNullifyOverlay = () => {
  const overlay = document.getElementById("nullify-overlay");
  overlay?.classList.add("hidden");
  overlay?.setAttribute("aria-hidden", "true");
  nullifyOverlayMatchId = null;
};

// Check on every match snapshot for a pending nullify — search ALL matches, not just the last one
const checkNullifyState = () => {
  const activeTeamId = getActiveTeamId();
  if (!activeTeamId || !isMobileLayout()) return;

  const match = getMatchWithPendingNullify();
  if (!match) { dismissNullifyOverlay(); return; }

  const req = match.nullifyRequest;
  if (req.status === "approved" || req.status === "rejected") {
    dismissNullifyOverlay();
    return;
  }

  const isRequester = req.requestedBy === activeTeamId;
  const alreadyAgreed  = (req.agreedBy  || []).includes(activeTeamId);
  const alreadyDeclined = (req.declinedBy || []).includes(activeTeamId);
  const alreadyActed = alreadyAgreed || alreadyDeclined;

  if (alreadyActed && !isRequester) {
    // Teammate already voted on our behalf — clear the overlay
    dismissNullifyOverlay();
    return;
  }

  const wasAlreadyVisible = !document.getElementById("nullify-overlay")?.classList.contains("hidden");

  if (isRequester) {
    // Show "hang tight" state to requester's whole team
    showNullifyOverlay(match, true);
  } else {
    // Respondent who hasn't acted yet
    showNullifyOverlay(match, false);
    // Vibrate on first appearance only
    if (!wasAlreadyVisible && navigator.vibrate) {
      navigator.vibrate([300, 100, 300]);
    }
  }
};

// Wire up dispute and nullify button listeners
const initDisputeSystem = () => {
  const disputeBtn = document.getElementById("dispute-last-result");
  const backdrop   = document.getElementById("dispute-modal-backdrop");
  const closeBtn   = document.getElementById("dispute-modal-close");
  const switchBtn  = document.getElementById("dispute-switch-loss");
  const nullifyBtn = document.getElementById("dispute-nullify");
  const agreeBtn   = document.getElementById("nullify-agree-btn");
  const declineBtn = document.getElementById("nullify-decline-btn");

  disputeBtn?.addEventListener("click", openDisputeModal);
  backdrop?.addEventListener("click", closeDisputeModal);
  closeBtn?.addEventListener("click", closeDisputeModal);

  switchBtn?.addEventListener("click", () => { void processSwitchToLoss(); });
  nullifyBtn?.addEventListener("click", () => { void processNullifyRequest(); });

  agreeBtn?.addEventListener("click", async () => {
    const activeGameCode = getActiveGameCode();
    const activeTeamId   = getActiveTeamId();
    // Use the match with a pending nullify, not just the last completed match
    const match = getMatchWithPendingNullify();
    if (!match || !activeGameCode || !activeTeamId) return;

    const req = match.nullifyRequest || {};
    const newAgreed = [...new Set([...(req.agreedBy || []), activeTeamId])];
    const majority  = Math.floor((match.teamIds?.length || 2) / 2) + 1;

    if (newAgreed.length >= majority) {
      await updateDoc(doc(matchesCollection(activeGameCode), match.id), {
        "nullifyRequest.agreedBy": newAgreed,
        "nullifyRequest.status": "approved",
      });
      await executeNullify(match);
    } else {
      await updateDoc(doc(matchesCollection(activeGameCode), match.id), {
        "nullifyRequest.agreedBy": newAgreed,
      });
      dismissNullifyOverlay();
      showToast("You agreed to nullify. Waiting for others.", "info");
    }
  });

  declineBtn?.addEventListener("click", async () => {
    const activeGameCode = getActiveGameCode();
    const activeTeamId   = getActiveTeamId();
    const match = getMatchWithPendingNullify();
    if (!match || !activeGameCode || !activeTeamId) { dismissNullifyOverlay(); return; }

    const req = match.nullifyRequest || {};

    // If this is the dismiss button (requester or already-agreed), just close
    if ((req.agreedBy || []).includes(activeTeamId)) {
      dismissNullifyOverlay();
      return;
    }

    const newDeclined = [...new Set([...(req.declinedBy || []), activeTeamId])];
    const total = match.teamIds?.length || 2;
    const majority = Math.floor(total / 2) + 1;
    const agreedCount = (req.agreedBy || []).length;
    const remainingCanAgree = total - newDeclined.length - agreedCount;

    if (agreedCount + remainingCanAgree < majority) {
      await updateDoc(doc(matchesCollection(activeGameCode), match.id), {
        "nullifyRequest.declinedBy": newDeclined,
        "nullifyRequest.status": "rejected",
      });
      dismissNullifyOverlay();
      showToast("Nullify rejected. The original result stands.", "info");
    } else {
      await updateDoc(doc(matchesCollection(activeGameCode), match.id), {
        "nullifyRequest.declinedBy": newDeclined,
      });
      dismissNullifyOverlay();
      showToast("You declined the nullify request.", "info");
    }
  });
};

// ── END DISPUTE SYSTEM ────────────────────────────────────────────────────────

// ── END DISPUTE SYSTEM ────────────────────────────────────────────────────────

const setView = (view) => {
  const sections = {
    player: playerSection,
    rules: rulesSection,
    ref: refSection,
    leaderboard: leaderboardSection,
    roster: rosterSection,
    control: controlSection,
  };
  document.body.dataset.view = view;
  Object.entries(sections).forEach(([key, section]) => {
    section.classList.toggle("hidden", key !== view);
  });
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === view);
  });
  mobileNavTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.view === view);
  });
  renderLeaderboard();
  renderRoster();
  renderMatch();
};

const updateTabsVisibility = () => {
  const hasGame = Boolean(getActiveGameCode());
  const showControl = isAdmin();
  tabs.forEach((tab) => {
    if (tab.dataset.view === "player") {
      tab.classList.remove("hidden");
      return;
    }
    if (tab.dataset.view === "control") {
      tab.classList.toggle("hidden", !hasGame || !showControl);
      return;
    }
    tab.classList.toggle("hidden", !hasGame);
  });
  if (!hasGame) {
    setView("player");
  }
  const showMobileNav = isMobileLayout() && hasGame && Boolean(getActiveTeamId());
  mobileBottomNav?.classList.toggle("hidden", !showMobileNav);
  const helpBtn = document.getElementById("help-btn");
  if (helpBtn) helpBtn.classList.toggle("hidden", !showMobileNav);
};

const startNewGame = async () => {
  const newCode = generateGameCode();
  setGameCodes(newCode);
  clearActiveTeamId();
  await withTimeout(
    createGame(newCode),
    7000,
    "Timed out while creating the game."
  );
  subscribeToGame(newCode);
  updateGameCodeDisplay();
  updateTabsVisibility();
  renderLeaderboard();
  renderRoster();
  renderMatch();
  refreshState();
  return newCode;
};

const registerTeam = async ({ playerName, country, partnerName }) => {
  const activeGameCode = getActiveGameCode();
  if (!activeGameCode) return;

  // Pull the latest teams from Firestore so matching works even before onSnapshot finishes.
  // On some mobile networks/browsers, getDocs can fail intermittently; don't let that kill join.
  let teams = [];
  try {
    teams = await withTimeout(fetchTeamsOnce(activeGameCode), 7000, "Timed out loading teams.");
  } catch (error) {
    console.warn("Unable to fetch teams list; falling back to local snapshot.", error);
    teams = getTeams ? getTeams() : [];
  }

  const existing = findMatchingTeam(teams, playerName, partnerName, country);

  const teamId = existing?.id || getActiveTeamId() || crypto.randomUUID();
  const team = {
    id: teamId,
    playerName,
    partnerName,
    country,
    wins: existing?.wins || 0,
    losses: existing?.losses || 0,
    points: existing?.points || 0,
    powerupsRemaining: existing?.powerupsRemaining ?? 3,
    currentMatchId: existing?.currentMatchId || null,
    lastOpponents: existing?.lastOpponents || [],
    lastGameType: existing?.lastGameType || null,
    paused: false,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };

  try {
    await setDoc(doc(teamsCollection(activeGameCode), teamId), team, { merge: true });
  } catch (error) {
    console.error("Unable to sync team to cloud.", error);
    saveStatus.textContent =
      "Saved locally, but we couldn't sync to the shared game yet.";
    showToast("Saved locally, but sync to the shared game failed.", "warning");
    return;
  }

  saveStatus.textContent = existing
    ? "Welcome back! We found your team and refreshed your details."
    : "All Set! You're live on the leaderboard.";
  showToast(
    existing ? "Welcome back! Your team is ready." : "All set! You're on the board.",
    "success"
  );

  setActiveTeamId(teamId);
  document.body.classList.add("has-active-team");
  setView("player");
  setMobileState("playing");
  finalizeMobileBoot();
  renderMatch();
  renderLeaderboard();
  renderRoster();
  updateTabsVisibility();
  updateMobileState("playing");
  scheduleFillMatches(activeGameCode);
  updateStepIndicator({ hasCoreInfo: true, hasCode: true });
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (joinGameButton.disabled) {
    showToast("Fill in team info and the game code first.", "warning");
    return;
  }

  const formData = new FormData(form);
  const playerName = formData.get("playerName").trim();
  const country = formData.get("country").trim();
  const partnerName = formData.get("partnerName").trim();
  const submittedCode = normalizeGameCode(formData.get("gameCode") || "");

  if (!submittedCode) {
    saveStatus.textContent =
      "Enter a game code to join, or tap “I'm starting the games” to host.";
    showToast("Missing game code. Ask your host for the 4-digit code.", "warning");
    return;
  }

  setButtonLoading(joinGameButton, true, "Joining...");
  try {
    const game = await withTimeout(fetchGame(submittedCode), 7000, "Timed out joining the game.");
    if (!game) {
      saveStatus.textContent =
        "No game found for that code. Ask the host to start one.";
      showToast("No game found for that code.", "warning");
      return;
    }

    setGameCodes(submittedCode);
    subscribeToGame(submittedCode);
    await registerTeam({ playerName, country, partnerName });
    pendingMobileGameCode = "";
    if (mobileGameCodeInput) mobileGameCodeInput.value = "";
    setMobileOnboardingStep("code");
    resetMobileOnboardingMessage();
  } catch (error) {
    console.error("Join failed.", error);
    const message = error?.message || String(error);
    // Surface permission issues explicitly (these look like "network hiccup" otherwise).
    if (/permission|insufficient permissions/i.test(message)) {
      showToast("Join blocked by Firestore rules (permissions).", "warning");
      saveStatus.textContent = `Join blocked: ${message}`;
    } else {
      showToast("Could not join right now. Try again.", "warning");
      saveStatus.textContent = `Join failed: ${message}`;
    }
  } finally {
    setButtonLoading(joinGameButton, false);
  }
});

if (mobileContinueButton) {
  mobileContinueButton.addEventListener("click", () => {
    if (mobileContinueButton.disabled) return;
    if (mobileRegisterPanel) {
      mobileRegisterPanel.classList.add("is-exiting");
      // Allow the exit animation, then just change state (do NOT remove the panel).
      setTimeout(() => updateMobileState("access"), 280);
    } else {
      updateMobileState("access");
    }
  });
}

if (mobileCodeContinueButton) {
  mobileCodeContinueButton.addEventListener("click", async () => {
    const submittedCode = normalizeGameCode(mobileGameCodeInput?.value || "");
    if (!submittedCode) {
      showToast("Please enter a game code first.", "warning");
      return;
    }
    setButtonLoading(mobileCodeContinueButton, true, "Checking code...");
    try {
      const game = await withTimeout(fetchGame(submittedCode), 7000, "Timed out joining the game.");
      if (!game) {
        resetMobileOnboardingMessage();
        showToast("We couldn't find that game code.", "warning");
        return;
      }
      pendingMobileGameCode = submittedCode;
      if (mobileOnboardingNote) {
        mobileOnboardingNote.textContent = "We found your game!";
        mobileOnboardingNote.classList.add("success");
      }
      setTimeout(() => {
        setMobileState("onboarding-team");
        setMobileOnboardingStep("team");
        resetMobileOnboardingMessage();
      }, 550);
    } catch (error) {
      console.error("Unable to verify game code.", error);
      showToast("Could not check that game code right now.", "warning");
    } finally {
      setButtonLoading(mobileCodeContinueButton, false);
    }
  });
}

if (mobileGameCodeInput) {
  mobileGameCodeInput.addEventListener("focus", () => {
    setButtonLoading(mobileCodeContinueButton, false);
  });
  mobileGameCodeInput.addEventListener("input", () => {
    setButtonLoading(mobileCodeContinueButton, false);
    if (mobileOnboardingNote?.classList.contains("success")) {
      resetMobileOnboardingMessage();
    }
  });
}

if (mobileLetsPlayButton) {
  mobileLetsPlayButton.addEventListener("click", async () => {
    const playerName = mobilePlayerNameInput?.value.trim() || "";
    const partnerName = mobilePartnerNameInput?.value.trim() || "";
    const country = mobileCountryInput?.value.trim() || "";
    if (!pendingMobileGameCode || !playerName || !partnerName || !country) {
      showToast("Please fill out each field to continue.", "warning");
      return;
    }

    playerNameInput.value = playerName;
    partnerNameInput.value = partnerName;
    countryInput.value = country;
    gameCodeInput.value = pendingMobileGameCode;
    validateTeamInputs();
    form.requestSubmit();
  });
}

if (manualRefreshButton) {
  manualRefreshButton.addEventListener("click", () => {
    window.location.reload();
  });
}

const getActiveTeamMatchContext = () => {
  const activeTeamId = getActiveTeamId();
  const activeTeam = getTeams().find((team) => team.id === activeTeamId);
  const match = activeTeam?.currentMatchId
    ? getMatches().find((entry) => entry.id === activeTeam.currentMatchId)
    : null;
  return { activeTeam, match };
};

const getCountryLabel = (team) => team?.country || "your team";

const showFinishRoundToast = (actionWord, team) => {
  const country = getCountryLabel(team);
  showToast(
    `Finish off this round — we’ll ${actionWord} ${country} after this game.`,
    "warning"
  );
};

const openExitModal = () => {
  if (!exitModal) return;
  exitModal.classList.remove("hidden");
  exitModal.setAttribute("aria-hidden", "false");
};

const closeExitModal = () => {
  if (!exitModal) return;
  exitModal.classList.add("hidden");
  exitModal.setAttribute("aria-hidden", "true");
};

mobileExitGameButton?.addEventListener("click", openExitModal);
exitModalBackdrop?.addEventListener("click", closeExitModal);
exitModalClose?.addEventListener("click", closeExitModal);

exitRemoveButton?.addEventListener("click", async () => {
  const activeGameCode = getActiveGameCode();
  const activeTeamId = getActiveTeamId();
  const { activeTeam, match } = getActiveTeamMatchContext();
  if (!activeGameCode || !activeTeamId) return;
  if (match) {
    setPendingTeamAction({
      type: "remove",
      teamId: activeTeamId,
      gameCode: activeGameCode,
    });
    showFinishRoundToast("exit", activeTeam);
    closeExitModal();
    return;
  }
  try {
    await clearTeamFromMatches(activeGameCode, activeTeamId);
    await deleteTeamFromCloud(activeGameCode, activeTeamId);
    clearActiveSession(activeGameCode);
    closeExitModal();
    setView("player");
    setMobileState("onboarding-code");
    setMobileOnboardingStep("code");
    resetMobileJoinFlow();
    showToast("Team removed. You can rejoin anytime.", "info");
    refreshState();
  } catch (error) {
    console.error("Unable to remove team on exit.", error);
    showToast("Couldn't exit right now. Please try again.", "warning");
  }
});

exitPauseButton?.addEventListener("click", async () => {
  const activeGameCode = getActiveGameCode();
  const activeTeamId = getActiveTeamId();
  const { activeTeam, match } = getActiveTeamMatchContext();
  if (!activeGameCode || !activeTeamId) return;
  if (match) {
    setPendingTeamAction({
      type: "pause",
      teamId: activeTeamId,
      gameCode: activeGameCode,
    });
    showFinishRoundToast("pause", activeTeam);
    closeExitModal();
    return;
  }
  try {
    await clearTeamFromMatches(activeGameCode, activeTeamId);
    await updateDoc(doc(teamsCollection(activeGameCode), activeTeamId), { paused: true });
    closeExitModal();
    showToast("Paused. Your team stays on the leaderboard.", "success");
    renderMatch();
    scheduleFillMatches(activeGameCode);
  } catch (error) {
    console.error("Unable to pause team on exit.", error);
    showToast("Couldn't pause right now. Please try again.", "warning");
  }
});

[playerNameInput, partnerNameInput, countryInput, gameCodeInput].forEach((input) => {
  input.addEventListener("input", validateTeamInputs);
  input.addEventListener("blur", validateTeamInputs);
});

rosterForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const isAdmin = localStorage.getItem(STORAGE_KEYS.adminMode) === "true";
  const activeTeamId = getActiveTeamId();
  const targetTeamId = isAdmin && adminEditingTeamId ? adminEditingTeamId : activeTeamId;
  if (!targetTeamId) return;
  const teams = getTeams();
  const updatedTeams = teams.map((team) =>
    team.id === targetTeamId
      ? {
          ...team,
          playerName: rosterPlayerName.value.trim(),
          partnerName: rosterPartnerName.value.trim(),
          country: rosterCountry.value.trim(),
        }
      : team
  );
  const updatedTeam = updatedTeams.find((team) => team.id === targetTeamId);
  const activeGameCode = getActiveGameCode();
  if (activeGameCode && updatedTeam) {
    try {
      await setDoc(doc(teamsCollection(activeGameCode), updatedTeam.id), updatedTeam, {
        merge: true,
      });
    } catch (error) {
      console.error("Unable to sync roster updates.", error);
    }
  }
  rosterStatus.textContent = isAdmin
    ? "Roster entry updated."
    : "Roster entry updated for your team.";
  if (isAdmin) {
    adminEditingTeamId = null;
  }
  renderLeaderboard();
  renderMatch();
  renderRoster();
});

removeTeamButton.addEventListener("click", async () => {
  const isAdmin = localStorage.getItem(STORAGE_KEYS.adminMode) === "true";
  const activeTeamId = getActiveTeamId();
  const targetTeamId = isAdmin && adminEditingTeamId ? adminEditingTeamId : activeTeamId;
  if (!targetTeamId) return;
  if (!confirm("Remove your team from the roster and schedule?")) return;
  const activeGameCode = getActiveGameCode();
  if (activeGameCode) {
    await clearTeamFromMatches(activeGameCode, targetTeamId);
    try {
      await deleteTeamFromCloud(activeGameCode, targetTeamId);
    } catch (error) {
      console.error("Unable to remove team from cloud.", error);
    }
  }
  if (!isAdmin || targetTeamId === activeTeamId) {
    clearActiveTeamId();
  }
  rosterStatus.textContent = isAdmin
    ? "Team entry removed."
    : "Your team was removed. Rejoin anytime.";
  showToast("Team removed from the roster.", "info");
  if (isAdmin) {
    adminEditingTeamId = null;
  }
  renderLeaderboard();
  renderMatch();
  renderRoster();
});

mergeButton.addEventListener("click", async () => {
  if (!isAdmin()) return;
  const sourceTeamId = mergeSourceSelect.value;
  const targetTeamId = mergeTargetSelect.value;
  if (!sourceTeamId || !targetTeamId) {
    mergeStatus.textContent = "Select a source and destination team.";
    return;
  }
  if (sourceTeamId === targetTeamId) {
    mergeStatus.textContent = "Choose two different teams to merge.";
    return;
  }
  const teams = getTeams();
  const sourceTeam = teams.find((team) => team.id === sourceTeamId);
  const targetTeam = teams.find((team) => team.id === targetTeamId);
  if (!sourceTeam || !targetTeam) {
    mergeStatus.textContent = "Those teams are no longer available.";
    return;
  }
  const confirmed = confirm(
    `Merge ${formatTeamLabel(sourceTeam)} into ${formatTeamLabel(
      targetTeam
    )}? This will delete the source team.`
  );
  if (!confirmed) return;

  const activeGameCode = getActiveGameCode();
  if (!activeGameCode) return;

  mergeStatus.textContent = "Merging teams...";
  const impactedMatches = getMatches().filter((match) =>
    match.teamIds?.includes(sourceTeamId)
  );
  for (const match of impactedMatches) {
    await closeMatchForRemoval(activeGameCode, match, sourceTeamId);
  }

  try {
    await runTransaction(db, async (transaction) => {
      const sourceRef = doc(teamsCollection(activeGameCode), sourceTeamId);
      const targetRef = doc(teamsCollection(activeGameCode), targetTeamId);
      const [sourceSnap, targetSnap] = await Promise.all([
        transaction.get(sourceRef),
        transaction.get(targetRef),
      ]);
      if (!sourceSnap.exists() || !targetSnap.exists()) return;
      const source = sourceSnap.data();
      const target = targetSnap.data();
      const mergedLastOpponents = [
        ...new Set([...(target.lastOpponents || []), ...(source.lastOpponents || [])]),
      ].slice(0, 3);
      transaction.update(targetRef, {
        wins: (target.wins || 0) + (source.wins || 0),
        losses: (target.losses || 0) + (source.losses || 0),
        points: (target.points || 0) + (source.points || 0),
        powerupsRemaining: Math.max(
          target.powerupsRemaining ?? 3,
          source.powerupsRemaining ?? 3
        ),
        lastOpponents: mergedLastOpponents,
        lastGameType: target.lastGameType || source.lastGameType || null,
        flipCupStreak: Math.max(target.flipCupStreak || 0, source.flipCupStreak || 0),
      });
      transaction.delete(sourceRef);
    });
  } catch (error) {
    console.error("Unable to merge teams.", error);
    mergeStatus.textContent = "Merge failed. Please try again.";
    return;
  }

  if (getActiveTeamId() === sourceTeamId) {
    setActiveTeamId(targetTeamId);
  }
  if (adminEditingTeamId === sourceTeamId) {
    adminEditingTeamId = targetTeamId;
  }
  mergeStatus.textContent = `Merged ${formatTeamLabel(sourceTeam)} into ${formatTeamLabel(
    targetTeam
  )}.`;
  showToast("Teams merged successfully.", "success");
  renderLeaderboard();
  renderMatch();
  renderRoster();
  scheduleFillMatches(activeGameCode);
});

adminToggle.addEventListener("change", () => {
  if (adminToggle.checked) {
    const entered = prompt("Enter admin passcode:");
    if (entered === ADMIN_PASSCODE) {
      localStorage.setItem(STORAGE_KEYS.adminMode, "true");
      showToast("Admin tools unlocked.", "success");
    } else {
      adminToggle.checked = false;
      localStorage.setItem(STORAGE_KEYS.adminMode, "false");
      showToast("Passcode incorrect. Admin tools stay locked.", "warning");
    }
  } else {
    localStorage.setItem(STORAGE_KEYS.adminMode, "false");
    showToast("Admin mode disabled.", "info");
  }
  adminEditingTeamId = null;
  refreshState();
});

newGameButton.addEventListener("click", () => {
  void (async () => {
    try {
      const newCode = await startNewGame();
      adminActionStatus.textContent = `New game started. Code: ${newCode}`;
      showToast(`New game started. Code ${newCode}.`, "success");
    } catch (error) {
      console.error("Unable to start new game.", error);
      adminActionStatus.textContent = "Could not start a new game. Try again.";
      showToast("Could not start a new game.", "warning");
    }
  })();
});

resetGameButton.addEventListener("click", () => {
  if (!confirm("Clear all teams and matches for this game?")) return;
  clearActiveTeamId();
  const activeGameCode = getActiveGameCode();
  if (activeGameCode) {
    void clearTeamsInCloud(activeGameCode);
  }
  adminActionStatus.textContent = "Current game cleared.";
  showToast("Game reset in progress.", "warning");
  renderMatch();
  renderLeaderboard();
  renderRoster();
});

clearResultsButton.addEventListener("click", () => {
  void clearMatchResults();
  adminActionStatus.textContent = "Match results cleared.";
  showToast("Match results cleared.", "info");
  renderMatch();
  renderLeaderboard();
});

if (copyJoinLinkButton) {
  copyJoinLinkButton.addEventListener("click", async () => {
    const code = getActiveGameCode();
    if (!code) {
      showToast("Start or join a game first.", "warning");
      return;
    }
    const joinUrl = getJoinUrl(code);
    try {
      await navigator.clipboard.writeText(joinUrl);
      showToast("Join link copied.", "success");
    } catch (error) {
      console.error("Unable to copy join link.", error);
      showToast("Could not copy the link on this device.", "warning");
    }
  });
}

if (shareJoinLinkButton) {
  shareJoinLinkButton.addEventListener("click", async () => {
    const code = getActiveGameCode();
    if (!code) { showToast("Start or join a game first.", "warning"); return; }
    const joinUrl = getJoinUrl(code);
    const shareText = `🍻 Join our Beerlympics game! Use code ${code} or tap the link to jump straight in: ${joinUrl}`;
    if (navigator.share) {
      try { await navigator.share({ text: shareText }); }
      catch (err) { if (err.name !== "AbortError") showToast("Could not open share sheet.", "warning"); }
    } else {
      window.open(`sms:?body=${encodeURIComponent(shareText)}`, "_blank");
    }
  });
}

// Help modal
const helpBtn = document.getElementById("help-btn");
const helpModal = document.getElementById("help-modal");
const helpModalBackdrop = document.getElementById("help-modal-backdrop");
const helpModalClose = document.getElementById("help-modal-close");
const openHelpModal = () => { helpModal?.classList.remove("hidden"); helpModal?.setAttribute("aria-hidden", "false"); };
const closeHelpModal = () => { helpModal?.classList.add("hidden"); helpModal?.setAttribute("aria-hidden", "true"); };
helpBtn?.addEventListener("click", openHelpModal);
helpModalBackdrop?.addEventListener("click", closeHelpModal);
helpModalClose?.addEventListener("click", closeHelpModal);

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setView(tab.dataset.view);
  });
});

mobileNavTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setView(tab.dataset.view);
  });
});

const getJoinUrl = (code) => {
  if (!code) return "";
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}?join=${encodeURIComponent(code)}`;
};

const updateGameCodeDisplay = () => {
  const currentCode = getActiveGameCode();
  gameCodeEl.textContent = currentCode || "----";
  const joinUrl = getJoinUrl(currentCode);
  if (joinLinkEl) {
    joinLinkEl.textContent = joinUrl || "Start a game to generate a join link.";
  }
  if (joinDomainEl) {
    joinDomainEl.textContent = `${window.location.host}${window.location.pathname}`;
  }
  if (joinQrEl) {
    if (joinUrl) {
      joinQrEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(joinUrl)}`;
      joinQrEl.classList.remove("hidden");
    } else {
      joinQrEl.removeAttribute("src");
      joinQrEl.classList.add("hidden");
    }
  }
};

const refreshState = () => {
  renderMatch();
  renderLeaderboard();
  renderRoster();
  updateGameCodeDisplay();
  updateTabsVisibility();

  const isAdminMode = isAdmin();
  const hostMode = isHost();
  adminToggle.checked = isAdminMode;
  adminStatus.textContent = isAdminMode ? "Admin tools unlocked." : "Admin tools are locked.";
  adminPanel.classList.toggle("hidden", !isAdminMode);

  // Mobile pill management (desktop pill is managed by showDtModePill)
  if (isMobileLayout()) {
    hostPill.classList.toggle("hidden", !hostMode);
    if (hostMode) {
      modePill.textContent = "🎬 Host Mode";
    } else if (isAdminMode) {
      modePill.textContent = "🛠️ Admin Mode";
    } else {
      modePill.textContent = "🎈 Player Mode";
    }
  }

  updateStepIndicator();
  document.body.classList.toggle("has-active-team", Boolean(getActiveTeamId()));
  updateMobileState();
};

window.addEventListener("storage", refreshState);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    if (!document.body.classList.contains("is-splash-active")) {
      finalizeMobileBoot();
    }
    refreshState();
  }
});

window.addEventListener("pageshow", () => {
  if (!document.body.classList.contains("is-splash-active")) {
    finalizeMobileBoot();
  }
  refreshState();
});

window.addEventListener("load", () => {
  if (!document.body.classList.contains("is-splash-active")) {
    finalizeMobileBoot();
  }
});

const init = async () => {
  initInstallFlow();
  void registerServiceWorker();
  runMobileWelcome();
  runMobileSplash();

  setTimeout(() => {
    if (!mobileBootFinalized) {
      finalizeMobileBoot();
    }
  }, MOBILE_SPLASH_MS + MOBILE_SPLASH_EXIT_MS + 150);

  resetMobileJoinFlow();
  const params = new URLSearchParams(window.location.search);
  const joinFromUrl = normalizeGameCode(params.get("join") || params.get("code") || "");
  if (joinFromUrl) {
    gameCodeInput.value = joinFromUrl;
    // Also pre-fill the mobile welcome card code input and advance to team info step
    if (mobileGameCodeInput) {
      mobileGameCodeInput.value = joinFromUrl;
      mobileGameCodeInput.dispatchEvent(new Event("input", { bubbles: true }));
      // Advance to team-info card so user only needs to enter their name
      const codeCard = document.getElementById("mobile-onboarding-code-card");
      const teamCard = document.getElementById("mobile-onboarding-team-card");
      if (codeCard && teamCard) {
        codeCard.classList.remove("is-visible");
        teamCard.classList.add("is-visible");
      }
    }
  }
  const code = joinFromUrl || getActiveGameCode();
  if (code) {
    setGameCodes(code);
    const game = await fetchGame(code);
    if (!game) {
      clearSessionValue(STORAGE_KEYS.activeGameCode);
      clearSessionValue(STORAGE_KEYS.currentGameCode);
      state.teams = [];
      state.matches = [];
    } else {
      subscribeToGame(code);
      // If already in a game on desktop, hide the landing
      if (!isMobileLayout()) hideDtLanding();
    }
  }
  void ensureCountryLookup().then(() => {
    renderLeaderboard();
    renderRoster();
    renderMatch();
    validateTeamInputs();
  });
  refreshState();
  validateTeamInputs();

  // Desktop landing and leave modal
  if (!isMobileLayout()) {
    initDesktopLanding();
    // Wire leave modal unconditionally — must run even when session is already active
    const logoBtn = document.getElementById("dt-logo-btn");
    initDtLeaveModal(logoBtn);
  }

  // Mobile dispute system
  initDisputeSystem();
};

// ── DESKTOP LANDING ────────────────────────────────────────────────────────
const dtLanding   = document.getElementById("dt-landing");
const dtJoinBtn   = document.getElementById("dt-join-btn");
const dtStartBtn  = document.getElementById("dt-start-btn");
const dtJoinStatus   = document.getElementById("dt-join-status");
const dtSetupStatus  = document.getElementById("dt-setup-status");
const dtGameCodeInput   = document.getElementById("dt-game-code");
const dtPlayerNameInput = document.getElementById("dt-player-name");
const dtPartnerNameInput = document.getElementById("dt-partner-name");
const dtCountryInput    = document.getElementById("dt-country");

const hideDtLanding = () => dtLanding?.classList.add("hidden");

const initDesktopLanding = () => {
  if (!dtLanding) return;

  const logoBtn = document.getElementById("dt-logo-btn");

  // If already in a session, skip landing but ensure logo is clickable
  if (getActiveGameCode() && getActiveTeamId()) {
    hideDtLanding();
    logoBtn?.classList.remove("dt-landing-active");
    showDtModePill(false);
    return;
  }
  if (getActiveGameCode() && isHost()) {
    hideDtLanding();
    logoBtn?.classList.remove("dt-landing-active");
    showDtModePill(true);
    return;
  }

  const step1 = document.getElementById("dt-step-1");
  const step2 = document.getElementById("dt-step-2");
  const dtCodeBadge = document.getElementById("dt-code-badge");
  const dtGenerateBtn = document.getElementById("dt-generate-btn");
  const dtGenerateStatus = document.getElementById("dt-generate-status");
  const dtStartBtn2 = document.getElementById("dt-start-btn");
  const dtRejoinBtn = document.getElementById("dt-rejoin-btn");
  const dtRejoinInput = document.getElementById("dt-rejoin-code");
  const dtRejoinStatus = document.getElementById("dt-rejoin-status");

  // Logo is non-interactive while on landing
  logoBtn?.classList.add("dt-landing-active");

  // ── Join button ────────────────────────────────────────────
  dtJoinBtn?.addEventListener("click", async () => {
    const code = normalizeGameCode(dtGameCodeInput?.value || "");
    const playerName = (dtPlayerNameInput?.value || "").trim();
    const partnerName = (dtPartnerNameInput?.value || "").trim();
    const country = (dtCountryInput?.value || "").trim();

    if (!code) { showDtHint(dtJoinStatus, "Enter a game code.", "error"); return; }
    if (!playerName || !partnerName || !country) {
      showDtHint(dtJoinStatus, "Fill in your name, partner, and country.", "error"); return;
    }

    setButtonLoadingDt(dtJoinBtn, true, "Joining...");
    showDtHint(dtJoinStatus, "Looking up game...", "");
    try {
      const game = await withTimeout(fetchGame(code), 7000, "Timed out.");
      if (!game) { showDtHint(dtJoinStatus, "No game found for that code.", "error"); return; }
      setGameCodes(code);
      subscribeToGame(code);
      playerNameInput.value = playerName;
      partnerNameInput.value = partnerName;
      countryInput.value = country;
      gameCodeInput.value = code;
      validateTeamInputs();
      await registerTeam({ playerName, country, partnerName });
      hideDtLanding();
      logoBtn?.classList.remove("dt-landing-active");
      showDtModePill(false);
      document.querySelectorAll(".dt-play-tab").forEach(t => t.classList.remove("dt-host-hide"));
    } catch (err) {
      showDtHint(dtJoinStatus, `Error: ${err?.message || err}`, "error");
    } finally {
      setButtonLoadingDt(dtJoinBtn, false);
    }
  });

  dtGameCodeInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") dtJoinBtn?.click(); });

  // ── Rejoin button ──────────────────────────────────────────
  dtRejoinBtn?.addEventListener("click", async () => {
    const code = normalizeGameCode(dtRejoinInput?.value || "");
    if (!code) { showDtHint(dtRejoinStatus, "Enter your game code.", "error"); return; }
    setButtonLoadingDt(dtRejoinBtn, true, "Looking up...");
    showDtHint(dtRejoinStatus, "", "");
    try {
      const game = await withTimeout(fetchGame(code), 7000, "Timed out.");
      if (!game) { showDtHint(dtRejoinStatus, "No game found for that code.", "error"); return; }
      setGameCodes(code);
      subscribeToGame(code);
      hideDtLanding();
      logoBtn?.classList.remove("dt-landing-active");
      showDtModePill(false);
      setView("leaderboard");
      showToast("Welcome back! You're viewing the live leaderboard.", "success");
    } catch (err) {
      showDtHint(dtRejoinStatus, `Error: ${err?.message || err}`, "error");
    } finally {
      setButtonLoadingDt(dtRejoinBtn, false);
    }
  });

  dtRejoinInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") dtRejoinBtn?.click(); });

  // ── Step 1 → Step 2: Generate code ────────────────────────
  dtGenerateBtn?.addEventListener("click", async () => {
    setButtonLoadingDt(dtGenerateBtn, true, "Generating...");
    showDtHint(dtGenerateStatus, "", "");
    try {
      const newCode = await startNewGame();
      if (dtCodeBadge) dtCodeBadge.textContent = newCode;
      step1?.classList.add("hidden");
      step2?.classList.remove("hidden");
      // Wire game-rules filtering now that step 2 is visible
      initGameRulesFilter();
    } catch (err) {
      showDtHint(dtGenerateStatus, `Failed: ${err?.message || err}`, "error");
    } finally {
      setButtonLoadingDt(dtGenerateBtn, false);
    }
  });

  // ── Step 2 → App: Let's play ──────────────────────────────
  dtStartBtn2?.addEventListener("click", () => {
    hideDtLanding();
    logoBtn?.classList.remove("dt-landing-active");
    showDtModePill(true);
    document.querySelectorAll(".dt-play-tab").forEach(t => t.classList.add("dt-host-hide"));
    setView("leaderboard");
    showToast("Game is live! Share the code with your players.", "success");
  });
};

// Map game checkbox IDs → rule value prefixes to show/hide
const GAME_RULE_MAP = {
  "cfg-die":        ["die_"],
  "cfg-beer-pong":  ["pong_"],
  "cfg-beerio-kart":["kart_"],
  "cfg-flip-cup":   ["flipcup_"],
  "cfg-drinkball":  [], // no specific house rules yet
};

const initGameRulesFilter = () => {
  const rulesList = document.getElementById("dt-rules-list");
  if (!rulesList) return;

  Object.entries(GAME_RULE_MAP).forEach(([checkboxId, prefixes]) => {
    const gameChk = document.getElementById(checkboxId);
    if (!gameChk || prefixes.length === 0) return;

    gameChk.addEventListener("change", () => {
      const enabled = gameChk.checked;
      rulesList.querySelectorAll("input[type='checkbox']").forEach(ruleChk => {
        const matchesGame = prefixes.some(p => ruleChk.value.startsWith(p));
        if (matchesGame) {
          const row = ruleChk.closest("label");
          if (row) {
            row.style.display = enabled ? "" : "none";
            ruleChk.checked = enabled; // uncheck hidden rules too
          }
        }
      });
    });
  });
};

const initDtLeaveModal = (logoBtn) => {
  const modal = document.getElementById("dt-leave-modal");
  const backdrop = document.getElementById("dt-leave-backdrop");
  const confirmBtn = document.getElementById("dt-leave-confirm");
  const cancelBtn = document.getElementById("dt-leave-cancel");
  if (!modal || !logoBtn) return;

  logoBtn.addEventListener("click", () => {
    // Don't open if on the landing itself
    if (logoBtn.classList.contains("dt-landing-active")) return;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  });

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  };

  backdrop?.addEventListener("click", closeModal);
  cancelBtn?.addEventListener("click", closeModal);

  confirmBtn?.addEventListener("click", () => {
    closeModal();
    // Reset session and show landing
    clearActiveSession();
    // Re-show step 1, hide step 2
    document.getElementById("dt-step-1")?.classList.remove("hidden");
    document.getElementById("dt-step-2")?.classList.add("hidden");
    dtLanding?.classList.remove("hidden");
    // Hide mode pill again
    const pill = document.getElementById("mode-pill");
    if (pill) pill.classList.remove("dt-visible");
    logoBtn.classList.add("dt-landing-active");
    // Restore Play tab visibility
    document.querySelectorAll(".dt-play-tab").forEach(t => t.classList.remove("dt-host-hide"));
    setView("player");
    showToast("You've left the session. The game continues without you.", "info");
  });
};

const showDtHint = (el, msg, type) => {
  if (!el) return;
  el.textContent = msg;
  el.className = `dt-hint${type ? " " + type : ""}`;
};

const setButtonLoadingDt = (btn, loading, label) => {
  if (!btn) return;
  btn.disabled = loading;
  if (label) {
    btn.dataset.origLabel = btn.dataset.origLabel || btn.textContent;
    btn.textContent = loading ? label : btn.dataset.origLabel;
  } else if (!loading && btn.dataset.origLabel) {
    btn.textContent = btn.dataset.origLabel;
  }
};

// Show/hide the mode pill in the desktop navbar (hidden until in-game)
const showDtModePill = (hostMode) => {
  const pill = document.getElementById("mode-pill");
  if (!pill) return;
  if (isMobileLayout()) return; // mobile handles its own pill
  pill.classList.add("dt-visible");
  pill.textContent = hostMode ? "🎬 Host Mode" : "🎈 Player Mode";
};
// ── END DESKTOP LANDING ────────────────────────────────────────────────────



startGameButton.addEventListener("click", async () => {
  const formData = new FormData(form);
  const playerName = (formData.get("playerName") || "").trim();
  const country = (formData.get("country") || "").trim();
  const partnerName = (formData.get("partnerName") || "").trim();

  if (!playerName || !country || !partnerName) {
    saveStatus.textContent = "Fill in your name, country, and partner before starting.";
    showToast("Add your name, partner, and country first.", "warning");
    return;
  }

  saveStatus.textContent = "Starting game...";
  try {
    setButtonLoading(startGameButton, true, "Creating...");
    const newCode = await startNewGame();
    saveStatus.textContent = `Game started! Share code ${newCode} with the crew.`;
    showToast(`Game started! Code ${newCode}.`, "success");
    await registerTeam({ playerName, country, partnerName });
  } catch (error) {
    console.error("Unable to create game in cloud.", error);
    saveStatus.textContent = `Start failed: ${error?.message || error}`;
    showToast("Could not create a new game. Try again.", "warning");
  } finally {
    setButtonLoading(startGameButton, false);
  }
});

window.addEventListener("error", (event) => {
  saveStatus.textContent = `JS error: ${event.message}`;
  showToast("Something went wrong. Try refreshing.", "warning");
});

window.addEventListener("unhandledrejection", (event) => {
  saveStatus.textContent = `Promise error: ${event.reason?.message || event.reason}`;
  showToast("Network hiccup. We’ll keep trying.", "warning");
});

window.addEventListener("resize", () => updateMobileState());


const enableDesktopPointerGlow = () => {
  if (window.matchMedia("(max-width: 1023px)").matches) return;
  const updateGlow = (event) => {
    document.body.style.setProperty("--cursor-x", `${event.clientX}px`);
    document.body.style.setProperty("--cursor-y", `${event.clientY}px`);
  };
  window.addEventListener("pointermove", updateGlow, { passive: true });
};

enableDesktopPointerGlow();
init();

// ── ASK THE REF CHATBOT ──────────────────────────────────────────────────────
// Requests route through a Cloudflare Worker — no API key in this file.
// ── ASK THE REF ──────────────────────────────────────────────────────────────
const REF_WORKER_URL = "https://beerlympicsapi.boardfreak56.workers.dev";

// Conversation history — keeps context across turns
const refHistory = [];

const REF_SYSTEM_PROMPT = `You are "The Ref" — the official, no-nonsense judge for Beerlympics 2026, a backyard beer Olympics competition between teams of two. Your job is to settle rules disputes quickly and with authority. Keep every answer to 2–4 sentences max. Be fun, confident, and final — like a real sports ref making a judgment call on the fly. If a situation is truly ambiguous, pick the fairest interpretation and commit to it.

Official game rules:

BEER PONG: 10 cups in a triangle per team. Teams alternate tosses; one player at a time. Made shot = that cup removed and drunk. Both teammates sink in one turn = balls back. When all cups are gone, losing team gets one redemption turn.

FLIP CUP: Teams line up shoulder-to-shoulder on opposite sides. First player drinks, sets cup on edge, flips until it lands upside-down. Next teammate starts only after previous flip lands. First team with every player done wins the round. No hand-switching mid-flip; no touching a teammate's cup.

BEERIO KART: Each player starts a Mario Kart race with one unopened beer. Must finish drink before crossing the finish line. No drinking while kart is moving — pull over first. Cross before finishing = race score doesn't count. Fastest valid combined team finish wins.

DIE: Two teams face each other, drinks at table corners. Toss the die so it hits the table cleanly and bounces high. One-handed catch by defending team negates the point. Missed catch = 1 point for offense; die hits floor untouched = 2 points. Play to host-set target (commonly 9 or 11).

DRINKBALL: One cup per player; one ball in play. Teams pass and shoot to land ball in an opponent's cup. Made shot = that opposing player drinks and cup resets. No goaltending, blocking with cup hand, or body contact. First team to agreed score wins.

${HOUSE_RULES}

When a situation isn't covered explicitly, rule in the spirit of fair play. For clear yes/no rulings, end your response with exactly one of these on its own line:
VERDICT: GOOD
VERDICT: BAD

Use VERDICT: GOOD when the play counts/scores. Use VERDICT: BAD when it doesn't. Skip the VERDICT line for general rules questions.`;

const refMsgsEl = document.getElementById("ask-ref-messages");
const refInput  = document.getElementById("ask-ref-input");
const refSend   = document.getElementById("ask-ref-send");

// Force rounded corners inline — highest possible specificity, beats all CSS rules
if (refInput) {
  refInput.style.setProperty("border-radius", "22px", "important");
  refInput.style.setProperty("-webkit-border-radius", "22px", "important");
}

const appendRefMsg = (text, role) => {
  const wrap = document.createElement("div");
  wrap.className = `ref-message ${role === "user" ? "user-msg" : "ref-msg"}`;
  const bubble = document.createElement("span");
  bubble.className = "ref-bubble";
  bubble.textContent = text;
  wrap.appendChild(bubble);
  refMsgsEl?.appendChild(wrap);
  if (refMsgsEl) refMsgsEl.scrollTop = refMsgsEl.scrollHeight;
  return { wrap, bubble };
};

const triggerRefFlash = (type) => {
  const flash = document.createElement("div");
  flash.className = `ref-ruling-flash ${type}`;
  flash.innerHTML = `
    <div class="ref-ruling-flash-inner">
      <span class="ref-ruling-flash-icon">${type === "good" ? "✅" : "❌"}</span>
      <div class="ref-ruling-flash-text">${type === "good" ? "Play Stands!" : "No Good!"}</div>
    </div>`;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 2600);
};

const askTheRef = async () => {
  const question = (refInput?.value || "").trim();
  if (!question) return;

  refInput.value = "";

  // Maintain conversation history for context
  refHistory.push({ role: "user", content: question });
  appendRefMsg(question, "user");

  setButtonLoading(refSend, true, "...");
  const { wrap: thinkWrap, bubble: thinkBubble } = appendRefMsg("The Ref is reviewing the play…", "ref");
  thinkWrap.classList.add("thinking");
  if (refMsgsEl) refMsgsEl.scrollTop = refMsgsEl.scrollHeight;

  try {
    const res = await fetch(REF_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 320,
        system: REF_SYSTEM_PROMPT,
        messages: refHistory, // full history = memory
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      thinkWrap.classList.remove("thinking");
      thinkBubble.textContent = `Ref error: ${data?.error?.message || `HTTP ${res.status}`}`;
      refHistory.pop(); // undo the failed message
      return;
    }

    let answer = data?.content?.[0]?.text?.trim() || "The Ref couldn't make a call on that one.";

    // Detect verdict BEFORE stripping so history stores clean text
    let verdict = null;
    if (/VERDICT:\s*GOOD/i.test(answer)) { verdict = "good"; answer = answer.replace(/VERDICT:\s*GOOD/i, "").trim(); }
    else if (/VERDICT:\s*BAD/i.test(answer)) { verdict = "bad"; answer = answer.replace(/VERDICT:\s*BAD/i, "").trim(); }

    // Store clean answer in history (no VERDICT tag)
    refHistory.push({ role: "assistant", content: answer });

    thinkWrap.classList.remove("thinking");
    thinkBubble.textContent = answer;

    if (verdict) {
      const badge = document.createElement("span");
      badge.className = `ref-verdict ${verdict}`;
      badge.textContent = verdict === "good" ? "✅ Play stands!" : "❌ No good!";
      thinkWrap.appendChild(badge);
      triggerRefFlash(verdict);
    } else {
      // Fallback: detect ruling sentiment from answer text when model skips VERDICT tag
      const goodSignals = /\b(count[s]?|stand[s]?|valid|legal|allowed|point[s]?|score[s]?|yes.{0,20}count|that.{0,10}score)\b/i;
      const badSignals = /\b(doesn.t count|no good|not allowed|invalid|illegal|no point|doesn.t score|void|disallowed)\b/i;
      let fallbackVerdict = null;
      if (badSignals.test(answer)) fallbackVerdict = "bad";
      else if (goodSignals.test(answer)) fallbackVerdict = "good";
      if (fallbackVerdict) {
        const badge = document.createElement("span");
        badge.className = `ref-verdict ${fallbackVerdict}`;
        badge.textContent = fallbackVerdict === "good" ? "✅ Play stands!" : "❌ No good!";
        thinkWrap.appendChild(badge);
        triggerRefFlash(fallbackVerdict);
      }
    }

  } catch (err) {
    thinkWrap.classList.remove("thinking");
    thinkBubble.textContent = "The Ref's mic cut out. Check your connection and try again.";
    refHistory.pop();
    console.warn("Ask the Ref error:", err);
  } finally {
    setButtonLoading(refSend, false);
    if (refMsgsEl) refMsgsEl.scrollTop = refMsgsEl.scrollHeight;
  }
};

refSend?.addEventListener("click", askTheRef);
refInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askTheRef(); }
});

// ── CLEAR BUTTONS on registration inputs ─────────────────────────────────────
document.querySelectorAll(".input-clear-wrap").forEach((wrap) => {
  const input = wrap.querySelector("input");
  const btn = wrap.querySelector(".input-clear-btn");
  if (!input || !btn) return;

  const sync = () => btn.classList.toggle("is-visible", input.value.length > 0);

  input.addEventListener("input", sync);
  input.addEventListener("change", sync);
  // Check on focus in case value was set programmatically
  input.addEventListener("focus", sync);
  sync(); // run once on init

  btn.addEventListener("click", () => {
    input.value = "";
    input.focus();
    sync();
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
});
// ── END ASK THE REF ──────────────────────────────────────────────────────────
