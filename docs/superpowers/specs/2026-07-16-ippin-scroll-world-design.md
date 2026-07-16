# IPPIN Scroll World Experiment Design

## Purpose

Create a no-cost scroll-driven concept page for IPPIN in an isolated Git branch. The experiment must demonstrate the pacing and spatial feeling of `scroll-world` without replacing the existing website or requiring paid AI video generation.

## Scope

- Add a separate `scroll-world.html` entry point.
- Keep `index.html` and every existing public page unchanged.
- Reuse IPPIN's existing photography, logo, booking URL, palette, and AGFG artwork.
- Use three full-screen story scenes: arrival, culinary craft, and dining atmosphere.
- Drive scene scale, position, depth, copy, progress, and transitions from scroll position.
- Provide a fixed route rail, scroll progress, booking CTA, reduced-motion fallback, and responsive mobile layout.
- Do not add dependencies or generated media.

## Visual Direction

The page uses IPPIN burgundy `#440313`, warm ivory, muted gold, and real restaurant photography. Scenes are full-bleed and cinematic rather than card-based. Depth comes from a softly enlarged background layer, a sharper moving image layer, controlled light sweeps, and restrained copy transitions.

## Journey

1. **Arrival**: restaurant entrance and the West Village location.
2. **Craft**: sashimi and seasonal Japanese technique.
3. **Evening**: dining room, wine and sake, ending with booking and menu actions.

## Interaction

The page maps normalized document scroll into three scene bands. Adjacent scenes overlap briefly for a crossfade. Each active scene receives local progress from `0` to `1`, which controls camera scale and translation. Navigation dots jump to their corresponding scene. With reduced motion enabled, transitions become simple fades and transforms are disabled.

## Constraints

- No Higgsfield credits or other paid generation.
- No claim that the still-image prototype provides true new camera viewpoints.
- Existing master branch and GitHub Pages deployment remain untouched.
- The experiment must work from a static server and degrade gracefully when JavaScript is unavailable.
