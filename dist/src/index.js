"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const port = 2521;
app.use(express_1.default.json());
app.post(`/signup`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, posts } = req.body;
    const postData = posts === null || posts === void 0 ? void 0 : posts.map((post) => {
        return { title: post === null || post === void 0 ? void 0 : post.title, content: post === null || post === void 0 ? void 0 : post.content };
    });
    const result = yield prisma.user.create({
        data: {
            name,
            email,
            posts: {
                create: postData,
            },
        },
    });
    res.json(result);
}));
app.post(`/post`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content, authorEmail } = req.body;
    const result = yield prisma.post.create({
        data: {
            title,
            content,
            author: { connect: { email: authorEmail } },
        },
    });
    res.json(result);
}));
app.put('/post/:id/views', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const post = yield prisma.post.update({
            where: { id: Number(id) },
            data: {
                viewCount: {
                    increment: 1,
                },
            },
        });
        res.json(post);
    }
    catch (error) {
        res.json({ error: `Post with ID ${id} does not exist in the database` });
    }
}));
app.put('/publish/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const postData = yield prisma.post.findUnique({
            where: { id: Number(id) },
            select: {
                published: true,
            },
        });
        const updatedPost = yield prisma.post.update({
            where: { id: Number(id) || undefined },
            data: { published: !(postData === null || postData === void 0 ? void 0 : postData.published) },
        });
        res.json(updatedPost);
    }
    catch (error) {
        res.json({ error: `Post with ID ${id} does not exist in the database` });
    }
}));
app.delete(`/post/:id`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const post = yield prisma.post.delete({
        where: {
            id: Number(id),
        },
    });
    res.json(post);
}));
app.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma.user.findMany();
    res.json(users);
}));
app.get('/user/:id/drafts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const drafts = yield prisma.user
        .findUnique({
        where: {
            id: Number(id),
        },
    })
        .posts({
        where: { published: false },
    });
    res.json(drafts);
}));
app.get(`/post/:id`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const post = yield prisma.post.findUnique({
        where: { id: Number(id) },
    });
    res.json(post);
}));
app.get('/feed', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchString, skip, take, orderBy } = req.query;
    const or = searchString
        ? {
            OR: [
                { title: { contains: searchString } },
                { content: { contains: searchString } },
            ],
        }
        : {};
    const posts = yield prisma.post.findMany({
        where: Object.assign({ published: true }, or),
        include: { author: true },
        take: Number(take) || undefined,
        skip: Number(skip) || undefined,
        orderBy: {
            updatedAt: orderBy,
        },
    });
    res.json(posts);
}));
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
    // Production-specific code or configuration
    console.log('Is Production');
    console.log(process.env.DATABASE_URL);
}
else {
    // Development-specific code or configuration
    console.log('Is Development');
    console.log(process.env.DATABASE_URL);
}
app.get('/', (req, res) => {
    res.send('Hello World!');
});
const server = app.listen(port, () => console.log(`
🚀 Server ready at: http://localhost:${port}
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`));
