@tailwind base;
@tailwind components;
@tailwind utilities;

@font-face {
  font-family: "General Sans";
  src: url("/assets/fonts/GeneralSans.woff2") format("woff2");
  font-weight: 400 700;
  font-display: swap;
}

@font-face {
  font-family: "Geist Mono";
  src: url("/assets/fonts/GeistMono.woff2") format("woff2");
  font-display: swap;
}

@layer base {
  :root {
    --font-display: "General Sans", sans-serif;
    --font-body: "General Sans", sans-serif;
    --font-mono: "Geist Mono", monospace;
    --radius: 0.625rem;

    --background: 0.99 0 0;
    --foreground: 0.15 0 0;
    --card: 1.0 0 0;
    --card-foreground: 0.15 0 0;
    --popover: 1.0 0 0;
    --popover-foreground: 0.15 0 0;

    --primary: 0.74 0.17 168;
    --primary-foreground: 0.98 0 0;

    --secondary: 0.95 0 0;
    --secondary-foreground: 0.25 0 0;
    --muted: 0.95 0 0;
    --muted-foreground: 0.5 0 0;

    --accent: 0.74 0.17 168;
    --accent-foreground: 0.98 0 0;

    --destructive: 0.55 0.22 25;
    --destructive-foreground: 0.98 0 0;

    --border: 0.9 0 0;
    --input: 0.9 0 0;
    --ring: 0.74 0.17 168;

    --chart-1: 0.65 0.22 40;
    --chart-2: 0.6 0.12 185;
    --chart-3: 0.4 0.07 227;
    --chart-4: 0.83 0.19 84;
    --chart-5: 0.77 0.19 70;

    --sidebar: 0.98 0 0;
    --sidebar-foreground: 0.15 0 0;
    --sidebar-primary: 0.64 0.19 177;
    --sidebar-primary-foreground: 0.98 0 0;
    --sidebar-accent: 0.95 0 0;
    --sidebar-accent-foreground: 0.25 0 0;
    --sidebar-border: 0.9 0 0;
    --sidebar-ring: 0.64 0.19 177;
  }

  .dark {
    --background: 0.13 0 0;
    --foreground: 0.95 0 0;
    --card: 0.17 0 0;
    --card-foreground: 0.95 0 0;
    --popover: 0.21 0 0;
    --popover-foreground: 0.95 0 0;

    --primary: 0.74 0.17 168;
    --primary-foreground: 0.14 0 0;

    --secondary: 0.35 0 0;
    --secondary-foreground: 0.95 0 0;
    --muted: 0.25 0 0;
    --muted-foreground: 0.65 0 0;

    --accent: 0.74 0.17 168;
    --accent-foreground: 0.14 0 0;

    --destructive: 0.65 0.19 22;
    --destructive-foreground: 0.95 0 0;

    --border: 0.25 0 0;
    --input: 0.21 0 0;
    --ring: 0.74 0.17 168;

    --chart-1: 0.49 0.24 264;
    --chart-2: 0.7 0.17 162;
    --chart-3: 0.77 0.19 70;
    --chart-4: 0.63 0.27 304;
    --chart-5: 0.65 0.25 16;

    --sidebar: 0.19 0 0;
    --sidebar-foreground: 0.95 0 0;
    --sidebar-primary: 0.64 0.19 177;
    --sidebar-primary-foreground: 0.14 0 0;
    --sidebar-accent: 0.25 0 0;
    --sidebar-accent-foreground: 0.85 0 0;
    --sidebar-border: 0.28 0 0;
    --sidebar-ring: 0.64 0.19 177;
  }

  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-body antialiased;
  }
}

@layer utilities {
  .transition-smooth {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .shadow-card {
    box-shadow: 0 4px 12px oklch(0 0 0 / 0.15);
  }

  .shadow-elevated {
    box-shadow: 0 8px 24px oklch(0 0 0 / 0.2);
  }

  .bg-muted-subtle {
    @apply bg-muted/40;
  }

  .text-data {
    @apply font-mono text-sm;
  }

  .table-row-hover {
    @apply hover:bg-muted/50 transition-colors;
  }
}
