// Configuration des dimensions optimales selon les meilleures pratiques UX/UI
// Basé sur les guidelines Material Design et les standards de l'industrie

export const UXDimensions = {
  // Espacements de base (8px grid system)
  spacing: {
    xs: '4px',      // 0.25rem
    sm: '8px',      // 0.5rem
    md: '16px',     // 1rem
    lg: '20px',     // 1.25rem
    xl: '24px',     // 1.5rem
    xxl: '32px',    // 2rem
    xxxl: '40px'    // 2.5rem
  },

  // Dimensions des cartes KPI
  kpiCards: {
    minWidth: '260px',      // Largeur minimale optimale
    padding: '20px',        // Padding interne optimal
    gap: '20px',           // Espacement entre cartes
    iconSize: '48px',      // Taille d'icône optimale
    iconFontSize: '24px',  // Taille de police d'icône
    titleFontSize: '14px', // Taille de titre
    valueFontSize: '28px', // Taille de valeur principale
    descFontSize: '14px'   // Taille de description
  },

  // Dimensions des graphiques
  charts: {
    // Graphiques principaux
    main: {
      minWidth: '420px',    // Largeur minimale
      minHeight: '320px',   // Hauteur minimale
      containerHeight: '240px', // Hauteur du conteneur canvas
      gap: '20px',          // Espacement
      padding: '20px'       // Padding interne
    },
    
    // Graphiques secondaires
    secondary: {
      minWidth: '360px',    // Largeur minimale
      minHeight: '280px',   // Hauteur minimale
      containerHeight: '200px', // Hauteur du conteneur canvas
      gap: '20px',          // Espacement
      padding: '20px'       // Padding interne
    },

    // Graphiques de test
    test: {
      minWidth: '320px',    // Largeur minimale
      containerHeight: '240px', // Hauteur du conteneur
      gap: '18px',          // Espacement
      padding: '18px'       // Padding interne
    }
  },

  // Dimensions des composants
  components: {
    // Headers
    header: {
      height: '64px',       // Hauteur de la toolbar
      padding: '16px 24px', // Padding de la toolbar
      titleFontSize: '20px' // Taille du titre principal
    },

    // Sidebar
    sidebar: {
      width: '280px',       // Largeur étendue
      collapsedWidth: '70px', // Largeur réduite
      padding: '20px'       // Padding interne
    },

    // Boutons
    buttons: {
      height: '36px',       // Hauteur standard
      padding: '8px 16px',  // Padding interne
      fontSize: '14px'      // Taille de police
    }
  },

  // Breakpoints responsive
  breakpoints: {
    xs: '0px',      // Extra small
    sm: '600px',    // Small
    md: '960px',    // Medium
    lg: '1280px',   // Large
    xl: '1920px'    // Extra large
  },

  // Grilles responsive
  grids: {
    // Grille KPI - s'adapte selon la taille d'écran
    kpi: {
      xs: 1,        // 1 colonne sur très petit écran
      sm: 2,        // 2 colonnes sur petit écran
      md: 3,        // 3 colonnes sur écran moyen
      lg: 4,        // 4 colonnes sur grand écran
      xl: 4         // 4 colonnes sur très grand écran
    },

    // Grille graphiques principaux
    mainCharts: {
      xs: 1,        // 1 colonne sur petit écran
      sm: 1,        // 1 colonne sur petit écran
      md: 2,        // 2 colonnes sur écran moyen et plus
      lg: 2,
      xl: 2
    },

    // Grille graphiques secondaires
    secondaryCharts: {
      xs: 1,        // 1 colonne sur petit écran
      sm: 1,        // 1 colonne sur petit écran
      md: 2,        // 2 colonnes sur écran moyen
      lg: 2,        // 2 colonnes sur grand écran
      xl: 2         // 2 colonnes sur très grand écran
    }
  },

  // Typographie optimisée
  typography: {
    // Hiérarchie des titres
    h1: {
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '1.2'
    },
    h2: {
      fontSize: '20px',
      fontWeight: '600',
      lineHeight: '1.3'
    },
    h3: {
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '1.4'
    },
    h4: {
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '1.4'
    },

    // Corps de texte
    body: {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.5'
    },
    caption: {
      fontSize: '12px',
      fontWeight: '400',
      lineHeight: '1.4'
    }
  },

  // Couleurs et contrastes
  colors: {
    // Couleurs principales
    primary: '#3f51b5',
    secondary: '#ff4081',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',

    // Couleurs de fond
    background: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
      tertiary: '#eeeeee'
    },

    // Couleurs de texte
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999'
    }
  },

  // Ombres et élévations
  shadows: {
    light: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    medium: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
    heavy: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)'
  },

  // Animations et transitions
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)'
    }
  }
};

// Fonctions utilitaires pour les dimensions
export class UXDimensionUtils {
  /**
   * Obtenir la largeur de grille optimale selon le breakpoint
   */
  static getGridColumns(breakpoint: string, gridType: 'kpi' | 'mainCharts' | 'secondaryCharts'): number {
    const breakpoints = UXDimensions.breakpoints;
    const grids = UXDimensions.grids[gridType];
    
    if (breakpoint === 'xs' || parseInt(breakpoint) < 600) return grids.xs;
    if (parseInt(breakpoint) < 960) return grids.sm;
    if (parseInt(breakpoint) < 1280) return grids.md;
    if (parseInt(breakpoint) < 1920) return grids.lg;
    return grids.xl;
  }

  /**
   * Calculer la largeur minimale optimale selon le nombre de colonnes
   */
  static getOptimalMinWidth(columns: number, gridType: 'kpi' | 'mainCharts' | 'secondaryCharts'): string {
    const baseWidths = {
      kpi: 260,
      mainCharts: 420,
      secondaryCharts: 360
    };
    
    const baseWidth = baseWidths[gridType];
    const optimalWidth = Math.max(baseWidth, 280); // Largeur minimale absolue
    
    return `${optimalWidth}px`;
  }

  /**
   * Obtenir l'espacement optimal selon le contexte
   */
  static getOptimalSpacing(context: 'compact' | 'comfortable' | 'spacious'): string {
    const spacingMap = {
      compact: UXDimensions.spacing.md,      // 16px
      comfortable: UXDimensions.spacing.lg,  // 20px
      spacious: UXDimensions.spacing.xl      // 24px
    };
    
    return spacingMap[context];
  }

  /**
   * Calculer la hauteur optimale d'un graphique selon le contexte
   */
  static getOptimalChartHeight(context: 'kpi' | 'main' | 'secondary' | 'test'): string {
    const heights = {
      kpi: '200px',      // Graphiques dans les cartes KPI
      main: '240px',     // Graphiques principaux
      secondary: '200px', // Graphiques secondaires
      test: '240px'      // Graphiques de test
    };
    
    return heights[context];
  }
}

// Export des dimensions par défaut
export default UXDimensions;




















