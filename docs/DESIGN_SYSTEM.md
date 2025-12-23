# Design System - April's Pest Control CRM

## Overview

This design system provides a comprehensive foundation for building consistent, accessible, and professional user interfaces across all 10 department modules of the pest control CRM platform.

**Design Principles:**
- **Professional & Clean** - Enterprise-grade software for business operations
- **User-Centric** - Minimize cognitive load, optimize for task completion
- **Consistent** - Unified patterns across all modules
- **Accessible** - WCAG 2.1 AA compliant
- **Responsive** - Mobile-first for field technicians, desktop-optimized for office staff

---

## Color Palette

### Primary Colors

**Primary Blue** - Trust, reliability, professionalism
- `primary.main`: #1976d2 (Material Blue 700)
- `primary.light`: #42a5f5 (Material Blue 400)
- `primary.dark`: #1565c0 (Material Blue 800)
- `primary.contrastText`: #ffffff

**Usage:** Primary CTAs, navigation highlights, active states, links

### Secondary Colors

**Secondary Green** - Growth, success, nature (pest control connection)
- `secondary.main`: #4caf50 (Material Green 500)
- `secondary.light`: #81c784 (Material Green 300)
- `secondary.dark`: #388e3c (Material Green 700)
- `secondary.contrastText`: #ffffff

**Usage:** Success states, positive metrics, completed tasks, recurring revenue indicators

### Semantic Colors

**Success Green**
- `success.main`: #4caf50
- `success.light`: #81c784
- `success.dark`: #388e3c
- `success.contrastText`: #ffffff

**Warning Orange**
- `warning.main`: #ff9800 (Material Orange 500)
- `warning.light`: #ffb74d (Material Orange 300)
- `warning.dark`: #f57c00 (Material Orange 700)
- `warning.contrastText`: #000000

**Error Red**
- `error.main`: #f44336 (Material Red 500)
- `error.light`: #e57373 (Material Red 300)
- `error.dark`: #d32f2f (Material Red 700)
- `error.contrastText`: #ffffff

**Info Blue**
- `info.main`: #2196f3 (Material Blue 500)
- `info.light`: #64b5f6 (Material Blue 300)
- `info.dark`: #1976d2 (Material Blue 700)
- `info.contrastText`: #ffffff

### Neutral Colors (Grayscale)

```
gray.50:  #fafafa  - Backgrounds, subtle fills
gray.100: #f5f5f5  - Card backgrounds, hover states
gray.200: #eeeeee  - Borders, dividers (light)
gray.300: #e0e0e0  - Borders, dividers (standard)
gray.400: #bdbdbd  - Disabled text
gray.500: #9e9e9e  - Secondary text, icons
gray.600: #757575  - Secondary text (dark mode)
gray.700: #616161  - Primary text (light backgrounds)
gray.800: #424242  - Headings, emphasis
gray.900: #212121  - Primary text, headings (dark)
```

### Background Colors

```
background.default: #fafafa  - Main app background
background.paper:   #ffffff  - Cards, modals, panels
background.dark:    #f5f5f5  - Section backgrounds
```

### Text Colors

```
text.primary:   rgba(0, 0, 0, 0.87)  - Body text, headings
text.secondary: rgba(0, 0, 0, 0.60)  - Supporting text, labels
text.disabled:  rgba(0, 0, 0, 0.38)  - Disabled states
text.hint:      rgba(0, 0, 0, 0.38)  - Placeholder text
```

### Color Usage Guidelines

**Status Indicators:**
- Active/Online: `success.main` (#4caf50)
- Pending/Warning: `warning.main` (#ff9800)
- Inactive/Error: `error.main` (#f44336)
- Scheduled/Info: `info.main` (#2196f3)

**Data Visualization:**
- Revenue/Positive: Green (#4caf50)
- Expenses/Negative: Red (#f44336)
- Neutral/Forecast: Blue (#1976d2)
- Pending/Waiting: Orange (#ff9800)

**Accessibility:**
- All color combinations must meet WCAG 2.1 AA contrast ratio (4.5:1 for text, 3:1 for UI components)
- Never use color alone to convey information (include icons, labels, or patterns)

---

## Typography

### Font Families

**Primary Font:** Roboto (Material-UI default)
- Clean, professional, excellent readability
- Great web performance and cross-platform support

```css
font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
```

**Monospace Font:** 'Roboto Mono' (for code, IDs, technical data)
```css
font-family: 'Roboto Mono', 'Courier New', monospace;
```

### Type Scale

**Display Headings**
```
h1: 2.5rem (40px)    - font-weight: 300 (light)   - line-height: 1.2
h2: 2rem (32px)      - font-weight: 400 (regular) - line-height: 1.3
h3: 1.75rem (28px)   - font-weight: 400 (regular) - line-height: 1.4
h4: 1.5rem (24px)    - font-weight: 500 (medium)  - line-height: 1.4
h5: 1.25rem (20px)   - font-weight: 500 (medium)  - line-height: 1.5
h6: 1rem (16px)      - font-weight: 500 (medium)  - line-height: 1.6
```

**Body Text**
```
body1: 1rem (16px)       - font-weight: 400 - line-height: 1.5   - Standard paragraph
body2: 0.875rem (14px)   - font-weight: 400 - line-height: 1.43  - Secondary text
```

**Labels & UI**
```
subtitle1: 1rem (16px)      - font-weight: 500 - line-height: 1.75  - Form labels
subtitle2: 0.875rem (14px)  - font-weight: 500 - line-height: 1.57  - Card headings
caption: 0.75rem (12px)     - font-weight: 400 - line-height: 1.66  - Helper text
overline: 0.75rem (12px)    - font-weight: 400 - line-height: 2.66  - UPPERCASE labels
```

**Buttons**
```
button: 0.875rem (14px) - font-weight: 500 - line-height: 1.75 - text-transform: uppercase
```

### Typography Usage

**Page Titles:** h3 (28px) - Main page heading
**Section Titles:** h4 (24px) - Dashboard sections, major areas
**Card Titles:** h5 (20px) or subtitle1 (16px medium)
**Table Headers:** subtitle2 (14px medium)
**Body Content:** body1 (16px) - Main readable content
**Secondary Info:** body2 (14px) - Supporting details
**Labels:** subtitle1 (16px medium) or subtitle2 (14px medium)
**Helper Text:** caption (12px) - Below inputs, timestamps
**Overline Labels:** overline (12px uppercase) - Category labels, tags

### Font Weights

```
light:    300 - Large headings (h1)
regular:  400 - Body text, most content
medium:   500 - Emphasis, labels, button text
bold:     700 - Strong emphasis (use sparingly)
```

---

## Spacing System

Based on 8px grid for consistent rhythm and alignment.

### Spacing Scale

```
spacing(0):  0px
spacing(1):  8px    - Tight spacing (chip padding, icon gaps)
spacing(2):  16px   - Standard spacing (card padding, button padding)
spacing(3):  24px   - Medium spacing (section gaps)
spacing(4):  32px   - Large spacing (between major sections)
spacing(5):  40px   - XL spacing
spacing(6):  48px   - XXL spacing (page margins)
spacing(8):  64px   - Hero spacing
spacing(12): 96px   - Max spacing
```

### Common Spacing Patterns

**Component Padding:**
- Button: 8px 16px (vertical horizontal)
- Input: 16px
- Card: 16px (mobile), 24px (desktop)
- Modal: 24px
- Page Container: 24px (mobile), 32px (tablet), 48px (desktop)

**Component Spacing:**
- Between buttons: 8px
- Between form fields: 16px
- Between sections: 24px - 32px
- Between page elements: 32px - 48px

**Grid Gaps:**
- Card grid: 16px (mobile), 24px (desktop)
- Dashboard widgets: 24px
- Table rows: 0px (dense), 8px (standard)

---

## Elevation & Shadows

Material Design elevation system for depth perception.

### Shadow Scale

```
elevation 0:  none                        - Flat elements
elevation 1:  0px 2px 4px rgba(0,0,0,0.1) - Cards (default)
elevation 2:  0px 4px 8px rgba(0,0,0,0.12) - Raised cards (hover)
elevation 4:  0px 8px 16px rgba(0,0,0,0.14) - Dropdowns, popovers
elevation 8:  0px 16px 24px rgba(0,0,0,0.16) - Modals, dialogs
elevation 16: 0px 24px 32px rgba(0,0,0,0.18) - Top-level overlays
```

### Usage

- **Cards (rest):** elevation 1
- **Cards (hover):** elevation 2
- **Buttons (raised):** elevation 2
- **Buttons (hover):** elevation 4
- **Dropdowns/Menus:** elevation 4
- **Modals/Dialogs:** elevation 8
- **Tooltips:** elevation 4
- **App Bar:** elevation 4
- **Drawers:** elevation 8

---

## Border Radius

Consistent corner rounding for modern, friendly appearance.

### Radius Scale

```
borderRadius.none:   0px   - Tables, dense layouts
borderRadius.small:  4px   - Buttons, chips, badges
borderRadius.medium: 8px   - Cards, inputs (default)
borderRadius.large:  12px  - Modals, major containers
borderRadius.round:  50%   - Avatars, icon buttons
```

### Usage

- **Buttons:** 4px
- **Inputs:** 8px
- **Cards:** 8px
- **Modals:** 12px
- **Chips/Tags:** 16px (pill shape)
- **Avatars:** 50% (circle)

---

## Responsive Breakpoints

Mobile-first design with progressive enhancement.

### Breakpoints

```
xs: 0px      - Extra small (mobile portrait)
sm: 600px    - Small (mobile landscape, tablets)
md: 960px    - Medium (tablets, small laptops)
lg: 1280px   - Large (laptops, desktops)
xl: 1920px   - Extra large (large desktops)
```

### Layout Behavior

**Mobile (xs - sm): 0-600px**
- Single column layouts
- Full-width cards
- Bottom navigation for technicians
- Simplified tables (responsive/stacked)
- Large touch targets (48px minimum)

**Tablet (sm - md): 600-960px**
- 2-column layouts where appropriate
- Sidebar navigation appears
- Tables with horizontal scroll
- Grid layouts for dashboards (2 columns)

**Desktop (md+): 960px+**
- Multi-column layouts
- Permanent sidebar navigation
- Full data tables
- Dashboard grids (3-4 columns)
- Optimized for mouse/keyboard

### Container Max Widths

```
sm: 600px
md: 960px
lg: 1280px
xl: 1920px
```

**Fluid Container:** 100% width with padding
**Fixed Container:** Max width based on breakpoint

---

## Iconography

### Icon Library

**Primary:** Material Icons (pre-installed with Material-UI)
- Consistent with Material Design
- Extensive library (2000+ icons)
- Multiple variants (filled, outlined, rounded)

### Icon Sizes

```
small:   16px - Inline with text, dense UIs
medium:  24px - Standard UI icons (default)
large:   32px - Headers, feature callouts
xlarge:  48px - Empty states, hero sections
```

### Icon Usage

**Navigation:** Use outlined style for inactive, filled for active
**Actions:** Outlined style for better clarity
**Status:** Filled style for immediate recognition

**Common Icons:**
- Add: add_circle, add_box
- Edit: edit, edit_note
- Delete: delete, delete_outline
- Search: search
- Filter: filter_list
- Sort: sort
- Settings: settings
- User: person, account_circle
- Calendar: calendar_today, event
- Location: place, location_on
- Phone: phone, call
- Email: email, mail_outline
- Dashboard: dashboard
- Analytics: analytics, bar_chart
- Tasks: task, check_circle
- Alerts: notification_important, warning
- Success: check_circle, done
- Error: error, cancel
- Info: info, help_outline

### Color Usage

- **Primary actions:** primary.main
- **Destructive actions:** error.main
- **Success states:** success.main
- **Neutral actions:** gray.600
- **Disabled:** gray.400

---

## Component Specifications

### Buttons

#### Primary Button
- **Use:** Main call-to-action
- **Style:** Contained, primary color
- **Height:** 36px (medium), 40px (large)
- **Padding:** 16px 24px
- **Font:** 14px, medium weight, uppercase
- **Border Radius:** 4px
- **Elevation:** 2 (rest), 4 (hover)

#### Secondary Button
- **Use:** Secondary actions
- **Style:** Outlined, primary color
- **Height:** 36px (medium), 40px (large)
- **Padding:** 16px 24px
- **Border:** 1px solid primary.main
- **Font:** 14px, medium weight, uppercase

#### Text Button
- **Use:** Tertiary actions, cancel
- **Style:** Text only, no background
- **Height:** 36px
- **Padding:** 8px 16px
- **Font:** 14px, medium weight, uppercase

#### Icon Button
- **Use:** Single icon actions
- **Size:** 40px x 40px (medium), 48px x 48px (large)
- **Icon Size:** 24px
- **Touch Target:** Minimum 48px x 48px (mobile)

#### Floating Action Button (FAB)
- **Use:** Primary mobile action (e.g., "Add Lead")
- **Size:** 56px x 56px
- **Position:** Fixed, bottom-right
- **Elevation:** 6
- **Color:** primary.main

### Form Components

#### Text Input
- **Height:** 56px (standard)
- **Padding:** 16px
- **Border:** 1px solid gray.300
- **Border Radius:** 8px
- **Label:** Floating label or static (16px medium)
- **Focus:** 2px border, primary.main color
- **Error:** Red border, helper text below
- **Disabled:** Gray background, gray.400 border

#### Select Dropdown
- **Height:** 56px
- **Style:** Same as text input
- **Icon:** Dropdown chevron (gray.600)
- **Menu:** elevation 4, max-height 300px

#### Checkbox
- **Size:** 18px x 18px
- **Border:** 2px solid gray.600
- **Checked:** primary.main background
- **Label:** 16px, gray.700, positioned right

#### Radio Button
- **Size:** 20px x 20px
- **Border:** 2px solid gray.600
- **Selected:** primary.main inner circle
- **Label:** 16px, gray.700, positioned right

#### Switch (Toggle)
- **Width:** 38px
- **Height:** 22px
- **Track:** gray.300 (off), primary.main (on)
- **Thumb:** 18px circle, white
- **Label:** 16px, positioned right or left

#### Date Picker
- **Input:** Same as text input
- **Calendar:** elevation 4 popover
- **Selected Date:** primary.main background

### Cards

#### Standard Card
- **Background:** white
- **Border Radius:** 8px
- **Elevation:** 1 (rest), 2 (hover)
- **Padding:** 16px (mobile), 24px (desktop)
- **Header:** h5 or subtitle1, gray.900
- **Body:** body2, gray.700
- **Actions:** Bottom-aligned, 8px gap

#### KPI Card (Dashboard Widget)
- **Layout:** Vertical or horizontal
- **Metric Value:** h3 (large number)
- **Metric Label:** caption or body2
- **Trend Indicator:** Icon + percentage (green/red)
- **Sparkline:** Optional chart (60-80px height)
- **Min Height:** 120px

#### List Card
- **Header:** Sticky if scrollable
- **List Items:** 56px height (standard)
- **Dividers:** 1px gray.200
- **Hover:** gray.50 background

### Tables & Data Grids

#### Table Header
- **Background:** gray.100
- **Text:** subtitle2 (14px medium), gray.900
- **Height:** 48px
- **Padding:** 16px
- **Sticky:** Yes (top: 0)
- **Sortable:** Icon indicator (arrow up/down)

#### Table Row
- **Height:** 52px (standard), 36px (dense)
- **Padding:** 16px
- **Hover:** gray.50 background
- **Selected:** primary.light (low opacity)
- **Border:** 1px gray.200 (bottom)

#### Table Cell
- **Text:** body2 (14px)
- **Alignment:** Left (text), right (numbers), center (icons)
- **Max Width:** Truncate with ellipsis if needed
- **Actions:** Icon buttons, right-aligned

#### Pagination
- **Position:** Bottom, centered or right-aligned
- **Controls:** First, Previous, Page numbers, Next, Last
- **Rows per page:** Dropdown (10, 25, 50, 100)

### Modals & Dialogs

#### Modal Structure
- **Overlay:** rgba(0,0,0,0.5)
- **Container:** white, elevation 8
- **Max Width:** sm (600px), md (960px), lg (1280px)
- **Border Radius:** 12px
- **Padding:** 24px

#### Modal Header
- **Title:** h5 (20px medium)
- **Close Button:** Icon button, top-right
- **Border Bottom:** 1px gray.200

#### Modal Body
- **Padding:** 24px
- **Scroll:** If content overflows
- **Max Height:** 70vh

#### Modal Footer
- **Padding:** 16px 24px
- **Border Top:** 1px gray.200
- **Buttons:** Right-aligned, 8px gap
- **Primary Action:** Right-most button

### Navigation Components

#### Top Navigation Bar (AppBar)
- **Height:** 64px
- **Background:** primary.main
- **Elevation:** 4
- **Logo:** Left-aligned, 40px height
- **Title:** h6, white
- **Icons:** white, 24px
- **User Menu:** Right-aligned, avatar + dropdown

#### Sidebar Navigation
- **Width:** 240px (expanded), 64px (collapsed)
- **Background:** white or gray.50
- **Elevation:** 2
- **Items:** 48px height
- **Active:** primary.main background (10% opacity)
- **Icons:** 24px, gray.600 (inactive), primary.main (active)
- **Labels:** 14px medium

#### Breadcrumbs
- **Font:** body2 (14px)
- **Color:** gray.600
- **Separator:** chevron_right icon
- **Current Page:** gray.900, not clickable
- **Links:** primary.main, underline on hover

### Chips & Badges

#### Chip (Tag)
- **Height:** 32px
- **Padding:** 8px 12px
- **Border Radius:** 16px (pill)
- **Font:** 14px medium
- **Variants:** Filled, outlined
- **Deletable:** Close icon on right

#### Badge
- **Size:** 20px min-width, 20px height
- **Position:** Top-right of parent
- **Border Radius:** 10px (pill)
- **Font:** 12px bold
- **Colors:** error.main (notifications), success.main (status)

### Tooltips

- **Background:** gray.900 (dark)
- **Text:** body2, white
- **Padding:** 8px 12px
- **Border Radius:** 4px
- **Elevation:** 4
- **Arrow:** Optional
- **Delay:** 500ms (show), 0ms (hide)

### Loading Indicators

#### Circular Progress
- **Size:** 24px (small), 40px (medium), 60px (large)
- **Color:** primary.main
- **Thickness:** 3.6px
- **Usage:** Inline loading, button loading

#### Linear Progress
- **Height:** 4px
- **Color:** primary.main
- **Usage:** Page loading, file uploads
- **Position:** Top of container or full-width

#### Skeleton Loader
- **Background:** gray.200
- **Animation:** Shimmer effect
- **Usage:** Content placeholders during load

### Alerts & Snackbars

#### Alert (Inline)
- **Variants:** success, info, warning, error
- **Icon:** Left-aligned (check, info, warning, error icons)
- **Background:** Light version of semantic color
- **Border:** 1px solid semantic color
- **Close:** Icon button, right-aligned
- **Padding:** 16px

#### Snackbar (Toast)
- **Position:** Bottom-left or bottom-center
- **Max Width:** 600px
- **Background:** gray.900 (dark)
- **Text:** white
- **Padding:** 16px
- **Duration:** 4-6 seconds
- **Action:** Optional button (right-aligned)

---

## Accessibility Guidelines

### WCAG 2.1 AA Compliance

#### Color Contrast
- **Normal Text:** 4.5:1 minimum contrast ratio
- **Large Text (18px+):** 3:1 minimum contrast ratio
- **UI Components:** 3:1 minimum contrast ratio
- **Never convey information by color alone**

#### Keyboard Navigation
- **Tab Order:** Logical and sequential
- **Focus Indicators:** Visible 2px outline (primary.main)
- **Skip Links:** "Skip to main content" for screen readers
- **Keyboard Shortcuts:** Document all shortcuts

#### Screen Reader Support
- **ARIA Labels:** All interactive elements
- **ARIA Live Regions:** Dynamic content updates
- **Alt Text:** All images and icons
- **Form Labels:** Properly associated with inputs
- **Semantic HTML:** Use correct heading hierarchy

#### Touch Targets
- **Minimum Size:** 48px x 48px (mobile)
- **Spacing:** 8px minimum between targets
- **Visual Feedback:** Clear hover/active states

#### Focus Management
- **Modals:** Trap focus, return on close
- **Dropdowns:** Arrow key navigation
- **Tables:** Keyboard navigation for cells
- **Forms:** Enter key to submit

---

## Animation & Transitions

### Timing Functions

```
easing.standard:     cubic-bezier(0.4, 0.0, 0.2, 1)  - Default
easing.easeIn:       cubic-bezier(0.4, 0.0, 1, 1)    - Accelerating
easing.easeOut:      cubic-bezier(0.0, 0.0, 0.2, 1)  - Decelerating
easing.easeInOut:    cubic-bezier(0.4, 0.0, 0.2, 1)  - Smooth
easing.sharp:        cubic-bezier(0.4, 0.0, 0.6, 1)  - Quick
```

### Duration Scale

```
shortest:  150ms  - Small transitions (tooltips, dropdowns)
shorter:   200ms  - Standard transitions (hover, focus)
short:     250ms  - Component state changes
standard:  300ms  - Default (page transitions)
long:      375ms  - Complex animations
longer:    450ms  - Large content transitions
longest:   600ms  - Page-level transitions
```

### Common Transitions

**Button Hover:** 200ms ease-in-out (background, elevation)
**Card Hover:** 250ms ease-out (elevation)
**Modal Open:** 300ms ease-out (scale, opacity)
**Dropdown:** 200ms ease-out (opacity, transform)
**Page Transition:** 300ms ease-in-out (opacity, slide)
**Loading Spinner:** continuous rotation

### Animation Principles

- **Purposeful:** Every animation should have a purpose
- **Performant:** Use transform and opacity (GPU-accelerated)
- **Subtle:** Avoid distracting users from their task
- **Responsive:** Faster on mobile (reduce duration by 30%)
- **Reduced Motion:** Respect user preference (prefers-reduced-motion)

---

## Layout Patterns

### Grid System

**12-Column Grid**
- Flexible, responsive layouts
- Gutter: 16px (mobile), 24px (desktop)
- Column width: Fluid based on container

**Common Patterns:**
- 1 column (mobile)
- 2 columns (tablet)
- 3-4 columns (desktop)
- Sidebar: 3/9 or 4/8 split

### Common Layouts

**Dashboard Layout:**
```
┌────────────────────────────────────────┐
│ Top Navigation (64px)                  │
├────────────────────────────────────────┤
│ │                                      │
│S│  Page Title                          │
│I│  ┌──────┐ ┌──────┐ ┌──────┐         │
│D│  │ KPI  │ │ KPI  │ │ KPI  │         │
│E│  └──────┘ └──────┘ └──────┘         │
│B│                                      │
│A│  ┌──────────────────────────┐       │
│R│  │                          │       │
│ │  │  Chart                   │       │
│2│  │                          │       │
│4│  └──────────────────────────┘       │
│0│                                      │
│p│  ┌──────────────────────────┐       │
│x│  │  Table                   │       │
│ │  └──────────────────────────┘       │
│ │                                      │
└────────────────────────────────────────┘
```

**Form Layout (2-Column):**
```
┌────────────────────────────────────────┐
│ Form Title                             │
├────────────────────────────────────────┤
│ ┌─────────────┐  ┌─────────────┐      │
│ │ First Name  │  │ Last Name   │      │
│ └─────────────┘  └─────────────┘      │
│                                        │
│ ┌─────────────────────────────────┐   │
│ │ Email                           │   │
│ └─────────────────────────────────┘   │
│                                        │
│ ┌─────────────┐  ┌─────────────┐      │
│ │ Phone       │  │ Company     │      │
│ └─────────────┘  └─────────────┘      │
│                                        │
│              [Cancel] [Submit]         │
└────────────────────────────────────────┘
```

**Mobile Layout (Stacked):**
```
┌─────────────────┐
│ Top Nav (56px)  │
├─────────────────┤
│                 │
│ Page Title      │
│                 │
│ ┌─────────────┐ │
│ │ KPI Card    │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │ KPI Card    │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │ Chart       │ │
│ └─────────────┘ │
│                 │
├─────────────────┤
│ Bottom Nav (56) │
└─────────────────┘
```

---

## Data Visualization

### Chart Colors

**Primary Palette (for single-series):**
- primary.main (#1976d2)

**Multi-Series Palette:**
1. Blue: #1976d2
2. Green: #4caf50
3. Orange: #ff9800
4. Purple: #9c27b0
5. Red: #f44336
6. Teal: #00bcd4
7. Amber: #ffc107
8. Indigo: #3f51b5

**Gradient (Revenue Growth):**
- Start: primary.light (#42a5f5)
- End: primary.main (#1976d2)

### Chart Types

**Line Chart:** Trends over time (revenue, leads, appointments)
**Bar Chart:** Comparisons (by technician, service type, territory)
**Pie/Donut Chart:** Proportions (service mix, lead sources)
**Area Chart:** Volume over time (cumulative revenue, active customers)
**Sparkline:** Inline trend (within KPI cards)

### Chart Guidelines

- **Tooltips:** Always show values on hover
- **Legends:** Position bottom or right, clear labels
- **Axes:** Clear labels, appropriate scale
- **Grid Lines:** Subtle (gray.200), horizontal only for readability
- **Responsive:** Adjust size/labels for mobile
- **Accessibility:** Include data tables for screen readers

---

## Best Practices

### Performance

- Use lazy loading for images and components
- Minimize bundle size (code splitting)
- Optimize font loading (subset, preload)
- Use CSS-in-JS efficiently (emotion with MUI)
- Debounce search inputs (300ms delay)

### Consistency

- Use theme values (never hard-code colors/spacing)
- Follow established patterns for new features
- Reuse existing components before creating new ones
- Document deviations from design system

### User Experience

- Provide immediate feedback for actions
- Show loading states for async operations
- Use optimistic UI updates where appropriate
- Maintain focus management in modals/dialogs
- Display helpful error messages with recovery actions

### Testing

- Test all components in light mode (dark mode future)
- Verify responsive behavior at all breakpoints
- Test keyboard navigation and screen reader support
- Validate color contrast with accessibility tools
- Test with real data (not just lorem ipsum)

---

## Resources

### Design Tools
- **Figma:** Design mockups and prototypes
- **Material-UI:** Component library documentation
- **Coolors:** Color palette generator
- **WebAIM:** Contrast checker

### Development Tools
- **React DevTools:** Component debugging
- **Lighthouse:** Performance and accessibility auditing
- **axe DevTools:** Accessibility testing
- **Storybook:** Component development and documentation

### References
- [Material Design 3](https://m3.material.io/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [A11y Project](https://www.a11yproject.com/)

---

**Version:** 1.0.0
**Last Updated:** 2025-12-22
**Maintained By:** UX Designer, Frontend Developer
