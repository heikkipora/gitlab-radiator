import * as clientMock from './../../src/gitlab/client'
import {expect} from 'chai'
import {fetchProjects} from './../../src/gitlab/projects'
import sinon from 'sinon'

describe("projects", () => {
    const response = {
        data: [
            {
                path_with_namespace: "group1/pro"
            },
            {
                path_with_namespace: "group1/pro-other"
            },
            {
                path_with_namespace: "group2/something"
            }
        ],
        headers: {}
    }

    before(() => {
        sinon.stub(clientMock, 'gitlabRequest').callsFake(() => {
            return new Promise((resolve) => {
                resolve(response)
            })
        })
    })

    after(() => {
        sinon.resetBehavior()
    })

    it('should return only included projects', async () => {
        const gitlab = {
            projects: {
                include: '.*/pro.*'
            }
        }
        const projects = await fetchProjects(gitlab)
        expect(projects.length).to.equal(2)
        expect(projects[0].name).to.equal('group1/pro')
        expect(projects[1].name).to.equal('group1/pro-other')
    })

    it('should not return excluded projects', async () => {
        const gitlab = {
            projects: {
                exclude: '.*/pro.*'
            }
        }
        const projects = await fetchProjects(gitlab)
        expect(projects.length).to.equal(1)
        expect(projects[0].name).to.equal('group2/something')
    })

    it('should not return excluded and return only included', async () => {
        const gitlab = {
            projects: {
                include: '.*/pro.*',
                exclude: '.*/pro-other.*'
            }
        }
        const projects = await fetchProjects(gitlab)
        expect(projects.length).to.equal(1)
        expect(projects[0].name).to.equal('group1/pro')
    })
})
