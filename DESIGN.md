# ChainStock Design System

**Purpose:** Dark-themed stock watchlist and price alert app running onchain on the Internet Computer.

**Tone:** Professional, data-focused, premium modern tech. Clean, efficient, trustworthy.

**Aesthetic:** Dark SaaS with minimal decoration. High contrast for financial data readability. Card-based elevation. Teal accent for all interactive elements.

| Category | Value |
|----------|-------|
| Primary accent | Teal #20c997 (0.64 0.19 177) |
| Background | Near-black #121212 (0.14 0 0) |
| Card | #1f1f1f (0.19 0 0) |
| Border | #474747 (0.28 0 0) |
| Success | Green 0.65 0.25 145 |
| Destructive | Red 0.65 0.19 22 |

| Font | Family | Usage |
|------|--------|-------|
| Display | General Sans 700 | Headers, buttons, nav |
| Body | General Sans 400 | Body text, labels |
| Mono | Geist Mono | Stock symbols, prices, code |

**Zones:**
- Header: Dark bg with teal accent on active nav items; bottom border
- Sidebar: Card-colored with subtle icons; sidebar-primary for active
- Main content: Background with card sections stacked; hover states
- Footer: Muted with subtle top border
- Modals: Popover-colored with semi-transparent backdrop
- Toasts: Top-right stacked with 6s auto-dismiss; shadow-toast

**Components:**
- Buttons: Teal bg, dark foreground; outlined variant with teal border
- Cards: Dark bg, subtle shadow-card, border-border
- Tables: Alternating row backgrounds (muted/50); hover states
- Inputs: Dark bg, teal ring on focus; monospace for symbol search
- Command palette: Centered overlay, semi-transparent backdrop
- Alerts: Card-based with status badge (triggered/active)

**Motion:**
- Entrance: slideIn (300ms ease)
- Exit: slideOut (300ms ease)
- Feedback: fadeIn (200ms ease-out)
- Transitions: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)

**Constraints:**
- No decorative gradients or patterns
- Minimal shadows: card, elevated, toast only
- Data table density prioritized; rows compact with clear separation
- Icons: Lucide style throughout
- Teal accent used only for primary CTAs, active states, links

**Differentiation:** Onchain-first design with emphasis on real-time financial data and alert accuracy. Clean typography hierarchy with monospace for stock prices. Card-based layout with breathing room between sections.
