import 'core-js/stable'
import 'regenerator-runtime/runtime'

import type {GlobalState, Project} from './gitlab-types'
import {argumentsFromDocumentUrl} from './arguments'
import {createRoot} from 'react-dom/client'
import {GroupedProjects} from './groupedProjects'
import React from 'react'

class RadiatorApp extends React.Component<unknown, GlobalState> {
  public args: {override: {columns?: number, zoom?: number}, includedTags: string[] | null, screen: {id: number, total: number}}

  constructor(props: unknown) {
    super(props)
    this.state = {
      columns: 1,
      error: null,
      groupSuccessfulProjects: false,
      projects: null,
      projectsOrder: [],
      now: 0,
      zoom: 1
    }

    this.args = argumentsFromDocumentUrl()
  }

  componentDidMount = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const socket = (window as any).io()
    socket.on('state', this.onServerStateUpdated.bind(this))
    socket.on('disconnect', this.onDisconnect.bind(this))
  }

  render = () => {
    const {screen} = this.args
    const {now, zoom, columns, projects, projectsOrder, groupSuccessfulProjects} = this.state
    return <div>
      {this.renderErrorMessage()}
      {this.renderProgressMessage()}

      {projects &&
        <GroupedProjects now={now} zoom={zoom} columns={columns}
                        projects={projects} projectsOrder={projectsOrder}
                        groupSuccessfulProjects={groupSuccessfulProjects}
                        screen={screen}/>
      }
    </div>
  }

  renderErrorMessage = () =>
    this.state.error && <div className="error">{this.state.error}</div>

  renderProgressMessage = () => {
    if (!this.state.projects) {
      return <h2 className="loading">Fetching projects and CI pipelines from GitLab...</h2>
    } else if (this.state.projects.length === 0) {
      return <h2 className="loading">No projects with CI pipelines found.</h2>
    }
    return null
  }

  onServerStateUpdated = (state: GlobalState) => {
    this.setState({
      ...state,
      ...this.args.override,
      projects: this.filterProjectsByTags(state.projects)
    })
  }

  onDisconnect = () => this.setState({error: 'gitlab-radiator server is offline'})

  filterProjectsByTags = (projects: Project[] | null) => {
    if (projects === null) {
      return null
    }

    // No tag list specified, include all projects
    if (!this.args.includedTags) {
      return projects
    }
    // Empty tag list specified, include projects without tags
    if (this.args.includedTags.length === 0) {
      return projects.filter(project =>
        project.tags.length === 0
      )
    }
    // Tag list specified, include projects which have at least one of them
    return projects.filter(project =>
      project.tags.some(tag => this.args.includedTags?.includes(tag))
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById('app')!)
root.render(<RadiatorApp/>);

module.hot?.accept()
