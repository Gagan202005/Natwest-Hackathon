/**
 * Semantic layer management — mirrors Python backend/app/core/semantic_layer.py.
 */
import { MetricDefinition } from '../types';

export class SemanticLayerManager {
  private metrics: MetricDefinition[] = [];

  getMetrics(): MetricDefinition[] {
    return this.metrics;
  }

  setMetrics(metrics: MetricDefinition[]): void {
    this.metrics = metrics;
  }

  addMetric(name: string, expression: string, description: string = ''): void {
    this.metrics = this.metrics.filter((m) => m.name !== name);
    this.metrics.push({ name, expression, description });
  }

  removeMetric(name: string): void {
    this.metrics = this.metrics.filter((m) => m.name !== name);
  }

  toJson(): string {
    if (this.metrics.length === 0) return 'No custom metrics defined.';
    return JSON.stringify(this.metrics, null, 2);
  }

  toDictList(): MetricDefinition[] {
    return this.metrics;
  }
}
