export interface DependencyInfo {
  name: string,
  src?: string,
  description: string,
  missing: Promise<boolean>
}
