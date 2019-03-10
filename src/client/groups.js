import {Group} from './group'
import PropTypes from 'prop-types'
import React from 'react'

export class Groups extends React.PureComponent {
  render() {
    const {groupedProjects, now, zoom, columns} = this.props

    return <ol className="groups" style={this.zoomStyle(zoom)}>
      {Object.entries(groupedProjects)
        .sort(([groupName1], [groupName2]) => {
          return groupName1.localeCompare(groupName2)
        })
        .map(([groupName, projects]) => {
          return <Group columns={columns} groupName={groupName} key={groupName} projects={projects} now={now}/>
        })}
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

Groups.propTypes = {
  groupedProjects: PropTypes.object,
  now: PropTypes.number,
  zoom: PropTypes.number,
  columns: PropTypes.number
}
