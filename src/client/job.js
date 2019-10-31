import PropTypes from 'prop-types'
import React from 'react'

export class Job extends React.PureComponent {
  render() {
    const {job} = this.props

    return <li className={job.status}>
      <a href={job.url} target="_blank" rel="noopener noreferrer">{job.name}</a>
    </li>
  }
}

Job.propTypes = {
  job: PropTypes.object
}
