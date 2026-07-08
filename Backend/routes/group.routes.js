import express from "express";
import verifyUser from "../middlewares/verifyUser.js";
import upload from "../config/multer.js";
import {
    createGroup,
    getGroups,
    addUsersToGroup,
    makeAdmin,
    sendGroupMessage,
    getGroupMessages
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/create", verifyUser, upload.single("groupProfileImage"), createGroup);
router.get("/all", verifyUser, getGroups);
router.put("/add-users/:groupId", verifyUser, addUsersToGroup);
router.put("/make-admin/:groupId", verifyUser, makeAdmin);
router.post("/send/:groupId", verifyUser, upload.single("file"), sendGroupMessage);
router.get("/messages/:groupId", verifyUser, getGroupMessages);

export default router;
