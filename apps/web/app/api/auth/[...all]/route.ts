import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Export GET and POST handlers for Better Auth
export const { GET, POST } = toNextJsHandler(auth);
