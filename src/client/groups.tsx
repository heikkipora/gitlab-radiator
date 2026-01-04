import React from 'react'
import {Timestamp} from './timestamp'
import {style, zoomStyle} from './projects'
import type {Pipeline, Project} from '../common/gitlab-types'

export function Groups({groupedProjects, now, zoom, columns}: {groupedProjects: Partial<Record<string, Project[]>>, now: number, zoom: number, columns: number}) {
  return <ol className="groups" style={zoomStyle(zoom)}>
    {Object
      .entries(groupedProjects)
      .sort(([groupName1], [groupName2]) => groupName1.localeCompare(groupName2))
      .map(([groupName, projects]) => <GroupElement columns={columns} groupName={groupName} key={groupName} projects={projects} now={now}/>)
    }
  </ol>
}

function GroupElement({groupName, projects, now, columns}: {groupName: string, projects: Project[] | undefined, now: number, columns: number}) {
  if (!projects) {
    return null
  }

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

