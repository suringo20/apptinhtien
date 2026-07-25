// Vercel Serverless Function entry. All /api/* requests are rewritten here
// (see vercel.json) and handled by the Express app. The app is imported from
// the compiled server output produced by the build command.
import { buildApp } from '../server/dist/index.js';

export default buildApp();
