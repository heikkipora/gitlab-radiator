import {parse} from 'basic-auth'
import type {NextFunction, Request, Response} from 'express'

export function basicAuth(auth: {username: string; password: string } | undefined) {
  if (!auth) {
    console.log('No authentication configured')
    return (req: Request, res: Response, next: NextFunction) => next()
  }

  console.log('HTTP basic auth enabled')
  return (req: Request, res: Response, next: NextFunction) => {
    const credentials = parse(req.headers.authorization ?? '')
    if (credentials && auth.username === credentials.name && auth.password === credentials.pass) {
      next()
    } else {
      res.setHeader('WWW-Authenticate', 'Basic realm="gitlab-radiator"')
      res.status(401).end()
    }
  }
}
