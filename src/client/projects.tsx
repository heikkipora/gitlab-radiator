import {Info} from './info'
import React from 'react'
import sortBy from 'lodash/sortBy'
import {Stages} from './stages'
import type {Project} from './gitlab-types'

let runningPipelineIndex: number[] = []

export function Projects({columns, now, projects, projectsOrder, screen, zoom}: {columns: number, now: number, projects: Project[], projectsOrder: string[], screen: {id: number, total: number}, zoom: number}): JSX.Element {
  return <ol className="projects" style={zoomStyle(zoom)}>
    {sortBy(projects, projectsOrder)
      .filter(forScreen(screen, projects.length))
      .map(project => <ProjectElement now={now} columns={columns} project={project} key={project.id}/>)
    }
  </ol>
}

function ProjectElement({columns, now, project}: {columns: number, now: number, project: Project}) {
  let [pipeline] = project.pipelines

  let txt = ''

  if (project.rotateRunningPipelines) {
    const running = project.pipelines.filter(runningPipeline => runningPipeline.running)

    if (running.length > 1) {
      if (runningPipelineIndex[project.id] === undefined) {
        runningPipelineIndex[project.id] = 0
      }

      runningPipelineIndex[project.id] = ++runningPipelineIndex[project.id] % running.length
      pipeline = running[runningPipelineIndex[project.id]]
      txt = (runningPipelineIndex[project.id] + 1) + '/' + running.length + ' '
    }
  }

  return <li className={`project ${project.status}`} style={style(columns)}>
    <h2>
      {project.url && <a href={`${project.url}/pipelines`} target="_blank" rel="noopener noreferrer">{txt} {project.name}</a>}
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

export function zoomStyle(zoom: number) {
  const widthPercentage = Math.round(100 / zoom)
  return {
    transform: `scale(${zoom})`,
    width: `${widthPercentage}vmax`
  }
}

export function style(columns: number) {
  const marginPx = 12
  const widthPercentage = Math.floor(100 / columns)
  return {
    margin: `${marginPx}px`,
    width: `calc(${widthPercentage}% - ${2 * marginPx}px)`
  }
}
