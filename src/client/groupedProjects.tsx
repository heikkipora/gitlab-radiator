import _ from 'lodash'
import {Groups} from './groups'
import type {Project} from './gitlab-types'
import {Projects} from './projects'
import React from 'react'

export function GroupedProjects({projects, projectsOrder, groupSuccessfulProjects, zoom, columns, now, screen}: {projects: Project[], projectsOrder: string[], groupSuccessfulProjects: boolean, zoom: number, columns: number, now: number, screen: {id: number, total: number}}): JSX.Element {
  if (groupSuccessfulProjects) {
    return renderProjectsGrouped(projects, projectsOrder, zoom, columns, now, screen)
  }
  return <Projects now={now} zoom={zoom} columns={columns} projects={projects} projectsOrder={projectsOrder} screen={screen}/>
}

function renderProjectsGrouped(projects: Project[], projectsOrder: string[], zoom: number, columns: number, now: number, screen: {id: number, total: number}) {
  const successfullProjects = projects.filter(({status}) => status === 'success')
  const otherProjects= projects.filter(({status}) => status !== 'success')
  const groupedProjects = _.groupBy(successfullProjects, 'group')

  return <React.Fragment>
    <Projects now={now} zoom={zoom} columns={columns} projects={otherProjects} projectsOrder={projectsOrder} screen={screen}/>
    <Groups now={now} zoom={zoom} columns={columns} groupedProjects={groupedProjects}/>
  </React.Fragment>
}
