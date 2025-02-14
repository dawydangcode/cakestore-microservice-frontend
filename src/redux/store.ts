import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./service/authApi.ts";
import { setupListeners } from "@reduxjs/toolkit/query";


export const store= configureStore({
    reducer:{
        [authApi.reducerPath]:authApi.reducer,
    },
    middleware:(curryGetDefaultMiddleware)=>curryGetDefaultMiddleware().concat(authApi.middleware)
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
setupListeners(store.dispatch)