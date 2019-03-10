import {GroupInfo} from './groupInfo'
import PropTypes from 'prop-types'
import React from 'react'

export class Group extends React.PureComponent {
  render() {
    const {groupName, projects, now, columns} = this.props
    const pipelines = []
    projects.forEach((project) => {
        project.pipelines.forEach((pipeline) => {
          pipelines.push({
            ...pipeline,
            project: project.nameWithoutNamespace
          })
        })
    })

    return <li className={'group'} style={this.style(columns)}>
      <h2>{groupName}</h2>
      <div className={'group-info'}>{projects.length} Project{projects.length > 1 ? 's' : ''}</div>
      <GroupInfo now={now} pipeline={pipelines[0]}/>
    </li>
  }

  style = (columns) => {
    const widthPercentage = Math.round(90 / columns)
    return {
      width: `${widthPercentage}%`
    }
  }
}

Group.propTypes = {
  groupName: PropTypes.string,
  projects: PropTypes.array,
  now: PropTypes.number,
  columns: PropTypes.number
}
