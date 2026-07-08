import express from "express";
import isAuth from "../middlewares/isAuth.js";
import upload from "../config/multer.js";
import {
    createGroup,
    getGroups,
    addUsersToGroup,
    makeAdmin,
    sendGroupMessage,
    getGroupMessages,
    leaveGroup,
    removeUserFromGroup,
    deleteGroup
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/create", isAuth, upload.single("groupProfileImage"), createGroup);
router.get("/all", isAuth, getGroups);
router.put("/add-users/:groupId", isAuth, addUsersToGroup);
router.put("/make-admin/:groupId", isAuth, makeAdmin);
router.post("/send/:groupId", isAuth, upload.single("file"), sendGroupMessage);
router.get("/messages/:groupId", isAuth, getGroupMessages);
router.put("/leave/:groupId", isAuth, leaveGroup);
router.put("/remove-user/:groupId/:userIdToRemove", isAuth, removeUserFromGroup);
router.delete("/delete/:groupId", isAuth, deleteGroup);

export default router;
