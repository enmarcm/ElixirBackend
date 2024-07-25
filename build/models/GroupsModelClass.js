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
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../typegoose/models");
const instances_1 = require("../data/instances");
class GroupModelClass {
    static getAllGroupsUser(idUser) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield instances_1.ITSGooseHandler.searchAll({
                    Model: models_1.GroupModel,
                    condition: { idUserOwner: idUser },
                });
                //Ahora obtenemos el ultimo mensaje de ese grupo
                const resultWithLastMessage = yield Promise.all(results.map((group) => __awaiter(this, void 0, void 0, function* () {
                    const lastMessage = yield instances_1.ITSGooseHandler.searchOne({
                        Model: models_1.GroupMessageModel,
                        condition: { idGroup: group.id },
                    });
                    return Object.assign(Object.assign({}, group), { lastMessage });
                })));
                const lastMessageAndUser = yield Promise.all(resultWithLastMessage.map((group) => __awaiter(this, void 0, void 0, function* () {
                    const user = yield instances_1.ITSGooseHandler.searchOne({
                        Model: models_1.UserModel,
                        condition: { _id: group.idUserOwner },
                    });
                    return Object.assign(Object.assign({}, group), { userLastMessage: user });
                })));
                return lastMessageAndUser;
            }
            catch (error) {
                throw new Error(error);
            }
        });
    }
    static obtainGroupMessages(idGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const results = yield instances_1.ITSGooseHandler.searchAll({
                    Model: models_1.GroupMessageModel,
                    condition: { idGroup },
                });
                const resultsWithUsers = yield Promise.all(results.map((message) => __awaiter(this, void 0, void 0, function* () {
                    const user = yield instances_1.ITSGooseHandler.searchOne({
                        Model: models_1.UserModel,
                        condition: { _id: message.idUser },
                    });
                    return Object.assign(Object.assign({}, message), { user });
                })));
                return resultsWithUsers;
            }
            catch (error) {
                throw new Error(error);
            }
        });
    }
    static getGroupById(idGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield instances_1.ITSGooseHandler.searchOne({
                    Model: models_1.GroupModel,
                    condition: { _id: idGroup },
                });
                return result;
            }
            catch (error) {
                throw new Error(error);
            }
        });
    }
    static createGroup(_a) {
        return __awaiter(this, arguments, void 0, function* ({ name, description, image = "https://icones.pro/wp-content/uploads/2021/03/icone-de-groupe-symbole-png-vert.png", idUserOwner, idUsers, }) {
            try {
                const newIdUsers = [...idUsers, idUserOwner];
                const newGroup = yield instances_1.ITSGooseHandler.addDocument({
                    Model: models_1.GroupModel,
                    data: { name, description, image, idUserOwner, idUsers: newIdUsers },
                });
                return newGroup;
            }
            catch (error) {
                throw new Error(error);
            }
        });
    }
    static deleteGroup(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield instances_1.ITSGooseHandler.removeDocument({
                    Model: models_1.GroupModel,
                    id: groupId,
                });
                return result;
            }
            catch (error) {
                throw new Error(error);
            }
        });
    }
}
exports.default = GroupModelClass;
