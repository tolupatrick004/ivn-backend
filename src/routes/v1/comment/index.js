import composeRouter from 'lib/compose/router'
import { routes } from '@comment/routes'

export default router => composeRouter(routes, router)
