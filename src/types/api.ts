export type DoraLevel = 'elite' | 'high' | 'medium' | 'low' | 'unknown'

export interface DoraMetrics {
  period_days: number
  deployment_frequency: {
    deployments_per_day: number
    deployments_per_week: number
    total_deployments: number
    successful: number
    failed: number
    trend_percent: number | null
    level: DoraLevel
  }
  lead_time: {
    avg_lead_time_hours: number | null
    avg_cycle_time_hours: number | null
    total_prs: number
    prs_with_lead_time: number
    note: string | null
    level: DoraLevel
  }
  change_failure_rate: {
    failure_rate_percent: number
    total_deployments: number
    failed_deployments: number
    successful_deployments: number
    level: DoraLevel
  }
  mean_time_to_recovery: {
    avg_mttr_hours: number | null
    incidents_recovered: number
    level: DoraLevel
  }
  generated_at: string
}

export interface CycleTimeTrendPoint {
  year_week: number
  week_start: string
  pr_count: number
  avg_cycle_hours: number
  avg_lead_time_hours: number | null
  min_cycle_hours: number
  max_cycle_hours: number
  prs_with_lead_time: number
}

export interface CycleTimeSummary {
  total_prs_merged: number
  avg_cycle_hours: number | null
  avg_lead_time_hours: number | null
  avg_time_to_first_review_hours: number | null
  fastest_merge_hours: number | null
  slowest_merge_hours: number | null
  avg_pr_size_lines: number | null
  avg_commits_per_pr: number | null
}

export interface PrSizeBucket {
  size_bucket: 'small' | 'medium' | 'large' | 'xlarge'
  pr_count: number
  avg_cycle_hours: number
  avg_lead_time_hours: number | null
  min_cycle_hours: number
  max_cycle_hours: number
  avg_lines_changed: number
}

export interface AuthorStats {
  author_username: string
  prs_merged: number
  avg_cycle_hours: number | null
  avg_lead_time_hours: number | null
  fastest_pr_hours: number | null
  slowest_pr_hours: number | null
  total_lines_changed: number
  avg_pr_size: number
  avg_commits_per_pr: number
  total_commits: number
}

export interface ReviewerStats {
  reviewer_username: string
  total_reviews: number
  unique_prs_reviewed: number
  approvals: number
  change_requests: number
  comments: number
  avg_review_turnaround_hours: number | null
  fastest_review_hours: number | null
}

export interface CommitStats {
  author_username: string
  total_commits: number
  active_days: number
  commits_per_day: number
  commits_per_week: number
  first_commit_at: string
  last_commit_at: string
}

export interface ContributorData {
  authors: AuthorStats[]
  reviewers: ReviewerStats[]
  commits: CommitStats[]
}

export interface ContributorTrendPoint {
  year_week: number
  week_start: string
  prs_merged: number
  avg_cycle_hours: number | null
  avg_lead_time_hours: number | null
  lines_changed: number
  total_commits: number
}

export interface HeatmapPoint {
  day_of_week: number  // 1=Sunday ... 7=Saturday
  day_name: string
  hour_of_day: number
  review_count: number
  avg_turnaround_hours: number | null
}

export interface DeploymentFrequencyPoint {
  year_week: number
  week_start: string
  total_deployments: number
  successful: number
  failed: number
  failure_rate_percent: number
  avg_build_minutes: number | null
}

export interface BuildDurationPoint {
  year_week: number
  week_start: string
  total_deployments: number
  avg_build_minutes: number
  fastest_build_minutes: number
  slowest_build_minutes: number
  rolling_4week_avg_minutes: number | null
}

export interface BuildDurationSummary {
  total_deployments: number
  avg_build_minutes: number | null
  fastest_build_minutes: number | null
  slowest_build_minutes: number | null
  successful: number
  failed: number
}

export interface RecentDeployment {
  id: number
  environment: string
  status: 'success' | 'failure' | 'pending' | 'in_progress'
  sha: string | null
  deployed_by_username: string | null
  deployed_at: string
  completed_at: string | null
  build_duration_minutes: number | null
  hours_ago: number
}

export interface OpenPr {
  id: number
  number: number
  title: string
  author_username: string
  additions: number
  deletions: number
  changed_files: number
  pr_opened_at: string
  first_review_at: string | null
  waiting_hours: number
  time_to_first_review_hours: number | null
  review_count: number
  last_review_at: string | null
  reviewers: string | null  // comma-separated usernames
  is_stale: boolean
  is_critical: boolean
  needs_review: boolean
}

export interface Repository {
  id: number
  name: string
  full_name: string
  is_private: boolean
  default_branch: string
  webhook_id: number | null
  last_synced_at: string | null
}

export interface Organization {
  id: number
  name: string
  slug: string
  github_org_name: string | null
  owner_id: number
  created_at: string
}

export interface User {
  id: number
  name: string
  email: string
  github_username: string | null
}

export interface Invitation {
  id: number
  org_id: number
  org_name: string
  org_slug: string
  role: 'admin' | 'member'
  token: string
  email: string
  invited_by_name: string
  invited_by_email?: string
  expires_at: string
  created_at: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
}
