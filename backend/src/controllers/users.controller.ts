import express from 'express'
import UserModel from '../models/User'
import LoanModel from '../models/Loan'
import UtilsModel from '../models/Utils'
import BookModel from '../models/Book'
import { unlink } from 'node:fs'
import { avatarsPath, defaultAvatarName, loanLengthTag, maxLoanedBooks } from '../util/constants'
import mongoose from 'mongoose'
import { daysBetween } from '../util/utility.functions'
import { todaysDate } from '../util/utility.functions'
export class UsersController {

    login(req: express.Request, res: express.Response) {
        let identifier = req.body.identifier
        let password = req.body.password
        let types = req.body.types

        console.log(identifier + ' ' + password + ' ' + types)
        UserModel.findOne({
            password: password,
            registeredSuccessfully: true,
            $or: [{ username: identifier }, { email: identifier }],
            role: { $in: types }
        }, (error, result) => {
            if (error) {
                console.error(`Error processing login: ${error}`)
                res.status(500).json({ message: `Error processing login: ${error}` })
            }
            else {
                if (result == null) {
                    console.log(`Login failed - user not found.`)
                    res.status(400).json({ message: `Login failed - user not found.` })
                }
                else {
                    result.avatarImagePath = result.avatarImagePath ? result.avatarImagePath : defaultAvatarName
                    console.log(`Login succeeded - user: ${result}`)
                    res.status(200).json(result)
                }
            }
        })
    }

    register = (req: express.Request, res: express.Response) => {
        let username = req.body.username
        let email = req.body.email

        console.log(req.body)

        console.log('Registration request: ' + username + ' ' + email)
        UserModel.findOne({
            email: email
        }, (error, result) => {
            if (error) {
                console.error(`Error processing registration request: ${error}`)
                res.status(500).json({ message: `Error: ${error}` })
            }
            else {
                if (result != null) {
                    console.log(`Registration failed - email already exists.`)
                    res.status(400).json({ message: `Registration failed - email already exists.` })
                    return
                }
                else {
                    UserModel.findOne({
                        username: username
                    }, (error, result) => {
                        if (error) {
                            console.error(`Error processing registration request: ${error}`)
                            res.status(500).json({ message: `Error: ${error}` })
                        }
                        else {
                            if (result != null) {
                                console.log(`Registration failed - username already exists.`)
                                res.status(400).json({ message: `Registration failed - username already exists.` })
                                return
                            }
                            else {
                                let newUser = new UserModel({
                                    _id: new mongoose.Types.ObjectId(),
                                    username: req.body.username,
                                    password: req.body.password,
                                    firstName: req.body.firstName,
                                    lastName: req.body.lastName,
                                    address: req.body.address,
                                    phone: req.body.phone,
                                    email: req.body.email,
                                    avatarImagePath: req.body.avatarImagePath,
                                    role: req.body.role,
                                    registeredSuccessfully: req.body.registeredSuccessfully,
                                    blocked: req.body.blocked
                                })

                                newUser.save((error => {
                                    if (error) {
                                        console.error(`Error processing registration request: ${error}`)
                                        res.status(500).json({ message: `Error: ${error}` })
                                    }
                                    else {
                                        console.log(`Registration succeeded`)
                                        res.status(200).json({ message: `Success` })
                                    }
                                }))
                            }
                        }
                    })
                }
            }
        })
    }

    uploadAvatar(req: express.Request, res: express.Response) {
        let username = req.body.username
        let avatarImagePath = req.body.avatarImagePath

        console.log('Avatar upload request: ' + username + ' ' + avatarImagePath)

        UserModel.findOne({
            username: username
        }, (error, result) => {
            if (error) {
                console.error(`Error processing avatar upload request: ${error}`)
                if (avatarImagePath != null)
                    unlink(`${avatarsPath}\\${avatarImagePath}`, (err) => {
                        if (err) {
                            console.log(`Error deleting file at ${avatarsPath}\\${avatarImagePath} - ${err}`)
                        }
                    })
                res.status(500).json({ message: `Error: ${error}` })
            }
            else {
                if (result != null) {
                    if (result.avatarImagePath != null
                        && result.avatarImagePath != avatarImagePath)
                        unlink(`${avatarsPath}\\${result.avatarImagePath}`, (err) => {
                            if (err) {
                                console.log(`Error deleting file at ${avatarsPath}\\${avatarImagePath} - ${err}`)
                            }
                        })

                    UserModel.updateOne({
                        username: username
                    }, {
                        avatarImagePath: avatarImagePath
                    }, (error, result) => {
                        if (error) {
                            console.error(`Error processing avatar upload request: ${error}`)
                            if (avatarImagePath != null)
                                unlink(`${avatarsPath}\\${avatarImagePath}`, (err) => {
                                    if (err) {
                                        console.log(`Error deleting file at ${avatarsPath}\\${avatarImagePath} - ${err}`)
                                    }
                                })
                            res.status(500).json({ message: `Error: ${error}` })
                        }
                        else {
                            console.log(`Avatar upload succeeded`)
                            res.status(200).json({ message: `Success` })
                        }
                    })
                }
                else {
                    console.log(`Avatar upload failed - no such user.`)
                    if (avatarImagePath != null)
                        unlink(`${avatarsPath}/${avatarImagePath}`, (err) => {
                            console.error(`Error deleting file: ${error}`)
                        })
                    res.status(400).json({ message: `Avatar upload failed - no such user.` })
                    return
                }
            }
        })
    }


    updateUser = (req: express.Request, res: express.Response) => {
        let oldUsername = req.body.oldUsername
        let user = {
            username: req.body.user.username,
            password: req.body.user.password,
            firstName: req.body.user.firstName,
            lastName: req.body.user.lastName,
            address: req.body.user.address,
            phone: req.body.user.phone,
            email: req.body.user.email,
            role: req.body.user.role,
            registeredSuccessfully: req.body.user.registeredSuccessfully,
            blocked: req.body.user.blocked
        }

        console.log(req.body)

        console.log('Update user request: ' + oldUsername + ' ' + user)

        UserModel.findOne({
            username: oldUsername
        }, (error, result) => {
            if (error) {
                console.error(`Error processing update user request: ${error}`)
                res.status(500).json({ message: `Error: ${error}` })
            }
            else {
                if (result != null) {

                    let oldUser = result

                    UserModel.findOne({
                        email: user.email
                    }, (error, result) => {
                        if (error) {
                            console.error(`Error processing update user request: ${error}`)
                            res.status(500).json({ message: `Error: ${error}` })
                        }
                        else {
                            if (result != null
                                && JSON.stringify(result) != JSON.stringify(oldUser)) {
                                console.log(result)
                                console.log(oldUser)
                                console.log(`Update user failed - email already exists.`)
                                res.status(400).json({ message: `Update user failed - email already exists.` })
                                return
                            }
                            else {
                                UserModel.findOne({
                                    username: user.username
                                }, (error, result) => {
                                    if (error) {
                                        console.error(`Error processing update user request: ${error}`)
                                        res.status(500).json({ message: `Error: ${error}` })
                                    }
                                    else {
                                        if (result != null
                                            && JSON.stringify(result) != JSON.stringify(oldUser)) {
                                            console.log(`Update user failed - username already exists.`)
                                            res.status(400).json({ message: `Update user failed - username already exists.` })
                                            return
                                        }
                                        else {
                                            UserModel.findByIdAndUpdate(
                                                oldUser._id,
                                                user,
                                                { new: true },
                                                (error, result) => {
                                                    if (error) {
                                                        console.error(`Error processing update user request: ${error}`)
                                                        res.status(500).json({ message: `Error: ${error}` })
                                                    }
                                                    else {
                                                        console.log(`Update user succeeded`)
                                                        console.log(result)
                                                        res.status(200).json(result)
                                                    }
                                                }
                                            )
                                        }
                                    }
                                })
                            }
                        }
                    })

                }
                else {
                    console.log(`Update user failed - no such user.`)
                    res.status(400).json({ message: `Update user failed - no such user.` })
                    return
                }
            }
        })
    }

    searchForUsers = (req: express.Request, res: express.Response) => {
        let query = {}
        if (req.body.registeredSuccessfully != null)
            query['registeredSuccessfully'] = req.body.registeredSuccessfully
        let searchParam: string = req.body.searchParam
        let pageSize: number = req.body.pageSize
        let pageNum: number = req.body.pageNum
        query['$or'] = [
            { username: { $regex: searchParam, $options: 'i' } },
            { email: { $regex: searchParam, $options: 'i' } }
        ]

        console.log(`Search users request: searchParam : ${searchParam}, pageSize : ${pageSize}, pageNum : ${pageNum}`)

        if (pageSize < 1 || pageNum < 1) {
            console.log(`Search for users failed - invalid page size (${pageSize}) or page number (${pageNum}).`)
            res.status(400).json({ message: `Search for users failed - invalid page parameters.` })
            return
        }
        UserModel.countDocuments(
            query,
            (error, result) => {
                if (error) {
                    console.error(`Error processing search users request: ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                }
                else {
                    if (result == null) {
                        console.error(`Error processing search users request: ${error}`)
                        res.status(500).json({ message: `Error: ${error}` })
                    }

                    let pageCount: number = Math.ceil(result / pageSize)
                    if (pageCount == 0)
                        pageCount = 1
                    console.log(`Page count for query: ${pageCount}`)

                    if (pageCount < pageNum) {
                        console.log(`Search for users failed - invalid page size (${pageSize}) or page number (${pageNum}).`)
                        res.status(400).json({ message: `Search for users failed - invalid page parameters.` })
                        return
                    }

                    UserModel.find(
                        query,
                        null,
                        {
                            sort: { _id: -1 },
                            skip: pageSize * (pageNum - 1),
                            limit: pageSize
                        },
                        (error, result) => {
                            if (error) {
                                console.error(`Error processing search users request: ${error}`)
                                res.status(500).json({ message: `Error: ${error}` })
                            }
                            else {
                                result.forEach(res => {
                                    res.avatarImagePath = res.avatarImagePath ? res.avatarImagePath : defaultAvatarName
                                })
                                console.log(`Search users succeeded`)
                                console.log(result)
                                res.status(200).json({ users: result, pageCount: pageCount })
                            }
                        }
                    )
                }
            }

        )
    }

    getUser(req: express.Request, res: express.Response) {
        let username = req.body.username

        console.log('Getting user ' + username)
        UserModel.findOne({
            username: username,
        }, (error, result) => {
            if (error) {
                console.error(`Error getting user: ${error}`)
                res.status(500).json({ message: `Error getting user: ${error}` })
            }
            else {
                if (result == null) {
                    console.log(`Get user failed - user not found.`)
                    res.status(400).json({ message: `Get user failed - user not found.` })
                }
                else {
                    result.avatarImagePath = result.avatarImagePath ? result.avatarImagePath : defaultAvatarName
                    console.log(`Get user succeeded - user: ${result}`)
                    res.status(200).json(result)
                }
            }
        })
    }

    removeUser = (req: express.Request, res: express.Response) => {
        let userId = req.body.userId

        LoanModel.find(
            {
                userId: userId,
                dateReturned: null
            },
            (error, result) => {
                if (error) {
                    console.error(`Error processing remove user request: ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                } else {
                    console.log(result)
                    if (result != null && result.length == 0) {
                        UserModel.findByIdAndDelete(
                            userId,
                            null,
                            (error, result) => {
                                if (error) {
                                    console.error(`Error processing remove user request: ${error}`)
                                    res.status(500).json({ message: `Error: ${error}` })
                                }
                                else {
                                    if (result.avatarImagePath != null)
                                        console.log(result.avatarImagePath)
                                    unlink(`${avatarsPath}\\${result.avatarImagePath}`, (err) => {
                                        console.log(`Error deleting file at ${avatarsPath}\\${result.avatarImagePath} - ${err}`)
                                    })
                                    if (result == null) {
                                        console.log(`Remove user failed - no such user.`)
                                        res.status(400).json({ message: `Remove user failed - no such user.` })
                                    }
                                    else {
                                        console.log(`Remove user succeeded.`)
                                        res.status(200).json({ message: `Success` })
                                    }
                                }
                            }
                        )
                    } else {
                        console.log(`Remove user failed - there are active loans for this user.`)
                        res.status(400).json({ message: `Remove user failed - there are active loans for this user.` })
                        return
                    }
                }
            }
        )
    }


    setLoanLength = (req: express.Request, res: express.Response) => {
        let length = req.body.length

        UtilsModel.findOneAndUpdate({ tag: loanLengthTag }, { $set: { data: length } }, { new: true })
            .then(
                result => {
                    console.log(`Set loan length succeeded.`)
                    res.status(200).json({ length: result.data })
                }
            ).catch(
                error => {
                    console.error(`Error processing set loan length request: ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                }
            )
    }

    getLoanLength = (req: express.Request, res: express.Response) => {
        let length = req.body.length

        UtilsModel.findOne({ tag: loanLengthTag })
            .then(
                result => {
                    console.log(`Get loan length succeeded.`)
                    res.status(200).json({ length: result.data })
                }
            ).catch(
                error => {
                    console.error(`Error processing set loan length request: ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                }
            )
    }

    getNotificationsForUser = (req: express.Request, res: express.Response) => {
        let id = req.body.userId

        let notifications = []
        let loanLength: number = null

        UtilsModel.findOne({ tag: loanLengthTag }).then(
            result => {
                if(result == null)
                    throw new Break('Get notifications failed - cannot fetch maximum loan length.')
                loanLength = result.data
                return UserModel.findById(id)
            }
        ).then(
            user => {
                if (user == null)
                    throw new Break(`Get notifications failed - no such user.`)
                if (user.blocked)
                    notifications.push(
                        {
                            warn: true,
                            text: 'Blokirani ste od strane administratora. Neke funkcionalnosti biblioteke biće Vam nedostupne.',
                            permanent: false
                        }
                    )
                return LoanModel.find({ userId: id, dateReturned: null })
            }
        ).then(
            loans => {
                if (loans != null) {
                    if(loans.length == maxLoanedBooks)
                        notifications.push(
                            {
                                warn: false,
                                text: 'Imate maksimalan broj zaduženih knjiga. Onemogućeno Vam je dalje zaduživanje dok ne vratite neku od zaduženih knjiga.',
                                permanent: false
                            }
                        )
                    let today = todaysDate()

                    for(let i = 0; i < loans.length; i++) {
                        let numDays = loanLength + (loans[i].extended ? loanLength : 0) - daysBetween(loans[i].dateBorrowed, today)
                        if (numDays < 0)
                            notifications.push(
                                {
                                    warn: true,
                                    text: `Istekao Vam je rok za vraćanje knjige "${loans[i].backupTitle}" pre ${-numDays} ${numDays == -1 ? 'dan' : 'dana'}.`,
                                    permanent: false
                                }
                            )
                        else if (numDays < 3)
                            notifications.push(
                                {
                                    warn: false,
                                    text: `Ističe Vam rok za vraćanje knjige "${loans[i].backupTitle}" za ${numDays} ${numDays == 1 ? 'dan' : 'dana'}.`,
                                    permanent: false
                                }
                            )
                    }
                }

            return BookModel.find({userWhoRequested: id, successfullyAdded: true})
            }
        ).then(
            books => {
                if (books != null) {
                    if (books.length > 1) {

                        let titles: string = ''
                        books.forEach((book) => {
                            titles = String().concat(titles, '"' + book.title + '"')
                            if (books[books.length - 1] != book)
                                titles = String().concat(titles, ', ')
                        })

                        notifications.push(
                            {
                                warn: false,
                                text: `Knjige ${titles} su dodate na Vaš predlog. Hvala što učestvujete u radu biblioteke.`,
                                permanent: true
                            }
                        )
                    } else if (books.length == 1)
                        notifications.push(
                            {
                                warn: false,
                                text: `Knjiga "${books[0].title}" je dodata na Vaš predlog. Hvala što učestvujete u radu biblioteke.`,
                                permanent: true
                            }
                        )                        
                }

                console.log(notifications)
                console.log(`Get notifications succeeded.`)
                res.status(200).json({ notifications: notifications })
            }
        ).catch(
            error => {
                if (error instanceof Break) {
                    console.log(error.message)
                    res.status(400).json({ message: error.message })
                }
                else {
                    console.log(`Error getting notifications - ${error}`)
                    res.status(500).json({ message: `Error: ${error}` })
                }
            }
        )


    }

}

class Break {
    constructor(
        public message: string
    ) { }
}