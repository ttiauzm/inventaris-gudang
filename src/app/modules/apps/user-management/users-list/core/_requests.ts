import API from "../../../../../../api";
import { ID, Response } from "../../../../../../_metronic/helpers";
import { User, UsersQueryResponse } from "./_models";

const getUsers = (query: string): Promise<UsersQueryResponse> => {
  return API.get(`/users?${query}`)
    .then((d) => d.data);
};

const getUserById = (id: ID): Promise<User | undefined> => {
  return API.get(`/users/${id}`)
    .then((response) => response.data);
};

const createUser = (user: User): Promise<User | undefined> => {
  return API.post(`/users/create-admin`, user)
    .then((response) => response.data);
};

const updateUser = (user: User): Promise<User | undefined> => {
  return API.put(`/users/${user.id}/update-profile`, user)
    .then((response) => response.data);
};

const deleteUser = (userId: ID): Promise<void> => {
  return API.delete(`/users/${userId}`).then(() => {});
};

const deleteSelectedUsers = (userIds: Array<ID>): Promise<void> => {
  const requests = userIds.map((id) => API.delete(`/users/${id}`));
  return Promise.all(requests).then(() => {});
};

export {
  getUsers,
  deleteUser,
  deleteSelectedUsers,
  getUserById,
  createUser,
  updateUser,
};
