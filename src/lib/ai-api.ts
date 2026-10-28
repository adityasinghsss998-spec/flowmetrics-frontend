/**
 * ai-api.ts
 *
 * Thin wrappers for the four AI-service endpoints proxied through the API gateway.
 * Every call uses the shared `api` axios instance, which handles:
 *   - Authorization: Bearer <token>  (from localStorage)
 *   - x-github-token header
 *   - 401 token refresh + session-expired redirect
 *
 * Do NOT import from this file on the server -- it relies on localStorage.
 */

import api from '@/lib/axios'
import type {
  AiChatStartResponse,
  AiRunResponse,
  AiHitlPendingResponse,
  AiHitlApproveResponse,
} from '@/types/api'

/** Start a question. Returns HTTP 202 with a runId immediately. */
export async function startAiChat(payload: {
  repoId: number
  orgId: number
  question: string
}): Promise<AiChatStartResponse> {
  const { data } = await api.post<AiChatStartResponse>('/ai/chat', payload)
  return data
}

/** Poll the status of a running question. */
export async function pollAiRun(runId: string): Promise<AiRunResponse> {
  const { data } = await api.get<AiRunResponse>(`/ai/runs/${runId}`)
  return data
}

/** Fetch pending HITL requests for a repository. */
export async function fetchHitlPending(repoId: number): Promise<AiHitlPendingResponse> {
  const { data } = await api.get<AiHitlPendingResponse>(`/ai/hitl/pending?repoId=${repoId}`)
  return data
}

/** Approve or reject a HITL request. */
export async function submitHitlDecision(payload: {
  runId: string
  approved: boolean
  reason: string
}): Promise<AiHitlApproveResponse> {
  const { data } = await api.post<AiHitlApproveResponse>('/ai/hitl/approve', payload)
  return data
}

