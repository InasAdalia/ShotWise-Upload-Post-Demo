import { createBrowserRouter } from "react-router-dom";
import FeedLayout from "./components/FeedLayout";
import PostLayout from "./components/PostLayout";

export const router = createBrowserRouter([
    {path: '/', element: <FeedLayout />},
    {path: '/feed', element: <FeedLayout />},
    {path: '/upload', element: <PostLayout />},
    {path: '/post', element: <PostLayout />},
])