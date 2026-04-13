
# macwav – Frontend Guidelines

## Theme

Dark-mode only. Deep, near-black backgrounds with a purple primary and teal accent. The palette is intentional — cool-toned neutrals, two strong brand colors, and clear semantic states.

---

## Color Tokens

| Token | Hex | Use For |
|---|---|---|
| `Background` | `#101014` | Page/app base |
| `Surface` | `#19191F` | Cards, panels, sidebar |
| `Popover` | `#1E1E24` | Dropdowns, tooltips, modals |
| `Muted` | `#26262C` | Disabled states, subtle fills |
| `Input` | `#212127` | Form fields |
| `Border` | `#2A2A32` | Dividers, outlines |
| `Primary` | `#905AF6` | CTAs, active states, focus rings |
| `Accent` | `#13DAC6` | Highlights, badges, secondary actions |
| `Text` | `#F1F1F4` | Body text |
| `Card Foreground` | `#E9E9EC` | Text inside cards |
| `Muted Foreground` | `#858593` | Placeholders, captions, metadata |
| `Destructive` | `#E44444` | Errors, delete actions |
| `Success` | `#22C380` | Confirmations, status |
| `Alert` | `#FAA22E` | Warnings |
| `Ring` | `#905AF6` | Focus ring (same as Primary) |
| `Primary Contrast` | `#FFFFFF` | Text on primary backgrounds |
| `Destructive Foreground` | `#FFFFFF` | Text on destructive backgrounds |
| `Accent Foreground` | `#101014` | Text on accent backgrounds |

---

## Layering / Depth Order

Each layer is ~5–8 hex steps lighter than the one beneath it. Keep this hierarchy strict — do not mix layers out of order.

```
Background  (#101014)        ← base canvas
  └─ Surface   (#19191F)     ← cards, sections, panels
       └─ Popover  (#1E1E24) ← overlays, dropdowns, modals
            └─ Input (#212127) ← interactive form fields
```

---

## Opacity Variants

Opacity variants share the same hex as their base tokens. Opacity is applied at the component level via CSS `opacity` or `rgba()` — it is not baked into the token.

```css
/* Examples */
background-color: rgba(16, 16, 20, 0.9);    /* Background 90 */
background-color: rgba(16, 16, 20, 0.8);    /* Background 80 */
background-color: rgba(144, 90, 246, 0.9);  /* Primary 90   */
background-color: rgba(144, 90, 246, 0.8);  /* Primary 80   */
background-color: rgba(19, 218, 198, 0.9);  /* Accent 90    */
background-color: rgba(19, 218, 198, 0.8);  /* Accent 80    */
```

---

## CSS Variable Reference

Declare these at the root level in your global stylesheet.

```css
:root {
  /* Core */
  --color-background:          #101014;
  --color-surface:             #19191F;
  --color-popover:             #1E1E24;
  --color-muted:               #26262C;
  --color-input:               #212127;
  --color-border:              #2A2A32;

  /* Brand */
  --color-primary:             #905AF6;
  --color-primary-contrast:    #FFFFFF;
  --color-accent:              #13DAC6;
  --color-accent-foreground:   #101014;
  --color-ring:                #905AF6;

  /* Text */
  --color-text:                #F1F1F4;
  --color-card-foreground:     #E9E9EC;
  --color-popover-foreground:  #E9E9EC;
  --color-muted-foreground:    #858593;

  /* Semantic */
  --color-destructive:         #E44444;
  --color-destructive-fg:      #FFFFFF;
  --color-success:             #22C380;
  --color-alert:               #FAA22E;
}
```

---

## Component Defaults

### Buttons

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| Primary | `#905AF6` | `#FFFFFF` | — | Lighten + subtle glow |
| Secondary / Ghost | transparent | `#F1F1F4` | `#2A2A32` | `bg: #26262C` |
| Destructive | `#E44444` | `#FFFFFF` | — | Darken slightly |
| Success | `#22C380` | `#101014` | — | Darken slightly |

### Inputs

```
background:   #212127
border:       #2A2A32
border-focus: #905AF6  (ring)
text:         #F1F1F4
placeholder:  #858593
```

### Cards

```
background: #19191F
border:     #2A2A32
text:       #E9E9EC
```

### Modals / Popovers

```
background: #1E1E24
border:     #2A2A32
text:       #E9E9EC
```

### Badges / Tags

Use `Accent (#13DAC6)` with `Accent Foreground (#101014)` for highlighted or active tags.  
Use `Muted (#26262C)` with `Muted Foreground (#858593)` for inactive or neutral tags.

---

## Semantic Color Usage

| State | Color | Token |
|---|---|---|
| Error / Delete | `#E44444` | `Destructive` |
| Success / Confirmed | `#22C380` | `Success` |
| Warning | `#FAA22E` | `Alert` |
| Active / Selected | `#905AF6` | `Primary` |
| Highlight / Secondary | `#13DAC6` | `Accent` |
| Disabled / Subtle | `#858593` | `Muted Foreground` |

---

## Accent Usage Rules

`Accent (#13DAC6)` is a strong teal — use it sparingly for maximum impact:

- ✅ Status indicators, online badges
- ✅ Active tab underlines or sidebar markers
- ✅ Secondary action links
- ✅ Highlighted data points in charts
- ❌ Do not use as a background for large surfaces
- ❌ Do not use alongside Primary on the same element

---

## Notes & Flags

> ⚠️ **Alert token** — The original spec lists `#FAA2E` which is an invalid 5-character hex. This document assumes the correct value is `#FAA22E` (amber/yellow-orange). **Confirm with the design source before implementation.**

---

*Project: macwav — Internal frontend reference. Last updated: April 2026.*
