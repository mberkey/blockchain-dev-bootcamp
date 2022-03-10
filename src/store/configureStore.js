import { createStore,applyMiddleware,compose } from "redux"
import { createLogger} from 'redux-logger'
import rootReducer from "./reducers"

const loggerMiddleWare = createLogger()
const middleware = []

//Redux dev tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose


//Add middleware create store attached to application
export default function configureStore(preLoadedState){
    return createStore(
        rootReducer,
        preLoadedState,
        composeEnhancers(applyMiddleware(...middleware,loggerMiddleWare))
        )
}