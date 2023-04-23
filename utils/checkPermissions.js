import { UnAuthenticatedError } from "../errors/index.js";

const checkPermissions = (requestUser, resourceId) => {
    if (requestUser.userId === resourceId.toString()) return

    throw new UnAuthenticatedError('Not authorized to access this route')
}

export default checkPermissions