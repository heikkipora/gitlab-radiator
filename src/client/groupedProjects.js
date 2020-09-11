import {Groups} from './groups'
import {Projects} from './projects'
import PropTypes from 'prop-types'
import React from 'react'

export class GroupedProjects extends React.PureComponent {
  render() {
    const {projects, groupSuccessfulProjects} = this.props

    if (groupSuccessfulProjects) {
      return this.renderProjectsGrouped(projects)
    }
    return this.renderProjects(projects)
  }

  renderProjects(projects) {
    const {zoom, columns, now, projectsOrder, screen} = this.props
    return <Projects now={now} zoom={zoom} columns={columns}
                     projects={projects || []} projectsOrder={projectsOrder}
                     screen={screen}/>
  }

  renderGroupedProjects(groupedProjects) {
    const {zoom, columns, now} = this.props
    return <Groups zoom={zoom} columns={columns} now={now}
                     groupedProjects={groupedProjects || []} />
  }

  groupBy(items, key) {
    return items.reduce(
      (result, item) => ({
        ...result,
        [item[key]]: [
          ...result[item[key]] || [],
          item
        ]
      }), {})
  }

  renderProjectsGrouped(projects) {
    const successfullProjects = []
    const otherProjects = []
    projects.forEach((project) => {
      if (project.status === 'success') {
        successfullProjects.push(project)
      } else {
        otherProjects.push(project)
      }
    })
    const groupedProjects = this.groupBy(successfullProjects, 'group')
    return <React.Fragment>
      {this.renderProjects(otherProjects)}
      {this.renderGroupedProjects(groupedProjects)}
    </React.Fragment>
  }
}

GroupedProjects.propTypes = {
  projects: PropTypes.array,
  projectsOrder: PropTypes.array,
  zoom: PropTypes.number,
  columns: PropTypes.number,
  now: PropTypes.number,
  groupSuccessfulProjects: PropTypes.bool,
  screen: PropTypes.shape({
    id: PropTypes.number,
    total: PropTypes.number
  }).isRequired
}
