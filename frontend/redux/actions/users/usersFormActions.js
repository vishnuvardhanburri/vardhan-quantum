import axios from "axios";
import Errors from "../../../components/admin/FormItems/error/errors";
import { doInit } from "redux/actions/auth";
import { toast } from "react-toastify";

const actions = {
  doNew: () => {
    return {
      type: "USERS_FORM_RESET",
    };
  },

  doFind: (id) => async (dispatch) => {
    try {
      dispatch({
        type: "USERS_FORM_FIND_STARTED",
      });

      axios.get(`/users/${id}`).then((res) => {
        const record = res.data;

        dispatch({
          type: "USERS_FORM_FIND_SUCCESS",
          payload: record,
        });
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "USERS_FORM_FIND_ERROR",
      });

      if (typeof window !== 'undefined') { window.location.href = "/admin/users" }
    }
  },

  doCreate: (values) => async (dispatch) => {
    try {
      dispatch({
        type: "USERS_FORM_CREATE_STARTED",
      });

      axios.post("/users", { data: values }).then((res) => {
        dispatch({
          type: "USERS_FORM_CREATE_SUCCESS",
        });

        toast.success("users created");
        if (typeof window !== 'undefined') { window.location.href = "/admin/users" }
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "USERS_FORM_CREATE_ERROR",
      });
    }
  },

  doUpdate: (id, values, isProfile) => async (dispatch, getState) => {
    try {
      dispatch({
        type: "USERS_FORM_UPDATE_STARTED",
      });

      await axios.put(`/users/${id}`, { id, data: values });

      dispatch(doInit());

      dispatch({
        type: "USERS_FORM_UPDATE_SUCCESS",
      });

      if (isProfile) {
        toast.success("Profile updated");
      } else {
        toast.success("users updated");
        if (typeof window !== 'undefined') { window.location.href = "/admin/users" }
      }
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "USERS_FORM_UPDATE_ERROR",
      });
    }
  },
};

export default actions;
