import _ from 'lodash'
import {Info} from './info'
import type {Project} from './gitlab-types'
import React from 'react'
import {Stages} from './stages'

export function Projects({columns, now, projects, projectsOrder, screen, zoom}: {columns: number, now: number, projects: Project[], projectsOrder: string[], screen: {id: number, total: number}, zoom: number}): JSX.Element {
  return <ol className="projects" style={zoomStyle(zoom)}>
    {_.sortBy(projects, projectsOrder)
      .filter(forScreen(screen, projects.length))
      .map(project => <ProjectElement now={now} columns={columns} project={project} key={project.id}/>)
    }
  </ol>
}

function ProjectElement({columns, now, project}: {columns: number, now: number, project: Project}) {
  const [pipeline] = project.pipelines

  return <li className={`project ${project.status}`} style={style(columns)}>
    <h2>
      {project.url && <a href={`${project.url}/pipelines`} target="_blank" rel="noopener noreferrer">{project.name}</a>}
      {!project.url && project.name}
    </h2>
    <Stages stages={pipeline.stages} maxNonFailedJobsVisible={project.maxNonFailedJobsVisible}/>
    <Info now={now} pipeline={pipeline}/>
  </li>
}

function forScreen(screen: {id: number, total: number}, projectsCount: number) {
  const perScreen = Math.ceil(projectsCount / screen.total)
  const first = perScreen * (screen.id - 1)
  const last = perScreen * screen.id
  return (_project: Project, projectIndex: number) => projectIndex >= first && projectIndex < last
}

function zoomStyle(zoom: number) {
  const widthPercentage = Math.round(100 / zoom)
  return {
    transform: `scale(${zoom})`,
    width: `${widthPercentage}vmax`
  }
}

function style(columns: number) {
  const marginPx = 12
  const widthPercentage = Math.floor(100 / columns)
  return {
    margin: `${marginPx}px`,
    width: `calc(${widthPercentage}% - ${2 * marginPx}px)`
  }
}
