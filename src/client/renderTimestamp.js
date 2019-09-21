import _ from "lodash"
import {formatDistance} from "date-fns"

export default function renderTimestamp(stages, now) {
  const timestamps = getTimestamps(stages)

  if (timestamps.length === 0) {
    return 'Pending...'
  }

  const inProgress = _.some(timestamps, {finishedAt: undefined})
  if (inProgress) {
    const timestamp = _(timestamps).sortBy('startedAt').head()
    return renderDistance('Started', timestamp.startedAt, now)
  }

  const timestamp = _(timestamps).sortBy('finishedAt').last()
  return renderDistance('Finished', timestamp.finishedAt, now)
}

function getTimestamps(stages) {
  return _(stages)
    .map('jobs')
    .flatten()
    .map(job => {
      const startedAt = job.startedAt && new Date(job.startedAt).valueOf()
      const finishedAt = job.finishedAt && new Date(job.finishedAt).valueOf()
      return {
        startedAt,
        finishedAt
      }
    })
    .filter(timestamp => timestamp.startedAt)
    .value()
}

function renderDistance(predicate, timestamp, now) {
  const distance = formatDate(timestamp, now)
  return `${predicate} ${distance} ago`
}

function formatDate(timestamp, now) {
  return formatDistance(new Date(timestamp), new Date(now))
}
