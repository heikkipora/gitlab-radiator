import {GroupedProjects} from './groupedProjects'
import React from 'react'
import ReactDOM from 'react-dom'

class RadiatorApp extends React.Component {
  constructor() {
    super()
    this.state = {
      projects: [],
      error: undefined,
      now: undefined
    }
    const args = this.parseQueryString()
    this.screen = this.screenArguments(args)
    this.override = this.overrideArguments(args)
    this.includedTags = this.tagArguments(args)
  }

  componentDidMount = () => {
    const socket = window.io()
    socket.on('state', this.onServerStateUpdated.bind(this))
    socket.on('disconnect', this.onDisconnect.bind(this))
  }

  render = () =>
    <div>
      {this.renderErrorMessage()}
      {this.renderProgressMessage()}

      <GroupedProjects now={this.state.now} zoom={this.state.zoom} columns={this.state.columns}
                       projects={this.state.projects} projectsOrder={this.state.projectsOrder}
                       groupSuccessfulProjects={this.state.groupSuccessfulProjects}
                       screen={this.screen}/>
    </div>

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

  onServerStateUpdated = state => {
    const projects = this.filterProjectsByTags(state.projects)
    this.setState({
      ...state,
      ...this.override,
      projects
    })
  }

  onDisconnect = () => this.setState({error: 'gitlab-radiator server is offline'})

  filterProjectsByTags = projects => {
    // No tag lisst specified, include all projects
    if (!this.includedTags) {
      return projects
    }
    // Empty tag list specified, include projects without tags
    if (this.includedTags.length === 0) {
      return projects.filter(project =>
        project.tags.length === 0
      )
    }
    // Tag list specigied, include projectes which have at least one of them
    return projects.filter(project =>
      project.tags.some(tag => this.includedTags.includes(tag))
    )
  }

  tagArguments = args => {
    if (args.tags === undefined) {
      return null
    }
    return (args.tags || '')
      .split(',')
      .map(t => t.toLowerCase().trim())
      .filter(t => t)
  }

  overrideArguments = args => {
    const columns = args.columns ? {columns: Number(args.columns)} : {}
    const zoom = args.zoom ? {zoom: Number(args.zoom)} : {}
    return {
      ...columns,
      ...zoom
    }
  }

  screenArguments = args => {
    const matches = (/(\d)of(\d)/).exec(args.screen || '')
    let id = matches ? Number(matches[1]) : 1
    const total = matches ? Number(matches[2]) : 1
    if (id > total) {
      id = total
    }
    return {
      id,
      total
    }
  }

  parseQueryString = () => {
    return document.location.search
      .slice(1)
      .split('&')
      .filter(p => p)
      .reduce((acc, parameter) => {
        const [key, value] = parameter.split('=')
        return {
          ...acc,
          [key]: decodeURIComponent(value)
        }
      }, {})
  }
}

ReactDOM.render(<RadiatorApp/>, document.getElementById('app'))

if (module.hot) {
  module.hot.accept()
}
