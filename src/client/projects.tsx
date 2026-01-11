import {Info} from './info'
import React, {useState, useEffect} from 'react'
import {Stages} from './stages'
import type {Project, ProjectsOrder} from '../common/gitlab-types'

export function Projects({columns, now, projects, projectsOrder, screen, zoom, rotateRunningPipelines}: {columns: number, now: number, projects: Project[], projectsOrder: ProjectsOrder[], screen: {id: number, total: number}, zoom: number, rotateRunningPipelines: number}) {
  return <ol className="projects" style={zoomStyle(zoom)}>
    {sortByMultipleKeys(projects, projectsOrder)
      .filter(forScreen(screen, projects.length))
      .map(project => <ProjectElement now={now} columns={columns} rotateRunningPipelines={rotateRunningPipelines} project={project} key={project.id}/>)
    }
  </ol>
}

function sortByMultipleKeys(projects: Project[], keys: ProjectsOrder[]): Project[] {
  return [...projects].sort((a, b) => {
    for (const key of keys) {
      const result = key === 'id'
        ? a[key] - b[key]
        : a[key].localeCompare(b[key])

      if (result !== 0) {
        return result
      }
    }
    return 0
  })
}

function ProjectElement({columns, now, project, rotateRunningPipelines}: {columns: number, now: number, rotateRunningPipelines: number, project: Project}) {
  const [counter, setCounter] = useState<number>(0)
  const runningCount = project.pipelines.filter(p => p.status === 'running').length
  const isRotating = rotateRunningPipelines > 0 && runningCount > 1

  useEffect(() => {
    if (!isRotating) {
      return
    }

    const timer = setInterval(() => setCounter(previous => previous + 1), rotateRunningPipelines)
    return () => clearInterval(timer)
  }, [isRotating, rotateRunningPipelines, setCounter])

  const pipelineIndex = isRotating ? (counter % runningCount) : 0
  const indexLabel = isRotating ? `${pipelineIndex + 1}/${runningCount} `: ''
  const pipeline = project.pipelines[pipelineIndex]

  const h2Class = project.commitAsTitle ? 'commit_title' : ''

  return <li className={`project ${project.status}`} style={style(columns)}>
    <h2 className={`${h2Class}`}>
      {project.url && <a href={`${project.url}/pipelines`} target="_blank" rel="noopener noreferrer">{indexLabel}{project.commitAsTitle ? (pipeline.commit ? pipeline.commit.title : '-') : project.name}</a>}
      {!project.url && project.name}
    </h2>
    <Stages stages={pipeline.stages} maxNonFailedJobsVisible={project.maxNonFailedJobsVisible}/>
    <Info now={now} pipeline={pipeline} commitAsTitle={project.commitAsTitle}/>
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
