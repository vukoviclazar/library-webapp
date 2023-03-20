import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose'
import usersRouter from './routers/users.routes';
import booksRouter from './routers/books.routes';

const databaseUri: string = 'mongodb://localhost:27017/libraryDB';

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(databaseUri);
export const connection = mongoose.connection
connection.once('open', () => {
    console.log(`Database connection established via ${databaseUri}.`)
})

const router = express.Router()
router.use('/users', usersRouter)
router.use('/books', booksRouter)

app.use('/avatars', express.static('images/avatars'));
app.use('/covers', express.static('images/covers'));

app.use('/', router)
app.listen(4000, () => console.log(`Express server running on port 4000`));