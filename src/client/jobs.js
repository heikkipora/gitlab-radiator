import _ from 'lodash'
import {Job} from './job'
import PropTypes from 'prop-types'
import React from 'react'

const NON_BREAKING_SPACE = '\xa0'

const JOB_STATES_IN_INTEREST_ORDER = [
  'failed',
  'running',
  'created',
  'pending',
  'success',
  'skipped'
]

export class Jobs extends React.PureComponent {
  render() {
    const {jobs, maxNonFailedJobsVisible} = this.props
    function sortByOriginalOrder(jobArray) {
      return _.orderBy(jobArray, job => jobs.indexOf(job))
    }

    const [failedJobs, nonFailedJobs] = _.partition(jobs, {status: 'failed'})
    const filteredJobs = sortByOriginalOrder(
      failedJobs.concat(
        _.orderBy(nonFailedJobs, ({status}) => JOB_STATES_IN_INTEREST_ORDER.indexOf(status))
          .slice(0, Math.max(0, maxNonFailedJobsVisible - failedJobs.length))
      )
    )

    const hiddenJobs = jobs.filter(job => !filteredJobs.includes(job))
    const hiddenCountsByStatus = _.mapValues(
      _.groupBy(hiddenJobs, 'status'),
      jobsForStatus => jobsForStatus.length
      )
    const hiddenJobsText =
      _(hiddenCountsByStatus).toPairs()
      .orderBy(([status]) => status)
      .value()
      .map(([status, count]) => `${count}${NON_BREAKING_SPACE}${status}`)
      .join(', ')

    return <ol className="jobs">
      {filteredJobs.map((job, index) => {
        return <Job job={job} key={index}/>
      })}
      {
        hiddenJobs.length > 0 ? <li className="hidden-jobs">+&nbsp;{hiddenJobsText}</li> : null
      }
    </ol>
  }
}

Jobs.propTypes = {
  jobs: PropTypes.array,
  maxNonFailedJobsVisible: PropTypes.number
}
