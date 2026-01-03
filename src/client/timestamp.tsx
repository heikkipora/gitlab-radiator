import moment from 'moment'
import React from 'react'
import type {Stage} from '../common/gitlab-types'

export function Timestamp({stages, now}: {stages: Stage[], now: number}) {
  const timestamps = getTimestamps(stages)
  if (timestamps.length === 0) {
    return <span>Pending...</span>
  }

  const finished = timestamps
    .map(t => t.finishedAt)
    .filter((t): t is number => t !== null)

  const inProgress = timestamps.length > finished.length
  if (inProgress) {
    const [{startedAt}] = timestamps.sort((a, b) => a.startedAt - b.startedAt)
    return <span>Started {moment(startedAt).from(now)}</span>
  }

  const [latestFinishedAt] = finished.sort((a, b) => b - a)
  return <span>Finished {moment(latestFinishedAt).from(now)}</span>
}

function getTimestamps(stages: Stage[]): {startedAt: number, finishedAt: number | null}[] {
  return stages
    .flatMap(s => s.jobs)
    .map(job => ({
      startedAt: parseDate(job.startedAt),
      finishedAt: parseDate(job.finishedAt)
    }))
    .filter((t): t is {startedAt: number, finishedAt: number | null} => t.startedAt !== null)
}

function parseDate(value: string | null) {
  return value ? new Date(value).valueOf() : null
}
