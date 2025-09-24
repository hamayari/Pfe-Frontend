import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { Nomenclature } from 'src/app/core/models/nomenclature.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Flat node with expandable and level information
 */
interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  nomenclature: Nomenclature;
  isLoading?: boolean;
}

@Component({
  selector: 'app-nomenclature-tree-view',
  templateUrl: './nomenclature-tree-view.component.html',
  styleUrls: ['./nomenclature-tree-view.component.scss']
})
export class NomenclatureTreeViewComponent implements OnChanges, OnDestroy {
  @Input() nomenclatures: Nomenclature[] = [];
  @Input() expandFirstLevel = true;
  @Input() showCheckboxes = false;
  @Input() selectable = false;
  @Input() selectedId: string | null = null;
  
  @Output() nodeSelected = new EventEmitter<Nomenclature>();
  @Output() selectionChange = new EventEmitter<Nomenclature[]>();
  
  // Tree control and data source
  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );
  
  treeFlattener = new MatTreeFlattener(
    this._transformer.bind(this),
    node => node.level,
    node => node.expandable,
    node => node.children || []
  );
  
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  
  // Selection model for checkboxes
  checklistSelection = new SelectionModel<FlatNode>(true /* multiple */);
  
  // Destroy subject
  private destroy$ = new Subject<void>();
  
  constructor() {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nomenclatures'] && this.nomenclatures) {
      // Build the tree data structure
      this.dataSource.data = this.nomenclatures;
      
      // Expand first level by default
      if (this.expandFirstLevel) {
        this.treeControl.dataNodes
          .filter(node => node.level === 0)
          .forEach(node => this.treeControl.expand(node));
      }
      
      // Select the node if selectedId is provided
      if (this.selectedId) {
        const node = this.treeControl.dataNodes.find(n => n.nomenclature.id === this.selectedId);
        if (node) {
          this.selectNode(node);
        }
      }
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Transformer to convert nested node to flat node
   */
  private _transformer(node: Nomenclature, level: number): FlatNode {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.label || node.name,
      level: level,
      nomenclature: node
    };
  }
  
  /**
   * Whether the node has children
   */
  hasChild = (_: number, node: FlatNode) => node.expandable;
  
  /**
   * Whether the node is loading children
   */
  isLoading = (_: number, node: FlatNode) => node.isLoading;
  
  /**
   * Toggle node expansion
   */
  toggleNode(node: FlatNode): void {
    if (!this.selectable || !this.showCheckboxes) {
      this.nodeSelected.emit(node.nomenclature);
    }
    
    if (this.showCheckboxes) {
      this.toggleNodeSelection(node);
    }
    
    // Toggle expansion
    this.treeControl.toggle(node);
  }
  
  /**
   * Toggle node selection (for checkboxes)
   */
  toggleNodeSelection(node: FlatNode): void {
    // Toggle this node
    this.checklistSelection.toggle(node);
    
    // Notify parent component
    this.selectionChange.emit(
      this.checklistSelection.selected.map(selectedNode => selectedNode.nomenclature)
    );
  }
  
  /**
   * Whether the node is selected
   */
  isNodeSelected(node: FlatNode): boolean {
    return this.checklistSelection.isSelected(node);
  }
  
  /**
   * Select a node programmatically
   */
  selectNode(node: FlatNode): void {
    if (this.selectable) {
      // Clear previous selection
      this.checklistSelection.clear();
      
      // Select the node
      this.checklistSelection.select(node);
      
      // Notify parent component
      this.nodeSelected.emit(node.nomenclature);
      this.selectionChange.emit([node.nomenclature]);
    }
  }
  
  /**
   * Get the icon based on node type
   */
  getNodeIcon(node: FlatNode): string {
    if (node.isLoading) return 'hourglass_empty';
    
    const type = node.nomenclature.type?.toLowerCase();
    
    switch (type) {
      case 'application':
        return 'apps';
      case 'zone':
        return 'location_on';
      case 'structure':
        return 'account_balance';
      case 'convention_type':
        return 'description';
      case 'invoice_item':
        return 'receipt';
      default:
        return 'folder';
    }
  }
  
  /**
   * Get the badge color based on node type
   */
  getNodeBadgeClass(node: FlatNode): string {
    const type = node.nomenclature.type?.toLowerCase();
    
    switch (type) {
      case 'application':
        return 'badge-application';
      case 'zone':
        return 'badge-zone';
      case 'structure':
        return 'badge-structure';
      case 'convention_type':
        return 'badge-convention-type';
      case 'invoice_item':
        return 'badge-invoice-item';
      default:
        return 'badge-default';
    }
  }
  
  /**
   * Track by function for ngFor
   */
  trackById(index: number, item: FlatNode): string {
    return item.nomenclature.id;
  }
}
