import {expect} from 'chai'
import {fetchProjects} from '../src/gitlab/projects'
import {fetchLatestPipelines} from '../src/gitlab/pipelines'
import {update} from '../src/gitlab'

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
        stages: [
          {
            name: 'test',
            jobs: [
              {
                id: 49858895,
                status: 'success',
                name: 'fail_randomly_long_name',
                startedAt: '2018-01-28T10:18:21.150Z',
                finishedAt: '2018-01-28T10:20:10.144Z'
              }
            ]
          },
          {
            name: 'build',
            jobs: [
              {
                id: 49858384,
                status: 'success',
                name: 'build_my_stuff',
                startedAt: '2018-01-28T10:20:10.340Z',
                finishedAt: '2018-01-28T10:21:40.299Z'
              }
            ]
          }
        ]
      }]
    )
  })

  it('Should find two projects with one pipeline each', async() => {
    const config = {gitlab}
    const projects = await update(config)
    expect(projects).to.deep.equal(
      [{
        id: 5290928,
        name: 'gitlab-radiator-test/integration-test-project-2',
        pipelines: [
          {
            id: 16728199,
            ref: 'master',
            status: 'success',
            commit: {
              title: 'Fail more',
              author: 'Heikki Pora'
            },
            stages: [
              {
                name: 'test',
                jobs: [
                  {
                    id: 49858895,
                    status: 'success',
                    name: 'fail_randomly_long_name',
                    startedAt: '2018-01-28T10:18:21.150Z',
                    finishedAt: '2018-01-28T10:20:10.144Z'
                  }
                ]
              },
              {
                name: 'build',
                jobs: [
                  {
                    id: 49858384,
                    status: 'success',
                    name: 'build_my_stuff',
                    startedAt: '2018-01-28T10:20:10.340Z',
                    finishedAt: '2018-01-28T10:21:40.299Z'
                  }
                ]
              }
            ]
          }
        ],
        status: 'success'
      },
      {
        id: 5290865,
        name: 'gitlab-radiator-test/integration-test-project-1',
        pipelines: [
          {
            id: 16728421,
            ref: 'master',
            status: 'success',
            commit: {
              title: 'Fail manual step',
              author: 'Heikki Pora'
            },
            stages: [
              {
                name: 'test',
                jobs: [
                  {
                    id: 49858864,
                    status: 'success',
                    name: 'eslint',
                    startedAt: '2018-01-28T10:17:29.185Z',
                    finishedAt: '2018-01-28T10:18:35.821Z'
                  },
                  {
                    id: 49858865,
                    status: 'success',
                    name: 'verify',
                    startedAt: '2018-01-28T10:17:29.260Z',
                    finishedAt: '2018-01-28T10:19:31.412Z'
                  },
                  {
                    id: 49858866,
                    status: 'success',
                    name: 'api-test',
                    startedAt: '2018-01-28T10:17:29.616Z',
                    finishedAt: '2018-01-28T10:18:36.640Z'
                  },
                  {
                    id: 49858867,
                    status: 'success',
                    name: 'browser-test',
                    startedAt: '2018-01-28T10:17:29.739Z',
                    finishedAt: '2018-01-28T10:19:12.775Z'
                  }
                ]
              },
              {
                name: 'build',
                jobs: [
                  {
                    id: 49858868,
                    status: 'success',
                    name: 'package-my-stuff',
                    startedAt: '2018-01-28T10:19:33.097Z',
                    finishedAt: '2018-01-28T10:21:10.151Z'
                  }
                ]
              },
              {
                name: 'deploy',
                jobs: [
                  {
                    id: 49858869,
                    status: 'success',
                    name: 'deploy-my-awesome-stuff',
                    startedAt: '2018-01-28T10:21:10.603Z',
                    finishedAt: '2018-01-28T10:22:57.477Z'
                  }
                ]
              },
              {
                name: 'finnish',
                jobs: [
                  {
                    id: 49858870,
                    status: 'manual',
                    name: 'manual_step-1'
                  },
                  {
                    id: 49858871,
                    status: 'manual',
                    name: 'manual_step-2'
                  }
                ]
              }
            ]
          }
        ],
        status: 'success'
      }]
    )
  })
});
