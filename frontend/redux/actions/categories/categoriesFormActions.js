import axios from "axios";
import Errors from "../../../components/admin/FormItems/error/errors";
import { doInit } from "redux/actions/auth";
import { toast } from "react-toastify";

const actions = {
  doNew: () => {
    return {
      type: "CATEGORIES_FORM_RESET",
    };
  },

  doFind: (id) => async (dispatch) => {
    try {
      dispatch({
        type: "CATEGORIES_FORM_FIND_STARTED",
      });

      axios.get(`/categories/${id}`).then((res) => {
        const record = res.data;

        dispatch({
          type: "CATEGORIES_FORM_FIND_SUCCESS",
          payload: record,
        });
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "CATEGORIES_FORM_FIND_ERROR",
      });

      if (typeof window !== 'undefined') { window.location.href = "/admin/categories" }
    }
  },

  doCreate: (values) => async (dispatch) => {
    try {
      dispatch({
        type: "CATEGORIES_FORM_CREATE_STARTED",
      });

      axios.post("/categories", { data: values }).then((res) => {
        dispatch({
          type: "CATEGORIES_FORM_CREATE_SUCCESS",
        });

        toast.success("сategories created");
        if (typeof window !== 'undefined') { window.location.href = "/admin/categories" }
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "CATEGORIES_FORM_CREATE_ERROR",
      });
    }
  },

  doUpdate: (id, values, isProfile) => async (dispatch, getState) => {
    try {
      dispatch({
        type: "CATEGORIES_FORM_UPDATE_STARTED",
      });

      await axios.put(`/categories/${id}`, { id, data: values });

      dispatch(doInit());

      dispatch({
        type: "CATEGORIES_FORM_UPDATE_SUCCESS",
      });

      if (isProfile) {
        toast.success("Profile updated");
      } else {
        toast.success("сategories updated");
        if (typeof window !== 'undefined') { window.location.href = "/admin/categories" }
      }
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: "CATEGORIES_FORM_UPDATE_ERROR",
      });
    }
  },
};

export default actions;
