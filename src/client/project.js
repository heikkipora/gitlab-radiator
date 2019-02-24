import {Info} from './info'
import PropTypes from 'prop-types'
import React from 'react'
import {Stages} from './stages'

export class Project extends React.PureComponent {
  render() {
    const {project, columns, now} = this.props
    const [pipeline] = project.pipelines

    return <li className={`project ${project.status}`} style={this.style(columns)}>
      <h2>{project.name}</h2>
      <Stages stages={pipeline.stages} maxNonFailedJobsVisible={this.props.maxNonFailedJobsVisible}/>
      <Info now={now} pipeline={pipeline}/>
    </li>
  }

  style = (columns) => {
    const widthPercentage = Math.round(90 / columns)
    return {
      width: `${widthPercentage}%`
    }
  }
}

Project.propTypes = {
  project: PropTypes.object,
  columns: PropTypes.number,
  now: PropTypes.number,
  maxNonFailedJobsVisible: PropTypes.number
}
