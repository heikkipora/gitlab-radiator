import 'core-js/stable'
import 'regenerator-runtime/runtime'

import {argumentsFromDocumentUrl} from './arguments'
import {createRoot} from 'react-dom/client'
import {GroupedProjects} from './groupedProjects'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {io, Socket} from 'socket.io-client'
import type {GlobalState, Project} from '../common/gitlab-types'

function RadiatorApp() {
  const args = useMemo(() => argumentsFromDocumentUrl(), [])
  const [state, setState] = useState<GlobalState>({
    columns: 1,
    error: null,
    groupSuccessfulProjects: false,
    horizontal: false,
    projects: null,
    projectsOrder: [],
    now: 0,
    zoom: 1
  })
  const {now, zoom, columns, projects, projectsOrder, groupSuccessfulProjects, horizontal} = state
  const projectsByTags = filterProjectsByTopics(projects, args.includedTopics)

  const onServerStateUpdated = useCallback((serverState: GlobalState) => {
    setState(() => ({
      ...serverState,
      ...args.override
    }))
  }, [args.override])

  const onDisconnect = useCallback(() => setState(prev => ({...prev, error: 'gitlab-radiator server is offline'})), [])

  useEffect(() => {
    const socket: Socket = io()
    socket.on('state', onServerStateUpdated)
    socket.on('disconnect', onDisconnect)
    return () => {
      socket.off('state', onServerStateUpdated)
      socket.off('disconnect', onDisconnect)
      socket.close()
    }
  }, [onServerStateUpdated, onDisconnect])

  return <div className={horizontal ? 'horizontal' : ''}>
    {state.error && <div className="error">{state.error}</div>}
    {!state.projects && <h2 className="loading">Fetching projects and CI pipelines from GitLab...</h2>}
    {state.projects?.length === 0 && <h2 className="loading">No projects with CI pipelines found.</h2>}

    {projectsByTags &&
      <GroupedProjects now={now} zoom={zoom} columns={columns}
                      projects={projectsByTags} projectsOrder={projectsOrder}
                      groupSuccessfulProjects={groupSuccessfulProjects}
                      screen={args.screen}/>
    }
  </div>
}

function filterProjectsByTopics(projects: Project[] | null, includedTopics: string[] | null) {
  if (projects === null) {
    return null
  }
  if (!includedTopics) {
    return projects
  }
  if (includedTopics.length === 0) {
    return projects.filter(p => p.topics.length === 0)
  }
  return projects.filter(project => project.topics.some(tag => includedTopics?.includes(tag)))
}

 
const root = createRoot(document.getElementById('app')!)
root.render(<RadiatorApp/>)

module.hot?.accept()
