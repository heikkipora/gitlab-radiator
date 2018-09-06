import {Info} from './info'
import PropTypes from 'prop-types'
import React from 'react'
import {Stages} from './stages'

export class Project extends React.PureComponent {
  render() {
    const {project, now} = this.props
    const [pipeline] = project.pipelines

    return <li className={`project ${project.status}`}>
      <h2>{project.name}</h2>
      <Stages stages={pipeline.stages}/>
      <Info now={now} pipeline={pipeline}/>
    </li>
  }
}

Project.propTypes = {
  project: PropTypes.object,
  now: PropTypes.dateTime
}
