"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GroupsModelClass_1 = __importDefault(require("../models/GroupsModelClass"));
const groupRouter = (0, express_1.Router)();
groupRouter.get("/getAllGroupsUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idUser } = req;
        const result = yield GroupsModelClass_1.default.getAllGroupsUser(idUser);
        return res.json(result);
    }
    catch (error) {
        console.error(error);
        throw new Error(error);
    }
}));
groupRouter.get("/obtainGroupMessages/:id", (req, res) => {
    try {
        const { id } = req.params;
        const result = GroupsModelClass_1.default.getGroupById(id);
        return res.json(result);
    }
    catch (error) {
        console.error(error);
        throw new Error(error);
    }
});
groupRouter.get("/getGroupById/:id", (req, res) => {
    try {
        const { id } = req.params;
        const result = GroupsModelClass_1.default.getGroupById(id);
        return res.json(result);
    }
    catch (error) {
        console.error(error);
        throw new Error(error);
    }
});
groupRouter.post("/createGroup", (req, res) => {
    try {
        const { idUser } = req;
        const { name, description, image, users } = req.body;
        const result = GroupsModelClass_1.default.createGroup({
            name,
            description,
            image,
            idUserOwner: idUser,
            idUsers: users,
        });
        return res.json(result);
    }
    catch (error) {
        console.error(error);
        throw new Error(error);
    }
});
groupRouter.delete("/deleteGroup/:id", (req, res) => {
    try {
        const { id } = req.params;
        const result = GroupsModelClass_1.default.deleteGroup(id);
        return res.json(result);
    }
    catch (error) {
        console.error(error);
        throw new Error(error);
    }
});
exports.default = groupRouter;
