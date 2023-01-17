import _ from 'lodash'
import {Groups} from './groups'
import type {Project} from './gitlab-types'
import {Projects} from './projects'
import React from 'react'

export function GroupedProjects({projects, projectsOrder, groupSuccessfulProjects, zoom, columns, now, screen}: {projects: Project[], projectsOrder: string[], groupSuccessfulProjects: boolean, zoom: number, columns: number, now: number, screen: {id: number, total: number}}): JSX.Element {
  if (groupSuccessfulProjects) {
    return renderProjectsGrouped(projects, projectsOrder, zoom, columns, now, screen)
  }
  return renderProjects(projects, projectsOrder, zoom, columns, now, screen)
}

function renderProjectsGrouped(projects: Project[], projectsOrder: string[], zoom: number, columns: number, now: number, screen: {id: number, total: number}) {
  const successfullProjects: Project[] = []
  const otherProjects: Project[] = []
  projects.forEach((project) => {
    if (project.status === 'success') {
      successfullProjects.push(project)
    } else {
      otherProjects.push(project)
    }
  })
  const groupedProjects = _.groupBy(successfullProjects, 'group')
  return <React.Fragment>
    {renderProjects(otherProjects, projectsOrder, zoom, columns, now, screen)}
    {renderGroupedProjects(groupedProjects, zoom, columns, now)}
  </React.Fragment>
}

function renderProjects(projects: Project[], projectsOrder: string[], zoom: number, columns: number, now: number, screen: {id: number, total: number}) {
  return <Projects now={now} zoom={zoom} columns={columns}
                    projects={projects} projectsOrder={projectsOrder}
                    screen={screen}/>
}

function renderGroupedProjects(groupedProjects: {[groupname: string]: Project[]}, zoom: number, columns: number, now: number) {
  return <Groups zoom={zoom} columns={columns} now={now}
                    groupedProjects={groupedProjects} />
}
