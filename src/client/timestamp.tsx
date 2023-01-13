import {formatDistance} from 'date-fns'
import React from 'react'
import type {Stage} from './gitlab-types'

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
    const [timestamp] = timestamps.sort((a, b) => a.startedAt - b.startedAt)
    return <span>Started {formatDate(timestamp.startedAt, now)} ago</span>
  }

  const [latestFinishedAt] = finished.sort((a, b) => b - a)
  return <span>Finished {formatDate(latestFinishedAt, now)} ago</span>
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

function formatDate(timestamp: number, now: number) {
  return formatDistance(new Date(timestamp), new Date(now))
}
