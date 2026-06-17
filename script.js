/**
 * Angola — Uma Nação, Muitas Dimensões
 * script.js — Projecto Educativo 2026
 * Cadeira: Sistemas Operativos
 *
 * Funcionalidades:
 *  1. Alternância de tema (claro/escuro) com persistência em localStorage
 *  2. Navegação activa com destaque automático por scroll (Intersection Observer)
 *  3. Menu hamburger para mobile
 *  4. Expansão/colapso de conteúdo extra com transição suave
 *  5. Cartões de navegação por categoria com destaque visual
 *  6. Validação e submissão do formulário com feedback acessível
 *  7. Scroll suave para âncoras
 *  8. Controlo de animação do botão toggle-info
 */

"use strict";

/* ============================================================
   REFERÊNCIAS DOM
   ============================================================ */
const body         = document.body;
const themeToggle  = document.getElementById("themeToggle");
const menuToggle   = document.getElementById("menuToggle");
const navLinks     = document.querySelectorAll(".nav-links a");
const navLinksWrap = document.querySelector(".nav-links");
const formulario   = document.getElementById("formulario");
const feedbackEl   = document.getElementById("feedback");
const infoButtons  = document.querySelectorAll(".toggle-info");
const categoryCards= document.querySelectorAll(".category-card");
const sections     = document.querySelectorAll("main section[id]");

/* ============================================================
   1. TEMA — CLARO / ESCURO
   ============================================================ */

/**
 * Aplica o tema e actualiza o botão.
 * @param {boolean} dark - true para modo escuro
 */
function applyTheme(dark) {
    body.classList.toggle("dark-theme", dark);

    const icon = themeToggle.querySelector("i");
    const text = themeToggle.querySelector("span");

    if (dark) {
        icon.className = "fa-solid fa-sun";
        text.textContent = "Modo Claro";
        themeToggle.setAttribute("aria-label", "Activar modo claro");
    } else {
        icon.className = "fa-solid fa-moon";
        text.textContent = "Modo Escuro";
        themeToggle.setAttribute("aria-label", "Activar modo escuro");
    }

    // Persistir preferência
    try {
        localStorage.setItem("angola-theme", dark ? "dark" : "light");
    } catch (_) { /* localStorage indisponível — sem problema */ }
}

// Carregar preferência guardada ou preferência do sistema
function loadTheme() {
    let saved = null;
    try { saved = localStorage.getItem("angola-theme"); } catch (_) {}

    if (saved === "dark") {
        applyTheme(true);
    } else if (saved === "light") {
        applyTheme(false);
    } else {
        // Respeitar preferência do sistema operativo
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(prefersDark);
    }
}

themeToggle.addEventListener("click", function () {
    const isDark = body.classList.contains("dark-theme");
    applyTheme(!isDark);
});

// Reagir a mudanças de tema do sistema em tempo real
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    let saved = null;
    try { saved = localStorage.getItem("angola-theme"); } catch (_) {}
    // Só actualizar automaticamente se o utilizador não tiver escolhido manualmente
    if (!saved) applyTheme(e.matches);
});

/* ============================================================
   2. NAVEGAÇÃO ACTIVA — INTERSECTION OBSERVER
   ============================================================ */

// Usar IntersectionObserver é mais performático que ouvir scroll
const navObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navLinks.forEach((link) => {
                    const isMatch = link.getAttribute("href") === "#" + id;
                    link.classList.toggle("active", isMatch);
                    if (isMatch) link.setAttribute("aria-current", "page");
                    else link.removeAttribute("aria-current");
                });
            }
        });
    },
    { rootMargin: "-30% 0px -60% 0px" }
);

sections.forEach((section) => navObserver.observe(section));

/* ============================================================
   3. MENU HAMBURGER (MOBILE)
   ============================================================ */
menuToggle.addEventListener("click", function () {
    const isOpen = navLinksWrap.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    const icon = menuToggle.querySelector("i");
    icon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
});

// Fechar menu ao clicar num link
navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        navLinksWrap.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        const icon = menuToggle.querySelector("i");
        icon.className = "fa-solid fa-bars";
    });
});

// Fechar menu ao clicar fora
document.addEventListener("click", function (e) {
    if (!e.target.closest("nav")) {
        navLinksWrap.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        const icon = menuToggle.querySelector("i");
        icon.className = "fa-solid fa-bars";
    }
});

/* ============================================================
   4. EXPANSÃO DE CONTEÚDO EXTRA
   ============================================================ */
infoButtons.forEach((button) => {
    button.addEventListener("click", function () {
        const targetId = button.getAttribute("aria-controls");
        const extraInfo = targetId
            ? document.getElementById(targetId)
            : button.previousElementSibling;

        if (!extraInfo) return;

        const isHidden = extraInfo.classList.contains("hidden");
        extraInfo.classList.toggle("hidden", !isHidden);

        // Actualizar texto e ícone do botão
        const icon = button.querySelector("i");
        const text = button.querySelector("span");

        if (isHidden) {
            icon.className = "fa-solid fa-minus";
            text.textContent = "Ver menos";
            button.setAttribute("aria-expanded", "true");

            // Rolar suavemente para o conteúdo expandido
            extraInfo.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
            icon.className = "fa-solid fa-plus";
            text.textContent = "Saiba mais";
            button.setAttribute("aria-expanded", "false");
        }
    });
});

/* ============================================================
   5. CARTÕES DE CATEGORIA — NAVEGAÇÃO COM DESTAQUE
   ============================================================ */
categoryCards.forEach((card) => {
    card.addEventListener("click", function () {
        const targetId = card.dataset.target;
        const section = targetId ? document.getElementById(targetId) : null;

        if (!section) return;

        section.scrollIntoView({ behavior: "smooth", block: "start" });

        // Aguardar o scroll terminar antes de aplicar o highlight
        setTimeout(() => {
            section.classList.add("highlight");
            setTimeout(() => section.classList.remove("highlight"), 1400);
        }, 400);
    });
});

/* ============================================================
   6. FORMULÁRIO — VALIDAÇÃO E FEEDBACK
   ============================================================ */

/**
 * Mostra o feedback com o tipo e mensagem especificados.
 * @param {string} message
 * @param {"success"|"error"} type
 */
function showFeedback(message, type = "success") {
    feedbackEl.textContent = message;
    feedbackEl.className = "feedback " + type;

    // Garantir que o leitor de ecrã anuncia a mensagem
    feedbackEl.setAttribute("role", "alert");

    // Limpar automaticamente após 6 segundos
    setTimeout(() => {
        feedbackEl.textContent = "";
        feedbackEl.className = "feedback";
    }, 6000);
}

formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    const nome      = document.getElementById("nome").value.trim();
    const email     = document.getElementById("email").value.trim();
    const provincia = document.getElementById("provincia").value;
    const categoria = document.getElementById("categoria").value;

    // Validação básica
    if (!nome) {
        showFeedback("Por favor, introduza o seu nome.", "error");
        document.getElementById("nome").focus();
        return;
    }

    if (!email || !isValidEmail(email)) {
        showFeedback("Por favor, introduza um endereço de email válido.", "error");
        document.getElementById("email").focus();
        return;
    }

    if (!provincia) {
        showFeedback("Por favor, seleccione a sua província.", "error");
        document.getElementById("provincia").focus();
        return;
    }

    // Sucesso
    showFeedback(
        `Obrigado, ${nome}! A sua participação foi registada. Categoria favorita: ${categoria}. Província: ${provincia}.`,
        "success"
    );
    formulario.reset();
});

/**
 * Valida um endereço de email de forma básica.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================================
   7. SCROLL SUAVE PARA ÂNCORAS DA NAV
   ============================================================ */
navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

// Scroll suave para o scroll-cue do hero
const scrollCue = document.querySelector(".scroll-cue");
if (scrollCue) {
    scrollCue.addEventListener("click", function (event) {
        const href = scrollCue.getAttribute("href");
        if (!href) return;
        const target = document.querySelector(href);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

// Botão voltar ao topo
const backToTop = document.querySelector(".back-to-top");
if (backToTop) {
    backToTop.addEventListener("click", function (event) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
    loadTheme();
    console.log(
        "%cAngola — Uma Nação, Muitas Dimensões\n%cProjecto Educativo · Sistemas Operativos · ISPI 2026",
        "color: #CC0000; font-size: 16px; font-weight: bold;",
        "color: #D4A017; font-size: 12px;"
    );
});
