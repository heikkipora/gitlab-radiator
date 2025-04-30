import groupBy from 'lodash/groupBy'
import mapValues from 'lodash/mapValues'
import orderBy from 'lodash/orderBy'
import partition from 'lodash/partition'
import React from 'react'
import toPairs from 'lodash/toPairs'
import type {Job, JobStatus} from './gitlab-types'

const NON_BREAKING_SPACE = '\xa0'

const JOB_STATES_IN_INTEREST_ORDER: JobStatus[] = [
  'failed',
  'running',
  'created',
  'pending',
  'success',
  'skipped'
]

export function Jobs({jobs, maxNonFailedJobsVisible}: {jobs: Job[], maxNonFailedJobsVisible: number}) {
  const [failedJobs, nonFailedJobs] = partition(jobs, {status: 'failed'})
  const filteredJobs = sortByOriginalOrder(
    failedJobs.concat(
      orderBy(nonFailedJobs, ({status}) => JOB_STATES_IN_INTEREST_ORDER.indexOf(status))
        .slice(0, Math.max(0, maxNonFailedJobsVisible - failedJobs.length))
    ),
    jobs
  )

  const hiddenJobs = jobs.filter(job => filteredJobs.indexOf(job) === -1)
  const hiddenCountsByStatus = mapValues(
    groupBy(hiddenJobs, 'status'),
    jobsForStatus => jobsForStatus.length
  )

  const hiddenJobsText = orderBy(toPairs(hiddenCountsByStatus), ([status]) => status)
    .map(([status, count]) => `${count}${NON_BREAKING_SPACE}${status}`)
    .join(', ')

  return <ol className="jobs">
    {filteredJobs.map(job => <JobElement job={job} key={job.id}/>)}
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
  return orderBy(filteredJobs, (job: Job) => jobs.indexOf(job))
}
