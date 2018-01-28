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
            id: 16733911,
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
                    id: 49876213,
                    status: 'success',
                    name: 'eslint',
                    startedAt: '2018-01-28T16:06:21.808Z',
                    finishedAt: '2018-01-28T16:08:32.882Z'
                  },
                  {
                    id: 49876214,
                    status: 'success',
                    name: 'verify',
                    startedAt: '2018-01-28T16:08:34.100Z',
                    finishedAt: '2018-01-28T16:10:35.798Z'
                  },
                  {
                    id: 49876215,
                    status: 'success',
                    name: 'api-test',
                    startedAt: '2018-01-28T16:10:38.442Z',
                    finishedAt: '2018-01-28T16:12:47.393Z'
                  },
                  {
                    id: 49876216,
                    status: 'success',
                    name: 'browser-test',
                    startedAt: '2018-01-28T16:12:51.715Z',
                    finishedAt: '2018-01-28T16:14:53.861Z'
                  }
                ]
              },
              {
                name: 'build',
                jobs: [
                  {
                    id: 49876217,
                    status: 'success',
                    name: 'package-my-stuff',
                    startedAt: '2018-01-28T16:14:55.299Z',
                    finishedAt: '2018-01-28T16:15:51.073Z'
                  }
                ]
              },
              {
                name: 'deploy',
                jobs: [
                  {
                    id: 49876218,
                    status: 'success',
                    name: 'deploy-my-awesome-stuff',
                    startedAt: '2018-01-28T16:15:57.358Z',
                    finishedAt: '2018-01-28T16:17:09.471Z'
                  }
                ]
              },
              {
                name: 'finnish',
                jobs: [
                  {
                    id: 49876219,
                    status: 'manual',
                    name: 'manual_step-1'
                  },
                  {
                    id: 49876220,
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
