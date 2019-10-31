import {Info} from './info'
import PropTypes from 'prop-types'
import React from 'react'
import {Stages} from './stages'

export class Project extends React.PureComponent {
  render() {
    const {project, columns, now} = this.props
    const [pipeline] = project.pipelines

    return <li className={`project ${project.status}`} style={this.style(columns)}>
      <h2>
        {project.url && <a href={`${project.url}/pipelines`} target="_blank" rel="noopener noreferrer">{project.name}</a>}
        {!project.url && project.name}
      </h2>
      <Stages stages={pipeline.stages} maxNonFailedJobsVisible={project.maxNonFailedJobsVisible}/>
      <Info now={now} pipeline={pipeline}/>
    </li>
  }

  style = (columns) => {
    const marginPx = 12
    const widthPercentage = Math.floor(100 / columns)
    return {
      margin: `${marginPx}px`,
      width: `calc(${widthPercentage}% - ${2 * marginPx}px)`
    }
  }
}

Project.propTypes = {
  project: PropTypes.object,
  columns: PropTypes.number,
  now: PropTypes.number,
  maxNonFailedJobsVisible: PropTypes.number
}
