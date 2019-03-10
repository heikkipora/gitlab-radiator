import _ from 'lodash'
import {Project} from './project'
import PropTypes from 'prop-types'
import React from 'react'

export class Projects extends React.PureComponent {
  render() {
    const {projects, zoom, columns, now, projectsOrder} = this.props

    return <ol className="projects" style={this.zoomStyle(zoom)}>
      {_.sortBy(projects, projectsOrder)
        .map(project => {
          return <Project now={now} columns={columns} project={project} key={project.id}/>
        })
      }
    </ol>
  }

  zoomStyle = (zoom) => {
    const widthPercentage = Math.round(100 / zoom)
    return {
      transform: `scale(${zoom})`,
      width: `${widthPercentage}vmax`
    }
  }
}

Projects.propTypes = {
  projects: PropTypes.array,
  projectsOrder: PropTypes.array,
  zoom: PropTypes.number,
  columns: PropTypes.number,
  now: PropTypes.number
}
