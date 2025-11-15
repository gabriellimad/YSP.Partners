import express, { Request, Response } from 'express';
import router from './routers/index';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());
app.use(router);

app.get('/', (_request: Request, response: Response) => {
    response.send('Server is working');
});

export default app;


// import express, { Request, Response } from 'express';
// import router from './routers/index';

// const app = express();

// app.use(express.json());

// app.use(router);

// app.get('/', (_request: Request, response: Response) => {
//     response.send();
// });

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

// export default app;
