import React from 'react'
import type {Job, JobStatus} from '../common/gitlab-types'

const NON_BREAKING_SPACE = '\xa0'

const JOB_STATES_IN_INTEREST_ORDER: JobStatus[] = [
  'failed',
  'running',
  'created',
  'pending',
  'success',
  'skipped'
]

function interestOrder(a: Job, b: Job) {
  return JOB_STATES_IN_INTEREST_ORDER.indexOf(a.status) - JOB_STATES_IN_INTEREST_ORDER.indexOf(b.status)
}

export function Jobs({jobs, maxNonFailedJobsVisible}: {jobs: Job[], maxNonFailedJobsVisible: number}) {
  const failedJobs = jobs.filter(job => job.status === 'failed')
  const nonFailedJobs = jobs.filter(job => job.status !== 'failed').sort(interestOrder)
  const filteredJobs = sortByOriginalOrder(
    failedJobs.concat(
      nonFailedJobs.slice(0, Math.max(0, maxNonFailedJobsVisible - failedJobs.length))
    ),
    jobs
  )

  const hiddenJobs = jobs.filter(job => filteredJobs.indexOf(job) === -1)
  const hiddenCountsByStatus = Object.fromEntries(
    Object.entries(Object.groupBy(hiddenJobs, job => job.status))
      .map(([status, jobsForStatus]) => [status, jobsForStatus!.length])
  )

  const hiddenJobsText = Object.entries(hiddenCountsByStatus)
    .sort(([statusA], [statusB]) => statusA.localeCompare(statusB))
    .map(([status, count]: [string, number]) => `${count}${NON_BREAKING_SPACE}${status}`)
    .join(', ')

  return <ol className="jobs">
    {filteredJobs.map((job: Job) => <JobElement job={job} key={job.id}/>)}
    {
      hiddenJobs.length > 0 ? <li className="hidden-jobs">+&nbsp;{hiddenJobsText}</li> : null
    }
  </ol>
}

function JobElement({job}: {job: Job}) {
  return <li className={job.status}>
    <a href={job.url} target="_blank" rel="noopener noreferrer">{job.name}</a>
    {!job.url && job.name}
  </li>
}

function sortByOriginalOrder(filteredJobs: Job[], jobs: Job[]) {
  return [...filteredJobs].sort((a, b) => jobs.indexOf(a) - jobs.indexOf(b))
}
