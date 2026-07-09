import axios from "axios";
import { useEffect } from "react";
import { serverUrl } from "../config";

import {
    useDispatch,
    useSelector
} from "react-redux";

import {
    setOtherUsers
} from "../redux/userSlice";

const useGetOtherUsers = () => {

    const dispatch = useDispatch();

    const { userData } =
        useSelector(
            state => state.user
        );

    useEffect(() => {

        if (!userData?._id)
            return;

        let retryCount = 0;

        const fetchUsers =
            async () => {

                try {

                    console.log(
                        "Fetching users..."
                    );

                    const result =
                        await axios.get(

                            `${serverUrl}/message/sorted-users`,

                            {
                                withCredentials: true,
                                timeout: 10000
                            }

                        );

                    dispatch(
                        setOtherUsers(
                            result.data
                        )
                    );

                    console.log(
                        "Users Loaded:",
                        result.data.length
                    );

                }

                catch (error) {

                    console.log(
                        "Fetch Users Error:",
                        error.response?.status,
                        error.response?.data,
                        error.message
                    );

                    if (
                        retryCount < 3
                    ) {

                        retryCount++;

                        console.log(
                            `Retry ${retryCount}/3`
                        );

                        setTimeout(
                            fetchUsers,
                            3000
                        );

                    }

                }

            };

        fetchUsers();

    }, [
        userData?._id,
        dispatch
    ]);

};

export default useGetOtherUsers;