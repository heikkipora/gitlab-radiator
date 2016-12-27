import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom'

const RadiatorApp = React.createClass({

  getInitialState() {
    return {
      builds: undefined
    }
  },

  componentDidMount() {
    io().on('builds', this.onBuildsUpdated)
    io().on('error', window.alert)
  },

  render() {
    if (!this.state.builds) {
      return <h2 className="loading">Fetching projects and builds from GitLab...</h2>
    } else if (this.state.builds.length == 0) {
      return <h2 className="loading">No projects with builds found.</h2>
    }
    return <ol className="projects">{this.renderBuilds(this.state.builds)}</ol>
  },

  renderBuilds(builds) {
    return builds.map(build => {
      return <li className="project" key={build.project.id}>
        <h2>{build.project.name}</h2>
        {this.renderPhases(build)}
        {build.commit.map((commit, index) => {
          return <div className="commit" key={index}>
            <div>
              <div className="commit-author">{commit.authorName}</div>
              <div className="commit-timestamp">{commit.createdAt}</div>
            </div>
            <div>
              <div className="commit-title">{commit.title}</div>
            </div>
          </div>
        })}
      </li>
    })
  },

  renderPhases(build) {
    const phasesToRender = this.calculatePhasesToRender(build)
    return <ol className="phases">{phasesToRender.map((phase, index) => {
        const className = `phase ${phase.status}` +
          (phase.hiddenFromStart ? ' hidden-from-start' : '') +
          (phase.hiddenFromEnd ? ' hidden-from-end' : '')
        return <li className={className} key={phase.id}><div className="phase-name">{phase.name}</div></li>
      })}
    </ol>
  },

  calculatePhasesToRender(build) {
    return build.builds.reduce((acc, phase) => {
      if (acc.length < 4) {
        acc.push(phase)
      } else if (acc[0].status == 'success') {
        acc = acc.slice(1)
        acc.push(phase)
        acc[0].hiddenFromStart = true
      } else {
        acc[acc.length - 1].hiddenFromEnd = true
      }
      return acc
    }, [])
  },

  onBuildsUpdated(builds) {
    this.setState({builds: builds})
  }
})

ReactDOM.render(<RadiatorApp />, document.getElementById('app'))
