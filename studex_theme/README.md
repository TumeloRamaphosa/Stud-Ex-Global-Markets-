# STUDEX GLOBAL MARKETS — Official Theme Package

## Files Included

- `studex-theme.css` — The full CSS theme (link this in any website)
- `index.html` — Live demo showing every component
- `studex-hero.png` — The Michelangelo hero background image
- `README.md` — This file

## How to Use on Any Website

1. Put all files in the same folder
2. Add this to your HTML `<head>`:

```html
<link rel="stylesheet" href="studex-theme.css">
```

3. Use the classes below to build your pages

## Key Classes

### Layout
```html
<div class="container">        <!-- max-width centered wrapper -->
<section class="section">      <!-- padded page section -->
<div class="grid-2">           <!-- 2-column grid -->
<div class="grid-3">           <!-- 3-column grid -->
```

### Hero Background
```html
<section class="hero">
  <div class="hero-bg"></div>         <!-- Michelangelo image -->
  <div class="hero-gradient"></div>   <!-- dark fade overlay -->
  <div class="hero-sides"></div>      <!-- side fade -->
  <div class="hero-content">
    <!-- your content here -->
  </div>
</section>
```

### Typography
```html
<h1>Huge Display Title</h1>
<h2>Gold Section Title</h2>
<h3>White Sub Title</h3>
<span class="eyebrow">LABEL TEXT</span>
<p class="tagline">Tagline text here</p>
<p class="mono">MONOSPACE TEXT</p>
```

### Buttons
```html
<button class="btn btn-primary">Gold Button</button>
<button class="btn btn-secondary">Border Button</button>
<button class="btn btn-teal">Teal Button</button>
<button class="btn btn-sm btn-primary">Small Button</button>
<button class="btn btn-lg btn-primary">Large Button</button>
```

### Cards
```html
<div class="card card-gold">
  <span class="card-subtitle">LABEL</span>
  <div class="card-title">Card Title</div>
  <p class="card-body">Card description text</p>
</div>
```

### Badges
```html
<span class="badge badge-warning">⚠ WARNING</span>
<span class="badge badge-success">◈ SUCCESS</span>
<span class="badge badge-intel">⬡ INTEL</span>
<span class="badge badge-gold">◈ GOLD</span>
```

### Intel Panels (3 col)
```html
<div class="intel-grid">
  <div class="intel-panel warning">
    <div class="label">⚠ TITLE</div>
    <div class="text">Content here</div>
  </div>
  <div class="intel-panel success">...</div>
  <div class="intel-panel intel">...</div>
</div>
```

### Stat Blocks
```html
<div class="stat-block">
  <span class="number">$16B</span>
  <span class="label">Revenue</span>
</div>
```

### Navigation
```html
<nav class="nav">
  <a class="nav-brand" href="#">STUDEX ORACLE</a>
  <div class="nav-links">
    <a class="nav-link active" href="#">HOME</a>
    <a class="nav-link" href="#">ABOUT</a>
  </div>
  <div class="nav-status">◈ LIVE</div>
</nav>
```

### Status Footer
```html
<div class="status-footer">
  <div class="left">LEFT TEXT</div>
  <div class="center">◈ CENTER STATUS</div>
  <div class="right">RIGHT TEXT</div>
</div>
```

## Colours
| Name     | Value     | Use                    |
|----------|-----------|------------------------|
| Gold     | #C9A84C   | Primary brand colour   |
| Teal     | #2EC4B6   | AI / tech accent       |
| Red      | #FF6B6B   | Warning / weakness     |
| Green    | #51E89A   | Success / strength     |
| BG       | #030409   | Page background        |
| Text     | #F0E8D4   | Body text              |

## Font Sizes (4× bigger than standard)
| Variable     | Size   |
|--------------|--------|
| --fs-xs      | 14px   |
| --fs-sm      | 18px   |
| --fs-base    | 24px   |
| --fs-md      | 28px   |
| --fs-lg      | 36px   |
| --fs-xl      | 48px   |
| --fs-2xl     | 64px   |
| --fs-3xl     | 88px   |
| --fs-hero    | 120px  |
