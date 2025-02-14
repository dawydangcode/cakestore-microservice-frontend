import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"

export const authApi=createApi({
    reducerPath:"authApi",
    baseQuery:fetchBaseQuery({
        baseUrl:"http://localhost:8087/api/auth"
    }),
    endpoints:(builder)=>({
        registerUser: builder.mutation({
            query:(body:{firstName:string,lastName:string,email:string,password:string,role:string})=>{
                return{
                    url:"/register",
                    method:"POST",
                    body
                }
            }
        }),
        loginUser:builder.mutation({
            query:(body:{email:string,password:string})=>{
                return{
                    url:"/login",
                    method:"POST",
                    body
                }
            }
        })
    })
})

export const {useRegisterUserMutation , useLoginUserMutation}=authApi;