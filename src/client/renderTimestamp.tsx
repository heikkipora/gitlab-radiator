import {formatDistance} from 'date-fns'
import type {Stage} from './gitlab-types'

export function renderTimestamp(stages: Stage[], now: number): string {
  const timestamps = getTimestamps(stages)

  if (timestamps.length === 0) {
    return 'Pending...'
  }

  const finished = timestamps
    .map(t => t.finishedAt)
    .filter((t): t is number => t !== null)
  const inProgress = timestamps.length > finished.length
  if (inProgress) {
    const [timestamp] = timestamps.sort((a, b) => a.startedAt - b.startedAt)
    return renderDistance('Started', timestamp.startedAt, now)
  }

  const [latestFinishedAt] = finished.sort((a, b) => b - a)
  return renderDistance('Finished', latestFinishedAt, now)
}

function getTimestamps(stages: Stage[]): {startedAt: number, finishedAt: number | null}[] {
  return stages
    .flatMap(s => s.jobs)
    .map(job => {
      const startedAt = job.startedAt ? new Date(job.startedAt).valueOf() : null
      const finishedAt = job.finishedAt ? new Date(job.finishedAt).valueOf() : null
      return {
        startedAt,
        finishedAt
      }
    })
    .filter((t): t is {startedAt: number, finishedAt: number | null} => t.startedAt !== null)
}

function renderDistance(predicate: string, timestamp: number, now: number) {
  const distance = formatDate(timestamp, now)
  return `${predicate} ${distance} ago`
}

function formatDate(timestamp: number, now: number) {
  return formatDistance(new Date(timestamp), new Date(now))
}
