import express from 'express'
import { uploadAvatar } from '../util/multer.settings';
import { UsersController } from '../controllers/users.controller';

const usersRouter = express.Router();

usersRouter.route('/login').post(
    (req, res) => new UsersController().login(req, res)
)

usersRouter.route('/register').post(
    (req, res) => new UsersController().register(req, res)
)

usersRouter.route('/updateUser').post(
    (req, res) => new UsersController().updateUser(req, res)
)

usersRouter.route('/removeUser').post(
    (req, res) => new UsersController().removeUser(req, res)
)

usersRouter.route('/searchForUsers').post(
    (req, res) => new UsersController().searchForUsers(req, res)
)

usersRouter.route('/getUser').post(
    (req, res) => new UsersController().getUser(req, res)
)

usersRouter.route('/uploadAvatar').post(
    uploadAvatar,
    (req, res) => new UsersController().uploadAvatar(req, res)
)

usersRouter.route('/setLoanLength').post(
    (req, res) => new UsersController().setLoanLength(req, res)
)

usersRouter.route('/getLoanLength').post(
    (req, res) => new UsersController().getLoanLength(req, res)
)

usersRouter.route('/getNotificationsForUser').post(
    (req, res) => new UsersController().getNotificationsForUser(req, res)
)

export default usersRouter;