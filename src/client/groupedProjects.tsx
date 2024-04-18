import {Groups} from './groups'
import groupBy from 'lodash/groupBy'
import {Projects} from './projects'
import React from 'react'
import type {Project} from './gitlab-types'

export function GroupedProjects({projects, projectsOrder, groupSuccessfulProjects, zoom, columns, now, horizontal, screen}: {projects: Project[], projectsOrder: string[], groupSuccessfulProjects: boolean, zoom: number, columns: number, now: number, horizontal: boolean, screen: {id: number, total: number}}): JSX.Element {
  if (groupSuccessfulProjects) {
    return renderProjectsGrouped(projects, projectsOrder, zoom, columns, now, horizontal, screen)
  }
  return <Projects now={now} zoom={zoom} columns={columns} horizontal={horizontal} projects={projects} projectsOrder={projectsOrder} screen={screen}/>
}

function renderProjectsGrouped(projects: Project[], projectsOrder: string[], zoom: number, columns: number, now: number, horizontal: boolean, screen: {id: number, total: number}) {
  const successfullProjects = projects.filter(({status}) => status === 'success')
  const otherProjects= projects.filter(({status}) => status !== 'success')
  const groupedProjects = groupBy(successfullProjects, 'group')

  return <React.Fragment>
    <Projects now={now} zoom={zoom} columns={columns} horizontal={horizontal} projects={otherProjects} projectsOrder={projectsOrder} screen={screen}/>
    <Groups now={now} zoom={zoom} columns={columns} groupedProjects={groupedProjects}/>
  </React.Fragment>
}
