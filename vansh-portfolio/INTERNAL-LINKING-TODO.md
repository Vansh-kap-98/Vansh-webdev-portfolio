# Internal Linking Implementation
## Quick Code Updates for Entity Authority

---

## 1. Header Component (Logo/Nav)

**File:** `src/components/Header.tsx`

**Find:** Logo or home link  
**Update to:**

```tsx
<a 
  href="/" 
  title="Vansh Kapoor - Home"
  className="font-heading text-xl font-bold"
>
  Vansh Kapoor
</a>
```

**Alternative (keep current branding but add title):**
```tsx
<a 
  href="/" 
  title="Vansh Kapoor's Portfolio"
  className="font-heading text-xl font-bold"
>
  V-Designs
</a>
```

---

## 2. Footer Navigation Links

**File:** `src/components/Footer.tsx`

**Find lines ~64-75 (Navigation section)**

**Change from:**
```tsx
<a href="#">Work</a>
<a href="#">About</a>
<a href="#">Process</a>
<a href="#">Contact</a>
```

**Change to:**
```tsx
<a href="#work">Vansh Kapoor's Work</a>
<a href="/about">About Vansh Kapoor</a>
<a href="/process">Process</a>
<a href="/contact">Hire Vansh Kapoor</a>
```

---

## 3. Project Card Component

**File:** `src/components/ProjectCard.tsx`

**Find the project description/text area**

**Add this line:**
```tsx
<p className="text-muted-foreground text-sm max-w-md">
  {project.description}
</p>

{/* ADD THIS: */}
<p className="text-xs text-muted-foreground mt-2">
  By <a href="/" className="text-foreground hover:underline">Vansh Kapoor</a>
</p>
```

---

## 4. Project Detail Pages (All 6)

### NeuroCore.tsx

**Line ~50-55 (Back button area)**

**Change from:**
```tsx
<Link to="/">
  <ArrowLeft className="w-5 h-5" />
  <span className="font-mono text-sm">Back</span>
</Link>
```

**Change to:**
```tsx
<Link 
  to="/" 
  title="Back to Vansh Kapoor's portfolio"
  className="..."
>
  <ArrowLeft className="w-5 h-5" />
  <span className="font-mono text-sm">Vansh Kapoor</span>
</Link>
```

**Repeat for:**
- VelocityEV.tsx
- TheEstate.tsx
- GastroLab.tsx
- VoidStreetwear.tsx
- Artifacts.tsx

---

## 5. About Page

**File:** `src/pages/About.tsx`

**Add this paragraph at the top:**

```tsx
<p className="text-lg text-muted-foreground">
  <a href="/" className="text-foreground font-semibold hover:underline">
    Vansh Kapoor
  </a> is a creative developer who specializes in building immersive 
  web experiences with Three.js and WebGL.
</p>
```

---

## 6. Contact Page

**File:** `src/pages/Contact.tsx`

**Add to intro text:**

```tsx
<h1>Get in Touch with Vansh Kapoor</h1>
<p className="text-muted-foreground">
  Ready to collaborate? <a href="/" className="text-foreground hover:underline">
  Vansh Kapoor</a> is available for freelance projects and consulting.
</p>
```

---

## 7. Add Breadcrumbs (Optional but Powerful)

Create a new component: `src/components/Breadcrumbs.tsx`

```tsx
import { Link } from 'react-router-dom';

interface BreadcrumbProps {
  items: Array<{ label: string; href: string }>;
}

const Breadcrumbs = ({ items }: BreadcrumbProps) => {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className="font-mono text-xs text-muted-foreground mb-8"
    >
      <Link 
        to="/" 
        className="hover:text-foreground transition-colors"
      >
        Vansh Kapoor
      </Link>
      {items.map((item, index) => (
        <span key={index}>
          {' / '}
          {index === items.length - 1 ? (
            <span className="text-foreground">{item.label}</span>
          ) : (
            <Link 
              to={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
```

**Usage in NeuroCore.tsx:**

```tsx
import Breadcrumbs from '@/components/Breadcrumbs';

const NeuroCore = () => {
  return (
    <div>
      <Breadcrumbs 
        items={[
          { label: 'Projects', href: '/#work' },
          { label: 'NeuroCore', href: '/projects/neurocore' }
        ]}
      />
      {/* Rest of page */}
    </div>
  );
};
```

---

## 8. Social Links in Footer

**File:** `src/components/Footer.tsx`

**Find social links section (~85-95)**

**Update href attributes:**

```tsx
<a 
  href="https://twitter.com/vanshkapoor" 
  target="_blank"
  rel="noopener noreferrer"
  title="Vansh Kapoor on Twitter"
>
  Twitter
</a>

<a 
  href="https://linkedin.com/in/vanshkapoor"
  target="_blank"
  rel="noopener noreferrer"
  title="Vansh Kapoor on LinkedIn"
>
  LinkedIn
</a>

<a 
  href="https://github.com/vanshkapoor"
  target="_blank"
  rel="noopener noreferrer"
  title="Vansh Kapoor on GitHub"
>
  GitHub
</a>
```

---

## 9. Image Updates

### Profile Image

**Rename:** `public/logo.png` → `public/vansh-kapoor-profile.png`

**Update in index.html:**

**Line 6:**
```html
<link rel="icon" type="image/png" href="/vansh-kapoor-profile.png" />
```

**Line 21:**
```html
<meta property="og:image" content="https://vansh-webdev-portfolio.vercel.app/vansh-kapoor-profile.png" />
```

**Line 27:**
```html
<meta name="twitter:image" content="https://vansh-webdev-portfolio.vercel.app/vansh-kapoor-profile.png" />
```

**Line 49 (JSON-LD):**
```json
"image": "https://vansh-webdev-portfolio.vercel.app/vansh-kapoor-profile.png",
```

---

### Project Images

**Create folder:** `public/projects/`

**Rename project screenshots:**

```
neurocore.jpg → vansh-kapoor-neurocore-three-js-dashboard.jpg
velocityev.jpg → vansh-kapoor-velocityev-webgl-car-configurator.jpg
estate.jpg → vansh-kapoor-estate-property-viewer-scroll.jpg
gastrolab.jpg → vansh-kapoor-gastrolab-interactive-menu.jpg
void.jpg → vansh-kapoor-void-streetwear-cloth-simulation.jpg
artifacts.jpg → vansh-kapoor-artifacts-digital-gallery.jpg
```

---

### Add Alt Tags to Canvas

**File:** `src/components/canvas/Scene.tsx` (main background)

```tsx
<div 
  role="img"
  aria-label="Vansh Kapoor's interactive particle field - WebGL background animation"
>
  <Canvas>
    {/* ... */}
  </Canvas>
</div>
```

**Files:** All project scene files (NeuroCoreScene.tsx, etc.)

```tsx
// NeuroCore example
<div 
  role="img"
  aria-label="Vansh Kapoor's NeuroCore project - particle morphing data visualization with Three.js"
>
  <Canvas>
    <NeuroCoreScene />
  </Canvas>
</div>
```

---

## Summary Checklist

### Internal Links (30 min)
- [ ] Update Header logo/nav to include "Vansh Kapoor"
- [ ] Update Footer navigation anchor text
- [ ] Add "By Vansh Kapoor" to project cards
- [ ] Change all "Back" buttons to "Vansh Kapoor"
- [ ] Update About page intro paragraph
- [ ] Update Contact page heading
- [ ] Add breadcrumbs component (optional)
- [ ] Update social link titles

### Images (15 min)
- [ ] Rename profile photo to `vansh-kapoor-profile.png`
- [ ] Rename 6 project images with naming convention
- [ ] Update image references in index.html
- [ ] Add alt tags to Canvas containers
- [ ] Verify Open Graph image works in testing tools

---

## Testing Your Changes

### 1. Visual Check
- Homepage hero should say "VANSH KAPOOR / CREATIVE DEVELOPER"
- Footer should have "About Vansh Kapoor" section
- All back buttons should say "Vansh Kapoor" instead of "Back"

### 2. Code Validation
```bash
# Grep for your name in the codebase
grep -r "Vansh Kapoor" src/
```

**Expected:** Should find 10+ occurrences across components

### 3. Google Rich Results Test
```
https://search.google.com/test/rich-results
```
Paste your URL and verify Person schema loads correctly

---

## Time Investment
- **Quick wins (high impact):** 45 minutes
  - H1 update (done ✓)
  - Footer About section (done ✓)
  - Image renaming
  - Update 6 project "Back" buttons

- **Full implementation:** 2 hours
  - Everything above
  - Breadcrumbs component
  - Project card attribution
  - Canvas alt tags

---

**Priority Order:**
1. Images (highest SEO impact for name queries)
2. Project back buttons (frequent internal link)
3. Footer navigation
4. Breadcrumbs (nice-to-have)
