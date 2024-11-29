import { createSlice } from '@reduxjs/toolkit'

export const selectedDataSlice = createSlice({
  name: 'selectedData',
  initialState: {
    visValue: 0,
    data: []
  },
  reducers: {
    updateSelection: (state, action) => {
      return action.payload
    },
  }
})

// Action creators are generated for each case reducer function
export const { updateSelection } = selectedDataSlice.actions

export default selectedDataSlice.reducer