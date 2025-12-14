import { createBrowserRouter } from "react-router-dom";
import FeedLayout from "./components/Page_FeedLayout";
import PostLayout from "./components/Page_PostLayout";

export const router = createBrowserRouter([
    {path: '/', element: <FeedLayout />},
    {path: '/feed', element: <FeedLayout />},
    {path: '/upload', element: <PostLayout />},
    {path: '/post', element: <PostLayout />},
])