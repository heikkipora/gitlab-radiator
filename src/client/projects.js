import _ from 'lodash'
import {Project} from './project'
import PropTypes from 'prop-types'
import React from 'react'

export class Projects extends React.PureComponent {
  render() {
    const {projects, zoomStyle, now, projectsOrder} = this.props

    return <ol className="projects" style={zoomStyle}>
      {_.sortBy(projects, projectsOrder)
        .map(project => {
          return <Project now={now} project={project} key={project.id}/>
        })
      }
    </ol>
  }
}

Projects.propTypes = {
  projects: PropTypes.array,
  projectsOrder: PropTypes.array,
  zoomStyle: PropTypes.object,
  now: PropTypes.number
}
