import type {Job, JobStatus} from './gitlab-types'
import _ from 'lodash'
import React from 'react'

const NON_BREAKING_SPACE = '\xa0'

const JOB_STATES_IN_INTEREST_ORDER: JobStatus[] = [
  'failed',
  'running',
  'created',
  'pending',
  'success',
  'skipped'
]

export function Jobs({jobs, maxNonFailedJobsVisible}: {jobs: Job[], maxNonFailedJobsVisible: number}): JSX.Element {
  const [failedJobs, nonFailedJobs] = _.partition(jobs, {status: 'failed'})
  const filteredJobs = sortByOriginalOrder(
    failedJobs.concat(
      _.orderBy(nonFailedJobs, ({status}) => JOB_STATES_IN_INTEREST_ORDER.indexOf(status))
        .slice(0, Math.max(0, maxNonFailedJobsVisible - failedJobs.length))
    ),
    jobs
  )

  const hiddenJobs = jobs.filter(job => filteredJobs.indexOf(job) === -1)
  const hiddenCountsByStatus = _.mapValues(
    _.groupBy(hiddenJobs, 'status'),
    jobsForStatus => jobsForStatus.length
  )

  const hiddenJobsText = _(hiddenCountsByStatus)
    .toPairs()
    .orderBy(([status]) => status)
    .value()
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
  return _.orderBy(filteredJobs, (job: Job) => jobs.indexOf(job))
}
