import type {Pipeline, Project} from './gitlab-types'
import React from 'react'
import {Timestamp} from './renderTimestamp'

export function Groups({groupedProjects, now, zoom, columns}: {groupedProjects: {[groupname: string]: Project[]}, now: number, zoom: number, columns: number}): JSX.Element {
  return <ol className="groups" style={zoomStyle(zoom)}>
    {Object
      .entries(groupedProjects)
      .sort(([groupName1], [groupName2]) => groupName1.localeCompare(groupName2))
      .map(([groupName, projects]) => <GroupElement columns={columns} groupName={groupName} key={groupName} projects={projects} now={now}/>)
    }
  </ol>
}

function GroupElement({groupName, projects, now, columns}: {groupName: string, projects: Project[], now: number, columns: number}) {
  const pipelines: (Pipeline & {project: string})[] = []
  projects.forEach((project) => {
      project.pipelines.forEach((pipeline) => {
        pipelines.push({
          ...pipeline,
          project: project.nameWithoutNamespace
        })
      })
  })

  return <li className={'group'} style={style(columns)}>
    <h2>{groupName}</h2>
    <div className={'group-info'}>{projects.length} Project{projects.length > 1 ? 's' : ''}</div>
    <GroupInfoElement now={now} pipeline={pipelines[0]}/>
  </li>
}

function GroupInfoElement({now, pipeline}: {now: number, pipeline: (Pipeline & {project: string})}) {
  return <div className="pipeline-info">
    <div>
      <span>{pipeline.commit ? pipeline.commit.author : '-'}</span>
      <span>{pipeline.commit ? pipeline.project : '-'}</span>
    </div>
    <div>
      <Timestamp stages={pipeline.stages} now={now}/>
      <span>on {pipeline.ref}</span>
    </div>
  </div>
}

function zoomStyle(zoom: number) {
  const widthPercentage = Math.round(100 / zoom)
  return {
    transform: `scale(${zoom})`,
    width: `${widthPercentage}vmax`
  }
}

function style(columns: number) {
  const widthPercentage = Math.round(90 / columns)
  return {
    width: `${widthPercentage}%`
  }
}
