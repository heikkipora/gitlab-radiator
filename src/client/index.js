import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom'

const RadiatorApp = React.createClass({
  getInitialState() {
    return {
      builds: []
    }
  },
  componentDidMount() {
    io().on('builds', this.onBuildsUpdated)
  },
  render() {
    if (this.state.builds.length == 0) {
      return <h2>Loading builds...</h2>
    }
    return <ol className="projects">{this.renderBuilds(this.state.builds)}</ol>
  },
  renderBuilds(builds) {
    return builds.map(build => {
      return <li className="project" key={build.project.id}>
        <h2>{build.project.name}</h2>
        <ol className="phases">{build.builds.map(phase => {
          const className = `phase ${phase.status}`
          return <li className={className} key={phase.id}>{phase.name}</li>
        })}</ol>
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
  onBuildsUpdated(builds) {
    console.log(builds)
    this.setState({builds: builds})
  }
})

ReactDOM.render(<RadiatorApp />, document.getElementById('app'))
