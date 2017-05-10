import * as api from '../api'
import { routerRedux } from 'dva/router'

export default {
  namespace: 'recommendProjects',
  state: {
    projects: [],
    selectedProjects: [],
  },
  reducers: {
    setProjects(state, { payload: projects }) {
      return { ...state, projects }
    },
    toggleProject(state, { payload: project }) {
      var selectedProjects = state.selectedProjects.slice()
      var index = selectedProjects.indexOf(project)
      if(index > -1) {
        selectedProjects.splice(index, 1)
      } else {
        selectedProjects.push(project)
      }

      return { ...state, selectedProjects }
    },
  },
  effects: {
    *refreshProjects({}, {call, put, select}) {
      const { token } = yield select(state => state.currentUser)
      const result = yield call(api.getProj, token, {})
      const projects = result.data
      yield put({ type: 'setProjects', payload: projects })
    },

    *addProjects({}, {put}) {
      // TODO 收藏项目
      yield put(routerRedux.push('/app'))
    },

    *skipProjects({}, {put}) {
      yield put(routerRedux.push('/app'))
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === '/recommend_projects') {
          dispatch({ type: 'refreshProjects' });
        }
      })
    }
  },
};
