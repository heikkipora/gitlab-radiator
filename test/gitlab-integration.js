import {expect} from 'chai'
import {fetchProjects} from '../src/gitlab/projects'
import {fetchLatestPipelines} from '../src/gitlab/pipelines'
import {update} from '../src/gitlab'

const gitlab = {
  url: 'https://gitlab.com',
  'access-token': process.env.GITLAB_ACCESS_TOKEN
}

describe('Gitlab client', () => {
  it('Should find four projects with paging active and with no filtering ', async () => {
    const config = {gitlab, perPage: 1}
    const projects = await fetchProjects(config)
    expect(projects).to.deep.equal([
      {id: 5385889, name: 'gitlab-radiator-test/ci-skip-test-project'},
      {id: 5304923, name: 'gitlab-radiator-test/empty-test'},
      {id: 5290928, name: 'gitlab-radiator-test/integration-test-project-2'},
      {id: 5290865, name: 'gitlab-radiator-test/integration-test-project-1'}
    ])
  })

  it('Should find one project with inclusive filtering', async () => {
    const config = {gitlab, projects: {include: '.*project-1'}}
    const projects = await fetchProjects(config)
    expect(projects).to.deep.equal([
      {id: 5290865, name: 'gitlab-radiator-test/integration-test-project-1'}
    ])
  })

  it('Should find three projects with exclusive filtering', async () => {
    const config = {gitlab, projects: {exclude: '.*project-1'}}
    const projects = await fetchProjects(config)
    expect(projects).to.deep.equal([
      {id: 5385889, name: 'gitlab-radiator-test/ci-skip-test-project'},
      {id: 5304923, name: 'gitlab-radiator-test/empty-test'},
      {id: 5290928, name: 'gitlab-radiator-test/integration-test-project-2'}
    ])
  })

  it('Should find latest non-skipped pipeline for project', async () => {
    const config = {gitlab}
    const pipelines = await fetchLatestPipelines(5385889, config)
    expect(pipelines).to.deep.equal(
      [{
        commit: {
          author: 'Heikki Pora',
          title: 'Initial commit'
        },
        id: 17172603,
        ref: 'master',
        stages: [{
          jobs: [{
            finishedAt: '2018-02-06T19:09:04.470Z',
            id: 51360738,
            name: 'test',
            startedAt: '2018-02-06T19:08:18.204Z',
            status: 'success'
          }],
          name: 'test'
        }],
        status: 'success'
      }]
    )
  })

  it('Should find latest pipelines for project (feature branch + master) with stages and retried jobs merged to one entry', async () => {
    const config = {gitlab}
    const pipelines = await fetchLatestPipelines(5290928, config)
    expect(pipelines).to.deep.equal(
      [{
        id: 16793189,
        status: 'success',
        commit: {
          title: 'Fail more',
          author: 'Heikki Pora'
        },
        ref: 'feature/test-branch',
        stages: [
          {
            name: 'test',
            jobs: [
              {
                id: 50073450,
                status: 'success',
                name: 'fail_randomly_long_name',
                startedAt: '2018-01-29T20:43:16.150Z',
                finishedAt: '2018-01-29T20:44:14.087Z'
              }
            ]
          },
          {
            name: 'build',
            jobs: [
              {
                id: 50072465,
                status: 'success',
                name: 'build_my_stuff',
                startedAt: '2018-01-29T20:33:25.756Z',
                finishedAt: '2018-01-29T20:34:34.936Z'
              }
            ]
          }
        ]
      },
      {
        id: 16728199,
        status: 'failed',
        commit: {
          author: 'Heikki Pora',
          title: 'Fail more'
        },
        ref: 'master',
        stages: [
          {
            jobs: [
              {
                finishedAt: '2018-01-29T20:43:22.986Z',
                id: 50073308,
                name: 'fail_randomly_long_name',
                startedAt: '2018-01-29T20:41:45.452Z',
                status: 'failed'
              }
            ],
            name: 'test'
          },
          {
            jobs: [
              {
                finishedAt: '2018-01-28T10:21:40.299Z',
                id: 49858384,
                name: 'build_my_stuff',
                startedAt: '2018-01-28T10:20:10.340Z',
                status: 'success'
              }
            ],
            name: 'build'
          }
        ]
      }]
    )
  })

  it('Should find two projects with two pipelines for the first and one for the second (and exclude projects without pipelines)', async() => {
    const config = {gitlab}
    const projects = await update(config)
    expect(projects).to.deep.equal(
      [
        {
          id: 5385889,
          name: 'gitlab-radiator-test/ci-skip-test-project',
          pipelines: [
            {
              id: 17172603,
              status: 'success',
              commit: {
                author: 'Heikki Pora',
                title: 'Initial commit'
              },
              ref: 'master',
              stages: [{
                jobs: [{
                  finishedAt: '2018-02-06T19:09:04.470Z',
                  id: 51360738,
                  name: 'test',
                  startedAt: '2018-02-06T19:08:18.204Z',
                  status: 'success'
                }],
                name: 'test'
              }]
            }
          ],
          status: 'success'
        },
        {
        id: 5290928,
        name: 'gitlab-radiator-test/integration-test-project-2',
        pipelines: [
          {
            id: 16793189,
            status: 'success',
            commit: {
              title: 'Fail more',
              author: 'Heikki Pora'
            },
            ref: 'feature/test-branch',
            stages: [
              {
                name: 'test',
                jobs: [
                  {
                    id: 50073450,
                    status: 'success',
                    name: 'fail_randomly_long_name',
                    startedAt: '2018-01-29T20:43:16.150Z',
                    finishedAt: '2018-01-29T20:44:14.087Z'
                  }
                ]
              },
              {
                name: 'build',
                jobs: [
                  {
                    id: 50072465,
                    status: 'success',
                    name: 'build_my_stuff',
                    startedAt: '2018-01-29T20:33:25.756Z',
                    finishedAt: '2018-01-29T20:34:34.936Z'
                  }
                ]
              }
            ]
          },
          {
            id: 16728199,
            ref: 'master',
            status: 'failed',
            commit: {
              title: 'Fail more',
              author: 'Heikki Pora'
            },
            stages: [
              {
                name: 'test',
                jobs: [
                  {
                    id: 50073308,
                    status: 'failed',
                    name: 'fail_randomly_long_name',
                    startedAt: '2018-01-29T20:41:45.452Z',
                    finishedAt: '2018-01-29T20:43:22.986Z'
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
        status: 'failed'
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
                  },
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
})
