import * as api from '../api'
import { routerRedux } from 'dva/router'
import { delay } from 'dva/saga'

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
    clearSelected(state) {
      return { ...state, selectedProjects: [] }
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
      const result = yield call(api.getProj, {})
      const projects = result.data.data
      yield put({ type: 'setProjects', payload: projects })
    },

    *addProjects({dispatch}, {call, put, select}) {
      const { token, id } = yield select(state => state.currentUser)
      const { selectedProjects } = yield select(state => state.recommendProjects)
      try {
        yield call(api.favoriteProj, token, { favoritetype: 4, user: id, projs: selectedProjects })
      } catch (e) {
        // TODO 错误处理
        console.error(e)
      } finally {
        yield put(routerRedux.push('/app'))
      }
    },

    *skipProjects({dispatch}, {call, put}) {
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
