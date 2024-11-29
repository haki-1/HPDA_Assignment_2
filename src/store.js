import { configureStore } from '@reduxjs/toolkit'
import dataSetReducer from './redux/DataSetSlice'
import selectedDataReducer from './redux/SelectedDataSlice'

export default configureStore({
  reducer: {
    dataSet: dataSetReducer,
    selectedData: selectedDataReducer,
    }
})