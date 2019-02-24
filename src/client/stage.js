import {Jobs} from './jobs'
import PropTypes from 'prop-types'
import React from 'react'

export class Stage extends React.PureComponent {
  render() {
    const {stage} = this.props

    return <li className="stage">
      <div className="name">{stage.name}</div>
      <Jobs jobs={stage.jobs} maxNonFailedJobsVisible={this.props.maxNonFailedJobsVisible}/>
    </li>
  }
}

Stage.propTypes = {
  stage: PropTypes.object,
  maxNonFailedJobsVisible: PropTypes.number
}
