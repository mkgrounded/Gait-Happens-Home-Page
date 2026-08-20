(function () {
  const section = document.getElementById('transition-section');
  const productsSection = document.querySelector('.products-section');
  const portraitBox = section.querySelector('.parallax-img--portrait');
  const runnersBox = section.querySelector('.parallax-img--runners');
  const progressLabel = document.getElementById('progress-value');

  // Page-background stages, in scroll order. Each stage's own boundary
  // section (see the two IntersectionObservers below) reports whether
  // it's "active" (its center has crossed the viewport's vertical
  // center); GOLD takes priority over DARK, which takes priority over
  // LIGHT, so which one wins never depends on the order the two
  // observers happen to fire in — only on their current state.
  const LIGHT_BG = 'rgb(4, 119, 145)'; // --color-blue
  const DARK_BG = 'rgb(35, 31, 32)'; // --color-black
  const GOLD_BG = 'rgb(254, 199, 69)'; // --color-gold

  // Text-color endpoints scoped to the transition section itself: LIGHT =
  // while it still reads as the blue hero above it, DARK = fully
  // transitioned to the mockup's dark section.
  const LIGHT_TEXT = {
    heading: 'rgb(254, 199, 69)', // --color-gold
    body: 'rgb(35, 31, 32)',
    btnBg: 'rgb(35, 31, 32)',
    name: 'rgb(35, 31, 32)',
    label: 'rgb(35, 31, 32)',
  };
  const DARK_TEXT = {
    heading: 'rgb(255, 255, 255)',
    body: 'rgb(255, 255, 255)',
    btnBg: 'rgb(4, 119, 145)', // --color-blue (brand button, matches mockup)
    name: 'rgb(254, 199, 69)', // --color-gold
    label: 'rgb(254, 199, 69)',
  };

  let isDark = false;
  let isGold = false;

  function applyPageBg() {
    document.documentElement.style.setProperty(
      '--page-bg',
      isGold ? GOLD_BG : isDark ? DARK_BG : LIGHT_BG
    );
    if (progressLabel) progressLabel.textContent = isGold ? 'gold' : isDark ? 'dark' : 'light';
  }

  // "Tools To Put Your Best Foot Forward" reads white while it's still
  // sitting on the black background, then flips to its designed blue
  // once the section has crossed into gold.
  function applyProductsText() {
    productsSection.style.setProperty(
      '--products-heading-color',
      isGold ? 'rgb(4, 119, 145)' : 'rgb(255, 255, 255)'
    );
  }

  function applySectionText() {
    const t = isDark ? DARK_TEXT : LIGHT_TEXT;
    section.style.setProperty('--heading-color', t.heading);
    section.style.setProperty('--body-color', t.body);
    section.style.setProperty('--btn-bg', t.btnBg);
    section.style.setProperty('--name-color', t.name);
    section.style.setProperty('--label-color', t.label);
  }

  // Modeled on serious.business's "Latest insights for scaleup teams"
  // section: each theme swap is a snap-to-state toggle fired by an
  // IntersectionObserver crossing a fixed line (viewport's vertical
  // center), not a value continuously lerped from scroll position. The
  // CSS `transition` on each color property (styles.css) animates the
  // swap quickly and on a fixed clock, so wherever the user stops
  // scrolling the colors are always either fully settled or finishing a
  // short animation already underway — never parked mid-blend. The
  // black-to-gold swap into the Product Cards section uses the exact
  // same mechanism as the blue-to-black swap above it.
  const themeObserver = new IntersectionObserver(
    (entries) => {
      isDark = entries[0].isIntersecting;
      applySectionText();
      applyPageBg();
    },
    { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
  );
  themeObserver.observe(section);

  const goldObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        isGold = true;
      } else {
        // Exiting doesn't always mean "revert" — leaving through the
        // bottom edge means we've scrolled past the section into the
        // footer, and gold should hold; only leaving through the top
        // edge (scrolled back up above it) should revert to dark/light.
        isGold = entry.boundingClientRect.bottom <= window.innerHeight / 2;
      }
      applyPageBg();
      applyProductsText();
    },
    { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
  );
  goldObserver.observe(productsSection);

  // Parallax stays continuous and scroll-position-driven — a different
  // effect from the theme swap, each image box drifts at a different
  // fraction/direction of the section's own scroll travel.
  let ticking = false;

  function update() {
    const rect = section.getBoundingClientRect();
    portraitBox.style.transform = `translateY(${rect.top * 0.09}px)`;
    runnersBox.style.transform = `translateY(${rect.top * -0.12}px)`;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  applySectionText();
  applyPageBg();
  applyProductsText();
  update();
})();
