import PropTypes from 'prop-types'
import React from 'react'

export class Job extends React.PureComponent {
  render() {
    const {job} = this.props

    return <li className={job.status}>
      {job.url && <a href={job.url} target="_blank" rel="noopener noreferrer">{job.name}</a>}
      {!job.url && job.name}
    </li>
  }
}

Job.propTypes = {
  job: PropTypes.object
}
