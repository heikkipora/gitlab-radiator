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
    expect(pipelines).to.deep.equal(
      [{
        id: 16728199,
        status: 'success',
        commit: {
          title: 'Fail more',
          author: 'Heikki Pora'
        },
        ref: 'master',
        stages: {
          test: [
            {
              id: 49858895,
              status: 'success',
              name: 'fail_randomly_long_name',
              startedAt: '2018-01-28T10:18:21.150Z',
              finishedAt: '2018-01-28T10:20:10.144Z'
            }
          ],
          build: [
            {
              id: 49858384,
              status: 'success',
              name: 'build_my_stuff',
              startedAt: '2018-01-28T10:20:10.340Z',
              finishedAt: '2018-01-28T10:21:40.299Z'
            }
          ]
        }
      }]
    )
  })
});
