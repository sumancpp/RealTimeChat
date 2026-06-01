import axios from "axios";

import { useEffect } from "react";

import { serverUrl } from "../main";

import {
    useDispatch,
    useSelector
} from "react-redux";

import {
    setOtherUsers
} from "../redux/userSlice";

const useGetOtherUsers = () => {

    const dispatch = useDispatch();

    const { userData } = useSelector(
        state => state.user
    );

    useEffect(() => {

        if (!userData?._id) return;

        const fetchUsers = async () => {

            try {

                const result =
                    await axios.get(

                        `${serverUrl}/message/sorted-users`,

                        {
                            withCredentials: true
                        }

                    );

                dispatch(
                    setOtherUsers(
                        result.data
                    )
                );

            } catch (error) {

                console.log(
                    error
                );

            }

        };

        fetchUsers();

    }, [
        userData,
        dispatch
    ]);

};

export default useGetOtherUsers;