import { ChartOptions } from 'chart.js';

// Configuration globale pour tous les graphiques
export const globalChartOptions: Partial<ChartOptions> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        font: {
          size: 12,
          family: 'Roboto, sans-serif'
        },
        padding: 15,
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 12
      }
    }
  },
  elements: {
    point: {
      radius: 4,
      hoverRadius: 6
    },
    line: {
      tension: 0.4
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart'
  }
};

// Configuration spécifique pour les graphiques en donut
export const donutChartOptions: Partial<ChartOptions> = {
  ...globalChartOptions,
  plugins: {
    ...globalChartOptions.plugins,
    legend: {
      ...globalChartOptions.plugins?.legend,
      position: 'bottom' as const,
      labels: {
        ...globalChartOptions.plugins?.legend?.labels,
        padding: 20
      }
    }
  }
};

// Configuration spécifique pour les graphiques en barres
export const barChartOptions: Partial<ChartOptions> = {
  ...globalChartOptions,
  plugins: {
    ...globalChartOptions.plugins,
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
        drawBorder: false
      },
      ticks: {
        font: {
          size: 11
        },
        padding: 8
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11
        },
        padding: 8
      }
    }
  }
};

// Configuration spécifique pour les graphiques linéaires
export const lineChartOptions: Partial<ChartOptions> = {
  ...globalChartOptions,
  plugins: {
    ...globalChartOptions.plugins,
    legend: {
      ...globalChartOptions.plugins?.legend,
      position: 'top' as const
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
        drawBorder: false
      },
      ticks: {
        font: {
          size: 11
        },
        padding: 8
      }
    },
    x: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
        drawBorder: false
      },
      ticks: {
        font: {
          size: 11
        },
        padding: 8
      }
    }
  }
};

// Configuration spécifique pour les graphiques en secteurs
export const pieChartOptions: Partial<ChartOptions> = {
  ...globalChartOptions,
  plugins: {
    ...globalChartOptions.plugins,
    legend: {
      ...globalChartOptions.plugins?.legend,
      position: 'right' as const
    }
  }
};

// Configuration spécifique pour les graphiques radar
export const radarChartOptions: Partial<ChartOptions> = {
  ...globalChartOptions,
  plugins: {
    ...globalChartOptions.plugins,
    legend: {
      ...globalChartOptions.plugins?.legend,
      position: 'top' as const
    }
  },
  scales: {
    r: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
        circular: true
      },
      ticks: {
        font: {
          size: 11
        },
        padding: 8,
        backdropColor: 'transparent'
      }
    }
  }
};

// Configuration spécifique pour les graphiques polar area
export const polarAreaChartOptions: Partial<ChartOptions> = {
  ...globalChartOptions,
  plugins: {
    ...globalChartOptions.plugins,
    legend: {
      ...globalChartOptions.plugins?.legend,
      position: 'bottom' as const
    }
  }
};

// Couleurs par défaut pour les graphiques
export const defaultColors = {
  primary: ['#3f51b5', '#5c6bc0', '#7986cb', '#9fa8da', '#c5cae9'],
  success: ['#4caf50', '#66bb6a', '#81c784', '#a5d6a7', '#c8e6c9'],
  warning: ['#ff9800', '#ffb74d', '#ffcc02', '#ffd54f', '#ffecb3'],
  danger: ['#f44336', '#ef5350', '#e57373', '#ef9a9a', '#ffcdd2'],
  info: ['#2196f3', '#42a5f5', '#64b5f6', '#90caf9', '#bbdefb'],
  purple: ['#9c27b0', '#ab47bc', '#ba68c8', '#ce93d8', '#e1bee7'],
  teal: ['#009688', '#26a69a', '#4db6ac', '#80cbc4', '#b2dfdb']
};

// Configuration des thèmes
export const chartThemes = {
  light: {
    backgroundColor: '#ffffff',
    textColor: '#333333',
    gridColor: 'rgba(0, 0, 0, 0.1)',
    borderColor: 'rgba(0, 0, 0, 0.2)'
  },
  dark: {
    backgroundColor: '#2d2d2d',
    textColor: '#ffffff',
    gridColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)'
  }
};

// Fonction utilitaire pour appliquer un thème
export function applyChartTheme(options: Partial<ChartOptions>, theme: 'light' | 'dark'): Partial<ChartOptions> {
  const themeColors = chartThemes[theme];
  
  return {
    ...options,
    plugins: {
      ...options.plugins,
      legend: {
        ...options.plugins?.legend,
        labels: {
          ...options.plugins?.legend?.labels,
          color: themeColors.textColor
        }
      },
      tooltip: {
        ...options.plugins?.tooltip,
        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
        titleColor: theme === 'dark' ? '#333333' : '#ffffff',
        bodyColor: theme === 'dark' ? '#333333' : '#ffffff'
      }
    },
    scales: {
      ...options.scales,
      x: {
        ...options.scales?.['x'],
        grid: {
          ...options.scales?.['x']?.['grid'],
          color: themeColors.gridColor
        },
        ticks: {
          ...options.scales?.['x']?.['ticks'],
          color: themeColors.textColor
        }
      },
      y: {
        ...options.scales?.['y'],
        grid: {
          ...options.scales?.['y']?.['grid'],
          color: themeColors.gridColor
        },
        ticks: {
          ...options.scales?.['y']?.['ticks'],
          color: themeColors.textColor
        }
      }
    }
  };
}







