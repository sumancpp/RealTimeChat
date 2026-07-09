import axios from "axios"
import { useEffect } from "react"
import { serverUrl } from "../config"
import { useDispatch } from "react-redux"
import { setUserData } from "../redux/userSlice"

const getCurrentUser = () => {

    const dispatch = useDispatch()

    useEffect(() => {

        const fetchUser = async () => {

            try {

                const result = await axios.get(
                    `${serverUrl}/user/current`,
                    { withCredentials: true }
                )

                dispatch(setUserData(result.data))

            } catch (error) {

                console.log("Error fetching current user:", error)

            }

        }

        fetchUser()

    }, [])

}

export default getCurrentUser