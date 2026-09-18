import axios from 'axios';
import Errors from "../../../components/admin/FormItems/error/errors";
import { push } from 'connected-react-router';
import { doInit } from 'redux/actions/auth';
import { toast } from 'react-toastify';

const actions = {
  doNew: () => {
    return {
      type: 'FEEDBACK_FORM_RESET',
    };
  },

  doFind: (id) => async (dispatch) => {
    try {
      dispatch({
        type: 'FEEDBACK_FORM_FIND_STARTED',
      });

      axios.get(`/feedback/${id}`).then(res => {
        const record = res.data;

        dispatch({
          type: 'FEEDBACK_FORM_FIND_SUCCESS',
          payload: record,
        });
      })
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: 'FEEDBACK_FORM_FIND_ERROR',
      });

      dispatch(push('/admin/feedback'));
    }
  },

  doCreate: (values) => async (dispatch) => {
    try {
      dispatch({
        type: 'FEEDBACK_FORM_CREATE_STARTED',
      });

      axios.post('/feedback', { data: values }).then(res => {
        dispatch({
          type: 'FEEDBACK_FORM_CREATE_SUCCESS',
        });

        toast.success('Feedback created');
        dispatch(push('/admin/feedback'));
      })
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: 'FEEDBACK_FORM_CREATE_ERROR',
      });
    }
  },

  doUpdate: (id, values, isProfile) => async (
    dispatch,
    getState,
  ) => {
    try {
      dispatch({
        type: 'FEEDBACK_FORM_UPDATE_STARTED',
      });

      await axios.put(`/feedback/${id}`, {id, data: values});

      dispatch(doInit());

      dispatch({
        type: 'FEEDBACK_FORM_UPDATE_SUCCESS',
      });

      if (isProfile) {
        toast.success('Profile updated');
      } else {
        toast.success('Feedback updated');
        dispatch(push('/admin/feedback'));
      }
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: 'FEEDBACK_FORM_UPDATE_ERROR',
      });
    }
  },
};

export default actions;
