import {expect} from 'chai'
import {fetchProjects} from '../src/gitlab/projects'
import {fetchLatestPipelines} from '../src/gitlab/pipelines'

const gitlab = {
  url: 'https://gitlab.com',
  'access-token': process.env.GITLAB_ACCESS_TOKEN
}

describe('Gitlab client', () => {
  it('Should find two projects with paging active and with no filtering ', async () => {
    const config = {gitlab, perPage: 1}
    const projects = await fetchProjects(config)
    expect(projects).to.deep.equal([
      {id: 5290928, name: 'gitlab-radiator-test/integration-test-project-2'},
      {id: 5290865, name: 'gitlab-radiator-test/integration-test-project-1'}
    ])
  });

  it('Should find one project with inclusive filtering', async () => {
    const config = {gitlab, projects: {include: '.*project-1'}}
    const projects = await fetchProjects(config)
    expect(projects).to.deep.equal([
      {id: 5290865, name: 'gitlab-radiator-test/integration-test-project-1'}
    ])
  });

  it('Should find one project with exclusive filtering', async () => {
    const config = {gitlab, projects: {exclude: '.*project-1'}}
    const projects = await fetchProjects(config)
    expect(projects).to.deep.equal([
      {id: 5290928, name: 'gitlab-radiator-test/integration-test-project-2'}
    ])
  });

  it('Should find latest pipeline for project with stages and retried jobs merged to one entry', async () => {
    const config = {gitlab}
    const pipelines = await fetchLatestPipelines(5290928, config)
    expect(pipelines).to.have.lengthOf(1)
    expect(pipelines[0].stages.test).to.have.lengthOf(1)
    expect(pipelines[0].stages.build).to.have.lengthOf(1)
  })
});
