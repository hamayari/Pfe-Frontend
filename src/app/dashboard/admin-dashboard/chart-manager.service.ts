import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import Chart from 'chart.js/auto';
import { 
  globalChartOptions, 
  donutChartOptions, 
  barChartOptions, 
  lineChartOptions,
  pieChartOptions,
  radarChartOptions,
  polarAreaChartOptions,
  applyChartTheme,
  defaultColors
} from './chart-config';

export interface ChartConfig {
  id: string;
  type: 'doughnut' | 'bar' | 'line' | 'pie' | 'radar' | 'polarArea';
  data: any;
  options?: any;
  theme?: 'light' | 'dark';
}

export interface ChartInstance {
  id: string;
  chart: any;
  element: HTMLCanvasElement;
  config: ChartConfig;
}

@Injectable({
  providedIn: 'root'
})
export class ChartManagerService {
  private charts = new Map<string, ChartInstance>();
  private chartReadySubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public chartReady$: Observable<boolean> = this.chartReadySubject.asObservable();
  public error$: Observable<string | null> = this.errorSubject.asObservable();

  constructor(private ngZone: NgZone) {
    this.initializeChartManager();
  }

  private async initializeChartManager(): Promise<void> {
    try {
      // Vérifier que Chart.js est disponible
      if (typeof Chart === 'undefined') {
        throw new Error('Chart.js n\'est pas disponible');
      }

      console.log('✅ ChartManagerService initialisé avec succès');
      console.log('📊 Version Chart.js:', Chart.version);
      
      this.chartReadySubject.next(true);
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du ChartManager:', error);
      this.errorSubject.next(`Erreur d'initialisation: ${error}`);
    }
  }

  /**
   * Créer un nouveau graphique
   */
  createChart(config: ChartConfig, element: HTMLCanvasElement): ChartInstance | null {
    try {
      // Vérifier que l'élément est valide
      if (!element || !element.getContext) {
        throw new Error('Élément canvas invalide');
      }

      // Détruire le graphique existant s'il y en a un
      this.destroyChart(config.id);

      // Préparer les options du graphique
      const options = this.prepareChartOptions(config);

      // Créer le graphique
      const chart = new Chart(element, {
        type: config.type,
        data: config.data,
        options: options
      });

      // Créer l'instance
      const chartInstance: ChartInstance = {
        id: config.id,
        chart,
        element,
        config
      };

      // Stocker l'instance
      this.charts.set(config.id, chartInstance);

      console.log(`✅ Graphique ${config.type} créé avec succès: ${config.id}`);
      return chartInstance;

    } catch (error) {
      console.error(`❌ Erreur lors de la création du graphique ${config.id}:`, error);
      this.errorSubject.next(`Erreur de création: ${error}`);
      return null;
    }
  }

  /**
   * Mettre à jour un graphique existant
   */
  updateChart(chartId: string, newData: any): boolean {
    try {
      const chartInstance = this.charts.get(chartId);
      if (!chartInstance) {
        throw new Error(`Graphique ${chartId} non trouvé`);
      }

      // Mettre à jour les données
      chartInstance.chart.data = newData;
      chartInstance.chart.update('active');

      console.log(`✅ Graphique ${chartId} mis à jour avec succès`);
      return true;

    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour du graphique ${chartId}:`, error);
      this.errorSubject.next(`Erreur de mise à jour: ${error}`);
      return false;
    }
  }

  /**
   * Redimensionner un graphique
   */
  resizeChart(chartId: string): boolean {
    try {
      const chartInstance = this.charts.get(chartId);
      if (!chartInstance) {
        throw new Error(`Graphique ${chartId} non trouvé`);
      }

      // Redimensionner le graphique
      chartInstance.chart.resize();

      console.log(`✅ Graphique ${chartId} redimensionné avec succès`);
      return true;

    } catch (error) {
      console.error(`❌ Erreur lors du redimensionnement du graphique ${chartId}:`, error);
      this.errorSubject.next(`Erreur de redimensionnement: ${error}`);
      return false;
    }
  }

  /**
   * Changer le thème d'un graphique
   */
  changeChartTheme(chartId: string, theme: 'light' | 'dark'): boolean {
    try {
      const chartInstance = this.charts.get(chartId);
      if (!chartInstance) {
        throw new Error(`Graphique ${chartId} non trouvé`);
      }

      // Appliquer le nouveau thème
      const newOptions = applyChartTheme(chartInstance.config.options || {}, theme);
      chartInstance.chart.options = newOptions;
      chartInstance.chart.update('none');

      // Mettre à jour la configuration
      chartInstance.config.theme = theme;

      console.log(`✅ Thème ${theme} appliqué au graphique ${chartId}`);
      return true;

    } catch (error) {
      console.error(`❌ Erreur lors du changement de thème du graphique ${chartId}:`, error);
      this.errorSubject.next(`Erreur de changement de thème: ${error}`);
      return false;
    }
  }

  /**
   * Détruire un graphique spécifique
   */
  destroyChart(chartId: string): boolean {
    try {
      const chartInstance = this.charts.get(chartId);
      if (chartInstance) {
        chartInstance.chart.destroy();
        this.charts.delete(chartId);
        console.log(`✅ Graphique ${chartId} détruit avec succès`);
      }
      return true;

    } catch (error) {
      console.error(`❌ Erreur lors de la destruction du graphique ${chartId}:`, error);
      this.errorSubject.next(`Erreur de destruction: ${error}`);
      return false;
    }
  }

  /**
   * Détruire tous les graphiques
   */
  destroyAllCharts(): void {
    try {
      this.charts.forEach((chartInstance, chartId) => {
        try {
          chartInstance.chart.destroy();
        } catch (error) {
          console.warn(`⚠️ Erreur lors de la destruction du graphique ${chartId}:`, error);
        }
      });

      this.charts.clear();
      console.log('✅ Tous les graphiques ont été détruits');

    } catch (error) {
      console.error('❌ Erreur lors de la destruction de tous les graphiques:', error);
      this.errorSubject.next(`Erreur de destruction globale: ${error}`);
    }
  }

  /**
   * Obtenir une instance de graphique
   */
  getChart(chartId: string): ChartInstance | undefined {
    return this.charts.get(chartId);
  }

  /**
   * Obtenir tous les graphiques
   */
  getAllCharts(): Map<string, ChartInstance> {
    return this.charts;
  }

  /**
   * Vérifier si un graphique existe
   */
  hasChart(chartId: string): boolean {
    return this.charts.has(chartId);
  }

  /**
   * Obtenir le nombre de graphiques actifs
   */
  getChartCount(): number {
    return this.charts.size;
  }

  /**
   * Préparer les options du graphique selon son type
   */
  private prepareChartOptions(config: ChartConfig): any {
    let baseOptions: any;

    // Sélectionner les options de base selon le type
    switch (config.type) {
      case 'doughnut':
        baseOptions = donutChartOptions;
        break;
      case 'bar':
        baseOptions = barChartOptions;
        break;
      case 'line':
        baseOptions = lineChartOptions;
        break;
      case 'pie':
        baseOptions = pieChartOptions;
        break;
      case 'radar':
        baseOptions = radarChartOptions;
        break;
      case 'polarArea':
        baseOptions = polarAreaChartOptions;
        break;
      default:
        baseOptions = globalChartOptions;
    }

    // Fusionner avec les options personnalisées
    const mergedOptions = {
      ...baseOptions,
      ...config.options
    };

    // Appliquer le thème si spécifié
    if (config.theme) {
      return applyChartTheme(mergedOptions, config.theme);
    }

    return mergedOptions;
  }

  /**
   * Nettoyer les données du graphique
   */
  private cleanChartData(data: any): any {
    // Supprimer les propriétés undefined ou null
    const cleanData = JSON.parse(JSON.stringify(data));
    
    // Nettoyer les datasets
    if (cleanData.datasets) {
      cleanData.datasets = cleanData.datasets.map((dataset: any) => {
        const cleanDataset = { ...dataset };
        
        // Supprimer les propriétés vides
        Object.keys(cleanDataset).forEach(key => {
          if (cleanDataset[key] === undefined || cleanDataset[key] === null) {
            delete cleanDataset[key];
          }
        });
        
        return cleanDataset;
      });
    }

    return cleanData;
  }

  /**
   * Valider la configuration d'un graphique
   */
  validateChartConfig(config: ChartConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Vérifier l'ID
    if (!config.id || config.id.trim() === '') {
      errors.push('ID du graphique requis');
    }

    // Vérifier le type
    const validTypes = ['doughnut', 'bar', 'line', 'pie', 'radar', 'polarArea'];
    if (!validTypes.includes(config.type)) {
      errors.push(`Type de graphique invalide: ${config.type}`);
    }

    // Vérifier les données
    if (!config.data || !config.data.datasets || config.data.datasets.length === 0) {
      errors.push('Données du graphique requises');
    }

    // Vérifier les datasets
    if (config.data && config.data.datasets) {
      config.data.datasets.forEach((dataset: any, index: number) => {
        if (!dataset.data || !Array.isArray(dataset.data)) {
          errors.push(`Dataset ${index}: données invalides`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Nettoyer les ressources
   */
  ngOnDestroy(): void {
    this.destroyAllCharts();
    this.chartReadySubject.complete();
    this.errorSubject.complete();
  }
}







