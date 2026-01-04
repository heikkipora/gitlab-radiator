import {Groups} from './groups'
import {Projects} from './projects'
import React from 'react'
import type {Project, ProjectsOrder} from '../common/gitlab-types'

export function GroupedProjects({projects, projectsOrder, groupSuccessfulProjects, zoom, columns, now, screen}: {projects: Project[], projectsOrder: ProjectsOrder[], groupSuccessfulProjects: boolean, zoom: number, columns: number, now: number, screen: {id: number, total: number}}) {
  if (groupSuccessfulProjects) {
    const successfullProjects = projects.filter(p => p.status === 'success')
    const otherProjects= projects.filter(p => p.status !== 'success')
    const groupedProjects = Object.groupBy(successfullProjects, p => p.group)

    return <React.Fragment>
      <Projects now={now} zoom={zoom} columns={columns} projects={otherProjects} projectsOrder={projectsOrder} screen={screen}/>
      <Groups now={now} zoom={zoom} columns={columns} groupedProjects={groupedProjects}/>
    </React.Fragment>
  }
  return <Projects now={now} zoom={zoom} columns={columns} projects={projects} projectsOrder={projectsOrder} screen={screen}/>
}
