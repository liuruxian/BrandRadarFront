```markdown
# Design System Specification

## 1. Overview & Creative North Star: "The Architectural Ledger"
This design system is built for high-density business intelligence, moving beyond the "generic SaaS" look toward a refined, editorial experience. Our Creative North Star is **The Architectural Ledger**. 

Like a modern glass-and-steel skyscraper, the interface should feel structurally sound, impeccably organized, and flooded with "digital light." We break the standard template through **Intentional Asymmetry**—where sidebar and header actions are weighted differently—and **Tonal Depth**, where hierarchy is communicated through light and shadow rather than rigid outlines. The goal is to make complex data feel like a curated gallery rather than a spreadsheet.

---

## 2. Colors & Surface Philosophy
The palette utilizes a sophisticated range of blues and tiered neutrals to create a workspace that is easy on the eyes for long-duration usage.

### The Color Logic
- **Primary Surface Soul:** We use `primary` (#004ac6) and `primary_container` (#2563eb) sparingly. They represent the "actionable light" within the platform.
- **Tonal Neutrals:** The foundation is built on `surface` (#f7f9fb) and its variations. This allows for a "paper-on-stone" feel where content sits on a solid, architectural base.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders for sectioning or layout containment. Traditional 1px lines create visual "noise" that exhausts the user. Instead:
- **Background Shifts:** Define sections by placing a `surface_container_lowest` (#ffffff) card on top of a `surface_container_low` (#f2f4f6) background.
- **Shadow Separation:** Use light-based depth to imply boundaries.

### The "Glass & Gradient" Rule
To elevate the experience from "tool" to "premium platform," use Glassmorphism for floating elements (modals, dropdowns). Apply `surface_container_lowest` at 80% opacity with a `backdrop-filter: blur(12px)`. For primary CTAs, use a subtle linear gradient from `primary` to `primary_container` (top-left to bottom-right) to give buttons a tactile, "clickable" soul.

---

## 3. Typography: High-Contrast Precision
We utilize the **Inter** font family for its Swiss-inspired neutrality and exceptional legibility at small sizes.

- **Display & Headline:** Used for high-level data summaries. Use `headline-lg` (2rem) with a tight `-0.02em` letter-spacing to create an authoritative, editorial feel.
- **The Data Scale:** `label-md` and `label-sm` are the workhorses. Use `on_surface_variant` (#434655) for metadata to create a clear visual distinction from the primary `on_surface` content.
- **Contrast as Navigation:** We rely on font weight shifts (Semi-Bold for titles, Medium for labels) rather than size increases to maintain high information density without sacrificing elegance.

---

## 4. Elevation & Depth
Hierarchy in this system is achieved through **Tonal Layering**—a concept where depth is simulated by stacking lighter surfaces on darker ones.

- **The Layering Principle:** 
    1. Base Level: `surface` (#f7f9fb)
    2. Component Level: `surface_container_low` (#f2f4f6) 
    3. Detail Level (Cards/Active states): `surface_container_lowest` (#ffffff)
- **Ambient Shadows:** When an element must float (e.g., a flyout menu), use a "Soft-Focus Shadow." 
    - *Shadow:* `0px 12px 32px rgba(0, 23, 75, 0.06)`
    - This uses a blue-tinted shadow (`on_primary_fixed`) at very low opacity to mimic natural ambient light.
- **The Ghost Border:** If accessibility requires a border (e.g., in high-contrast modes), use a `outline_variant` at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Buttons
- **Primary:** Gradient-fill (`primary` to `primary_container`), 4px radius, `on_primary` text. Use for the single most important action.
- **Secondary:** `surface_container_high` background with `on_surface` text. No border.
- **Tertiary:** Ghost style. No background; `primary` text. Transitions to `surface_container_low` on hover.

### Input Fields
- **Base State:** `surface_container_lowest` background. A subtle `outline_variant` (20% opacity) border. 4px radius.
- **Focus State:** Border transitions to `primary`. Add a 2px "glow" using `primary` at 10% opacity.
- **Information Density:** Use `label-sm` for persistent floating labels to keep the footprint small but readable.

### Lists & Data Rows
- **Zero-Divider Policy:** Never use horizontal lines to separate list items. Use 8px of vertical padding (`spacing-sm`) and a `surface_container_low` background on hover to define the row.
- **Leading Elements:** Use high-contrast icons or `secondary_fixed_dim` avatars to create a strong vertical scan line.

### Interactive Chips
- **Status Chips:** Use semantic containers (e.g., `success` at 10% opacity) with 8px radius (`lg`). The text should be the full-tone semantic color for legibility.

---

## 6. Do’s and Don’ts

### Do
- **Do** use negative space as a separator. If two elements feel cluttered, increase the gap before adding a line.
- **Do** use `surface_bright` to highlight the most critical data point in a dashboard.
- **Do** align the 240px sidebar content to the left, but keep the 56px header items horizontally centered with their respective containers for an asymmetrical balance.

### Don’t
- **Don't** use pure black (#000000) for text. Always use `on_surface` (#191c1e) to maintain the "Architectural Ledger" softness.
- **Don't** use standard 8px "Material Design" shadows. They are too heavy for this system’s refined aesthetic.
- **Don't** use sharp 0px corners. Even at high density, the 4px-8px radius is required to soften the "business" edge of the data.

---

## 7. Signature Layout Component: The "Data Sheet"
Specifically for this platform, use the **Data Sheet** layout: A `surface_container_lowest` panel that slides over the main content area using a `backdrop-blur` of 20px on the `surface` below. This maintains context while providing a focused "Deep Dive" workspace, embodying the professional, refined nature of the design system.```