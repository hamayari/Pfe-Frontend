import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Task {
  id?: string;
  name: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  assignee?: string;
  assigneeId?: string;
  projectId?: string;
  conventionId?: string;
  priority?: 'low' | 'medium' | 'high';
  dependencies?: string[];
  color?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: string;
  updatedBy?: string;
}

export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  delayedTasks: number;
  completionRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8085/api/tasks';

  constructor(private http: HttpClient) { }

  /**
   * Créer une nouvelle tâche
   */
  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  /**
   * Récupérer toutes les tâches
   */
  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  /**
   * Récupérer une tâche par ID
   */
  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer les tâches d'un utilisateur
   */
  getTasksByAssignee(assigneeId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/assignee/${assigneeId}`);
  }

  /**
   * Récupérer les tâches d'un projet
   */
  getTasksByProject(projectId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/project/${projectId}`);
  }

  /**
   * Récupérer les tâches d'une convention
   */
  getTasksByConvention(conventionId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/convention/${conventionId}`);
  }

  /**
   * Récupérer les tâches par statut
   */
  getTasksByStatus(status: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/status/${status}`);
  }

  /**
   * Récupérer les tâches en retard
   */
  getDelayedTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/delayed`);
  }

  /**
   * Récupérer les tâches actives
   */
  getActiveTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/active`);
  }

  /**
   * Mettre à jour une tâche
   */
  updateTask(id: string, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  /**
   * Mettre à jour la progression d'une tâche
   */
  updateTaskProgress(id: string, progress: number): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/progress`, { progress });
  }

  /**
   * Supprimer une tâche
   */
  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtenir les statistiques globales
   */
  getTaskStatistics(): Observable<TaskStatistics> {
    return this.http.get<TaskStatistics>(`${this.apiUrl}/statistics`);
  }

  /**
   * Obtenir les statistiques d'un utilisateur
   */
  getUserTaskStatistics(assigneeId: string): Observable<TaskStatistics> {
    return this.http.get<TaskStatistics>(`${this.apiUrl}/statistics/user/${assigneeId}`);
  }

  /**
   * Convertir une tâche backend en tâche Gantt
   */
  convertToGanttTask(task: Task): any {
    return {
      id: task.id,
      name: task.name,
      startDate: new Date(task.startDate),
      endDate: new Date(task.endDate),
      progress: task.progress,
      status: task.status,
      assignee: task.assignee,
      dependencies: task.dependencies,
      color: task.color
    };
  }

  /**
   * Convertir plusieurs tâches en tâches Gantt
   */
  convertToGanttTasks(tasks: Task[]): any[] {
    return tasks.map(task => this.convertToGanttTask(task));
  }
}
