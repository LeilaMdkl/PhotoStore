/* ===================================================================
   PHOTOSTORE – Script principal (JavaScript vanilla)
   Gère : menu mobile, scroll header, animations au scroll,
           filtres portfolio, lightbox, avis clients, formulaire
   =================================================================== */

"use strict";

/* ----------------------------------------------------
   1. Menu burger (mobile)
   ---------------------------------------------------- */
(function initBurgerMenu() {
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  if (!burger || !nav) return;

  burger.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
    burger.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
  });

  // Fermer le menu quand on clique sur un lien
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    });
  });
})();

/* ----------------------------------------------------
   2. Ombre du header au scroll
   ---------------------------------------------------- */
(function initHeaderScroll() {
  var header = document.getElementById("header");
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 20) {
      header.classList.add("header--scrolled");
    } else {
      header.classList.remove("header--scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ----------------------------------------------------
   3. Animations d'apparition au scroll (IntersectionObserver)
   ---------------------------------------------------- */
(function initRevealAnimations() {
  var elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  // Fallback : si IntersectionObserver n'est pas supporté, tout afficher
  if (!("IntersectionObserver" in window)) {
    elements.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();

/* ----------------------------------------------------
   4. Filtres du portfolio
   ---------------------------------------------------- */
(function initPortfolioFilters() {
  var filterButtons = document.querySelectorAll(".filter-btn");
  var items = document.querySelectorAll(".portfolio__item");
  if (!filterButtons.length || !items.length) return;

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      // Mettre à jour le bouton actif
      filterButtons.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      var filter = btn.getAttribute("data-filter");

      // Afficher / masquer les éléments
      items.forEach(function (item) {
        var category = item.getAttribute("data-category");
        if (filter === "all" || category === filter) {
          item.classList.remove("is-hidden");
        } else {
          item.classList.add("is-hidden");
        }
      });
    });
  });
})();

/* ----------------------------------------------------
   5. Lightbox du portfolio
   ---------------------------------------------------- */
(function initLightbox() {
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var closeBtn = document.getElementById("lightbox-close");
  var prevBtn = document.getElementById("lightbox-prev");
  var nextBtn = document.getElementById("lightbox-next");
  var items = document.querySelectorAll(".portfolio__item");

  if (!lightbox || !lightboxImg) return;

  var currentItems = []; // éléments visibles (non filtrés)
  var currentIndex = 0;

  // Récupérer les éléments actuellement visibles
  function getVisibleItems() {
    return Array.prototype.filter.call(items, function (item) {
      return !item.classList.contains("is-hidden");
    });
  }

  // Ouvrir la lightbox
  function openLightbox(item) {
    currentItems = getVisibleItems();
    currentIndex = currentItems.indexOf(item);
    showImage();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  // Afficher l'image courante
  function showImage() {
    if (currentIndex < 0 || currentIndex >= currentItems.length) return;
    var item = currentItems[currentIndex];
    var img = item.querySelector("img");
    if (!img) return;
    // Charger une version plus grande de l'image
    var src = img.getAttribute("src").replace("w=600", "w=1200");
    lightboxImg.setAttribute("src", src);
    lightboxImg.setAttribute("alt", img.getAttribute("alt") || "");
    var caption = item.querySelector("figcaption");
    lightboxCaption.textContent = caption ? caption.textContent : "";
  }

  // Fermer la lightbox
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  // Navigation précédent / suivant
  function showPrev() {
    currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
    showImage();
  }
  function showNext() {
    currentIndex = (currentIndex + 1) % currentItems.length;
    showImage();
  }

  // Ouvrir au clic sur un élément du portfolio
  items.forEach(function (item) {
    item.addEventListener("click", function () {
      openLightbox(item);
    });
  });

  // Boutons de navigation
  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (prevBtn) prevBtn.addEventListener("click", function (e) { e.stopPropagation(); showPrev(); });
  if (nextBtn) nextBtn.addEventListener("click", function (e) { e.stopPropagation(); showNext(); });

  // Fermer au clic sur l'arrière-plan
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  // Navigation au clavier
  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showPrev();
    else if (e.key === "ArrowRight") showNext();
  });
})();

/* ----------------------------------------------------
   6. Avis clients (génération des 20 avis)
   ---------------------------------------------------- */
(function initReviews() {
  var container = document.getElementById("reviews-grid");
  if (!container) return;

  // 20 avis : 16 à 5 étoiles, 4 à 4 étoiles (moyenne 4,8)
  var reviews = [
    { name: "Camille D.", activity: "Boutique en ligne de cosmétiques", stars: 5, date: "Janvier 2026", text: "Des packshots d'une qualité remarquable. Mes fiches produits n'ont jamais été aussi pro. Ventes en hausse de 30%." },
    { name: "Julien M.", activity: "Créateur de bijoux", stars: 5, date: "Décembre 2025", text: "Très professionnel, à l'écoute de mes besoins. Les photos de mes bagues sont tout simplement magnifiques." },
    { name: "Sophie L.", activity: "Restaurant Le Compiégnois", stars: 5, date: "Novembre 2025", text: "Les photos culinaires donnent immédiatement envie de goûter. Mon menu carte a pris une autre dimension." },
    { name: "Marc T.", activity: "Brasserie artisanale", stars: 5, date: "Octobre 2025", text: "Excellente prestation pour la photo de nos bières. Le rendu avec les décors naturels correspond parfaitement à notre image." },
    { name: "Nadia B.", activity: "Agence de communication", stars: 5, date: "Septembre 2025", text: "Un partenaire de confiance pour nos campagnes publicitaires. Réactif, créatif et toujours dans les délais." },
    { name: "Antoine R.", activity: "Parfumerie en ligne", stars: 5, date: "Août 2025", text: "Les mises en scène sur sable sont sublimes. Nos parfums ont enfin l'image luxueuse qu'ils méritent." },
    { name: "Émilie F.", activity: "Créatrice de bijoux fantaisie", stars: 5, date: "Juillet 2025", text: "Je recommande à 100%. Le détourage est impeccable et la retouche respecte l'aspect naturel de mes créations." },
    { name: "Thomas V.", activity: "E-commerce de montres", stars: 5, date: "Juin 2025", text: "Très bon travail sur mes photos de montres. Les reflets et la lumière mettent parfaitement en valeur les cadrans." },
    { name: "Laura P.", activity: "Boutique de mode en ligne", stars: 5, date: "Mai 2025", text: "Des photos de produits qui font la différence sur Instagram. Mon engagement a doublé depuis le reshoot." },
    { name: "Olivier S.", activity: "Producteur de miel artisanal", stars: 5, date: "Avril 2025", text: "Photos chaleureuses et naturelles pour mes pots de miel. Le rendu correspond exactement à l'esprit de ma marque." },
    { name: "Claire G.", activity: "Marque de soins naturels", stars: 5, date: "Mars 2025", text: "Un vrai talent pour sublimer des produits cosmétiques. Les ambiances créées sont uniques et cohérentes." },
    { name: "Hugo L.", activity: "Cave à vins en ligne", stars: 5, date: "Février 2025", text: "Photographe passionné et rigoureux. Les bouteilles sont mises en valeur avec une maîtrise parfaite de la lumière." },
    { name: "Mathilde A.", activity: "Pâtisserie artisanale", stars: 5, date: "Janvier 2025", text: "Mes pâtisseries n'ont jamais été aussi appétissantes. Les couleurs et les textures ressortent à merveille." },
    { name: "Sébastien D.", activity: "Agence de communication digitale", stars: 5, date: "Janvier 2026", text: "Collaboration régulière depuis un an. Toujours le même niveau d'exigence et de créativité. Un atout pour nos clients." },
    { name: "Inès K.", activity: "Marque de parfums indépendante", stars: 5, date: "Décembre 2025", text: "La direction artistique sur la formule Premium a transformé mon brief en images qui racontent une histoire." },
    { name: "Pierre J.", activity: "Boutique d'objets design", stars: 5, date: "Novembre 2025", text: "Sens du détail remarquable. Chaque objet est photographié sous le meilleur angle, avec une lumière parfaite." },
    { name: "Chloé M.", activity: "Créatrice de savons artisanaux", stars: 4, date: "Octobre 2025", text: "Très satisfaite du résultat global. Quelques ajustements sur les couleurs mais le rendu final est superbe." },
    { name: "Karim E.", activity: "Restaurant gastronomique", stars: 4, date: "Septembre 2025", text: "Bon travail sur les plats. J'aurais aimé un peu plus de créativité sur les mises en scène mais la qualité est là." },
    { name: "Anaïs B.", activity: "Boutique en ligne d'accessoires", stars: 4, date: "Août 2025", text: "Photos nettes et professionnelles. Délai légèrement au-delà de ce qui était annoncé mais le jeu en valait la peine." },
    { name: "Romain F.", activity: "Distillerie artisanale", stars: 4, date: "Juillet 2025", text: "De belles photos de mes bouteilles. Quelques échanges nécessaires pour la retouche mais le résultat final me convient." },
  ];

  var html = reviews.map(function (r) {
    var starsHtml = "★".repeat(r.stars) + "☆".repeat(5 - r.stars);
    return (
      '<article class="review-card reveal">' +
        '<div class="review-card__header">' +
          "<div>" +
            '<p class="review-card__author">' + r.name + "</p>" +
            '<p class="review-card__activity">' + r.activity + "</p>" +
          "</div>" +
          '<p class="review-card__date">' + r.date + "</p>" +
        "</div>" +
        '<p class="review-card__stars" aria-label="' + r.stars + ' étoiles sur 5">' + starsHtml + "</p>" +
        '<p class="review-card__text">' + r.text + "</p>" +
      "</article>"
    );
  }).join("");

  container.innerHTML = html;

  // Observer les nouvelles cartes révélées
  var newCards = container.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    newCards.forEach(function (el) { observer.observe(el); });
  } else {
    newCards.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();

/* ----------------------------------------------------
   7. Formulaire de contact (validation basique)
   ---------------------------------------------------- */
(function initContactForm() {
  var form = document.getElementById("contact-form");
  var successMsg = document.getElementById("form-success");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validation basique HTML5
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Simuler l'envoi (HTML uniquement, pas de backend)
    if (successMsg) {
      successMsg.hidden = false;
    }
    form.reset();

    // Masquer le message après 5 secondes
    setTimeout(function () {
      if (successMsg) successMsg.hidden = true;
    }, 5000);
  });
})();
